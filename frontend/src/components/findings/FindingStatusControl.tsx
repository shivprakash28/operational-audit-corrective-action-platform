import React from "react";
import Badge from "../ui/Badge";
import type { FindingStatus } from "../../pages/Findings";

interface FindingStatusControlProps {
  status: FindingStatus;
  onChangeStatus: (newStatus: FindingStatus) => void;
  disabled?: boolean;
}

export const FindingStatusControl: React.FC<FindingStatusControlProps> = ({
  status,
  onChangeStatus,
  disabled = false,
}) => {
  const getStatusBadge = (st: FindingStatus) => {
    switch (st) {
      case "OPEN":
        return <Badge variant="warning">Open</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="primary">In Progress</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
      case "CLOSED":
        return <Badge variant="info">Closed</Badge>;
      default:
        return <Badge variant="info">{st}</Badge>;
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <select
        value={status}
        onChange={(e) => onChangeStatus(e.target.value as FindingStatus)}
        disabled={disabled}
        className="text-xs font-semibold py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        title="Click to quick-change finding status"
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>
      {getStatusBadge(status)}
    </div>
  );
};

export default FindingStatusControl;
