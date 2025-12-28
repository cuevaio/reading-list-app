import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookMarked, CheckCircle2, Search, Zap, Menu } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm support-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <BookMarked className="h-6 w-6 text-primary" />
            <span>ReadLater</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
              Sign In
            </Link>
            <Button asChild size="sm" className="rounded-full px-6">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-24 md:pb-32">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 cursor-default">
              ✨ New: AI-Powered Summaries
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance max-w-4xl mx-auto">
              Master Your Reading List with <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Artificial Intelligence</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Stop drowning in open tabs. Save articles instantly, get concise AI summaries, and rediscover content with smart semantic search.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/20">
                <Link href="/auth/sign-up">Start Reading for Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base bg-background/50 backdrop-blur-sm">
                <Link href="/auth/login">View Demo</Link>
              </Button>
            </div>

            <div className="pt-12 flex justify-center items-center gap-8 text-muted-foreground/60">
              <div className="text-sm font-medium">Trusted by avid readers from</div>
              {/* Logos could go here, using text for now as placeholders */}
              <div className="flex gap-6 font-semibold items-center">
                <span>ACME Inc.</span>
                <span>Globex</span>
                <span>Soylent Corp</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30 border-y">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Everything you need to read better</h2>
              <p className="text-muted-foreground text-lg">
                Focus on the content, not the management. We handle the organization so you can enjoy the reading.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Capture",
                  description: "Save any URL with a single click. We strip away the clutter and keep only the content that matters."
                },
                {
                  icon: BookMarked,
                  title: "AI Summaries",
                  description: "Short on time? Get the gist of any article in seconds with our advanced AI summarization engine."
                },
                {
                  icon: Search,
                  title: "Semantic Search",
                  description: "Don't just search keywords. Ask questions and find answers hidden deep within your saved library."
                }
              ].map((feature, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-card p-8 border shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <feature.icon className="w-24 h-24 text-primary rotate-12" />
                  </div>
                  <div className="p-3 bg-primary/10 w-fit rounded-xl mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-24 overflow-hidden text-center text-primary-foreground shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to transform your reading habits?</h2>
              <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto">
                Join thousands of users who are already building their smartest personal library.
              </p>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base mt-4 shadow-lg">
                <Link href="/auth/sign-up">Get Started for Free</Link>
              </Button>
              <p className="text-xs text-primary-foreground/70 mt-4">
                No credit card required · Free plan forever · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <BookMarked className="h-6 w-6 text-primary" />
              <span>ReadLater</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your personal knowledge base, supercharged by AI.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">About</Link></li>
              <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ReadLater Inc. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
