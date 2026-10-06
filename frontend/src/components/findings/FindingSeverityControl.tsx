import React from "react";
import Badge from "../ui/Badge";
import type { FindingSeverity } from "../../pages/Findings";

interface FindingSeverityControlProps {
  severity: FindingSeverity;
  onChangeSeverity: (newSeverity: FindingSeverity) => void;
  disabled?: boolean;
}

export const FindingSeverityControl: React.FC<FindingSeverityControlProps> = ({
  severity,
  onChangeSeverity,
  disabled = false,
}) => {
  const getSeverityBadge = (sev: FindingSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return <Badge variant="danger">CRITICAL</Badge>;
      case "MAJOR":
        return <Badge variant="warning">MAJOR</Badge>;
      case "MINOR":
        return <Badge variant="primary">MINOR</Badge>;
      default:
        return <Badge variant="info">{sev}</Badge>;
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <select
        value={severity}
        onChange={(e) => onChangeSeverity(e.target.value as FindingSeverity)}
        disabled={disabled}
        className="text-xs font-semibold py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        title="Click to quick-change finding severity"
      >
        <option value="CRITICAL">CRITICAL</option>
        <option value="MAJOR">MAJOR</option>
        <option value="MINOR">MINOR</option>
      </select>
      {getSeverityBadge(severity)}
    </div>
  );
};

export default FindingSeverityControl;
