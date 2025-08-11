import { StudentListView } from "@/components/StudentListView";
import { useAuth } from "@/contexts/AuthContext";

const DepartmentStudentsPage = () => {
  const { profile } = useAuth();
  const description = `A list of all students in the ${profile?.department || 'N/A'} department.`;

  return (
    <StudentListView 
      title="Department Students"
      description={description}
    />
  );
};

export default DepartmentStudentsPage;