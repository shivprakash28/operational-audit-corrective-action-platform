import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import AssignmentStats from "../components/assignments/AssignmentStats";
import AssignmentAuditSelector from "../components/assignments/AssignmentAuditSelector";
import AssignmentTable from "../components/assignments/AssignmentTable";
import AssignmentFormModal from "../components/assignments/AssignmentFormModal";
import { UserCheck, Plus, RefreshCw, AlertCircle, CheckCircle2, Users } from "lucide-react";

export interface Audit {
  id: number;
  title: string;
  scope?: string;
  departmentId: number;
  departmentName?: string;
  status?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
}

export interface Assignment {
  id: number;
  auditId: number;
  auditorId: number;
  auditorName?: string;
  auditorEmail?: string;
  auditorRole?: string;
  auditorDepartmentId?: number;
  auditorDepartmentName?: string;
  assignedAt?: string;
  auditor?: {
    id: number;
    email: string;
    role: string;
  };
}

export const Assignments: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");

  const [loadingAudits, setLoadingAudits] = useState<boolean>(true);
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string>("");
  const [assignmentError, setAssignmentError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Fetch all available audits
  const fetchAudits = useCallback(async () => {
    setLoadingAudits(true);
    setAuditError("");
    try {
      const response = await api.get("/audits");
      const data = response.data;

      let list: Audit[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.audits)) {
        list = data.audits;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setAudits(list);
      if (list.length > 0 && !selectedAuditId) {
        setSelectedAuditId(list[0].id.toString());
      }
    } catch (err: any) {
      console.error("Failed to fetch audits:", err);
      setAuditError(
        err?.response?.data?.message || "Unable to load audits. Please try again."
      );
    } finally {
      setLoadingAudits(false);
    }
  }, [selectedAuditId]);

  // Fetch assignments for selected audit
  const fetchAssignments = useCallback(async (auditId: string) => {
    if (!auditId) {
      setAssignments([]);
      return;
    }
    setLoadingAssignments(true);
    setAssignmentError("");
    try {
      const response = await api.get(`/audits/${auditId}/assignments`);
      const data = response.data;

      let list: Assignment[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.assignments)) {
        list = data.assignments;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setAssignments(list);
    } catch (err: any) {
      console.error("Failed to fetch assignments:", err);
      setAssignmentError(
        err?.response?.data?.message ||
          "Failed to load assignments for selected audit."
      );
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  useEffect(() => {
    if (selectedAuditId) {
      fetchAssignments(selectedAuditId);
    } else {
      setAssignments([]);
    }
  }, [selectedAuditId, fetchAssignments]);

  const handleSelectAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
  };

  const handleAssignAuditor = async (auditId: string, auditorId: number) => {
    setSubmitting(true);
    try {
      await api.post(`/audits/${auditId}/assign`, {
        auditorId,
      });

      showToast("Auditor assigned successfully.");

      if (auditId === selectedAuditId) {
        await fetchAssignments(auditId);
      } else {
        setSelectedAuditId(auditId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAuditObj =
    audits.find((a) => a.id.toString() === selectedAuditId) || null;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 animate-bounce-short">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Auditor Assignments
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Assign auditors to audits and manage audit responsibilities.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Assign Auditor
        </Button>
      </div>

      {/* Assignment Overview Statistics */}
      <AssignmentStats
        auditsCount={audits.length}
        selectedAudit={selectedAuditObj}
        assignments={assignments}
      />

      {/* Target Audit Selector */}
      {loadingAudits ? (
        <Card className="p-4 animate-pulse">
          <div className="h-5 w-48 bg-slate-200 rounded" />
        </Card>
      ) : auditError ? (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-4 flex items-center justify-between text-rose-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{auditError}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAudits}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AssignmentAuditSelector
          audits={audits}
          selectedAuditId={selectedAuditId}
          onSelectAudit={handleSelectAudit}
          selectedAudit={selectedAuditObj}
        />
      )}

      {/* Assignment Table / List Section */}
      {!selectedAuditId ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No audit selected
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select an audit from the dropdown above to view assigned team members or assign new auditors.
            </p>
          </CardContent>
        </Card>
      ) : loadingAssignments ? (
        <Card className="p-8 text-center animate-pulse space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
        </Card>
      ) : assignmentError ? (
        <Card className="max-w-xl mx-auto border-rose-200 bg-rose-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load assignments
              </h3>
              <p className="text-sm text-slate-600 mt-1">{assignmentError}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                onClick={() => fetchAssignments(selectedAuditId)}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : assignments.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                No auditors assigned
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Assign an auditor to begin managing responsibilities for this audit.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Assign Auditor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Assigned Auditors ({assignments.length})
            </h3>
          </div>
          <AssignmentTable assignments={assignments} />
        </div>
      )}

      {/* Assign Auditor Form Modal */}
      <AssignmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAssignAuditor}
        audits={audits}
        defaultAuditId={selectedAuditId}
        loading={submitting}
      />
    </div>
  );
};

export default Assignments;