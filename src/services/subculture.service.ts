import { PrismaClient } from "@prisma/client";
import { CreateSubcultureInput, UpdateSubcultureInput } from "@/lib/validators.js";

const prisma = new PrismaClient();

export const getAllSubcultures = async () => {
  return prisma.subculture.findMany({
    include: {
      culture: true,
      domainKodifikasis: true,
      subcultureAssets: {
        include: { asset: true },
      },
    },
  });
};

export const getSubcultureById = async (id: number) => {
  return prisma.subculture.findUnique({
    where: { subcultureId: id },
    include: {
      culture: true,
      domainKodifikasis: true,
      subcultureAssets: {
        include: { asset: true },
      },
    },
  });
};

export const createSubculture = async (data: CreateSubcultureInput) => {
  return prisma.subculture.create({ data });
};

export const updateSubculture = async (id: number, data: UpdateSubcultureInput) => {
  return prisma.subculture.update({
    where: { subcultureId: id },
    data,
  });
};

export const deleteSubculture = async (id: number) => {
  return prisma.subculture.delete({
    where: { subcultureId: id },
  });
};

export const addAssetToSubculture = async (subcultureId: number, assetId: number, assetRole: string) => {
  // verify subculture exists
  const subculture = await prisma.subculture.findUnique({
    where: { subcultureId },
  });
  if (!subculture) {
    const err = new Error('Subculture not found');
    (err as any).code = 'SUBCULTURE_NOT_FOUND';
    throw err;
  }

  // verify asset exists
  const asset = await prisma.asset.findUnique({
    where: { assetId },
  });
  if (!asset) {
    const err = new Error('Asset not found');
    (err as any).code = 'ASSET_NOT_FOUND';
    throw err;
  }

  return prisma.subcultureAsset.create({
    data: { subcultureId, assetId, assetRole },
    include: { asset: true },
  });
};

export const removeAssetFromSubculture = async (subcultureId: number, assetId: number) => {
  return prisma.subcultureAsset.delete({
    where: { subcultureId_assetId: { subcultureId, assetId } },
  });
};

export const getSubcultureAssets = async (id: number) => {
  return prisma.subcultureAsset.findMany({
    where: { subcultureId: id },
    include: { asset: true },
  });
};
