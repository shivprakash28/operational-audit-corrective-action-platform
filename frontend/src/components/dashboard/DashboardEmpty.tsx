import React from "react";
import Card, { CardContent } from "../ui/Card";
import { FolderOpen } from "lucide-react";

export const DashboardEmpty: React.FC = () => {
  return (
    <Card className="my-8 border-dashed border-2 border-slate-200 bg-slate-50/50">
      <CardContent className="p-10 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <FolderOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">
            No dashboard activity yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Audit activity, findings, and corrective action records will automatically reflect here once created in the platform.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardEmpty;
