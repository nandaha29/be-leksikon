import { Request, Response } from "express";
import * as subcultureService from "../services/subculture.service.js";
import { createSubcultureSchema, updateSubcultureSchema, createSubcultureAssetSchema } from "@/lib/validators.js";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { de } from "zod/locales";

// export const getAllSubcultures = async (req: Request, res: Response) => {
//   try {
//     const subcultures = await subcultureService.getAllSubcultures();
//     res.json(subcultures);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch subcultures" });
//   }
// };

export const getSubcultureById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const subculture = await subcultureService.getSubcultureById(id);
    if (!subculture) return res.status(404).json({ error: "Subculture not found" });
    res.json(subculture);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subculture" });
  }
};

export const createSubculture = async (req: Request, res: Response) => {
  try {
    const parsed = createSubcultureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const subculture = await subcultureService.createSubculture(parsed.data);
    res.status(201).json(subculture);
  } catch (error) {
    res.status(500).json({ error: "Failed to create subculture" });
  }
};

export const updateSubculture = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const parsed = updateSubcultureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const subculture = await subcultureService.updateSubculture(id, parsed.data);
    res.json(subculture);
  } catch (error) {
    res.status(500).json({ error: "Failed to update subculture" });
  }
};

export const deleteSubculture = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await subcultureService.deleteSubculture(id);
    res.json({ message: "Subculture deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subculture" });
  }
};

// GET /api/subcultures/:id/assets
export const getSubcultureAssets = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const assets = await subcultureService.getSubcultureAssets(id);
    return res.status(200).json(assets);
  } catch (error) {
    console.error('Failed to get subculture assets:', error);
    return res.status(500).json({ message: 'Failed to retrieve assets' });
  }
};

// POST /api/subcultures/:id/assets
export const addAssetToSubculture = async (req: Request, res: Response) => {
  try {
    const subcultureId = Number(req.params.id);
    if (Number.isNaN(subcultureId)) return res.status(400).json({ message: 'Invalid subculture ID' });

    const { assetId, assetRole } = req.body;
    const validated = createSubcultureAssetSchema.parse({ subcultureId, assetId, assetRole });

    const result = await subcultureService.addAssetToSubculture(subcultureId, assetId, assetRole);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error });
    }
    if ((error as any)?.code === 'SUBCULTURE_NOT_FOUND') {
      return res.status(404).json({ message: 'Subculture not found' });
    }
    if ((error as any)?.code === 'ASSET_NOT_FOUND') {
      return res.status(404).json({ message: 'Asset not found' });
    }
    console.error('Failed to add asset to subculture:', error);
    return res.status(500).json({ message: 'Failed to add asset', details: error });
  }
};

// DELETE /api/subcultures/:id/assets/:assetId
export const removeAssetFromSubculture = async (req: Request, res: Response) => {
  try {
    const subcultureId = Number(req.params.id);
    const assetId = Number(req.params.assetId);
    if (Number.isNaN(subcultureId) || Number.isNaN(assetId)) return res.status(400).json({ message: 'Invalid IDs' });

    await subcultureService.removeAssetFromSubculture(subcultureId, assetId);
    return res.status(200).json({ message: 'Asset removed from subculture' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Association not found' });
    }
    console.error('Failed to remove asset from subculture:', error);
    return res.status(500).json({ message: 'Failed to remove asset' });
  }
};

// GET /api/v1/subcultures?page=1&limit=10
export const getAllSubculturesPaginated = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { subcultures, total } = await subcultureService.getAllSubculturesPaginated(skip, limit);

    res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      data: subcultures,
    });
  } catch (error) {
    console.error("Error fetching paginated subcultures:", error);
    res.status(500).json({ error: "Failed to fetch subcultures (paginated)" });
  }
};

// GET /api/v1/cultures/:culture_id/subcultures
export const getSubculturesByCulture = async (req: Request, res: Response) => {
  try {
    // Accept either `culture_id` (snake_case) or `cultureId` (camelCase) depending on route
    const raw = req.params.culture_id ?? req.params.cultureId ?? req.params.cultureId;
    const cultureId = Number(raw);
    if (Number.isNaN(cultureId)) return res.status(400).json({ error: "Invalid culture_id" });

    const subcultures = await subcultureService.getSubculturesByCulture(cultureId);

    if (!subcultures || subcultures.length === 0) {
      return res.status(404).json({ message: "No subcultures found for this culture" });
    }

    res.status(200).json({
      status: "success",
      data: subcultures,
    });
  } catch (error) {
    console.error("Error fetching subcultures by culture:", error);
    res.status(500).json({ error: "Failed to fetch subcultures by culture" });
  }
};
