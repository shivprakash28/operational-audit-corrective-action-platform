import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import AuditStats from "../components/audits/AuditStats";
import AuditFilters from "../components/audits/AuditFilters";
import AuditTable from "../components/audits/AuditTable";
import AuditDetailsModal from "../components/audits/AuditDetailsModal";
import AuditFormModal from "../components/audits/AuditFormModal";
import DeleteAuditModal from "../components/audits/DeleteAuditModal";
import { Plus, RefreshCw, AlertCircle, CheckCircle2, ClipboardList } from "lucide-react";

export interface Audit {
  id: number;
  title: string;
  scope: string;
  departmentId: number;
  departmentName?: string;
  objectives: string;
  criteria: string;
  plannedStartDate: string;
  plannedEndDate: string;
  expectedCompletionDate: string;
  status?: string;
  createdById?: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditFormData {
  title: string;
  scope: string;
  departmentId: string;
  objectives: string;
  criteria: string;
  plannedStartDate: string;
  plannedEndDate: string;
  expectedCompletionDate: string;
  status: string;
}

export const Audits: React.FC = () => {
  const { user } = useAuth();

  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [auditToEdit, setAuditToEdit] = useState<Audit | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [auditToView, setAuditToView] = useState<Audit | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [auditToDelete, setAuditToDelete] = useState<Audit | null>(null);

  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/audits");
      const data = response.data;

      if (Array.isArray(data)) {
        setAudits(data);
      } else if (Array.isArray(data.audits)) {
        setAudits(data.audits);
      } else if (Array.isArray(data.data)) {
        setAudits(data.data);
      } else {
        setAudits([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch audits:", err);
      setError(
        err.response?.data?.message || "Unable to load audits. Please try again."
      );
    } fontinally: {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  // Extract unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const map = new Map<number, string>();
    audits.forEach((a) => {
      if (a.departmentId) {
        const name = a.departmentName || `Department #${a.departmentId}`;
        map.set(a.departmentId, name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [audits]);

  // Filtered Audits
  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      // Status Filter
      if (selectedStatus !== "ALL") {
        if ((audit.status || "PLANNED").toUpperCase() !== selectedStatus.toUpperCase()) {
          return false;
        }
      }

      // Department Filter
      if (selectedDepartment !== "ALL") {
        if (audit.departmentId.toString() !== selectedDepartment) {
          return false;
        }
      }

      // Search Filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const titleMatch = audit.title?.toLowerCase().includes(query);
        const scopeMatch = audit.scope?.toLowerCase().includes(query);
        const objMatch = audit.objectives?.toLowerCase().includes(query);
        const critMatch = audit.criteria?.toLowerCase().includes(query);

        if (!titleMatch && !scopeMatch && !objMatch && !critMatch) {
          return false;
        }
      }

      return true;
    });
  }, [audits, searchTerm, selectedStatus, selectedDepartment]);

  // Handlers
  const handleOpenCreateModal = () => {
    setAuditToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (audit: Audit) => {
    setAuditToEdit(audit);
    setIsFormOpen(true);
  };

  const handleOpenViewModal = async (audit: Audit) => {
    setAuditToView(audit);
    setIsDetailsOpen(true);

    // Fetch full details if needed
    try {
      const response = await api.get(`/audits/${audit.id}`);
      if (response.data) {
        setAuditToView(response.data);
      }
    } catch (err) {
      console.log("Using cached audit details:", err);
    }
  };

  const handleOpenDeleteModal = (audit: Audit) => {
    setAuditToDelete(audit);
    setIsDeleteOpen(true);
  };

  const handleSaveAudit = async (formData: AuditFormData) => {
    setFormSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        scope: formData.scope,
        departmentId: Number(formData.departmentId),
        objectives: formData.objectives,
        criteria: formData.criteria,
        plannedStartDate: new Date(formData.plannedStartDate).toISOString(),
        plannedEndDate: new Date(formData.plannedEndDate).toISOString(),
        expectedCompletionDate: new Date(formData.expectedCompletionDate).toISOString(),
        status: formData.status,
        createdById: user?.id || 1,
      };

      if (auditToEdit) {
        await api.put(`/audits/${auditToEdit.id}`, payload);
        showToast(`Audit #${auditToEdit.id} updated successfully.`);
      } else {
        await api.post("/audits", payload);
        showToast("Audit created successfully.");
      }

      await fetchAudits();
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!auditToDelete) return;
    setFormSubmitting(true);
    try {
      await api.delete(`/audits/${auditToDelete.id}`);
      showToast(`Audit #${auditToDelete.id} deleted successfully.`);
      setIsDeleteOpen(false);
      setAuditToDelete(null);
      await fetchAudits();
    } catch (err: any) {
      console.error("Failed to delete audit:", err);
      showToast(err?.response?.data?.message || "Failed to delete audit.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedDepartment("ALL");
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
            Audits
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Plan, manage and track your organization's audits.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Audit
        </Button>
      </div>

      {/* Audit Statistics */}
      <AuditStats audits={audits} />

      {/* Search & Filter Toolbar */}
      <AuditFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departments={uniqueDepartments}
        onClearFilters={handleClearFilters}
      />

      {/* Content Area */}
      {loading ? (
        <Card className="p-8 text-center animate-pulse">
          <CardContent className="space-y-3">
            <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
            <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="max-w-xl mx-auto border-rose-200 bg-rose-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load audits
              </h3>
              <p className="text-sm text-slate-600 mt-1">{error}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <Button variant="primary" onClick={fetchAudits} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredAudits.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {audits.length === 0 ? "No audits found" : "No matching audits"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {audits.length === 0
                  ? "Create your first audit to begin planning and tracking audit activities."
                  : "No audits match the current search or filter criteria."}
              </p>
            </div>

            {audits.length === 0 ? (
              <Button variant="primary" onClick={handleOpenCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Audit
              </Button>
            ) : (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Search & Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Audit Responsive Table */
        <AuditTable
          audits={filteredAudits}
          onView={handleOpenViewModal}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      )}

      {/* View Audit Details Modal */}
      <AuditDetailsModal
        audit={auditToView}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setAuditToView(null);
        }}
      />

      {/* Create / Edit Audit Modal Form */}
      <AuditFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setAuditToEdit(null);
        }}
        onSubmit={handleSaveAudit}
        auditToEdit={auditToEdit}
        loading={formSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAuditModal
        audit={auditToDelete}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setAuditToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={formSubmitting}
      />
    </div>
  );
};

export default Audits;