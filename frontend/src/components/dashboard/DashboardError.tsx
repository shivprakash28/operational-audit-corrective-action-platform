import React from "react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DashboardErrorProps {
  onRetry: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({ onRetry }) => {
  return (
    <Card className="max-w-xl mx-auto my-12 border-rose-200 bg-rose-50/50">
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Unable to load dashboard data
          </h3>
          <p className="text-sm text-slate-600">
            A network error occurred or the system is temporarily unreachable. Please try again.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Button variant="primary" onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry Loading
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardError;
