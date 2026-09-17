import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import auditRoutes from "./routes/audit.routes";
import assignmentRoutes from "./routes/assignment.routes";
import checklistRoutes from "./routes/checklist.routes";
import observationRoutes from "./routes/observation.routes";
import findingRoutes from "./routes/finding.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/audits", assignmentRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/findings", findingRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Operational Audit Platform API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/audits", auditRoutes);

export default app;