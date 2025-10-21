import { prisma } from '@/lib/prisma.js';
import { CreateCultureInput, UpdateCultureInput } from '@/lib/validators.js';

export const getAllCultures = async (page: number, limit: number) => {
  return prisma.culture.findMany();
};

// New function to get a single culture by ID
export const getCultureById = async (id: number) => {
  return prisma.culture.findUnique({
   where: { cultureId: id },
  });
};

export const createCulture = async (data: CreateCultureInput) => {
  return prisma.culture.create({
    data: {
      ...data,
      karakteristik: data.karakteristik ?? '', 
      klasifikasi: data.klasifikasi ?? '', 
      ...(data.statusKonservasi !== undefined ? { statusKonservasi: data.statusKonservasi } : {}),
    },
  });
};

// New function to update a culture
export const updateCulture = async (id: number, data: UpdateCultureInput) => {
  return prisma.culture.update({
  where: { cultureId: id },
    data,
  });
};

// New function to delete a culture
export const deleteCulture = async (id: number) => {
  return prisma.culture.delete({
    where: { cultureId: id },
  });
};

// Get all cultures with pagination
export const getAllCulturesPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [cultures, totalCount] = await Promise.all([
    prisma.culture.findMany({
      skip,
      take: limit,
      orderBy: {
        cultureId: 'asc',
      },
    }),
    prisma.culture.count(),
  ]);

  return {
    data: cultures,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};

   