import { type LucideIcon } from "lucide-react";
import clsx from "clsx";

interface Props { icon: LucideIcon; onClick?: () => void; title?: string; className?: string; size?: number; }

export function IconButton({ icon: Icon, onClick, title, className, size = 14 }: Props) {
  return (
    <button onClick={onClick} title={title}
      className={clsx("w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors", className)}>
      <Icon size={size} className="text-gray-500 dark:text-gray-400" />
    </button>
  );
}