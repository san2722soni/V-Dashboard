"use client"
import { Card } from "@/components/ui/card"

interface TimelinePhase {
  phase: string
  description: string
  nodeIds: string[]
}

interface TimelineViewProps {
  phases: TimelinePhase[]
  onNodeClick: (node: any) => void
}

/**
 * Timeline component showing execution flow narrative
 * Each phase displays related nodes and descriptions
 */
export default function TimelineView({ phases, onNodeClick }: TimelineViewProps) {
  return (
    <div className="space-y-6">
      {phases.map((phase, idx) => (
        <div key={idx} className="relative">
          {idx < phases.length - 1 && (
            <div
              className="absolute left-6 top-20 bottom-0 w-1 bg-gradient-to-b from-primary to-accent"
              aria-hidden="true"
            />
          )}

          <div className="flex gap-6">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                {idx + 1}
              </div>
            </div>

            <Card className="flex-1 p-6 border border-border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-2">{phase.phase}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">{phase.description}</p>

              <div className="flex flex-wrap gap-2">
                {phase.nodeIds.map((nodeId) => (
                  <div
                    key={nodeId}
                    className="px-3 py-1 bg-secondary/50 text-sm rounded-full border border-border text-foreground font-medium hover:bg-secondary cursor-pointer transition-colors"
                  >
                    {nodeId}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ))}

      <div className="flex gap-6">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
            {String.fromCharCode(10003)}
          </div>
        </div>
        <Card className="flex-1 p-6 border border-border bg-green-50 dark:bg-green-950/20">
          <h3 className="text-xl font-bold text-foreground mb-2">Continuous Loop</h3>
          <p className="text-muted-foreground leading-relaxed">
            This bidirectional flow runs continuously — each frame, multiple packets may be sent and received, keeping
            all clients synchronized with the server authoritative simulation.
          </p>
        </Card>
      </div>
    </div>
  )
}
