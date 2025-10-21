import { z } from "zod";

/* =======================
   🏛️ CULTURE
======================= */
export const createCultureSchema = z.object({
  namaBudaya: z.string().min(1, { message: "Nama budaya is required" }),
  pulauAsal: z.string().min(1, { message: "Pulau asal is required" }),
  provinsi: z.string().min(1, { message: "Provinsi is required" }),
  kotaDaerah: z.string().min(1, { message: "Kota/Daerah is required" }),
  klasifikasi: z.string().optional(),
  karakteristik: z.string().optional(),
  statusKonservasi: z
    .enum(["MAINTAINED", "TREATENED", "CRITICAL", "ARCHIVED"])
    .default("ARCHIVED")
    .optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .default("DRAFT")
    .optional(),
});
export const updateCultureSchema = createCultureSchema.partial();
export type CreateCultureInput = z.infer<typeof createCultureSchema>;
export type UpdateCultureInput = z.infer<typeof updateCultureSchema>;

/* =======================
   🧩 SUBCULTURE
======================= */
export const createSubcultureSchema = z.object({
  namaSubculture: z.string().min(1, { message: "Nama subkultur is required" }),
  penjelasan: z.string().min(1, { message: "Penjelasan is required" }),
  cultureId: z.number().min(1, { message: "Culture ID is required" }),
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .default("DRAFT")
    .optional(),
  statusKonservasi: z
    .enum(["MAINTAINED", "TREATENED", "CRITICAL", "ARCHIVED"])
    .default("TREATENED")
    .optional(),
});
export const updateSubcultureSchema = createSubcultureSchema.partial();
export type CreateSubcultureInput = z.infer<typeof createSubcultureSchema>;
export type UpdateSubcultureInput = z.infer<typeof updateSubcultureSchema>;

/* =======================
   🧠 DOMAIN KODIFIKASI
======================= */
export const createDomainKodifikasiSchema = z.object({
  kode: z.string().min(1, { message: "Kode is required" }),
  namaDomain: z.string().min(1, { message: "Nama domain is required" }),
  penjelasan: z.string().min(1, { message: "Penjelasan is required" }),
  subcultureId: z.number().min(1, { message: "Subculture ID is required" }),
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .default("DRAFT")
    .optional(),
});

export const updateDomainKodifikasiSchema = createDomainKodifikasiSchema.partial();
export type CreateDomainKodifikasiInput = z.infer<typeof createDomainKodifikasiSchema>;
export type UpdateDomainKodifikasiInput = z.infer<typeof updateDomainKodifikasiSchema>;

/* =======================
   📖 LEKSIKON
======================= */
export const createLeksikonSchema = z.object({
  kataLeksikon: z.string().min(1, { message: "Kata leksikon is required" }),
  ipa: z.string().min(1, { message: "IPA is required" }),
  transliterasi: z.string().min(1, { message: "Transliterasi is required" }),
  maknaEtimologi: z.string().min(1, { message: "Makna etimologi is required" }),
  maknaKultural: z.string().min(1, { message: "Makna kultural is required" }),
  commonMeaning: z.string().min(1, { message: "Common meaning is required" }),
  translation: z.string().min(1, { message: "Translation is required" }),
  varian: z.string().optional(),
  translationVarians: z.string().optional(),
  deskripsiLain: z.string().optional(),
  domainKodifikasiId: z.number().min(1, { message: "Domain Kodifikasi ID is required" }),
  contributorId: z.number().min(1, { message: "Contributor ID is required" }),
  statusPreservasi: z
    .enum(["MAINTAINED", "TREATENED", "CRITICAL", "ARCHIVED"])
    .default("ARCHIVED")
    .optional(),
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .default("DRAFT")
    .optional(),
});
export const updateLeksikonSchema = createLeksikonSchema.partial();
export type CreateLeksikonInput = z.infer<typeof createLeksikonSchema>;
export type UpdateLeksikonInput = z.infer<typeof updateLeksikonSchema>;

/* =======================
   📚 REFERENSI
======================= */
export const createReferensiSchema = z.object({
  judul: z.string().min(1, { message: "Judul is required" }),
  tipeReferensi: z.enum(["JURNAL", "BUKU", "ARTIKEL", "WEBSITE", "LAPORAN"], {
    message: "Tipe referensi must be one of: JURNAL, BUKU, ARTIKEL, WEBSITE, LAPORAN",
  }),
  penjelasan: z.string().optional(),
  url: z.string().url({ message: "Invalid URL" }).optional(),
  penulis: z.string().optional(),
  tahunTerbit: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT").optional(),
});
export const updateReferensiSchema = createReferensiSchema.partial();
export type CreateReferensiInput = z.infer<typeof createReferensiSchema>;
export type UpdateReferensiInput = z.infer<typeof updateReferensiSchema>;

/* =======================
   👤 CONTRIBUTOR
======================= */
export const createContributorSchema = z.object({
  namaContributor: z.string().min(1, { message: "Nama contributor is required" }),
  institusi: z.string().min(1, { message: "Institusi is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  expertiseArea: z.string().min(1, { message: "Expertise area is required" }),
  contactInfo: z.string().min(1, { message: "Contact info is required" }),
});
export const updateContributorSchema = createContributorSchema.partial();
export type CreateContributorInput = z.infer<typeof createContributorSchema>;
export type UpdateContributorInput = z.infer<typeof updateContributorSchema>;

/* =======================
   🖼️ ASSETS
======================= */
export const createAssetSchema = z.object({
  namaFile: z.string().min(1, { message: "Nama file is required" }),
  tipe: z.enum(["FOTO", "AUDIO", "VIDEO", "MODEL_3D"], {
    message: "Tipe file must be one of: FOTO, AUDIO, VIDEO, MODEL_3D",
  }),
  penjelasan: z.string().optional(),
  url: z.string().optional(),
  fileSize: z.string().optional(),
  hashChecksum: z.string().optional(),
  metadataJson: z.string().optional(),
  status: z
    .enum(["ACTIVE", "PROCESSING", "ARCHIVED", "CORRUPTED"])
    .default("ARCHIVED")
    .optional(),
}).refine((data) => {
  if (['VIDEO', 'MODEL_3D'].includes(data.tipe)) {
    return data.url !== undefined;
  }
  return true;
}, { message: "URL is required for VIDEO and MODEL_3D types" });
export const updateAssetSchema = createAssetSchema.partial();
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

/* =======================
   🔗 RELATIONS
======================= */
export const createLeksikonAssetSchema = z.object({
  leksikonId: z.number().min(1, { message: "Leksikon ID is required" }),
  assetId: z.number().min(1, { message: "Asset ID is required" }),
  assetRole: z.string().min(1, { message: "Asset role is required" }),
});
export const createSubcultureAssetSchema = z.object({
  subcultureId: z.number().min(1, { message: "Subculture ID is required" }),
  assetId: z.number().min(1, { message: "Asset ID is required" }),
  assetRole: z.string().min(1, { message: "Asset role is required" }),
});
export const createLeksikonReferensiSchema = z.object({
  leksikonId: z.number().min(1, { message: "Leksikon ID is required" }),
  referensiId: z.number().min(1, { message: "Referensi ID is required" }),
  citationNote: z.string().optional(),
});

export type CreateLeksikonAssetInput = z.infer<typeof createLeksikonAssetSchema>;
export type CreateSubcultureAssetInput = z.infer<typeof createSubcultureAssetSchema>;
export type CreateLeksikonReferensiInput = z.infer<typeof createLeksikonReferensiSchema>;


