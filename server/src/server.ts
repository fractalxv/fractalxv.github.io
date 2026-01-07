import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Uploads
import multer from 'multer';

// Serve images from local uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/images', express.static(uploadsDir));

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Simple unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'drawing-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Update drawings.json
    try {
        const currentData = JSON.parse(fs.readFileSync(drawingsPath, 'utf-8'));
        const newEntry = {
            id: Date.now(),
            src: req.file.filename, // served at /images/filename
            caption: req.body.caption || '',
            date: new Date().toISOString().split('T')[0]
        };
        currentData.push(newEntry);
        fs.writeFileSync(drawingsPath, JSON.stringify(currentData, null, 2));

        res.json(newEntry);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.post('/api/blog', (req: Request, res: Response) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Missing title or content' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${slug}.md`;
    const filePath = path.join(blogDir, filename);

    const fileContent = `---
title: "${title}"
date: "${new Date().toISOString()}"
---

${content}
`;

    try {
        fs.writeFileSync(filePath, fileContent);
        res.json({ success: true, slug });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to write post' });
    }
});

// Update Blog Post
app.put('/api/blog/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Missing title or content' });
    }

    const filePath = path.join(blogDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Post not found' });
    }

    // Read old content to preserve date (or we could update 'lastmod')
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(raw);

        const fileContent = `---
title: "${title}"
date: "${data.date}"
lastmod: "${new Date().toISOString()}"
---

${content}
`;
        fs.writeFileSync(filePath, fileContent);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete Blog Post
app.delete('/api/blog/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const filePath = path.join(blogDir, `${slug}.md`);

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            res.json({ success: true });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to delete post' });
        }
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
});

// -----------------------------------
// DRAWINGS CRUD
// -----------------------------------

// Update Drawing Caption
app.put('/api/drawings/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { caption } = req.body;

    // Allow empty caption if user wants to clear it, but generally we expect a string
    if (caption === undefined) return res.status(400).json({ error: 'Missing caption' });

    try {
        const drawingsDict = JSON.parse(fs.readFileSync(drawingsPath, 'utf-8'));
        // ID is number in JSON, string in params. using == handles type coercion
        const index = drawingsDict.findIndex((d: any) => d.id == id);

        if (index !== -1) {
            drawingsDict[index].caption = caption;
            fs.writeFileSync(drawingsPath, JSON.stringify(drawingsDict, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Drawing not found' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update drawing' });
    }
});

// Delete Drawing
app.delete('/api/drawings/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const drawingsDict = JSON.parse(fs.readFileSync(drawingsPath, 'utf-8'));
        const index = drawingsDict.findIndex((d: any) => d.id == id);

        if (index !== -1) {
            const drawing = drawingsDict[index];
            // Remove file
            // Handle both legacy "images/..." and new direct paths
            // Our src is stored as "filename.ext" or "images/filename.ext"
            // uploadsDir is absolute path

            const filename = drawing.src.replace(/^images\//, '');
            // construct path
            const filePath = path.join(uploadsDir, filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            } else {
                // Try checks if it was just stored differently
                console.warn('File not found to delete:', filePath);
            }

            // Remove from JSON
            drawingsDict.splice(index, 1);
            fs.writeFileSync(drawingsPath, JSON.stringify(drawingsDict, null, 2));

            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Drawing not found' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete drawing' });
    }
});

// Data
import fs from 'fs';

const drawingsPath = path.join(__dirname, '../../_backup_hugo/data/drawings.json');

app.get('/api/drawings', (req: Request, res: Response) => {
    try {
        const data = fs.readFileSync(drawingsPath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Blog Data
import matter from 'gray-matter';

const blogDir = path.join(__dirname, '../../_backup_hugo/content/blog');

app.get('/api/blog', (req: Request, res: Response) => {
    try {
        // Read all files in the blog directory
        const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));

        const posts = files.map(file => {
            const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
            const { data, content } = matter(raw);
            return {
                title: data.title,
                date: data.date,
                slug: file.replace('.md', ''),
                content // We send content too if needed later
            };
        });

        // Sort by date desc
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(posts);
    } catch (e) {
        console.error(e);
        res.json([]); // Return empty if failed or path wrong
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
