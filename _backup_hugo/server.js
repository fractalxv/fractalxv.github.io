const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// CONFIG
const ADMIN_PASSWORD = 'myra'; // Hardcoded simple password

// Middleware
app.use(express.static('.')); // Serve static files
app.use(express.json());

// Auth Middleware
const requireAuth = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (auth === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

// Storage Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './images';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Sanitize and ensure uniqueness
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'drawing-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/api/check-auth', requireAuth, (req, res) => {
    res.json({ success: true });
});

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const newImage = {
        id: Date.now(),
        src: `../images/${req.file.filename}`,
        caption: req.body.caption || "Untitled",
        date: new Date().toISOString().split('T')[0]
    };

    // Update data.json
    const dbPath = './drawings/data.json';

    fs.readFile(dbPath, 'utf8', (err, data) => {
        let db = [];
        if (!err && data) {
            try { db = JSON.parse(data); } catch (e) { }
        }

        db.push(newImage);

        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json({ success: true, image: newImage });
        });
    });
});

// Blog Post Route
app.post('/api/blog', requireAuth, (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Missing title or content' });
    }

    const newPost = {
        id: Date.now().toString(), // Simple ID
        title: title,
        date: new Date().toISOString().replace('T', ' ').split('.')[0], // YYYY-MM-DD HH:MM:SS
        content: content
    };

    const dbPath = './blog/posts.json';
    fs.readFile(dbPath, 'utf8', (err, data) => {
        let db = [];
        if (!err && data) {
            try { db = JSON.parse(data); } catch (e) { }
        }

        db.push(newPost);

        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json({ success: true, post: newPost });
        });
    });
});

// Admin Route redirect
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel at http://localhost:${PORT}/admin`);
    console.log(`Password is: ${ADMIN_PASSWORD}`);
});
