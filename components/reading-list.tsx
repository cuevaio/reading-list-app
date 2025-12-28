"use client"

import { useState } from "react"
import { ReadingCard } from "@/components/reading-card"
import { Search, Sparkles, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "motion/react"

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
  const [activeTab, setActiveTab] = useState("unread")

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

  const currentList = activeTab === "unread" ? filteredUnread : filteredRead

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-background/50 border-input border rounded-full px-4 h-12 shadow-sm focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary/50 transition-all">
            <Search className="h-4 w-4 text-muted-foreground mr-3" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSemanticSearch()
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm h-full placeholder:text-muted-foreground/70"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="p-1 hover:bg-muted rounded-full transition-colors mr-1"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
            <div className="h-5 w-[1px] bg-border mx-2" />
            <Button
              onClick={handleSemanticSearch}
              disabled={!searchQuery.trim() || isSearching}
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-full hover:bg-primary/10 hover:text-primary"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-muted/30 rounded-full border border-border/40 relative">
          {["unread", "read"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors z-10 ${activeTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="capitalize">{tab}</span>
              <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                {tab === "unread" ? unreadReadings.length : readReadings.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isSemanticSearch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 justify-center"
        >
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 bg-primary/5 text-primary border-primary/10">
            <Sparkles className="h-3 w-3" />
            AI Results for "{searchQuery}"
          </Badge>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setIsSemanticSearch(false)
              setSemanticResults([])
              setSearchQuery("")
            }}
            className="text-muted-foreground hover:text-destructive h-auto p-0"
          >
            Clear Search
          </Button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="bg-muted/30 p-6 rounded-full">
                {searchQuery ? (
                  <Search className="h-10 w-10 text-muted-foreground/50" />
                ) : activeTab === "unread" ? (
                  <div className="text-4xl">🎉</div>
                ) : (
                  <div className="text-4xl">📚</div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {searchQuery
                    ? "No matching articles found"
                    : activeTab === "unread"
                      ? "You're all caught up!"
                      : "No read articles yet"}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  {searchQuery
                    ? "Try adjusting your search terms or use AI search for better results."
                    : activeTab === "unread"
                      ? "Add more articles to build your reading list."
                      : "Articles you mark as read will appear here."}
                </p>
              </div>
            </div>
          ) : (
            <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {currentList.map((reading) => (
                  <motion.div
                    layout
                    key={reading.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ReadingCard
                      reading={reading}
                      onUpdate={setReadings}
                      showSimilarity={isSemanticSearch}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
