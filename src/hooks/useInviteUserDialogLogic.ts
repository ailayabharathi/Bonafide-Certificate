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

    const emailList = values.emails
      .split(/[\n,]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      showError("Please enter at least one valid email.");
      setIsSubmitting(false);
      return;
    }

    const invalidEmails = emailList.filter(email => !z.string().email().safeParse(email).success);
    if (invalidEmails.length > 0) {
      showError(`Invalid email format for: ${invalidEmails.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    showError("Inviting users is temporarily disabled due to a system issue.");
    setIsSubmitting(false);
  }

  return {
    form,
    isSubmitting,
    onSubmit,
  };
};