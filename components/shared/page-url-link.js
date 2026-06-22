import { parsePageUrl } from "@/utils/page-url";
import { cn } from "@/utils/cn";

export function PageUrlLink({ className, url }) {
  const { domain, href, path } = parsePageUrl(url);

  if (!href) {
    return <span className={cn("text-sm text-zinc-500", className)}>—</span>;
  }

  return (
    <a
      className={cn(
        "block min-w-0 text-sm font-medium text-zinc-950 hover:underline",
        className
      )}
      href={href}
      rel="noreferrer"
      target="_blank"
      title={url}
    >
      <span className="hidden break-words md:inline">{url}</span>
      <span className="md:hidden">
        {domain ? (
          <span className="block truncate text-xs font-normal text-zinc-500">
            {domain}
          </span>
        ) : null}
        <span className="mt-0.5 block break-words leading-5">{path}</span>
      </span>
    </a>
  );
}
