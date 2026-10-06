import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { X, Eye, AlertCircle } from "lucide-react";
import type { Audit, Observation, ChecklistItemOption } from "../../pages/Observations";

interface ObservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    auditId: number;
    checklistItemId: number;
    description: string;
    evidenceUrl?: string;
  }) => Promise<void>;
  audits: Audit[];
  defaultAuditId?: string;
  checklistItems: ChecklistItemOption[];
  observationToEdit?: Observation | null;
  loading?: boolean;
}

export const ObservationFormModal: React.FC<ObservationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  audits,
  defaultAuditId = "",
  checklistItems,
  observationToEdit = null,
  loading = false,
}) => {
  const isEdit = !!observationToEdit;

  const [auditIdStr, setAuditIdStr] = useState<string>(defaultAuditId);
  const [checklistItemIdStr, setChecklistItemIdStr] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (observationToEdit) {
      setAuditIdStr(observationToEdit.auditId.toString());
      setChecklistItemIdStr(observationToEdit.checklistItemId.toString());
      setDescription(observationToEdit.description || "");
      setEvidenceUrl(observationToEdit.evidenceUrl || "");
    } else {
      setAuditIdStr(defaultAuditId);
      if (checklistItems.length > 0) {
        setChecklistItemIdStr(checklistItems[0].id.toString());
      } else {
        setChecklistItemIdStr("");
      }
      setDescription("");
      setEvidenceUrl("");
    }
    setErrorMsg("");
  }, [observationToEdit, defaultAuditId, isOpen, checklistItems]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const auditIdNum = Number(auditIdStr);
    if (!auditIdStr || isNaN(auditIdNum) || auditIdNum <= 0) {
      setErrorMsg("Please select a target audit.");
      return;
    }

    const itemNum = Number(checklistItemIdStr);
    if (!checklistItemIdStr || isNaN(itemNum) || itemNum <= 0) {
      setErrorMsg("Please select a valid Checklist Item.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Observation description is required.");
      return;
    }

    try {
      await onSubmit({
        auditId: auditIdNum,
        checklistItemId: itemNum,
        description: description.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to record observation. Please check inputs."
      );
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? `Edit Observation #${observationToEdit?.id}` : "Record Field Observation"}
              </h3>
              <p className="text-xs text-slate-500">
                Document audit field findings and non-conformances
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

        {/* Form Body */}
        <form id="obs-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Audit Selection */}
          <div>
            <label htmlFor="modalAudit" className="block text-xs font-semibold text-slate-700 mb-1">
              Target Audit *
            </label>
            <select
              id="modalAudit"
              value={auditIdStr}
              onChange={(e) => setAuditIdStr(e.target.value)}
              disabled={isEdit}
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
            >
              <option value="">-- Select Audit --</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id.toString()}>
                  #{a.id} — {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* Checklist Item Selection */}
          <div>
            <label htmlFor="modalItem" className="block text-xs font-semibold text-slate-700 mb-1">
              Associated Checklist Criteria *
            </label>
            {checklistItems.length > 0 ? (
              <select
                id="modalItem"
                value={checklistItemIdStr}
                onChange={(e) => setChecklistItemIdStr(e.target.value)}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="">-- Select Checklist Item --</option>
                {checklistItems.map((item) => (
                  <option key={item.id} value={item.id.toString()}>
                    #{item.id} — {item.question}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter Checklist Item ID (e.g. 1)"
                  value={checklistItemIdStr}
                  onChange={(e) => setChecklistItemIdStr(e.target.value)}
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter the checklist item ID associated with this audit.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="obsDesc" className="block text-xs font-semibold text-slate-700 mb-1">
              Observation Description / Finding Details *
            </label>
            <textarea
              id="obsDesc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Record precise factual observations, evidence gaps, or operational deviations..."
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>

          {/* Evidence URL */}
          <div>
            <label htmlFor="evidenceUrl" className="block text-xs font-semibold text-slate-700 mb-1">
              Evidence Document URL (Optional)
            </label>
            <input
              id="evidenceUrl"
              type="text"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="obs-form" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Observation" : "Record Observation"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ObservationFormModal;
