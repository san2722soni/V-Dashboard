"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimelinePhase {
  phase: string
  description: string
  nodeIds: string[]
  functions?: string[]
}

interface TimelineSidebarProps {
  phases: TimelinePhase[]
  onNodeClick: (node: any) => void
}

export default function TimelineSidebar({ phases, onNodeClick }: TimelineSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-background/50">
        <h3 className="font-bold text-foreground">Execution Timeline</h3>
        <p className="text-xs text-muted-foreground">Detailed narrative flow with functions</p>
      </div>

      {/* Phases */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {phases.map((phase, idx) => (
            <div key={idx} className="relative">
              {/* Timeline connector */}
              {idx < phases.length - 1 && (
                <div className="absolute left-4 top-12 w-0.5 h-8 bg-gradient-to-b from-primary/60 to-transparent" />
              )}

              {/* Phase item */}
              <div className="relative pl-12">
                {/* Dot indicator */}
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                  {idx + 1}
                </div>

                {/* Phase content */}
                <Card className="p-3 bg-secondary/30 border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <h4 className="font-bold text-sm text-foreground mb-2">{phase.phase}</h4>
                  <p className="text-xs text-muted-foreground leading-snug mb-2">{phase.description}</p>

                  {phase.functions && phase.functions.length > 0 && (
                    <div className="mb-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold text-foreground mb-1">Functions:</p>
                      <div className="space-y-1">
                        {phase.functions.slice(0, 3).map((func, fidx) => (
                          <div key={fidx} className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                            → {func}
                          </div>
                        ))}
                        {phase.functions.length > 3 && (
                          <div className="text-xs text-muted-foreground px-2">+{phase.functions.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related nodes */}
                  <div className="flex flex-wrap gap-1">
                    {phase.nodeIds.slice(0, 2).map((nodeId) => (
                      <span
                        key={nodeId}
                        className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded border border-primary/30 font-medium"
                      >
                        {nodeId}
                      </span>
                    ))}
                    {phase.nodeIds.length > 2 && (
                      <span className="px-2 py-0.5 text-xs text-muted-foreground font-medium">
                        +{phase.nodeIds.length - 2}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {/* Final completion indicator */}
          <div className="relative pl-12 pt-2">
            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
              ✓
            </div>
            <Card className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <p className="text-xs font-medium text-green-900 dark:text-green-100">Continuous Synchronization Loop</p>
              <p className="text-xs text-green-800/70 dark:text-green-200/70 mt-1">
                Runs every frame with multiple packets sent/received, keeping all clients perfectly synchronized with
                server authority
              </p>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
