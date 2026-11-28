/**
 * Acesso às tabelas Cliente e Usuario (acesso do cliente) no MySQL (BP05).
 * Só executa SQL e devolve os dados; quem usa é o cliente.service.js.
 */

const pool = require('../config/database');
const { PERFIL } = require('../constantes');

/**
 * Lista os clientes em ordem alfabética, para o formulário da ordem de serviço (RF012, passo 4).
 *
 * @returns {Promise<{ id: number, nome: string, cpf: string }[]>} Clientes cadastrados (lista vazia se nenhum).
 */
async function listar() {
  const [linhas] = await pool.query('SELECT id, nome, cpf FROM Cliente ORDER BY nome');
  return linhas;
}

/**
 * Busca um cliente pelo CPF, para impedir CPF duplicado (RF007, regra 1).
 *
 * @param {string} cpf CPF só com números.
 * @returns {Promise<{ id: number }|null>} O cliente encontrado ou null se não existir.
 */
async function buscarPorCpf(cpf) {
  const [linhas] = await pool.query('SELECT id FROM Cliente WHERE cpf = ?', [cpf]);
  return linhas[0] ?? null;
}

/**
 * Grava o cliente e o acesso dele (Usuario com perfil CLIENTE e primeiro acesso pendente)
 * em uma única transação (RF007, passo 8). Se algum INSERT falhar, o rollback desfaz tudo:
 * não fica cliente sem acesso nem acesso sem cliente.
 *
 * @param {{ nome: string, cpf: string, telefone: string }} cliente Dados do cliente.
 * @param {{ email: string, senhaHash: string }} acesso E-mail e hash da senha inicial (RNF006).
 * @returns {Promise<number>} Id do cliente criado.
 */
async function inserir(cliente, acesso) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [resultado] = await conexao.query(
      'INSERT INTO Cliente (nome, cpf, telefone) VALUES (?, ?, ?)',
      [cliente.nome, cliente.cpf, cliente.telefone]
    );
    await conexao.query(
      'INSERT INTO Usuario (email, senha_hash, perfil, cliente_id, primeiro_acesso) VALUES (?, ?, ?, ?, TRUE)',
      [acesso.email, acesso.senhaHash, PERFIL.CLIENTE, resultado.insertId]
    );
    await conexao.commit();
    return resultado.insertId;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = { listar, buscarPorCpf, inserir };
