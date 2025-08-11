import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const formSchema = z.object({
  emails: z.string().min(1, { message: "Please enter at least one email address." }),
  role: z.enum(["student", "tutor", "hod", "admin"]),
});

type InviteUserFormValues = z.infer<typeof formSchema>;

interface UseInviteUserDialogLogicProps {
  onOpenChange: (open: boolean) => void;
  onInviteSent: () => void;
}

export const useInviteUserDialogLogic = ({ onOpenChange, onInviteSent }: UseInviteUserDialogLogicProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: "",
      role: "student",
    },
  });

  async function onSubmit(values: InviteUserFormValues) {
    setIsSubmitting(true);
    showError("Inviting users is temporarily disabled due to a configuration issue.");
    setIsSubmitting(false);
    onOpenChange(false);
  }

  return {
    form,
    isSubmitting,
    onSubmit,
  };
};