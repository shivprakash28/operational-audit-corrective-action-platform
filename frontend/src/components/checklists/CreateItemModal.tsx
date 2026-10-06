import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { X, ListPlus, AlertCircle } from "lucide-react";
import type { ChecklistTemplate } from "../../pages/Checklists";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    templateId: number,
    question: string,
    description: string,
    order: number
  ) => Promise<void>;
  templates: ChecklistTemplate[];
  defaultTemplateId?: number | null;
  loading?: boolean;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  templates,
  defaultTemplateId = null,
  loading = false,
}) => {
  const [templateIdStr, setTemplateIdStr] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [orderStr, setOrderStr] = useState<string>("1");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (defaultTemplateId) {
      setTemplateIdStr(defaultTemplateId.toString());
      const selectedTmpl = templates.find((t) => t.id === defaultTemplateId);
      const nextOrder = (selectedTmpl?.items?.length ?? 0) + 1;
      setOrderStr(nextOrder.toString());
    } else if (templates.length > 0) {
      setTemplateIdStr(templates[0].id.toString());
      const nextOrder = (templates[0].items?.length ?? 0) + 1;
      setOrderStr(nextOrder.toString());
    }
    setQuestion("");
    setDescription("");
    setErrorMsg("");
  }, [defaultTemplateId, isOpen, templates]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const targetTmplId = Number(templateIdStr);
    if (!templateIdStr || isNaN(targetTmplId) || targetTmplId <= 0) {
      setErrorMsg("Please select a target template.");
      return;
    }
    if (!question.trim()) {
      setErrorMsg("Checklist question is required.");
      return;
    }
    const orderNum = Number(orderStr);
    if (isNaN(orderNum) || orderNum <= 0) {
      setErrorMsg("Order must be a positive integer.");
      return;
    }

    try {
      await onSubmit(targetTmplId, question.trim(), description.trim(), orderNum);
      setQuestion("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to create checklist item."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ListPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Add Checklist Item
              </h3>
              <p className="text-xs text-slate-500">
                Add a verification question or criteria item to a template
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
        <form id="create-item-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label htmlFor="itemTplSelect" className="block text-xs font-semibold text-slate-700 mb-1">
              Target Template *
            </label>
            <select
              id="itemTplSelect"
              value={templateIdStr}
              onChange={(e) => setTemplateIdStr(e.target.value)}
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">-- Select Template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id.toString()}>
                  #{t.id} — {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="questionText" className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Question / Criteria *
            </label>
            <textarea
              id="questionText"
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Verify dual authorization signatures on all expenditure approvals"
              required
              className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="itemDetailsDesc" className="block text-xs font-semibold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <input
                id="itemDetailsDesc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional instructions or guidelines..."
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label htmlFor="itemSeqOrder" className="block text-xs font-semibold text-slate-700 mb-1">
                Order *
              </label>
              <input
                id="itemSeqOrder"
                type="number"
                min="1"
                value={orderStr}
                onChange={(e) => setOrderStr(e.target.value)}
                required
                className="w-full text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="create-item-form" disabled={loading}>
            {loading ? "Adding..." : "Add Item"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateItemModal;
