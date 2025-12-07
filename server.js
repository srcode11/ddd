const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد MIME types يدوياً
app.use((req, res, next) => {
    const ext = path.extname(req.path);
    
    // تعيين أنواع MIME الصحيحة
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.ogg': 'audio/ogg',
        '.json': 'application/json'
    };
    
    if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
    }
    next();
});

// خدمة الملفات الثابتة
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath);
        if (ext === '.css') {
            res.setHeader('Content-Type', 'text/css');
        } else if (ext === '.js') {
            res.setHeader('Content-Type', 'text/javascript');
        } else if (ext === '.ogg') {
            res.setHeader('Content-Type', 'audio/ogg');
        }
    }
}));

// جميع المسارات ترجع index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تحقق من الملفات عند البدء
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على: http://localhost:${PORT}`);
    
    // قائمة الملفات المطلوبة
    const requiredFiles = [
        { name: 'index.html', type: 'HTML' },
        { name: 'style.css', type: 'CSS' },
        { name: 'o.js', type: 'JavaScript' },
        { name: 'o.ogg', type: 'Audio' }
    ];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file.name);
        const exists = fs.existsSync(filePath);
        console.log(`${file.type} (${file.name}): ${exists ? '✅ موجود' : '❌ مفقود'}`);
    });
});
