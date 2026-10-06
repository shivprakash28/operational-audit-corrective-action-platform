import React from "react";
import Badge from "../ui/Badge";
import type { CorrectiveActionStatus } from "../../pages/CorrectiveActions";

interface CorrectiveActionStatusControlProps {
  status: CorrectiveActionStatus;
  onChangeStatus: (newStatus: CorrectiveActionStatus) => void;
  disabled?: boolean;
}

export const CorrectiveActionStatusControl: React.FC<CorrectiveActionStatusControlProps> = ({
  status,
  onChangeStatus,
  disabled = false,
}) => {
  const getStatusBadge = (st: CorrectiveActionStatus) => {
    switch (st) {
      case "OPEN":
        return <Badge variant="warning">Open</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="primary">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "VERIFIED":
        return <Badge variant="info">Verified</Badge>;
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
        onChange={(e) => onChangeStatus(e.target.value as CorrectiveActionStatus)}
        disabled={disabled}
        className="text-xs font-semibold py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        title="Quick update status"
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="VERIFIED">Verified</option>
        <option value="CLOSED">Closed</option>
      </select>
      {getStatusBadge(status)}
    </div>
  );
};

export default CorrectiveActionStatusControl;
