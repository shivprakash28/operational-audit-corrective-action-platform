import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { X, Wrench, AlertCircle } from "lucide-react";
import type {
  FindingOption,
  CorrectiveAction,
  CorrectiveActionStatus,
} from "../../pages/CorrectiveActions";

interface CorrectiveActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    findingId: number;
    title: string;
    description: string;
    ownerId: number;
    dueDate?: string;
    status: CorrectiveActionStatus;
  }) => Promise<void>;
  findings: FindingOption[];
  defaultFindingId?: string;
  actionToEdit?: CorrectiveAction | null;
  loading?: boolean;
}

export const CorrectiveActionFormModal: React.FC<CorrectiveActionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  findings,
  defaultFindingId = "",
  actionToEdit = null,
  loading = false,
}) => {
  const isEdit = !!actionToEdit;

  const toDatetimeLocal = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const [findingIdStr, setFindingIdStr] = useState<string>(defaultFindingId);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [ownerIdStr, setOwnerIdStr] = useState<string>("1");
  const [dueDateStr, setDueDateStr] = useState<string>("");
  const [status, setStatus] = useState<CorrectiveActionStatus>("OPEN");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (actionToEdit) {
      setFindingIdStr(actionToEdit.findingId ? actionToEdit.findingId.toString() : defaultFindingId);
      setTitle(actionToEdit.title || "");
      setDescription(actionToEdit.description || "");
      setOwnerIdStr(actionToEdit.ownerId ? actionToEdit.ownerId.toString() : "1");
      setDueDateStr(toDatetimeLocal(actionToEdit.dueDate || actionToEdit.deadline));
      setStatus(actionToEdit.status || "OPEN");
    } else {
      setFindingIdStr(defaultFindingId);
      if (findings.length > 0 && !defaultFindingId) {
        setFindingIdStr(findings[0].id.toString());
      }
      setTitle("");
      setDescription("");
      setOwnerIdStr("1");
      setDueDateStr("");
      setStatus("OPEN");
    }
    setErrorMsg("");
  }, [actionToEdit, defaultFindingId, isOpen, findings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const fIdNum = Number(findingIdStr);
    if (!findingIdStr || isNaN(fIdNum) || fIdNum <= 0) {
      setErrorMsg("Please select a target non-conformance finding.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Corrective Action title is required.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Description is required.");
      return;
    }

    const oIdNum = Number(ownerIdStr);
    if (!ownerIdStr || isNaN(oIdNum) || oIdNum <= 0) {
      setErrorMsg("Valid Owner User ID is required.");
      return;
    }

    try {
      await onSubmit({
        findingId: fIdNum,
        title: title.trim(),
        description: description.trim(),
        ownerId: oIdNum,
        dueDate: dueDateStr ? new Date(dueDateStr).toISOString() : undefined,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to save corrective action. Check inputs."
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
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? `Edit Action #${actionToEdit?.id}` : "Create Corrective Action"}
              </h3>
              <p className="text-xs text-slate-500">
                Define remediation steps, deadline, and assigned owner
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
        <form id="capa-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Finding Reference */}
          <div>
            <label htmlFor="capaFinding" className="block text-xs font-semibold text-slate-700 mb-1">
              Source Non-Conformance Finding *
            </label>
            {findings.length > 0 ? (
              <select
                id="capaFinding"
                value={findingIdStr}
                onChange={(e) => setFindingIdStr(e.target.value)}
                disabled={isEdit}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
              >
                <option value="">-- Select Finding --</option>
                {findings.map((f) => (
                  <option key={f.id} value={f.id.toString()}>
                    Finding #{f.id} — {f.description.slice(0, 60)}...
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter Finding ID (e.g. 1)"
                  value={findingIdStr}
                  onChange={(e) => setFindingIdStr(e.target.value)}
                  disabled={isEdit}
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            )}
          </div>

          {/* Action Title */}
          <div>
            <label htmlFor="capaTitle" className="block text-xs font-semibold text-slate-700 mb-1">
              Action Plan Title *
            </label>
            <input
              id="capaTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Update Financial Approval Controls and SOP Documentation"
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Owner ID & Target Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="capaOwner" className="block text-xs font-semibold text-slate-700 mb-1">
                Owner User ID *
              </label>
              <input
                id="capaOwner"
                type="number"
                min="1"
                value={ownerIdStr}
                onChange={(e) => setOwnerIdStr(e.target.value)}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="capaDueDate" className="block text-xs font-semibold text-slate-700 mb-1">
                Target Due Date / Deadline
              </label>
              <input
                id="capaDueDate"
                type="datetime-local"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full text-xs py-2 px-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="capaStatus" className="block text-xs font-semibold text-slate-700 mb-1">
              Status *
            </label>
            <select
              id="capaStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value as CorrectiveActionStatus)}
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="capaDesc" className="block text-xs font-semibold text-slate-700 mb-1">
              Remediation Action Details *
            </label>
            <textarea
              id="capaDesc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail step-by-step corrective actions, policy updates, or operational training required..."
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="capa-form" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Action" : "Create Action"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CorrectiveActionFormModal;
