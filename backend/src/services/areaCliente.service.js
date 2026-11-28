/**
 * Área do Cliente: dados que o Cliente logado pode ver (RF016).
 * O Cliente só consulta; não cadastra, altera nem exclui nada (regra 2).
 */

const clienteRepository = require('../repositories/cliente.repository');
const veiculoRepository = require('../repositories/veiculo.repository');
const ordemServicoRepository = require('../repositories/ordemServico.repository');
const { ErroNaoEncontrado } = require('../erros');
const { STATUS_ORDEM } = require('../constantes');

/**
 * Junta a cada ordem a lista dos seus serviços.
 *
 * @param {object[]} ordens Ordens do cliente.
 * @param {{ ordemId: number, nome: string, precoCobrado: string }[]} servicos Serviços de todas essas ordens.
 * @returns {object[]} Ordens com o campo servicos.
 */
function juntarServicos(ordens, servicos) {
  return ordens.map((ordem) => ({
    ...ordem,
    servicos: servicos
      .filter((servico) => servico.ordemId === ordem.id)
      .map(({ nome, precoCobrado }) => ({ nome, precoCobrado })),
  }));
}

/**
 * Busca o painel do Cliente logado: nome, veículos, ordens em andamento e histórico (RF016).
 * Ordens concluídas aparecem somente no histórico (regra 3).
 *
 * @param {number} clienteId Id do cliente que está no token (regra 1).
 * @returns {Promise<{ nome: string, veiculos: object[], emAndamento: object[], historico: object[] }>} Dados da área do cliente.
 * @throws {ErroNaoEncontrado} Quando o cliente do token não existir mais.
 */
async function buscarPainel(clienteId) {
  const [cliente, veiculos, ordens] = await Promise.all([
    clienteRepository.buscarPorId(clienteId),
    veiculoRepository.listarPorCliente(clienteId),
    ordemServicoRepository.buscarPorCliente(clienteId),
  ]);
  if (!cliente) {
    throw new ErroNaoEncontrado('Cliente não encontrado.');
  }
  const servicos = await ordemServicoRepository.buscarServicosDasOrdens(ordens.map((ordem) => ordem.id));
  const ordensCompletas = juntarServicos(ordens, servicos);
  return {
    nome: cliente.nome,
    veiculos,
    emAndamento: ordensCompletas.filter((ordem) => ordem.status !== STATUS_ORDEM.CONCLUIDA),
    historico: ordensCompletas.filter((ordem) => ordem.status === STATUS_ORDEM.CONCLUIDA),
  };
}

module.exports = { buscarPainel };
