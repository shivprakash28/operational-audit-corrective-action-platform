import React from "react";
import StatCard from "../dashboard/StatCard";
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { Audit } from "../../pages/Audits";

interface AuditStatsProps {
  audits: Audit[];
}

export const AuditStats: React.FC<AuditStatsProps> = ({ audits }) => {
  const total = audits.length;
  const planned = audits.filter((a) => a.status === "PLANNED").length;
  const inProgress = audits.filter((a) => a.status === "IN_PROGRESS").length;
  const completed = audits.filter(
    (a) => a.status === "COMPLETED" || a.status === "CLOSED"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Audits"
        value={total}
        icon={ClipboardList}
        iconColorClass="text-blue-600"
        iconBgClass="bg-blue-50"
        subtext="Total registered audit plans"
      />

      <StatCard
        title="Planned"
        value={planned}
        icon={Clock}
        iconColorClass="text-amber-600"
        iconBgClass="bg-amber-50"
        subtext="Scheduled & awaiting start"
      />

      <StatCard
        title="In Progress"
        value={inProgress}
        icon={AlertCircle}
        iconColorClass="text-indigo-600"
        iconBgClass="bg-indigo-50"
        subtext="Currently undergoing field evaluation"
      />

      <StatCard
        title="Completed"
        value={completed}
        icon={CheckCircle2}
        iconColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
        subtext="Finished or closed audits"
      />
    </div>
  );
};

export default AuditStats;
