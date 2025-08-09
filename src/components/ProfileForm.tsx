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
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2 } from "lucide-react";

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
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      register_number: profile?.register_number || "",
      department: profile?.department || "",
    },
  });

  useEffect(() => {
    if (profile) {
        form.reset({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            register_number: profile.register_number || "",
            department: profile.department || "",
        });
        if (profile.avatar_url) {
            setAvatarPreview(profile.avatar_url);
        }
    }
  }, [profile, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      showError("You must be logged in to update your profile.");
      return;
    }
    setIsSubmitting(true);

    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        setIsUploading(true);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: files, error: listError } = await supabase.storage
          .from('avatars')
          .list(user.id);
        
        if (listError) console.error("Error listing old avatars:", listError);

        if (files && files.length > 0) {
            const filesToRemove = files.map(file => `${user.id}/${file.name}`);
            const { error: removeError } = await supabase.storage
                .from('avatars')
                .remove(filesToRemove);
            if (removeError) console.error("Error removing old avatars:", removeError);
        }

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

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          avatar_url: avatarUrl,
          register_number: values.register_number,
          department: values.department,
        })
        .eq("id", user.id);

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

  const isStudent = profile?.role === 'student';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Your first name" {...field} />
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
                <Input placeholder="Your last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isStudent ? (
          <>
            <FormItem>
              <FormLabel>Register Number</FormLabel>
              <FormControl>
                <Input disabled value={profile?.register_number || 'Not set'} />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input disabled value={profile?.department || 'Not set'} />
              </FormControl>
            </FormItem>
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="register_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your register number" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input placeholder="Your department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
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