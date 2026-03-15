// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Copy, Download } from "lucide-react";
// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { authService } from "@/lib/auth";
// import type { Build } from "./column";

// interface BuildModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   build: Build | null;
// }

// export const LogsModal = ({ isOpen, onClose, build }: BuildModalProps) => {
//   const [logs, setLogs] = useState<string>("");
//   const [filteredLogs, setFilteredLogs] = useState<string>("");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen && build) {
//       fetchLogs();
//     }
//   }, [isOpen, build]);

//   const fetchLogs = async () => {
//     if (!build) return;

//     try {
//       setLoading(true);
//       const response = await authService.authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/build/getLogs`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ buildId: build._id }),
//         }
//       );

//       if (response.ok) {
//         const result = await response.json();
//         const text = result.data?.logs || "No logs available";
//         setLogs(text);
//         setFilteredLogs(text);
//       } else {
//         toast.error("Failed to fetch logs");
//       }
//     } catch (error) {
//       toast.error("Error fetching logs");
//       console.error("Log fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(logs);
//     toast.success("Logs copied");
//   };

//   const handleDownload = () => {
//     const blob = new Blob([logs], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `build-${build?.version}-logs.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleSearch = (value: string) => {
//     setSearch(value);

//     if (!value.trim()) {
//       setFilteredLogs(logs);
//       return;
//     }

//     const filtered = logs
//       .split("\n")
//       .filter((line) => line.toLowerCase().includes(value.toLowerCase()))
//       .join("\n");

//     setFilteredLogs(filtered || "No matching results...");
//   };

//   if (!build) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent
//         className="max-w-5xl w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl"
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center border-b px-4 py-3 bg-white">
//           <DialogTitle className="text-lg font-semibold">
//             Logs — {build.version}
//           </DialogTitle>

//           <div className="flex gap-2">
//             <input
//               placeholder="Search logs..."
//               value={search}
//               onChange={(e) => handleSearch(e.target.value)}
//               className="border rounded-md px-2 py-1 text-sm"
//             />

//             <Button variant="outline" size="sm" onClick={handleCopy}>
//               <Copy className="h-4 w-4 mr-1" /> Copy
//             </Button>

//             <Button variant="outline" size="sm" onClick={handleDownload}>
//               <Download className="h-4 w-4 mr-1" /> Download
//             </Button>
//           </div>
//         </div>

//         {/* Logs Section */}
//         <div className="bg-gray-50 w-full h-full overflow-auto p-4 font-mono text-sm leading-relaxed">
//           {loading ? (
//             <div className="flex items-center justify-center h-[60vh]">
//               <div className="animate-spin h-6 w-6 border-b-2 border-gray-600 rounded-full" />
//             </div>
//           ) : (
//             <pre className="whitespace-pre-wrap break-words text-gray-800">
//               {filteredLogs}
//             </pre>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };


"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import type { Build } from "./column";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: Build | null;
}

export const LogsModal = ({ isOpen, onClose, build }: BuildModalProps) => {
  const [logs, setLogs] = useState<string>("");
  const [filteredLogs, setFilteredLogs] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && build) {
      fetchLogs();
    }
  }, [isOpen, build]);

  const fetchLogs = async () => {
    if (!build) return;

    try {
      setLoading(true);
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/build/getLogs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buildId: build._id }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.logs) {
          const text = result.data.logs;
          setLogs(text);
          setFilteredLogs(text);
        } else {
          const message = result.message || "No logs available";
          setLogs(message);
          setFilteredLogs(message);
          toast.info(message);
        }
      } else {
        const errorText = await response.text();
        toast.error("Failed to fetch logs");
        console.error("Log fetch error:", errorText);
        setLogs("Failed to fetch logs");
        setFilteredLogs("Failed to fetch logs");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error fetching logs";
      toast.error(errorMessage);
      console.error("Log fetch error:", error);
      setLogs(errorMessage);
      setFilteredLogs(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    toast.success("Logs copied");
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `build-${build?.version}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs
      .split("\n")
      .filter((line) => line.toLowerCase().includes(value.toLowerCase()))
      .join("\n");

    setFilteredLogs(filtered || "No matching results...");
  };

  if (!build) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl bg-[#202020] border-gray-800 flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 px-4 py-3 bg-[#202020] flex-shrink-0">
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold text-white" style={{ fontFamily: "JetBrains Mono" }}>
              Logs — {build.version}
            </DialogTitle>
          </div>

          <div className="flex gap-2 items-center">
            <input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="border border-gray-600 rounded-md px-2 py-1 text-sm bg-gray-800 text-gray-100 placeholder-gray-500"
              style={{ fontFamily: "JetBrains Mono" }}
            />

            <Button variant="outline" size="sm" onClick={handleCopy} className="border-gray-600 text-gray-100 hover:bg-gray-800 hover:text-white bg-transparent">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>

            <Button variant="outline" size="sm" onClick={handleDownload} className="border-gray-600 text-gray-100 hover:bg-gray-800 hover:text-white bg-transparent">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-[#202020] w-full flex-1 overflow-y-auto p-4 text-sm leading-relaxed" style={{ fontFamily: "JetBrains Mono" }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-6 w-6 border-b-2 border-gray-400 rounded-full" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-gray-300">
              {filteredLogs}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
