import { cn } from "@/utils/cn";

const variants = {
  default:
    "bg-zinc-950 text-white shadow-sm hover:bg-zinc-800 focus-visible:ring-zinc-950",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-zinc-300",
  outline:
    "border border-zinc-200 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50 focus-visible:ring-zinc-300",
};

const sizes = {
  default: "h-10 px-4 py-2",
  icon: "h-10 w-10",
  sm: "h-9 px-3",
};

export function buttonVariants({
  className,
  variant = "default",
  size = "default",
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  return (
    <button
      className={buttonVariants({ className, variant, size })}
      type={type}
      {...props}
    />
  );
}
