export function normalizeRssUrl(url: string): string {
  const trimmedUrl = url.trim()

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("htps://")) {
    return trimmedUrl
  }

  return `https://${trimmedUrl}`
}