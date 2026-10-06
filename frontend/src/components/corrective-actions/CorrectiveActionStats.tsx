import React from "react";
import StatCard from "../dashboard/StatCard";
import { Wrench, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";

interface CorrectiveActionStatsProps {
  actions: CorrectiveAction[];
  overdueCount: number;
}

export const CorrectiveActionStats: React.FC<CorrectiveActionStatsProps> = ({
  actions,
  overdueCount,
}) => {
  const total = actions.length;
  const openCount = actions.filter((a) => a.status === "OPEN").length;
  const inProgressCount = actions.filter((a) => a.status === "IN_PROGRESS").length;
  const completedCount = actions.filter((a) => a.status === "COMPLETED").length;
  const verifiedCount = actions.filter((a) => a.status === "VERIFIED").length;
  const closedCount = actions.filter((a) => a.status === "CLOSED").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Actions"
        value={total}
        icon={Wrench}
        iconColorClass="text-blue-600"
        iconBgClass="bg-blue-50"
        subtext={`${openCount} Open • ${inProgressCount} In Progress`}
      />

      <StatCard
        title="Overdue Actions"
        value={overdueCount}
        icon={Clock}
        iconColorClass={overdueCount > 0 ? "text-rose-600" : "text-slate-600"}
        iconBgClass={overdueCount > 0 ? "bg-rose-50" : "bg-slate-100"}
        subtext={
          overdueCount > 0
            ? "Requires immediate remediation"
            : "All remediation on schedule"
        }
        highlightWarning={overdueCount > 0}
      />

      <StatCard
        title="Completed / Verified"
        value={completedCount + verifiedCount}
        icon={CheckCircle2}
        iconColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
        subtext={`${completedCount} Completed • ${verifiedCount} Verified`}
      />

      <StatCard
        title="Closed Items"
        value={closedCount}
        icon={ShieldCheck}
        iconColorClass="text-purple-600"
        iconBgClass="bg-purple-50"
        subtext="Fully resolved & closed CAPAs"
      />
    </div>
  );
};

export default CorrectiveActionStats;
