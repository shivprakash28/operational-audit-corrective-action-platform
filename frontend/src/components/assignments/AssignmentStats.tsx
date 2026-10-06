import React from "react";
import StatCard from "../dashboard/StatCard";
import { ClipboardList, UserCheck, Users, ShieldAlert } from "lucide-react";
import type { Audit, Assignment } from "../../pages/Assignments";

interface AssignmentStatsProps {
  auditsCount: number;
  selectedAudit: Audit | null;
  assignments: Assignment[];
}

export const AssignmentStats: React.FC<AssignmentStatsProps> = ({
  auditsCount,
  selectedAudit,
  assignments,
}) => {
  const assignedCount = assignments.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Audits"
        value={auditsCount}
        icon={ClipboardList}
        iconColorClass="text-blue-600"
        iconBgClass="bg-blue-50"
        subtext="Available for auditor allocation"
      />

      <StatCard
        title="Selected Audit"
        value={selectedAudit ? `#${selectedAudit.id}` : "None"}
        icon={UserCheck}
        iconColorClass="text-indigo-600"
        iconBgClass="bg-indigo-50"
        subtext={selectedAudit ? selectedAudit.title : "Select an audit below"}
      />

      <StatCard
        title="Assigned Auditors"
        value={selectedAudit ? assignedCount : "N/A"}
        icon={Users}
        iconColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
        subtext={
          selectedAudit
            ? `${assignedCount} team member(s) assigned`
            : "No audit selected"
        }
      />

      <StatCard
        title="Assignment Status"
        value={
          !selectedAudit
            ? "Pending"
            : assignedCount > 0
            ? "Assigned"
            : "Unassigned"
        }
        icon={ShieldAlert}
        iconColorClass={
          assignedCount > 0 ? "text-emerald-600" : "text-amber-600"
        }
        iconBgClass={assignedCount > 0 ? "bg-emerald-50" : "bg-amber-50"}
        subtext={
          !selectedAudit
            ? "Select an audit to inspect"
            : assignedCount > 0
            ? "Operational team active"
            : "Requires auditor assignment"
        }
        highlightWarning={selectedAudit !== null && assignedCount === 0}
      />
    </div>
  );
};

export default AssignmentStats;
