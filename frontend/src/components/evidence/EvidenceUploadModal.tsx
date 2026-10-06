import React, { useState } from "react";
import Button from "../ui/Button";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";
import { X, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctiveActions: CorrectiveAction[];
  defaultActionId?: number | null;
  onUploadSuccess: () => void;
  apiCall: (formData: FormData, correctiveActionId: number) => Promise<void>;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  correctiveActions,
  defaultActionId,
  onUploadSuccess,
  apiCall,
}) => {
  const [selectedActionId, setSelectedActionId] = useState<string>(
    defaultActionId ? String(defaultActionId) : ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMessage("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActionId) {
      setErrorMessage("Please select a target corrective action.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("correctiveActionId", selectedActionId);

      await apiCall(formData, Number(selectedActionId));

      onUploadSuccess();
      onClose();
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Evidence upload error:", err);
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to upload evidence file."
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
            <Upload className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Upload Evidence Document</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Corrective Action Dropdown */}
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Corrective Action...</option>
              {correctiveActions.map((action) => (
                <option key={action.id} value={action.id}>
                  CAPA #{action.id}: {action.title} ({action.status})
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Zone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Attachment File <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/50"
                  : selectedFile
                  ? "border-emerald-300 bg-emerald-50/30"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100/80"
              }`}
            >
              <input
                type="file"
                id="evidence-file-input"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Unknown type"}
                    </p>
                  </div>
                  <label
                    htmlFor="evidence-file-input"
                    className="inline-block text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer underline mt-1"
                  >
                    Change file
                  </label>
                </div>
              ) : (
                <label htmlFor="evidence-file-input" className="cursor-pointer space-y-2 block">
                  <div className="mx-auto h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Click to upload or drag & drop file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF, Images, Word, Excel, CSV, or Archive files
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !selectedFile || !selectedActionId}>
              {isSubmitting ? "Uploading File..." : "Upload Evidence"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvidenceUploadModal;
