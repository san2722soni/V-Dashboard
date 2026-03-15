"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NodeModalProps {
  isOpen: boolean;
  node: any | null;
  onClose: () => void;
}

/**
 * Modal component displaying detailed node information
 * Shows detailed description, functions, and category
 */
export default function NodeModal({ isOpen, node, onClose }: NodeModalProps) {
  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl flex flex-col bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{node.emoji}</span>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {node.title}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{node.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-700">
                  {node.category}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-5 py-4">
            {/* Overview Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                Overview
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {node.detailedDescription || node.description}
              </p>
            </div>

            {node.content && (
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Architecture Details
                </h3>
                <div className="bg-gray-50 rounded border border-gray-200 p-3">
                  <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words leading-relaxed">
                    {node.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Functions Section */}
            {node.functions && node.functions.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Functions Called ({node.functions.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {node.functions.map((func: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <code className="font-mono text-sm font-semibold text-gray-800 break-all">
                        {func}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
