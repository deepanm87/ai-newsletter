import { Sparkles } from "lucide-react"
import { NewsletterGenerator } from "@/components/dashboard/newsletter-generator"
import { PageHeader } from "@/components/dashboard/page-header"
import { RssFeedManager } from "@/components/dashboard/rss-feed-manager"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="container mx-auto py-12 px-6 lg:px-8 space-y-12">
        <PageHeader 
          icon={Sparkles}
          title="Dashboard"
          description="Manage your RSS feeds and generate AI-powered newsletters"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <RssFeedManager />
          </div>

          <div>
            <NewsletterGenerator />
          </div>
          
        </div>
      </div>
    </div>
  )
}