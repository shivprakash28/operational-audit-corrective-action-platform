import { useEffect, useState } from "react";
import api from "../services/api";

interface Audit {
  id: number;
  title: string;
  scope: string;
  departmentId: number;
  objectives: string;
  criteria: string;
  plannedStartDate: string;
  plannedEndDate: string;
  expectedCompletionDate: string;
}

const Audits = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    scope: "",
    departmentId: "",
    objectives: "",
    criteria: "",
    plannedStartDate: "",
    plannedEndDate: "",
    expectedCompletionDate: "",
  });

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

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      await api.post("/audits", {
        title: form.title,
        scope: form.scope,
        departmentId: Number(form.departmentId),
        objectives: form.objectives,
        criteria: form.criteria,
        plannedStartDate: new Date(form.plannedStartDate).toISOString(),
        plannedEndDate: new Date(form.plannedEndDate).toISOString(),
        expectedCompletionDate: new Date(
          form.expectedCompletionDate
        ).toISOString(),
      });

      setSuccess("Audit created successfully.");

      setForm({
        title: "",
        scope: "",
        departmentId: "",
        objectives: "",
        criteria: "",
        plannedStartDate: "",
        plannedEndDate: "",
        expectedCompletionDate: "",
      });

      await fetchAudits();
    } catch (err: any) {
      console.error("Failed to create audit:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create audit. Please try again."
      );
    }
  };

  if (loading) {
    return <p>Loading audits...</p>;
  }

  return (
    <div>
      <h2>Audit Planning</h2>

      <h3>Create Audit</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <br />
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="scope">Scope</label>
          <br />
          <textarea
            id="scope"
            name="scope"
            value={form.scope}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="departmentId">Department ID</label>
          <br />
          <input
            id="departmentId"
            name="departmentId"
            type="number"
            min="1"
            value={form.departmentId}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="objectives">Objectives</label>
          <br />
          <textarea
            id="objectives"
            name="objectives"
            value={form.objectives}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="criteria">Criteria</label>
          <br />
          <textarea
            id="criteria"
            name="criteria"
            value={form.criteria}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="plannedStartDate">Planned Start Date</label>
          <br />
          <input
            id="plannedStartDate"
            name="plannedStartDate"
            type="datetime-local"
            value={form.plannedStartDate}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="plannedEndDate">Planned End Date</label>
          <br />
          <input
            id="plannedEndDate"
            name="plannedEndDate"
            type="datetime-local"
            value={form.plannedEndDate}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="expectedCompletionDate">
            Expected Completion Date
          </label>
          <br />
          <input
            id="expectedCompletionDate"
            name="expectedCompletionDate"
            type="datetime-local"
            value={form.expectedCompletionDate}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <button type="submit">Create Audit</button>
      </form>

      {success && <p>{success}</p>}

      {error && <p>{error}</p>}

      <hr />

      <h3>Existing Audits</h3>

      {audits.length === 0 ? (
        <p>No audits found.</p>
      ) : (
        <div>
          {audits.map((audit) => (
            <div key={audit.id}>
              <h3>
                    #{audit.id} - {audit.title}
                </h3>  

                <button
  type="button"
  onClick={async () => {
    try {
      const response = await api.get(`/audits/${audit.id}`);
      console.log("Audit details:", response.data);
    } catch (err) {
      console.error("Failed to fetch audit details:", err);
    }
  }}
>
  View Details
</button>



<button
  type="button"
  onClick={async () => {
    try {
      const response = await api.put(`/audits/${audit.id}`, {
        scope: `${audit.scope} - Updated`,
      });

      console.log("Audit updated:", response.data);

      await fetchAudits();
    } catch (err) {
      console.error("Failed to update audit:", err);
    }
  }}
>
  Update Scope
</button>

              <p>
                <strong>Scope:</strong> {audit.scope}
              </p>

              <p>
                <strong>Department ID:</strong> {audit.departmentId}
              </p>

              <p>
                <strong>Objectives:</strong> {audit.objectives}
              </p>

              <p>
                <strong>Criteria:</strong> {audit.criteria}
              </p>

              <p>
                <strong>Planned Start:</strong>{" "}
                {new Date(audit.plannedStartDate).toLocaleDateString()}
              </p>

              <p>
                <strong>Planned End:</strong>{" "}
                {new Date(audit.plannedEndDate).toLocaleDateString()}
              </p>

              <p>
                <strong>Expected Completion:</strong>{" "}
                {new Date(
                  audit.expectedCompletionDate
                ).toLocaleDateString()}
              </p>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Audits;