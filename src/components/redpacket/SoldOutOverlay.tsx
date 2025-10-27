import { PackageX } from 'lucide-react';

type Props = {
  visible: boolean;
  message: string;
};

export function SoldOutOverlay({ visible, message }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-md">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-surface-glass/60 p-6 shadow-lg">
            <PackageX className="h-12 w-12 text-text-secondary" />
          </div>
        </div>
        <p className="text-2xl font-bold text-text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {message}
        </p>
      </div>
    </div>
  );
}
