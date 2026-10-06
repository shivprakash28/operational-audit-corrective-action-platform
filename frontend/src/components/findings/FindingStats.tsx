import React from "react";
import StatCard from "../dashboard/StatCard";
import Card, { CardContent } from "../ui/Card";
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import type { Finding } from "../../pages/Findings";

interface FindingStatsProps {
  findings: Finding[];
}

export const FindingStats: React.FC<FindingStatsProps> = ({ findings }) => {
  const total = findings.length;
  const critical = findings.filter((f) => f.severity === "CRITICAL").length;
  const major = findings.filter((f) => f.severity === "MAJOR").length;
  const minor = findings.filter((f) => f.severity === "MINOR").length;
  const openOrActive = findings.filter(
    (f) => f.status === "OPEN" || f.status === "IN_PROGRESS"
  ).length;

  const criticalPct = total > 0 ? ((critical / total) * 100).toFixed(0) : "0";
  const majorPct = total > 0 ? ((major / total) * 100).toFixed(0) : "0";
  const minorPct = total > 0 ? ((minor / total) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Findings"
          value={total}
          icon={AlertTriangle}
          iconColorClass="text-amber-600"
          iconBgClass="bg-amber-50"
          subtext={`${openOrActive} open or active issue(s)`}
        />

        <StatCard
          title="Critical Severity"
          value={critical}
          icon={ShieldAlert}
          iconColorClass="text-rose-600"
          iconBgClass="bg-rose-50"
          subtext="Requires immediate CAPA response"
          highlightWarning={critical > 0}
        />

        <StatCard
          title="Major Severity"
          value={major}
          icon={Clock}
          iconColorClass="text-amber-600"
          iconBgClass="bg-amber-50"
          subtext="Significant process non-conformance"
        />

        <StatCard
          title="Minor Severity"
          value={minor}
          icon={CheckCircle2}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
          subtext="Minor procedural observations"
        />
      </div>

      {/* Severity Distribution Visualization Bar */}
      {total > 0 && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Severity Breakdown</span>
              <span>
                {critical} Critical • {major} Major • {minor} Minor
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {critical > 0 && (
                <div
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{ width: `${criticalPct}%` }}
                  title={`Critical: ${critical} (${criticalPct}%)`}
                />
              )}
              {major > 0 && (
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${majorPct}%` }}
                  title={`Major: ${major} (${majorPct}%)`}
                />
              )}
              {minor > 0 && (
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${minorPct}%` }}
                  title={`Minor: ${minor} (${minorPct}%)`}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FindingStats;
