export default function ConsumoList({ registros }) {
  if (registros.length === 0) {
    return <p className="lista-vazia">Nenhum registro encontrado. Faça seu primeiro consumo acima!</p>;
  }

  const ordenados = [...registros].reverse();

  return (
    <div className="tabela-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Usuário</th>
            <th>Data / Hora</th>
            <th>Recipiente</th>
            <th>Volume (ml)</th>
            <th>Peso (kg)</th>
            <th>Altura (cm)</th>
            <th>Meta (ml)</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map((r, i) => (
            <tr key={r.id}>
              <td>{registros.length - i}</td>
              <td>{r.nome_usuario}</td>
              <td>{new Date(r.data_hora).toLocaleString('pt-BR')}</td>
              <td>{r.recipiente}</td>
              <td>{r.volume_ml}</td>
              <td>{r.peso_kg}</td>
              <td>{r.altura_cm}</td>
              <td>{r.meta_sugerida_ml}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
