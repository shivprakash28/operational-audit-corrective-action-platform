import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { X, ClipboardList, AlertCircle } from "lucide-react";
import type { Audit, AuditFormData } from "../../pages/Audits";

interface AuditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AuditFormData) => Promise<void>;
  auditToEdit?: Audit | null;
  loading?: boolean;
}

export const AuditFormModal: React.FC<AuditFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  auditToEdit = null,
  loading = false,
}) => {
  const isEdit = !!auditToEdit;

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

  const [form, setForm] = useState<AuditFormData>({
    title: "",
    scope: "",
    departmentId: "1",
    objectives: "",
    criteria: "",
    plannedStartDate: "",
    plannedEndDate: "",
    expectedCompletionDate: "",
    status: "PLANNED",
  });

  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    if (auditToEdit) {
      setForm({
        title: auditToEdit.title || "",
        scope: auditToEdit.scope || "",
        departmentId: auditToEdit.departmentId ? auditToEdit.departmentId.toString() : "1",
        objectives: auditToEdit.objectives || "",
        criteria: auditToEdit.criteria || "",
        plannedStartDate: toDatetimeLocal(auditToEdit.plannedStartDate),
        plannedEndDate: toDatetimeLocal(auditToEdit.plannedEndDate),
        expectedCompletionDate: toDatetimeLocal(auditToEdit.expectedCompletionDate),
        status: auditToEdit.status || "PLANNED",
      });
    } else {
      setForm({
        title: "",
        scope: "",
        departmentId: "1",
        objectives: "",
        criteria: "",
        plannedStartDate: "",
        plannedEndDate: "",
        expectedCompletionDate: "",
        status: "PLANNED",
      });
    }
    setValidationError("");
  }, [auditToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Client side validations
    if (!form.title.trim()) {
      setValidationError("Audit title is required.");
      return;
    }
    if (!form.departmentId || Number(form.departmentId) <= 0) {
      setValidationError("Valid Department ID is required.");
      return;
    }
    if (!form.plannedStartDate || !form.plannedEndDate) {
      setValidationError("Planned start and end dates are required.");
      return;
    }

    const start = new Date(form.plannedStartDate);
    const end = new Date(form.plannedEndDate);
    if (start > end) {
      setValidationError("Planned Start Date cannot be after Planned End Date.");
      return;
    }

    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setValidationError(
        err?.response?.data?.message || "Failed to save audit. Please check inputs."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? `Edit Audit #${auditToEdit?.id}` : "Create New Audit"}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? "Update operational audit details and schedule"
                  : "Fill in the required information to schedule a new audit"}
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

        {/* Modal Body / Form */}
        <form id="audit-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
              1. Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Q3 Financial Controls & Process Audit"
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label htmlFor="departmentId" className="block text-xs font-semibold text-slate-700 mb-1">
                  Department ID *
                </label>
                <input
                  id="departmentId"
                  name="departmentId"
                  type="number"
                  min="1"
                  value={form.departmentId}
                  onChange={handleChange}
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Audit Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
              2. Audit Details
            </h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="scope" className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope *
                </label>
                <textarea
                  id="scope"
                  name="scope"
                  rows={2}
                  value={form.scope}
                  onChange={handleChange}
                  placeholder="Define operational boundaries, systems, and teams covered..."
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label htmlFor="objectives" className="block text-xs font-semibold text-slate-700 mb-1">
                  Objectives *
                </label>
                <textarea
                  id="objectives"
                  name="objectives"
                  rows={2}
                  value={form.objectives}
                  onChange={handleChange}
                  placeholder="Key audit goals and expected outcomes..."
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label htmlFor="criteria" className="block text-xs font-semibold text-slate-700 mb-1">
                  Criteria *
                </label>
                <textarea
                  id="criteria"
                  name="criteria"
                  rows={2}
                  value={form.criteria}
                  onChange={handleChange}
                  placeholder="Standards, regulations, ISO guidelines, or policy frameworks..."
                  required
                  className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Schedule */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
              3. Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="plannedStartDate" className="block text-xs font-semibold text-slate-700 mb-1">
                  Planned Start Date *
                </label>
                <input
                  id="plannedStartDate"
                  name="plannedStartDate"
                  type="datetime-local"
                  value={form.plannedStartDate}
                  onChange={handleChange}
                  required
                  className="w-full text-xs py-2 px-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label htmlFor="plannedEndDate" className="block text-xs font-semibold text-slate-700 mb-1">
                  Planned End Date *
                </label>
                <input
                  id="plannedEndDate"
                  name="plannedEndDate"
                  type="datetime-local"
                  value={form.plannedEndDate}
                  onChange={handleChange}
                  required
                  className="w-full text-xs py-2 px-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label htmlFor="expectedCompletionDate" className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Completion *
                </label>
                <input
                  id="expectedCompletionDate"
                  name="expectedCompletionDate"
                  type="datetime-local"
                  value={form.expectedCompletionDate}
                  onChange={handleChange}
                  required
                  className="w-full text-xs py-2 px-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="audit-form" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Audit" : "Create Audit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditFormModal;
