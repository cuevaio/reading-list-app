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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">ReadLater</h1>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Your Reading List</h2>
            <p className="text-muted-foreground">Save articles to read later and never lose track of great content</p>
          </div>

          <AddArticleForm />

          <ReadingList initialReadings={readings || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
