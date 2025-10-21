import { prisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";

import { CreateReferensiInput, UpdateReferensiInput } from '@/lib/validators.js';

export const getAllReferences = async () => {
  return prisma.referensi.findMany();
};

export const getReferenceById = async (id: number) => {
  return prisma.referensi.findUnique({
    where: { referensiId: id },
  });
};

export const createReference = async (data: CreateReferensiInput) => {
  return prisma.referensi.create({
    data: {
      ...data,
      penjelasan: data.penjelasan ?? "",
      url: data.url ?? "",
      penulis: data.penulis ?? "",
      tahunTerbit: data.tahunTerbit ?? "",
    },
  });
};

export const updateReference = async (id: number, data: UpdateReferensiInput) => {
  return prisma.referensi.update({
    where: { referensiId: id },
    data,
  });
};

export const deleteReference = async (id: number) => {
  return prisma.referensi.delete({
    where: { referensiId: id },
  });
};

// ✅ Get all referensi (with pagination + filter)
export const getAllReferensiPaginated = async (page = 1, limit = 10, type?: string) => {
  const skip = (page - 1) * limit;

  const [referensi, totalCount] = await Promise.all([
    prisma.referensi.findMany({
      skip,
      take: limit,
      orderBy: {
        referensiId: 'asc',
      },
    }),
    prisma.referensi.count(),
  ]);

  return {
    data: referensi,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};

// ✅ Get public references (status = published) BELUM UPDATE SCHEMA
// export const getPublicReferensi = async () => {
//   return prisma.referensi.findMany({
//     where: { status: 'published' },
//     orderBy: { createdAt: 'desc' },
//   });
// };

// ✅ Search references
export const searchReferensi = async (keyword: string) => {
  const enumValues = ['JURNAL', 'BUKU', 'ARTIKEL', 'WEBSITE', 'LAPORAN'];
  const isEnumMatch = enumValues.includes(keyword.toUpperCase());

  const whereClause: any = {
    OR: [
      { judul: { contains: keyword, mode: 'insensitive' } },
      { penjelasan: { contains: keyword, mode: 'insensitive' } },
      { penulis: { contains: keyword, mode: 'insensitive' } },
      { tahunTerbit: { contains: keyword, mode: 'insensitive' } },
    ],
  };

  if (isEnumMatch) {
    whereClause.OR.push({ tipeReferensi: { equals: keyword.toUpperCase() as any } });
  }

  return prisma.referensi.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });
};
