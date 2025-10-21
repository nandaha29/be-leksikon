import { Request, Response } from 'express';
import * as contributorService from '@/services/contributor.service.js';
import { createContributorSchema, updateContributorSchema } from '@/lib/validators.js';
import { ZodError } from 'zod';

// GET all contributors
// export const getContributors = async (req: Request, res: Response) => {
//   try {
//     const contributors = await contributorService.getAllContributors();
//     res.status(200).json({
//       success: true,
//       message: 'Contributors retrieved successfully',
//       data: contributors,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Failed to retrieve contributors' });
//   }
// };

// GET all contributors (with pagination)
export const getContributors = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await contributorService.getAllContributorsPaginated(page, limit);

    res.status(200).json({
      success: true,
      message: 'Contributors retrieved successfully',
      ...result, // akan menampilkan data, total, page, totalPages
    });
  } catch (error) {
    console.error('Error retrieving contributors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contributors',
    });
  }
};


// GET contributor by ID
export const getContributorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contributor = await contributorService.getContributorById(Number(id));
    if (!contributor) {
      return res.status(404).json({ success: false, message: 'Contributor not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Contributor retrieved successfully',
      data: contributor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve contributor' });
  }
};

// POST contributor
export const createContributor = async (req: Request, res: Response) => {
  try {
    const validatedData = createContributorSchema.parse(req.body);
    const newContributor = await contributorService.createContributor(validatedData);
    res.status(201).json({
      success: true,
      message: 'Contributor created successfully',
      data: newContributor,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues,
      });
    }
    res.status(500).json({ success: false, message: 'Failed to create contributor' });
  }
};

// PUT contributor
export const updateContributor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = updateContributorSchema.parse(req.body);
    const updatedContributor = await contributorService.updateContributor(id, validatedData);
    res.status(200).json({
      success: true,
      message: 'Contributor updated successfully',
      data: updatedContributor,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues,
      });
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ success: false, message: 'Contributor not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to update contributor' });
  }
};

// DELETE contributor
export const deleteContributor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await contributorService.deleteContributor(id);
    res.status(200).json({
      success: true,
      message: 'Contributor deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
      return res.status(404).json({ success: false, message: 'Contributor not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete contributor' });
  }
};

// SEARCH contributors
export const searchContributors = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter q is required',
      });
    }

    const results = await contributorService.searchContributors(q);
    res.status(200).json({
      success: true,
      message: `Found ${results.length} contributors matching "${q}"`,
      data: results,
    });
  } catch (error) {
    console.error('Error searching contributors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search contributors',
    });
  }
};
