import { useState, useEffect, useCallback } from 'react';
import ConsumoForm from './components/ConsumoForm.jsx';
import MetricasCard from './components/MetricasCard.jsx';
import ConsumoList from './components/ConsumoList.jsx';

export default function App() {
  const [registros, setRegistros] = useState([]);
  const [ultimaResposta, setUltimaResposta] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarRegistros = useCallback(async () => {
    try {
      const res = await fetch('/consumo');
      if (!res.ok) throw new Error('Falha ao carregar registros.');
      const dados = await res.json();
      setRegistros(dados);
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  async function handleRegistrar(payload) {
    setCarregando(true);
    setErro(null);
    setUltimaResposta(null);
    try {
      const res = await fetch('/consumo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const dados = await res.json();
      if (!res.ok) {
        setErro(dados.error || 'Erro desconhecido.');
        return;
      }
      setUltimaResposta(dados);
      await carregarRegistros();
    } catch (e) {
      setErro('Não foi possível conectar à API. Verifique se o servidor está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="layout">
      <header className="header">
        <span className="header-icon">💧</span>
        <h1>HydraCálculo</h1>
        <p>Controle sua hidratação diária</p>
      </header>

      <main className="main">
        <section className="card">
          <h2>Registrar Consumo</h2>
          <ConsumoForm onSubmit={handleRegistrar} carregando={carregando} />
          {erro && <p className="msg-erro">{erro}</p>}
        </section>

        {ultimaResposta && (
          <section className="card">
            <h2>Resultado</h2>
            <MetricasCard dados={ultimaResposta} />
          </section>
        )}

        <section className="card">
          <h2>Histórico de Registros <span className="badge">{registros.length}</span></h2>
          <ConsumoList registros={registros} />
        </section>
      </main>

      <footer className="footer">
        <p>HydraCálculo &mdash; API rodando em <a href="http://localhost:3000/api-docs" target="_blank" rel="noreferrer">localhost:3000</a></p>
      </footer>
    </div>
  );
}
