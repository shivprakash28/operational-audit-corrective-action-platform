import React from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Badge from "../ui/Badge";
import { CheckSquare, ChevronRight, List } from "lucide-react";
import type { ChecklistTemplate } from "../../pages/Checklists";

interface ChecklistTemplateListProps {
  templates: ChecklistTemplate[];
  selectedTemplateId: number | null;
  onSelectTemplate: (template: ChecklistTemplate) => void;
  searchTerm: string;
  onSearchChange: (query: string) => void;
}

export const ChecklistTemplateList: React.FC<ChecklistTemplateListProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  searchTerm,
  onSearchChange,
}) => {
  const filtered = templates.filter((t) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-200">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          Checklist Templates ({templates.length})
        </CardTitle>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs py-1.5 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </CardHeader>

      <CardContent className="p-3 overflow-y-auto max-h-[500px] space-y-2 flex-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No checklist templates found.
          </p>
        ) : (
          filtered.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId;
            const itemCount = tmpl.items?.length ?? 0;

            return (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {tmpl.name}
                    </h4>
                    {tmpl.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {tmpl.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                      isSelected ? "text-blue-600" : "text-slate-300"
                    }`}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-mono">ID: #{tmpl.id}</span>
                  <Badge variant={itemCount > 0 ? "primary" : "info"} size="sm">
                    <List className="h-3 w-3 mr-1" />
                    {itemCount} item(s)
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistTemplateList;
