import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";

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

type ProfileFormValues = z.infer<typeof formSchema>;

interface UseProfileFormLogicProps {
  onSuccess: () => void;
  profileToEdit?: Profile;
}

export const useProfileFormLogic = ({ onSuccess, profileToEdit }: UseProfileFormLogicProps) => {
  const { user, profile: currentUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const targetProfile = profileToEdit || currentUserProfile;
  const isEditingOwnProfile = !profileToEdit;
  const canEditSensitiveFields = currentUserProfile?.role === 'admin';
  const canEditRegisterNumber = canEditSensitiveFields || (isEditingOwnProfile && !targetProfile?.register_number);
  const canEditDepartment = canEditSensitiveFields || (isEditingOwnProfile && !targetProfile?.department);

  const form = useForm<ProfileFormValues>({
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

  const onSubmit = async (values: ProfileFormValues) => {
    if (!targetProfile || !user) {
      showError("User profile not found.");
      return;
    }
    setIsSubmitting(true);

    try {
      let avatarUrl = targetProfile.avatar_url;

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

      if (canEditRegisterNumber) {
        updateData.register_number = values.register_number;
      }
      if (canEditDepartment) {
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
  };

  const getInitials = () => {
    const firstName = form.getValues().first_name || '';
    const lastName = form.getValues().last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return {
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
  };
};