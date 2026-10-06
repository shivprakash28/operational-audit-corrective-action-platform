import React from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import type { VerificationItem } from "./VerificationStats";
import { Eye, CheckCircle2, XCircle, User, Calendar, MessageSquare, Wrench } from "lucide-react";
import { formatDate } from "../../utils/date";

interface VerificationCardProps {
  item: VerificationItem;
  onViewDetails: (item: VerificationItem) => void;
  onApprove: (item: VerificationItem) => void;
  onReject: (item: VerificationItem) => void;
  actionLoadingId: number | null;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  item,
  onViewDetails,
  onApprove,
  onReject,
  actionLoadingId,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      case "PENDING":
      default:
        return <Badge variant="warning">Pending Review</Badge>;
    }
  };

  const isLoading = actionLoadingId === item.id;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              VRF #{item.id}
            </span>
            {getStatusBadge(item.status)}
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(item.verifiedAt)}
          </span>
        </div>

        {/* CAPA Reference */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Wrench className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <span>Target Corrective Action (CAPA #{item.correctiveActionId})</span>
          </div>
          <p className="text-sm font-bold text-slate-900 line-clamp-1">
            {item.correctiveActionTitle || `CAPA #${item.correctiveActionId}`}
          </p>
        </div>

        {/* Verifier */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700">Verifier:</span>
          <span className="truncate">
            {item.verifierName || item.verifierEmail || `User #${item.verifierId || "N/A"}`}
          </span>
        </div>

        {/* Comments */}
        {item.comments && (
          <div className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50/60 p-2 rounded-lg">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <p className="italic line-clamp-2">"{item.comments}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails(item)}
            className="flex items-center gap-1 text-slate-700 hover:text-purple-600"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
          </Button>

          {item.status === "PENDING" && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onReject(item)}
                disabled={isLoading}
                className="flex items-center gap-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove(item)}
                disabled={isLoading}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationCard;
