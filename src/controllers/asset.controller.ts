import { Request, Response } from 'express';
import * as assetService from '../services/asset.service.js';
import { createAssetSchema, updateAssetSchema, CreateAssetInput } from '@/lib/validators.js';
import { put } from '@vercel/blob';
import crypto from 'crypto';

// ✅ Get All / Filter / Paginate
// export const getAllAssets = async (req: Request, res: Response) => {
//   try {
//     const { type, page, limit } = req.query;
//     const assets = await assetService.getAllAssets(
//       type as string,
//       page ? Number(page) : undefined,
//       limit ? Number(limit) : undefined
//     );
//     res.status(200).json({ success: true, data: assets });
//   } catch {
//     res.status(500).json({ message: 'Failed to fetch assets' });
//   }
// };

export const getAllAssetsPaginated = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await assetService.getAllAssetsPaginated(page, limit);
    res.status(200).json({
      success: true,
      message: 'Successfully retrieved all assets',
      ...result, // akan menampilkan data, total, page, totalPages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assets' });
  }
};

// ✅ Get Asset by ID
export const getAssetById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const asset = await assetService.getAssetById(id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.status(200).json({ success: true, data: asset });
  } catch {
    res.status(500).json({ message: 'Failed to fetch asset' });
  }
};

// ✅ Create / Upload Asset
export const createAsset = async (req: Request, res: Response) => {
  try {
    const metadata = req.body;
    const parsed = createAssetSchema.parse(metadata);

    if (['FOTO', 'AUDIO'].includes(parsed.tipe)) {
      if (!req.file) {
        return res.status(400).json({ message: 'File is required for FOTO and AUDIO types' });
      }
      const maxSize = parsed.tipe === 'FOTO' ? 500 * 1024 : 10 * 1024 * 1024;
      if (req.file.size > maxSize) {
        const sizeText = parsed.tipe === 'FOTO' ? '500kb' : '10mb';
        return res.status(400).json({ message: `File size must be less than ${sizeText}` });
      }
      const newAsset = await assetService.createAsset(parsed, req.file);
      res.status(201).json({ success: true, data: newAsset });
    } else if (['VIDEO', 'MODEL_3D'].includes(parsed.tipe)) {
      if (req.file) {
        return res.status(400).json({ message: 'File not allowed for VIDEO and MODEL_3D types' });
      }
      // URL is ensured by schema
      const newAsset = await assetService.createAssetFromUrl(parsed as CreateAssetInput & { url: string });
      res.status(201).json({ success: true, data: newAsset });
    } else {
      return res.status(400).json({ message: 'Invalid asset type' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Update Asset
export const updateAsset = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const parsed = updateAssetSchema.parse(req.body);
    let updateData = parsed;

    const asset = await assetService.getAssetById(id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    if (req.file) {
      if (!['FOTO', 'AUDIO'].includes(asset.tipe)) {
        return res.status(400).json({ message: 'File upload only allowed for FOTO and AUDIO types' });
      }
      const maxSize = asset.tipe === 'FOTO' ? 500 * 1024 : 10 * 1024 * 1024;
      if (req.file.size > maxSize) {
        const sizeText = asset.tipe === 'FOTO' ? '500kb' : '10mb';
        return res.status(400).json({ message: `File size must be less than ${sizeText}` });
      }
      // Upload new file
      const blob = await put(req.file.originalname, req.file.buffer, { access: 'public' });
      const fileSize = req.file.size.toString();
      const hashChecksum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
      updateData = { ...parsed, url: blob.url, fileSize, hashChecksum };
    } else if (parsed.url && ['VIDEO', 'MODEL_3D'].includes(asset.tipe)) {
      // Allow updating url for VIDEO and MODEL_3D
    } else if (parsed.url && ['FOTO', 'AUDIO'].includes(asset.tipe)) {
      return res.status(400).json({ message: 'Cannot update URL for FOTO and AUDIO types' });
    }

    const updated = await assetService.updateAsset(id, updateData);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Asset
export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await assetService.deleteAsset(id);
    res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to delete asset' });
  }
};

// // ✅ Public Asset File SCHEMA BELUM ADA STATUS PUBLIC APA BELUM
// export const getPublicAssetFile = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//     const asset = await assetService.getPublicAssetFile(id);
//     if (!asset) return res.status(404).json({ message: 'File not found or unpublished' });
//     res.status(200).json({ success: true, data: asset });
//   } catch {
//     res.status(500).json({ message: 'Failed to access public file' });
//   }
// };

// ✅ Bulk Upload
export const bulkUploadAssets = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const assets = req.body;

    if (!Array.isArray(assets) || !Array.isArray(files)) {
      return res.status(400).json({ message: 'Request body must be an array of assets and files must be provided' });
    }

    if (assets.length !== files.length) {
      return res.status(400).json({ message: 'Number of assets and files must match' });
    }

    // Check that all assets are FOTO or AUDIO
    for (const asset of assets) {
      if (!['FOTO', 'AUDIO'].includes(asset.tipe)) {
        return res.status(400).json({ message: 'Bulk upload only supports FOTO and AUDIO types' });
      }
    }

    // Check file sizes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const asset = assets[i];
      const maxSize = asset.tipe === 'FOTO' ? 500 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const sizeText = asset.tipe === 'FOTO' ? '500kb' : '10mb';
        return res.status(400).json({ message: `File ${i + 1} size must be less than ${sizeText}` });
      }
    }

    const result = await assetService.bulkUploadAssets(assets, files);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// SEARCH assets
export const searchAssets = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter q is required',
      });
    }

    const results = await assetService.searchAssets(q);
    res.status(200).json({
      success: true,
      message: `Found ${results.length} assets matching "${q}"`,
      data: results,
    });
  } catch (error) {
    console.error('Error searching assets:', error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};
