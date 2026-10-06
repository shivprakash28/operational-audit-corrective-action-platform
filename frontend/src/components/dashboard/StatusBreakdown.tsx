import React from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import type { LucideIcon } from "lucide-react";

export interface StatusItem {
  label: string;
  count: number;
  colorClass: string; // e.g. "bg-blue-600"
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
}

interface StatusBreakdownProps {
  title: string;
  total: number;
  items: StatusItem[];
  icon?: LucideIcon;
  subtitle?: string;
}

export const StatusBreakdown: React.FC<StatusBreakdownProps> = ({
  title,
  total,
  items,
  icon: Icon,
  subtitle,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {Icon && <Icon className="h-5 w-5 text-slate-400" />}
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Combined Stacked Progress Bar */}
          {total > 0 && (
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {items.map((item, idx) => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                if (percentage === 0) return null;
                return (
                  <div
                    key={idx}
                    className={`h-full ${item.colorClass} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                    title={`${item.label}: ${item.count} (${percentage.toFixed(0)}%)`}
                  />
                );
              })}
            </div>
          )}

          {/* List of Breakdown Items */}
          <div className="space-y-2.5">
            {items.map((item, idx) => {
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(0) : "0";
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.colorClass}`} />
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      {item.count}
                    </span>
                    <span className="text-xs font-medium text-slate-400 min-w-[36px] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs text-slate-500">
        <span>Total Count:</span>
        <span className="font-bold text-slate-800">{total}</span>
      </div>
    </Card>
  );
};

export default StatusBreakdown;
