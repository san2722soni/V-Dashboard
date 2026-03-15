// // "use client";

// // import { Plus } from "lucide-react";
// // import { useEffect, useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import { DataTable } from "@/components/ui/data-table";
// // import Heading from "@/components/ui/heading";
// // import { Separator } from "@/components/ui/separator";
// // import { columns } from "./column";
// // import { DeveloperModal } from "./developer-modal";
// // import { NewDeveloperModal } from "./new-developer";
// // import { authService } from "@/lib/auth";
// // import { useRouter } from "next/navigation";
// // import { ApiList } from "@/components/ui/api-list";

// // export const DeveloperClient = () => {
// //   const router = useRouter();

// //   const [data, setData] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [isNewModalOpen, setIsNewModalOpen] = useState(false);
// //   const [selectedDeveloper, setSelectedDeveloper] = useState(null);
// //   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

// //   const fetchDevelopers = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await authService.authenticatedFetch(
// //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/developers`
// //       );
// //       if (response.ok) {
// //         const developers = await response.json();
// //         setData(developers);
// //       }
// //     } catch (error) {
// //       console.error("Failed to fetch developers:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (authService.getCurrentUser()?.role !== "admin") {
// //       router.push("/");
// //     }

// //     fetchDevelopers();
// //   }, [router]);

// //   const handleViewDetails = (developer: any) => {
// //     setSelectedDeveloper(developer);
// //     setIsDetailModalOpen(true);
// //   };

// //   const columnsWithActions = columns(handleViewDetails);

// //   return (
// //     <>
// //       <div className="flex items-center justify-between">
// //         <Heading
// //           title={`Developers (${data.length})`}
// //           description="Manage developers"
// //         />
// //         <Button onClick={() => setIsNewModalOpen(true)}>
// //           <Plus className="mr-2 h-4 w-4" /> Add New
// //         </Button>
// //       </div>
// //       <Separator />
// //       <DataTable searchKey="email" columns={columnsWithActions} data={data} />

// //       <NewDeveloperModal
// //         isOpen={isNewModalOpen}
// //         onClose={() => setIsNewModalOpen(false)}
// //         onSuccess={fetchDevelopers}
// //       />

// //       <DeveloperModal
// //         isOpen={isDetailModalOpen}
// //         onClose={() => setIsDetailModalOpen(false)}
// //         developer={selectedDeveloper}
// //       />
// //       {/* <ApiList
// //         entityName="developers"
// //         entityIdName="developerId"
// //         router="/dashboard"
// //       /> */}
// //     </>
// //   );
// // };

// "use client";

// import { Plus } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { DataTable } from "@/components/ui/data-table";
// import Heading from "@/components/ui/heading";
// import { Separator } from "@/components/ui/separator";
// import { columns } from "./column";
// import { DeveloperModal } from "./developer-modal";
// import { NewDeveloperModal } from "./new-developer";
// import { EditDeveloperModal } from "./edit-developer";
// import { authService } from "@/lib/auth";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import type { Developer } from "./column";

// export const DeveloperClient = () => {
//   const router = useRouter();

//   const [data, setData] = useState<Developer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isNewModalOpen, setIsNewModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
//     null
//   );
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

//   const fetchDevelopers = async () => {
//     try {
//       setLoading(true);
//       const response = await authService.authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/developer/getDevelopers`,
//         {
//           method: "POST",
//           headers : {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({}),
//         }
//       );
//       if (response.ok) {
//         const developers = await response?.data.json();
//         setData(developers);
//       }
//     } catch (error) {
//       console.error("Failed to fetch developers:", error);
//       toast.error("Failed to fetch developers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (authService.getCurrentUser()?.role !== "admin") {
//       router.push("/");
//     }

//     fetchDevelopers();
//   }, [router]);

//   const handleViewDetails = (developer: Developer) => {
//     setSelectedDeveloper(developer);
//     setIsDetailModalOpen(true);
//   };

//   const handleEdit = (developer: Developer) => {
//     setSelectedDeveloper(developer);
//     setIsEditModalOpen(true);
//   };

//   const handleDelete = async (developerId: string) => {
//     if (!confirm("Are you sure you want to delete this developer?")) return;

//     try {
//       const response = await authService.authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/developer/deleteDeveloper`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ developerId }),
//         }
//       );

//       if (response.ok) {
//         toast.success("Developer deleted successfully");
//         fetchDevelopers();
//       } else {
//         toast.error("Failed to delete developer");
//       }
//     } catch (error) {
//       toast.error("Something went wrong");
//     }
//   };

//   const columnsWithActions = columns(
//     handleViewDetails,
//     handleEdit,
//     handleDelete
//   );

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <Heading
//           title={`Developers (${data.length})`}
//           description="Manage developers"
//         />
//         <Button onClick={() => setIsNewModalOpen(true)}>
//           <Plus className="mr-2 h-4 w-4" /> Add New
//         </Button>
//       </div>
//       <Separator />
//       <DataTable searchKey="email" columns={columnsWithActions} data={data} />

//       <NewDeveloperModal
//         isOpen={isNewModalOpen}
//         onClose={() => setIsNewModalOpen(false)}
//         onSuccess={fetchDevelopers}
//       />

//       <EditDeveloperModal
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         onSuccess={fetchDevelopers}
//         developer={selectedDeveloper}
//       />

//       <DeveloperModal
//         isOpen={isDetailModalOpen}
//         onClose={() => setIsDetailModalOpen(false)}
//         developer={selectedDeveloper}
//       />
//     </>
//   );
// };

"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "./column";
import { DeveloperModal } from "./developer-modal";
import { NewDeveloperModal } from "./new-developer";
import { EditDeveloperModal } from "./edit-developer";
import { authService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Developer } from "./column";

export const DeveloperClient = () => {
  const router = useRouter();

  const [data, setData] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);

      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/developer/getDevelopers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          setData(result.data || []); 
        } else {
          toast.error(result.message || "Failed to fetch developers");
        }
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        toast.error("Failed to fetch developers");
      }
    } catch (error) {
      console.error("Failed to fetch developers:", error);
      toast.error("Failed to fetch developers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is admin
    const currentUser = authService.getCurrentUser();

    if (currentUser?.role !== "admin") {
      router.push("/");
      return;
    }

    fetchDevelopers();
  }, [router]);

  const handleViewDetails = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (developerId: string) => {
    if (!confirm("Are you sure you want to delete this developer?")) return;

    try {
      const response = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/developer/deleteDeveloper`,
        {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: developerId }), // ✅ FIXED: Use 'id' not 'developerId'
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("Developer deleted successfully");
          fetchDevelopers();
        } else {
          toast.error(result.message || "Failed to delete developer");
        }
      } else {
        toast.error("Failed to delete developer");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const columnsWithActions = columns(handleViewDetails, handleEdit, handleDelete);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Developers (${data.length})`}
          description="Manage developers"
        />
        <Button onClick={() => setIsNewModalOpen(true)} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" /> 
          {loading ? "Loading..." : "Add New"}
        </Button>
      </div>
      <Separator />
      <DataTable 
        searchKey="email" 
        columns={columnsWithActions} 
        data={data} 
        // loading={loading}
      />

      <NewDeveloperModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchDevelopers}
      />

      <EditDeveloperModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchDevelopers}
        developer={selectedDeveloper}
      />

      <DeveloperModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        developer={selectedDeveloper}
      />
    </>
  );
};