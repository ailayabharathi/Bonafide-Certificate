import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BonafideRequestWithProfile } from "@/types";
import { exportToCsv } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface ExportButtonProps {
  data: BonafideRequestWithProfile[];
  filename: string;
}

export const ExportButton = ({ data, filename }: ExportButtonProps) => {
  const handleExport = () => {
    if (data.length === 0) {
      showError("There is no data to export.");
      return;
    }

    try {
      const flattenedData = data.map(request => ({
        id: request.id,
        student_name: `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`,
        register_number: request.profiles?.register_number || '',
        department: request.profiles?.department || '',
        reason: request.reason,
        status: request.status,
        rejection_reason: request.rejection_reason || '',
        submitted_at: new Date(request.created_at).toISOString(),
        last_updated_at: new Date(request.updated_at).toISOString(),
      }));
      exportToCsv(filename, flattenedData);
      showSuccess("Data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      showError("An error occurred during the export.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
};