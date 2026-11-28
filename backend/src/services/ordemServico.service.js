/**
 * Regras de negócio da Ordem de Serviço (BP05).
 * Valida os dados recebidos do controller e usa os repositories para acessar o banco.
 */

const ordemServicoRepository = require('../repositories/ordemServico.repository');
const veiculoRepository = require('../repositories/veiculo.repository');
const servicoRepository = require('../repositories/servico.repository');
const { ErroValidacao, ErroNegocio, ErroNaoEncontrado } = require('../erros');
const { TAMANHO_MAXIMO_OBSERVACOES_ORDEM, STATUS_ORDEM, TRANSICOES_STATUS } = require('../constantes');


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
 * Soma os preços dos serviços da ordem (RF012 e RF014, regra 6).
 * Soma em centavos para evitar erro de arredondamento de números decimais.
 *
 * @param {{ precoCobrado: string|number }[]} itens Serviços da ordem com o preço cobrado.
 * @returns {number} Valor total em reais.
 */
function calcularValorTotal(itens) {
  const totalEmCentavos = itens.reduce(
    (soma, item) => soma + Math.round(Number(item.precoCobrado) * 100),
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

  const itens = servicos.map((servico) => ({ servicoId: servico.id, precoCobrado: Number(servico.preco) }));
  const ordem = {
    clienteId: Number(dados.clienteId),
    veiculoId: Number(dados.veiculoId),
    observacoes: dados.observacoes?.trim() || null,
    valorTotal: calcularValorTotal(itens),
  };

  return ordemServicoRepository.inserir(ordem, itens);
}

/**
 * Lista as ordens de serviço com filtros opcionais (RF013).
 * Limpa os textos e confere se o status pedido existe antes de consultar o banco.
 *
 * @param {{ status?: string, placa?: string, cliente?: string }} [filtros] Filtros vindos da URL (req.query).
 * @returns {Promise<object[]>} Ordens encontradas, da mais recente para a mais antiga.
 * @throws {ErroValidacao} Quando o status não for um dos 4 status da ordem de serviço.
 */
async function listar(filtros = {}) {
  const status = (filtros.status ?? '').trim();
  const placa = (filtros.placa ?? '').trim();
  const cliente = (filtros.cliente ?? '').trim();

  if (status && !Object.values(STATUS_ORDEM).includes(status)) {
    throw new ErroValidacao('Status inválido.');
  }

  return ordemServicoRepository.buscarComFiltros({ status, placa, cliente });
}

/**
 * Impede alterar uma ordem de serviço já concluída (RF014, regra 3 e fluxo alternativo 1).
 *
 * @param {{ status: string }} ordem Ordem como está no banco.
 * @throws {ErroNegocio} Quando a ordem estiver concluída.
 */
function podeSerAlterada(ordem) {
  if (ordem.status === STATUS_ORDEM.CONCLUIDA) {
    throw new ErroNegocio('Ordem de serviço concluída não pode ser alterada.');
  }
}

/**
 * Confere se a mudança de status é permitida (RF014, regras 1 e 2 e fluxo alternativo 3).
 * Manter o mesmo status é sempre permitido (só serviços ou observações mudaram).
 *
 * @param {string} atual Status atual da ordem.
 * @param {string} novo Status escolhido no formulário.
 * @throws {ErroValidacao} Quando o status novo não existir.
 * @throws {ErroNegocio} Quando a mudança não estiver em TRANSICOES_STATUS.
 */
function validarTransicaoStatus(atual, novo) {
  if (!Object.values(STATUS_ORDEM).includes(novo)) {
    throw new ErroValidacao('Status inválido.');
  }
  if (novo !== atual && !TRANSICOES_STATUS[atual].includes(novo)) {
    throw new ErroNegocio('Mudança de status não permitida.');
  }
}

/**
 * Monta os serviços da ordem depois da alteração (RF014, regra 5).
 * Os serviços que já estavam na ordem mantêm o preço da abertura;
 * os adicionados agora usam o preço vigente do catálogo.
 *
 * @param {number|string} id Id da ordem de serviço.
 * @param {number[]} servicosIds Ids de todos os serviços marcados no formulário.
 * @returns {Promise<{ itens: object[], itensNovos: object[], idsMarcados: number[] }>} Itens finais, só os novos e os ids marcados.
 * @throws {ErroNegocio} Quando um serviço novo não existir mais no catálogo.
 */
async function montarItens(id, servicosIds) {
  // Vai para o DELETE no repository
  const idsMarcados = [...new Set(servicosIds.map(Number))];
  const servicosAtuais = await ordemServicoRepository.buscarServicosDaOrdem(id);
  const idsAtuais = servicosAtuais.map((item) => item.servicoId);

  // Vem de serviço da ordem com o preço antigo.
  const itensMantidos = servicosAtuais.filter((item) => idsMarcados.includes(item.servicoId));
  const idsNovos = idsMarcados.filter((servicoId) => !idsAtuais.includes(servicoId));

  const servicosNovos = idsNovos.length > 0 ? await servicoRepository.buscarPorIds(idsNovos) : [];
  if (servicosNovos.length !== idsNovos.length) {
    throw new ErroNegocio('Um dos serviços selecionados não existe mais no catálogo.');
  }

  // Vem do catálogo com o preço atual.
  const itensNovos = servicosNovos.map((servico) => ({ servicoId: servico.id, precoCobrado: Number(servico.preco) }));

  return { itens: [...itensMantidos, ...itensNovos], itensNovos, idsMarcados };
}

/**
 * Altera o status, as observações e os serviços de uma ordem de serviço (RF014).
 * Cliente e veículo não mudam depois da abertura (regra 4).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @param {{ status: string, servicosIds: number[], observacoes?: string }} [dados] Dados do formulário.
 * @returns {Promise<void>}
 * @throws {ErroValidacao} Quando faltar serviço, as observações forem longas ou o status não existir.
 * @throws {ErroNaoEncontrado} Quando a ordem não existir.
 * @throws {ErroNegocio} Quando a ordem estiver concluída, a mudança de status não for permitida ou um serviço não existir.
 */
async function alterar(id, dados) {
  validarLista(dados);
  validarTamanho(dados);
  const ordem = await ordemServicoRepository.buscarPorId(id);
  if (!ordem) {
    throw new ErroNaoEncontrado('Ordem de serviço não encontrada.')
  }
  podeSerAlterada(ordem);
  validarTransicaoStatus(ordem.status, dados.status);
  const { itens, itensNovos, idsMarcados } = await montarItens(id, dados.servicosIds);
  const ordemAtualizada = {
    status: dados.status,
    observacoes: dados.observacoes?.trim() || null,
    valorTotal: calcularValorTotal(itens),
  };
  await ordemServicoRepository.atualizar(id, ordemAtualizada, { itensNovos, servicosIds: idsMarcados });
}

/**
 * Busca uma ordem de serviço com os seus serviços, para a tela de edição (RF014, passo 2).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @returns {Promise<object>} A ordem com cliente, veículo e a lista de serviços com o preço cobrado.
 * @throws {ErroNaoEncontrado} Quando a ordem não existir.
 */
async function buscarPorId(id) {
  const ordem = await ordemServicoRepository.buscarPorId(id);
  if (!ordem) {
    throw new ErroNaoEncontrado('Ordem de serviço não encontrada.');
  }
  const servicos = await ordemServicoRepository.buscarServicosDaOrdem(id);
  return { ...ordem, servicos };
}

/**
 * Permite excluir só a ordem que ainda não foi iniciada (RF015, regra 1 e fluxo alternativo 2).
 *
 * @param {{ status: string }} ordem Ordem como está no banco.
 * @throws {ErroNegocio} Quando o status for diferente de "Aberta".
 */
function podeSerExcluida(ordem) {
  if (ordem.status !== STATUS_ORDEM.ABERTA) {
    throw new ErroNegocio('Somente ordens de serviço com status Aberta podem ser excluídas.');
  }
}

/**
 * Exclui uma ordem de serviço aberta por engano, junto com os seus serviços (RF015).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @returns {Promise<void>}
 * @throws {ErroNaoEncontrado} Quando a ordem não existir.
 * @throws {ErroNegocio} Quando a ordem já tiver sido iniciada (status diferente de "Aberta").
 */
async function excluir(id) {
  const ordem = await ordemServicoRepository.buscarPorId(id);
  if (!ordem) {
    throw new ErroNaoEncontrado('Ordem de serviço não encontrada.');
  }
  podeSerExcluida(ordem);
  await ordemServicoRepository.excluir(id);
}

module.exports = {
  abrir,
  listar,
  buscarPorId,
  alterar,
  excluir,
  validarDados,
  calcularValorTotal,
  validarTransicaoStatus,
  podeSerExcluida,
};