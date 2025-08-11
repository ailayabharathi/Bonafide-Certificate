import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
}

export const ExportButton = ({ onExport, isExporting }: ExportButtonProps) => {
  return (
    <Button variant="outline" size="sm" onClick={onExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
};