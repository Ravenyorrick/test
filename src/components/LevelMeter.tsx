type LevelMeterProps = {
  label: string;
  value: number | null;
  muted?: boolean;
};

export function LevelMeter({ label, value, muted = false }: LevelMeterProps) {
  const safeValue = value === null || muted ? 0 : Math.max(0, Math.min(value, 100));

  return (
    <div className="meter" aria-label={`${label} level`}>
      <div className="meter__header">
        <span>{label}</span>
        <span>{value === null ? "Awaiting engine" : `${safeValue}%`}</span>
      </div>
      <div className="meter__track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
        <span className="meter__fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
