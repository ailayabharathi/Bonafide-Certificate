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
import { useAuth, Profile } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments } from "@/lib/departments"; // Import the departments list

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  register_number: z.string().optional(),
  department: z.string().optional(),
});

interface ProfileFormProps {
  onSuccess: () => void;
  profileToEdit?: Profile; // If provided, we're in admin edit mode
}

export function ProfileForm({ onSuccess, profileToEdit }: ProfileFormProps) {
  const { user, profile: currentUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Determine which profile we are working with and who is editing.
  const targetProfile = profileToEdit || currentUserProfile;
  const isEditingOwnProfile = !profileToEdit;
  
  // Sensitive fields can only be edited by an administrator.
  const canEditSensitiveFields = currentUserProfile?.role === 'admin';
  
  // Allow user to edit if they are admin OR if the field is currently empty
  const canUserEditRegisterNumber = canEditSensitiveFields || !targetProfile?.register_number;
  const canUserEditDepartment = canEditSensitiveFields || !targetProfile?.department;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      register_number: "",
      department: "",
    },
  });

  useEffect(() => {
    if (targetProfile) {
      form.reset({
        first_name: targetProfile.first_name || "",
        last_name: targetProfile.last_name || "",
        register_number: targetProfile.register_number || "",
        department: targetProfile.department || "",
      });
      if (targetProfile.avatar_url) {
        setAvatarPreview(targetProfile.avatar_url);
      }
    }
  }, [targetProfile, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!targetProfile || !user) {
      showError("User profile not found.");
      return;
    }
    setIsSubmitting(true);

    try {
      let avatarUrl = targetProfile.avatar_url;

      // Avatar can only be changed by the user themselves
      if (avatarFile && isEditingOwnProfile) {
        setIsUploading(true);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar.${fileExt}`;
        const filePath = `${targetProfile.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        avatarUrl = publicUrl;
        setIsUploading(false);
      }

      const updateData: { [key: string]: any } = {
        first_name: values.first_name,
        last_name: values.last_name,
        avatar_url: avatarUrl,
      };

      // Only update if the user is allowed to edit or if it's an admin
      if (canUserEditRegisterNumber) {
        updateData.register_number = values.register_number;
      }
      if (canUserEditDepartment) {
        updateData.department = values.department;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", targetProfile.id);

      if (updateError) throw updateError;

      showSuccess("Profile updated successfully!");
      onSuccess();
    } catch (error: any) {
      showError(error.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  const getInitials = () => {
    const firstName = form.getValues().first_name || '';
    const lastName = form.getValues().last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

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
                <Input placeholder="User's register number" {...field} disabled={!canUserEditRegisterNumber} />
              </FormControl>
              {!canEditSensitiveFields && !canUserEditRegisterNumber && <FormDescription>This field can only be changed by an administrator.</FormDescription>}
              {!canEditSensitiveFields && canUserEditRegisterNumber && <FormDescription>You can set this once. After that, only an administrator can change it.</FormDescription>}
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
              <Select onValueChange={field.onChange} value={field.value} disabled={!canUserEditDepartment}>
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
              {!canEditSensitiveFields && !canUserEditDepartment && <FormDescription>This field can only be changed by an administrator.</FormDescription>}
              {!canEditSensitiveFields && canUserEditDepartment && <FormDescription>You can set this once. After that, only an administrator can change it.</FormDescription>}
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