import { UpstreamError } from '../../../core/errors'

const USER_AGENT = 'MemoryBook/0.1 (personal reading tracker)'

export async function fetchJson<T>(url: string, timeoutMs = 6000): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': USER_AGENT },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) {
    throw new UpstreamError(`${new URL(url).host} ответил ${response.status}`)
  }
  return (await response.json()) as T
}

/** Внешние API иногда отдают http-обложки; PWA на https их не покажет. */
export function toHttps(url: string | undefined | null): string | null {
  if (!url) return null
  return url.replace(/^http:\/\//, 'https://')
}
