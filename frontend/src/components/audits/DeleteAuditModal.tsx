import React from "react";
import Button from "../ui/Button";
import { AlertTriangle, X } from "lucide-react";
import type { Audit } from "../../pages/Audits";

interface DeleteAuditModalProps {
  audit: Audit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export const DeleteAuditModal: React.FC<DeleteAuditModalProps> = ({
  audit,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen || !audit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-bold text-slate-900">
              Confirm Audit Deletion
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete this audit?
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <p className="font-bold text-slate-800">
              #{audit.id} — {audit.title}
            </p>
            <p className="text-slate-500">
              Department: {audit.departmentName || `#${audit.departmentId}`}
            </p>
          </div>
          <p className="text-xs text-rose-600 font-medium">
            This action will permanently delete the audit record from the platform.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete Audit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAuditModal;
