import React from "react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import CorrectiveActionStatusControl from "./CorrectiveActionStatusControl";
import { formatDate } from "../../utils/date";
import { Eye, Edit2, AlertTriangle, User, Calendar } from "lucide-react";
import type { CorrectiveAction, CorrectiveActionStatus } from "../../pages/CorrectiveActions";

interface CorrectiveActionTableProps {
  actions: CorrectiveAction[];
  overdueIds: Set<number>;
  onView: (action: CorrectiveAction) => void;
  onEdit: (action: CorrectiveAction) => void;
  onChangeStatus: (actionId: number, newStatus: CorrectiveActionStatus) => void;
  updatingId?: number | null;
}

export const CorrectiveActionTable: React.FC<CorrectiveActionTableProps> = ({
  actions,
  overdueIds,
  onView,
  onEdit,
  onChangeStatus,
  updatingId = null,
}) => {
  const isOverdueItem = (act: CorrectiveAction) => {
    if (overdueIds.has(act.id)) return true;
    if (act.status === "COMPLETED" || act.status === "VERIFIED" || act.status === "CLOSED") {
      return false;
    }
    const targetDateStr = act.dueDate || act.deadline;
    if (!targetDateStr) return false;
    const targetDate = new Date(targetDateStr);
    return !isNaN(targetDate.getTime()) && targetDate < new Date();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Remediation Action & ID
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Finding Ref
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Audit Ref
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Target Due Date
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map((act) => {
                const isUpdating = updatingId === act.id;
                const overdue = isOverdueItem(act);

                const ownerDisplay =
                  act.ownerName ||
                  act.ownerEmail?.split("@")[0] ||
                  (act.ownerId ? `User #${act.ownerId}` : "Unassigned");

                const findingDisplay =
                  act.findingDescription ||
                  (act.findingId ? `Finding #${act.findingId}` : "N/A");

                const targetDate = act.dueDate || act.deadline;

                return (
                  <tr
                    key={act.id}
                    className={`transition-colors ${
                      overdue ? "bg-rose-50/30 hover:bg-rose-50/60" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {act.title}
                          </span>
                          {overdue && (
                            <Badge variant="danger" size="sm">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          CAPA ID: #{act.id}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 max-w-xs">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate" title={findingDisplay}>
                          {findingDisplay}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                      {act.auditId ? `Audit #${act.auditId}` : "N/A"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{ownerDisplay}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className={overdue ? "font-bold text-rose-600" : ""}>
                          {formatDate(targetDate)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <CorrectiveActionStatusControl
                        status={act.status}
                        onChangeStatus={(st) => onChangeStatus(act.id, st)}
                        disabled={isUpdating}
                      />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(act)}
                          title="View Details"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(act)}
                          title="Edit Action"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrectiveActionTable;
