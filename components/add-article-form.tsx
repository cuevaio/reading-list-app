"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Loader2, Link, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"

export function AddArticleForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

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
      setIsSuccess(true)
      router.refresh()

      // Reset success state after animation
      setTimeout(() => setIsSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add article")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <motion.form
        onSubmit={handleSubmit}
        className="relative group"
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onAnimationComplete={() => {
          if (error) setTimeout(() => setError(null), 3000)
        }}
      >
        <div className="relative flex items-center">
          <div className="absolute left-3 text-muted-foreground z-10">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
              isSuccess ? <Check className="h-4 w-4 text-green-500" /> :
                <Link className="h-4 w-4" />}
          </div>
          <Input
            type="url"
            placeholder="Paste article URL to save..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (error) setError(null)
            }}
            required
            className={`pl-10 h-12 bg-background/50 border-input/50 focus:border-primary/20 hover:bg-background/80 transition-all rounded-full shadow-sm focus:ring-2 focus:ring-primary/10 text-base ${error ? 'border-destructive/50 ring-destructive/10' : ''}`}
            disabled={isLoading}
          />

          <div className="absolute right-1.5 flex items-center">
            <AnimatePresence>
              {url && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive mt-2 px-4 font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  )
}
