import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import auditRoutes from "./routes/audit.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Operational Audit Platform API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/audits", auditRoutes);

export default app;