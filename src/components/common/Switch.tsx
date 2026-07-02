import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Switch({ checked, onChange, className = "" }: SwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
        checked
          ? "bg-blue-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
          : "bg-gray-200 dark:bg-gray-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
      } ${className}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
