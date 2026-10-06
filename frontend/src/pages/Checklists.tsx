import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import ChecklistStats from "../components/checklists/ChecklistStats";
import ChecklistTemplateList from "../components/checklists/ChecklistTemplateList";
import ChecklistAssignment from "../components/checklists/ChecklistAssignment";
import ChecklistItemCard from "../components/checklists/ChecklistItemCard";
import CreateTemplateModal from "../components/checklists/CreateTemplateModal";
import CreateItemModal from "../components/checklists/CreateItemModal";
import {
  Plus,
  ListPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  FileCheck,
  ClipboardList,
} from "lucide-react";

export type ChecklistResponseStatus = "COMPLIANT" | "NON_COMPLIANT" | "NA";

export interface Audit {
  id: number;
  title: string;
}

export interface ChecklistItem {
  id: number;
  question: string;
  description?: string;
  order: number;
}

export interface ChecklistTemplate {
  id: number;
  name: string;
  description?: string;
  items?: ChecklistItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistResponse {
  id: number;
  auditChecklistId?: number;
  checklistItemId: number;
  question?: string;
  status: ChecklistResponseStatus;
  remarks?: string;
  respondedAt?: string;
}

export interface AuditChecklist {
  id: number;
  auditId: number;
  templateId: number;
  templateName?: string;
  templateDescription?: string;
  assignedAt?: string;
  template?: ChecklistTemplate;
  responses?: ChecklistResponse[];
}

export const Checklists: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  const [assignedChecklist, setAssignedChecklist] = useState<AuditChecklist | null>(null);
  const [checklistResponses, setChecklistResponses] = useState<Record<number, ChecklistResponse>>({});

  // Template inspection selection
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [assignTemplateId, setAssignTemplateId] = useState<string>("");
  const [templateSearch, setTemplateSearch] = useState<string>("");

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChecklist, setLoadingChecklist] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Modals state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // 1. Fetch Templates from GET /api/checklist-templates
  const fetchTemplates = useCallback(async () => {
    try {
      const response = await api.get("/checklist-templates");
      const data = response.data;
      let list: ChecklistTemplate[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.templates)) {
        list = data.templates;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setTemplates(list);
      if (list.length > 0 && !selectedTemplate) {
        setSelectedTemplate(list[0]);
        setAssignTemplateId(list[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  }, [selectedTemplate]);

  // 2. Fetch Audits from GET /api/audits
  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError("");
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
      setError(
        err?.response?.data?.message || "Failed to load audit checklists workspace."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedAuditId]);

  // Initial Data Load
  useEffect(() => {
    fetchAudits();
    fetchTemplates();
  }, [fetchAudits, fetchTemplates]);

  // 3. Fetch Assigned Checklist for selected Audit
  const fetchAssignedChecklist = useCallback(async (auditId: string) => {
    if (!auditId) {
      setAssignedChecklist(null);
      setChecklistResponses({});
      return;
    }

    setLoadingChecklist(true);
    try {
      // Primary backend contract: GET /api/audits/{auditId}/checklists or fallback GET /api/checklists/{auditId}
      let response;
      try {
        response = await api.get(`/audits/${auditId}/checklists`);
      } catch {
        response = await api.get(`/checklists/${auditId}`);
      }

      const data = response.data;
      let chk: AuditChecklist | null = null;

      if (Array.isArray(data) && data.length > 0) {
        chk = data[0];
      } else if (data && data.id) {
        chk = data;
      } else if (data?.checklist) {
        chk = data.checklist;
      }

      setAssignedChecklist(chk);

      if (chk) {
        // Fetch full template items if template is missing items
        if (chk.templateId && (!chk.template || !chk.template.items)) {
          try {
            const tmplRes = await api.get(`/checklist-templates/${chk.templateId}`);
            if (tmplRes.data) {
              chk.template = tmplRes.data;
            }
          } catch (e) {
            console.log("Could not fetch template items:", e);
          }
        }

        // Fetch submitted responses
        try {
          let respRes;
          try {
            respRes = await api.get(`/audits/${auditId}/checklists/${chk.id}/responses`);
          } catch {
            respRes = await api.get(`/checklists/${chk.id}/responses`);
          }

          const respData = respRes.data;
          let respList: ChecklistResponse[] = [];
          if (Array.isArray(respData)) {
            respList = respData;
          } else if (Array.isArray(respData.responses)) {
            respList = respData.responses;
          }

          const respMap: Record<number, ChecklistResponse> = {};
          respList.forEach((r) => {
            respMap[r.checklistItemId] = r;
          });
          setChecklistResponses(respMap);
        } catch {
          // Fallback if responses are embedded in checklist
          if (chk.responses) {
            const respMap: Record<number, ChecklistResponse> = {};
            chk.responses.forEach((r) => {
              respMap[r.checklistItemId] = r;
            });
            setChecklistResponses(respMap);
          } else {
            setChecklistResponses({});
          }
        }
      } else {
        setChecklistResponses({});
      }
    } catch (err: any) {
      console.log("No assigned checklist found for audit:", err);
      setAssignedChecklist(null);
      setChecklistResponses({});
    } finally {
      setLoadingChecklist(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAuditId) {
      fetchAssignedChecklist(selectedAuditId);
    }
  }, [selectedAuditId, fetchAssignedChecklist]);

  // Handlers
  const handleSelectTemplate = (tmpl: ChecklistTemplate) => {
    setSelectedTemplate(tmpl);
    setAssignTemplateId(tmpl.id.toString());
  };

  const handleCreateTemplateSubmit = async (name: string, description: string) => {
    setModalSubmitting(true);
    try {
      await api.post("/checklist-templates", {
        name,
        description: description || undefined,
      });

      showToast("Checklist template created successfully.");
      await fetchTemplates();
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCreateItemSubmit = async (
    targetTemplateId: number,
    question: string,
    description: string,
    order: number
  ) => {
    setModalSubmitting(true);
    try {
      await api.post(`/checklist-templates/${targetTemplateId}/items`, {
        question,
        description: description || undefined,
        order,
      });

      showToast("Checklist item created successfully.");
      await fetchTemplates();
      if (selectedAuditId) {
        await fetchAssignedChecklist(selectedAuditId);
      }
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleAssignChecklistSubmit = async () => {
    if (!selectedAuditId || !assignTemplateId) return;

    setLoadingChecklist(true);
    try {
      const templateIdNum = Number(assignTemplateId);
      try {
        await api.post(`/audits/${selectedAuditId}/checklists`, {
          templateId: templateIdNum,
        });
      } catch {
        await api.post(`/checklists/${selectedAuditId}/assign-checklist`, {
          templateId: templateIdNum,
        });
      }

      showToast("Checklist assigned to audit successfully.");
      await fetchAssignedChecklist(selectedAuditId);
    } catch (err: any) {
      console.error("Failed to assign checklist:", err);
      showToast(err?.response?.data?.message || "Failed to assign checklist.");
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleSubmitItemResponse = async (
    checklistItemId: number,
    status: ChecklistResponseStatus,
    remarks: string
  ) => {
    if (!assignedChecklist || !selectedAuditId) return;

    try {
      try {
        await api.post(
          `/audits/${selectedAuditId}/checklists/${assignedChecklist.id}/responses`,
          {
            checklistItemId,
            status,
            remarks: remarks || undefined,
          }
        );
      } catch {
        await api.post(`/checklists/${assignedChecklist.id}/responses`, {
          checklistItemId,
          status,
          remarks: remarks || undefined,
        });
      }

      showToast("Checklist response submitted successfully.");

      // Optimistically update local responses state
      setChecklistResponses((prev) => ({
        ...prev,
        [checklistItemId]: {
          id: Date.now(),
          checklistItemId,
          status,
          remarks,
          respondedAt: new Date().toISOString(),
        },
      }));
    } catch (err: any) {
      console.error("Failed to submit response:", err);
      showToast(err?.response?.data?.message || "Failed to submit response.");
    }
  };

  // Calculations for Stats & Progress
  const totalActiveItems = assignedChecklist?.template?.items?.length ?? 0;
  const submittedCount = Object.keys(checklistResponses).length;
  const compliantCount = Object.values(checklistResponses).filter(
    (r) => r.status === "COMPLIANT"
  ).length;

  const progressPercentage =
    totalActiveItems > 0 ? (submittedCount / totalActiveItems) * 100 : 0;
  const complianceRate =
    submittedCount > 0 ? (compliantCount / submittedCount) * 100 : 0;

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
            Audit Checklists
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, assign and complete audit checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={() => setIsItemModalOpen(true)}
            className="gap-2"
          >
            <ListPlus className="h-4 w-4" />
            Add Checklist Item
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsTemplateModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Checklist Template
          </Button>
        </div>
      </div>

      {/* Checklist Statistics Overview */}
      <ChecklistStats
        templatesCount={templates.length}
        activeItemsCount={totalActiveItems}
        completedResponsesCount={submittedCount}
        complianceRate={complianceRate}
      />

      {/* Main Checklist Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Templates & Assignment Box (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <ChecklistAssignment
            audits={audits}
            templates={templates}
            selectedAuditId={selectedAuditId}
            onSelectAudit={setSelectedAuditId}
            selectedTemplateId={assignTemplateId}
            onSelectTemplateId={setAssignTemplateId}
            onAssign={handleAssignChecklistSubmit}
            loading={loadingChecklist}
          />

          <ChecklistTemplateList
            templates={templates}
            selectedTemplateId={selectedTemplate?.id || null}
            onSelectTemplate={handleSelectTemplate}
            searchTerm={templateSearch}
            onSearchChange={setTemplateSearch}
          />
        </div>

        {/* Right Main Column: Active Audit Checklist Evaluation Workspace (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <Card className="p-8 text-center animate-pulse space-y-3">
              <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
              <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
            </Card>
          ) : error ? (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Unable to load checklists
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
          ) : !selectedAuditId ? (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Select an Audit
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Choose an active audit plan from the left panel to inspect or complete its assigned checklist items.
                </p>
              </CardContent>
            </Card>
          ) : loadingChecklist ? (
            <Card className="p-8 text-center animate-pulse space-y-3">
              <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
              <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
            </Card>
          ) : !assignedChecklist ? (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">
                    No checklist assigned to {selectedAuditObj?.title || `Audit #${selectedAuditId}`}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Select a checklist template from the left box and click "Assign Checklist" to begin evaluation.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Active Audit Checklist Evaluation View */
            <div className="space-y-6">
              {/* Header Workspace Details Card */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      {selectedAuditObj?.title || `Audit #${selectedAuditId}`}
                    </span>
                    <CardTitle className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {assignedChecklist.templateName ||
                        assignedChecklist.template?.name ||
                        `Checklist #${assignedChecklist.id}`}
                    </CardTitle>
                    {(assignedChecklist.templateDescription ||
                      assignedChecklist.template?.description) && (
                      <p className="text-xs text-slate-500 mt-1">
                        {assignedChecklist.templateDescription ||
                          assignedChecklist.template?.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">
                      {submittedCount} / {totalActiveItems} Completed
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2">
                  {/* Visual Progress Bar */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Checklist Completion Progress</span>
                    <span className="font-bold text-blue-600">
                      {progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Numbered Checklist Items List */}
              {!assignedChecklist.template?.items ||
              assignedChecklist.template.items.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="p-8 text-center space-y-3">
                    <p className="text-sm font-bold text-slate-800">
                      No checklist items in this template
                    </p>
                    <p className="text-xs text-slate-500">
                      Add checklist items using the "+ Add Checklist Item" button.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsItemModalOpen(true)}
                      className="gap-2"
                    >
                      <ListPlus className="h-4 w-4" />
                      Add Checklist Item
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">
                    Verification Items ({assignedChecklist.template.items.length})
                  </h3>

                  {assignedChecklist.template.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <ChecklistItemCard
                        key={item.id}
                        item={item}
                        existingResponse={checklistResponses[item.id]}
                        onSubmitResponse={handleSubmitItemResponse}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSubmit={handleCreateTemplateSubmit}
        loading={modalSubmitting}
      />

      {/* Create Item Modal */}
      <CreateItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSubmit={handleCreateItemSubmit}
        templates={templates}
        defaultTemplateId={selectedTemplate?.id || null}
        loading={modalSubmitting}
      />
    </div>
  );
};

export default Checklists;