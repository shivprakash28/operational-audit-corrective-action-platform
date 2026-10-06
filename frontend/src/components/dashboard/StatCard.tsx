import React from "react";
import Card, { CardContent } from "../ui/Card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  subtext?: string;
  badge?: React.ReactNode;
  highlightWarning?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-blue-600",
  iconBgClass = "bg-blue-50",
  subtext,
  badge,
  highlightWarning = false,
}) => {
  return (
    <Card className={`stat-card ${highlightWarning ? "stat-card-warning" : ""}`}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${iconBgClass}`}>
              <Icon className={`h-5 w-5 ${iconColorClass}`} />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {badge}
          </div>
        </div>

        {subtext && (
          <p className="mt-3 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center gap-1.5">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
