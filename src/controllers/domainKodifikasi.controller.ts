import { Request, Response } from 'express';
import * as domainService from '@/services/domainKodifikasi.service.js';
import {
  createDomainKodifikasiSchema,
  updateDomainKodifikasiSchema,
} from '@/lib/validators.js';
import { ZodError } from 'zod';

// GET /api/domains
export const getDomains = async (req: Request, res: Response) => {
  try {
    const items = await domainService.getAllDomainKodifikasi();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve domains' });
  }
};

// GET /api/domains/:id
export const getDomainById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await domainService.getDomainKodifikasiById(Number(id));
    if (!item) return res.status(404).json({ message: 'Domain not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve domain' });
  }
};

// POST /api/domains
export const createDomain = async (req: Request, res: Response) => {
  try {
    const validated = createDomainKodifikasiSchema.parse(req.body);
    const created = await domainService.createDomainKodifikasi(validated);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error });
    }
    if (error instanceof Error && error.message === 'Subculture not found') {
      return res.status(400).json({ message: 'Referenced subculture does not exist' });
    }
    res.status(500).json({ message: 'Failed to create domain' });
  }
};

// PUT /api/domains/:id
export const updateDomain = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = updateDomainKodifikasiSchema.parse(req.body);
    const updated = await domainService.updateDomainKodifikasi(Number(id), validated);
    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error });
    }
    if (error instanceof Error && error.message === 'Subculture not found') {
      return res.status(400).json({ message: 'Referenced subculture does not exist' });
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    res.status(500).json({ message: 'Failed to update domain' });
  }
};

// DELETE /api/domains/:id
export const deleteDomain = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await domainService.deleteDomainKodifikasi(Number(id));
    res.status(200).json({
      success: true,
      message: 'Domain deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete not found')) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    res.status(500).json({ message: 'Failed to delete domain' });
  }
};