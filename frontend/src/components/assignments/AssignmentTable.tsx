import React from "react";
import Card, { CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/date";
import { User } from "lucide-react";
import type { Assignment } from "../../pages/Assignments";

interface AssignmentTableProps {
  assignments: Assignment[];
}

export const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
}) => {
  const getRoleVariant = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "danger";
      case "AUDITOR":
        return "primary";
      case "MANAGEMENT":
        return "success";
      case "DEPARTMENT_OWNER":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Auditor Name
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Assigned Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((item) => {
                const nameDisplay =
                  item.auditorName ||
                  item.auditor?.email?.split("@")[0] ||
                  `Auditor #${item.auditorId}`;

                const emailDisplay =
                  item.auditorEmail || item.auditor?.email || "N/A";

                const roleDisplay =
                  item.auditorRole || item.auditor?.role || "AUDITOR";

                const deptDisplay =
                  item.auditorDepartmentName ||
                  (item.auditorDepartmentId
                    ? `Department #${item.auditorDepartmentId}`
                    : "N/A");

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {nameDisplay}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            ID: #{item.auditorId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-sm text-slate-700">
                      {emailDisplay}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getRoleVariant(roleDisplay)} size="sm">
                        {roleDisplay}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-sm font-medium text-slate-700">
                      {deptDisplay}
                    </td>

                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {formatDate(item.assignedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentTable;
