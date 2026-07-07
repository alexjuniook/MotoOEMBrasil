const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());

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

/* Parts */
app.get('/parts', async (req, res) => {
  const q = req.query.q;
  if (q) {
    const r = await db.query("SELECT *, ts_rank(to_tsvector('portuguese', coalesce(name,'')), plainto_tsquery('portuguese', $1)) as rank FROM parts WHERE to_tsvector('portuguese', coalesce(name,'')) @@ plainto_tsquery('portuguese', $1) ORDER BY rank DESC", [q]);
    res.json(r.rows);
  } else {
    const r = await db.query('SELECT * FROM parts');
    res.json(r.rows);
  }
});
app.post('/parts', async (req, res) => {
  const { sku, name, manufacturer_id, assembly_id, description } = req.body;
  const r = await db.query('INSERT INTO parts(sku,name,manufacturer_id,assembly_id,description) VALUES($1,$2,$3,$4,$5) RETURNING *', [sku, name, manufacturer_id, assembly_id, description]);
  res.status(201).json(r.rows[0]);
});

/* Basic error handler */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
