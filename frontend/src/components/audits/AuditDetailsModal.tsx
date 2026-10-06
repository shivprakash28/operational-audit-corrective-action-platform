import React from "react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { formatDate } from "../../utils/date";
import { X, ClipboardList, Calendar, Building, FileText, User } from "lucide-react";
import type { Audit } from "../../pages/Audits";

interface AuditDetailsModalProps {
  audit: Audit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({
  audit,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !audit) return null;

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

  const deptDisplay =
    audit.departmentName || `Department #${audit.departmentId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Audit Details #{audit.id}
              </h3>
              <p className="text-xs text-slate-500">
                View complete operational audit specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Header Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Audit Title
              </span>
              <span className="text-base font-bold text-slate-900 block mt-0.5">
                {audit.title}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Status
              </span>
              <div className="mt-1">{getStatusBadge(audit.status)}</div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Building className="h-3.5 w-3.5" /> Department
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {deptDisplay}
              </span>
            </div>

            {audit.createdByName && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Created By
                </span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                  {audit.createdByName}
                </span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
                Scope
              </h4>
              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {audit.scope || "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                Objectives
              </h4>
              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {audit.objectives || "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-purple-600" />
                Criteria
              </h4>
              <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {audit.criteria || "N/A"}
              </p>
            </div>
          </div>

          {/* Schedule Dates Grid */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-600" />
              Schedule & Dates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">Planned Start</span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                  {formatDate(audit.plannedStartDate)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">Planned End</span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                  {formatDate(audit.plannedEndDate)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">Expected Completion</span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                  {formatDate(audit.expectedCompletionDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditDetailsModal;
