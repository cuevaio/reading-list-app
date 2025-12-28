"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReadingCard } from "@/components/reading-card"
import { Input } from "@/components/ui/input"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

interface ReadingListProps {
  initialReadings: Reading[]
  userId: string
}

export function ReadingList({ initialReadings, userId }: ReadingListProps) {
  const [readings, setReadings] = useState<Reading[]>(initialReadings)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSemanticSearch, setIsSemanticSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [semanticResults, setSemanticResults] = useState<Reading[]>([])

  const unreadReadings = isSemanticSearch
    ? semanticResults.filter((r) => !r.is_read)
    : readings.filter((r) => !r.is_read)
  const readReadings = isSemanticSearch ? semanticResults.filter((r) => r.is_read) : readings.filter((r) => r.is_read)

  const filteredUnread = isSemanticSearch
    ? unreadReadings
    : unreadReadings.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      )

  const filteredRead = isSemanticSearch
    ? readReadings
    : readReadings.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      )

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setIsSemanticSearch(true)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSemanticResults(data.results || [])
    } catch (error) {
      console.error("Semantic search error:", error)
      setSemanticResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (isSemanticSearch && !value.trim()) {
      setIsSemanticSearch(false)
      setSemanticResults([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your articles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                handleSemanticSearch()
              }
            }}
          />
        </div>
        <Button
          onClick={handleSemanticSearch}
          disabled={!searchQuery.trim() || isSearching}
          variant={isSemanticSearch ? "default" : "outline"}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Search
            </>
          )}
        </Button>
      </div>

      {isSemanticSearch && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-powered results for "{searchQuery}"
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsSemanticSearch(false)
              setSemanticResults([])
              setSearchQuery("")
            }}
          >
            Clear
          </Button>
        </div>
      )}

      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="unread">
            Unread <span className="ml-1.5 text-xs text-muted-foreground">({unreadReadings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="read">
            Read <span className="ml-1.5 text-xs text-muted-foreground">({readReadings.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="mt-6">
          {filteredUnread.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery
                ? isSemanticSearch
                  ? "No articles found matching your AI search"
                  : "No unread articles match your search"
                : "No unread articles yet. Add one above!"}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUnread.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  onUpdate={setReadings}
                  showSimilarity={isSemanticSearch}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="read" className="mt-6">
          {filteredRead.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery
                ? isSemanticSearch
                  ? "No articles found matching your AI search"
                  : "No read articles match your search"
                : "No read articles yet"}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRead.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  onUpdate={setReadings}
                  showSimilarity={isSemanticSearch}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
