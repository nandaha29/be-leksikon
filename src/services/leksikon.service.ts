import { prisma } from '@/lib/prisma.js';
import { CreateLeksikonInput, UpdateLeksikonInput } from '@/lib/validators.js';
import { Prisma } from '@prisma/client';

export const getAllLeksikons = async () => {
  return prisma.leksikon.findMany({
    include: {
      domainKodifikasi: true,
      contributor: true,
      leksikonAssets: { include: { asset: true } },
      leksikonReferensis: { include: { referensi: true } },
    },
  });
};

export const getLeksikonById = async (id: number) => {
  return prisma.leksikon.findUnique({
    where: { leksikonId: id },
    include: {
      domainKodifikasi: true,
      contributor: true,
      leksikonAssets: { include: { asset: true } },
      leksikonReferensis: { include: { referensi: true } },
    },
  });
};

export const createLeksikon = async (data: CreateLeksikonInput) => {
  // verify domain exists
  const domain = await prisma.domainKodifikasi.findUnique({
    where: { domainKodifikasiId: data.domainKodifikasiId },
  });
  if (!domain) {
    const err = new Error('Domain not found');
    (err as any).code = 'DOMAIN_NOT_FOUND';
    throw err;
  }

  // verify contributor exists
  const contributor = await prisma.contributor.findUnique({
    where: { contributorId: data.contributorId },
  });
  if (!contributor) {
    const err = new Error('Contributor not found');
    (err as any).code = 'CONTRIBUTOR_NOT_FOUND';
    throw err;
  }

  try {
    const created = await prisma.leksikon.create({
      data: {
        kataLeksikon: data.kataLeksikon,
        ipa: data.ipa ?? null,
        transliterasi: data.transliterasi ?? null,
        maknaEtimologi: data.maknaEtimologi ?? null,
        maknaKultural: data.maknaKultural ?? null,
        commonMeaning: data.commonMeaning ?? null,
        translation: data.translation ?? null,
        varian: data.varian ?? null,
        translationVarians: data.translationVarians ?? null,
        deskripsiLain: data.deskripsiLain ?? null,
        domainKodifikasiId: data.domainKodifikasiId,
        statusPreservasi: data.statusPreservasi ?? undefined,
        contributorId: data.contributorId,
        status: data.status ?? undefined,
      },
      include: {
        domainKodifikasi: true,
        contributor: true,
        leksikonAssets: { include: { asset: true } },
        leksikonReferensis: { include: { referensi: true } },
      },
    });
    return created;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // handle known Prisma errors if you add unique constraints later
    }
    throw error;
  }
};

export const updateLeksikon = async (id: number, data: UpdateLeksikonInput) => {
  // check relation updates
  if (data.domainKodifikasiId !== undefined) {
    const domain = await prisma.domainKodifikasi.findUnique({
      where: { domainKodifikasiId: data.domainKodifikasiId },
    });
    if (!domain) {
      const err = new Error('Domain not found');
      (err as any).code = 'DOMAIN_NOT_FOUND';
      throw err;
    }
  }
  if (data.contributorId !== undefined) {
    const contributor = await prisma.contributor.findUnique({
      where: { contributorId: data.contributorId },
    });
    if (!contributor) {
      const err = new Error('Contributor not found');
      (err as any).code = 'CONTRIBUTOR_NOT_FOUND';
      throw err;
    }
  }

  try {
    const updated = await prisma.leksikon.update({
      where: { leksikonId: id },
      data: {
        ...(data.kataLeksikon !== undefined && { kataLeksikon: data.kataLeksikon }),
        ...(data.ipa !== undefined && { ipa: data.ipa }),
        ...(data.transliterasi !== undefined && { transliterasi: data.transliterasi }),
        ...(data.maknaEtimologi !== undefined && { maknaEtimologi: data.maknaEtimologi }),
        ...(data.maknaKultural !== undefined && { maknaKultural: data.maknaKultural }),
        ...(data.commonMeaning !== undefined && { commonMeaning: data.commonMeaning }),
        ...(data.translation !== undefined && { translation: data.translation }),
        ...(data.varian !== undefined && { varian: data.varian }),
        ...(data.translationVarians !== undefined && { translationVarians: data.translationVarians }),
        ...(data.deskripsiLain !== undefined && { deskripsiLain: data.deskripsiLain }),
        ...(data.domainKodifikasiId !== undefined && { domainKodifikasiId: data.domainKodifikasiId }),
        ...(data.statusPreservasi !== undefined && { statusPreservasi: data.statusPreservasi }),
        ...(data.contributorId !== undefined && { contributorId: data.contributorId }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        domainKodifikasi: true,
        contributor: true,
        leksikonAssets: { include: { asset: true } },
        leksikonReferensis: { include: { referensi: true } },
      },
    });
    return updated;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: record to update not found
      if (error.code === 'P2025') {
        throw error; // bubble to controller to map to 404
      }
    }
    throw error;
  }
};

export const deleteLeksikon = async (id: number) => {
  return prisma.leksikon.delete({
    where: { leksikonId: id },
  });
};

// export const addAssetToLeksikon = async (leksikonId: number, assetId: number, assetRole: string) => {
//   // verify leksikon exists
//   const leksikon = await prisma.leksikon.findUnique({
//     where: { leksikonId },
//   });
//   if (!leksikon) {
//     const err = new Error('Leksikon not found');
//     (err as any).code = 'LEKSIKON_NOT_FOUND';
//     throw err;
//   }

//   // verify asset exists
//   const asset = await prisma.asset.findUnique({
//     where: { assetId },
//   });
//   if (!asset) {
//     const err = new Error('Asset not found');
//     (err as any).code = 'ASSET_NOT_FOUND';
//     throw err;
//   }

//   return prisma.leksikonAsset.create({
//     data: { leksikonId, assetId, assetRole },
//     include: { asset: true },
//   });
// };

export const addAssetToLeksikon = async (leksikonId: number, assetId: number, assetRole: string) => {
  // Pastikan leksikon dan asset ada
  const leksikon = await prisma.leksikon.findUnique({ where: { leksikonId } });
  if (!leksikon) throw { code: 'LEKSIKON_NOT_FOUND' };

  const asset = await prisma.asset.findUnique({ where: { assetId } });
  if (!asset) throw { code: 'ASSET_NOT_FOUND' };

  // Gunakan upsert agar tidak duplikat dan tidak menimbulkan rekursi
  return prisma.leksikonAsset.upsert({
    where: {
      leksikonId_assetId: {
        leksikonId,
        assetId,
      },
    },
    update: {
      assetRole,
    },
    create: {
      leksikonId,
      assetId,
      assetRole,
    },
  });
};


export const removeAssetFromLeksikon = async (leksikonId: number, assetId: number) => {
  return prisma.leksikonAsset.delete({
    where: { leksikonId_assetId: { leksikonId, assetId } },
  });
};

export const getLeksikonAssets = async (id: number) => {
  return prisma.leksikonAsset.findMany({
    where: { leksikonId: id },
    include: { asset: true },
  });
};

// export const addReferenceToLeksikon = async (leksikonId: number, referensiId: number, citationNote?: string) => {
//   // verify leksikon exists
//   const leksikon = await prisma.leksikon.findUnique({
//     where: { leksikonId },
//   });
//   if (!leksikon) {
//     const err = new Error('Leksikon not found');
//     (err as any).code = 'LEKSIKON_NOT_FOUND';
//     throw err;
//   }

//   // verify referensi exists
//   const referensi = await prisma.referensi.findUnique({
//     where: { referensiId },
//   });
//   if (!referensi) {
//     const err = new Error('Referensi not found');
//     (err as any).code = 'REFERENSI_NOT_FOUND';
//     throw err;
//   }

//   return prisma.leksikonReferensi.create({
//     data: { leksikonId, referensiId, citationNote },
//     include: { referensi: true },
//   });
// };

export const addReferenceToLeksikon = async  (leksikonId: number, referensiId: number, citationNote?: string) => {
  const leksikon = await prisma.leksikon.findUnique({ where: { leksikonId } });
  if (!leksikon) throw { code: 'LEKSIKON_NOT_FOUND' };

  const referensi = await prisma.referensi.findUnique({ where: { referensiId } });
  if (!referensi) throw { code: 'REFERENSI_NOT_FOUND' };

  // Gunakan upsert agar tidak duplikat
  return prisma.leksikonReferensi.upsert({
    where: {
      leksikonId_referensiId: {
        leksikonId,
        referensiId,
      },
    },
    update: {
      citationNote,
    },
    create: {
      leksikonId,
      referensiId,
      citationNote,
    },
  });
};


export const removeReferenceFromLeksikon = async (leksikonId: number, referensiId: number) => {
  return prisma.leksikonReferensi.delete({
    where: { leksikonId_referensiId: { leksikonId, referensiId } },
  });
};

export const getLeksikonReferences = async (id: number) => {
  return prisma.leksikonReferensi.findMany({
    where: { leksikonId: id },
    include: { referensi: true },
  });
};

// UPDATE assetRole di relasi leksikonAsset
export const updateAssetRole = async (
  leksikonId: number,
  assetId: number,
  assetRole: string
) => {
  // Pastikan relasi ada
  const existing = await prisma.leksikonAsset.findUnique({
    where: { leksikonId_assetId: { leksikonId, assetId } },
  });

  if (!existing) throw { code: 'ASSOCIATION_NOT_FOUND' };

  return prisma.leksikonAsset.update({
    where: { leksikonId_assetId: { leksikonId, assetId } },
    data: { assetRole },
    include: { asset: true },
  });
};

// UPDATE citationNote di relasi leksikonReferensi
export const updateCitationNote = async (
  leksikonId: number,
  referensiId: number,
  citationNote?: string
) => {
  const existing = await prisma.leksikonReferensi.findUnique({
    where: { leksikonId_referensiId: { leksikonId, referensiId } },
  });

  if (!existing) throw { code: 'ASSOCIATION_NOT_FOUND' };

  return prisma.leksikonReferensi.update({
    where: { leksikonId_referensiId: { leksikonId, referensiId } },
    data: { citationNote },
    include: { referensi: true },
  });
};

export const getAllLeksikonsPaginated = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.leksikon.findMany({
      skip,
      take: limit,
      include: {
        domainKodifikasi: true,
        contributor: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.leksikon.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getLeksikonsByDomain = async (domainKodifikasiId: number) => {
  return prisma.leksikon.findMany({
    where: { domainKodifikasiId },
    include: {
      contributor: true,
    },
  });
};

export const getLeksikonsByStatus = async (status?: string) => {
  // If no status provided, return all leksikons
  if (!status) {
    return prisma.leksikon.findMany({
      include: {
        domainKodifikasi: true,
        contributor: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Normalize and validate status (handle lowercase query params)
  const normalized = String(status).toUpperCase();
  const allowed = ["DRAFT", "PUBLISHED", "ARCHIVED"];
  if (!allowed.includes(normalized)) {
    // Return empty array for unknown status to be forgiving for clients
    return [];
  }

  return prisma.leksikon.findMany({
    where: { status: normalized as any },
    include: {
      domainKodifikasi: true,
      contributor: true,
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const updateLeksikonStatus = async (id: number, status: string) => {
  const normalized = String(status).toUpperCase();
  const allowed = ["DRAFT", "PUBLISHED", "ARCHIVED"];
  if (!allowed.includes(normalized)) {
    throw new Error(`Invalid status: ${status}`);
  }

  return prisma.leksikon.update({
    where: { leksikonId: id },
    data: { status: normalized as any },
  });
};