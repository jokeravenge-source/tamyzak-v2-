const OAUTH_KEYS = [
  "access_token",
  "refresh_token",
  "expires_in",
  "expires_at",
  "token_type",
  "provider_token",
  "provider_refresh_token",
  "state",
  "error",
  "error_code",
  "error_description",
] as const;

export type OAuthCallbackResult =
  | {
      kind: "tokens";
      tokens: { access_token: string; refresh_token: string };
      cleanPath: string;
    }
  | { kind: "error"; message: string; cleanPath: string }
  | { kind: "none" };

/**
 * Read the implicit-token callback returned by the Lovable OAuth broker.
 * Supabase normally consumes this automatically, but explicit recovery keeps
 * Google/Apple sign-in working in WebViews and browsers with delayed storage.
 */
export function readOAuthCallback(href: string): OAuthCallbackResult {
  const url = new URL(href);
  const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  const value = (key: string) => hashParams.get(key) ?? url.searchParams.get(key);
  const accessToken = value("access_token");
  const refreshToken = value("refresh_token");
  const error = value("error_description") ?? value("error");

  if (!accessToken && !refreshToken && !error) return { kind: "none" };

  for (const key of OAUTH_KEYS) {
    hashParams.delete(key);
    url.searchParams.delete(key);
  }
  url.hash = hashParams.toString() ? `#${hashParams.toString()}` : "";
  const cleanPath = `${url.pathname}${url.search}${url.hash}`;

  if (error) return { kind: "error", message: error, cleanPath };
  if (accessToken && refreshToken) {
    return {
      kind: "tokens",
      tokens: { access_token: accessToken, refresh_token: refreshToken },
      cleanPath,
    };
  }
  return { kind: "error", message: "OAuth callback did not include a complete session.", cleanPath };
}
