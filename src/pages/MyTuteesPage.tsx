import { StudentListView } from "@/components/StudentListView";

const MyTuteesPage = () => {
  return (
    <StudentListView 
      title="My Tutees"
      description="A list of all students assigned to you as their tutor."
      fetchMode="tutees"
    />
  );
};

export default MyTuteesPage;