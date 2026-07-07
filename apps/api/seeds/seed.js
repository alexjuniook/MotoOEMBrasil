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

  // Brands / manufacturers / models
  const brand = await db.query("INSERT INTO brands(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *", ['Honda']);
  const manufacturer = await db.query("INSERT INTO manufacturers(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *", ['KVS']);
  const manufacturer2 = await db.query("INSERT INTO manufacturers(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING *", ['Magneti Marelli']);

  const model = await db.query('INSERT INTO models(brand_id,name,year) VALUES($1,$2,$3) RETURNING *',[brand.rows[0].id,'CG 160',2024]);
  const model2 = await db.query('INSERT INTO models(brand_id,name,year) VALUES($1,$2,$3) RETURNING *',[brand.rows[0].id,'XRE 300',2023]);

  // Motorcycles
  const motorcycle = await db.query('INSERT INTO motorcycles(model_id,trim,engine) VALUES($1,$2,$3) RETURNING *',[model.rows[0].id,'Standard','160cc']);
  const motorcycle2 = await db.query('INSERT INTO motorcycles(model_id,trim,engine) VALUES($1,$2,$3) RETURNING *',[model2.rows[0].id,'Adventure','300cc']);

  // Assemblies
  const assembly = await db.query('INSERT INTO assemblies(motorcycle_id,name) VALUES($1,$2) RETURNING *',[motorcycle.rows[0].id,'Motor']);
  const assembly2 = await db.query('INSERT INTO assemblies(motorcycle_id,name) VALUES($1,$2) RETURNING *',[motorcycle2.rows[0].id,'Suframa']);

  // Parts
  const part1 = await db.query('INSERT INTO parts(sku,name,manufacturer_id,assembly_id,description) VALUES($1,$2,$3,$4,$5) RETURNING *', ['23801','KVS-900 Bomba de Combustível', manufacturer.rows[0].id, assembly.rows[0].id, 'Bomba de combustível original KVS para CG 160']);
  const part2 = await db.query('INSERT INTO parts(sku,name,manufacturer_id,assembly_id,description) VALUES($1,$2,$3,$4,$5) RETURNING *', ['33012','MM-1234 Filtro de Óleo', manufacturer2.rows[0].id, assembly.rows[0].id, 'Filtro de óleo compatível para vários modelos']);
  const part3 = await db.query('INSERT INTO parts(sku,name,manufacturer_id,assembly_id,description) VALUES($1,$2,$3,$4,$5) RETURNING *', ['45100','XRE-CLIP-01 Abraçadeira', manufacturer.rows[0].id, assembly2.rows[0].id, 'Abraçadeira de fixação para XRE 300']);

  // Part images
  await db.query('INSERT INTO part_images(part_id,url,metadata) VALUES($1,$2,$3)', [part1.rows[0].id, 'https://example.com/images/23801-1.jpg', JSON.stringify({ angle: 'front' })]);
  await db.query('INSERT INTO part_images(part_id,url,metadata) VALUES($1,$2,$3)', [part1.rows[0].id, 'https://example.com/images/23801-2.jpg', JSON.stringify({ angle: 'side' })]);
  await db.query('INSERT INTO part_images(part_id,url,metadata) VALUES($1,$2,$3)', [part2.rows[0].id, 'https://example.com/images/33012-1.jpg', JSON.stringify({})]);

  // Equivalent parts
  await db.query('INSERT INTO equivalent_parts(part_id,equivalent_part_id,note) VALUES($1,$2,$3)', [part1.rows[0].id, part2.rows[0].id, 'Alternativa compatível em alguns motores']);

  // Compatibilities
  await db.query('INSERT INTO compatibilities(part_id,motorcycle_id,note) VALUES($1,$2,$3)', [part1.rows[0].id, motorcycle.rows[0].id, 'Compatível OEM']);
  await db.query('INSERT INTO compatibilities(part_id,motorcycle_id,note) VALUES($1,$2,$3)', [part3.rows[0].id, motorcycle2.rows[0].id, 'Uso específico para versões off-road']);

  console.log('Seed complete');
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
