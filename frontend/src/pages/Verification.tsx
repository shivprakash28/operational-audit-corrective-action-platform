import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import VerificationStats, {
  type VerificationItem,
  type VerificationStatus,
} from "../components/verification/VerificationStats";
import VerificationActionSelector from "../components/verification/VerificationActionSelector";
import VerificationFilters from "../components/verification/VerificationFilters";
import VerificationTable from "../components/verification/VerificationTable";
import VerificationFormModal from "../components/verification/VerificationFormModal";
import VerificationDetailsModal from "../components/verification/VerificationDetailsModal";
import VerificationConfirmModal from "../components/verification/VerificationConfirmModal";
import type { CorrectiveAction } from "./CorrectiveActions";
import { Plus, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export const Verification: React.FC = () => {
  const { user } = useAuth();

  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);

  // Workflow confirmation state
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [confirmMode, setConfirmMode] = useState<"APPROVE" | "REJECT" | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<VerificationItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Fetch Corrective Actions List
  const fetchCorrectiveActions = useCallback(async () => {
    try {
      const res = await api.get<CorrectiveAction[]>("/corrective-actions");
      setCorrectiveActions(res.data || []);
    } catch (err: any) {
      console.error("Error fetching corrective actions for verification context:", err);
    }
  }, []);

  // Fetch Verifications
  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = selectedActionId
        ? `/corrective-actions/${selectedActionId}/verifications`
        : "/verifications";

      const res = await api.get<VerificationItem[]>(url);
      setVerifications(res.data || []);
    } catch (err: any) {
      console.error("Error fetching verifications:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load verification records from backend."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedActionId]);

  useEffect(() => {
    fetchCorrectiveActions();
  }, [fetchCorrectiveActions]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleRefresh = () => {
    fetchCorrectiveActions();
    fetchVerifications();
    showToast("Verification data refreshed");
  };

  // Filtered verifications list
  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      // Search query
      const matchesSearch =
        !searchTerm ||
        (v.comments && v.comments.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.verifierName && v.verifierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.verifierEmail && v.verifierEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.correctiveActionTitle &&
          v.correctiveActionTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(v.id).includes(searchTerm) ||
        String(v.correctiveActionId).includes(searchTerm);

      if (!matchesSearch) return false;

      // Status filter
      if (selectedStatus !== "ALL" && v.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [verifications, searchTerm, selectedStatus]);

  // Create verification API callback
  const handleCreateVerification = async (payload: {
    correctiveActionId: number;
    verifierId: number;
    status: VerificationStatus;
    comments?: string;
  }) => {
    await api.post(`/corrective-actions/${payload.correctiveActionId}/verifications`, payload);
    showToast("Verification record created successfully!");
    fetchVerifications();
    fetchCorrectiveActions();
  };

  // Approve Workflow action
  const openApproveConfirm = (item: VerificationItem) => {
    setConfirmTarget(item);
    setConfirmMode("APPROVE");
    setConfirmModalOpen(true);
  };

  // Reject Workflow action
  const openRejectConfirm = (item: VerificationItem) => {
    setConfirmTarget(item);
    setConfirmMode("REJECT");
    setConfirmModalOpen(true);
  };

  // Execute Approve/Reject Confirmation
  const handleConfirmAction = async (verificationId: number, comments?: string) => {
    if (!confirmMode) return;

    try {
      setActionLoadingId(verificationId);
      const endpoint = confirmMode === "APPROVE" ? "approve" : "reject";

      await api.post(`/verifications/${verificationId}/${endpoint}`, { comments });

      showToast(
        confirmMode === "APPROVE"
          ? "Verification approved successfully! CAPA marked as VERIFIED."
          : "Verification rejected successfully! CAPA returned to IN_PROGRESS."
      );

      fetchVerifications();
      fetchCorrectiveActions();
    } finally {
      setActionLoadingId(null);
    }
  };

  const isFiltered = Boolean(searchTerm || selectedStatus !== "ALL");

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-3 text-sm shadow-xl border border-slate-700 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Verification & Action Closure
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              Audit Compliance
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review completed corrective actions, evaluate evidence, and approve or reject final closure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Create Verification</span>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <VerificationStats verifications={verifications} />

      {/* Corrective Action Scope Selector */}
      <VerificationActionSelector
        correctiveActions={correctiveActions}
        selectedActionId={selectedActionId}
        onSelectAction={setSelectedActionId}
      />

      {/* Toolbar Filters */}
      <VerificationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onReset={() => {
          setSearchTerm("");
          setSelectedStatus("ALL");
        }}
        isFiltered={isFiltered}
      />

      {/* Error Banner */}
      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchVerifications}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading or Verification Table/Cards */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading verifications workspace...</p>
          </CardContent>
        </Card>
      ) : (
        <VerificationTable
          verifications={filteredVerifications}
          onViewDetails={(item) => {
            setSelectedVerification(item);
            setIsDetailsOpen(true);
          }}
          onApprove={openApproveConfirm}
          onReject={openRejectConfirm}
          actionLoadingId={actionLoadingId}
        />
      )}

      {/* Create Modal */}
      <VerificationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        correctiveActions={correctiveActions}
        defaultActionId={selectedActionId}
        currentUserId={user?.id}
        onSuccess={fetchVerifications}
        apiCall={handleCreateVerification}
      />

      {/* Details Modal */}
      <VerificationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedVerification(null);
        }}
        verification={selectedVerification}
        correctiveActions={correctiveActions}
        onApprove={openApproveConfirm}
        onReject={openRejectConfirm}
        isActionLoading={actionLoadingId === selectedVerification?.id}
      />

      {/* Workflow Confirmation Modal */}
      <VerificationConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setConfirmTarget(null);
          setConfirmMode(null);
        }}
        verification={confirmTarget}
        mode={confirmMode}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default Verification;
