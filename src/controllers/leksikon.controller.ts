import { Request, Response } from 'express';
import * as leksikonService from '@/services/leksikon.service.js';
import { createLeksikonSchema, updateLeksikonSchema, createLeksikonAssetSchema, createLeksikonReferensiSchema } from '@/lib/validators.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// GET /api/leksikons
// export const getLeksikons = async (req: Request, res: Response) => {
//   try {
//     const items = await leksikonService.getAllLeksikons();
//     return res.status(200).json(items);
//   } catch (error) {
//     console.error('Failed to get leksikons:', error);
//     return res.status(500).json({ message: 'Failed to retrieve leksikons', details: error});
//   }
// };

// GET /api/leksikons/:id
export const getLeksikonById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const item = await leksikonService.getLeksikonById(id);
    if (!item) return res.status(404).json({ message: 'Leksikon not found' });
    return res.status(200).json(item);
  } catch (error) {
    console.error('Failed to get leksikon by id:', error);
    return res.status(500).json({ message: 'Failed to retrieve leksikon', details: error });
  }
};

// POST /api/leksikons
export const createLeksikon = async (req: Request, res: Response) => {
  try {
    const validated = createLeksikonSchema.parse(req.body);
    const created = await leksikonService.createLeksikon(validated);
    return res.status(201).location(`/api/leksikons/${created.leksikonId}`).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error });
    }
    if ((error as any)?.code === 'DOMAIN_NOT_FOUND') {
      return res.status(400).json({ message: 'Referenced domain (domainKodifikasiId) does not exist' });
    }
    if ((error as any)?.code === 'CONTRIBUTOR_NOT_FOUND') {
      return res.status(400).json({ message: 'Referenced contributor does not exist' });
    }
    console.error('Failed to create leksikon:', error);
    return res.status(500).json({ message: 'Failed to create leksikon', details: error });
  }
};

// PUT /api/leksikons/:id
export const updateLeksikon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const validated = updateLeksikonSchema.parse(req.body);
    const updated = await leksikonService.updateLeksikon(id, validated);
    return res.status(200).json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error });
    }
    if ((error as any)?.code === 'DOMAIN_NOT_FOUND') {
      return res.status(400).json({ message: 'Referenced domain (domainKodifikasiId) does not exist' });
    }
    if ((error as any)?.code === 'CONTRIBUTOR_NOT_FOUND') {
      return res.status(400).json({ message: 'Referenced contributor does not exist' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Leksikon not found' });
    }
    console.error('Failed to update leksikon:', error);
    return res.status(500).json({ message: 'Failed to update leksikon',details: error });
  }
};

// DELETE /api/leksikons/:id
export const deleteLeksikon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    await leksikonService.deleteLeksikon(id);
      res.status(200).json({
      success: true,
      message: 'Domain deleted successfully',
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Leksikon not found' });
    }
    console.error('Failed to delete leksikon:', error);
    return res.status(500).json({ message: 'Failed to delete leksikon', details: error });
  }
};

// GET /api/leksikons/:id/assets
export const getLeksikonAssets = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const assets = await leksikonService.getLeksikonAssets(id);
    return res.status(200).json(assets);
  } catch (error) {
    console.error('Failed to get leksikon assets:', error);
    return res.status(500).json({ message: 'Failed to retrieve assets', details: error });
  }
};

// POST /api/leksikons/:id/assets
// export const addAssetToLeksikon = async (req: Request, res: Response) => {
//   try {
//     const leksikonId = Number(req.params.id);
//     if (Number.isNaN(leksikonId)) return res.status(400).json({ message: 'Invalid leksikon ID' });

//     const { assetId, assetRole } = req.body;
//     const validated = createLeksikonAssetSchema.parse({ leksikonId, assetId, assetRole });

//     const result = await leksikonService.addAssetToLeksikon(leksikonId, assetId, assetRole);
//     return res.status(201).json(result);
//   } catch (error) {
//     if (error instanceof ZodError) {
//       return res.status(400).json({ message: 'Validation failed', errors: error });
//     }
//     if ((error as any)?.code === 'LEKSIKON_NOT_FOUND') {
//       return res.status(404).json({ message: 'Leksikon not found' });
//     }
//     if ((error as any)?.code === 'ASSET_NOT_FOUND') {
//       return res.status(404).json({ message: 'Asset not found' });
//     }
//     console.error('Failed to add asset to leksikon:', error);
//     return res.status(500).json({ message: 'Failed to add asset', details: error });
//   }
// };

// POST /api/leksikons/:id/assets
export const addAssetToLeksikon = async (req: Request, res: Response) => {
  try {
    const leksikonId = Number(req.params.id);
    if (Number.isNaN(leksikonId)) {
      return res.status(400).json({ message: 'Invalid leksikon ID' });
    }

    const { assetId, assetRole } = req.body;

    // Validasi input dengan Zod
    const validated = createLeksikonAssetSchema.parse({
      leksikonId,
      assetId,
      assetRole,
    });

    // Lakukan upsert di service agar tidak duplikat
    const result = await leksikonService.addAssetToLeksikon(
      validated.leksikonId,
      validated.assetId,
      validated.assetRole
    );

    return res.status(201).json({
      success: true,
      message: 'Asset successfully linked to leksikon',
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error,
      });
    }

    if ((error as any)?.code === 'LEKSIKON_NOT_FOUND') {
      return res.status(404).json({ message: 'Leksikon not found' });
    }
    if ((error as any)?.code === 'ASSET_NOT_FOUND') {
      return res.status(404).json({ message: 'Asset not found' });
    }

    console.error('Failed to add asset to leksikon:', error);
    return res.status(500).json({
      message: 'Failed to add asset to leksikon',
      details: error instanceof Error ? error.message : error,
    });
  }
};


// DELETE /api/leksikons/:id/assets/:assetId
export const removeAssetFromLeksikon = async (req: Request, res: Response) => {
  try {
    const leksikonId = Number(req.params.id);
    const assetId = Number(req.params.assetId);
    if (Number.isNaN(leksikonId) || Number.isNaN(assetId)) return res.status(400).json({ message: 'Invalid IDs' });

    await leksikonService.removeAssetFromLeksikon(leksikonId, assetId);
    return res.status(200).json({ message: 'Asset removed from leksikon' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Association not found' });
    }
    console.error('Failed to remove asset from leksikon:', error);
    return res.status(500).json({ message: 'Failed to remove asset', details: error });
  }
};

// GET /api/leksikons/:id/references
export const getLeksikonReferences = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });

    const references = await leksikonService.getLeksikonReferences(id);
    return res.status(200).json(references);
  } catch (error) {
    console.error('Failed to get leksikon references:', error);
    return res.status(500).json({ message: 'Failed to retrieve references', details: error });
  }
};

// POST /api/leksikons/:id/references
// export const addReferenceToLeksikon = async (req: Request, res: Response) => {
//   try {
//     const leksikonId = Number(req.params.id);
//     if (Number.isNaN(leksikonId)) return res.status(400).json({ message: 'Invalid leksikon ID' });

//     const { referensiId, citationNote } = req.body;
//     const validated = createLeksikonReferensiSchema.parse({ leksikonId, referensiId, citationNote });

//     const result = await leksikonService.addReferenceToLeksikon(leksikonId, referensiId, citationNote);
//     return res.status(201).json(result);
//   } catch (error) {
//     if (error instanceof ZodError) {
//       return res.status(400).json({ message: 'Validation failed', errors: error });
//     }
//     if ((error as any)?.code === 'LEKSIKON_NOT_FOUND') {
//       return res.status(404).json({ message: 'Leksikon not found' });
//     }
//     if ((error as any)?.code === 'REFERENSI_NOT_FOUND') {
//       return res.status(404).json({ message: 'Referensi not found' });
//     }
//     console.error('Failed to add reference to leksikon:', error);
//     return res.status(500).json({ message: 'Failed to add reference', details: error });
//   }
// };

// POST /api/leksikons/:id/references
export const addReferenceToLeksikon = async (req: Request, res: Response) => {
  try {
    const leksikonId = Number(req.params.id);
    if (Number.isNaN(leksikonId))
      return res.status(400).json({ message: 'Invalid leksikon ID' });

    const { referensiId, citationNote } = req.body;
    const validated = createLeksikonReferensiSchema.parse({
      leksikonId,
      referensiId,
      citationNote,
    });

    const result = await leksikonService.addReferenceToLeksikon(
      validated.leksikonId,
      validated.referensiId,
      validated.citationNote
    );

    return res.status(201).json({
      success: true,
      message: 'Reference successfully linked to leksikon',
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error,
      });
    }
    if ((error as any)?.code === 'LEKSIKON_NOT_FOUND') {
      return res.status(404).json({ message: 'Leksikon not found' });
    }
    if ((error as any)?.code === 'REFERENSI_NOT_FOUND') {
      return res.status(404).json({ message: 'Referensi not found' });
    }

    console.error('Failed to add reference to leksikon:', error);
    return res.status(500).json({
      message: 'Failed to add reference to leksikon',
      details: error instanceof Error ? error.message : error,
    });
  }
};


// DELETE /api/leksikons/:id/references/:referenceId
export const removeReferenceFromLeksikon = async (req: Request, res: Response) => {
  try {
    const leksikonId = Number(req.params.id);
    const referensiId = Number(req.params.referenceId);
    if (Number.isNaN(leksikonId) || Number.isNaN(referensiId)) return res.status(400).json({ message: 'Invalid IDs' });

    await leksikonService.removeReferenceFromLeksikon(leksikonId, referensiId);
    return res.status(200).json({ message: 'Reference removed from leksikon' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Association not found' });
    }
    console.error('Failed to remove reference from leksikon:', error);
    return res.status(500).json({ message: 'Failed to remove reference', details: error });
  }
};

// PUT /api/v1/leksikons/:id/assets/:assetId
export const updateAssetRole = async (req: Request, res: Response) => {
  try {
    const leksikonId = Number(req.params.id);
    const assetId = Number(req.params.assetId);
    const { assetRole } = req.body;

    if (Number.isNaN(leksikonId) || Number.isNaN(assetId))
      return res.status(400).json({ message: 'Invalid IDs' });

    if (!assetRole)
      return res.status(400).json({ message: 'assetRole is required' });

    const result = await leksikonService.updateAssetRole(
      leksikonId,
      assetId,
      assetRole
    );

    return res.status(200).json({
      success: true,
      message: 'Asset role updated successfully',
      data: result,
    });
  } catch (error) {
    if ((error as any)?.code === 'ASSOCIATION_NOT_FOUND')
      return res.status(404).json({ message: 'Asset relation not found' });

    console.error('Failed to update asset role:', error);
    return res
      .status(500)
      .json({ message: 'Failed to update asset role', details: error });
  }
};

// PUT /api/v1/leksikons/:id/references/:referenceId
export const updateCitationNote = async (req: Request, res: Response) => {
  try {
    const leksikonId = Number(req.params.id);
    const referensiId = Number(req.params.referenceId);
    const { citationNote } = req.body;

    if (Number.isNaN(leksikonId) || Number.isNaN(referensiId))
      return res.status(400).json({ message: 'Invalid IDs' });

    const result = await leksikonService.updateCitationNote(
      leksikonId,
      referensiId,
      citationNote
    );

    return res.status(200).json({
      success: true,
      message: 'Citation note updated successfully',
      data: result,
    });
  } catch (error) {
    if ((error as any)?.code === 'ASSOCIATION_NOT_FOUND')
      return res.status(404).json({ message: 'Reference relation not found' });

    console.error('Failed to update citation note:', error);
    return res
      .status(500)
      .json({ message: 'Failed to update citation note', details: error });
  }
};

export const getAllLeksikonsPaginated = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const result = await leksikonService.getAllLeksikonsPaginated(page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leksikons", error });
  }
};

export const getLeksikonsByDomain = async (req: Request, res: Response) => {
  const dk_id = parseInt(req.params.dk_id);
  try {
    const data = await leksikonService.getLeksikonsByDomain(dk_id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leksikons by domain", error });
  }
};

export const getLeksikonsByStatus = async (req: Request, res: Response) => {
  const status = req.query.status as string;
  try {
    const data = await leksikonService.getLeksikonsByStatus(status);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leksikons by status", error });
  }
};

export const updateLeksikonStatus = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const updated = await leksikonService.updateLeksikonStatus(id, status);
    res.status(200).json({ message: "Status updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update leksikon status", error });
  }
};