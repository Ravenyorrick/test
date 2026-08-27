use std::{
    env,
    io::{self, Write},
    process, thread,
    time::Duration,
};

use serde::Serialize;
use voxshift_audio_engine::{enumerate_input_devices, CaptureError, NativeAudioCapture};

#[derive(Debug, Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
enum CommandResponse<T>
where
    T: Serialize,
{
    Ok { data: T },
    Err { error: String },
}

#[derive(Debug, Serialize)]
struct CaptureTestReport {
    device_id: String,
    duration_ms: u64,
    rms: f32,
    peak: f32,
    frames_captured: u64,
    dropped_frames: u64,
    speech_detected: bool,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum WorkerEvent {
    Started {
        device_id: String,
    },
    Metrics {
        rms: f32,
        peak: f32,
        frames_captured: u64,
        dropped_frames: u64,
        device_errors: u64,
    },
    Error {
        error: String,
    },
}

fn main() {
    let args = env::args().skip(1).collect::<Vec<_>>();
    let response = match args.first().map(String::as_str) {
        Some("enumerate-devices") => match enumerate_input_devices() {
            Ok(devices) => print_json(CommandResponse::Ok { data: devices }),
            Err(error) => print_command_error_and_exit(capture_error_message(error)),
        },
        Some("capture-test") => run_capture_test(&args[1..]),
        Some("capture-worker") => run_capture_worker(&args[1..]),
        _ => print_json::<()>(CommandResponse::Err {
            error: "Usage: voxshift-audio-engine enumerate-devices | capture-test --device <id> [--duration-ms <ms>] | capture-worker --device <id>".to_string(),
        }),
    };

    if let Err(error) = response {
        eprintln!("{error}");
        process::exit(1);
    }
}

fn run_capture_test(args: &[String]) -> Result<(), serde_json::Error> {
    let Some(device_id) = flag_value(args, "--device") else {
        return print_command_error_and_exit("capture-test requires --device <id>".to_string());
    };
    let duration_ms = flag_value(args, "--duration-ms")
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(1_000);

    let mut capture = NativeAudioCapture::new();

    let result = capture
        .initialize()
        .and_then(|_| capture.open_device(device_id))
        .and_then(|_| capture.start())
        .map(|_| {
            thread::sleep(Duration::from_millis(duration_ms));
            capture.stop();
            let metrics = capture.get_metrics();

            CaptureTestReport {
                device_id: device_id.to_string(),
                duration_ms,
                rms: metrics.rms,
                peak: metrics.peak,
                frames_captured: metrics.frames_captured,
                dropped_frames: metrics.dropped_frames,
                speech_detected: metrics.rms > 0.015 || metrics.peak > 0.05,
            }
        });

    match result {
        Ok(report) => print_json(CommandResponse::Ok { data: report }),
        Err(error) => print_command_error_and_exit(capture_error_message(error)),
    }
}

fn run_capture_worker(args: &[String]) -> Result<(), serde_json::Error> {
    let Some(device_id) = flag_value(args, "--device") else {
        return print_worker_error_and_exit("capture-worker requires --device <id>".to_string());
    };

    let mut capture = NativeAudioCapture::new();
    let result = capture
        .initialize()
        .and_then(|_| capture.open_device(device_id))
        .and_then(|_| capture.start());

    if let Err(error) = result {
        return print_worker_error_and_exit(capture_error_message(error));
    }

    print_worker_event(WorkerEvent::Started {
        device_id: device_id.to_string(),
    })?;

    loop {
        thread::sleep(Duration::from_millis(250));
        let metrics = capture.get_metrics();

        print_worker_event(WorkerEvent::Metrics {
            rms: metrics.rms,
            peak: metrics.peak,
            frames_captured: metrics.frames_captured,
            dropped_frames: metrics.dropped_frames,
            device_errors: metrics.device_errors,
        })?;
    }
}

fn flag_value<'a>(args: &'a [String], flag: &str) -> Option<&'a str> {
    args.windows(2)
        .find(|window| window[0] == flag)
        .map(|window| window[1].as_str())
}

fn capture_error_message(error: CaptureError) -> String {
    match error {
        CaptureError::DeviceEnumerationFailed => "Native device enumeration failed.",
        CaptureError::DeviceNotFound => "Selected native microphone was not found.",
        CaptureError::DefaultConfigUnavailable => "No supported input configuration is available.",
        CaptureError::BuildStreamFailed => "Native input stream could not be built.",
        CaptureError::StreamStartFailed => "Native input stream could not start.",
        CaptureError::StreamNotOpen => "Native input stream has not been opened.",
    }
    .to_string()
}

fn print_json<T>(response: CommandResponse<T>) -> Result<(), serde_json::Error>
where
    T: Serialize,
{
    println!("{}", serde_json::to_string_pretty(&response)?);
    Ok(())
}

fn print_command_error_and_exit(message: String) -> Result<(), serde_json::Error> {
    print_json::<()>(CommandResponse::Err { error: message })?;
    process::exit(2);
}

fn print_worker_error_and_exit(message: String) -> Result<(), serde_json::Error> {
    print_worker_event(WorkerEvent::Error { error: message })?;
    process::exit(2);
}

fn print_worker_event(event: WorkerEvent) -> Result<(), serde_json::Error> {
    println!("{}", serde_json::to_string(&event)?);
    let _ = io::stdout().flush();
    Ok(())
}
