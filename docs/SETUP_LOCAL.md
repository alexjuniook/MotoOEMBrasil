Setup local (Windows) — passos rápidos

1. Instalar Docker Desktop (https://www.docker.com/get-started)
2. Instalar Node.js 18+ (https://nodejs.org/) para dev local
3. Copiar .env.example para .env e ajustar as variáveis

Rodar localmente com containers:

# Subir DB
docker-compose up -d db

# Instalar dependências da API e rodar seed
cd apps/api
npm ci
npm run seed

# Rodar web/admin localmente (Next.js)
cd apps/web && npm install && npm run dev
cd apps/admin && npm install && npm run dev

Observações:
- Se o ambiente Windows não expor 'localhost' para containers, ajustar DATABASE_URL apontando para 'db' dentro de um container ou usar docker-compose run para executar comandos no network do docker.
- Para CI, usar o workflow .github/workflows/seed-and-ci.yml (dispatch manual disponível).