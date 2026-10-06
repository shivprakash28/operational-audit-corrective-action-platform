import React from "react";
import Card, { CardContent } from "../ui/Card";
import { Search, Filter, X } from "lucide-react";

interface CorrectiveActionFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (st: string) => void;
  overdueFilter: string; // "ALL" | "OVERDUE" | "ON_TRACK"
  onOverdueFilterChange: (val: string) => void;
  onClearFilters: () => void;
}

export const CorrectiveActionFilters: React.FC<CorrectiveActionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  overdueFilter,
  onOverdueFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchTerm !== "" || selectedStatus !== "ALL" || overdueFilter !== "ALL";

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search corrective actions by title, description, finding, audit, or owner..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 min-w-[140px]">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:inline-block" />
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="py-2 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="VERIFIED">Verified</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Overdue Filter */}
            <div className="min-w-[140px]">
              <select
                value={overdueFilter}
                onChange={(e) => onOverdueFilterChange(e.target.value)}
                className="py-2 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 w-full"
              >
                <option value="ALL">All Deadline States</option>
                <option value="OVERDUE">Overdue Only</option>
                <option value="ON_TRACK">On Track</option>
              </select>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-2 rounded hover:bg-rose-50 transition-colors"
                title="Clear filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrectiveActionFilters;
