import React from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";
import { Wrench, Calendar, User, FileSearch } from "lucide-react";
import { formatDate } from "../../utils/date";

interface VerificationActionSelectorProps {
  correctiveActions: CorrectiveAction[];
  selectedActionId: number | null;
  onSelectAction: (id: number | null) => void;
}

export const VerificationActionSelector: React.FC<VerificationActionSelectorProps> = ({
  correctiveActions,
  selectedActionId,
  onSelectAction,
}) => {
  const selectedAction = correctiveActions.find((a) => a.id === selectedActionId);

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "VERIFIED":
      case "COMPLETED":
      case "CLOSED":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "OPEN":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <Card className="bg-slate-50/80 border-slate-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Corrective Action Verification Scope</h3>
              <p className="text-xs text-slate-500">
                Filter verifications by target CAPA or view all verification requests
              </p>
            </div>
          </div>

          <div className="w-full md:w-80">
            <select
              value={selectedActionId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                onSelectAction(val ? Number(val) : null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-sm"
            >
              <option value="">All Corrective Actions ({correctiveActions.length})</option>
              {correctiveActions.map((action) => (
                <option key={action.id} value={action.id}>
                  CAPA-{action.id}: {action.title} ({action.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Action Context Card */}
        {selectedAction && (
          <div className="mt-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  CAPA #{selectedAction.id}
                </span>
                <h4 className="text-base font-semibold text-slate-900">{selectedAction.title}</h4>
              </div>
              <Badge variant={getStatusVariant(selectedAction.status)}>
                {selectedAction.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <FileSearch className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-700 block">Finding Context</span>
                  <span className="text-slate-600 line-clamp-1">
                    {selectedAction.findingDescription || `Finding #${selectedAction.findingId || "N/A"}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-700 block">Assigned Owner</span>
                  <span>{selectedAction.ownerName || selectedAction.ownerEmail || "Unassigned"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-700 block">Due Date</span>
                  <span>{formatDate(selectedAction.dueDate || selectedAction.deadline)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationActionSelector;
