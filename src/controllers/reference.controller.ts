import { Request, Response } from "express";
import * as referenceService from "@/services/reference.service.js";
import { createReferensiSchema, updateReferensiSchema } from "@/lib/validators.js";
import { ZodError } from "zod";

// Get All
// export const getReferences = async (_req: Request, res: Response) => {
//   try {
//     const references = await referenceService.getAllReferences();
//     res.status(200).json({
//       message: "Success",
//       data: references,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to retrieve references" });
//   }
// };

// Get by ID
export const getReferenceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reference = await referenceService.getReferenceById(Number(id));

    if (!reference) {
      return res.status(404).json({ message: "Reference not found" });
    }

    res.status(200).json({
      message: "Success",
      data: reference,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve reference" });
  }
};

// Create
export const createReference = async (req: Request, res: Response) => {
  try {
    const validatedData = createReferensiSchema.parse(req.body);
    const newReference = await referenceService.createReference(validatedData);

    res.status(201).json({
      message: "Reference created successfully",
      data: newReference,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    res.status(500).json({ message: "Failed to create reference" });
  }
};

// Update
export const updateReference = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateReferensiSchema.parse(req.body);
    const updatedReference = await referenceService.updateReference(Number(id), validatedData);

    res.status(200).json({
      message: "Reference updated successfully",
      data: updatedReference,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return res.status(404).json({ message: "Reference not found" });
    }

    res.status(500).json({ message: "Failed to update reference" });
  }
};

// Delete
export const deleteReference = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await referenceService.deleteReference(Number(id));

    res.status(200).json({ message: "Reference deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete not found")) {
      return res.status(404).json({ message: "Reference not found" });
    }

    res.status(500).json({ message: "Failed to delete reference" });
  }
};

// ✅ GET (pagination + filter)
export const getAllReferensiPaginated = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await referenceService.getAllReferensiPaginated(page, limit);
    res.status(200).json({
      success: true,
      message: 'Successfully retrieved all referensi',
      ...result, // akan menampilkan data, total, page, totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve referensi' });
  }
};

// ✅ GET public references - BELUM UPDATE SCHEMA
// export const getPublicReferensi = async (req: Request, res: Response) => {
//   try {
//     const result = await referenceService.getPublicReferensi();
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to retrieve public referensi' });
//   }
// };

// ✅ SEARCH references
export const searchReferensi = async (req: Request, res: Response) => {
  try {
    const keyword = String(req.query.q || '');
    if (!keyword) return res.status(400).json({ message: 'Query parameter "q" is required' });

    const results = await referenceService.searchReferensi(keyword);
    if (results.length === 0) {
      return res.status(404).json({ message: 'No references found matching the keyword' });
    }
    res.status(200).json({ success: true, data: results });

  } catch (error) {
    res.status(500).json({ message: error });
  }
};
