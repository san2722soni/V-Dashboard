import { AnarchyClient } from "./components/client";

export default function AnarchyPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AnarchyClient />
      </div>
    </div>
  );
}