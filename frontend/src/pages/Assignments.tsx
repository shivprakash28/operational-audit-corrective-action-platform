import { useEffect, useState } from "react";
import api from "../services/api";

interface Audit {
  id: number;
  title: string;
}

interface Assignment {
  id: number;
  auditId: number;
  auditorId: number;
  auditor?: {
    id: number;
    email: string;
    role: string;
  };
}

const Assignments = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState("");
  const [auditorId, setAuditorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
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

  const fetchAssignments = async (auditId: string) => {
    if (!auditId) {
      setAssignments([]);
      return;
    }

    setLoadingAssignments(true);
    setError("");

    try {
      const response = await api.get(
        `/audits/${auditId}/assignments`
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setAssignments(data);
      } else if (Array.isArray(data.assignments)) {
        setAssignments(data.assignments);
      } else if (Array.isArray(data.data)) {
        setAssignments(data.data);
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch assignments:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load assignments. Please try again."
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAuditChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const auditId = event.target.value;

    setSelectedAuditId(auditId);
    setSuccess("");
    setError("");

    fetchAssignments(auditId);
  };

  const handleAssign = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedAuditId) {
      setError("Please select an audit.");
      return;
    }

    if (!auditorId) {
      setError("Please enter an auditor ID.");
      return;
    }

    try {
      await api.post(
        `/audits/${selectedAuditId}/assign`,
        {
          auditorId: Number(auditorId),
        }
      );

      setSuccess("Auditor assigned successfully.");
      setAuditorId("");

      await fetchAssignments(selectedAuditId);
    } catch (err: any) {
      console.error("Failed to assign auditor:", err);

      setError(
        err.response?.data?.message ||
          "Failed to assign auditor. Please try again."
      );
    }
  };

  if (loading) {
    return <p>Loading audits...</p>;
  }

  return (
    <div>
      <h2>Auditor Assignment</h2>

      <h3>Assign Auditor</h3>

      <form onSubmit={handleAssign}>
        <div>
          <label htmlFor="auditId">Select Audit</label>
          <br />

          <select
            id="auditId"
            value={selectedAuditId}
            onChange={handleAuditChange}
            required
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

        <div>
          <label htmlFor="auditorId">Auditor ID</label>
          <br />

          <input
            id="auditorId"
            type="number"
            min="1"
            value={auditorId}
            onChange={(event) => setAuditorId(event.target.value)}
            placeholder="Enter auditor ID"
            required
          />
        </div>

        <br />

        <button type="submit">Assign Auditor</button>
      </form>

      {success && <p>{success}</p>}

      {error && <p>{error}</p>}

      <hr />

      <h3>Current Assignments</h3>

      {!selectedAuditId ? (
        <p>Select an audit to view assignments.</p>
      ) : loadingAssignments ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No auditors assigned to this audit.</p>
      ) : (
        <div>
          {assignments.map((assignment) => (
            <div key={assignment.id}>
              <p>
                <strong>Assignment ID:</strong> {assignment.id}
              </p>

              <p>
                <strong>Auditor ID:</strong> {assignment.auditorId}
              </p>

              {assignment.auditor && (
                <p>
                  <strong>Auditor:</strong>{" "}
                  {assignment.auditor.email}
                </p>
              )}

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;