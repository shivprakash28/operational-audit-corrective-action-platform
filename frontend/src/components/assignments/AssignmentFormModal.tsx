import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { X, UserCheck, AlertCircle } from "lucide-react";
import type { Audit } from "../../pages/Assignments";

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (auditId: string, auditorId: number) => Promise<void>;
  audits: Audit[];
  defaultAuditId?: string;
  loading?: boolean;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  audits,
  defaultAuditId = "",
  loading = false,
}) => {
  const [auditId, setAuditId] = useState<string>(defaultAuditId);
  const [auditorIdInput, setAuditorIdInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    setAuditId(defaultAuditId);
    setAuditorIdInput("");
    setErrorMsg("");
  }, [defaultAuditId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!auditId) {
      setErrorMsg("Please select an audit to assign.");
      return;
    }

    const numericAuditorId = Number(auditorIdInput);
    if (!auditorIdInput || isNaN(numericAuditorId) || numericAuditorId <= 0) {
      setErrorMsg("Please enter a valid numeric Auditor User ID.");
      return;
    }

    try {
      await onSubmit(auditId, numericAuditorId);
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to assign auditor. Check for conflicts or invalid ID."
      );
    }
  };

  const selectedAuditObj = audits.find((a) => a.id.toString() === auditId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assign Auditor
              </h3>
              <p className="text-xs text-slate-500">
                Assign a qualified auditor to an audit plan
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

        {/* Body Form */}
        <form id="assign-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Audit Selection */}
          <div>
            <label htmlFor="modalAuditId" className="block text-xs font-semibold text-slate-700 mb-1">
              Select Audit *
            </label>
            <select
              id="modalAuditId"
              value={auditId}
              onChange={(e) => setAuditId(e.target.value)}
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">-- Select an Audit --</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id.toString()}>
                  #{a.id} — {a.title}
                </option>
              ))}
            </select>
          </div>

          {selectedAuditObj && (
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Target Audit Specs:</p>
              <p>Department: {selectedAuditObj.departmentName || `ID #${selectedAuditObj.departmentId}`}</p>
              <p>Status: {selectedAuditObj.status || "PLANNED"}</p>
            </div>
          )}

          {/* Auditor ID Input */}
          <div>
            <label htmlFor="auditorIdInput" className="block text-xs font-semibold text-slate-700 mb-1">
              Auditor User ID *
            </label>
            <input
              id="auditorIdInput"
              type="number"
              min="1"
              value={auditorIdInput}
              onChange={(e) => setAuditorIdInput(e.target.value)}
              placeholder="e.g. 2 or 3"
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <p className="text-xs text-slate-400 mt-1">
              Enter the registered User ID of the auditor. The system enforces department independence rules.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="assign-form" disabled={loading}>
            {loading ? "Assigning..." : "Assign Auditor"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentFormModal;
