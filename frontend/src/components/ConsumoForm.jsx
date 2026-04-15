import { useState } from 'react';

const RECIPIENTES = [
  'Copo Americano (190ml)',
  'Copo (200ml)',
  'Copo de Requeijão (250ml)',
  'Garrafa Premium (330ml)',
  'Garrafa (500ml)',
  'Garrafa Esportiva (750ml)',
  'Garrafa (1L)',
  'Garrafa Térmica (1.2L)',
  'Garrafa Térmica (1.5L)',
  'Galaozinho (2L)',
];

function hojeISO() {
  const agora = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}T${pad(agora.getHours())}:${pad(agora.getMinutes())}:00`;
}

const NOME_REGEX = /^[a-zA-ZÀ-ÿ\s''-]+$/;

export default function ConsumoForm({ onSubmit, carregando }) {
  const [form, setForm] = useState({
    nome_usuario: '',
    peso_kg: '',
    altura_cm: '',
    data_hora: hojeISO(),
    recipiente: RECIPIENTES[4],
  });
  const [erroNome, setErroNome] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'nome_usuario') {
      if (value !== '' && !NOME_REGEX.test(value)) {
        setErroNome('O nome deve conter apenas letras.');
      } else {
        setErroNome('');
      }
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!NOME_REGEX.test(form.nome_usuario.trim())) {
      setErroNome('O nome deve conter apenas letras.');
      return;
    }
    onSubmit({
      nome_usuario: form.nome_usuario.trim(),
      peso_kg: parseFloat(form.peso_kg),
      altura_cm: parseInt(form.altura_cm, 10),
      data_hora: form.data_hora,
      recipiente: form.recipiente,
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="nome_usuario">Nome do usuário</label>
          <input
            id="nome_usuario"
            name="nome_usuario"
            type="text"
            placeholder="Ex: João Silva"
            value={form.nome_usuario}
            onChange={handleChange}
            required
          />
          {erroNome && <span className="erro-campo">{erroNome}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="data_hora">Data e hora</label>
          <input
            id="data_hora"
            name="data_hora"
            type="datetime-local"
            value={form.data_hora.substring(0, 16)}
            onChange={(e) => setForm((prev) => ({ ...prev, data_hora: e.target.value + ':00' }))}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="peso_kg">Peso (kg)</label>
          <input
            id="peso_kg"
            name="peso_kg"
            type="number"
            min="1"
            step="0.1"
            placeholder="Ex: 70.5"
            value={form.peso_kg}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="altura_cm">Altura (cm)</label>
          <input
            id="altura_cm"
            name="altura_cm"
            type="number"
            min="50"
            step="1"
            placeholder="Ex: 175"
            value={form.altura_cm}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="recipiente">Recipiente</label>
        <select
          id="recipiente"
          name="recipiente"
          value={form.recipiente}
          onChange={handleChange}
          required
        >
          {RECIPIENTES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary" disabled={carregando}>
        {carregando ? 'Registrando...' : '💧 Registrar consumo'}
      </button>
    </form>
  );
}
