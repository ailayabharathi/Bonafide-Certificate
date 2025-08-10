import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

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

type UpdateAuthFormValues = z.infer<typeof formSchema>;

export const useUpdateAuthFormLogic = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateAuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: UpdateAuthFormValues) {
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
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      showSuccess("Account updated successfully! Check your email to confirm the change if you updated it.");
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

  return {
    form,
    isSubmitting,
    onSubmit,
    user,
  };
};