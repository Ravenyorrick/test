use std::time::Duration;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SafetyGateState {
    Muted,
    Processing,
    Ready,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProcessingMode {
    LowLatency,
    Balanced,
    HighQuality,
}

#[derive(Debug, Clone)]
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

#[derive(Debug, Clone)]
pub struct OutputFrame {
    pub frame: AudioFrame,
    pub processing_time: Duration,
    pub safety_gate_state: SafetyGateState,
}

#[derive(Debug, Clone, Copy, Default)]
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
}
