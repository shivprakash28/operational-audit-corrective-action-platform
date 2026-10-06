import React from "react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import FindingSeverityControl from "./FindingSeverityControl";
import FindingStatusControl from "./FindingStatusControl";
import { formatDate } from "../../utils/date";
import { Eye, Edit2, FileText, User, Building } from "lucide-react";
import type { Finding, FindingSeverity, FindingStatus } from "../../pages/Findings";

interface FindingTableProps {
  findings: Finding[];
  onView: (finding: Finding) => void;
  onEdit: (finding: Finding) => void;
  onChangeSeverity: (findingId: number, newSeverity: FindingSeverity) => void;
  onChangeStatus: (findingId: number, newStatus: FindingStatus) => void;
  updatingId?: number | null;
}

export const FindingTable: React.FC<FindingTableProps> = ({
  findings,
  onView,
  onEdit,
  onChangeSeverity,
  onChangeStatus,
  updatingId = null,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Finding #ID
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Observation
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Responsible Dept
                </th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Owner
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
              {findings.map((finding) => {
                const isUpdating = updatingId === finding.id;

                const deptDisplay =
                  finding.responsibleDepartmentName ||
                  `Department #${finding.responsibleDepartmentId}`;

                const ownerDisplay =
                  finding.ownerName ||
                  finding.ownerEmail?.split("@")[0] ||
                  (finding.ownerId ? `User #${finding.ownerId}` : "Unassigned");

                const obsDisplay =
                  finding.observationDescription ||
                  `Observation #${finding.observationId}`;

                return (
                  <tr
                    key={finding.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          Finding #{finding.id}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-1 max-w-[180px]">
                          {finding.description}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <FindingSeverityControl
                        severity={finding.severity}
                        onChangeSeverity={(sev) =>
                          onChangeSeverity(finding.id, sev)
                        }
                        disabled={isUpdating}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <FindingStatusControl
                        status={finding.status}
                        onChangeStatus={(st) => onChangeStatus(finding.id, st)}
                        disabled={isUpdating}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 max-w-xs">
                        <FileText className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                        <span className="truncate" title={obsDisplay}>
                          {obsDisplay}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>{deptDisplay}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{ownerDisplay}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {formatDate(finding.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(finding)}
                          title="View Details"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(finding)}
                          title="Edit Finding"
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

export default FindingTable;
