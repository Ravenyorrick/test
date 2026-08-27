import { useEffect, useMemo, useState } from "react";
import { LevelMeter } from "./components/LevelMeter";
import { Sidebar } from "./components/Sidebar";
import { VoiceCard } from "./components/VoiceCard";
import { builtinVoices } from "./data/voices";
import { useAudioController } from "./hooks/useAudioController";
import { useMicrophoneDevices } from "./hooks/useMicrophoneDevices";
import type { NavigationItem, ThemeMode, VoiceProfile } from "./types/voxshift";

const settingsSections = [
  "General",
  "Audio",
  "Voices",
  "Performance",
  "Virtual Microphone",
  "Privacy",
  "Shortcuts",
  "Diagnostics",
  "Updates",
  "About"
];

export function App() {
  const [activePage, setActivePage] = useState<NavigationItem>("home");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(builtinVoices[0]);
  const [version, setVersion] = useState("0.1.0");
  const audio = useAudioController();
  const {
    devices,
    selectedDevice,
    selectedDeviceDisconnected,
    permissionGranted,
    error: microphoneError,
    loading: microphoneLoading,
    refresh: refreshMicrophones,
    requestAccess: requestMicrophoneAccess,
    selectDevice
  } = useMicrophoneDevices();

  useEffect(() => {
    void window.voxshift?.getAppInfo().then((info) => setVersion(info.version));
  }, []);

  const femaleVoices = useMemo(
    () => builtinVoices.filter((voice) => voice.category === "American Female"),
    []
  );
  const maleVoices = useMemo(() => builtinVoices.filter((voice) => voice.category === "American Male"), []);

  async function handleVoicePower() {
    if (audio.status.live) {
      await audio.stop();
      return;
    }

    await audio.start();
  }

  async function handleEmergencyMute() {
    await audio.mute();
  }

  async function handleVoiceSelect(nextVoice: VoiceProfile) {
    const result = await audio.setVoice(nextVoice.id, nextVoice.installed);

    if (result?.ok) {
      setSelectedVoice(nextVoice);
    }
  }

  async function handleMicrophoneSelect(deviceId: string) {
    selectDevice(deviceId);
    await audio.setInputDevice(deviceId);
  }

  return (
    <div className={`app app--${theme}`}>
      <Sidebar active={activePage} onNavigate={setActivePage} version={version} />
      <main className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Real-Time Voice Conversion</p>
            <h1>VOXSHIFT</h1>
          </div>
          <div className="topbar__actions">
            <span className="system-status">
              <span className={audio.status.live ? "status-dot status-dot--live" : "status-dot status-dot--muted"} />
              {audio.status.live ? "LIVE" : audio.status.state}
            </span>
            <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} type="button">
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {activePage === "home" && (
          <section className="dashboard" aria-label="VOXSHIFT dashboard">
            <div className="hero-card">
              <div className="hero-card__header">
                <span className="section-label">Voice</span>
                <span className="pill">{audio.status.voiceId ? "Backend voice loaded" : "No model loaded"}</span>
              </div>
              <div className="selected-voice">
                <div className="selected-voice__glyph" aria-hidden="true">
                  ♀
                </div>
                <div>
                  <h2>{selectedVoice.name}</h2>
                  <p>
                    {selectedVoice.style} • {selectedVoice.accent}
                  </p>
                </div>
              </div>
              <div className="hero-card__actions">
                <button onClick={() => void audio.test()} type="button">
                  Preview Voice
                </button>
                <button onClick={() => setActivePage("voices")} type="button">
                  Change Voice
                </button>
              </div>
            </div>

            <div className="mic-card">
              <span className="section-label">Microphone</span>
              <div className="device-row">
                <div>
                  <strong>
                    {selectedDeviceDisconnected
                      ? "Your selected microphone was disconnected."
                      : selectedDevice?.label ?? "No microphone selected"}
                  </strong>
                  <span>
                    {selectedDevice
                      ? `${selectedDevice.connectionType} • stable ID remembered`
                      : "Select a microphone before the native audio pipeline can activate."}
                  </span>
                </div>
                <button onClick={() => setActivePage("microphone")} type="button">
                  Change
                </button>
              </div>
              <LevelMeter label="Input" value={audio.metrics.inputLevel} muted={audio.status.muted} />
              <LevelMeter label="Output" value={audio.metrics.outputLevel} muted={audio.status.muted} />
            </div>

            <div className="control-card">
              <span className="section-label">Voice Conversion</span>
              <button
                className={audio.status.live ? "power-button power-button--on" : "power-button"}
                onClick={handleVoicePower}
                type="button"
                title="Starts the backend audio pipeline; it reports NOT READY until native prerequisites exist"
              >
                <span>{audio.status.live ? "ON" : "OFF"}</span>
                <strong>{audio.status.live ? "VOICE ACTIVE" : "NOT READY"}</strong>
              </button>
              <p className="engine-message">{audio.lastError ?? audio.status.message}</p>
              <div className="metrics">
                <div>
                  <span>Latency</span>
                  <strong>{audio.metrics.totalLatencyMs === null ? "Not measured" : `${audio.metrics.totalLatencyMs} ms`}</strong>
                </div>
                <div>
                  <span>CPU</span>
                  <strong>{audio.metrics.cpuPercent === null ? "Awaiting engine" : `${audio.metrics.cpuPercent}%`}</strong>
                </div>
                <div>
                  <span>Quality</span>
                  <strong>{audio.status.rawBypassBlocked ? "Bypass blocked" : "Unsafe"}</strong>
                </div>
              </div>
              <button className="mute-button" onClick={handleEmergencyMute} type="button">
                MUTE
              </button>
            </div>
          </section>
        )}

        {activePage === "voices" && (
          <section className="page-panel" aria-label="Voice library">
            <div className="page-heading">
              <div>
                <p className="eyebrow">Voice Library</p>
                <h2>Choose a licensed voice profile</h2>
              </div>
              <button onClick={() => setActivePage("settings")} type="button">
                + Create Custom Voice
              </button>
            </div>
            <label className="search">
              <span>Search voices</span>
              <input placeholder="Search voices..." type="search" />
            </label>
            <div className="filters" aria-label="Voice filters">
              {["Accent", "Language", "Style", "Latency", "Quality", "Local", "Cloud"].map((filter) => (
                <button key={filter} type="button">
                  {filter}
                </button>
              ))}
            </div>
            <h3 className="category-heading">American Female</h3>
            <div className="voice-grid">
              {femaleVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  onSelect={(nextVoice) => void handleVoiceSelect(nextVoice)}
                  onPreview={() => void audio.test()}
                  selected={selectedVoice.id === voice.id}
                  voice={voice}
                />
              ))}
            </div>
            <h3 className="category-heading">American Male</h3>
            <div className="voice-grid">
              {maleVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  onSelect={(nextVoice) => void handleVoiceSelect(nextVoice)}
                  onPreview={() => void audio.test()}
                  selected={selectedVoice.id === voice.id}
                  voice={voice}
                />
              ))}
            </div>
          </section>
        )}

        {activePage === "microphone" && (
          <section className="page-panel">
            <p className="eyebrow">Microphone</p>
            <h2>Microphone selector</h2>
            <p className="notice">
              VOXSHIFT enumerates real input devices and remembers the selected device ID. It does not capture or route
              audio to output in Phase 2.
            </p>
            {selectedDeviceDisconnected && (
              <div className="alert" role="alert">
                <strong>Your selected microphone was disconnected.</strong>
                <span>VOXSHIFT will not switch to another microphone automatically.</span>
              </div>
            )}
            {microphoneError && (
              <div className="alert" role="alert">
                <strong>Microphone error</strong>
                <span>{microphoneError}</span>
              </div>
            )}
            <div className="toolbar">
              <button onClick={requestMicrophoneAccess} type="button">
                {permissionGranted ? "Refresh Permission" : "Allow Microphone Access"}
              </button>
              <button onClick={() => void refreshMicrophones()} type="button">
                {microphoneLoading ? "Refreshing..." : "Refresh Devices"}
              </button>
            </div>
            <div className="device-list">
              {devices.length === 0 && <p>No microphones reported by the operating system yet.</p>}
              {devices.map((device) => (
                <article className="device-card" key={device.id}>
                  <div>
                    <h3>{device.label}</h3>
                    <p>{device.status === "selected" ? "Selected microphone" : "Available input device"}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Channels</dt>
                      <dd>{device.inputChannels}</dd>
                    </div>
                    <div>
                      <dt>Sample rate</dt>
                      <dd>{device.sampleRate}</dd>
                    </div>
                    <div>
                      <dt>Connection</dt>
                      <dd>{device.connectionType}</dd>
                    </div>
                  </dl>
                  <button onClick={() => void handleMicrophoneSelect(device.id)} type="button">
                    {device.status === "selected" ? "Selected" : "Select"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activePage === "call-mode" && (
          <section className="call-mode">
            <p className="eyebrow">Call Mode</p>
            <h2>Safety muted</h2>
            <p>Output: VOXSHIFT Virtual Microphone is not installed yet.</p>
            <button className="mute-button" onClick={handleEmergencyMute} type="button">
              MUTE
            </button>
          </section>
        )}

        {activePage === "settings" && (
          <section className="settings-layout">
            <aside className="settings-list">
              {settingsSections.map((section) => (
                <button key={section} type="button">
                  {section}
                </button>
              ))}
            </aside>
            <div className="custom-voice-panel">
              <p className="eyebrow">Create Custom Voice</p>
              <h2>Create a voice profile</h2>
              <p>Upload a voice recording or record one directly. Supported formats: WAV, FLAC, MP3, M4A.</p>
              <div className="upload-box" role="button" tabIndex={0}>
                <span aria-hidden="true">↑</span>
                <strong>Upload Audio</strong>
                <small>WAV • FLAC • MP3 • M4A</small>
              </div>
              <label className="field">
                <span>Voice name</span>
                <input placeholder="My Custom Voice" type="text" />
              </label>
              <label className="authorization">
                <input type="checkbox" />
                <span>I confirm that I own this voice recording or have permission to use it.</span>
              </label>
              <button disabled type="button" title="Profile creation requires Phase 9 voice analysis and secure storage">
                Create Voice Profile
              </button>
            </div>
          </section>
        )}

        {activePage === "diagnostics" && (
          <section className="page-panel">
            <p className="eyebrow">Diagnostics</p>
            <h2>System diagnostics foundation</h2>
            <div className="diagnostic-grid">
              <div>
                <span>Audio Engine</span>
                <strong>{audio.status.state}</strong>
              </div>
              <div>
                <span>Voice Model</span>
                <strong>{audio.status.voiceId ? "Loaded" : "Not loaded"}</strong>
              </div>
              <div>
                <span>Virtual Microphone</span>
                <strong>{audio.status.virtualMicrophoneReady ? "Ready" : "Not installed"}</strong>
              </div>
              <div>
                <span>Raw Input {"->"} Virtual Mic</span>
                <strong>{audio.status.rawBypassBlocked ? "BLOCKED" : "UNSAFE"}</strong>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
