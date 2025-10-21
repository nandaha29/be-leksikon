

import { prisma } from '@/lib/prisma.js';
import {
  CreateDomainKodifikasiInput,
  UpdateDomainKodifikasiInput,
} from '@/lib/validators.js';
import { Prisma } from '@prisma/client';

export const getAllDomainKodifikasi = async () => {
  return prisma.domainKodifikasi.findMany();
};

export const getDomainKodifikasiById = async (id: number) => {
  return prisma.domainKodifikasi.findUnique({
    where: { domainKodifikasiId: id },
  });
};

export const createDomainKodifikasi = async (data: CreateDomainKodifikasiInput) => {
  // Verify referenced Subculture exists
  const subculture = await prisma.subculture.findUnique({
    where: { subcultureId: data.subcultureId },
  });
  if (!subculture) {
    const err = new Error('Subculture not found');
    (err as any).code = 'SUBCULTURE_NOT_FOUND';
    throw err;
  }

  try {
    const created = await prisma.domainKodifikasi.create({
      data,
    });
    return created;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const err = new Error('Unique constraint failed on the fields: kode');
      (err as any).code = 'KODE_DUPLICATE';
      throw err;
    }
    throw error;
  }
};

export const updateDomainKodifikasi = async (id: number, data: UpdateDomainKodifikasiInput) => {
  // If subcultureId is being updated, verify it exists
  if (data.subcultureId) {
    const subculture = await prisma.subculture.findUnique({
      where: { subcultureId: data.subcultureId },
    });
    if (!subculture) {
      const err = new Error('Subculture not found');
      (err as any).code = 'SUBCULTURE_NOT_FOUND';
      throw err;
    }
  }

  try {
    // Using prisma.update; Prisma will throw P2025 if the record doesn't exist
    return await prisma.domainKodifikasi.update({
      where: { domainKodifikasiId: id },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint failed
      if (error.code === 'P2002') {
        const err = new Error('Unique constraint failed on the fields: kode');
        (err as any).code = 'KODE_DUPLICATE';
        throw err;
      }
      // Record to update not found => rethrow to be handled by controller
      if (error.code === 'P2025') {
        throw error;
      }
    }
    throw error;
  }
};

export const deleteDomainKodifikasi = async (id: number) => {
  return prisma.domainKodifikasi.delete({
    where: { domainKodifikasiId: id },
  });
};