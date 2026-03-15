"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Developer } from "./column"
import { toast } from "sonner"

interface DeveloperModalProps {
  isOpen: boolean
  onClose: () => void
  developer: Developer | null
}

export const DeveloperModal = ({ isOpen, onClose, developer }: DeveloperModalProps) => {
  if (!developer) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Developer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-row w-full items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
              <p className="text-sm">{developer.email}</p>
            </div>

            <div className="cursor-pointer">
              <h4 className="text-sm font-medium text-muted-foreground">Developer Id</h4>
              <Badge
                variant={"outline"}
                onClick={() => {
                  navigator.clipboard.writeText(developer?._id)
                  toast.success("Developer Id copied to clipboard")
                }}
              >
                {developer?._id}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
              <p className="text-sm">{developer.profile?.name || "N/A"}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
              <Badge variant="outline">{developer.profile?.role || "N/A"}</Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Gender</h4>
              <p className="text-sm">{developer.profile?.gender || "N/A"}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Permissions</h4>
              <Badge variant="secondary">{developer.profile?.permissions || "N/A"}</Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Access Levels</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {developer.access && developer.access.length > 0 ? (
                developer.access.map((access) => (
                  <Badge key={access} variant="outline">
                    {access}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No access levels</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Admin Status</h4>
              <Badge variant={developer.isAdmin ? "default" : "secondary"}>
                {developer.isAdmin ? "Admin" : "Developer"}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Profile Status</h4>
              <Badge variant={developer.profileComplete ? "default" : "destructive"}>
                {developer.profileComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}