const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// خدمة جميع الملفات الثابتة
app.use(express.static(__dirname));

// جميع المسارات ترجع index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`🚀 نظام السلامة يعمل على: http://localhost:${PORT}`);
    console.log(`📁 المسار: ${__dirname}`);
});
