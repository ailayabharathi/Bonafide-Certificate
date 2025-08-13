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
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Profile } from "@/contexts/AuthContext";
import { ManagedUser } from "@/types";

const formSchema = z.object({
  role: z.enum(["student", "tutor", "hod", "admin"], {
    required_error: "Please select a role.",
  }),
});

interface EditUserRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile | ManagedUser | null;
  onRoleUpdated: () => void;
}

export function EditUserRoleDialog({ isOpen, onOpenChange, user, onRoleUpdated }: EditUserRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: user?.role || "student",
    },
    values: { // Ensure form values are always in sync with the user prop
      role: user?.role || "student",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Update user's app_metadata role in Supabase Auth
      const { data, error: authError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          app_metadata: { role: values.role },
        }
      );

      if (authError) throw authError;

      // Also update the role in the public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: values.role })
        .eq('id', user.id);

      if (profileError) throw profileError;

      showSuccess(`Role for ${user.first_name} ${user.last_name} updated to ${values.role}.`);
      onRoleUpdated();
      onOpenChange(false);
    } catch (error: any) {
      showError(error.message || "Failed to update user role.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role for {user.first_name} {user.last_name}</DialogTitle>
          <DialogDescription>
            Select a new role for this user.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="hod">HOD</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}