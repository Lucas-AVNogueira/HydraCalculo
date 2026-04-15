/**
 * Configuração da aplicação Express — HydraCálculo
 * Autor: Lucas Nogueira (LN)
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import yaml from 'js-yaml';
import consumoRouter from './routes/consumo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = yaml.load(
  readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8')
);

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/consumo', consumoRouter);

// Handler: métodos não permitidos em /consumo
app.all('/consumo', (_req, res) => {
  res.status(405).json({ error: 'Método não permitido.' });
});

// Handler: rota inexistente
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Handler: erro interno inesperado (4 parâmetros obrigatórios no Express)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

export default app;
