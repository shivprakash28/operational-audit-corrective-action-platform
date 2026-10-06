import React from "react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/date";
import { X, AlertTriangle, FileText, User, Building, Calendar } from "lucide-react";
import type { Finding } from "../../pages/Findings";

interface FindingDetailsModalProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FindingDetailsModal: React.FC<FindingDetailsModalProps> = ({
  finding,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !finding) return null;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return <Badge variant="danger">CRITICAL</Badge>;
      case "MAJOR":
        return <Badge variant="warning">MAJOR</Badge>;
      case "MINOR":
        return <Badge variant="primary">MINOR</Badge>;
      default:
        return <Badge variant="info">{sev}</Badge>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "OPEN":
        return <Badge variant="warning">Open</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="primary">In Progress</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="info">Closed</Badge>;
      default:
        return <Badge variant="info">{st}</Badge>;
    }
  };

  const deptDisplay =
    finding.responsibleDepartmentName ||
    `Department #${finding.responsibleDepartmentId}`;

  const ownerDisplay =
    finding.ownerName ||
    finding.ownerEmail ||
    (finding.ownerId ? `User #${finding.ownerId}` : "Unassigned");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Finding #{finding.id}
              </h3>
              <p className="text-xs text-slate-500">
                Audit Non-Conformance & Risk Specification
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Target Audit
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {finding.auditTitle || `Audit #${finding.auditId}`}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Classification & Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                {getSeverityBadge(finding.severity)}
                {getStatusBadge(finding.status)}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" /> Responsible Dept
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {deptDisplay}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" /> Assigned Owner
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {ownerDisplay}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Created At
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {formatDate(finding.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Updated At
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {formatDate(finding.updatedAt)}
              </span>
            </div>
          </div>

          {/* Linked Observation */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />
              Source Observation Reference
            </h4>
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">
                Observation #{finding.observationId}
              </span>
              <p>{finding.observationDescription || "N/A"}</p>
            </div>
          </div>

          {/* Finding Detailed Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Finding Description & Non-Conformance Details
            </h4>
            <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-sm">
              {finding.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindingDetailsModal;
