/**
 * Armazenamento em memória para os registros de hidratação.
 * Utiliza ID inteiro auto-incrementado.
 */

let records = [];
let nextId = 1;

/** Retorna todos os registros armazenados. */
export function getAll() {
  return records;
}

/**
 * Adiciona um novo registro ao armazenamento.
 * @param {object} data - Dados do consumo (sem id).
 * @returns {object} Registro criado com id atribuído.
 */
export function addRecord(data) {
  const record = { id: nextId++, ...data };
  records.push(record);
  return record;
}

/**
 * Calcula o total de ml consumidos por um usuário em uma data específica.
 * A comparação usa os 10 primeiros caracteres de data_hora (YYYY-MM-DD).
 * @param {string} nomeUsuario
 * @param {string} date - Formato YYYY-MM-DD
 * @returns {number}
 */
export function getTotalByUserAndDate(nomeUsuario, date) {
  return records
    .filter(r => r.nome_usuario === nomeUsuario && r.data_hora.substring(0, 10) === date)
    .reduce((sum, r) => sum + r.volume_ml, 0);
}

/**
 * Reseta o armazenamento e o contador de IDs.
 * Utilizado nos testes para isolamento de estado.
 */
export function reset() {
  records = [];
  nextId = 1;
}
