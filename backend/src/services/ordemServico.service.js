/**
 * Regras de negócio da Ordem de Serviço (BP05).
 * Valida os dados recebidos do controller e usa os repositories para acessar o banco.
 */

const ordemServicoRepository = require('../repositories/ordemServico.repository');
const veiculoRepository = require('../repositories/veiculo.repository');
const servicoRepository = require('../repositories/servico.repository');
const { ErroValidacao, ErroNegocio } = require('../erros');
const { TAMANHO_MAXIMO_OBSERVACOES_ORDEM } = require('../constantes');

/**
 * Verifica se o cliente e o veículo foram escolhidos (RF012, passo 12).
 *
 * @param {{ clienteId?: number, veiculoId?: number }} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando faltar o cliente ou o veículo.
 */
function validarIds(dados) {
  const semId = !dados.clienteId || !dados.veiculoId;
  if (semId) {
    throw new ErroValidacao('Preencha todos os campos obrigatórios.');
  }
}

/**
 * Verifica se ao menos um serviço foi selecionado (RF012, regra 2 e fluxo alternativo 2).
 *
 * @param {{ servicosIds?: number[] }} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando a lista de serviços não existir ou estiver vazia.
 */
function validarLista(dados) {
  const ehLista = Array.isArray(dados.servicosIds) && dados.servicosIds.length !== 0; // ← corrigido
  if (!ehLista) {
    throw new ErroValidacao('Selecione ao menos um serviço.');
  }
}

/**
 * Verifica o tamanho máximo das observações, que são opcionais (RF012).
 *
 * @param {{ observacoes?: string }} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando as observações passarem do tamanho máximo.
 */
function validarTamanho(dados) {
  const muitoLonga = dados.observacoes && dados.observacoes.trim().length > TAMANHO_MAXIMO_OBSERVACOES_ORDEM;
  if (muitoLonga) {
    throw new ErroValidacao(`A observação deve ter no máximo ${TAMANHO_MAXIMO_OBSERVACOES_ORDEM} caracteres.`);
  }
}

/**
 * Valida os dados do formulário da ordem de serviço antes de consultar o banco (RF012, passo 12).
 *
 * @param {{ clienteId?: number, veiculoId?: number, servicosIds?: number[], observacoes?: string }} [dados] Dados recebidos.
 * @throws {ErroValidacao} Quando algum dado for inválido.
 */
function validarDados(dados = {}) {
  validarIds(dados);
  validarLista(dados);
  validarTamanho(dados);
}

/**
 * Verifica se o veículo existe e pertence ao cliente escolhido (RF012, regra 1).
 *
 * @param {number|string} clienteId Id do cliente escolhido.
 * @param {number|string} veiculoId Id do veículo escolhido.
 * @throws {ErroNegocio} Quando o veículo não existir ou for de outro cliente.
 */
async function veiculoDoCliente(clienteId, veiculoId) { // ← corrigido
  const veiculo = await veiculoRepository.buscarPorId(veiculoId); // ← corrigido
  if (!veiculo) {
    throw new ErroNegocio('O veículo não existe.');
  }
  if (veiculo.clienteId !== Number(clienteId)) {
    throw new ErroNegocio('O veículo não pertence ao cliente.');
  }
}

/**
 * Verifica se o veículo já tem uma ordem de serviço não concluída (RF012, regra 3 e fluxo alternativo 3).
 *
 * @param {number|string} veiculoId Id do veículo escolhido.
 * @throws {ErroNegocio} Quando o veículo já tiver ordem aberta, em andamento ou aguardando peças.
 */
async function ordemServicoExistente(veiculoId) {
  const existeOrdem = await ordemServicoRepository.existeOrdemNaoConcluida(veiculoId);
  if (existeOrdem) {
    throw new ErroNegocio('Este veículo já possui uma ordem de serviço em andamento.');
  }
}

/**
 * Aplica as regras de negócio do veículo, consultando o banco (RF012, regras 1 e 3).
 *
 * @param {number|string} clienteId Id do cliente escolhido.
 * @param {number|string} veiculoId Id do veículo escolhido.
 * @returns {Promise<void>}
 * @throws {ErroNegocio} Quando alguma das regras não for atendida.
 */
async function validarVeiculo(clienteId, veiculoId) { // ← corrigido
  await veiculoDoCliente(clienteId, veiculoId); // ← corrigido
  await ordemServicoExistente(veiculoId); // ← corrigido
}

/**
 * Soma os preços dos serviços da ordem (RF012, regra 6).
 * Soma em centavos para evitar erro de arredondamento de números decimais.
 *
 * @param {{ preco: string|number }[]} servicos Serviços com o preço do catálogo.
 * @returns {number} Valor total em reais.
 */
function calcularValorTotal(servicos) {
  const totalEmCentavos = servicos.reduce(
    (soma, servico) => soma + Math.round(Number(servico.preco) * 100),
    0
  );
  return totalEmCentavos / 100;
}

/**
 * Abre uma ordem de serviço com status "Aberta" (RF012).
 *
 * @param {{ clienteId: number, veiculoId: number, servicosIds: number[], observacoes?: string }} dados Dados do formulário.
 * @returns {Promise<number>} Id da ordem de serviço criada.
 * @throws {ErroValidacao} Quando faltar cliente, veículo ou serviço, ou as observações forem longas demais.
 * @throws {ErroNegocio} Quando o veículo não for do cliente, já tiver ordem em andamento ou um serviço não existir.
 */
async function abrir(dados) {
  validarDados(dados);
  await validarVeiculo(dados.clienteId, dados.veiculoId);

  const idsSemRepeticao = [...new Set(dados.servicosIds.map(Number))];
  const servicos = await servicoRepository.buscarPorIds(idsSemRepeticao);
  if (servicos.length !== idsSemRepeticao.length) {
    throw new ErroNegocio('Um dos serviços selecionados não existe mais no catálogo.');
  }

  const ordem = {
    clienteId: Number(dados.clienteId),
    veiculoId: Number(dados.veiculoId),
    observacoes: dados.observacoes?.trim() || null,
    valorTotal: calcularValorTotal(servicos),
  };
  const itens = servicos.map((servico) => ({ servicoId: servico.id, precoCobrado: Number(servico.preco) }));

  return ordemServicoRepository.inserir(ordem, itens);
}

module.exports = { abrir, validarDados, calcularValorTotal };