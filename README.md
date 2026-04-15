<h1 align="center">💧 HydraCálculo</h1>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="OpenAPI" src="https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
  <img alt="Testes" src="https://img.shields.io/badge/Testes-17%20passing-4CAF50?style=for-the-badge&logo=mocha&logoColor=white">
  <img alt="Licença" src="https://img.shields.io/badge/Licen%C3%A7a-ISC-blue?style=for-the-badge">
</p>

<p align="center">
  Aplicação fullstack para registro e monitoramento de hidratação pessoal.<br>
  API REST (Node.js + Express) com interface web (React + Vite).<br>
  A cada consumo registrado, calcula automaticamente a meta diária, o total consumido, o volume restante e a porcentagem atingida.
</p>

<p align="center">
  <a href="#-aviso">Aviso</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-pré-requisitos">Pré-requisitos</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-executando-a-api">Executando a API</a> •
  <a href="#-executando-o-frontend">Executando o Frontend</a> •
  <a href="#-endpoints">Endpoints</a> •
  <a href="#-testes">Testes</a> •
  <a href="#-estrutura-do-projeto">Estrutura</a>
</p>

---

## ⚠️ Aviso

> Este projeto foi desenvolvido com auxílio de **IA Generativa** — **GitHub Copilot** (Claude Sonnet 4.6). Código gerado por IA pode conter erros ou problemas de segurança — revise antes de usar em produção. Use como referência de aprendizado, não como software pronto para produção.

---

## 🤖 GitHub Copilot Prompt

<details>
<summary>Clique para ver o prompt utilizado para gerar este projeto</summary>

```
Crie uma aplicação fullstack de hidratação pessoal (HydraCálculo) com os seguintes requisitos:

- Runtime: Node.js com ES Modules ("type": "module" no package.json)
- Framework API: Express.js
- Armazenamento em memória (sem banco de dados), com ID inteiro auto-incremento
- Frontend: React 18 + Vite 5 com proxy reverso para a API

Endpoints:
  GET  /consumo  — lista todos os registros (retorna array vazio quando não há registros)
  POST /consumo  — registra um novo consumo e retorna as métricas calculadas

Corpo do POST /consumo (todos os campos obrigatórios):
  - nome_usuario  (string não vazia, apenas letras — sem números)
  - peso_kg       (número estritamente maior que 0)
  - altura_cm     (inteiro >= 50)
  - data_hora     (string ISO 8601: YYYY-MM-DDTHH:MM:SS)
  - recipiente    (enum com 10 opções fixas; volume_ml é derivado automaticamente)

Respostas HTTP:
  201 — consumo criado, retorna objeto completo com métricas
  400 — erro de validação, retorna { error: "<mensagem>" }
  404 — rota não encontrada
  405 — método não permitido em /consumo

Fórmulas:
  meta_sugerida_ml    = peso_kg × 35
  restante_ml         = max(0, meta_sugerida_ml − total_consumido_hoje)
  porcentagem_faltante = (restante_ml / meta_sugerida_ml) × 100, arredondado para 2 casas

Adicione:
- Swagger UI em /api-docs usando swagger-ui-express e swagger.yaml (OpenAPI 3.0.3)
- .mocharc.yml configurado para tests/consumo.test.js com timeout de 2000ms e reporter mochawesome
- Testes Mocha + Chai + Supertest cobrindo: GET (vazio, com registros), POST sucesso (meta, volume derivado,
  IDs incrementais), POST validação (peso zero/negativo, nome vazio/com números, recipiente inválido,
  data_hora fora do ISO 8601, PUT/DELETE → 405, rota inexistente → 404, erro interno → 500),
  POST cálculos acumulados (restante_ml, porcentagem_faltante, meta superada → restante = 0)
```

</details>

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js ≥ 18 (ESM nativo) |
| Framework API | Express 4 |
| Frontend | React 18 + Vite 5 |
| Documentação | swagger-ui-express + OpenAPI 3.0.3 |
| Testes | Mocha 10 + Chai 4 + Supertest 6 |
| Relatório | Mochawesome 7 |

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm (incluso no Node.js)

---

## 🚀 Instalação

**1. Clone o repositório**

```bash
git clone <url-do-repositorio>
cd HydraCálculo
```

**2. Instale as dependências da API**

```bash
npm install
```

> Instala: `express`, `js-yaml`, `swagger-ui-express` e as devDependencies `mocha`, `chai`, `supertest`, `mochawesome`.

**3. Instale as dependências do frontend**

```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Executando a API

```bash
npm start
```

O servidor inicia na porta 3000:

```
HydraCálculo API rodando em http://localhost:3000
Swagger UI disponível em http://localhost:3000/api-docs
```

> Pressione `Ctrl+C` para parar.

---

## 🌐 Executando o Frontend

Com a API em execução, abra um segundo terminal:

```bash
cd frontend
npm run dev
```

Acesse em `http://localhost:5173`. O Vite redireciona automaticamente as requisições `/consumo` para `http://localhost:3000` via proxy — sem necessidade de configurar CORS.

---

## 📡 Endpoints

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/consumo` | Lista todos os registros de hidratação |
| `POST` | `/consumo` | Registra um novo consumo e retorna métricas |

### Exemplo — Registrar consumo

```bash
curl -X POST http://localhost:3000/consumo \
  -H "Content-Type: application/json" \
  -d '{"nome_usuario":"João Silva","peso_kg":70,"altura_cm":175,"data_hora":"2026-04-15T10:00:00","recipiente":"Garrafa (500ml)"}'
```

**Resposta `201 Created`:**

```json
{
  "id": 1,
  "nome_usuario": "João Silva",
  "peso_kg": 70,
  "altura_cm": 175,
  "data_hora": "2026-04-15T10:00:00",
  "recipiente": "Garrafa (500ml)",
  "volume_ml": 500,
  "meta_sugerida_ml": 2450,
  "total_consumido_hoje": 500,
  "restante_ml": 1950,
  "porcentagem_faltante": 79.59
}
```

**Resposta `400 Bad Request`:**

```json
{ "error": "nome_usuario deve conter apenas letras." }
```

---

## 📖 Documentação Swagger

Com a API em execução, acesse:

**`http://localhost:3000/api-docs`**

O Swagger UI exibe todos os endpoints, schemas, validações e exemplos. Use o botão **Try it out** para executar requisições direto pelo navegador.

---

## 🧪 Testes

Os testes rodam sem necessidade de o servidor estar em execução (o Supertest gerencia isso internamente).

```bash
npm test
```

<details>
<summary>Ver saída esperada</summary>

```
  HydraCálculo API
    GET /consumo
      ✔ retorna array vazio quando não há registros
      ✔ retorna lista com os registros existentes

    POST /consumo — Sucesso
      ✔ calcula meta_sugerida_ml corretamente para 70 kg (esperado: 2450 ml)
      ✔ aceita recipiente e retorna volume_ml derivado automaticamente
      ✔ gera IDs incrementais para registros consecutivos

    POST /consumo — Validação
      ✔ retorna 400 para peso_kg igual a 0
      ✔ retorna 400 para peso_kg negativo
      ✔ retorna 400 para nome_usuario vazio
      ✔ retorna 400 para recipiente inválido
      ✔ retorna 400 para data_hora em formato inválido (não ISO 8601)
      ✔ retorna 405 JSON para método PUT em /consumo
      ✔ retorna 405 JSON para método DELETE em /consumo
      ✔ retorna 404 JSON para rota inexistente
      ✔ retorna 500 JSON para erro interno inesperado

    POST /consumo — Cálculos
      ✔ calcula restante_ml corretamente após múltiplos consumos do mesmo usuário no mesmo dia
      ✔ retorna porcentagem_faltante correta após dois consumos (esperado: ~52.38%)
      ✔ retorna porcentagem_faltante igual a 0 quando meta foi superada

  17 passing (Xms)
```

</details>

Um relatório HTML é gerado em `test-report/mochawesome.html`.

**Configuração (`.mocharc.yml`):**

```yaml
spec: tests/**/*.test.js
timeout: 2000
reporter: mochawesome
```

> O estado é reiniciado via `reset()` no `beforeEach`, garantindo isolamento completo entre casos.

---

## 📁 Estrutura do Projeto

```
HydraCálculo/
├── frontend/                           # Aplicação React (interface web)
│   ├── index.html                      # Página HTML raiz carregada pelo Vite
│   ├── package.json                    # Dependências e scripts do frontend
│   ├── vite.config.js                  # Configuração do Vite com proxy reverso (/consumo → localhost:3000)
│   └── src/
│       ├── App.css                     # Estilos globais da aplicação
│       ├── App.jsx                     # Componente raiz — orquestra estado e chamadas à API
│       ├── main.jsx                    # Ponto de entrada — monta o React no DOM
│       └── components/
│           ├── ConsumoForm.jsx         # Formulário de registro de consumo com validação de nome
│           ├── ConsumoList.jsx         # Listagem de todos os registros cadastrados
│           └── MetricasCard.jsx        # Card com métricas diárias calculadas (meta, consumido, restante)
├── src/                                # Código-fonte da API
│   ├── app.js                          # Configuração do Express: middlewares, rotas e handlers de erro (404/405/500)
│   ├── server.js                       # Ponto de entrada HTTP — inicia o servidor na porta 3000
│   ├── data/
│   │   └── store.js                    # Armazenamento em memória: getAll, addRecord, getTotalByUserAndDate, reset
│   └── routes/
│       └── consumo.js                  # Rotas GET e POST /consumo com validações e lógica de negócio
├── tests/
│   └── consumo.test.js                 # Suite de testes automatizados (Mocha + Chai + Supertest)
├── test-report/
│   └── mochawesome.html                # Relatório HTML gerado pelo Mochawesome após npm test
├── .mocharc.yml                        # Configuração do Mocha: spec, timeout e reporter
├── package.json                        # Dependências e scripts da API (start, test)
├── swagger.yaml                        # Especificação OpenAPI 3.0.3 da API
└── README.md                           # Documentação do projeto
```

---

## 🥤 Referência de Recipientes

| Recipiente | Volume |
|------------|--------|
| Copo Americano (190ml) | 190 ml |
| Copo (200ml) | 200 ml |
| Copo de Requeijão (250ml) | 250 ml |
| Garrafa Premium (330ml) | 330 ml |
| Garrafa (500ml) | 500 ml |
| Garrafa Esportiva (750ml) | 750 ml |
| Garrafa (1L) | 1000 ml |
| Garrafa Térmica (1.2L) | 1200 ml |
| Garrafa Térmica (1.5L) | 1500 ml |
| Galaozinho (2L) | 2000 ml |

> O `volume_ml` é **derivado automaticamente** do `recipiente` — não precisa ser informado na requisição.

---

## 📐 Fórmulas de Cálculo

| Campo | Fórmula |
|-------|---------|
| `meta_sugerida_ml` | `peso_kg × 35` |
| `restante_ml` | `max(0, meta_sugerida_ml − total_consumido_hoje)` |
| `porcentagem_faltante` | `(restante_ml / meta_sugerida_ml) × 100` _(2 casas decimais)_ |

> **Exemplo:** usuário de 70 kg → meta de **2.450 ml/dia**. Após 500 ml consumidos → restam **1.950 ml** (≈ 79,59%).

---

<p align="center">
  Desenvolvido com 💧 e <strong>IA Generativa</strong> — <a href="https://github.com/features/copilot">GitHub Copilot</a>
</p>
