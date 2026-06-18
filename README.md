# MotoOEM Brasil

Sistema nacional de inteligência de motopeças.

## Objetivo

Construir a maior base de dados de peças OEM, compatibilidades e equivalências de motos vendidas no Brasil.

## MVP

* Cadastro de marcas
* Cadastro de modelos
* Cadastro de motos
* Cadastro de peças OEM
* Compatibilidades
* Busca por código OEM
* Importação CSV

## Stack

### Backend

* FastAPI
* SQLAlchemy
* SQLite (fase inicial)
* PostgreSQL (produção)

### Frontend

* Next.js
* TypeScript

### Infraestrutura

* Docker
* GitHub Actions

### Automação

* n8n

## Estrutura

MotoOEMBrasil/

* backend/
* frontend/
* database/
* docs/
* n8n/
* .github/

## Roadmap

### Sprint 1

* Foundation
* API FastAPI
* SQLite
* CRUD Brands
* CRUD Models
* CRUD Motorcycles

### Sprint 2

* CRUD Parts
* Compatibilities
* Search OEM

### Sprint 3

* CSV Import
* Dashboard

### Sprint 4

* PostgreSQL
* Docker Production
* n8n
* API Pública

## Visão

O MotoOEM Brasil será uma plataforma capaz de responder:

"Esta peça serve em quais motos?"

e

"Quais equivalentes existem para este código OEM?"
