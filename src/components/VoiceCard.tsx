import type { VoiceProfile } from "../types/voxshift";

type VoiceCardProps = {
  voice: VoiceProfile;
  selected?: boolean;
  onSelect: (voice: VoiceProfile) => void;
  onPreview: (voice: VoiceProfile) => void;
};

export function VoiceCard({ voice, selected = false, onPreview, onSelect }: VoiceCardProps) {
  return (
    <article className={selected ? "voice-card voice-card--selected" : "voice-card"}>
      <div className="voice-card__glyph" aria-hidden="true">
        {voice.category === "American Female" ? "♀" : "♂"}
      </div>
      <div>
        <h3>{voice.name}</h3>
        <p>
          {voice.style} • {voice.accent}
        </p>
      </div>
      <dl className="voice-card__meta">
        <div>
          <dt>Quality</dt>
          <dd>{voice.quality}</dd>
        </div>
        <div>
          <dt>Latency</dt>
          <dd>{voice.estimatedLatencyMs} ms est.</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{voice.location}</dd>
        </div>
      </dl>
      <div className="voice-card__actions">
        <button type="button" onClick={() => onPreview(voice)}>
          Preview
        </button>
        <button type="button" onClick={() => onSelect(voice)}>
          {selected ? "Selected" : "Select"}
        </button>
      </div>
    </article>
  );
}
