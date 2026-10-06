import React, { useState } from "react";
import Button from "../ui/Button";
import type { VerificationItem } from "./VerificationStats";
import { AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";

interface VerificationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationItem | null;
  mode: "APPROVE" | "REJECT" | null;
  onConfirm: (verificationId: number, comments?: string) => Promise<void>;
}

export const VerificationConfirmModal: React.FC<VerificationConfirmModalProps> = ({
  isOpen,
  onClose,
  verification,
  mode,
  onConfirm,
}) => {
  const [comments, setComments] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen || !verification || !mode) return null;

  const isApprove = mode === "APPROVE";

  const handleExecute = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      await onConfirm(verification.id, comments.trim() || undefined);
      setComments("");
      onClose();
    } catch (err: any) {
      console.error(`Verification ${mode} error:`, err);
      setError(
        err.response?.data?.message || err.message || `Failed to ${mode.toLowerCase()} verification.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 ${isApprove ? "bg-emerald-50" : "bg-rose-50"}`}>
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600" />
            )}
            <h3 className={`text-base font-bold ${isApprove ? "text-emerald-900" : "text-rose-900"}`}>
              {isApprove ? "Approve Verification?" : "Reject Verification?"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-slate-600 space-y-2">
            <p>
              {isApprove
                ? "This will approve the verification and mark the related corrective action as VERIFIED."
                : "This will reject the verification and return the related corrective action to IN_PROGRESS."}
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700">Verification #{verification.id}</span>
              <p className="text-slate-900 font-medium truncate mt-0.5">
                {verification.correctiveActionTitle || `CAPA #${verification.correctiveActionId}`}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              {isApprove ? "Approval Comments (Optional)" : "Rejection Reason & Notes (Optional)"}
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={isApprove ? "Add optional approval note..." : "Reason for rejection..."}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExecute}
            disabled={isSubmitting}
            className={isApprove ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
          >
            {isSubmitting
              ? isApprove
                ? "Approving..."
                : "Rejecting..."
              : isApprove
              ? "Approve Verification"
              : "Reject Verification"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationConfirmModal;
