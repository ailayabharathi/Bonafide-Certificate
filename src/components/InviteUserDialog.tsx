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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  emails: z.string().min(1, { message: "Please enter at least one email address." }),
  role: z.enum(["student", "tutor", "hod", "admin"]),
});

interface InviteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent: () => void;
}

export function InviteUserDialog({ isOpen, onOpenChange, onInviteSent }: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: "",
      role: "student",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

    const invitePromises = emailList.map(email =>
      supabase.functions.invoke('invite-user', {
        body: { email, role: values.role },
      })
    );

    const results = await Promise.allSettled(invitePromises);

    const successfulInvites: string[] = [];
    const failedInvites: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        successfulInvites.push(emailList[index]);
      } else {
        failedInvites.push(emailList[index]);
      }
    });

    if (successfulInvites.length > 0) {
      showSuccess(`Successfully sent ${successfulInvites.length} invitation(s).`);
    }
    if (failedInvites.length > 0) {
      showError(`Failed to send invitations to: ${failedInvites.join(', ')}.`);
    }

    if (successfulInvites.length > 0) {
      onInviteSent();
      onOpenChange(false);
      form.reset({ emails: "", role: "student" });
    }

    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Users</DialogTitle>
          <DialogDescription>
            Enter one or more email addresses and assign a role. An invitation link will be sent to each address.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emails</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="user1@example.com, user2@example.com"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate emails with commas or new lines.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitations
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}