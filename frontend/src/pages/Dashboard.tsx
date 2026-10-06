import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import {
  ClipboardList,
  AlertTriangle,
  Wrench,
  Clock,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card, { CardContent } from "../components/ui/Card";
import StatCard from "../components/dashboard/StatCard";
import StatusBreakdown from "../components/dashboard/StatusBreakdown";
import type { StatusItem } from "../components/dashboard/StatusBreakdown";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import DashboardError from "../components/dashboard/DashboardError";
import DashboardEmpty from "../components/dashboard/DashboardEmpty";

export interface DashboardSummary {
  // Audit counts
  totalAudits: number;
  plannedAudits: number;
  inProgressAudits: number;
  completedAudits: number;
  closedAudits: number;

  // Finding counts
  totalFindings: number;
  openFindings: number;
  inProgressFindings: number;
  resolvedFindings: number;
  closedFindings: number;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;

  // Corrective Action counts
  totalCorrectiveActions: number;
  openCorrectiveActions: number;
  inProgressCorrectiveActions: number;
  completedCorrectiveActions: number;
  verifiedCorrectiveActions: number;
  closedCorrectiveActions: number;
  overdueCorrectiveActions: number;

  // Verification counts
  totalVerifications: number;
  pendingVerifications: number;
  approvedVerifications: number;
  rejectedVerifications: number;
}

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get<DashboardSummary>("/dashboard/summary");
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !summary) {
    return <DashboardError onRetry={fetchDashboard} />;
  }

  const isSystemEmpty =
    summary.totalAudits === 0 &&
    summary.totalFindings === 0 &&
    summary.totalCorrectiveActions === 0;

  // Data mapping for breakdown cards
  const auditStatusItems: StatusItem[] = [
    { label: "Planned", count: summary.plannedAudits, colorClass: "bg-blue-500" },
    { label: "In Progress", count: summary.inProgressAudits, colorClass: "bg-amber-500" },
    { label: "Completed", count: summary.completedAudits, colorClass: "bg-emerald-500" },
    { label: "Closed", count: summary.closedAudits, colorClass: "bg-purple-500" },
  ];

  const findingSeverityItems: StatusItem[] = [
    { label: "Critical Severity", count: summary.criticalFindings, colorClass: "bg-rose-600" },
    { label: "Major Severity", count: summary.majorFindings, colorClass: "bg-amber-500" },
    { label: "Minor Severity", count: summary.minorFindings, colorClass: "bg-blue-500" },
  ];

  const actionStatusItems: StatusItem[] = [
    { label: "Open", count: summary.openCorrectiveActions, colorClass: "bg-amber-500" },
    { label: "In Progress", count: summary.inProgressCorrectiveActions, colorClass: "bg-blue-600" },
    { label: "Completed", count: summary.completedCorrectiveActions, colorClass: "bg-emerald-500" },
    { label: "Verified", count: summary.verifiedCorrectiveActions, colorClass: "bg-purple-600" },
    { label: "Closed", count: summary.closedCorrectiveActions, colorClass: "bg-slate-600" },
  ];

  const verificationItems: StatusItem[] = [
    { label: "Pending Verification", count: summary.pendingVerifications, colorClass: "bg-amber-500" },
    { label: "Approved Verification", count: summary.approvedVerifications, colorClass: "bg-emerald-600" },
    { label: "Rejected Verification", count: summary.rejectedVerifications, colorClass: "bg-rose-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor your organization's audit, findings and corrective action activities.
          </p>
        </div>
      </div>

      {/* Overdue Alert Banner if overdue items exist */}
      {summary.overdueCorrectiveActions > 0 && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {summary.overdueCorrectiveActions} Overdue Corrective Action(s)
                </h4>
                <p className="text-xs text-amber-700">
                  Action items have passed their target completion deadline and require immediate review.
                </p>
              </div>
            </div>
            <Badge variant="danger" size="md">
              Requires Attention
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Audits"
          value={summary.totalAudits}
          icon={ClipboardList}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
          subtext={`${summary.plannedAudits} Planned • ${summary.inProgressAudits} In Progress`}
        />

        <StatCard
          title="Total Findings"
          value={summary.totalFindings}
          icon={AlertTriangle}
          iconColorClass="text-amber-600"
          iconBgClass="bg-amber-50"
          subtext={`${summary.openFindings} Open • ${summary.criticalFindings} Critical`}
          badge={
            summary.criticalFindings > 0 ? (
              <Badge variant="danger" size="sm">
                {summary.criticalFindings} Critical
              </Badge>
            ) : undefined
          }
        />

        <StatCard
          title="Corrective Actions"
          value={summary.totalCorrectiveActions}
          icon={Wrench}
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
          subtext={`${summary.completedCorrectiveActions + summary.verifiedCorrectiveActions} Completed/Verified`}
        />

        <StatCard
          title="Overdue Actions"
          value={summary.overdueCorrectiveActions}
          icon={Clock}
          iconColorClass={summary.overdueCorrectiveActions > 0 ? "text-rose-600" : "text-slate-600"}
          iconBgClass={summary.overdueCorrectiveActions > 0 ? "bg-rose-50" : "bg-slate-100"}
          subtext={
            summary.overdueCorrectiveActions > 0
              ? "Deadline passed"
              : "All actions on schedule"
          }
          badge={
            summary.overdueCorrectiveActions > 0 ? (
              <Badge variant="danger" size="sm">
                Overdue
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                On Track
              </Badge>
            )
          }
          highlightWarning={summary.overdueCorrectiveActions > 0}
        />
      </div>

      {isSystemEmpty ? (
        <DashboardEmpty />
      ) : (
        /* Analytical Visual Breakdowns Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatusBreakdown
            title="Audit Overview"
            subtitle="Status distribution of all planned and active audits"
            total={summary.totalAudits}
            items={auditStatusItems}
            icon={ClipboardList}
          />

          <StatusBreakdown
            title="Finding Severity"
            subtitle="Categorization of non-conformances by severity level"
            total={summary.totalFindings}
            items={findingSeverityItems}
            icon={AlertTriangle}
          />

          <StatusBreakdown
            title="Corrective Action Status"
            subtitle="Lifecycle progress of corrective action plans (CAPA)"
            total={summary.totalCorrectiveActions}
            items={actionStatusItems}
            icon={Wrench}
          />
        </div>
      )}

      {/* Verification Lifecycle Breakdown */}
      {!isSystemEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatusBreakdown
            title="Verification & Closure"
            subtitle="Review and sign-off status for completed corrective actions"
            total={summary.totalVerifications}
            items={verificationItems}
            icon={FileCheck}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
