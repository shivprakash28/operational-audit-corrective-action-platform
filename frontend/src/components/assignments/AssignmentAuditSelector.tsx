import React from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/date";
import { ClipboardList, Building, Calendar } from "lucide-react";
import type { Audit } from "../../pages/Assignments";

interface AssignmentAuditSelectorProps {
  audits: Audit[];
  selectedAuditId: string;
  onSelectAudit: (auditId: string) => void;
  selectedAudit: Audit | null;
}

export const AssignmentAuditSelector: React.FC<AssignmentAuditSelectorProps> = ({
  audits,
  selectedAuditId,
  onSelectAudit,
  selectedAudit,
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
    <Card className="bg-white border-slate-200">
      <CardContent className="p-5 space-y-4">
        {/* Dropdown Audit Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label
            htmlFor="auditSelect"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
          >
            <ClipboardList className="h-4 w-4 text-blue-600" />
            Select Target Audit:
          </label>
          <select
            id="auditSelect"
            value={selectedAuditId}
            onChange={(e) => onSelectAudit(e.target.value)}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 sm:max-w-md w-full"
          >
            <option value="">-- Choose an Audit --</option>
            {audits.map((audit) => (
              <option key={audit.id} value={audit.id.toString()}>
                #{audit.id} — {audit.title}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Audit Information Card */}
        {selectedAudit && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Audit Title
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {selectedAudit.title}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                Department
              </span>
              <span className="text-sm font-semibold text-slate-700 block mt-0.5">
                {selectedAudit.departmentName || `Department #${selectedAudit.departmentId}`}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Status
              </span>
              <div className="mt-0.5">
                {getStatusBadge(selectedAudit.status)}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Planned Schedule
              </span>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">
                {formatDate(selectedAudit.plannedStartDate)} — {formatDate(selectedAudit.plannedEndDate)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentAuditSelector;
