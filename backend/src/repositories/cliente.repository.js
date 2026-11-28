/**
 * Acesso às tabelas Cliente e Usuario (acesso do cliente) no MySQL (BP05).
 * Só executa SQL e devolve os dados; quem usa é o cliente.service.js.
 */

const pool = require('../config/database');
const { PERFIL } = require('../constantes');
const { somenteDigitos } = require('../utils/validacoes');

/**
 * Monta o WHERE da busca de clientes: nome contendo o texto ou CPF contendo os dígitos digitados.
 * O CPF só entra se o texto tiver algum dígito; sem isso, "cpf LIKE '%%'" encontraria todos.
 *
 * @param {string} texto Texto da busca, já sem espaços nas pontas.
 * @returns {{ where: string, valores: string[] }} Trecho do SQL e os valores dos ?.
 */
function montarBusca(texto) {
  if (!texto) {
    return { where: '', valores: [] };
  }
  const condicoes = ['c.nome LIKE ?'];
  const valores = [`%${texto}%`];
  const digitos = somenteDigitos(texto);
  if (digitos) {
    condicoes.push('c.cpf LIKE ?');
    valores.push(`%${digitos}%`);
  }
  return { where: `WHERE ${condicoes.join(' OR ')}`, valores };
}

/**
 * Lista os clientes em ordem alfabética com telefone e e-mail de acesso, filtrando pelo nome
 * ou pelo CPF (RF008). Sem texto, devolve todos (usado também no formulário da ordem de serviço).
 * O LEFT JOIN mantém na lista os clientes que ainda não têm acesso (email vem null).
 *
 * @param {string} [texto] Parte do nome ou do CPF.
 * @returns {Promise<{ id: number, nome: string, cpf: string, telefone: string, email: string|null }[]>} Clientes encontrados.
 */
async function listar(texto = '') {
  const { where, valores } = montarBusca(texto);
  const [linhas] = await pool.query(
    `SELECT c.id, c.nome, c.cpf, c.telefone, u.email
     FROM Cliente c
     LEFT JOIN Usuario u ON u.cliente_id = c.id
     ${where}
     ORDER BY c.nome`,
    valores
  );
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
