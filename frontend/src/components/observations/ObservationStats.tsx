import React from "react";
import StatCard from "../dashboard/StatCard";
import { Eye, ClipboardList, ListChecks, UserCheck } from "lucide-react";
import type { Audit, Observation } from "../../pages/Observations";

interface ObservationStatsProps {
  auditsCount: number;
  selectedAudit: Audit | null;
  observations: Observation[];
}

export const ObservationStats: React.FC<ObservationStatsProps> = ({
  auditsCount,
  selectedAudit,
  observations,
}) => {
  const totalObs = observations.length;
  const linkedChecklistItems = observations.filter(
    (o) => o.checklistItemId || o.checklistItemQuestion
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Audits"
        value={auditsCount}
        icon={ClipboardList}
        iconColorClass="text-blue-600"
        iconBgClass="bg-blue-50"
        subtext="Audit plans in system"
      />

      <StatCard
        title="Selected Audit"
        value={selectedAudit ? `#${selectedAudit.id}` : "None"}
        icon={Eye}
        iconColorClass="text-indigo-600"
        iconBgClass="bg-indigo-50"
        subtext={selectedAudit ? selectedAudit.title : "Choose an audit below"}
      />

      <StatCard
        title="Total Observations"
        value={selectedAudit ? totalObs : "N/A"}
        icon={ListChecks}
        iconColorClass="text-amber-600"
        iconBgClass="bg-amber-50"
        subtext={
          selectedAudit
            ? `${totalObs} field finding(s) recorded`
            : "No audit selected"
        }
      />

      <StatCard
        title="Linked Criteria"
        value={selectedAudit ? linkedChecklistItems : "N/A"}
        icon={UserCheck}
        iconColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
        subtext={
          selectedAudit
            ? `${linkedChecklistItems} items tied to checklists`
            : "Select an audit to inspect"
        }
      />
    </div>
  );
};

export default ObservationStats;
