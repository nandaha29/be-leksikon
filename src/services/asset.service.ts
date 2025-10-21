import { PrismaClient, StatusFile, AssetType } from '@prisma/client';
import { put } from '@vercel/blob';
import crypto from 'crypto';
import { CreateAssetInput, UpdateAssetInput } from '@/lib/validators.js';

const prisma = new PrismaClient();

// ✅ Create new asset
export const createAsset = async (data: Omit<CreateAssetInput, 'url' | 'fileSize' | 'hashChecksum'>, file: Express.Multer.File) => {
  // Upload to Vercel Blob
  const blob = await put(file.originalname, file.buffer, {
    access: 'public',
  });

  // Compute file size and hash
  const fileSize = file.size.toString();
  const hashChecksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

  // Ensure required fields are always strings (not undefined)
  const cleanedData = {
    ...data,
    url: blob.url,
    fileSize,
    hashChecksum,
    penjelasan: data.penjelasan ?? "",
    metadataJson: data.metadataJson ?? "",
    status: (data.status as StatusFile) ?? undefined,
  };

  return prisma.asset.create({ data: cleanedData });
};

// ✅ Create new asset from URL (for VIDEO and MODEL_3D)
export const createAssetFromUrl = async (data: CreateAssetInput & { url: string }) => {
  // Ensure required fields are always strings (not undefined)
  const cleanedData = {
    ...data,
    penjelasan: data.penjelasan ?? "",
    fileSize: data.fileSize ?? "",
    hashChecksum: data.hashChecksum ?? "",
    metadataJson: data.metadataJson ?? "",
    status: (data.status as StatusFile) ?? undefined,
  };

  return prisma.asset.create({ data: cleanedData });
};

// ✅ Bulk upload assets
export const bulkUploadAssets = async (assets: Omit<CreateAssetInput, 'url' | 'fileSize' | 'hashChecksum'>[], files: Express.Multer.File[]) => {
  const uploadPromises = assets.map(async (asset, index) => {
    const file = files[index];
    if (!file) throw new Error(`File missing for asset ${index}`);

    // Upload to Vercel Blob
    const blob = await put(file.originalname, file.buffer, {
      access: 'public',
    });

    // Compute file size and hash
    const fileSize = file.size.toString();
    const hashChecksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    return {
      ...asset,
      url: blob.url,
      fileSize,
      hashChecksum,
      penjelasan: asset.penjelasan ?? "",
      metadataJson: asset.metadataJson ?? "",
      status: (asset.status as StatusFile) ?? undefined,
    };
  });

  const cleanedAssets = await Promise.all(uploadPromises);
  return prisma.asset.createMany({
    data: cleanedAssets,
    skipDuplicates: true,
  });
};

// ✅ Get all assets (with optional filter & pagination)
// export const getAllAssets = async (type?: string, page?: number, limit?: number) => {
//   const skip = page && limit ? (page - 1) * limit : undefined;
//   const take = limit || undefined;

//   return prisma.asset.findMany({
//     where: type ? { tipe: type as any } : undefined,
//     skip,
//     take,
//     orderBy: { assetId: 'desc' },
//   });
// };
export const getAllAssetsPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [assets, totalCount] = await Promise.all([
    prisma.asset.findMany({
      skip,
      take: limit,
      orderBy: {
        assetId: 'asc',
      },
    }),
    prisma.asset.count(),
  ]);

  return {
    data: assets,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};


// ✅ Get asset by ID
export const getAssetById = async (id: number) => {
  return prisma.asset.findUnique({ where: { assetId: id } });
};

// ✅ Update asset
export const updateAsset = async (id: number, data: UpdateAssetInput) => {
  return prisma.asset.update({
    where: { assetId: id },
    data,
  });
};

// ✅ Delete asset
export const deleteAsset = async (id: number) => {
  return prisma.asset.delete({ where: { assetId: id } });
};

// // ✅ Get public asset file (only if status = 'published') SCHEMA BELUM ADA STATUS PUBLIC APA BELUM
// export const getPublicAssetFile = async (id: number) => {
//   return prisma.asset.findFirst({
//     where: {
//       assetId: id,
//       status: 'published',
//     },
//   });
// };

// Search assets by keyword
export const searchAssets = async (query: string) => {
  const validTypes: AssetType[] = ['FOTO', 'AUDIO', 'VIDEO', 'MODEL_3D'];
  const validStatuses: StatusFile[] = ['ACTIVE', 'PROCESSING', 'ARCHIVED', 'CORRUPTED'];

  const whereConditions: any[] = [
    { namaFile: { contains: query, mode: 'insensitive' } },
    { penjelasan: { contains: query, mode: 'insensitive' } },
  ];

  if (validTypes.includes(query as AssetType)) {
    whereConditions.push({ tipe: { equals: query as AssetType } });
  }

  if (validStatuses.includes(query as StatusFile)) {
    whereConditions.push({ status: { equals: query as StatusFile } });
  }

  return prisma.asset.findMany({
    where: {
      OR: whereConditions,
    },
  });
};

