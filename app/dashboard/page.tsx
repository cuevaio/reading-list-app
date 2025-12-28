import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddArticleForm } from "@/components/add-article-form"
import { ReadingList } from "@/components/reading-list"
import { Button } from "@/components/ui/button"
import { BookMarked, LogOut } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch readings
  const { data: readings, error } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching readings:", error)
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/10">
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
      </div>

      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BookMarked className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              ReadLater
            </h1>
          </div>
          <form action={handleSignOut}>
            <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Your Reading List
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Save articles to read later and never lose track of great content.
            </p>
          </div>

          <div className="bg-card/40 border border-border/50 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
            <AddArticleForm />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight">Saved Articles</h3>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {readings?.length || 0} items
              </span>
            </div>
            <ReadingList initialReadings={readings || []} userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
