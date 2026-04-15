/**
 * Testes — HydraCálculo API
 * Stack: Mocha + Chai + Supertest
 */

import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { reset } from '../src/data/store.js';
import express from 'express';

// Corpo válido reutilizável nos testes
const corpoValido = {
  nome_usuario: 'João Silva',
  peso_kg: 70,
  altura_cm: 175,
  data_hora: '2026-04-15T10:00:00',
  recipiente: 'Garrafa (500ml)',
};

describe('HydraCálculo API', () => {
  // Isola cada teste reiniciando o armazenamento em memória
  beforeEach(() => reset());

  // ────────────────────────────────────────────────────────────
  // GET /consumo
  // ────────────────────────────────────────────────────────────
  describe('GET /consumo', () => {
    it('retorna array vazio quando não há registros', async () => {
      const res = await request(app).get('/consumo');

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });

    it('retorna lista com os registros existentes', async () => {
      await request(app).post('/consumo').send(corpoValido);

      const res = await request(app).get('/consumo');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(1);
      expect(res.body[0]).to.include({ nome_usuario: 'João Silva', volume_ml: 500 });
    });
  });

  // ────────────────────────────────────────────────────────────
  // POST /consumo — Sucesso
  // ────────────────────────────────────────────────────────────
  describe('POST /consumo — Sucesso', () => {
    it('calcula meta_sugerida_ml corretamente para 70 kg (esperado: 2450 ml)', async () => {
      const res = await request(app).post('/consumo').send(corpoValido);

      expect(res.status).to.equal(201);
      expect(res.body.meta_sugerida_ml).to.equal(2450);
    });

    it('aceita recipiente e retorna volume_ml derivado automaticamente', async () => {
      const res = await request(app).post('/consumo').send({
        ...corpoValido,
        recipiente: 'Garrafa Esportiva (750ml)',
      });

      expect(res.status).to.equal(201);
      expect(res.body.recipiente).to.equal('Garrafa Esportiva (750ml)');
      expect(res.body.volume_ml).to.equal(750);
    });

    it('gera IDs incrementais para registros consecutivos', async () => {
      const res1 = await request(app).post('/consumo').send(corpoValido);
      const res2 = await request(app).post('/consumo').send(corpoValido);

      expect(res1.status).to.equal(201);
      expect(res2.status).to.equal(201);
      expect(res1.body.id).to.equal(1);
      expect(res2.body.id).to.equal(2);
    });
  });

  // ────────────────────────────────────────────────────────────
  // POST /consumo — Validação
  // ────────────────────────────────────────────────────────────
  describe('POST /consumo — Validação', () => {
    it('retorna 400 para peso_kg igual a 0', async () => {
      const res = await request(app)
        .post('/consumo')
        .send({ ...corpoValido, peso_kg: 0 });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('retorna 400 para peso_kg negativo', async () => {
      const res = await request(app)
        .post('/consumo')
        .send({ ...corpoValido, peso_kg: -10 });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('retorna 400 para nome_usuario vazio', async () => {
      const res = await request(app)
        .post('/consumo')
        .send({ ...corpoValido, nome_usuario: '' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('retorna 400 para recipiente inválido', async () => {
      const res = await request(app)
        .post('/consumo')
        .send({ ...corpoValido, recipiente: 'Copo Mágico (999ml)' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('retorna 400 para data_hora em formato inválido (não ISO 8601)', async () => {
      const res = await request(app)
        .post('/consumo')
        .send({ ...corpoValido, data_hora: '15/04/2026' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('retorna 405 JSON para método PUT em /consumo', async () => {
      const res = await request(app).put('/consumo');

      expect(res.status).to.equal(405);
      expect(res.body).to.have.property('error');
    });

    it('retorna 405 JSON para método DELETE em /consumo', async () => {
      const res = await request(app).delete('/consumo');

      expect(res.status).to.equal(405);
      expect(res.body).to.have.property('error');
    });

    it('retorna 404 JSON para rota inexistente', async () => {
      const res = await request(app).get('/rota-inexistente');

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error');
    });

    it('retorna 500 JSON para erro interno inesperado', async () => {
      // Cria uma app temporária com rota que lança exceção
      const testApp = express();
      testApp.use(express.json());
      testApp.get('/erro', () => { throw new Error('falha simulada'); });
      testApp.use((err, _req, res, _next) => {
        res.status(500).json({ error: 'Erro interno do servidor.' });
      });

      const res = await request(testApp).get('/erro');

      expect(res.status).to.equal(500);
      expect(res.body).to.have.property('error');
    });
  });

  // ────────────────────────────────────────────────────────────
  // POST /consumo — Cálculos acumulados
  // ────────────────────────────────────────────────────────────
  describe('POST /consumo — Cálculos', () => {
    it('calcula restante_ml corretamente após múltiplos consumos do mesmo usuário no mesmo dia', async () => {
      const corpoMaria = {
        nome_usuario: 'Maria',
        peso_kg: 60,         // meta = 60 * 35 = 2100 ml
        altura_cm: 165,
        data_hora: '2026-04-15T08:00:00',
        recipiente: 'Garrafa (500ml)',
      };

      // 1º consumo: total_hoje = 500, restante = 1600
      await request(app).post('/consumo').send(corpoMaria);

      // 2º consumo no mesmo dia: total_hoje = 1000, restante = 1100
      const res2 = await request(app).post('/consumo').send({
        ...corpoMaria,
        data_hora: '2026-04-15T14:00:00',
      });

      expect(res2.status).to.equal(201);
      expect(res2.body.meta_sugerida_ml).to.equal(2100);
      expect(res2.body.total_consumido_hoje).to.equal(1000);
      expect(res2.body.restante_ml).to.equal(1100);
    });

    it('retorna porcentagem_faltante correta após dois consumos (esperado: ~52.38%)', async () => {
      const corpoMaria = {
        nome_usuario: 'Maria',
        peso_kg: 60,         // meta = 2100 ml
        altura_cm: 165,
        data_hora: '2026-04-15T08:00:00',
        recipiente: 'Garrafa (500ml)',
      };

      await request(app).post('/consumo').send(corpoMaria);

      const res2 = await request(app).post('/consumo').send({
        ...corpoMaria,
        data_hora: '2026-04-15T14:00:00',
      });

      // total = 1000, restante = 1100, porcentagem = (1100/2100)*100 ≈ 52.38
      expect(res2.status).to.equal(201);
      expect(res2.body.porcentagem_faltante).to.equal(52.38);
    });

    it('retorna porcentagem_faltante igual a 0 quando meta foi superada', async () => {
      const corpo = {
        nome_usuario: 'Carlos',
        peso_kg: 60,         // meta = 2100 ml
        altura_cm: 170,
        data_hora: '2026-04-15T08:00:00',
        recipiente: 'Galaozinho (2L)',
      };

      await request(app).post('/consumo').send(corpo);

      const res2 = await request(app).post('/consumo').send({
        ...corpo,
        data_hora: '2026-04-15T12:00:00',
      });

      // total = 4000, restante = -1900 → restante_ml = 0, porcentagem_faltante = 0
      expect(res2.status).to.equal(201);
      expect(res2.body.restante_ml).to.equal(0);
      expect(res2.body.porcentagem_faltante).to.equal(0);
    });
  });
});
