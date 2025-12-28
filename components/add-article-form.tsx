"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddArticleForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add article")
      }

      setUrl("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add article")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <div className="absolute left-3 text-muted-foreground">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </div>
          <Input
            type="url"
            placeholder="Paste article URL to save..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="pl-10 h-10 bg-background/50 border-transparent focus:border-primary/20 hover:bg-background/80 transition-all rounded-xl shadow-none focus:ring-0 text-base"
            disabled={isLoading}
          />
          <div className="absolute right-1.5">
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !url}
              className={`h-8 px-4 rounded-lg transition-all duration-300 ${url ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
            >
              Add
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive mt-2 px-1">{error}</p>}
      </form>
    </div>
  )
}
