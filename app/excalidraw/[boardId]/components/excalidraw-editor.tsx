"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import "@excalidraw/excalidraw/index.css"

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const DB_NAME = "excalidraw-cache"
const STORE_NAME = "boards"

const openCacheDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const getCachedBoard = async (boardId: string) => {
  try {
    const db = await openCacheDB()
    return new Promise<any>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const req = tx.objectStore(STORE_NAME).get(boardId)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

const setCachedBoard = async (boardId: string, sceneData: any, updatedAt: string) => {
  try {
    const db = await openCacheDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put({ sceneData, updatedAt }, boardId)
  } catch {}
}

interface ExcalidrawEditorProps {
  boardId: string
}

export const ExcalidrawEditor = ({ boardId }: ExcalidrawEditorProps) => {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isNew = boardId === "new"

  const [title, setTitle] = useState(isNew ? "Untitled Board" : "")
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialData, setInitialData] = useState<any>(null)
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(
    isNew ? null : boardId
  )

  const excalidrawAPIRef = useRef<any>(null)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/sign-in")
      return
    }

    if (isNew) {
      setInitialData({ elements: [], appState: {}, files: {} })
      return
    }

    const loadBoard = async () => {
      try {
        setLoading(true)
        const cached = await getCachedBoard(boardId)

        const response = await authService.authenticatedFetch(
          `${API_BASE_URL}/dashboard/excalidraw/getBoard`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ boardId, cachedAt: cached?.updatedAt }),
          }
        )

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTitle(result.data.board.title)
            if (result.cached && cached) {
              // Board hasn't changed, use cached scene data
              setInitialData(cached.sceneData)
            } else {
              // Board updated or no cache, use fresh data and cache it
              setInitialData(result.data.sceneData)
              await setCachedBoard(boardId, result.data.sceneData, result.data.board.updatedAt)
            }
          } else {
            toast.error(result.message || "Failed to load board")
            router.push("/excalidraw")
          }
        } else {
          toast.error("Failed to load board")
          router.push("/excalidraw")
        }
      } catch (error) {
        console.error("Failed to load board:", error)
        toast.error("Failed to load board")
        router.push("/excalidraw")
      } finally {
        setLoading(false)
      }
    }

    loadBoard()
  }, [boardId, isNew, router])

  const handleSave = useCallback(async () => {
    if (!excalidrawAPIRef.current) return

    const elements = excalidrawAPIRef.current.getSceneElements()
    const appState = excalidrawAPIRef.current.getAppState()
    const files = excalidrawAPIRef.current.getFiles()

    const sceneData = {
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        gridSize: appState.gridSize,
        gridStep: appState.gridStep,
        gridModeEnabled: appState.gridModeEnabled,
      },
      files,
    }

    try {
      setSaving(true)

      if (currentBoardId) {
        const response = await authService.authenticatedFetch(
          `${API_BASE_URL}/dashboard/excalidraw/updateBoard`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              boardId: currentBoardId,
              title,
              sceneData,
            }),
          }
        )

        const result = await response.json()
        if (response.ok && result.success) {
          toast.success("Board saved successfully")
          setHasUnsavedChanges(false)
          await setCachedBoard(currentBoardId, sceneData, result.data.updatedAt)
        } else {
          toast.error(result.message || "Failed to save board")
        }
      } else {
        const response = await authService.authenticatedFetch(
          `${API_BASE_URL}/dashboard/excalidraw/createBoard`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, sceneData }),
          }
        )

        const result = await response.json()
        if (response.ok && result.success) {
          toast.success("Board created successfully")
          setCurrentBoardId(result.data._id)
          setHasUnsavedChanges(false)
          await setCachedBoard(result.data._id, sceneData, result.data.updatedAt)
          window.history.replaceState(null, "", `/excalidraw/${result.data._id}`)
        } else {
          toast.error(result.message || "Failed to create board")
        }
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save board")
    } finally {
      setSaving(false)
    }
  }, [currentBoardId, title])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Leave anyway?")) return
              router.push("/excalidraw")
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setHasUnsavedChanges(true)
            }}
            className="max-w-xs font-medium"
            placeholder="Board title..."
          />
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1">
        {initialData && (
          <Excalidraw
            initialData={initialData}
            excalidrawAPI={(api: any) => {
              excalidrawAPIRef.current = api
            }}
            onChange={() => {
              if (isInitialLoadRef.current) {
                isInitialLoadRef.current = false
                return
              }
              setHasUnsavedChanges(true)
            }}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
          />
        )}
      </div>
    </div>
  )
}
