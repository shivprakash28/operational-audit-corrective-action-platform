import React from "react";
import { FileText, Image as ImageIcon, FileSpreadsheet, FileArchive, File, FileCode } from "lucide-react";

interface FileTypeIconProps {
  fileName: string;
  fileUrl?: string;
  className?: string;
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileName, className = "h-5 w-5" }) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (["pdf"].includes(ext)) {
    return <FileText className={`${className} text-red-600`} />;
  }

  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(ext)) {
    return <ImageIcon className={`${className} text-indigo-600`} />;
  }

  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className={`${className} text-emerald-600`} />;
  }

  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) {
    return <FileText className={`${className} text-blue-600`} />;
  }

  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) {
    return <FileArchive className={`${className} text-amber-600`} />;
  }

  if (["json", "xml", "html", "css", "js", "ts"].includes(ext)) {
    return <FileCode className={`${className} text-purple-600`} />;
  }

  return <File className={`${className} text-slate-500`} />;
};

export default FileTypeIcon;
