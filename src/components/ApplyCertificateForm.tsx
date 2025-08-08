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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { useState } from "react";

const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});

interface ApplyCertificateFormProps {
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
}

export function ApplyCertificateForm({ onSuccess, setOpen }: ApplyCertificateFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      showError("You must be logged in to apply.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("bonafide_requests").insert({
        user_id: user.id,
        reason: values.reason,
      });

      if (error) throw error;

      showSuccess("Certificate request submitted successfully!");
      onSuccess();
      setOpen(false);
    } catch (error: any) {
      showError(error.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Certificate</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., For passport application, bank loan, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}