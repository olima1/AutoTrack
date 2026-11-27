/**
 * Consultas de Cliente usadas pelo formulário da ordem de serviço (BP05).
 * Não há regra de negócio aqui por enquanto: o service só repassa para os repositories,
 * mantendo o controller sem acesso direto ao banco.
 */

const clienteRepository = require('../repositories/cliente.repository');
const veiculoRepository = require('../repositories/veiculo.repository');

/**
 * Lista os clientes cadastrados (RF012, passo 4).
 *
 * @returns {Promise<object[]>} Clientes em ordem alfabética.
 */
async function listar() {
  return clienteRepository.listar();
}

/**
 * Lista os veículos de um cliente (RF012, passo 6).
 * Lista vazia indica cliente sem veículo (fluxo alternativo 1).
 *
 * @param {number|string} clienteId Id do cliente.
 * @returns {Promise<object[]>} Veículos do cliente, ordenados pela placa.
 */
async function listarVeiculos(clienteId) {
  const linhas = await veiculoRepository.listarPorCliente(clienteId);
  return linhas;
}

module.exports = { listar, listarVeiculos };