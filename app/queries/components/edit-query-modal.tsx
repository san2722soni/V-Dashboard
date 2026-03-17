"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";
import type { Query } from "@/lib/Types";

const formSchema = z.object({
  command: z.string().min(1, "Command is required"),
  description: z.string().optional(),
});

interface EditQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  query: Query | null;
}

export const EditQueryModal = ({
  isOpen,
  onClose,
  onSuccess,
  query,
}: EditQueryModalProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { command: "", description: "" },
  });

  useEffect(() => {
    if (query && isOpen) {
      try {
        const parsed = JSON.parse(query.queryString);
        form.reset({
          command: parsed.command || "",
          description: query.description || "",
        });
      } catch {
        form.reset({ command: query.queryString || "", description: query.description || "" });
      }
    }
  }, [query, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!query) return;

    try {
      setLoading(true);

      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/query/updateQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: query._id,
            queryString: JSON.stringify({ command: values.command }),
            description: values.description || "",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("Query updated successfully");
          onClose();
          onSuccess();
        } else {
          toast.error(result.message || "Failed to update query");
        }
      } else {
        toast.error("Failed to update query");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!query) return null;

  const isMongo = query.type === "mongo";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Query
            <Badge variant="outline">{isMongo ? "MongoDB" : "Redis"}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="command"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Command</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isMongo
                          ? "developers.find({}).sort({createdAt: -1}).limit(10)"
                          : "DBSIZE"
                      }
                      className="font-mono text-sm min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  {isMongo && (
                    <p className="text-xs text-muted-foreground">
                      Format: <span className="font-mono">collectionName.method(args)...</span>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="What does this query do?" {...field} />
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
                {loading ? "Updating..." : "Update Query"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};