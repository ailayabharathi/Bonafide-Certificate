import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { BonafideRequest } from "@/types";

const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});

type ApplyCertificateFormValues = z.infer<typeof formSchema>;

interface UseApplyCertificateFormLogicProps {
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
  existingRequest?: BonafideRequest | null;
}

export const useApplyCertificateFormLogic = ({ onSuccess, setOpen, existingRequest }: UseApplyCertificateFormLogicProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplyCertificateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (existingRequest) {
      form.reset({ reason: existingRequest.reason });
    } else {
      form.reset({ reason: "" });
    }
  }, [existingRequest, form]);

  async function onSubmit(values: ApplyCertificateFormValues) {
    if (!user) {
      showError("You must be logged in to apply.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (existingRequest) {
        // Update existing request
        const { error } = await supabase
          .from("bonafide_requests")
          .update({
            reason: values.reason,
            status: 'pending',
            rejection_reason: null,
          })
          .eq("id", existingRequest.id);
        
        if (error) throw error;
        showSuccess("Request updated and resubmitted successfully!");

      } else {
        // Insert new request
        const { error } = await supabase.from("bonafide_requests").insert({
          user_id: user.id,
          reason: values.reason,
        });

        if (error) throw error;
        showSuccess("Certificate request submitted successfully!");
      }
      
      onSuccess();
      setOpen(false);
    } catch (error: any) {
      showError(error.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    isSubmitting,
    onSubmit,
  };
};