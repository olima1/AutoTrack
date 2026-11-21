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

/**
 * Busca os serviços cujo nome contém o texto, sem diferenciar maiúsculas de minúsculas (RF004).
 * Com texto vazio, devolve todos os serviços.
 *
 * @param {string} texto Trecho do nome a procurar.
 * @returns {Promise<object[]>} Serviços encontrados, em ordem alfabética (lista vazia se nenhum).
 */
async function buscarPorTrechoDoNome(texto) {
  const [linhas] = await pool.query(
    'SELECT * FROM Servico WHERE LOWER(nome) LIKE LOWER(?) ORDER BY nome',
    ['%' + texto + '%']
  );
  return linhas;
}

/**
 * Busca um serviço pelo id (RF005).
 *
 * @param {number|string} id Id do serviço.
 * @returns {Promise<object|null>} O serviço encontrado ou null se não existir.
 */
async function buscarPorId(id) {
  const [linhas] = await pool.query(
    'SELECT * FROM Servico WHERE id = ?',
    [id]
  );
  return linhas[0] ?? null;
}

/**
 * Atualiza o nome, a descrição e o preço de um serviço (RF005).
 * Não altera o preço já copiado para as ordens de serviço abertas (ServicoDaOrdem).
 *
 * @param {number|string} id Id do serviço.
 * @param {{ nome: string, descricao: string|null, preco: number }} servico Dados novos do serviço.
 * @returns {Promise<void>}
 */
async function atualizar(id, servico) {
  await pool.query(
    'UPDATE Servico SET nome = ?, descricao = ?, preco = ? WHERE id = ?',
    [servico.nome, servico.descricao, servico.preco, id]
  );
}

module.exports = { buscarPorNome, inserir, buscarPorTrechoDoNome, buscarPorId, atualizar };