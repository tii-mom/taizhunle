import { Check } from 'lucide-react';
import { useHaptic } from '../../hooks/useHaptic';

type Step = {
  key: string;
  label: string;
};

type Props = {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
};

export function StepIndicator({ steps, currentStep, onStepClick }: Props) {
  const { vibrate } = useHaptic();

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-light bg-surface-glass/60 p-4 shadow-lg backdrop-blur-md">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <div key={step.key} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isClickable) {
                  vibrate();
                  onStepClick(index);
                }
              }}
              disabled={!isClickable}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
                isCurrent
                  ? 'bg-accent text-accent-contrast shadow-lg shadow-accent/30 ring-2 ring-accent/20'
                  : isCompleted
                    ? 'bg-success text-accent-contrast'
                    : 'border border-border bg-background text-text-secondary'
              } ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-accent/50 hover:shadow-accent/20 active:scale-95 md:hover:shadow-lg' : 'cursor-default'}`}
            >
              {isCompleted ? <Check size={20} /> : index + 1}
            </button>
            <span
              className={`hidden text-sm font-medium sm:block ${
                isCurrent ? 'text-accent' : isCompleted ? 'text-success' : 'text-text-secondary'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-all duration-300 ${
                  isCompleted ? 'bg-success' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
