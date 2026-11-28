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

/**
 * Busca um veículo pela placa, para impedir placa duplicada (RF010, regra 1).
 *
 * @param {string} placa Placa em maiúsculas.
 * @returns {Promise<{ id: number }|null>} O veículo encontrado ou null se não existir.
 */
async function buscarPorPlaca(placa) {
  const [linhas] = await pool.query('SELECT id FROM Veiculo WHERE placa = ?', [placa]);
  return linhas[0] ?? null;
}

/**
 * Grava um novo veículo vinculado ao cliente (RF010, passo 9).
 *
 * @param {{ placa: string, marca: string, modelo: string, ano: number, quilometragem: number, clienteId: number }} veiculo Dados do veículo.
 * @returns {Promise<number>} Id do veículo criado.
 */
async function inserir(veiculo) {
  const [resultado] = await pool.query(
    'INSERT INTO Veiculo (placa, marca, modelo, ano, quilometragem, cliente_id) VALUES (?, ?, ?, ?, ?, ?)',
    [veiculo.placa, veiculo.marca, veiculo.modelo, veiculo.ano, veiculo.quilometragem, veiculo.clienteId]
  );
  return resultado.insertId;
}

module.exports = { buscarPorId, listarPorCliente, buscarPorPlaca, inserir };