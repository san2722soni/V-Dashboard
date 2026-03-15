"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { FeatureFlag } from "./column"
import { toast } from "sonner"

interface FeatureFlagModalProps {
  isOpen: boolean
  onClose: () => void
  featureFlag: FeatureFlag | null
}

export const FeatureFlagModal = ({ isOpen, onClose, featureFlag }: FeatureFlagModalProps) => {
  if (!featureFlag) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-4">Feature Flag Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-row w-full items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-muted-foreground">Name</h4>
              <p className="text-base text-bold mt-2 ">{featureFlag.name}</p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-muted-foreground">Type</h4>
              <p className="text-base text-bold mt-2 ">{featureFlag?.type}</p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-muted-foreground">Value</h4>
              <p className="text-base text-bold mt-2 ">{featureFlag?.value}</p>
            </div>

          </div>

          <Separator />
        </div>
      </DialogContent>
    </Dialog>
  )
}
