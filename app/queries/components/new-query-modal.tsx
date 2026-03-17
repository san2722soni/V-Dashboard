"use client";

import { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";
import { authService } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-config";

const ALLOWED_REDIS_COMMANDS = [
  "GET", "MGET", "HGET", "HGETALL", "HMGET",
  "KEYS", "SCAN", "SMEMBERS", "SISMEMBER",
  "LRANGE", "LLEN", "TTL", "PTTL",
  "TYPE", "EXISTS", "DBSIZE", "INFO", "SCARD",
];

const mongoFormSchema = z.object({
  type: z.literal("mongo"),
  collection: z.string().min(1, "Collection is required"),
  chain: z.string().min(1, "Chain command is required"),
  params: z.string().optional(),
  description: z.string().optional(),
});

const redisFormSchema = z.object({
  type: z.literal("redis"),
  command: z.string().min(1, "Command is required"),
  args: z.string().optional(),
  description: z.string().optional(),
});

const formSchema = z.discriminatedUnion("type", [mongoFormSchema, redisFormSchema]);

interface NewQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: "mongo" | "redis";
}

export const NewQueryModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = "mongo",
}: NewQueryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cmdSearch, setCmdSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultType,
      ...(defaultType === "mongo"
        ? { collection: "", chain: "", params: "[]", description: "" }
        : { command: "", args: "[]", description: "" }),
    },
  });

  // Reset form when modal opens or tab type changes
  useEffect(() => {
    if (isOpen) {
      setCmdSearch("");
      if (defaultType === "mongo") {
        form.reset({
          type: "mongo",
          collection: "",
          chain: "",
          params: "[]",
          description: "",
        });
      } else {
        form.reset({
          type: "redis",
          command: "",
          args: "[]",
          description: "",
        });
      }
    }
  }, [isOpen, defaultType, form]);

  const filteredCommands = useMemo(() => {
    if (!cmdSearch.trim()) return ALLOWED_REDIS_COMMANDS;
    return ALLOWED_REDIS_COMMANDS.filter((cmd) =>
      cmd.toLowerCase().includes(cmdSearch.toLowerCase())
    );
  }, [cmdSearch]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      let queryString: string;
      if (values.type === "mongo") {
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
        `${getApiBaseUrl()}/dashboard/query/createQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: values.type,
            queryString,
            description: values.description || "",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("Query created successfully");
          form.reset();
          onClose();
          onSuccess();
        } else {
          toast.error(result.message || "Failed to create query");
        }
      } else {
        toast.error("Failed to create query");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create New {defaultType === "mongo" ? "MongoDB" : "Redis"} Query
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {defaultType === "mongo" ? (
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
                      <div className="space-y-2">
                        <Input
                          placeholder="Search commands..."
                          value={cmdSearch}
                          onChange={(e) => setCmdSearch(e.target.value)}
                        />
                        <div className="border rounded-md max-h-[150px] overflow-y-auto">
                          {filteredCommands.length > 0 ? (
                            filteredCommands.map((cmd) => (
                              <button
                                key={cmd}
                                type="button"
                                className={`w-full text-left px-3 py-2 text-sm font-mono hover:bg-muted transition-colors ${
                                  field.value === cmd ? "bg-muted font-semibold" : ""
                                }`}
                                onClick={() => {
                                  field.onChange(cmd);
                                  setCmdSearch("");
                                }}
                              >
                                {cmd}
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-2 text-sm text-muted-foreground">No commands found</p>
                          )}
                        </div>
                        {field.value && (
                          <p className="text-xs text-muted-foreground">
                            Selected: <span className="font-mono font-semibold">{field.value}</span>
                          </p>
                        )}
                      </div>
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
                {loading ? "Creating..." : "Create Query"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
