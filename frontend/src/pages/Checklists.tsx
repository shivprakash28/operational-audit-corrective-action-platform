import { useEffect, useState } from "react";
import api from "../services/api";

interface Audit {
  id: number;
  title: string;
}

interface ChecklistItem {
  id: number;
  question: string;
  description?: string;
  order: number;
}

interface Checklist {
  id: number;
  auditId: number;
  templateId: number;
  template?: {
    id: number;
    name: string;
    description?: string;
    items?: ChecklistItem[];
  };
  responses?: ChecklistResponse[];
}

interface ChecklistResponse {
  id: number;
  checklistItemId: number;
  status: "COMPLIANT" | "NON_COMPLIANT" | "NA";
  remarks?: string;
}

const Checklists = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState("");
  const [checklist, setChecklist] = useState<Checklist | null>(null);

  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const [templateId, setTemplateId] = useState("");
  const [question, setQuestion] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemOrder, setItemOrder] = useState("");

  const [status, setStatus] = useState<
    "COMPLIANT" | "NON_COMPLIANT" | "NA"
  >("COMPLIANT");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAudits = async () => {
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
          err.response?.data?.message ||
            "Failed to load audits. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  const fetchChecklist = async (auditId: string) => {
    if (!auditId) {
      setChecklist(null);
      return;
    }

    setLoadingChecklist(true);
    setError("");

    try {
      const response = await api.get(`/checklists/${auditId}`);

      const data = response.data;

      if (data?.checklist) {
        setChecklist(data.checklist);
      } else {
        setChecklist(data);
      }
    } catch (err: any) {
      console.error("Failed to fetch checklist:", err);

      setChecklist(null);

      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            "Failed to load checklist. Please try again."
        );
      }
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleAuditChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const auditId = event.target.value;

    setSelectedAuditId(auditId);
    setSuccess("");
    setError("");

    fetchChecklist(auditId);
  };

  const handleCreateTemplate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await api.post("/checklists/templates", {
        name: templateName,
        description: templateDescription || undefined,
      });

      const createdTemplate = response.data?.template || response.data;

      setTemplateId(String(createdTemplate.id));
      setSuccess("Checklist template created successfully.");

      setTemplateName("");
      setTemplateDescription("");
    } catch (err: any) {
      console.error("Failed to create template:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create checklist template."
      );
    }
  };

  const handleCreateItem = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      await api.post(`/checklists/templates/${templateId}/items`, {
        question,
        description: itemDescription || undefined,
        order: Number(itemOrder),
      });

      setSuccess("Checklist item created successfully.");

      setQuestion("");
      setItemDescription("");
      setItemOrder("");
    } catch (err: any) {
      console.error("Failed to create checklist item:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create checklist item."
      );
    }
  };

  const handleAssignChecklist = async () => {
    if (!selectedAuditId || !templateId) {
      setError("Select an audit and enter a template ID.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.post(
        `/checklists/${selectedAuditId}/assign-checklist`,
        {
          templateId: Number(templateId),
        }
      );

      setSuccess("Checklist assigned successfully.");

      await fetchChecklist(selectedAuditId);
    } catch (err: any) {
      console.error("Failed to assign checklist:", err);

      setError(
        err.response?.data?.message ||
          "Failed to assign checklist."
      );
    }
  };

  const handleSubmitResponse = async (
    checklistItemId: number
  ) => {
    if (!checklist) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.post(
        `/checklists/${checklist.id}/responses`,
        {
          checklistItemId,
          status,
          remarks: remarks || undefined,
        }
      );

      setSuccess("Checklist response submitted successfully.");

      setRemarks("");

      await fetchChecklist(selectedAuditId);
    } catch (err: any) {
      console.error("Failed to submit response:", err);

      setError(
        err.response?.data?.message ||
          "Failed to submit checklist response."
      );
    }
  };

  if (loading) {
    return <p>Loading audits...</p>;
  }

  return (
    <div>
      <h2>Audit Checklist</h2>

      <h3>Create Checklist Template</h3>

      <form onSubmit={handleCreateTemplate}>
        <div>
          <label htmlFor="templateName">Template Name</label>
          <br />
          <input
            id="templateName"
            type="text"
            value={templateName}
            onChange={(event) =>
              setTemplateName(event.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="templateDescription">
            Description
          </label>
          <br />
          <textarea
            id="templateDescription"
            value={templateDescription}
            onChange={(event) =>
              setTemplateDescription(event.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
          Create Template
        </button>
      </form>

      <hr />

      <h3>Create Checklist Item</h3>

      <form onSubmit={handleCreateItem}>
        <div>
          <label htmlFor="templateId">Template ID</label>
          <br />
          <input
            id="templateId"
            type="number"
            min="1"
            value={templateId}
            onChange={(event) =>
              setTemplateId(event.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="question">Question</label>
          <br />
          <textarea
            id="question"
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="itemDescription">
            Description
          </label>
          <br />
          <textarea
            id="itemDescription"
            value={itemDescription}
            onChange={(event) =>
              setItemDescription(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label htmlFor="itemOrder">Order</label>
          <br />
          <input
            id="itemOrder"
            type="number"
            min="1"
            value={itemOrder}
            onChange={(event) =>
              setItemOrder(event.target.value)
            }
            required
          />
        </div>

        <br />

        <button type="submit">
          Create Checklist Item
        </button>
      </form>

      <hr />

      <h3>Assign Checklist to Audit</h3>

      <div>
        <label htmlFor="auditId">Select Audit</label>
        <br />

        <select
          id="auditId"
          value={selectedAuditId}
          onChange={handleAuditChange}
        >
          <option value="">Select an audit</option>

          {audits.map((audit) => (
            <option key={audit.id} value={audit.id}>
              #{audit.id} - {audit.title}
            </option>
          ))}
        </select>
      </div>

      <br />

      <button
        type="button"
        onClick={handleAssignChecklist}
      >
        Assign Checklist
      </button>

      {success && <p>{success}</p>}

      {error && <p>{error}</p>}

      <hr />

      <h3>Checklist</h3>

      {!selectedAuditId ? (
        <p>Select an audit to view its checklist.</p>
      ) : loadingChecklist ? (
        <p>Loading checklist...</p>
      ) : !checklist ? (
        <p>No checklist assigned to this audit.</p>
      ) : (
        <div>
          <h4>
            {checklist.template?.name ||
              `Checklist #${checklist.id}`}
          </h4>

          {checklist.template?.description && (
            <p>{checklist.template.description}</p>
          )}

          {checklist.template?.items?.map((item) => (
            <div key={item.id}>
              <p>
                <strong>
                  {item.order}. {item.question}
                </strong>
              </p>

              {item.description && (
                <p>{item.description}</p>
              )}

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "COMPLIANT"
                      | "NON_COMPLIANT"
                      | "NA"
                  )
                }
              >
                <option value="COMPLIANT">
                  COMPLIANT
                </option>

                <option value="NON_COMPLIANT">
                  NON_COMPLIANT
                </option>

                <option value="NA">NA</option>
              </select>

              <br />
              <br />

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
                placeholder="Remarks"
              />

              <br />
              <br />

              <button
                type="button"
                onClick={() =>
                  handleSubmitResponse(item.id)
                }
              >
                Submit Response
              </button>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Checklists;