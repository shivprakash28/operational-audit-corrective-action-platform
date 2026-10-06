import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import CorrectiveActionStats from "../components/corrective-actions/CorrectiveActionStats";
import OverdueActionsBanner from "../components/corrective-actions/OverdueActionsBanner";
import CorrectiveActionFilters from "../components/corrective-actions/CorrectiveActionFilters";
import CorrectiveActionTable from "../components/corrective-actions/CorrectiveActionTable";
import CorrectiveActionDetailsModal from "../components/corrective-actions/CorrectiveActionDetailsModal";
import CorrectiveActionFormModal from "../components/corrective-actions/CorrectiveActionFormModal";
import { Plus, RefreshCw, AlertCircle, CheckCircle2, Wrench } from "lucide-react";

export type CorrectiveActionStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED" | "CLOSED";

export interface FindingOption {
  id: number;
  description: string;
}

export interface CorrectiveAction {
  id: number;
  findingId?: number;
  findingDescription?: string;
  auditId?: number;
  title: string;
  description: string;
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  dueDate?: string;
  deadline?: string;
  status: CorrectiveActionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const CorrectiveActions: React.FC = () => {
  const { user } = useAuth();

  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [overdueActions, setOverdueActions] = useState<CorrectiveAction[]>([]);
  const [findings, setFindings] = useState<FindingOption[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [overdueFilter, setOverdueFilter] = useState<string>("ALL"); // "ALL" | "OVERDUE" | "ON_TRACK"

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [actionToEdit, setActionToEdit] = useState<CorrectiveAction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [actionToView, setActionToView] = useState<CorrectiveAction | null>(null);

  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // 1. Fetch Overdue Corrective Actions from GET /api/corrective-actions/overdue
  const fetchOverdueActions = useCallback(async () => {
    try {
      const response = await api.get("/corrective-actions/overdue");
      const data = response.data;
      let list: CorrectiveAction[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.correctiveActions)) {
        list = data.correctiveActions;
      }
      setOverdueActions(list);
    } catch {
      setOverdueActions([]);
    }
  }, []);

  // 2. Fetch All Corrective Actions from GET /api/corrective-actions
  const fetchActions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/corrective-actions");
      const data = response.data;
      let list: CorrectiveAction[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.correctiveActions)) {
        list = data.correctiveActions;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setActions(list);
      await fetchOverdueActions();
    } catch (err: any) {
      console.error("Failed to fetch corrective actions:", err);
      setError(
        err?.response?.data?.message || "Unable to load corrective actions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchOverdueActions]);

  // 3. Fetch Findings for form dropdown from GET /api/findings
  const fetchFindingsOptions = useCallback(async () => {
    try {
      const response = await api.get("/findings");
      const data = response.data;
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.findings)) {
        list = data.findings;
      }
      setFindings(
        list.map((f) => ({
          id: f.id,
          description: f.description,
        }))
      );
    } catch {
      setFindings([]);
    }
  }, []);

  useEffect(() => {
    fetchActions();
    fetchFindingsOptions();
  }, [fetchActions, fetchFindingsOptions]);

  // Map overdue IDs into a quick-lookup set
  const overdueIdsSet = useMemo(() => {
    return new Set(overdueActions.map((a) => a.id));
  }, [overdueActions]);

  // Filtered Actions
  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      // Status Filter
      if (selectedStatus !== "ALL") {
        if (act.status !== selectedStatus) {
          return false;
        }
      }

      // Overdue Filter
      if (overdueFilter === "OVERDUE") {
        const isOverdue =
          overdueIdsSet.has(act.id) ||
          (act.status !== "COMPLETED" &&
            act.status !== "VERIFIED" &&
            act.status !== "CLOSED" &&
            (act.dueDate || act.deadline) &&
            new Date(act.dueDate || act.deadline!) < new Date());

        if (!isOverdue) return false;
      } else if (overdueFilter === "ON_TRACK") {
        const isOverdue =
          overdueIdsSet.has(act.id) ||
          (act.status !== "COMPLETED" &&
            act.status !== "VERIFIED" &&
            act.status !== "CLOSED" &&
            (act.dueDate || act.deadline) &&
            new Date(act.dueDate || act.deadline!) < new Date());

        if (isOverdue) return false;
      }

      // Search Filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const titleMatch = act.title?.toLowerCase().includes(query);
        const descMatch = act.description?.toLowerCase().includes(query);
        const findingMatch = act.findingDescription?.toLowerCase().includes(query);
        const ownerMatch = act.ownerName?.toLowerCase().includes(query);
        const idMatch = act.id.toString().includes(query);

        if (!titleMatch && !descMatch && !findingMatch && !ownerMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [actions, searchTerm, selectedStatus, overdueFilter, overdueIdsSet]);

  // Handlers
  const handleOpenCreateModal = () => {
    setActionToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (act: CorrectiveAction) => {
    setActionToEdit(act);
    setIsFormOpen(true);
  };

  const handleOpenViewModal = async (act: CorrectiveAction) => {
    setActionToView(act);
    setIsDetailsOpen(true);
    try {
      const res = await api.get(`/corrective-actions/${act.id}`);
      if (res.data) {
        setActionToView(res.data);
      }
    } catch {
      // Use cached object
    }
  };

  const handleSaveAction = async (data: {
    findingId: number;
    title: string;
    description: string;
    ownerId: number;
    dueDate?: string;
    status: CorrectiveActionStatus;
  }) => {
    setFormSubmitting(true);
    try {
      const payload = {
        findingId: data.findingId,
        title: data.title,
        description: data.description,
        ownerId: data.ownerId || user?.id || 1,
        dueDate: data.dueDate,
        deadline: data.dueDate,
        status: data.status,
      };

      if (actionToEdit) {
        await api.put(`/corrective-actions/${actionToEdit.id}`, payload);
        showToast(`Corrective action #${actionToEdit.id} updated successfully.`);
      } else {
        await api.post(`/findings/${data.findingId}/corrective-actions`, payload);
        showToast("Corrective action created successfully.");
      }

      await fetchActions();
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleChangeStatus = async (actionId: number, newStatus: CorrectiveActionStatus) => {
    setUpdatingId(actionId);
    try {
      await api.patch(`/corrective-actions/${actionId}/status`, { status: newStatus });
      showToast(`Corrective action #${actionId} status updated to ${newStatus}.`);
      setActions((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
      );
      await fetchOverdueActions();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterOverdueBanner = () => {
    setOverdueFilter("OVERDUE");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setOverdueFilter("ALL");
  };

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
            Corrective Actions
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track remediation activities, ownership, deadlines and closure.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Corrective Action
        </Button>
      </div>

      {/* Overdue Action Banner Alert */}
      <OverdueActionsBanner
        overdueActions={overdueActions}
        onFilterOverdue={handleFilterOverdueBanner}
      />

      {/* Summary Statistics Overview */}
      <CorrectiveActionStats
        actions={actions}
        overdueCount={overdueActions.length}
      />

      {/* Search & Filters Toolbar */}
      <CorrectiveActionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        overdueFilter={overdueFilter}
        onOverdueFilterChange={setOverdueFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Corrective Action Table / Main Content */}
      {loading ? (
        <Card className="p-8 text-center animate-pulse space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
        </Card>
      ) : error ? (
        <Card className="max-w-xl mx-auto border-rose-200 bg-rose-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load corrective actions
              </h3>
              <p className="text-sm text-slate-600 mt-1">{error}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <Button variant="primary" onClick={fetchActions} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredActions.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {actions.length === 0
                  ? "No corrective actions"
                  : "No matching corrective actions"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {actions.length === 0
                  ? "Create a corrective action to begin tracking remediation plans and resolution deadlines."
                  : "No corrective actions match the current search or filter criteria."}
              </p>
            </div>
            {actions.length === 0 ? (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Corrective Action
              </Button>
            ) : (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Search & Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <CorrectiveActionTable
          actions={filteredActions}
          overdueIds={overdueIdsSet}
          onView={handleOpenViewModal}
          onEdit={handleOpenEditModal}
          onChangeStatus={handleChangeStatus}
          updatingId={updatingId}
        />
      )}

      {/* Create / Edit Form Modal */}
      <CorrectiveActionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setActionToEdit(null);
        }}
        onSubmit={handleSaveAction}
        findings={findings}
        actionToEdit={actionToEdit}
        loading={formSubmitting}
      />

      {/* View Details Modal */}
      <CorrectiveActionDetailsModal
        action={actionToView}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setActionToView(null);
        }}
        isOverdue={actionToView ? overdueIdsSet.has(actionToView.id) : false}
      />
    </div>
  );
};

export default CorrectiveActions;
