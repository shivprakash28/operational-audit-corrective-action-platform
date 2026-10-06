import React from "react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatDate } from "../../utils/date";
import { Eye, Edit2, FileText, User } from "lucide-react";
import type { Observation } from "../../pages/Observations";

interface ObservationTableProps {
  observations: Observation[];
  onView: (obs: Observation) => void;
  onEdit: (obs: Observation) => void;
}

export const ObservationTable: React.FC<ObservationTableProps> = ({
  observations,
  onView,
  onEdit,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Observation ID & Audit
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Checklist Item Question
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Description / Finding
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {observations.map((obs) => {
                const authorDisplay =
                  obs.createdByName ||
                  obs.createdByEmail?.split("@")[0] ||
                  `User #${obs.createdById}`;

                const checklistQuestion =
                  obs.checklistItemQuestion || `Checklist Item #${obs.checklistItemId}`;

                return (
                  <tr
                    key={obs.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          Observation #{obs.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          {obs.auditTitle ? obs.auditTitle : `Audit #${obs.auditId}`}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800 max-w-xs">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate" title={checklistQuestion}>
                          {checklistQuestion}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-sm text-slate-700 max-w-md">
                      <p className="line-clamp-2" title={obs.description}>
                        {obs.description}
                      </p>
                      {obs.evidenceUrl && (
                        <span className="inline-block mt-1">
                          <Badge variant="info" size="sm">Evidence Attached</Badge>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{authorDisplay}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {formatDate(obs.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(obs)}
                          title="View Details"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(obs)}
                          title="Edit Observation"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default ObservationTable;
