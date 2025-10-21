import { Request, Response } from 'express';
import * as cultureService from '@/services/culture.service.js';
import { createCultureSchema, updateCultureSchema } from '@/lib/validators.js';
import { ZodError } from 'zod';

// ✅ GET all cultures
// export const getCultures = async (req: Request, res: Response) => {
//   try {
//     const page = 1;
//     const limit = 10;
//     const cultures = await cultureService.getAllCultures(page, limit);
//     res.status(200).json({
//       success: true,
//       message: 'Successfully retrieved all cultures',
//       data: cultures,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Failed to retrieve cultures' });
//   }
// };

// ✅ GET all cultures with pagination
export const getAllCulturesPaginated = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await cultureService.getAllCulturesPaginated(page, limit);
    res.status(200).json({
      success: true,
      message: 'Successfully retrieved all cultures',
      ...result, // akan menampilkan data, total, page, totalPages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve cultures' });
  }
};


// ✅ GET a single culture by ID
export const getCultureById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const culture = await cultureService.getCultureById(Number(id));
    if (!culture) {
      return res.status(404).json({ success: false, message: 'Culture not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Successfully retrieved culture',
      data: culture,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve culture' });
  }
};

// ✅ POST a new culture
export const createCulture = async (req: Request, res: Response) => {
  try {
    const validatedData = createCultureSchema.parse(req.body);
    const newCulture = await cultureService.createCulture(validatedData);
    res.status(201).json({
      success: true,
      message: 'Culture created successfully',
      data: newCulture,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues,
      });
    }
    res.status(500).json({ success: false, message: 'Failed to create culture' });
  }
};

// ✅ PUT (update) a culture
export const updateCulture = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateCultureSchema.parse(req.body);

    const updatedCulture = await cultureService.updateCulture(id, validatedData);
    res.status(200).json({
      success: true,
      message: 'Culture updated successfully',
      data: updatedCulture,
    });
  } catch (error) {
    console.error('Error updating culture:', error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues,
      });
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ success: false, message: 'Culture not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to update culture' });
  }
};

// ✅ DELETE a culture
export const deleteCulture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await cultureService.deleteCulture(Number(id));
    res.status(200).json({
      success: true,
      message: 'Culture deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
      return res.status(404).json({ success: false, message: 'Culture not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete culture' });
  }
};
