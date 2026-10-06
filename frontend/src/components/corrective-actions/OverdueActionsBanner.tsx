import React from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { AlertCircle, Clock } from "lucide-react";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";

interface OverdueActionsBannerProps {
  overdueActions: CorrectiveAction[];
  onFilterOverdue: () => void;
}

export const OverdueActionsBanner: React.FC<OverdueActionsBannerProps> = ({
  overdueActions,
  onFilterOverdue,
}) => {
  if (overdueActions.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/60">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              ⚠️ {overdueActions.length} Corrective Action(s) Overdue
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Remediation deadlines have expired for active corrective action plans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge variant="danger" size="md">
            Action Required
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterOverdue}
            className="text-xs bg-white hover:bg-amber-100 text-amber-900 border-amber-300 gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            View Overdue Actions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverdueActionsBanner;
