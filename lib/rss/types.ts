export interface ArticleCreateData {
  feedId: string
  guid: string
  title: string
  link: string
  content?: string
  summary?: string
  pubDate: Date
  author?: string
  categories?: string[]
  imageUrl?: string
}

export interface BulkOperationResult {
  created: number
  skipped: number
  errors: number
}

export interface FeedMetadata {
  title: string
  description?: string
  link?: string
  imageUrl?: string
  language?: string
}

export interface ArticleData {
  guid: string
  title: string
  link: string
  content?: string
  summary?: string
  pubDate: string
  author?: string
  categories: string[]
  imageUrl?: string
}

export interface PrepareFeedsParams {
  feedIds: string[]
  startDate: Date
  endDate: Date
}