import { Check } from "@phosphor-icons/react";

interface StepProgressProps {
  steps: string[];
  current: number;
  onStepClick: (index: number) => void;
}

export function StepProgress({ steps, current, onStepClick }: StepProgressProps) {
  return (
    <>
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-brand">第 {current + 1} / {steps.length} 步</span>
          <span className="text-slate-500">{steps[current]}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="hidden pb-3 sm:block">
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const completed = index < current;
          const active = index === current;
          return (
            <li key={step} className="flex flex-1 items-start">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className="group flex min-w-[92px] flex-col items-center text-center"
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={`grid size-9 place-items-center rounded-full border text-sm font-semibold transition ${
                    active
                      ? "border-brand bg-brand text-white shadow-md shadow-blue-100"
                      : completed
                        ? "border-blue-200 bg-blue-50 text-brand"
                        : "border-slate-300 bg-white text-slate-500 group-hover:border-slate-400"
                  }`}
                >
                  {completed ? <Check size={16} weight="bold" /> : index + 1}
                </span>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    active ? "text-brand" : "text-slate-500"
                  }`}
                >
                  {step}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={`mt-[17px] h-px flex-1 ${
                    index < current ? "bg-blue-200" : "bg-slate-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      </div>
    </>
  );
}
