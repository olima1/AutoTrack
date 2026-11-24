/** 
 * Regras de negócio do Serviço (BP05).
 * Valida os dados recebidos do controller e usa o repository para acessar o banco.
 */
const servicoRepository = require('../repositories/servico.repository');
const { ErroValidacao, ErroNegocio, ErroNaoEncontrado } = require('../erros');
const { TAMANHO_MAXIMO_NOME_SERVICO, TAMANHO_MAXIMO_DESCRICAO_SERVICO } = require('../constantes');

/** Preço com no máximo duas casas decimais, como 150, 150.5 ou 150.50. */
const FORMATO_PRECO = /^\d+(\.\d{1,2})?$/;

/**
 * Verifica se os campos obrigatórios (nome e preço) foram preenchidos (RF003).
 *
 * @param {{ nome?: string, preco?: number|string }} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando o nome ou o preço estiverem vazios.
 */
function validarObrigatorios(dados) {
  const precoVazio = dados.preco === undefined || dados.preco === null || dados.preco === '';
  if (!dados.nome?.trim() || precoVazio) {
    throw new ErroValidacao('Preencha todos os campos obrigatórios.');
  }
}

/**
 * Verifica os tamanhos máximos do nome e da descrição (RF003, regra 2).
 *
 * @param {{ nome: string, descricao?: string }} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando o nome ou a descrição passarem do tamanho máximo.
 */
function validarTamanhos(dados) {
  if (dados.nome.trim().length > TAMANHO_MAXIMO_NOME_SERVICO) {
    throw new ErroValidacao('O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME_SERVICO} caracteres.');
  }
  if (dados.descricao && dados.descricao.trim().length > TAMANHO_MAXIMO_DESCRICAO_SERVICO) {
    throw new ErroValidacao('A descrição deve ter no máximo ${TAMANHO_MAXIMO_DESCRICAO_SERVICO} caracteres.');
  }
}

/**
 * Verifica se o preço é um número maior que zero com no máximo duas casas decimais (RF003, regra 3).
 *
 * @param {number|string} preco Preço recebido do formulário.
 * @throws {ErroValidacao} Quando o preço for inválido.
 */
function validarPreco(preco) {
  const valor = Number(preco);
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new ErroValidacao('O preço deve ser maior que R$ 0,00');
  }
  if (!FORMATO_PRECO.test(String(preco))) {
    throw new ErroValidacao('O preço deve ter no máximo duas casas decimais.');
  }
}

/**
 * Valida todos os dados de um serviço antes de gravar.
 * Os campos obrigatórios são verificados primeiro, porque as outras validações dependem deles.
 *
 * @param {{ nome?: string, descricao?: string, preco?: number|string }} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando algum dado for inválido.
 */
function validarDados(dados = {}) {
  validarObrigatorios(dados);
  validarPreco(dados.preco);
  validarTamanhos(dados);
}

/**
 * Monta o serviço com os dados já tratados: sem espaços sobrando,
 * descrição vazia como null e preço como número.
 *
 * @param {{ nome: string, descricao?: string, preco: number|string }} dados Dados já validados.
 * @returns {{ nome: string, descricao: string|null, preco: number }} Serviço pronto para gravar.
 */
function prepararServico(dados) {
  return {
    nome: dados.nome.trim(),
    descricao: dados.descricao?.trim() || null,
    preco: Number(dados.preco),
  };
}

/**
 * Cadastra um serviço no catálogo da oficina (RF003).
 *
 * @param {{ nome?: string, descricao?: string, preco?: number|string }} dados Dados recebidos do formulário.
 * @returns {Promise<number>} Id do serviço criado.
 * @throws {ErroValidacao} Quando algum dado for inválido.
 * @throws {ErroNegocio} Quando já existir um serviço com o mesmo nome.
 */
async function cadastrar(dados) {
  validarDados(dados);
  const servico = prepararServico(dados);
  const servicoExistente = await servicoRepository.buscarPorNome(servico.nome);
  if (servicoExistente != null) {
    throw new ErroNegocio('Já existe um serviço com este nome.');
  }
  return servicoRepository.inserir(servico);
}

/**
 * Lista os serviços do catálogo, filtrando pelo trecho do nome (RF004).
 *
 * @param {string} [texto] Trecho do nome digitado na pesquisa (opcional).
 * @returns {Promise<object[]>} Serviços encontrados (lista vazia se nenhum).
 */
async function listar(texto) {
  const busca = (texto ?? '').trim();
  const servicos = await servicoRepository.buscarPorTrechoDoNome(busca);
  return servicos;
}

/**
 * Busca um serviço pelo id; usado para preencher o formulário de alteração (RF005).
 *
 * @param {number|string} id Id do serviço.
 * @returns {Promise<object>} O serviço encontrado.
 * @throws {ErroNaoEncontrado} Quando não existir serviço com esse id.
 */
async function buscarPorId(id) {
  const servico = await servicoRepository.buscarPorId(id);
  if (!servico) {
    throw new ErroNaoEncontrado('Serviço não encontrado.');
  }
  return servico;
}

/**
 * Altera um serviço do catálogo (RF005).
 * O nome continua único: só é duplicado se pertencer a outro serviço.
 *
 * @param {number|string} id Id do serviço a alterar.
 * @param {{ nome?: string, descricao?: string, preco?: number|string }} dados Dados recebidos do formulário.
 * @returns {Promise<void>}
 * @throws {ErroValidacao} Quando algum dado for inválido.
 * @throws {ErroNaoEncontrado} Quando não existir serviço com esse id.
 * @throws {ErroNegocio} Quando o nome já pertencer a outro serviço.
 */
async function alterar(id, dados) {
  validarDados(dados);
  const servico = prepararServico(dados);

  buscarPorId(id);

  const servicoExistente = await servicoRepository.buscarPorNome(servico.nome);
  if (servicoExistente && servicoExistente.id !== Number(id)) {
    throw new ErroNegocio('Serviço não encontrado.')
  }
  await servicoRepository.atualizar(id, servico);
}

/**
 * Exclui um serviço do catálogo, se ele nunca foi usado em uma ordem de serviço (RF006).
 *
 * @param {number|string} id Id do serviço.
 * @returns {Promise<void>}
 * @throws {ErroNaoEncontrado} Quando não existir serviço com esse id.
 * @throws {ErroNegocio} Quando o serviço estiver vinculado a uma ordem de serviço.
 */
async function excluir(id) {
  await buscarPorId(id);
  if (await servicoRepository.estaEmUso(id)) {
    throw new ErroNegocio('Serviço vinculado a ordens de serviço não pode ser excluído.');
  }
  await servicoRepository.excluir(id);
}

module.exports = { cadastrar, validarDados, listar, buscarPorId, alterar, excluir };