import React from "react";
import StatCard from "../dashboard/StatCard";
import { CheckSquare, ListChecks, CheckCircle2, Award } from "lucide-react";

interface ChecklistStatsProps {
  templatesCount: number;
  activeItemsCount: number;
  completedResponsesCount: number;
  complianceRate: number;
}

export const ChecklistStats: React.FC<ChecklistStatsProps> = ({
  templatesCount,
  activeItemsCount,
  completedResponsesCount,
  complianceRate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Checklist Templates"
        value={templatesCount}
        icon={CheckSquare}
        iconColorClass="text-blue-600"
        iconBgClass="bg-blue-50"
        subtext="Configured evaluation templates"
      />

      <StatCard
        title="Checklist Items"
        value={activeItemsCount}
        icon={ListChecks}
        iconColorClass="text-indigo-600"
        iconBgClass="bg-indigo-50"
        subtext="Standard verification criteria"
      />

      <StatCard
        title="Responses Submitted"
        value={completedResponsesCount}
        icon={CheckCircle2}
        iconColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
        subtext="Evaluated item responses"
      />

      <StatCard
        title="Compliance Rate"
        value={`${complianceRate.toFixed(0)}%`}
        icon={Award}
        iconColorClass={complianceRate >= 80 ? "text-emerald-600" : "text-amber-600"}
        iconBgClass={complianceRate >= 80 ? "bg-emerald-50" : "bg-amber-50"}
        subtext="Compliant audit criteria ratio"
      />
    </div>
  );
};

export default ChecklistStats;
