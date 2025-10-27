import { CheckCircle2, XCircle } from 'lucide-react';

type Props = {
  qualify: boolean;
  requirements: string[];
};

export function QualifyBadge({ qualify, requirements }: Props) {
  const Icon = qualify ? CheckCircle2 : XCircle;
  const colorClass = qualify ? 'text-green-500' : 'text-red-500';
  const bgClass = qualify ? 'bg-green-500/10' : 'bg-red-500/10';
  const borderClass = qualify ? 'border-green-500/30' : 'border-red-500/30';

  return (
    <div className={`space-y-3 rounded-xl border ${borderClass} ${bgClass} p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <span className={`font-semibold ${colorClass}`}>
          {qualify ? 'Qualified' : 'Not Qualified'}
        </span>
      </div>
      <ul className="space-y-1 text-sm text-text-secondary">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>{req}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
