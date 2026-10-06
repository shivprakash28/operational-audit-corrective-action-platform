import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import ObservationStats from "../components/observations/ObservationStats";
import ObservationAuditSelector from "../components/observations/ObservationAuditSelector";
import ObservationTable from "../components/observations/ObservationTable";
import ObservationDetailsModal from "../components/observations/ObservationDetailsModal";
import ObservationFormModal from "../components/observations/ObservationFormModal";
import { Plus, Eye, RefreshCw, AlertCircle, CheckCircle2, Search, X } from "lucide-react";

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

export interface ChecklistItemOption {
  id: number;
  question: string;
}

export interface Observation {
  id: number;
  auditId: number;
  auditTitle?: string;
  checklistItemId: number;
  checklistItemQuestion?: string;
  description: string;
  evidenceUrl?: string;
  createdById?: number;
  createdByName?: string;
  createdByEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const Observations: React.FC = () => {
  const { user } = useAuth();

  const [audits, setAudits] = useState<Audit[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItemOption[]>([]);

  const [loadingAudits, setLoadingAudits] = useState<boolean>(true);
  const [loadingObservations, setLoadingObservations] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string>("");
  const [observationError, setObservationError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [observationToEdit, setObservationToEdit] = useState<Observation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [observationToView, setObservationToView] = useState<Observation | null>(null);

  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

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

  // 2. Fetch Observations for selected Audit
  const fetchObservations = useCallback(async (auditId: string) => {
    if (!auditId) {
      setObservations([]);
      return;
    }
    setLoadingObservations(true);
    setObservationError("");
    try {
      const response = await api.get(`/audits/${auditId}/observations`);
      const data = response.data;
      let list: Observation[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.observations)) {
        list = data.observations;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setObservations(list);
    } catch (err: any) {
      console.error("Failed to fetch observations:", err);
      setObservationError(
        err?.response?.data?.message ||
          "Failed to load observations for selected audit."
      );
    } finally {
      setLoadingObservations(false);
    }
  }, []);

  // 3. Fetch valid Checklist Items for selected audit
  const fetchChecklistItemsForAudit = useCallback(async (auditId: string) => {
    if (!auditId) {
      setChecklistItems([]);
      return;
    }
    try {
      let chkRes;
      try {
        chkRes = await api.get(`/audits/${auditId}/checklists`);
      } catch {
        chkRes = await api.get(`/checklists/${auditId}`);
      }

      const data = chkRes.data;
      let chk: any = null;
      if (Array.isArray(data) && data.length > 0) {
        chk = data[0];
      } else if (data && data.id) {
        chk = data;
      }

      if (chk) {
        let tmpl = chk.template;
        if (chk.templateId && (!tmpl || !tmpl.items)) {
          const tmplRes = await api.get(`/checklist-templates/${chk.templateId}`);
          tmpl = tmplRes.data;
        }

        if (tmpl && Array.isArray(tmpl.items)) {
          setChecklistItems(
            tmpl.items.map((i: any) => ({
              id: i.id,
              question: `${i.order ? i.order + ". " : ""}${i.question}`,
            }))
          );
        } else {
          setChecklistItems([]);
        }
      } else {
        setChecklistItems([]);
      }
    } catch {
      setChecklistItems([]);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  useEffect(() => {
    if (selectedAuditId) {
      fetchObservations(selectedAuditId);
      fetchChecklistItemsForAudit(selectedAuditId);
    } else {
      setObservations([]);
      setChecklistItems([]);
    }
  }, [selectedAuditId, fetchObservations, fetchChecklistItemsForAudit]);

  // Filtered Observations
  const filteredObservations = useMemo(() => {
    if (!searchTerm.trim()) return observations;
    const query = searchTerm.toLowerCase();
    return observations.filter((obs) => {
      const descMatch = obs.description?.toLowerCase().includes(query);
      const itemMatch = obs.checklistItemQuestion?.toLowerCase().includes(query);
      const nameMatch = obs.createdByName?.toLowerCase().includes(query);
      return descMatch || itemMatch || nameMatch;
    });
  }, [observations, searchTerm]);

  // Handlers
  const handleOpenCreateModal = () => {
    setObservationToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (obs: Observation) => {
    setObservationToEdit(obs);
    setIsFormOpen(true);
  };

  const handleOpenViewModal = async (obs: Observation) => {
    setObservationToView(obs);
    setIsDetailsOpen(true);
    try {
      const res = await api.get(`/observations/${obs.id}`);
      if (res.data) {
        setObservationToView(res.data);
      }
    } catch {
      // Use cached obs
    }
  };

  const handleSaveObservation = async (data: {
    auditId: number;
    checklistItemId: number;
    description: string;
    evidenceUrl?: string;
  }) => {
    setFormSubmitting(true);
    try {
      const payload = {
        auditId: data.auditId,
        checklistItemId: data.checklistItemId,
        description: data.description,
        evidenceUrl: data.evidenceUrl || undefined,
        createdById: user?.id || 1,
      };

      if (observationToEdit) {
        await api.put(`/observations/${observationToEdit.id}`, payload);
        showToast(`Observation #${observationToEdit.id} updated successfully.`);
      } else {
        await api.post(`/audits/${data.auditId}/observations`, payload);
        showToast("Observation recorded successfully.");
      }

      await fetchObservations(data.auditId.toString());
    } finally {
      setFormSubmitting(false);
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
            Audit Observations
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Record and manage observations identified during audit activities.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Record Observation
        </Button>
      </div>

      {/* Observation Overview Statistics */}
      <ObservationStats
        auditsCount={audits.length}
        selectedAudit={selectedAuditObj}
        observations={observations}
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
        <ObservationAuditSelector
          audits={audits}
          selectedAuditId={selectedAuditId}
          onSelectAudit={setSelectedAuditId}
          selectedAudit={selectedAuditObj}
        />
      )}

      {/* Search Toolbar */}
      {selectedAuditId && observations.length > 0 && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search observations by description, checklist criteria, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 py-2 w-full text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observation Table / Workspace */}
      {!selectedAuditId ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Select an audit
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Choose an audit from the dropdown above to view its recorded field observations.
            </p>
          </CardContent>
        </Card>
      ) : loadingObservations ? (
        <Card className="p-8 text-center animate-pulse space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
        </Card>
      ) : observationError ? (
        <Card className="max-w-xl mx-auto border-rose-200 bg-rose-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load observations
              </h3>
              <p className="text-sm text-slate-600 mt-1">{observationError}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                onClick={() => fetchObservations(selectedAuditId)}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredObservations.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Eye className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {observations.length === 0
                  ? "No observations recorded"
                  : "No matching observations"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {observations.length === 0
                  ? "Record an observation to document field audit findings and evidence."
                  : "No observations match the current search criteria."}
              </p>
            </div>
            {observations.length === 0 ? (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Record Observation
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ObservationTable
          observations={filteredObservations}
          onView={handleOpenViewModal}
          onEdit={handleOpenEditModal}
        />
      )}

      {/* Record / Edit Observation Form Modal */}
      <ObservationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setObservationToEdit(null);
        }}
        onSubmit={handleSaveObservation}
        audits={audits}
        defaultAuditId={selectedAuditId}
        checklistItems={checklistItems}
        observationToEdit={observationToEdit}
        loading={formSubmitting}
      />

      {/* View Details Modal */}
      <ObservationDetailsModal
        observation={observationToView}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setObservationToView(null);
        }}
      />
    </div>
  );
};

export default Observations;
