import { cn } from "@/utils/cn";

const variants = {
  default:
    "bg-[#ed2225] text-white shadow-sm hover:bg-[#c32222] focus-visible:ring-[#ed2225]",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 hover:text-[#ed2225] focus-visible:ring-zinc-300",
  outline:
    "border border-[#ed2225] bg-white text-[#ed2225] shadow-sm hover:bg-[#ed2225] hover:text-white focus-visible:ring-[#ed2225]",
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
