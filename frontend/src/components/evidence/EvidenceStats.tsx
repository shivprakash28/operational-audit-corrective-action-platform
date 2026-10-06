import React from "react";
import Card, { CardContent } from "../ui/Card";
import { Files, FileText, Image as ImageIcon, FileSpreadsheet } from "lucide-react";

export interface EvidenceItem {
  id: number;
  correctiveActionId: number;
  uploadedById?: number;
  uploadedByName?: string;
  uploadedByEmail?: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt?: string;
}

interface EvidenceStatsProps {
  evidenceList: EvidenceItem[];
}

export const EvidenceStats: React.FC<EvidenceStatsProps> = ({ evidenceList }) => {
  const totalFiles = evidenceList.length;

  const documentCount = evidenceList.filter((item) => {
    const ext = item.fileName.split(".").pop()?.toLowerCase() || "";
    return ["pdf", "doc", "docx", "txt", "rtf"].includes(ext);
  }).length;

  const imageCount = evidenceList.filter((item) => {
    const ext = item.fileName.split(".").pop()?.toLowerCase() || "";
    return ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext);
  }).length;

  const spreadsheetCount = evidenceList.filter((item) => {
    const ext = item.fileName.split(".").pop()?.toLowerCase() || "";
    return ["xls", "xlsx", "csv"].includes(ext);
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Evidence */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Evidence Files</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalFiles}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Uploaded attachments</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Files className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents & Reports</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{documentCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">PDF & Word documents</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Photos & Scans</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{imageCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Image proofs</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <ImageIcon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheets & Data */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Spreadsheets & Data</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{spreadsheetCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Excel & CSV files</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidenceStats;
