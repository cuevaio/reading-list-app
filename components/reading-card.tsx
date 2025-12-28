"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Trash2, X } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Reading = {
  id: string
  url: string
  title: string
  og_image: string | null
  favicon: string | null
  summary: string
  is_read: boolean
  created_at: string
  similarity?: number
}

interface ReadingCardProps {
  reading: Reading
  onUpdate: (updater: (prev: Reading[]) => Reading[]) => void
  showSimilarity?: boolean
}

export function ReadingCard({ reading, onUpdate, showSimilarity = false }: ReadingCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsUpdating(true)

    try {
      const { error } = await supabase.from("readings").update({ is_read: !reading.is_read }).eq("id", reading.id)

      if (error) throw error

      onUpdate((prev) => prev.map((r) => (r.id === reading.id ? { ...r, is_read: !r.is_read } : r)))
      router.refresh()
    } catch (error) {
      console.error("Error updating reading:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsUpdating(true)

    try {
      const { error } = await supabase.from("readings").delete().eq("id", reading.id)

      if (error) throw error

      onUpdate((prev) => prev.filter((r) => r.id !== reading.id))
      router.refresh()
    } catch (error) {
      console.error("Error deleting reading:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50">
      <a href={`/${reading.url}`} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
        <div className="relative h-48 w-full overflow-hidden bg-muted/50">
          {reading.og_image ? (
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={reading.og_image || "/placeholder.svg"}
                alt={reading.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/30">
              <span className="text-4xl opacity-50">📄</span>
            </div>
          )}
          {showSimilarity && reading.similarity !== undefined && (
            <Badge className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white shadow-sm">
              {Math.round(reading.similarity * 100)}% match
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col flex-1 p-5 space-y-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {reading.favicon && (
                <Image
                  src={reading.favicon || "/placeholder.svg"}
                  alt=""
                  width={14}
                  height={14}
                  className="flex-shrink-0 rounded-full"
                  unoptimized
                />
              )}
              <span className="truncate max-w-[200px] opacity-70 hover:opacity-100 transition-opacity">
                {new URL(reading.url).hostname.replace('www.', '')}
              </span>
            </div>

            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {reading.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed opacity-90">
              {reading.summary}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/40 mt-auto">
            <div className="flex gap-2 w-full">
              <Button
                variant={reading.is_read ? "secondary" : "default"}
                size="sm"
                className={`flex-1 transition-all duration-200 ${reading.is_read ? 'bg-secondary/80 hover:bg-secondary' : 'shadow-md hover:shadow-lg'}`}
                onClick={handleToggleRead}
                disabled={isUpdating}
              >
                {reading.is_read ? (
                  <>
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Unread
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Read
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isUpdating}
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  )
}
