import { prisma } from '@/lib/prisma.js';
import { CreateContributorInput, UpdateContributorInput } from '@/lib/validators.js';

// Get all contributors
export const getAllContributors = async () => {
  return prisma.contributor.findMany();
};

// Get contributor by ID
export const getContributorById = async (id: number) => {
  return prisma.contributor.findUnique({
    where: { contributorId: id },
  });
};

// Create contributor
export const createContributor = async (data: CreateContributorInput) => {
  return prisma.contributor.create({
    data: {
      ...data,
      institusi: data.institusi ?? '',
      expertiseArea: data.expertiseArea ?? '',
      contactInfo: data.contactInfo ?? '',
    },
  });
};

// Update contributor
export const updateContributor = async (id: number, data: UpdateContributorInput) => {
  return prisma.contributor.update({
   where: { contributorId: id },
    data,
  });
};

// Delete contributor
export const deleteContributor = async (id: number) => {
  return prisma.contributor.delete({
    where: { contributorId: id },
  });
};

// Search contributors by keyword
export const searchContributors = async (query: string) => {
  return prisma.contributor.findMany({
    where: {
      OR: [
        { namaContributor: { contains: query, mode: 'insensitive' } },
        { institusi: { contains: query, mode: 'insensitive' } },
        { expertiseArea: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
};

// Get all contributors with pagination
export const getAllContributorsPaginated = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [contributors, totalCount] = await Promise.all([
    prisma.contributor.findMany({
      skip,
      take: limit,
      orderBy: {
        contributorId: 'asc',
      },
    }),
    prisma.contributor.count(),
  ]);

  return {
    data: contributors,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};
