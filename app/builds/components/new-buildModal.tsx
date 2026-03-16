"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { authService } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getApiBaseUrl } from "@/lib/api-config";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

interface NewBuildProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewBuild = ({ isOpen, onClose, onSuccess }: NewBuildProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const res = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/build/createBuild`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();

      if (res.ok && data?.success) {
        toast.success("Build created successfully! Build process started.");
        form.reset();
        onClose();
        onSuccess();
      } else {
        const errorMessage = data?.message || "Failed to create build";
        toast.error(errorMessage);
        console.error("Build creation error:", data);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong";
      toast.error(errorMessage);
      console.error("Build creation exception:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Server Build</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Build Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your build message (e.g., 'Added new features and bug fixes')"
                      rows={4}
                      {...field}
                    />
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
                {loading ? "Creating..." : "Create Build"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};