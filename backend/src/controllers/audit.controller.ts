import { Response } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createAuditSchema,
  updateAuditSchema,
} from "../validators/audit.validator";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const createAudit = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const validatedData = createAuditSchema.parse(req.body);

    const department = await prisma.department.findUnique({
      where: {
        id: validatedData.departmentId,
      },
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const audit = await prisma.audit.create({
      data: {
        title: validatedData.title,
        scope: validatedData.scope,
        departmentId: validatedData.departmentId,
        objectives: validatedData.objectives,
        criteria: validatedData.criteria,
        plannedStartDate: new Date(validatedData.plannedStartDate),
        plannedEndDate: new Date(validatedData.plannedEndDate),
        expectedCompletionDate: new Date(
          validatedData.expectedCompletionDate
        ),
        createdById: req.user.id,
      },
    });

    return res.status(201).json({
      message: "Audit created successfully",
      audit,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to create audit",
    });
  }
};

export const getAudits = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const audits = await prisma.audit.findMany({
      include: {
        department: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      audits,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch audits",
    });
  }
};

export const getAuditById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const auditId = Number(req.params.id);

    if (!Number.isInteger(auditId)) {
      return res.status(400).json({
        message: "Invalid audit ID",
      });
    }

    const audit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
      include: {
        department: true,
        assignments: true,
      },
    });

    if (!audit) {
      return res.status(404).json({
        message: "Audit not found",
      });
    }

    return res.status(200).json({
      audit,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch audit",
    });
  }
};

export const updateAudit = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const auditId = Number(req.params.id);

    if (!Number.isInteger(auditId)) {
      return res.status(400).json({
        message: "Invalid audit ID",
      });
    }

    const validatedData = updateAuditSchema.parse(req.body);

    const existingAudit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
    });

    if (!existingAudit) {
      return res.status(404).json({
        message: "Audit not found",
      });
    }

    const audit = await prisma.audit.update({
      where: {
        id: auditId,
      },
      data: {
        ...(validatedData.title !== undefined && {
          title: validatedData.title,
        }),

        ...(validatedData.scope !== undefined && {
          scope: validatedData.scope,
        }),

        ...(validatedData.departmentId !== undefined && {
          departmentId: validatedData.departmentId,
        }),

        ...(validatedData.objectives !== undefined && {
          objectives: validatedData.objectives,
        }),

        ...(validatedData.criteria !== undefined && {
          criteria: validatedData.criteria,
        }),

        ...(validatedData.plannedStartDate !== undefined && {
          plannedStartDate: new Date(
            validatedData.plannedStartDate
          ),
        }),

        ...(validatedData.plannedEndDate !== undefined && {
          plannedEndDate: new Date(
            validatedData.plannedEndDate
          ),
        }),

        ...(validatedData.expectedCompletionDate !== undefined && {
          expectedCompletionDate: new Date(
            validatedData.expectedCompletionDate
          ),
        }),
      },
    });

    return res.status(200).json({
      message: "Audit updated successfully",
      audit,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to update audit",
    });
  }
};