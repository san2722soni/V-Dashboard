import { BuildPageClient } from "./components/client"
import { ProdOnlyGuard } from "@/components/prod-only-guard"

export default function ClientBuildsPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProdOnlyGuard>
          <BuildPageClient />
        </ProdOnlyGuard>
      </div>
    </div>
  )
}
