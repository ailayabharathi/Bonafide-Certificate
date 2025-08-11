import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser } from "@/types";
import { showError, showSuccess } from "@/utils/toast";

const fetchTutors = async (): Promise<ManagedUser[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "tutor");

  if (error) {
    showError("Failed to fetch tutors.");
    throw new Error(error.message);
  }
  return data || [];
};

const assignTutorToStudent = async ({ studentId, tutorId }: { studentId: string; tutorId: string | null }) => {
  const { error } = await supabase
    .from("profiles")
    .update({ tutor_id: tutorId })
    .eq("id", studentId);

  if (error) {
    showError("Failed to assign tutor.");
    throw new Error(error.message);
  }
};

interface UseAssignTutorDialogLogicProps {
  student: ManagedUser | null;
  onSuccess: () => void;
}

export const useAssignTutorDialogLogic = ({ student, onSuccess }: UseAssignTutorDialogLogicProps) => {
  const { data: tutors, isLoading: isLoadingTutors } = useQuery({
    queryKey: ["tutors"],
    queryFn: fetchTutors,
    enabled: !!student,
  });

  const mutation = useMutation({
    mutationFn: assignTutorToStudent,
    onSuccess: (_, variables) => {
      const assignedTutor = tutors?.find(t => t.id === variables.tutorId);
      const tutorName = assignedTutor ? `${assignedTutor.first_name} ${assignedTutor.last_name}` : 'anyone';
      showSuccess(`Tutor ${tutorName} assigned successfully.`);
      onSuccess();
    },
  });

  const handleAssignTutor = (tutorId: string | null) => {
    if (!student) return;
    mutation.mutate({ studentId: student.id, tutorId });
  };

  return {
    tutors: tutors || [],
    isLoadingTutors,
    isAssigning: mutation.isPending,
    handleAssignTutor,
  };
};