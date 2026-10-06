import React, { useState } from "react";
import Button from "../ui/Button";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";
import type { VerificationStatus } from "./VerificationStats";
import { X, FileCheck, AlertCircle } from "lucide-react";

interface VerificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctiveActions: CorrectiveAction[];
  defaultActionId?: number | null;
  currentUserId?: number;
  onSuccess: () => void;
  apiCall: (payload: {
    correctiveActionId: number;
    verifierId: number;
    status: VerificationStatus;
    comments?: string;
  }) => Promise<void>;
}

export const VerificationFormModal: React.FC<VerificationFormModalProps> = ({
  isOpen,
  onClose,
  correctiveActions,
  defaultActionId,
  currentUserId,
  onSuccess,
  apiCall,
}) => {
  const [selectedActionId, setSelectedActionId] = useState<string>(
    defaultActionId ? String(defaultActionId) : ""
  );
  const [verifierIdInput, setVerifierIdInput] = useState<string>(
    currentUserId ? String(currentUserId) : ""
  );
  const [status, setStatus] = useState<VerificationStatus>("PENDING");
  const [comments, setComments] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActionId) {
      setErrorMessage("Please select a target Corrective Action.");
      return;
    }

    const vId = Number(verifierIdInput || currentUserId);
    if (!vId) {
      setErrorMessage("Verifier ID is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await apiCall({
        correctiveActionId: Number(selectedActionId),
        verifierId: vId,
        status,
        comments: comments.trim() || undefined,
      });

      onSuccess();
      onClose();
      // Reset form
      setComments("");
    } catch (err: any) {
      console.error("Verification creation error:", err);
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to create verification record."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Create Verification Request</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Corrective Action Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Target Corrective Action (CAPA) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedActionId}
              onChange={(e) => {
                setSelectedActionId(e.target.value);
                setErrorMessage("");
              }}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select Corrective Action...</option>
              {correctiveActions.map((action) => (
                <option key={action.id} value={action.id}>
                  CAPA #{action.id}: {action.title} ({action.status})
                </option>
              ))}
            </select>
          </div>

          {/* Verifier ID input (defaults to logged-in user) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Verifier User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={verifierIdInput}
              onChange={(e) => setVerifierIdInput(e.target.value)}
              placeholder="e.g. 1"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <p className="text-[11px] text-slate-400">
              ID of the auditor/user performing the verification review
            </p>
          </div>

          {/* Status Enum Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Initial Verification Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VerificationStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="PENDING">PENDING (Awaiting Review)</option>
              <option value="APPROVED">APPROVED (Verify & Close CAPA)</option>
              <option value="REJECTED">REJECTED (Re-open CAPA to IN_PROGRESS)</option>
            </select>
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Verification Audit Comments & Notes
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter audit evidence verification notes or reasons..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !selectedActionId}>
              {isSubmitting ? "Creating..." : "Create Verification"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationFormModal;
