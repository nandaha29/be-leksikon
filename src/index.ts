import express from 'express';
import { PrismaClient } from '@prisma/client';
import { put, list, del } from '@vercel/blob';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// CRUD operations for User
app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.create({
            data: { name, email }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Upload profile image with Vercel Blob
app.post('/users/:id/image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const userId = parseInt(id);

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Upload to Vercel Blob
        const blob = await put(`user-${userId}-${Date.now()}${path.extname(req.file.originalname)}`,
            req.file.buffer, {
            access: 'public',
        });

        // Update user with image URL
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { imageUrl: blob.url }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// List all blobs
app.get('/blobs', async (req, res) => {
    try {
        const blobs = await list();
        res.json(blobs);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete a blob
app.delete('/blobs/:blobUrl', async (req, res) => {
    try {
        const { blobUrl } = req.params;
        await del(decodeURIComponent(blobUrl));
        res.status(200).json({ message: 'Blob deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});