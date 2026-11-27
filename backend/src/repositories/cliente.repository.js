/**
 * Acesso à tabela Cliente no MySQL (BP05).
 * Só executa SQL e devolve os dados; quem usa é o cliente.service.js.
 */

const pool = require('../config/database');

/**
 * Lista os clientes em ordem alfabética, para o formulário da ordem de serviço (RF012, passo 4).
 *
 * @returns {Promise<{ id: number, nome: string, cpf: string }[]>} Clientes cadastrados (lista vazia se nenhum).
 */
async function listar() {
  const [linhas] = await pool.query(
    'SELECT id, nome, cpf FROM Cliente ORDER BY nome'
  );
  return linhas;
}

module.exports = { listar };