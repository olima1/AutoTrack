/**
 * Acesso à tabela Veiculo no MySQL (BP05).
 * Só executa SQL e devolve os dados; as regras de negócio ficam no ordemServico.service.js.
 */

const pool = require('../config/database');

/**
 * Busca um veículo pelo id (RF012).
 *
 * @param {number|string} id Id do veículo.
 * @returns {Promise<object|null>} O veículo encontrado ou null se não existir (vem com clienteId).
 */
async function buscarPorId(id) {
  const [linhas] = await pool.query(
    'SELECT id, placa, marca, modelo, cliente_id AS clienteId FROM Veiculo WHERE id = ?',
    [id]
  );
  return linhas[0] ?? null;
}

/**
 * Lista dos veículos por cliente (RF012).
 *
 * @param {number|string} clienteId Id do cliente.
 * @returns {Promise<object|[]>} Lista de veículos vinculados ao Id do cliente ordenados pela placa(lista vázia se o cliente não tiver nenhum veículo).
 */
async function listarPorCliente(clienteId) {
  const [linhas] = await pool.query(
    'SELECT id, placa, marca, modelo FROM Veiculo WHERE cliente_id = ? ORDER BY placa',
    [clienteId]
  );
  return linhas;
}

module.exports = { buscarPorId, listarPorCliente };