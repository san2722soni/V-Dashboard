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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  message: z.string().min(1, "Message is required").min(5, "Message must be at least 5 characters"),
  platform: z.enum(["windows", "android"], {
    errorMap: () => ({ message: "Please select a valid platform" }),
  }),
  releaseType: z.enum(["release", "development"], {
    errorMap: () => ({ message: "Please select a valid release type" }),
  }),
  buildFormat: z.enum(["apk", "aab"]).optional(),
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
      platform: "windows",
      releaseType: "release",
      buildFormat: "apk",
    },
  });

  const selectedPlatform = form.watch("platform");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const payload: Record<string, string> = {
        message: values.message,
        platform: values.platform,
        releaseType: values.releaseType,
      };

      if (values.platform === "android" && values.buildFormat) {
        payload.buildFormat = values.buildFormat;
      }

      const res = await authService.authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/clientBuild/createBuild`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok && data?.success) {
        toast.success(`Build created for ${values.platform.toUpperCase()}! Building has started in the background...`);
        form.reset();
        onClose();
        onSuccess();
      } else if (data?.message === "Client Build already in progress") {
        toast.error("A build is already in progress. Please wait for it to complete.");
      } else {
        toast.error(data?.message || "Failed to create build");
      }
    } catch (error: any) {
      console.error("Build creation error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Client Build</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="releaseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="release">Release</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPlatform === "android" && (
              <FormField
                control={form.control}
                name="buildFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Build Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select build format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apk">APK</SelectItem>
                        <SelectItem value="aab">AAB</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Build Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the changes in this build (e.g., 'Added new features and bug fixes')"
                      rows={5}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Build..." : "Create Build"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
