export function normalizeWebsiteOrigin(website) {
  if (!website) {
    return "";
  }

  const trimmed = website.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("sc-domain:")) {
    return `https://${trimmed.replace("sc-domain:", "")}`;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProtocol);

    return url.origin;
  } catch {
    return trimmed.replace(/\/$/, "");
  }
}

export function getPageSlug(pathOrUrl) {
  if (!pathOrUrl) {
    return "/";
  }

  try {
    if (/^https?:\/\//i.test(pathOrUrl)) {
      const url = new URL(pathOrUrl);

      return url.pathname || "/";
    }
  } catch {
    // Fall through to path handling.
  }

  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
}

export function buildPageUrl(website, pathOrUrl) {
  if (!pathOrUrl) {
    return normalizeWebsiteOrigin(website);
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const origin = normalizeWebsiteOrigin(website);

  if (!origin) {
    return getPageSlug(pathOrUrl);
  }

  return `${origin}${getPageSlug(pathOrUrl)}`;
}

export function parsePageUrl(url) {
  if (!url) {
    return {
      domain: "",
      href: "",
      path: "/",
    };
  }

  try {
    const parsed = new URL(url);

    return {
      domain: parsed.hostname,
      href: url,
      path: `${parsed.pathname}${parsed.search}${parsed.hash}` || "/",
    };
  } catch {
    return {
      domain: "",
      href: url,
      path: url,
    };
  }
}
