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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments } from "@/lib/departments";
import { Profile } from "@/contexts/AuthContext";
import { useProfileFormLogic } from "@/hooks/useProfileFormLogic"; // Import the new hook
import { ManagedUser } from "@/types";

interface ProfileFormProps {
  onSuccess: () => void;
  profileToEdit?: Profile | ManagedUser; // If provided, we're in admin edit mode
}

export function ProfileForm({ onSuccess, profileToEdit }: ProfileFormProps) {
  const {
    form,
    isSubmitting,
    avatarPreview,
    handleAvatarChange,
    isUploading,
    onSubmit,
    getInitials,
    isEditingOwnProfile,
    canEditRegisterNumber,
    canEditDepartment,
    targetProfile,
    canEditSensitiveFields,
  } = useProfileFormLogic({ onSuccess, profileToEdit });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {isEditingOwnProfile && (
          <FormField
            name="avatar"
            render={() => (
              <FormItem className="flex flex-col items-center">
                <FormLabel>
                  <Avatar className="h-24 w-24 cursor-pointer">
                    <AvatarImage src={avatarPreview || undefined} alt="User avatar" />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    className="hidden"
                    id="avatar-upload"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <Button asChild variant="link">
                  <label htmlFor="avatar-upload">Change Avatar</label>
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="User's first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="User's last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="register_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Register Number</FormLabel>
              <FormControl>
                <Input placeholder="User's register number" {...field} disabled={!canEditRegisterNumber} />
              </FormControl>
              {isEditingOwnProfile && !canEditSensitiveFields && (
                <FormDescription>
                  {targetProfile?.register_number ? "This field can only be changed by an administrator." : "You can set this once. After that, only an administrator can change it."}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!canEditDepartment}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditingOwnProfile && !canEditSensitiveFields && (
                <FormDescription>
                  {targetProfile?.department ? "This field can only be changed by an administrator." : "You can set this once. After that, only an administrator can change it."}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}