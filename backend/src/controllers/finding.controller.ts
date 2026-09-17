import { Response } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createFindingSchema,
  updateFindingSchema,
} from "../validators/finding.validator";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const createFinding = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const observationId = Number(req.params.observationId);

    if (!Number.isInteger(observationId)) {
      return res.status(400).json({
        message: "Invalid observation ID",
      });
    }

    const validatedData = createFindingSchema.parse(req.body);

    const observation = await prisma.observation.findUnique({
      where: {
        id: observationId,
      },
      include: {
        finding: true,
      },
    });

    if (!observation) {
      return res.status(404).json({
        message: "Observation not found",
      });
    }

    if (observation.finding) {
      return res.status(409).json({
        message: "Finding already exists for this observation",
      });
    }

    const department = await prisma.department.findUnique({
      where: {
        id: validatedData.responsibleDepartmentId,
      },
    });

    if (!department) {
      return res.status(404).json({
        message: "Responsible department not found",
      });
    }

    if (validatedData.ownerId !== undefined) {
      const owner = await prisma.user.findUnique({
        where: {
          id: validatedData.ownerId,
        },
      });

      if (!owner) {
        return res.status(404).json({
          message: "Owner not found",
        });
      }
    }

    const finding = await prisma.finding.create({
      data: {
        auditId: observation.auditId,
        observationId,
        severity: validatedData.severity,
        responsibleDepartmentId:
          validatedData.responsibleDepartmentId,
        ownerId: validatedData.ownerId,
        description: validatedData.description,
      },
      include: {
        observation: true,
        responsibleDepartment: true,
        owner: {
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
      message: "Finding created successfully",
      finding,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to create finding",
    });
  }
};

export const getFindings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const findings = await prisma.finding.findMany({
      include: {
        observation: true,
        responsibleDepartment: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      findings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch findings",
    });
  }
};

export const getFindingById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const findingId = Number(req.params.id);

    if (!Number.isInteger(findingId)) {
      return res.status(400).json({
        message: "Invalid finding ID",
      });
    }

    const finding = await prisma.finding.findUnique({
      where: {
        id: findingId,
      },
      include: {
        audit: true,
        observation: {
          include: {
            checklistItem: true,
          },
        },
        responsibleDepartment: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        correctiveActions: true,
      },
    });

    if (!finding) {
      return res.status(404).json({
        message: "Finding not found",
      });
    }

    return res.status(200).json({
      finding,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch finding",
    });
  }
};

export const updateFinding = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const findingId = Number(req.params.id);

    if (!Number.isInteger(findingId)) {
      return res.status(400).json({
        message: "Invalid finding ID",
      });
    }

    const validatedData = updateFindingSchema.parse(req.body);

    const existingFinding = await prisma.finding.findUnique({
      where: {
        id: findingId,
      },
    });

    if (!existingFinding) {
      return res.status(404).json({
        message: "Finding not found",
      });
    }

    if (validatedData.responsibleDepartmentId !== undefined) {
      const department = await prisma.department.findUnique({
        where: {
          id: validatedData.responsibleDepartmentId,
        },
      });

      if (!department) {
        return res.status(404).json({
          message: "Responsible department not found",
        });
      }
    }

    if (
      validatedData.ownerId !== undefined &&
      validatedData.ownerId !== null
    ) {
      const owner = await prisma.user.findUnique({
        where: {
          id: validatedData.ownerId,
        },
      });

      if (!owner) {
        return res.status(404).json({
          message: "Owner not found",
        });
      }
    }

    const finding = await prisma.finding.update({
      where: {
        id: findingId,
      },
      data: validatedData,
      include: {
        observation: true,
        responsibleDepartment: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Finding updated successfully",
      finding,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to update finding",
    });
  }
};