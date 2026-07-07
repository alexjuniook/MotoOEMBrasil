MotoOEM Brasil - Arquitetura (resumo)

Stack:
- Frontend: Next.js (apps/web), Admin: Next.js (apps/admin)
- Backend: apps/api (Node/Edge functions / Supabase Edge)
- DB: PostgreSQL (Supabase), uso de FTS e pgvector para busca
- Automations: n8n para pipelines de import/embedding/SEO
- Embeddings: OpenAI / OpenRouter / Ollama compatível

Monorepo layout (pnpm/yarn workspaces):
- apps/web, apps/admin, apps/api
- packages/database (schema), packages/types, packages/ui, packages/search

Escalabilidade:
- Shard/partition por fabricante/ano para milhões de peças
- Indexes compósitos e materiaised views para consultas analíticas

Próximos passos:
1. Rodar schema.sql no Postgres (local ou supabase)
2. Implementar autenticação e seeds de dados
3. Criar pipelines n8n e integração de embeddings
4. Gerar telas base e componentes UI
