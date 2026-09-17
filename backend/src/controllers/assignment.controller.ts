import { Response } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth.middleware";
import { assignAuditorSchema } from "../validators/assignment.validator";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const assignAuditor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const auditId = Number(req.params.auditId);

    if (!Number.isInteger(auditId)) {
      return res.status(400).json({
        message: "Invalid audit ID",
      });
    }

    const validatedData = assignAuditorSchema.parse(req.body);

    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
    });

    if (!audit) {
      return res.status(404).json({
        message: "Audit not found",
      });
    }

    const auditor = await prisma.user.findUnique({
      where: {
        id: validatedData.auditorId,
      },
    });

    if (!auditor) {
      return res.status(404).json({
        message: "Auditor not found",
      });
    }

    if (auditor.role !== "AUDITOR") {
      return res.status(400).json({
        message: "Selected user is not an auditor",
      });
    }

    if (
      auditor.departmentId !== null &&
      auditor.departmentId === audit.departmentId
    ) {
      return res.status(400).json({
        message:
          "Auditor cannot be assigned to an audit in the same department",
      });
    }

    const existingAssignment =
      await prisma.auditAssignment.findUnique({
        where: {
          auditId_auditorId: {
            auditId,
            auditorId: validatedData.auditorId,
          },
        },
      });

    if (existingAssignment) {
      return res.status(409).json({
        message: "Auditor is already assigned to this audit",
      });
    }

    const assignment = await prisma.auditAssignment.create({
      data: {
        auditId,
        auditorId: validatedData.auditorId,
      },
      include: {
        auditor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Auditor assigned successfully",
      assignment,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to assign auditor",
    });
  }
};

export const getAssignments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const auditId = Number(req.params.auditId);

    if (!Number.isInteger(auditId)) {
      return res.status(400).json({
        message: "Invalid audit ID",
      });
    }

    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
    });

    if (!audit) {
      return res.status(404).json({
        message: "Audit not found",
      });
    }

    const assignments = await prisma.auditAssignment.findMany({
      where: {
        auditId,
      },
      include: {
        auditor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
};