import React from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import { Link2 } from "lucide-react";
import type { Audit, ChecklistTemplate } from "../../pages/Checklists";

interface ChecklistAssignmentProps {
  audits: Audit[];
  templates: ChecklistTemplate[];
  selectedAuditId: string;
  onSelectAudit: (id: string) => void;
  selectedTemplateId: string;
  onSelectTemplateId: (id: string) => void;
  onAssign: () => Promise<void>;
  loading?: boolean;
}

export const ChecklistAssignment: React.FC<ChecklistAssignmentProps> = ({
  audits,
  templates,
  selectedAuditId,
  onSelectAudit,
  selectedTemplateId,
  onSelectTemplateId,
  onAssign,
  loading = false,
}) => {
  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-blue-600" />
          Assign Checklist to Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            1. Target Audit *
          </label>
          <select
            value={selectedAuditId}
            onChange={(e) => onSelectAudit(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            <option value="">-- Select Audit --</option>
            {audits.map((a) => (
              <option key={a.id} value={a.id.toString()}>
                #{a.id} — {a.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            2. Checklist Template *
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => onSelectTemplateId(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            <option value="">-- Select Template --</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id.toString()}>
                #{t.id} — {t.name} ({t.items?.length ?? 0} items)
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          onClick={onAssign}
          disabled={loading || !selectedAuditId || !selectedTemplateId}
          className="w-full mt-2 text-xs py-2"
        >
          {loading ? "Assigning..." : "Assign Checklist"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChecklistAssignment;
