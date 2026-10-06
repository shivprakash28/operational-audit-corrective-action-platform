import React from "react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { Search, Filter, RotateCcw } from "lucide-react";

interface VerificationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export const VerificationFilters: React.FC<VerificationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onReset,
  isFiltered,
}) => {
  return (
    <Card className="bg-slate-50/50">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search comments, verifier, CAPA title..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Status filter & Reset */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {isFiltered && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationFilters;
