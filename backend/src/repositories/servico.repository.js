/**
 * Acesso à tabela Servico no MySQL (BP05).
 * Só executa SQL e devolve os dados; as regras de negócio ficam no servico.service.js.
 */

const pool = require('../config/database');

/**
 * Busca um serviço pelo nome, sem diferenciar maiúsculas de minúsculas (RF003).
 *
 * @param {string} nome Nome do serviço.
 * @returns {Promise<object|null>} O serviço encontrado ou null se não existir.
 */
async function buscarPorNome(nome) {
  const [linhas] = await pool.query(
    'SELECT * FROM Servico WHERE LOWER(nome) = LOWER(?)',
    [nome]
  );
  return linhas[0] ?? null;
}

/**
 * Grava um novo serviço na tabela Servico (RF003).
 *
 * @param {{ nome: string, descricao?: string, preco: number }} servico Dados do serviço.
 * @returns {Promise<number>} Id do serviço criado.
 */
async function inserir(servico) {
  const [resultado] = await pool.query(
    'INSERT INTO Servico (nome, descricao, preco) VALUES (?, ?, ?)',
    [servico.nome, servico.descricao ?? null, servico.preco]
  );
  return resultado.insertId;
}

module.exports = { buscarPorNome, inserir };