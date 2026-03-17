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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";
import type { Query } from "@/lib/Types";

const ALLOWED_REDIS_COMMANDS = [
  "GET", "MGET", "HGET", "HGETALL", "HMGET",
  "KEYS", "SCAN", "SMEMBERS", "SISMEMBER",
  "LRANGE", "LLEN", "TTL", "PTTL",
  "TYPE", "EXISTS", "DBSIZE", "INFO", "SCARD",
];

const formSchema = z.object({
  // Mongo fields
  collection: z.string().optional(),
  chain: z.string().optional(),
  params: z.string().optional(),
  // Redis fields
  command: z.string().optional(),
  args: z.string().optional(),
  // Common
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
    defaultValues: {},
  });

  useEffect(() => {
    if (query && isOpen) {
      try {
        const parsed = JSON.parse(query.queryString);
        if (query.type === "mongo") {
          form.reset({
            collection: parsed.collection || "",
            chain: parsed.chain || "",
            params: parsed.params ? JSON.stringify(parsed.params, null, 2) : "[]",
            description: query.description || "",
          });
        } else {
          form.reset({
            command: parsed.command || "",
            args: parsed.args ? JSON.stringify(parsed.args, null, 2) : "[]",
            description: query.description || "",
          });
        }
      } catch {
        form.reset({ description: query.description || "" });
      }
    }
  }, [query, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!query) return;

    try {
      setLoading(true);

      let queryString: string;
      if (query.type === "mongo") {
        const mongoQuery: Record<string, unknown> = {
          collection: values.collection,
          chain: values.chain,
        };
        if (values.params && values.params.trim() !== "[]" && values.params.trim() !== "") {
          try {
            mongoQuery.params = JSON.parse(values.params);
          } catch {
            throw new Error("Params must be a valid JSON array");
          }
        } else {
          mongoQuery.params = [];
        }
        queryString = JSON.stringify(mongoQuery);
      } else {
        const redisQuery: Record<string, unknown> = {
          command: values.command,
        };
        if (values.args) {
          try { redisQuery.args = JSON.parse(values.args); } catch { throw new Error("Args must be valid JSON array"); }
        }
        queryString = JSON.stringify(redisQuery);
      }

      const response = await authService.authenticatedFetch(
        `${getApiBaseUrl()}/dashboard/query/updateQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: query._id,
            queryString,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Query
            <Badge variant="outline">{query.type === "mongo" ? "MongoDB" : "Redis"}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {query.type === "mongo" ? (
              <>
                <FormField
                  control={form.control}
                  name="collection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. developers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chain Command</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={'.find({"status": "active"}).sort({"createdAt": -1}).limit(10)'}
                          className="font-mono text-sm min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use {"<<$>>"} as placeholders for params. Example: {'.find({"email": "<<$>>"})'}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="params"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parameters (JSON Array, optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='["value1", "value2"]'
                          className="font-mono text-sm"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="command"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Command</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select command" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ALLOWED_REDIS_COMMANDS.map((cmd) => (
                            <SelectItem key={cmd} value={cmd}>
                              {cmd}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="args"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arguments (JSON Array)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='["key_name"]'
                          className="font-mono text-sm"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
