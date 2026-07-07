const express = require('express');
const db = require('./db');
const path = require('path');
const multer = require('multer');
const supabaseServer = require('./supabaseServer');
const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.get('/health', (req, res) => res.json({status: 'ok'}));

/* Brands */
app.get('/brands', async (req, res) => {
  const r = await db.query('SELECT * FROM brands ORDER BY name');
  res.json(r.rows);
});
app.post('/brands', async (req, res) => {
  const { name } = req.body;
  const r = await db.query('INSERT INTO brands(name) VALUES($1) RETURNING *', [name]);
  res.status(201).json(r.rows[0]);
});

/* Models */
app.get('/models', async (req, res) => {
  const r = await db.query("SELECT m.*, b.name as brand_name FROM models m JOIN brands b ON m.brand_id = b.id ORDER BY b.name,m.year,m.name");
  res.json(r.rows);
});
app.post('/models', async (req, res) => {
  const { brand_id, name, year } = req.body;
  const r = await db.query('INSERT INTO models(brand_id,name,year) VALUES($1,$2,$3) RETURNING *', [brand_id, name, year]);
  res.status(201).json(r.rows[0]);
});

/* Motorcycles */
app.get('/motorcycles', async (req, res) => {
  const r = await db.query('SELECT * FROM motorcycles');
  res.json(r.rows);
});
app.post('/motorcycles', async (req, res) => {
  const { model_id, trim, engine } = req.body;
  const r = await db.query('INSERT INTO motorcycles(model_id,trim,engine) VALUES($1,$2,$3) RETURNING *', [model_id, trim, engine]);
  res.status(201).json(r.rows[0]);
});

/* Parts: list, search (FTS), pagination */
app.get('/parts', async (req, res) => {
  const q = req.query.q;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  if (q) {
    const r = await db.query(
      "SELECT p.*, m.name as manufacturer_name, a.name as assembly_name, ts_rank(to_tsvector('portuguese', coalesce(p.name,'')), plainto_tsquery('portuguese', $1)) as rank FROM parts p LEFT JOIN manufacturers m ON p.manufacturer_id = m.id LEFT JOIN assemblies a ON p.assembly_id = a.id WHERE to_tsvector('portuguese', coalesce(p.name,'')) @@ plainto_tsquery('portuguese', $1) ORDER BY rank DESC LIMIT $2 OFFSET $3",
      [q, limit, offset]
    );
    res.json(r.rows);
  } else {
    const r = await db.query('SELECT p.*, m.name as manufacturer_name, a.name as assembly_name FROM parts p LEFT JOIN manufacturers m ON p.manufacturer_id = m.id LEFT JOIN assemblies a ON p.assembly_id = a.id ORDER BY p.id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(r.rows);
  }
});
app.post('/parts', async (req, res) => {
  const { sku, name, manufacturer_id, assembly_id, description } = req.body;
  const r = await db.query('INSERT INTO parts(sku,name,manufacturer_id,assembly_id,description) VALUES($1,$2,$3,$4,$5) RETURNING *', [sku, name, manufacturer_id, assembly_id, description]);
  res.status(201).json(r.rows[0]);
});

/* Part detail with images, equivalents and compatibilities */
app.get('/parts/:id', async (req, res) => {
  const id = req.params.id;
  const partR = await db.query('SELECT p.*, m.name as manufacturer_name, a.name as assembly_name FROM parts p LEFT JOIN manufacturers m ON p.manufacturer_id = m.id LEFT JOIN assemblies a ON p.assembly_id = a.id WHERE p.id=$1', [id]);
  if (!partR.rows.length) return res.status(404).json({ error: 'not_found' });
  const part = partR.rows[0];
  const imagesR = await db.query('SELECT * FROM part_images WHERE part_id=$1 ORDER BY id', [id]);
  const eqR = await db.query('SELECT ep.*, p2.name as equivalent_name FROM equivalent_parts ep JOIN parts p2 ON ep.equivalent_part_id = p2.id WHERE ep.part_id=$1', [id]);
  const compR = await db.query('SELECT c.*, mo.id as motorcycle_id, mo.trim, mo.engine, mo.model_id FROM compatibilities c JOIN motorcycles mo ON c.motorcycle_id = mo.id WHERE c.part_id=$1', [id]);
  part.images = imagesR.rows;
  part.equivalents = eqR.rows;
  part.compatibilities = compR.rows;
  res.json(part);
});

/* Image management (admin) */
app.post('/parts/:id/images', async (req, res) => {
  const partId = req.params.id;
  const { url, metadata } = req.body;
  if (!url) return res.status(400).json({ error: 'missing_url' });
  const metaJson = metadata ? JSON.stringify(metadata) : null;
  const r = await db.query('INSERT INTO part_images(part_id,url,metadata) VALUES($1,$2,COALESCE($3::jsonb, '{}'::jsonb)) RETURNING *', [partId, url, metaJson]);
  res.status(201).json(r.rows[0]);
});

// Upload file to Supabase Storage and register image
app.post('/parts/:id/upload', upload.single('file'), async (req, res) => {
  const partId = req.params.id;
  if (!req.file) return res.status(400).json({ error: 'missing_file' });
  if (!supabaseServer) return res.status(500).json({ error: 'supabase_not_configured' });
  const file = req.file;
  const ext = path.extname(file.originalname) || '';
  const filename = `parts/${partId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
  const bucket = 'parts';
  try {
    // ensure bucket exists (best-effort)
    try {
      const { data: buckets } = await supabaseServer.storage.listBuckets();
      const exists = buckets && buckets.find(b => b.name === bucket);
      if (!exists) {
        await supabaseServer.storage.createBucket(bucket, { public: true });
      }
    } catch (e) {
      // ignore bucket creation errors
      console.warn('Could not verify/create bucket:', e.message || e);
    }

    const { data, error } = await supabaseServer.storage.from(bucket).upload(filename, file.buffer, { contentType: file.mimetype });
    if (error) return res.status(500).json({ error: error.message });
    const { data: publicData } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
    const publicUrl = publicData.publicUrl || publicData?.public_url || publicData;
    const r = await db.query('INSERT INTO part_images(part_id,url,metadata) VALUES($1,$2,$3) RETURNING *', [partId, publicUrl, JSON.stringify({ originalName: file.originalname })]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload_failed' });
  }
});

app.delete('/part_images/:id', async (req, res) => {
  const id = req.params.id;
  // Optionally delete from storage as well - fetch url and remove object
  const imgR = await db.query('SELECT * FROM part_images WHERE id=$1', [id]);
  if (imgR.rows.length) {
    const url = imgR.rows[0].url;
    try {
      // attempt to derive path from public URL
      if (supabaseServer && url && url.includes('/storage/v1/object/public')) {
        const parts = url.split('/storage/v1/object/public/');
        if (parts[1]) {
          const [bucket, ...rest] = parts[1].split('/');
          const objectPath = rest.join('/');
          await supabaseServer.storage.from(bucket).remove([objectPath]);
        }
      }
    } catch (e) { console.warn('Failed to delete storage object', e.message || e); }
  }
  await db.query('DELETE FROM part_images WHERE id=$1', [id]);
  res.status(204).send();
});

/* Compatibilities endpoint */
app.get('/compatibilities', async (req, res) => {
  const part_id = req.query.part_id;
  if (!part_id) return res.status(400).json({ error: 'missing_part_id' });
  const r = await db.query('SELECT c.*, mo.trim, mo.engine FROM compatibilities c JOIN motorcycles mo ON c.motorcycle_id = mo.id WHERE c.part_id=$1', [part_id]);
  res.json(r.rows);
});

/* Basic error handler */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
