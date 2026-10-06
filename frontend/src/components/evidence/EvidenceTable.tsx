import React from "react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import FileTypeIcon from "./FileTypeIcon";
import type { EvidenceItem } from "./EvidenceStats";
import type { CorrectiveAction } from "../../pages/CorrectiveActions";
import { Download, Eye, FileText, Search, Filter } from "lucide-react";
import { formatDate } from "../../utils/date";

interface EvidenceTableProps {
  evidenceList: EvidenceItem[];
  correctiveActions: CorrectiveAction[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onViewDetails: (item: EvidenceItem) => void;
  onDownload: (item: EvidenceItem) => void;
  downloadingId: number | null;
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({
  evidenceList,
  correctiveActions,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onViewDetails,
  onDownload,
  downloadingId,
}) => {
  const getActionTitle = (actionId: number) => {
    const act = correctiveActions.find((a) => a.id === actionId);
    return act ? act.title : `CAPA #${actionId}`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search file name, uploader..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Type:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All File Types</option>
              <option value="DOCUMENTS">Documents (PDF, DOCX, TXT)</option>
              <option value="IMAGES">Images (PNG, JPG, SVG)</option>
              <option value="SPREADSHEETS">Spreadsheets (XLS, CSV)</option>
              <option value="ARCHIVES">Archives (ZIP, RAR)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {evidenceList.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No evidence files found</h3>
            <p className="mt-1 text-xs text-slate-500">
              {searchTerm || selectedCategory !== "ALL"
                ? "Try adjusting your search query or file type filter."
                : "No supporting evidence attachments have been uploaded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">File Name & Type</th>
                  <th scope="col" className="px-6 py-3.5">Corrective Action</th>
                  <th scope="col" className="px-6 py-3.5">Uploaded By</th>
                  <th scope="col" className="px-6 py-3.5">Uploaded Date</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {evidenceList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* File Name & Type */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                          <FileTypeIcon fileName={item.fileName} />
                        </div>
                        <div className="max-w-xs truncate">
                          <p className="font-semibold text-slate-900 truncate" title={item.fileName}>
                            {item.fileName}
                          </p>
                          <p className="text-xs text-slate-400 uppercase">
                            {item.fileName.split(".").pop() || "FILE"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Corrective Action */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 mb-0.5">
                          CAPA #{item.correctiveActionId}
                        </span>
                        <p className="text-xs text-slate-600 truncate" title={getActionTitle(item.correctiveActionId)}>
                          {getActionTitle(item.correctiveActionId)}
                        </p>
                      </div>
                    </td>

                    {/* Uploaded By */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.uploadedByName || "User #" + (item.uploadedById || "N/A")}</p>
                        {item.uploadedByEmail && (
                          <p className="text-xs text-slate-400">{item.uploadedByEmail}</p>
                        )}
                      </div>
                    </td>

                    {/* Uploaded Date */}
                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(item.uploadedAt)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onDownload(item)}
                          disabled={downloadingId === item.id}
                          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800"
                        >
                          <Download className={`h-3.5 w-3.5 ${downloadingId === item.id ? "animate-bounce" : ""}`} />
                          <span>{downloadingId === item.id ? "Downloading..." : "Download"}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvidenceTable;
