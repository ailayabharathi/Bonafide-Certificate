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
import { BonafideRequest } from "@/types";
import { useApplyCertificateFormLogic } from "@/hooks/useApplyCertificateFormLogic"; // Import the new hook

interface ApplyCertificateFormProps {
  onSuccess: () => void;
  setOpen: (open: boolean) => void;
  existingRequest?: BonafideRequest | null;
}

export function ApplyCertificateForm({ onSuccess, setOpen, existingRequest }: ApplyCertificateFormProps) {
  const { form, isSubmitting, onSubmit } = useApplyCertificateFormLogic({ onSuccess, setOpen, existingRequest });

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
            {isSubmitting ? "Submitting..." : existingRequest ? "Update & Resubmit" : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}