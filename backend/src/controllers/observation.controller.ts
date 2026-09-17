import { Response } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth.middleware";
import { createObservationSchema } from "../validators/observation.validator";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const createObservation = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const auditId = Number(req.params.auditId);

    if (!Number.isInteger(auditId)) {
      return res.status(400).json({
        message: "Invalid audit ID",
      });
    }

    const validatedData = createObservationSchema.parse(req.body);

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

    const checklistItem = await prisma.checklistItem.findUnique({
      where: {
        id: validatedData.checklistItemId,
      },
    });

    if (!checklistItem) {
      return res.status(404).json({
        message: "Checklist item not found",
      });
    }

    const auditChecklist =
      await prisma.auditChecklist.findFirst({
        where: {
          auditId,
          templateId: checklistItem.templateId,
        },
      });

    if (!auditChecklist) {
      return res.status(400).json({
        message:
          "Checklist item is not part of a checklist assigned to this audit",
      });
    }

    const observation = await prisma.observation.create({
      data: {
        auditId,
        checklistItemId: validatedData.checklistItemId,
        description: validatedData.description,
        evidenceUrl: validatedData.evidenceUrl,
        createdById: req.user.id,
      },
      include: {
        checklistItem: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Observation created successfully",
      observation,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to create observation",
    });
  }
};

export const getObservations = async (
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

    const observations = await prisma.observation.findMany({
      where: {
        auditId,
      },
      include: {
        checklistItem: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        finding: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      observations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch observations",
    });
  }
};

export const getObservationById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const observationId = Number(req.params.id);

    if (!Number.isInteger(observationId)) {
      return res.status(400).json({
        message: "Invalid observation ID",
      });
    }

    const observation = await prisma.observation.findUnique({
      where: {
        id: observationId,
      },
      include: {
        audit: true,
        checklistItem: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        finding: true,
      },
    });

    if (!observation) {
      return res.status(404).json({
        message: "Observation not found",
      });
    }

    return res.status(200).json({
      observation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch observation",
    });
  }
};