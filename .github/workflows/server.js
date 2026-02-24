const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const hotelMapRegistry = require('./js/data/pdf-map.js');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

app.use(compression());
app.use(express.json());
app.use(express.static(ROOT, { extensions: ['html'] }));

app.get('/api/plan/:room', (req, res) => {
  const room = String(req.params.room || '').trim();
  const data = hotelMapRegistry[room];

  if (!data) {
    return res.status(404).json({ error: 'Plan not found', room });
  }

  const filePath = path.join(ROOT, 'pdf', data.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'PDF file missing', file: data.file, room });
  }

  return res.json({
    room,
    file: data.file,
    page: data.page,
    url: `/pdf/${data.file}#page=${data.page}`
  });
});

app.get('/api/floor/:floor', (req, res) => {
  const floor = String(req.params.floor || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const file = floor.endsWith('.svg') ? floor : `${floor}.svg`;
  const svgPath = path.join(ROOT, 'svg', file);

  if (!fs.existsSync(svgPath)) {
    return res.status(404).json({ error: 'SVG not found', floor });
  }

  res.type('image/svg+xml');
  fs.createReadStream(svgPath).pipe(res);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT, 'digital-concierge-reichshof.html'));
});

app.listen(PORT, () => {
  console.log(`Reichshof backend running on http://localhost:${PORT}`);
});
