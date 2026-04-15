export default function MetricasCard({ dados }) {
  const {
    nome_usuario,
    recipiente,
    volume_ml,
    meta_sugerida_ml,
    total_consumido_hoje,
    restante_ml,
    porcentagem_faltante,
    data_hora,
  } = dados;

  const porcentagemConsumida = parseFloat((100 - porcentagem_faltante).toFixed(2));
  const dataFormatada = new Date(data_hora).toLocaleString('pt-BR');

  return (
    <div>
      <div className="metricas-grid">
        <div className="metrica-item">
          <div className="valor">{volume_ml} ml</div>
          <div className="rotulo">Registrado agora</div>
        </div>
        <div className="metrica-item">
          <div className="valor">{total_consumido_hoje} ml</div>
          <div className="rotulo">Total consumido hoje</div>
        </div>
        <div className="metrica-item">
          <div className="valor">{meta_sugerida_ml} ml</div>
          <div className="rotulo">Meta diária</div>
        </div>
        <div className="metrica-item">
          <div className="valor">{restante_ml} ml</div>
          <div className="rotulo">Restante para a meta</div>
        </div>
      </div>

      <div className="progresso-wrapper">
        <div className="progresso-label">
          <span>Progresso diário — {nome_usuario}</span>
          <span>{porcentagemConsumida}%</span>
        </div>
        <div className="progresso-bar">
          <div
            className="progresso-fill"
            style={{ width: `${Math.min(porcentagemConsumida, 100)}%` }}
          />
        </div>
      </div>

      <div className="metrica-detalhe">
        <span>📦 <strong>{recipiente}</strong></span>
        <span>🕐 <strong>{dataFormatada}</strong></span>
        {restante_ml === 0 && (
          <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ Meta atingida!</span>
        )}
      </div>
    </div>
  );
}
