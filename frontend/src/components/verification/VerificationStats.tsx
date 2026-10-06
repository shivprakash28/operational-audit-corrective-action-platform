import React from "react";
import Card, { CardContent } from "../ui/Card";
import { FileCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VerificationItem {
  id: number;
  correctiveActionId: number;
  correctiveActionTitle?: string;
  correctiveActionStatus?: string;
  verifierId?: number;
  verifierName?: string;
  verifierEmail?: string;
  status: VerificationStatus;
  comments?: string;
  verifiedAt?: string;
}

interface VerificationStatsProps {
  verifications: VerificationItem[];
}

export const VerificationStats: React.FC<VerificationStatsProps> = ({ verifications }) => {
  const total = verifications.length;
  const pending = verifications.filter((v) => v.status === "PENDING").length;
  const approved = verifications.filter((v) => v.status === "APPROVED").length;
  const rejected = verifications.filter((v) => v.status === "REJECTED").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Verifications */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Verifications
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{total}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Verification requests</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <FileCheck className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approval */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Review
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{pending}</h3>
              <p className="text-xs text-amber-600 font-medium mt-0.5">Awaiting verification</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Approved
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{approved}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">CAPAs verified & closed</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejected */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rejected
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{rejected}</h3>
              <p className="text-xs text-rose-600 font-medium mt-0.5">Returned to in-progress</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationStats;
