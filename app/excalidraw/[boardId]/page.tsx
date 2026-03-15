import { ExcalidrawEditor } from "./components/excalidraw-editor"

export default function ExcalidrawEditorPage({
  params,
}: {
  params: { boardId: string }
}) {
  return (
    <div className="flex-col h-[calc(100vh-64px)]">
      <ExcalidrawEditor boardId={params.boardId} />
    </div>
  )
}
