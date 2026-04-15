/**
 * Rotas de consumo de hidratação — HydraCálculo
 */

import express from 'express';
import { getAll, addRecord, getTotalByUserAndDate } from '../data/store.js';

const router = express.Router();

/** Mapa de recipientes permitidos e seus volumes exatos em ml. */
const RECIPIENTES = {
  'Copo Americano (190ml)': 190,
  'Copo (200ml)': 200,
  'Copo de Requeijão (250ml)': 250,
  'Garrafa Premium (330ml)': 330,
  'Garrafa (500ml)': 500,
  'Garrafa Esportiva (750ml)': 750,
  'Garrafa (1L)': 1000,
  'Garrafa Térmica (1.2L)': 1200,
  'Garrafa Térmica (1.5L)': 1500,
  'Galaozinho (2L)': 2000,
};

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

// GET /consumo — Lista todos os registros de hidratação
router.get('/', (_req, res) => {
  res.json(getAll());
});

// POST /consumo — Registra novo consumo e calcula métricas diárias
router.post('/', (req, res) => {
  const { nome_usuario, peso_kg, altura_cm, data_hora, recipiente } = req.body;

  // Validação: nome_usuario
  if (!nome_usuario || typeof nome_usuario !== 'string' || nome_usuario.trim() === '') {
    return res.status(400).json({ error: 'nome_usuario não pode ser vazio.' });
  }
  if (!/^[a-zA-ZÀ-ÿ\s''-]+$/.test(nome_usuario.trim())) {
    return res.status(400).json({ error: 'nome_usuario deve conter apenas letras.' });
  }

  // Validação: peso_kg
  if (typeof peso_kg !== 'number' || isNaN(peso_kg) || peso_kg <= 0) {
    return res.status(400).json({ error: 'peso_kg deve ser um número maior que 0.' });
  }

  // Validação: altura_cm
  if (!Number.isInteger(altura_cm) || altura_cm < 50) {
    return res.status(400).json({ error: 'altura_cm deve ser um número inteiro de no mínimo 50.' });
  }

  // Validação: data_hora (formato ISO 8601)
  if (!data_hora || !ISO_REGEX.test(data_hora) || isNaN(new Date(data_hora).getTime())) {
    return res.status(400).json({ error: 'data_hora deve estar no formato ISO 8601 (ex: 2026-04-15T10:00:00).' });
  }

  // Validação: recipiente
  if (!(recipiente in RECIPIENTES)) {
    const opcoes = Object.keys(RECIPIENTES).join(', ');
    return res.status(400).json({ error: `recipiente inválido. Valores aceitos: ${opcoes}.` });
  }

  // volume_ml derivado automaticamente do recipiente
  const volume_ml = RECIPIENTES[recipiente];

  // Lógica de negócio
  const meta_sugerida_ml = peso_kg * 35;

  const record = addRecord({
    nome_usuario,
    peso_kg,
    altura_cm,
    data_hora,
    recipiente,
    volume_ml,
    meta_sugerida_ml,
  });

  const date = data_hora.substring(0, 10);
  const total_consumido_hoje = getTotalByUserAndDate(nome_usuario, date);
  const rawRestante = meta_sugerida_ml - total_consumido_hoje;
  const restante_ml = Math.max(0, rawRestante);
  const porcentagem_faltante = parseFloat((restante_ml / meta_sugerida_ml * 100).toFixed(2));

  return res.status(201).json({
    ...record,
    total_consumido_hoje,
    restante_ml,
    porcentagem_faltante,
  });
});

export default router;
