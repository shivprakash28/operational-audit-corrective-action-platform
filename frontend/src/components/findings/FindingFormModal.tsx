import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { X, AlertTriangle, AlertCircle } from "lucide-react";
import type {
  Audit,
  Finding,
  FindingSeverity,
  FindingStatus,
  ObservationOption,
} from "../../pages/Findings";

interface FindingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    auditId: number;
    observationId: number;
    severity: FindingSeverity;
    responsibleDepartmentId: number;
    ownerId?: number;
    status: FindingStatus;
    description: string;
  }) => Promise<void>;
  audits: Audit[];
  defaultAuditId?: string;
  observations: ObservationOption[];
  findingToEdit?: Finding | null;
  loading?: boolean;
}

export const FindingFormModal: React.FC<FindingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  audits,
  defaultAuditId = "",
  observations,
  findingToEdit = null,
  loading = false,
}) => {
  const isEdit = !!findingToEdit;

  const [auditIdStr, setAuditIdStr] = useState<string>(defaultAuditId);
  const [observationIdStr, setObservationIdStr] = useState<string>("");
  const [severity, setSeverity] = useState<FindingSeverity>("MAJOR");
  const [responsibleDeptIdStr, setResponsibleDeptIdStr] = useState<string>("1");
  const [ownerIdStr, setOwnerIdStr] = useState<string>("");
  const [status, setStatus] = useState<FindingStatus>("OPEN");
  const [description, setDescription] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (findingToEdit) {
      setAuditIdStr(findingToEdit.auditId.toString());
      setObservationIdStr(findingToEdit.observationId.toString());
      setSeverity(findingToEdit.severity || "MAJOR");
      setResponsibleDeptIdStr(
        findingToEdit.responsibleDepartmentId
          ? findingToEdit.responsibleDepartmentId.toString()
          : "1"
      );
      setOwnerIdStr(findingToEdit.ownerId ? findingToEdit.ownerId.toString() : "");
      setStatus(findingToEdit.status || "OPEN");
      setDescription(findingToEdit.description || "");
    } else {
      setAuditIdStr(defaultAuditId);
      if (observations.length > 0) {
        setObservationIdStr(observations[0].id.toString());
      } else {
        setObservationIdStr("");
      }
      setSeverity("MAJOR");

      // Pre-fill department from selected audit if available
      const selAudit = audits.find((a) => a.id.toString() === defaultAuditId);
      if (selAudit?.departmentId) {
        setResponsibleDeptIdStr(selAudit.departmentId.toString());
      } else {
        setResponsibleDeptIdStr("1");
      }

      setOwnerIdStr("");
      setStatus("OPEN");
      setDescription("");
    }
    setErrorMsg("");
  }, [findingToEdit, defaultAuditId, isOpen, observations, audits]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const auditIdNum = Number(auditIdStr);
    if (!auditIdStr || isNaN(auditIdNum) || auditIdNum <= 0) {
      setErrorMsg("Please select a target audit.");
      return;
    }

    const obsNum = Number(observationIdStr);
    if (!observationIdStr || isNaN(obsNum) || obsNum <= 0) {
      setErrorMsg("Please select a valid observation.");
      return;
    }

    const deptNum = Number(responsibleDeptIdStr);
    if (!responsibleDeptIdStr || isNaN(deptNum) || deptNum <= 0) {
      setErrorMsg("Please enter a valid Responsible Department ID.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Finding description is required.");
      return;
    }

    const ownerNum = ownerIdStr ? Number(ownerIdStr) : undefined;

    try {
      await onSubmit({
        auditId: auditIdNum,
        observationId: obsNum,
        severity,
        responsibleDepartmentId: deptNum,
        ownerId: ownerNum,
        status,
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to save finding. Please check inputs."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? `Edit Finding #${findingToEdit?.id}` : "Create New Audit Finding"}
              </h3>
              <p className="text-xs text-slate-500">
                Classify non-conformance severity and assign ownership
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
        <form id="finding-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Audit */}
          <div>
            <label htmlFor="findingAudit" className="block text-xs font-semibold text-slate-700 mb-1">
              Target Audit *
            </label>
            <select
              id="findingAudit"
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

          {/* Source Observation */}
          <div>
            <label htmlFor="findingObs" className="block text-xs font-semibold text-slate-700 mb-1">
              Source Field Observation *
            </label>
            {observations.length > 0 ? (
              <select
                id="findingObs"
                value={observationIdStr}
                onChange={(e) => setObservationIdStr(e.target.value)}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="">-- Select Observation --</option>
                {observations.map((obs) => (
                  <option key={obs.id} value={obs.id.toString()}>
                    #{obs.id} — {obs.description.slice(0, 60)}...
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter Observation ID (e.g. 1)"
                  value={observationIdStr}
                  onChange={(e) => setObservationIdStr(e.target.value)}
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter the Observation ID for this audit.
                </p>
              </div>
            )}
          </div>

          {/* Severity & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="findingSev" className="block text-xs font-semibold text-slate-700 mb-1">
                Severity *
              </label>
              <select
                id="findingSev"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FindingSeverity)}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="MAJOR">MAJOR</option>
                <option value="MINOR">MINOR</option>
              </select>
            </div>

            <div>
              <label htmlFor="findingSt" className="block text-xs font-semibold text-slate-700 mb-1">
                Status *
              </label>
              <select
                id="findingSt"
                value={status}
                onChange={(e) => setStatus(e.target.value as FindingStatus)}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* Responsible Department & Owner */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="responsibleDept" className="block text-xs font-semibold text-slate-700 mb-1">
                Responsible Dept ID *
              </label>
              <input
                id="responsibleDept"
                type="number"
                min="1"
                value={responsibleDeptIdStr}
                onChange={(e) => setResponsibleDeptIdStr(e.target.value)}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="ownerUser" className="block text-xs font-semibold text-slate-700 mb-1">
                Owner User ID (Optional)
              </label>
              <input
                id="ownerUser"
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={ownerIdStr}
                onChange={(e) => setOwnerIdStr(e.target.value)}
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="findingDesc" className="block text-xs font-semibold text-slate-700 mb-1">
              Finding Non-Conformance Description *
            </label>
            <textarea
              id="findingDesc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the non-conformance, potential operational risks, and policy deviations..."
              required
              maxLength={2000}
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="finding-form" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Finding" : "Create Finding"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindingFormModal;
