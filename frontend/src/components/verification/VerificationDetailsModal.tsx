import React from "react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import type { VerificationItem } from "./VerificationStats";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";
import { X, Calendar, User, FileCheck, CheckCircle2, XCircle, Wrench, MessageSquare } from "lucide-react";
import { formatDate } from "../../utils/date";

interface VerificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationItem | null;
  correctiveActions: CorrectiveAction[];
  onApprove: (item: VerificationItem) => void;
  onReject: (item: VerificationItem) => void;
  isActionLoading: boolean;
}

export const VerificationDetailsModal: React.FC<VerificationDetailsModalProps> = ({
  isOpen,
  onClose,
  verification,
  correctiveActions,
  onApprove,
  onReject,
  isActionLoading,
}) => {
  if (!isOpen || !verification) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      case "PENDING":
      default:
        return <Badge variant="warning">Pending Review</Badge>;
    }
  };

  const action = correctiveActions.find((a) => a.id === verification.correctiveActionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Verification #{verification.id}
                </h2>
                {getStatusBadge(verification.status)}
              </div>
              <p className="text-xs text-slate-500">Corrective Action Closure Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Grid Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Wrench className="h-3.5 w-3.5 text-purple-600" />
                <span>Target Corrective Action</span>
              </div>
              <p className="text-slate-900 font-medium text-sm">
                CAPA #{verification.correctiveActionId}
              </p>
              <p className="text-slate-600 truncate">{verification.correctiveActionTitle || action?.title || "N/A"}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Verifier</span>
              </div>
              <p className="text-slate-900 font-medium text-sm">
                {verification.verifierName || `User #${verification.verifierId || "N/A"}`}
              </p>
              {verification.verifierEmail && (
                <p className="text-slate-500">{verification.verifierEmail}</p>
              )}
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Verification Timestamp</span>
              </div>
              <p className="text-slate-900 font-medium text-sm">
                {formatDate(verification.verifiedAt)}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <FileCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>CAPA Current Status</span>
              </div>
              <p className="text-slate-900 font-medium text-sm">
                {verification.correctiveActionStatus || action?.status || "N/A"}
              </p>
            </div>
          </div>

          {/* Comments section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              Verification Comments & Audit Notes
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {verification.comments ? (
                <p>{verification.comments}</p>
              ) : (
                <p className="italic text-slate-400">No verification comments recorded.</p>
              )}
            </div>
          </div>

          {/* Related CAPA Details */}
          {action && (
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
              <h4 className="font-semibold text-purple-900 flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-purple-600" />
                Linked CAPA Specification
              </h4>
              <p className="text-purple-950 font-medium">{action.title}</p>
              <p className="text-purple-700/80">{action.description}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          {verification.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  onClose();
                  onReject(verification);
                }}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  onApprove(verification);
                }}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Close CAPA</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailsModal;
