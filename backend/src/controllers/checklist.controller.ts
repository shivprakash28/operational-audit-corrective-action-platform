import { Response } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createChecklistTemplateSchema,
  createChecklistItemSchema,
  assignChecklistSchema,
  checklistResponseSchema,
} from "../validators/checklist.validator";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const createChecklistTemplate = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validatedData = createChecklistTemplateSchema.parse(req.body);

    const template = await prisma.checklistTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    return res.status(201).json({
      message: "Checklist template created successfully",
      template,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to create checklist template",
    });
  }
};

export const createChecklistItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const templateId = Number(req.params.templateId);

    if (!Number.isInteger(templateId)) {
      return res.status(400).json({
        message: "Invalid template ID",
      });
    }

    const validatedData = createChecklistItemSchema.parse(req.body);

    const template = await prisma.checklistTemplate.findUnique({
      where: {
        id: templateId,
      },
    });

    if (!template) {
      return res.status(404).json({
        message: "Checklist template not found",
      });
    }

    const item = await prisma.checklistItem.create({
      data: {
        templateId,
        question: validatedData.question,
        description: validatedData.description,
        order: validatedData.order,
      },
    });

    return res.status(201).json({
      message: "Checklist item created successfully",
      item,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to create checklist item",
    });
  }
};

export const assignChecklist = async (
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

    const validatedData = assignChecklistSchema.parse(req.body);

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

    const template = await prisma.checklistTemplate.findUnique({
      where: {
        id: validatedData.templateId,
      },
    });

    if (!template) {
      return res.status(404).json({
        message: "Checklist template not found",
      });
    }

    const existingChecklist =
      await prisma.auditChecklist.findUnique({
        where: {
          auditId_templateId: {
            auditId,
            templateId: validatedData.templateId,
          },
        },
      });

    if (existingChecklist) {
      return res.status(409).json({
        message: "Checklist template is already assigned to this audit",
      });
    }

    const checklist = await prisma.auditChecklist.create({
      data: {
        auditId,
        templateId: validatedData.templateId,
      },
      include: {
        template: {
          include: {
            items: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Checklist assigned successfully",
      checklist,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to assign checklist",
    });
  }
};

export const getAuditChecklist = async (
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

    const checklists = await prisma.auditChecklist.findMany({
      where: {
        auditId,
      },
      include: {
        template: {
          include: {
            items: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        responses: true,
      },
    });

    return res.status(200).json({
      checklists,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch audit checklist",
    });
  }
};

export const submitChecklistResponse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const auditChecklistId = Number(
      req.params.auditChecklistId
    );

    if (!Number.isInteger(auditChecklistId)) {
      return res.status(400).json({
        message: "Invalid audit checklist ID",
      });
    }

    const validatedData = checklistResponseSchema.parse(req.body);

    const auditChecklist =
      await prisma.auditChecklist.findUnique({
        where: {
          id: auditChecklistId,
        },
      });

    if (!auditChecklist) {
      return res.status(404).json({
        message: "Audit checklist not found",
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

    if (checklistItem.templateId !== auditChecklist.templateId) {
      return res.status(400).json({
        message:
          "Checklist item does not belong to the assigned template",
      });
    }

    const response = await prisma.checklistResponse.upsert({
      where: {
        auditChecklistId_checklistItemId: {
          auditChecklistId,
          checklistItemId: validatedData.checklistItemId,
        },
      },
      update: {
        status: validatedData.status,
        remarks: validatedData.remarks,
        respondedAt: new Date(),
      },
      create: {
        auditChecklistId,
        checklistItemId: validatedData.checklistItemId,
        status: validatedData.status,
        remarks: validatedData.remarks,
      },
    });

    return res.status(200).json({
      message: "Checklist response saved successfully",
      response,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: "Failed to save checklist response",
    });
  }
};