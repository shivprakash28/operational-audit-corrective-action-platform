import React from "react";
import { Search, Filter, X } from "lucide-react";
import Card, { CardContent } from "../ui/Card";

interface AuditFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  departments: { id: number; name: string }[];
  onClearFilters: () => void;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchTerm !== "" || selectedStatus !== "ALL" || selectedDepartment !== "ALL";

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audits by title, scope, objectives, or criteria..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 min-w-[150px]">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:inline-block" />
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="min-w-[160px]">
              <select
                value={selectedDepartment}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 w-full"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-2 rounded hover:bg-rose-50 transition-colors"
                title="Clear all search & filter criteria"
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

export default AuditFilters;
