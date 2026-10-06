import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import EvidenceStats, { type EvidenceItem } from "../components/evidence/EvidenceStats";
import EvidenceActionSelector from "../components/evidence/EvidenceActionSelector";
import EvidenceTable from "../components/evidence/EvidenceTable";
import EvidenceUploadModal from "../components/evidence/EvidenceUploadModal";
import EvidenceDetailsModal from "../components/evidence/EvidenceDetailsModal";
import type { CorrectiveAction } from "./CorrectiveActions";
import { Plus, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export const Evidence: React.FC = () => {
  const { user } = useAuth();

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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
      console.error("Error fetching corrective actions:", err);
    }
  }, []);

  // Fetch Evidence List (all or filtered by corrective action)
  const fetchEvidence = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = selectedActionId
        ? `/corrective-actions/${selectedActionId}/evidence`
        : "/evidence";

      const res = await api.get<EvidenceItem[]>(url);
      setEvidenceList(res.data || []);
    } catch (err: any) {
      console.error("Error fetching evidence files:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load evidence files from backend."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedActionId]);

  useEffect(() => {
    fetchCorrectiveActions();
  }, [fetchCorrectiveActions]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleRefresh = () => {
    fetchCorrectiveActions();
    fetchEvidence();
    showToast("Evidence list refreshed");
  };

  // Filtered Evidence calculation
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      // Search term
      const matchesSearch =
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.uploadedByName &&
          item.uploadedByName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.uploadedByEmail &&
          item.uploadedByEmail.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory === "ALL") return true;

      const ext = item.fileName.split(".").pop()?.toLowerCase() || "";
      if (selectedCategory === "DOCUMENTS") {
        return ["pdf", "doc", "docx", "txt", "rtf"].includes(ext);
      }
      if (selectedCategory === "IMAGES") {
        return ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext);
      }
      if (selectedCategory === "SPREADSHEETS") {
        return ["xls", "xlsx", "csv"].includes(ext);
      }
      if (selectedCategory === "ARCHIVES") {
        return ["zip", "tar", "gz", "rar", "7z"].includes(ext);
      }

      return true;
    });
  }, [evidenceList, searchTerm, selectedCategory]);

  // Upload Evidence File API handler
  const handleUploadApiCall = async (formData: FormData, targetActionId: number) => {
    if (user?.id) {
      formData.append("uploadedById", String(user.id));
    }
    await api.post(`/corrective-actions/${targetActionId}/evidence`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    showToast("Evidence file uploaded successfully!");
  };

  // Authenticated Blob Download Handler
  const handleDownloadFile = async (item: EvidenceItem) => {
    try {
      setDownloadingId(item.id);
      const res = await api.get(`/evidence/${item.id}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(`Downloaded ${item.fileName}`);
    } catch (err: any) {
      console.error("Error downloading evidence file:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to download file."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-3 text-sm shadow-xl animate-fade-in border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Evidence Management</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              Repository
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload, review and manage supporting evidence attachments for corrective actions.
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
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Evidence</span>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <EvidenceStats evidenceList={evidenceList} />

      {/* Corrective Action Context & Filter */}
      <EvidenceActionSelector
        correctiveActions={correctiveActions}
        selectedActionId={selectedActionId}
        onSelectAction={setSelectedActionId}
      />

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchEvidence}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table Section */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading evidence repository...</p>
          </CardContent>
        </Card>
      ) : (
        <EvidenceTable
          evidenceList={filteredEvidence}
          correctiveActions={correctiveActions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onViewDetails={(item) => {
            setSelectedEvidence(item);
            setIsDetailsOpen(true);
          }}
          onDownload={handleDownloadFile}
          downloadingId={downloadingId}
        />
      )}

      {/* Upload Modal */}
      <EvidenceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        correctiveActions={correctiveActions}
        defaultActionId={selectedActionId}
        onUploadSuccess={fetchEvidence}
        apiCall={handleUploadApiCall}
      />

      {/* Details Modal */}
      <EvidenceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedEvidence(null);
        }}
        evidence={selectedEvidence}
        correctiveActions={correctiveActions}
        onDownload={handleDownloadFile}
        isDownloading={downloadingId === selectedEvidence?.id}
      />
    </div>
  );
};

export default Evidence;
