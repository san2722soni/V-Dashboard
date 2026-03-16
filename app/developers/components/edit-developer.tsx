"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/lib/auth"
import type { Developer } from "./column"
import { getApiBaseUrl } from "@/lib/api-config";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  gender: z.string().min(1, "Gender is required"),
  permission: z.string().min(1, "Permission is required"),
  access: z.array(z.string()),
  isAdmin: z.boolean().default(false),
})

interface EditDeveloperModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  developer: Developer | null
}

export const EditDeveloperModal = ({ isOpen, onClose, onSuccess, developer }: EditDeveloperModalProps) => {
  const [loading, setLoading] = useState(false)
  const [accessInput, setAccessInput] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      gender: "",
      permission: "",
      access: [],
      isAdmin: false,
    },
  })

  useEffect(() => {
    if (developer && isOpen) {
      form.reset({
        name: developer.profile?.name || "",
        role: developer.profile?.role || "",
        gender: developer.profile?.gender || "",
        permission: developer.profile?.permissions || "",
        access: developer.access || [],
        isAdmin: developer.isAdmin,
      })
    }
  }, [developer, isOpen, form])

  const addAccess = () => {
    if (accessInput.trim()) {
      const currentAccess = form.getValues("access")
      if (!currentAccess.includes(accessInput.trim())) {
        form.setValue("access", [...currentAccess, accessInput.trim()])
        setAccessInput("")
      } else {
        toast.error("Access level already added")
      }
    }
  }

  const removeAccess = (access: string) => {
    const currentAccess = form.getValues("access")
    form.setValue("access", currentAccess.filter((a) => a !== access))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!developer) return

    try {
      setLoading(true)

      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/developer/updateDeveloper`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: developer._id, // ✅ Backend expects 'id' not 'developerId'
            name: values.name,
            role: values.role,
            gender: values.gender,
            permission: values.permission, // ✅ Single string, not array
            access: values.access,
            isAdmin: values.isAdmin,
          }),
        },
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success("Developer updated successfully")
          onClose()
          onSuccess()
        } else {
          toast.error(result.message || "Failed to update developer")
        }
      } else {
        toast.error("Failed to update developer")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Developer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Full-Stack">Full Stack</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Create">Create</SelectItem>
                      <SelectItem value="Read">Read</SelectItem>
                      <SelectItem value="Update">Update</SelectItem>
                      <SelectItem value="Delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="access"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Levels</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter access level"
                        value={accessInput}
                        onChange={(e) => setAccessInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addAccess()
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addAccess}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((access) => (
                        <Badge key={access} variant="secondary" className="flex items-center gap-1">
                          {access}
                          <button
                            type="button"
                            onClick={() => removeAccess(access)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Admin Access</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Developer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}