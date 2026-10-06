import React from "react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/date";
import { X, Wrench, AlertTriangle, User, Calendar, FileText } from "lucide-react";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";

interface CorrectiveActionDetailsModalProps {
  action: CorrectiveAction | null;
  isOpen: boolean;
  onClose: () => void;
  isOverdue?: boolean;
}

export const CorrectiveActionDetailsModal: React.FC<CorrectiveActionDetailsModalProps> = ({
  action,
  isOpen,
  onClose,
  isOverdue = false,
}) => {
  if (!isOpen || !action) return null;

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "OPEN":
        return <Badge variant="warning">Open</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="primary">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "VERIFIED":
        return <Badge variant="info">Verified</Badge>;
      case "CLOSED":
        return <Badge variant="info">Closed</Badge>;
      default:
        return <Badge variant="info">{st}</Badge>;
    }
  };

  const ownerDisplay =
    action.ownerName ||
    action.ownerEmail ||
    (action.ownerId ? `User #${action.ownerId}` : "Unassigned");

  const targetDueDate = action.dueDate || action.deadline;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Corrective Action Details #{action.id}
              </h3>
              <p className="text-xs text-slate-500">
                Remediation Plan Specifications & Progress Status
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
                Action Title
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {action.title}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Current Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(action.status)}
                {isOverdue && <Badge variant="danger">Overdue Deadline</Badge>}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" /> Action Owner
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {ownerDisplay}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Target Due Date
              </span>
              <span
                className={`text-sm font-semibold block mt-0.5 ${
                  isOverdue ? "text-rose-600" : "text-slate-800"
                }`}
              >
                {formatDate(targetDueDate)}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Created At
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {formatDate(action.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Updated At
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {formatDate(action.updatedAt)}
              </span>
            </div>
          </div>

          {/* Finding Reference */}
          {action.findingDescription && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Linked Non-Conformance Finding
              </h4>
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">
                  Finding #{action.findingId}
                </span>
                <p>{action.findingDescription}</p>
              </div>
            </div>
          )}

          {/* Action Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />
              Remediation Action Plan Description
            </h4>
            <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-sm">
              {action.description}
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

export default CorrectiveActionDetailsModal;
