import React from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import VerificationCard from "./VerificationCard";
import type { VerificationItem } from "./VerificationStats";
import { Eye, CheckCircle2, XCircle, FileCheck } from "lucide-react";
import { formatDate } from "../../utils/date";

interface VerificationTableProps {
  verifications: VerificationItem[];
  onViewDetails: (item: VerificationItem) => void;
  onApprove: (item: VerificationItem) => void;
  onReject: (item: VerificationItem) => void;
  actionLoadingId: number | null;
}

export const VerificationTable: React.FC<VerificationTableProps> = ({
  verifications,
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

  if (verifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No verifications found</h3>
          <p className="mt-1 text-xs text-slate-500">
            No verification records match your search criteria or target corrective action filter.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {verifications.map((item) => (
          <VerificationCard
            key={item.id}
            item={item}
            onViewDetails={onViewDetails}
            onApprove={onApprove}
            onReject={onReject}
            actionLoadingId={actionLoadingId}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">ID</th>
                    <th scope="col" className="px-6 py-3.5">Corrective Action</th>
                    <th scope="col" className="px-6 py-3.5">Verifier</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Comments</th>
                    <th scope="col" className="px-6 py-3.5">Verified Date</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {verifications.map((item) => {
                    const isLoading = actionLoadingId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* ID */}
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-500 font-semibold">
                          #{item.id}
                        </td>

                        {/* Corrective Action */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-1">
                              CAPA #{item.correctiveActionId}
                            </span>
                            <p className="font-semibold text-slate-900 truncate" title={item.correctiveActionTitle}>
                              {item.correctiveActionTitle || `CAPA #${item.correctiveActionId}`}
                            </p>
                          </div>
                        </td>

                        {/* Verifier */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.verifierName || `User #${item.verifierId || "N/A"}`}
                            </p>
                            {item.verifierEmail && (
                              <p className="text-xs text-slate-400">{item.verifierEmail}</p>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Comments */}
                        <td className="px-6 py-4 max-w-xs">
                          {item.comments ? (
                            <p className="text-xs text-slate-600 line-clamp-2" title={item.comments}>
                              "{item.comments}"
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No comments</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(item.verifiedAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onViewDetails(item)}
                              className="flex items-center gap-1.5 text-slate-700 hover:text-purple-600"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Details</span>
                            </Button>

                            {item.status === "PENDING" && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => onReject(item)}
                                  disabled={isLoading}
                                  className="flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => onApprove(item)}
                                  disabled={isLoading}
                                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Approve</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VerificationTable;
