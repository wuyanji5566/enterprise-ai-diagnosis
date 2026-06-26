import { Check } from "@phosphor-icons/react";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelect({ options, value, onChange }: MultiSelectProps) {
  function toggle(option: string) {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option]
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(option)}
            className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              selected
                ? "border-brand bg-brand-soft text-blue-900 ring-1 ring-brand"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                selected ? "border-brand bg-brand text-white" : "border-slate-300"
              }`}
            >
              {selected && <Check size={13} weight="bold" />}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

