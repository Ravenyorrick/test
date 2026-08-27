use std::sync::{
    atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering},
    Arc,
};
use std::time::Duration;

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use crossbeam_channel::{bounded, Receiver, Sender, TryRecvError};
use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum SafetyGateState {
    Muted,
    Processing,
    Ready,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum EngineState {
    Stopped,
    Initializing,
    Ready,
    Running,
    Muted,
    DeviceError,
    VoiceError,
    DriverError,
    BufferError,
    ProcessingTooSlow,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum ProcessingMode {
    LowLatency,
    Balanced,
    HighQuality,
}

#[derive(Debug, Clone, Serialize)]
pub struct AudioFrame {
    pub samples: Vec<f32>,
    pub sample_rate_hz: u32,
    pub channels: u16,
}

impl AudioFrame {
    pub fn silence(sample_count: usize, sample_rate_hz: u32, channels: u16) -> Self {
        Self {
            samples: vec![0.0; sample_count],
            sample_rate_hz,
            channels,
        }
    }

    pub fn peak_level(&self) -> f32 {
        self.samples
            .iter()
            .fold(0.0_f32, |peak, sample| peak.max(sample.abs()))
            .clamp(0.0, 1.0)
    }

    pub fn is_silent(&self) -> bool {
        self.samples
            .iter()
            .all(|sample| sample.abs() <= f32::EPSILON)
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct OutputFrame {
    pub frame: AudioFrame,
    pub processing_time: Duration,
    pub safety_gate_state: SafetyGateState,
}

#[derive(Debug, Clone, Copy, Default, Serialize)]
pub struct EngineMetrics {
    pub input_level: f32,
    pub output_level: f32,
    pub capture_latency: Duration,
    pub queue_latency: Duration,
    pub model_latency: Duration,
    pub post_processing_latency: Duration,
    pub output_latency: Duration,
    pub dropped_frames: u64,
    pub underruns: u64,
    pub overruns: u64,
}

impl EngineMetrics {
    pub fn total_latency(&self) -> Duration {
        self.capture_latency
            + self.queue_latency
            + self.model_latency
            + self.post_processing_latency
            + self.output_latency
    }
}

pub trait StreamingVoiceConverter {
    fn process_frame(&mut self, input: &AudioFrame) -> Result<AudioFrame, VoiceConversionError>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VoiceConversionError {
    ModelUnavailable,
    ProcessingFailed,
    ProcessingTooSlow,
}

#[derive(Debug, Clone, Serialize)]
pub struct NativeAudioDevice {
    pub id: String,
    pub name: String,
    pub input_channels: u16,
    pub preferred_sample_rate_hz: u32,
}

#[derive(Debug, Clone, Copy, Default, Serialize)]
pub struct CaptureMetrics {
    pub rms: f32,
    pub peak: f32,
    pub frames_captured: u64,
    pub dropped_frames: u64,
    pub device_errors: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub enum CaptureError {
    DeviceEnumerationFailed,
    DeviceNotFound,
    DefaultConfigUnavailable,
    BuildStreamFailed,
    StreamStartFailed,
    StreamNotOpen,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum CaptureStatus {
    Uninitialized,
    Initialized,
    DeviceOpen,
    Running,
    Stopped,
    DeviceError,
}

#[derive(Debug)]
struct SharedCaptureMetrics {
    rms_bits: AtomicU32,
    peak_bits: AtomicU32,
    frames_captured: AtomicU64,
    dropped_frames: AtomicU64,
    device_errors: AtomicU64,
}

impl SharedCaptureMetrics {
    fn new() -> Self {
        Self {
            rms_bits: AtomicU32::new(0.0_f32.to_bits()),
            peak_bits: AtomicU32::new(0.0_f32.to_bits()),
            frames_captured: AtomicU64::new(0),
            dropped_frames: AtomicU64::new(0),
            device_errors: AtomicU64::new(0),
        }
    }

    fn update_levels(&self, samples: &[f32]) {
        let sum_squares = samples.iter().map(|sample| sample * sample).sum::<f32>();
        let rms = if samples.is_empty() {
            0.0
        } else {
            (sum_squares / samples.len() as f32).sqrt().clamp(0.0, 1.0)
        };
        let peak = samples
            .iter()
            .fold(0.0_f32, |current, sample| current.max(sample.abs()))
            .clamp(0.0, 1.0);

        self.rms_bits.store(rms.to_bits(), Ordering::Relaxed);
        self.peak_bits.store(peak.to_bits(), Ordering::Relaxed);
        self.frames_captured.fetch_add(1, Ordering::Relaxed);
    }

    fn mark_drop(&self) {
        self.dropped_frames.fetch_add(1, Ordering::Relaxed);
    }

    fn mark_device_error(&self) {
        self.device_errors.fetch_add(1, Ordering::Relaxed);
    }

    fn snapshot(&self) -> CaptureMetrics {
        CaptureMetrics {
            rms: f32::from_bits(self.rms_bits.load(Ordering::Relaxed)),
            peak: f32::from_bits(self.peak_bits.load(Ordering::Relaxed)),
            frames_captured: self.frames_captured.load(Ordering::Relaxed),
            dropped_frames: self.dropped_frames.load(Ordering::Relaxed),
            device_errors: self.device_errors.load(Ordering::Relaxed),
        }
    }
}

pub struct NativeAudioCapture {
    status: CaptureStatus,
    selected_device_id: Option<String>,
    stream: Option<cpal::Stream>,
    frame_sender: Sender<AudioFrame>,
    frame_receiver: Receiver<AudioFrame>,
    metrics: Arc<SharedCaptureMetrics>,
    running: Arc<AtomicBool>,
}

pub struct DevelopmentAudioSource {
    sample_rate_hz: u32,
    frame_samples: usize,
    phase: f32,
}

impl DevelopmentAudioSource {
    pub fn new(sample_rate_hz: u32, frame_samples: usize) -> Self {
        Self {
            sample_rate_hz,
            frame_samples,
            phase: 0.0,
        }
    }

    pub fn label(&self) -> &'static str {
        "DEVELOPMENT TEST INPUT"
    }

    pub fn next_frame(&mut self) -> AudioFrame {
        let frequency_hz = 220.0_f32;
        let phase_step = frequency_hz / self.sample_rate_hz as f32;
        let mut samples = Vec::with_capacity(self.frame_samples);

        for _ in 0..self.frame_samples {
            let sample = (self.phase * std::f32::consts::TAU).sin() * 0.2;
            samples.push(sample);
            self.phase = (self.phase + phase_step) % 1.0;
        }

        AudioFrame {
            samples,
            sample_rate_hz: self.sample_rate_hz,
            channels: 1,
        }
    }
}

impl Default for NativeAudioCapture {
    fn default() -> Self {
        Self::new()
    }
}

impl NativeAudioCapture {
    pub fn new() -> Self {
        let (frame_sender, frame_receiver) = bounded(8);

        Self {
            status: CaptureStatus::Uninitialized,
            selected_device_id: None,
            stream: None,
            frame_sender,
            frame_receiver,
            metrics: Arc::new(SharedCaptureMetrics::new()),
            running: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn initialize(&mut self) -> Result<(), CaptureError> {
        let _ = cpal::default_host();
        self.status = CaptureStatus::Initialized;
        Ok(())
    }

    pub fn enumerate_devices(&self) -> Result<Vec<NativeAudioDevice>, CaptureError> {
        enumerate_input_devices()
    }

    pub fn get_devices(&self) -> Result<Vec<NativeAudioDevice>, CaptureError> {
        self.enumerate_devices()
    }

    pub fn open_device(&mut self, device_id: &str) -> Result<(), CaptureError> {
        let host = cpal::default_host();
        let (device, native_device) = find_input_device(&host, device_id)?;
        let supported_config = select_input_config(&device)?;
        let sample_format = supported_config.sample_format();
        let stream_config = supported_config.config();
        let channels = stream_config.channels;
        let sample_rate_hz = stream_config.sample_rate;
        let frame_sender = self.frame_sender.clone();
        let metrics = Arc::clone(&self.metrics);
        let running = Arc::clone(&self.running);
        let error_metrics = Arc::clone(&self.metrics);
        let error_callback = move |_error| {
            error_metrics.mark_device_error();
        };

        let stream = match sample_format {
            cpal::SampleFormat::F32 => build_input_stream::<f32>(
                &device,
                &stream_config,
                channels,
                sample_rate_hz,
                frame_sender,
                metrics,
                running,
                error_callback,
            ),
            cpal::SampleFormat::I16 => build_input_stream::<i16>(
                &device,
                &stream_config,
                channels,
                sample_rate_hz,
                frame_sender,
                metrics,
                running,
                error_callback,
            ),
            cpal::SampleFormat::U16 => build_input_stream::<u16>(
                &device,
                &stream_config,
                channels,
                sample_rate_hz,
                frame_sender,
                metrics,
                running,
                error_callback,
            ),
            _ => Err(cpal::BuildStreamError::StreamConfigNotSupported),
        }
        .map_err(|_| CaptureError::BuildStreamFailed)?;

        self.stream = Some(stream);
        self.selected_device_id = Some(native_device.id);
        self.status = CaptureStatus::DeviceOpen;
        Ok(())
    }

    pub fn start(&mut self) -> Result<(), CaptureError> {
        let stream = self.stream.as_ref().ok_or(CaptureError::StreamNotOpen)?;
        self.running.store(true, Ordering::SeqCst);
        stream.play().map_err(|_| CaptureError::StreamStartFailed)?;
        self.status = CaptureStatus::Running;
        Ok(())
    }

    pub fn stop(&mut self) {
        self.running.store(false, Ordering::SeqCst);
        if matches!(self.status, CaptureStatus::Running) {
            self.status = CaptureStatus::Stopped;
        }
    }

    pub fn close(&mut self) {
        self.stop();
        self.stream = None;
        self.selected_device_id = None;
        self.status = CaptureStatus::Initialized;
    }

    pub fn get_status(&self) -> CaptureStatus {
        if self.metrics.snapshot().device_errors > 0 {
            return CaptureStatus::DeviceError;
        }

        self.status
    }

    pub fn get_metrics(&self) -> CaptureMetrics {
        self.metrics.snapshot()
    }

    pub fn try_next_frame(&self) -> Option<AudioFrame> {
        match self.frame_receiver.try_recv() {
            Ok(frame) => Some(frame),
            Err(TryRecvError::Empty | TryRecvError::Disconnected) => None,
        }
    }
}

pub fn enumerate_input_devices() -> Result<Vec<NativeAudioDevice>, CaptureError> {
    let host = cpal::default_host();
    let devices = host
        .input_devices()
        .map_err(|_| CaptureError::DeviceEnumerationFailed)?;

    let mut native_devices = Vec::new();

    for (index, device) in devices.enumerate() {
        let name = device_display_name(&device, index);
        let id = device_stable_id(&device, index, &name);
        let preferred_config = select_input_config(&device).ok();
        let input_channels = preferred_config
            .as_ref()
            .map(|config| config.channels())
            .unwrap_or(1);
        let preferred_sample_rate_hz = preferred_config
            .as_ref()
            .map(|config| config.sample_rate())
            .unwrap_or(48_000);

        native_devices.push(NativeAudioDevice {
            id,
            name,
            input_channels,
            preferred_sample_rate_hz,
        });
    }

    Ok(native_devices)
}

fn find_input_device(
    host: &cpal::Host,
    device_id: &str,
) -> Result<(cpal::Device, NativeAudioDevice), CaptureError> {
    let devices = host
        .input_devices()
        .map_err(|_| CaptureError::DeviceEnumerationFailed)?;

    for (index, device) in devices.enumerate() {
        let name = device_display_name(&device, index);
        let id = device_stable_id(&device, index, &name);

        if id == device_id {
            let config = select_input_config(&device)?;
            return Ok((
                device,
                NativeAudioDevice {
                    id,
                    name,
                    input_channels: config.channels(),
                    preferred_sample_rate_hz: config.sample_rate(),
                },
            ));
        }
    }

    Err(CaptureError::DeviceNotFound)
}

fn device_display_name(device: &cpal::Device, index: usize) -> String {
    device
        .description()
        .map(|description| description.name().to_string())
        .unwrap_or_else(|_| format!("Input Device {}", index + 1))
}

fn device_stable_id(device: &cpal::Device, index: usize, name: &str) -> String {
    device
        .id()
        .map(|id| id.to_string())
        .unwrap_or_else(|_| format!("fallback:{index}:{name}"))
}

fn select_input_config(device: &cpal::Device) -> Result<cpal::SupportedStreamConfig, CaptureError> {
    let supported_configs = device
        .supported_input_configs()
        .map_err(|_| CaptureError::DefaultConfigUnavailable)?;

    for config_range in supported_configs {
        if config_range.min_sample_rate() <= 48_000 && config_range.max_sample_rate() >= 48_000 {
            return Ok(config_range.with_sample_rate(48_000));
        }
    }

    device
        .default_input_config()
        .map_err(|_| CaptureError::DefaultConfigUnavailable)
}

fn build_input_stream<T>(
    device: &cpal::Device,
    stream_config: &cpal::StreamConfig,
    channels: u16,
    sample_rate_hz: u32,
    frame_sender: Sender<AudioFrame>,
    metrics: Arc<SharedCaptureMetrics>,
    running: Arc<AtomicBool>,
    error_callback: impl FnMut(cpal::StreamError) + Send + 'static,
) -> Result<cpal::Stream, cpal::BuildStreamError>
where
    T: cpal::Sample + cpal::SizedSample + Send + 'static,
    f32: FromSample<T>,
{
    device.build_input_stream(
        stream_config,
        move |data: &[T], _info: &cpal::InputCallbackInfo| {
            if !running.load(Ordering::Relaxed) {
                return;
            }

            let mono_samples = convert_to_mono(data, channels);
            metrics.update_levels(&mono_samples);

            let frame = AudioFrame {
                samples: mono_samples,
                sample_rate_hz,
                channels: 1,
            };

            if frame_sender.try_send(frame).is_err() {
                metrics.mark_drop();
            }
        },
        error_callback,
        None,
    )
}

trait FromSample<T> {
    fn from_sample(sample: T) -> f32;
}

impl FromSample<f32> for f32 {
    fn from_sample(sample: f32) -> f32 {
        sample
    }
}

impl FromSample<i16> for f32 {
    fn from_sample(sample: i16) -> f32 {
        sample as f32 / i16::MAX as f32
    }
}

impl FromSample<u16> for f32 {
    fn from_sample(sample: u16) -> f32 {
        (sample as f32 - 32768.0) / 32768.0
    }
}

fn convert_to_mono<T>(data: &[T], channels: u16) -> Vec<f32>
where
    T: Copy,
    f32: FromSample<T>,
{
    let channel_count = usize::from(channels.max(1));
    let mut mono_samples = Vec::with_capacity(data.len() / channel_count);

    for frame in data.chunks(channel_count) {
        let sum = frame
            .iter()
            .map(|sample| f32::from_sample(*sample))
            .sum::<f32>();
        mono_samples.push((sum / frame.len() as f32).clamp(-1.0, 1.0));
    }

    mono_samples
}

#[derive(Debug, Clone)]
pub struct SafetyOutputGate {
    state: SafetyGateState,
    microphone_available: bool,
    voice_engine_initialized: bool,
    voice_model_loaded: bool,
    audio_processing_stable: bool,
    virtual_microphone_available: bool,
    critical_error: bool,
}

impl Default for SafetyOutputGate {
    fn default() -> Self {
        Self::new()
    }
}

impl SafetyOutputGate {
    pub fn new() -> Self {
        Self {
            state: SafetyGateState::Muted,
            microphone_available: false,
            voice_engine_initialized: false,
            voice_model_loaded: false,
            audio_processing_stable: false,
            virtual_microphone_available: false,
            critical_error: false,
        }
    }

    pub fn set_microphone_available(&mut self, value: bool) {
        self.microphone_available = value;
        self.recompute();
    }

    pub fn set_voice_engine_initialized(&mut self, value: bool) {
        self.voice_engine_initialized = value;
        self.recompute();
    }

    pub fn set_voice_model_loaded(&mut self, value: bool) {
        self.voice_model_loaded = value;
        self.recompute();
    }

    pub fn set_audio_processing_stable(&mut self, value: bool) {
        self.audio_processing_stable = value;
        self.recompute();
    }

    pub fn set_virtual_microphone_available(&mut self, value: bool) {
        self.virtual_microphone_available = value;
        self.recompute();
    }

    pub fn set_critical_error(&mut self, value: bool) {
        self.critical_error = value;
        self.recompute();
    }

    pub fn mute(&mut self) {
        self.state = SafetyGateState::Muted;
    }

    pub fn state(&self) -> SafetyGateState {
        self.state
    }

    pub fn render_output(&self, processed_frame: &AudioFrame) -> AudioFrame {
        if self.state == SafetyGateState::Ready {
            return processed_frame.clone();
        }

        AudioFrame::silence(
            processed_frame.samples.len(),
            processed_frame.sample_rate_hz,
            processed_frame.channels,
        )
    }

    fn recompute(&mut self) {
        self.state = if self.microphone_available
            && self.voice_engine_initialized
            && self.voice_model_loaded
            && self.audio_processing_stable
            && self.virtual_microphone_available
            && !self.critical_error
        {
            SafetyGateState::Ready
        } else if self.voice_engine_initialized && !self.critical_error {
            SafetyGateState::Processing
        } else {
            SafetyGateState::Muted
        };
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn speech_frame() -> AudioFrame {
        AudioFrame {
            samples: vec![0.25, -0.5, 0.1, -0.2],
            sample_rate_hz: 48_000,
            channels: 1,
        }
    }

    #[test]
    fn gate_outputs_silence_until_every_ready_condition_is_true() {
        let mut gate = SafetyOutputGate::new();
        let processed = speech_frame();

        gate.set_microphone_available(true);
        gate.set_voice_engine_initialized(true);
        gate.set_voice_model_loaded(true);
        gate.set_audio_processing_stable(true);

        let blocked = gate.render_output(&processed);

        assert_eq!(gate.state(), SafetyGateState::Processing);
        assert!(blocked.is_silent());
    }

    #[test]
    fn gate_outputs_processed_audio_only_when_ready() {
        let mut gate = SafetyOutputGate::new();
        let processed = speech_frame();

        gate.set_microphone_available(true);
        gate.set_voice_engine_initialized(true);
        gate.set_voice_model_loaded(true);
        gate.set_audio_processing_stable(true);
        gate.set_virtual_microphone_available(true);

        let output = gate.render_output(&processed);

        assert_eq!(gate.state(), SafetyGateState::Ready);
        assert_eq!(output.samples, processed.samples);
    }

    #[test]
    fn critical_error_mutes_output_immediately() {
        let mut gate = SafetyOutputGate::new();
        let processed = speech_frame();

        gate.set_microphone_available(true);
        gate.set_voice_engine_initialized(true);
        gate.set_voice_model_loaded(true);
        gate.set_audio_processing_stable(true);
        gate.set_virtual_microphone_available(true);
        gate.set_critical_error(true);

        let output = gate.render_output(&processed);

        assert_eq!(gate.state(), SafetyGateState::Muted);
        assert!(output.is_silent());
    }

    #[test]
    fn peak_level_is_measured_from_actual_samples() {
        let frame = speech_frame();

        assert_eq!(frame.peak_level(), 0.5);
    }

    #[test]
    fn native_capture_initializes_without_opening_a_device() {
        let mut capture = NativeAudioCapture::new();

        capture
            .initialize()
            .expect("host initialization should succeed");

        assert_eq!(capture.get_status(), CaptureStatus::Initialized);
        assert_eq!(capture.get_metrics().frames_captured, 0);
        assert!(capture.try_next_frame().is_none());
    }

    #[test]
    fn mono_conversion_averages_interleaved_channels() {
        let stereo = vec![0.5_f32, -0.5, 0.25, 0.75];

        let mono = convert_to_mono(&stereo, 2);

        assert_eq!(mono, vec![0.0, 0.5]);
    }

    #[test]
    fn capture_metrics_are_derived_from_samples() {
        let metrics = SharedCaptureMetrics::new();

        metrics.update_levels(&[0.5, -0.25, 0.25, -0.5]);
        let snapshot = metrics.snapshot();

        assert!(snapshot.rms > 0.39 && snapshot.rms < 0.4);
        assert_eq!(snapshot.peak, 0.5);
        assert_eq!(snapshot.frames_captured, 1);
    }

    #[test]
    fn development_audio_source_is_labeled_and_produces_pcm() {
        let mut source = DevelopmentAudioSource::new(48_000, 480);

        let frame = source.next_frame();

        assert_eq!(source.label(), "DEVELOPMENT TEST INPUT");
        assert_eq!(frame.sample_rate_hz, 48_000);
        assert_eq!(frame.channels, 1);
        assert_eq!(frame.samples.len(), 480);
        assert!(frame.peak_level() > 0.0);
    }
}
