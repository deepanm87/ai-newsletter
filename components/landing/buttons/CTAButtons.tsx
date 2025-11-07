import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CTAButtons() {
  const { has, userId } = await auth()
  const hasPaidPlan = 
    (await has({ plan: "pro" })) || (await has({ plan: "starter" }))

    return (
      <>
        <SignedOut>
          <SignInButton mode="modal" forceRedirectUrl="/#pricing">
            <Button size="lg" className="w-full sm:w-auto cursor-pointer">
              Get Started <ArrowRight className="ml-2 size-4" />
            </Button>
          </SignInButton>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link href="#pricing">View Pricing</Link>
          </Button>
        </SignedOut>

        {userId && hasPaidPlan && (
          <SignedIn>
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard" className="flex items-center justify-center">
                Go to Dashboard <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </SignedIn>
        )}

        {userId && !hasPaidPlan && (
          <SignedIn>
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/#pricing" className="flex items-center justify-center">
                Choose a Plan <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </SignedIn>
        )}
      </>
    )
}