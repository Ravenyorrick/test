import { mailtoMike } from '../data/site';

type Props = {
  label?: string;
  subject?: string;
};

export function LearnMoreButton({ label = 'Learn More', subject }: Props) {
  return (
    <a className="btn" href={mailtoMike(subject ?? undefined)}>
      {label}
    </a>
  );
}
