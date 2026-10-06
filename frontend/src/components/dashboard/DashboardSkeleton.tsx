import React from "react";
import Card, { CardContent } from "../ui/Card";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-200 rounded-md" />
        <div className="h-4 w-96 bg-slate-200 rounded-md" />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-9 w-9 bg-slate-200 rounded-lg" />
              </div>
              <div className="h-8 w-16 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-200 rounded pt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breakdown Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-80 flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-200 rounded-full" />
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
