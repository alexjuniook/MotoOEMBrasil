import React, { useEffect, useState } from 'react'

type Part = {
  id: number;
  sku?: string;
  name: string;
  description?: string;
  manufacturer_name?: string;
}

export default function Home() {
  const [parts, setParts] = useState<Part[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetchParts();
  }, []);

  async function fetchParts(search?: string) {
    const url = search ? `/parts?q=${encodeURIComponent(search)}` : '/parts';
    try {
      const res = await fetch(url.replace('/parts', 'http://localhost:8080/parts'));
      const data = await res.json();
      setParts(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">MotoOEM Brasil — Catálogo</h1>
      <p className="mt-4">Busque peças por nome ou por código OEM.</p>

      <div className="mt-6">
        <input className="border p-2 mr-2" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Pesquisar peças..." />
        <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={()=>fetchParts(q)}>Buscar</button>
      </div>

      <ul className="mt-6 space-y-4">
        {parts.map(p=> (
          <li key={p.id} className="border p-4 rounded">
            <div className="font-semibold">{p.name} {p.sku ? `(${p.sku})` : ''}</div>
            <div className="text-sm text-gray-600">{p.manufacturer_name} — {p.description}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
