import { useEffect, useMemo, useState } from "react";
import { LevelMeter } from "./components/LevelMeter";
import { Sidebar } from "./components/Sidebar";
import { VoiceCard } from "./components/VoiceCard";
import { builtinVoices } from "./data/voices";
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
  const [voiceActive, setVoiceActive] = useState(false);
  const [muted, setMuted] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(builtinVoices[0]);
  const [version, setVersion] = useState("0.1.0");

  useEffect(() => {
    void window.voxshift?.getAppInfo().then((info) => setVersion(info.version));
  }, []);

  const femaleVoices = useMemo(
    () => builtinVoices.filter((voice) => voice.category === "American Female"),
    []
  );
  const maleVoices = useMemo(() => builtinVoices.filter((voice) => voice.category === "American Male"), []);

  async function handleEmergencyMute() {
    await window.voxshift?.emergencyMute();
    setMuted(true);
    setVoiceActive(false);
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
              <span className="status-dot status-dot--muted" />
              Safety gate muted
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
                <span className="pill">Provider-ready metadata</span>
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
                <button disabled type="button" title="Preview becomes available after a licensed model is installed">
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
                  <strong>No microphone selected</strong>
                  <span>Phase 2 will enumerate real input devices using stable identifiers.</span>
                </div>
                <button onClick={() => setActivePage("microphone")} type="button">
                  Change
                </button>
              </div>
              <LevelMeter label="Input" value={null} muted={muted} />
              <LevelMeter label="Output" value={null} muted={muted} />
            </div>

            <div className="control-card">
              <span className="section-label">Voice Conversion</span>
              <button
                className={voiceActive ? "power-button power-button--on" : "power-button"}
                disabled
                type="button"
                title="Activation is locked until the audio engine, voice engine, and virtual microphone are implemented"
              >
                <span>{voiceActive ? "ON" : "OFF"}</span>
                <strong>{voiceActive ? "VOICE ACTIVE" : "SAFETY MUTED"}</strong>
              </button>
              <div className="metrics">
                <div>
                  <span>Latency</span>
                  <strong>Not measured</strong>
                </div>
                <div>
                  <span>CPU</span>
                  <strong>Awaiting engine</strong>
                </div>
                <div>
                  <span>Quality</span>
                  <strong>No score</strong>
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
                  onSelect={(nextVoice) => setSelectedVoice(nextVoice)}
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
                  onSelect={(nextVoice) => setSelectedVoice(nextVoice)}
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
            <h2>Device manager foundation</h2>
            <p className="notice">
              Real device enumeration begins in Phase 2. Until then, VOXSHIFT keeps the safety gate muted and does not
              select or transmit any physical microphone.
            </p>
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
              {["Audio Engine", "Voice Model", "Virtual Microphone", "Safety Gate"].map((item) => (
                <div key={item}>
                  <span>{item}</span>
                  <strong>{item === "Safety Gate" ? "MUTED" : "Not initialized"}</strong>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
