import React from "react";
import Button from "../ui/Button";
import { formatDate } from "../../utils/date";
import { X, Eye, FileText, User, ExternalLink, Calendar } from "lucide-react";
import type { Observation } from "../../pages/Observations";

interface ObservationDetailsModalProps {
  observation: Observation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ObservationDetailsModal: React.FC<ObservationDetailsModalProps> = ({
  observation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !observation) return null;

  const authorDisplay =
    observation.createdByName ||
    observation.createdByEmail ||
    `User #${observation.createdById}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Observation #{observation.id}
              </h3>
              <p className="text-xs text-slate-500">
                Audit Field Finding Specifications
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Header Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Target Audit
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {observation.auditTitle || `Audit #${observation.auditId}`}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Checklist Item Ref
              </span>
              <span className="text-sm font-semibold text-blue-600 block mt-0.5">
                {observation.checklistItemQuestion || `Item #${observation.checklistItemId}`}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" /> Recorded By
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {authorDisplay}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Recorded Date
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                {formatDate(observation.createdAt)}
              </span>
            </div>
          </div>

          {/* Finding Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />
              Observation Description & Finding
            </h4>
            <p className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-sm">
              {observation.description}
            </p>
          </div>

          {/* Evidence URL if available */}
          {observation.evidenceUrl && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="h-4 w-4 text-emerald-600" />
                Supporting Evidence Reference
              </h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-600 truncate mr-2">
                  {observation.evidenceUrl}
                </span>
                <a
                  href={observation.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  View Attachment <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ObservationDetailsModal;
