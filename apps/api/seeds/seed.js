const fs = require('fs');
const path = require('path');
const db = require('../db');
require('dotenv').config();

async function run() {
  // Ensure pgcrypto for gen_random_uuid()
  try {
    console.log('Ensuring pgcrypto extension...');
    await db.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  } catch (err) {
    console.warn('Could not create extension pgcrypto (might need superuser):', err.message);
  }

  const schemaPath = path.resolve(__dirname, '../../packages/database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Applying schema...');
  await db.pool.query(sql);
  console.log('Inserting sample data...');
  const brand = await db.query("INSERT INTO brands(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *", ['Honda']);
  const manufacturer = await db.query("INSERT INTO manufacturers(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *", ['KVS']);
  const model = await db.query('INSERT INTO models(brand_id,name,year) VALUES($1,$2,$3) RETURNING *',[brand.rows[0].id,'CG 160',2024]);
  const motorcycle = await db.query('INSERT INTO motorcycles(model_id,trim,engine) VALUES($1,$2,$3) RETURNING *',[model.rows[0].id,'Standard','160cc']);
  const assembly = await db.query('INSERT INTO assemblies(motorcycle_id,name) VALUES($1,$2) RETURNING *',[motorcycle.rows[0].id,'Motores']);
  const part = await db.query('INSERT INTO parts(sku,name,manufacturer_id,assembly_id,description) VALUES($1,$2,$3,$4,$5) RETURNING *',['23801','KVS-900',manufacturer.rows[0].id,assembly.rows[0].id,'Peça exemplo']);
  await db.query('INSERT INTO compatibilities(part_id,motorcycle_id,note) VALUES($1,$2,$3) RETURNING *',[part.rows[0].id,motorcycle.rows[0].id,'Exemplo']);
  console.log('Seed complete');
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
