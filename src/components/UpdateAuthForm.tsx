import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).refine((data) => {
  if (!data.email && !data.password) {
    return false; // At least one field must be provided
  }
  return true;
}, {
  message: "Please enter an email or a new password.",
  path: ["email"],
});

export function UpdateAuthForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updates: { email?: string; password?: string } = {};
      if (values.email && values.email !== user?.email) {
        updates.email = values.email;
      }
      if (values.password) {
        updates.password = values.password;
      }

      if (Object.keys(updates).length === 0) {
        showError("No changes detected. Please enter a new email or password.");
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      showSuccess("Account updated successfully! Check your email to confirm new email if changed.");
      form.reset({
        email: values.email || user?.email || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      showError(error.message || "Failed to update account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormDescription>
                If you change your email, you will receive a confirmation link.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Leave blank to keep current" {...field} />
              </FormControl>
              <FormDescription>
                Minimum 6 characters. Leave blank if you don't want to change it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Account
          </Button>
        </div>
      </form>
    </Form>
  );
}