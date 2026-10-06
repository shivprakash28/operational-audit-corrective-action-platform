import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import FindingStats from "../components/findings/FindingStats";
import ObservationAuditSelector from "../components/observations/ObservationAuditSelector";
import FindingFilters from "../components/findings/FindingFilters";
import FindingTable from "../components/findings/FindingTable";
import FindingDetailsModal from "../components/findings/FindingDetailsModal";
import FindingFormModal from "../components/findings/FindingFormModal";
import { Plus, AlertTriangle, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export type FindingSeverity = "MINOR" | "MAJOR" | "CRITICAL";
export type FindingStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

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

export interface ObservationOption {
  id: number;
  description: string;
}

export interface Finding {
  id: number;
  auditId: number;
  auditTitle?: string;
  observationId: number;
  observationDescription?: string;
  severity: FindingSeverity;
  responsibleDepartmentId: number;
  responsibleDepartmentName?: string;
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  status: FindingStatus;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const Findings: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  const [observations, setObservations] = useState<ObservationOption[]>([]);

  const [loadingAudits, setLoadingAudits] = useState<boolean>(true);
  const [loadingFindings, setLoadingFindings] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string>("");
  const [findingError, setFindingError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [findingToEdit, setFindingToEdit] = useState<Finding | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [findingToView, setFindingToView] = useState<Finding | null>(null);

  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // 1. Fetch Audits
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

  // 2. Fetch Findings for selected Audit
  const fetchFindings = useCallback(async (auditId: string) => {
    if (!auditId) {
      setFindings([]);
      return;
    }
    setLoadingFindings(true);
    setFindingError("");
    try {
      const response = await api.get(`/audits/${auditId}/findings`);
      const data = response.data;
      let list: Finding[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.findings)) {
        list = data.findings;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setFindings(list);
    } catch (err: any) {
      console.error("Failed to fetch findings:", err);
      setFindingError(
        err?.response?.data?.message ||
          "Failed to load findings for selected audit."
      );
    } finally {
      setLoadingFindings(false);
    }
  }, []);

  // 3. Fetch Observations for selected Audit to populate form dropdown
  const fetchObservationsForAudit = useCallback(async (auditId: string) => {
    if (!auditId) {
      setObservations([]);
      return;
    }
    try {
      const res = await api.get(`/audits/${auditId}/observations`);
      const data = res.data;
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.observations)) {
        list = data.observations;
      }
      setObservations(
        list.map((o) => ({
          id: o.id,
          description: o.description,
        }))
      );
    } catch {
      setObservations([]);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  useEffect(() => {
    if (selectedAuditId) {
      fetchFindings(selectedAuditId);
      fetchObservationsForAudit(selectedAuditId);
    } else {
      setFindings([]);
      setObservations([]);
    }
  }, [selectedAuditId, fetchFindings, fetchObservationsForAudit]);

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return findings.filter((item) => {
      // Severity Filter
      if (selectedSeverity !== "ALL") {
        if (item.severity !== selectedSeverity) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus !== "ALL") {
        if (item.status !== selectedStatus) {
          return false;
        }
      }

      // Search Filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const descMatch = item.description?.toLowerCase().includes(query);
        const obsMatch = item.observationDescription?.toLowerCase().includes(query);
        const ownerMatch = item.ownerName?.toLowerCase().includes(query);
        const deptMatch = item.responsibleDepartmentName?.toLowerCase().includes(query);
        const idMatch = item.id.toString().includes(query);

        if (!descMatch && !obsMatch && !ownerMatch && !deptMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [findings, searchTerm, selectedSeverity, selectedStatus]);

  // Handlers
  const handleOpenCreateModal = () => {
    setFindingToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (finding: Finding) => {
    setFindingToEdit(finding);
    setIsFormOpen(true);
  };

  const handleOpenViewModal = async (finding: Finding) => {
    setFindingToView(finding);
    setIsDetailsOpen(true);
    try {
      const res = await api.get(`/findings/${finding.id}`);
      if (res.data) {
        setFindingToView(res.data);
      }
    } catch {
      // Use cached object
    }
  };

  const handleSaveFinding = async (data: {
    auditId: number;
    observationId: number;
    severity: FindingSeverity;
    responsibleDepartmentId: number;
    ownerId?: number;
    status: FindingStatus;
    description: string;
  }) => {
    setFormSubmitting(true);
    try {
      const payload = {
        auditId: data.auditId,
        observationId: data.observationId,
        severity: data.severity,
        responsibleDepartmentId: data.responsibleDepartmentId,
        ownerId: data.ownerId || undefined,
        status: data.status,
        description: data.description,
      };

      if (findingToEdit) {
        await api.put(`/findings/${findingToEdit.id}`, payload);
        showToast(`Finding #${findingToEdit.id} updated successfully.`);
      } else {
        await api.post(`/audits/${data.auditId}/findings`, payload);
        showToast("Finding created successfully.");
      }

      await fetchFindings(data.auditId.toString());
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleChangeSeverity = async (findingId: number, newSeverity: FindingSeverity) => {
    setUpdatingId(findingId);
    try {
      await api.patch(`/findings/${findingId}/severity`, { severity: newSeverity });
      showToast(`Finding #${findingId} severity updated to ${newSeverity}.`);
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? { ...f, severity: newSeverity } : f))
      );
    } catch (err: any) {
      console.error("Failed to update severity:", err);
      showToast(err?.response?.data?.message || "Failed to update severity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeStatus = async (findingId: number, newStatus: FindingStatus) => {
    setUpdatingId(findingId);
    try {
      await api.patch(`/findings/${findingId}/status`, { status: newStatus });
      showToast(`Finding #${findingId} status updated to ${newStatus}.`);
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? { ...f, status: newStatus } : f))
      );
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedSeverity("ALL");
    setSelectedStatus("ALL");
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
            Audit Findings
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Identify, classify and manage findings discovered during audits.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Finding
        </Button>
      </div>

      {/* Finding Statistics Overview */}
      <FindingStats findings={findings} />

      {/* Audit Target Selector */}
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
        <ObservationAuditSelector
          audits={audits}
          selectedAuditId={selectedAuditId}
          onSelectAudit={setSelectedAuditId}
          selectedAudit={selectedAuditObj}
        />
      )}

      {/* Search & Filters Toolbar */}
      <FindingFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onClearFilters={handleClearFilters}
      />

      {/* Finding Table / Main Workspace */}
      {!selectedAuditId ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Select an audit
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Choose an audit from the dropdown above to view recorded non-conformance findings.
            </p>
          </CardContent>
        </Card>
      ) : loadingFindings ? (
        <Card className="p-8 text-center animate-pulse space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
        </Card>
      ) : findingError ? (
        <Card className="max-w-xl mx-auto border-rose-200 bg-rose-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load findings
              </h3>
              <p className="text-sm text-slate-600 mt-1">{findingError}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                onClick={() => fetchFindings(selectedAuditId)}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredFindings.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {findings.length === 0
                  ? "No findings recorded"
                  : "No matching findings"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {findings.length === 0
                  ? "Create a finding to document an issue identified during the audit."
                  : "No findings match the current search or filter criteria."}
              </p>
            </div>
            {findings.length === 0 ? (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Finding
              </Button>
            ) : (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Search & Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <FindingTable
          findings={filteredFindings}
          onView={handleOpenViewModal}
          onEdit={handleOpenEditModal}
          onChangeSeverity={handleChangeSeverity}
          onChangeStatus={handleChangeStatus}
          updatingId={updatingId}
        />
      )}

      {/* Create / Edit Finding Modal */}
      <FindingFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFindingToEdit(null);
        }}
        onSubmit={handleSaveFinding}
        audits={audits}
        defaultAuditId={selectedAuditId}
        observations={observations}
        findingToEdit={findingToEdit}
        loading={formSubmitting}
      />

      {/* View Finding Details Modal */}
      <FindingDetailsModal
        finding={findingToView}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setFindingToView(null);
        }}
      />
    </div>
  );
};

export default Findings;
