import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { locationLabel, type Lang } from "./i18n";

interface LocationSearchInputProps {
  id: string;
  lang: Lang;
  label: ReactNode;
  value: string;
  options: string[];
  placeholder: string;
  className: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

export function LocationSearchInput({
  id,
  lang,
  label,
  value,
  options,
  placeholder,
  className,
  onChange,
  invalid,
  describedBy,
}: LocationSearchInputProps) {
  const isAR = lang === "AR";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const blurTimer = useRef<number | null>(null);
  const pointerDownInOptions = useRef(false);

  useEffect(() => {
    setQuery(value ? locationLabel(lang, value) : "");
  }, [lang, value]);

  useEffect(() => {
    const resetPointerState = () => { pointerDownInOptions.current = false; };
    window.addEventListener("pointerup", resetPointerState);
    window.addEventListener("pointercancel", resetPointerState);
    return () => {
      window.removeEventListener("pointerup", resetPointerState);
      window.removeEventListener("pointercancel", resetPointerState);
    };
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matching = search ? options.filter((option) => {
      const en = option.toLowerCase();
      const localized = locationLabel(lang, option).toLowerCase();
      return en.includes(search) || localized.includes(search);
    }) : options;

    return Array.from(new Set(matching.filter(Boolean)));
  }, [lang, options, query]);

  function choose(nextValue: string) {
    onChange(nextValue);
    setQuery(locationLabel(lang, nextValue));
    setOpen(false);
    setActiveIndex(0);
  }

  function handleInput(nextQuery: string) {
    setQuery(nextQuery);
    setOpen(true);
    setActiveIndex(0);
    if (!nextQuery.trim() || nextQuery !== locationLabel(lang, value)) {
      onChange("");
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={query}
        onChange={(event) => handleInput(event.target.value)}
        onFocus={() => {
          if (blurTimer.current) window.clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => {
            if (!pointerDownInOptions.current) setOpen(false);
          }, 180);
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            setOpen(true);
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          }
          if (event.key === "Enter" && open && filtered[activeIndex]) {
            event.preventDefault();
            choose(filtered[activeIndex]);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          onPointerDown={() => {
            pointerDownInOptions.current = true;
            if (blurTimer.current) window.clearTimeout(blurTimer.current);
          }}
          onPointerUp={() => { pointerDownInOptions.current = false; }}
          onPointerCancel={() => { pointerDownInOptions.current = false; }}
          className={`absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-lux-green/20 bg-white py-1 text-sm shadow-xl ${isAR ? "text-right" : "text-left"}`}
        >
          {filtered.length ? filtered.map((option, index) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                className={`block w-full px-3 py-2 transition-colors ${
                  index === activeIndex || selected ? "bg-lux-green/10 text-lux-green" : "text-lux-charcoal hover:bg-lux-green/5"
                }`}
              >
                <span className="block font-semibold">{locationLabel(lang, option)}</span>
                {locationLabel(lang, option) !== option && <span className="block text-xs text-gray-500">{option}</span>}
              </button>
            );
          }) : (
            <div className="px-3 py-2 text-gray-500">{isAR ? "لا توجد نتائج" : "No matches"}</div>
          )}
        </div>
      )}
    </div>
  );
}
