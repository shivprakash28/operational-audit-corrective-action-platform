import React, { useState, useEffect } from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { CheckCircle2, XCircle, MinusCircle, MessageSquare } from "lucide-react";
import type { ChecklistItem, ChecklistResponseStatus } from "../../pages/Checklists";

interface ChecklistItemCardProps {
  item: ChecklistItem;
  existingResponse?: {
    status: ChecklistResponseStatus;
    remarks?: string;
  };
  onSubmitResponse: (
    checklistItemId: number,
    status: ChecklistResponseStatus,
    remarks: string
  ) => Promise<void>;
  loading?: boolean;
}

export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({
  item,
  existingResponse,
  onSubmitResponse,
  loading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ChecklistResponseStatus>(
    existingResponse?.status || "COMPLIANT"
  );
  const [remarks, setRemarks] = useState<string>(existingResponse?.remarks || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (existingResponse) {
      setSelectedStatus(existingResponse.status);
      setRemarks(existingResponse.remarks || "");
    }
  }, [existingResponse]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitResponse(item.id, selectedStatus, remarks);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (st?: ChecklistResponseStatus) => {
    switch (st) {
      case "COMPLIANT":
        return <Badge variant="success">PASS (Compliant)</Badge>;
      case "NON_COMPLIANT":
        return <Badge variant="danger">FAIL (Non-Compliant)</Badge>;
      case "NA":
        return <Badge variant="info">N/A</Badge>;
      default:
        return <Badge variant="warning">PENDING</Badge>;
    }
  };

  const padOrder = (num: number) => num.toString().padStart(2, "0");

  return (
    <Card className="border-slate-200 bg-white hover:border-slate-300 transition-all">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-blue-100">
              {padOrder(item.order)}
            </span>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {item.question}
              </h4>
              {item.description && (
                <p className="text-xs text-slate-500">{item.description}</p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">{getStatusBadge(existingResponse?.status)}</div>
        </div>

        {/* Response Controls */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evaluation Response:
            </span>

            {/* Segmented Radio Options */}
            <div className="inline-flex rounded-lg p-1 bg-slate-200/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedStatus("COMPLIANT")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                  selectedStatus === "COMPLIANT"
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Pass
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("NON_COMPLIANT")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                  selectedStatus === "NON_COMPLIANT"
                    ? "bg-rose-600 text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                Fail
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("NA")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                  selectedStatus === "NA"
                    ? "bg-slate-700 text-white shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MinusCircle className="h-3.5 w-3.5" />
                N/A
              </button>
            </div>
          </div>

          {/* Remarks Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              Remarks & Observations (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter auditor notes, non-conformance details, or evidence references..."
              className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={loading || isSubmitting}
              className="text-xs py-1.5 px-4"
            >
              {isSubmitting ? "Saving..." : "Submit Response"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistItemCard;
