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
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <a href={reading.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {reading.og_image ? (
            <Image
              src={reading.og_image || "/placeholder.svg"}
              alt={reading.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <span className="text-4xl">📄</span>
            </div>
          )}
          {showSimilarity && reading.similarity !== undefined && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              {Math.round(reading.similarity * 100)}% match
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            {reading.favicon && (
              <Image
                src={reading.favicon || "/placeholder.svg"}
                alt=""
                width={16}
                height={16}
                className="mt-1 flex-shrink-0"
                unoptimized
              />
            )}
            <h3 className="font-semibold line-clamp-2 text-balance leading-snug">{reading.title}</h3>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{reading.summary}</p>

          <div className="flex gap-2 pt-2" onClick={(e) => e.preventDefault()}>
            <Button
              variant={reading.is_read ? "secondary" : "default"}
              size="sm"
              className="flex-1"
              onClick={handleToggleRead}
              disabled={isUpdating}
            >
              {reading.is_read ? (
                <>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Mark Unread
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Mark Read
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={isUpdating}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </a>
    </Card>
  )
}
