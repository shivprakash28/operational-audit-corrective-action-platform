import React from "react";
import Button from "../ui/Button";
import FileTypeIcon from "./FileTypeIcon";
import type { EvidenceItem } from "./EvidenceStats";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";
import { X, Download, Calendar, User, FileText, Wrench } from "lucide-react";
import { formatDate } from "../../utils/date";

interface EvidenceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceItem | null;
  correctiveActions: CorrectiveAction[];
  onDownload: (item: EvidenceItem) => void;
  isDownloading: boolean;
}

export const EvidenceDetailsModal: React.FC<EvidenceDetailsModalProps> = ({
  isOpen,
  onClose,
  evidence,
  correctiveActions,
  onDownload,
  isDownloading,
}) => {
  if (!isOpen || !evidence) return null;

  const ext = evidence.fileName.split(".").pop()?.toLowerCase() || "";
  const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext);

  const action = correctiveActions.find((a) => a.id === evidence.correctiveActionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <FileTypeIcon fileName={evidence.fileName} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 truncate max-w-xs md:max-w-md" title={evidence.fileName}>
                {evidence.fileName}
              </h2>
              <p className="text-xs text-slate-500 uppercase">
                {ext || "FILE"} Attachment Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Optional Image Preview Panel */}
          {isImage && evidence.fileUrl && (
            <div className="rounded-xl border border-slate-200 bg-slate-900/5 p-4 flex items-center justify-center min-h-[180px] max-h-[280px]">
              <img
                src={evidence.fileUrl.startsWith("http") ? evidence.fileUrl : `http://127.0.0.1:5000${evidence.fileUrl}`}
                alt={evidence.fileName}
                className="max-h-60 rounded-lg object-contain border border-slate-200 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>File Name</span>
              </div>
              <p className="text-slate-900 font-medium text-sm break-all">{evidence.fileName}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Wrench className="h-3.5 w-3.5 text-slate-400" />
                <span>Corrective Action (CAPA)</span>
              </div>
              <p className="text-slate-900 font-medium">
                CAPA #{evidence.correctiveActionId} {action ? `— ${action.title}` : ""}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Uploaded By</span>
              </div>
              <p className="text-slate-900 font-medium">
                {evidence.uploadedByName || `User #${evidence.uploadedById || "N/A"}`}
              </p>
              {evidence.uploadedByEmail && (
                <p className="text-slate-500">{evidence.uploadedByEmail}</p>
              )}
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Uploaded Date</span>
              </div>
              <p className="text-slate-900 font-medium">{formatDate(evidence.uploadedAt)}</p>
            </div>
          </div>

          {/* CAPA Context Banner */}
          {action && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5">
              <h4 className="font-semibold text-indigo-900 flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-indigo-600" />
                Linked Corrective Action Context
              </h4>
              <p className="text-indigo-950 font-medium">{action.title}</p>
              <p className="text-indigo-700/80">{action.description}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onDownload(evidence)}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
            <span>{isDownloading ? "Downloading..." : "Download File"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetailsModal;
