import { WhitelistClient } from "./components/client"

export default function Page() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <WhitelistClient />
      </div>
    </div>
  )
}
