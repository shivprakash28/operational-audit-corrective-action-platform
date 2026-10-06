import React from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { formatDate } from "../../utils/date";
import { Eye, Edit2, Trash2 } from "lucide-react";
import type { Audit } from "../../pages/Audits";

interface AuditTableProps {
  audits: Audit[];
  onView: (audit: Audit) => void;
  onEdit: (audit: Audit) => void;
  onDelete: (audit: Audit) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  audits,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
        return <Badge variant="warning">Planned</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="primary">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "CLOSED":
        return <Badge variant="info">Closed</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="info">{status || "PLANNED"}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Audit Title & ID
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Planned Start
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Planned End
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Expected Completion
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map((audit) => {
                const deptDisplay =
                  audit.departmentName || `Department #${audit.departmentId}`;

                return (
                  <tr
                    key={audit.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">
                          {audit.title}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: #{audit.id}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-sm font-medium text-slate-700">
                      {deptDisplay}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(audit.status)}
                    </td>

                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {formatDate(audit.plannedStartDate)}
                    </td>

                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {formatDate(audit.plannedEndDate)}
                    </td>

                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {formatDate(audit.expectedCompletionDate)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(audit)}
                          title="View Details"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(audit)}
                          title="Edit Audit"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(audit)}
                          title="Delete Audit"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
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

export default AuditTable;
