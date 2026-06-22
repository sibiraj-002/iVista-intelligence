import Image from "next/image"
import Link from "next/link"

import { cn } from "@/utils/cn"

const LOGO_ASPECT = 50 / 200

export function BrandLogo({
  className,
  href = "/dashboard",
  priority = false,
  width = 160,
}) {
  const height = Math.round(width * LOGO_ASPECT)

  const logo = (
    <Image
      alt="iVistaz"
      className={cn(
        "block h-auto max-h-10 w-auto object-contain object-left",
        className,
      )}
      height={height}
      priority={priority}
      src="/ivista_logo.svg"
      width={width}
    />
  )

  if (!href) {
    return logo
  }

  return (
    <Link className="inline-flex shrink-0 items-center" href={href}>
      {logo}
    </Link>
  )
}
