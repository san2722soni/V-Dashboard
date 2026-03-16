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
import { toast } from "sonner"
import { authService } from "@/lib/auth"
import type { FeatureFlag } from "./column"
import { getApiBaseUrl } from "@/lib/api-config";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  value: z.string().min(1, "Value is required"),
})

interface UpdateFeatureFlagProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  featureFlag: FeatureFlag | null
}

export const UpdateFeatureFlag = ({ isOpen, onClose, onSuccess, featureFlag }: UpdateFeatureFlagProps) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      value: "",
    },
  })

  useEffect(() => {
    if (featureFlag) {
      form.reset({
        name: featureFlag.name,
        type: featureFlag.type,
        value: featureFlag.value,
      })
    }
  }, [featureFlag, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/featureFlag/updateFeatureFlag`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            value: values.value,
          }),
        },
      )

      if (response.ok) {
        toast.success("Feature flag updated successfully")
        form.reset()
        onClose()
        onSuccess()
      } else {
        toast.error("Failed to update feature flag")
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
          <DialogTitle>Update Feature Flag</DialogTitle>
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
                    <Input placeholder="feature_flag" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STRING">String</SelectItem>
                      <SelectItem value="BOOLEAN">Boolean</SelectItem>
                      <SelectItem value="INTEGER">Integer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="true" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Feature Flag"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
