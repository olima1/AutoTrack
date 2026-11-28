/**
 * Regras de negócio do Cliente (BP05).
 * Valida os dados recebidos do controller e usa os repositories para acessar o banco.
 */

const bcrypt = require('bcryptjs');
const clienteRepository = require('../repositories/cliente.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const veiculoRepository = require('../repositories/veiculo.repository');
const { ErroValidacao, ErroNegocio, ErroNaoEncontrado } = require('../erros');
const { cpfValido, emailValido, somenteDigitos } = require('../utils/validacoes');
const {
  CUSTO_BCRYPT,
  DIGITOS_TELEFONE,
  TAMANHO_MAXIMO_EMAIL,
  TAMANHO_MAXIMO_NOME_CLIENTE,
  TAMANHO_MINIMO_SENHA,
} = require('../constantes');

/** Campos que o formulário de cliente precisa preencher no cadastro (RF007, fluxo alternativo 1). */
const CAMPOS_OBRIGATORIOS = ['nome', 'cpf', 'telefone', 'email', 'senha'];

/** Campos obrigatórios na alteração: o CPF não muda (RF009, regra 1) e a senha não é alterada aqui. */
const CAMPOS_OBRIGATORIOS_ALTERACAO = ['nome', 'telefone'];

/**
 * Lista os clientes em ordem alfabética, com busca opcional por nome ou CPF (RF008).
 * Também alimenta a lista de clientes do formulário da ordem de serviço (RF012, passo 4).
 *
 * @param {string} [busca] Texto digitado no campo "Buscar".
 * @returns {Promise<object[]>} Clientes com nome, CPF, telefone e e-mail (lista vazia se nenhum).
 */
async function listar(busca) {
  return clienteRepository.listar((busca ?? '').trim());
}

/**
 * Lista os veículos de um cliente (RF012, passo 6).
 * Lista vazia indica cliente sem veículo (fluxo alternativo 1).
 *
 * @param {number|string} clienteId Id do cliente.
 * @returns {Promise<object[]>} Veículos do cliente, ordenados pela placa.
 */
async function listarVeiculos(clienteId) {
  return veiculoRepository.listarPorCliente(clienteId);
}

/**
 * Verifica se os campos obrigatórios foram preenchidos (RF007 e RF009, fluxo alternativo 1).
 *
 * @param {object} dados Dados recebidos do formulário.
 * @param {string[]} [campos] Campos a conferir (por padrão, os do cadastro).
 * @throws {ErroValidacao} Quando algum campo estiver vazio.
 */
function validarObrigatorios(dados, campos = CAMPOS_OBRIGATORIOS) {
  const faltando = campos.some((campo) => !String(dados[campo] ?? '').trim());
  if (faltando) {
    throw new ErroValidacao('Preencha todos os campos obrigatórios.');
  }
}

/**
 * Limpa os dados: tira espaços, deixa só os dígitos do CPF e do telefone e o e-mail em minúsculas.
 *
 * @param {object} dados Dados recebidos do formulário.
 * @returns {{ nome: string, cpf: string, telefone: string, email: string, senha: string }} Dados prontos para validar.
 */
function prepararCliente(dados) {
  return {
    nome: dados.nome.trim(),
    cpf: somenteDigitos(dados.cpf),
    telefone: somenteDigitos(dados.telefone),
    email: dados.email.trim().toLowerCase(),
    senha: String(dados.senha),
  };
}

/**
 * Valida nome, telefone e e-mail, regras comuns ao cadastro e à alteração
 * (RF007, regras 2 e 3; RF009, regra 3) e os tamanhos das colunas.
 *
 * @param {{ nome: string, telefone: string, email?: string|null }} cliente Dados preparados.
 * @throws {ErroValidacao} Na primeira regra que não for atendida.
 */
function validarContato(cliente) {
  if (cliente.nome.length > TAMANHO_MAXIMO_NOME_CLIENTE) {
    throw new ErroValidacao(`O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME_CLIENTE} caracteres.`);
  }
  if (!DIGITOS_TELEFONE.includes(cliente.telefone.length)) {
    throw new ErroValidacao('O telefone deve ter 10 ou 11 dígitos.');
  }
  const emailInformado = cliente.email !== null && cliente.email !== undefined;
  if (emailInformado && (!emailValido(cliente.email) || cliente.email.length > TAMANHO_MAXIMO_EMAIL)) {
    throw new ErroValidacao('E-mail inválido.');
  }
}

/**
 * Valida os formatos das regras 1 a 4 do RF007 (cadastro).
 *
 * @param {{ nome: string, cpf: string, telefone: string, email: string, senha: string }} cliente Dados preparados.
 * @throws {ErroValidacao} Na primeira regra que não for atendida.
 */
function validarFormatos(cliente) {
  validarContato(cliente);
  if (!cpfValido(cliente.cpf)) {
    throw new ErroValidacao('CPF inválido.');
  }
  if (cliente.senha.length < TAMANHO_MINIMO_SENHA) {
    throw new ErroValidacao(`A senha inicial deve ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`);
  }
}

/**
 * Impede CPF ou e-mail repetidos (RF007, regras 1 e 2 e fluxo alternativo 2).
 *
 * @param {string} cpf CPF só com números.
 * @param {string} email E-mail em minúsculas.
 * @throws {ErroNegocio} Quando já existir cliente com o CPF ou usuário com o e-mail.
 */
async function validarDuplicados(cpf, email) {
  const [clienteComCpf, usuarioComEmail] = await Promise.all([
    clienteRepository.buscarPorCpf(cpf),
    usuarioRepository.buscarPorEmail(email),
  ]);
  if (clienteComCpf || usuarioComEmail) {
    throw new ErroNegocio('Já existe um cliente com este CPF ou e-mail.');
  }
}

/**
 * Cadastra um cliente e o acesso dele ao sistema (RF007).
 * A senha inicial é gravada só como hash (regra 4 e RNF006) e o cliente
 * precisará trocá-la no primeiro login (regra 5, RF017).
 *
 * @param {{ nome: string, cpf: string, telefone: string, email: string, senha: string }} [dados] Dados do formulário.
 * @returns {Promise<number>} Id do cliente criado.
 * @throws {ErroValidacao} Quando faltar campo ou algum formato for inválido.
 * @throws {ErroNegocio} Quando o CPF ou o e-mail já estiverem cadastrados.
 */
async function cadastrar(dados = {}) {
  validarObrigatorios(dados);
  const cliente = prepararCliente(dados);
  validarFormatos(cliente);
  await validarDuplicados(cliente.cpf, cliente.email);

  const senhaHash = await bcrypt.hash(cliente.senha, CUSTO_BCRYPT);
  return clienteRepository.inserir(
    { nome: cliente.nome, cpf: cliente.cpf, telefone: cliente.telefone },
    { email: cliente.email, senhaHash }
  );
}

/**
 * Busca um cliente com o e-mail de acesso, para a tela de alteração (RF009, passo 2).
 *
 * @param {number|string} id Id do cliente.
 * @returns {Promise<object>} Cliente com nome, CPF, telefone e e-mail (null se não tiver acesso).
 * @throws {ErroNaoEncontrado} Quando o cliente não existir.
 */
async function buscarPorId(id) {
  const cliente = await clienteRepository.buscarPorId(id);
  if (!cliente) {
    throw new ErroNaoEncontrado('Cliente não encontrado.');
  }
  return cliente;
}

/**
 * Impede usar o e-mail de acesso de outro usuário (RF009, regra 2 e fluxo alternativo 2).
 * O próprio e-mail do cliente pode continuar o mesmo.
 *
 * @param {string} email E-mail novo, em minúsculas.
 * @param {number|string} clienteId Id do cliente que está sendo alterado.
 * @throws {ErroNegocio} Quando o e-mail já pertencer a outro usuário.
 */
async function validarEmailUnico(email, clienteId) {
  const usuarioComEmail = await usuarioRepository.buscarPorEmail(email);
  if (usuarioComEmail && usuarioComEmail.cliente_id !== Number(clienteId)) {
    throw new ErroNegocio('Já existe um cliente com este e-mail.');
  }
}

/**
 * Altera o nome, o telefone e o e-mail de acesso de um cliente (RF009).
 * O CPF não pode ser alterado (regra 1): mesmo que venha no corpo, é ignorado.
 * O e-mail só é obrigatório e alterado se o cliente tiver acesso ao sistema.
 *
 * @param {number|string} id Id do cliente.
 * @param {{ nome: string, telefone: string, email?: string }} [dados] Dados do formulário.
 * @returns {Promise<void>}
 * @throws {ErroValidacao} Quando faltar campo ou algum formato for inválido.
 * @throws {ErroNaoEncontrado} Quando o cliente não existir.
 * @throws {ErroNegocio} Quando o e-mail já pertencer a outro usuário.
 */
async function alterar(id, dados = {}) {
  const clienteAtual = await buscarPorId(id);
  const temAcesso = clienteAtual.email !== null;
  validarObrigatorios(dados, temAcesso ? [...CAMPOS_OBRIGATORIOS_ALTERACAO, 'email'] : CAMPOS_OBRIGATORIOS_ALTERACAO);

  const cliente = {
    nome: dados.nome.trim(),
    telefone: somenteDigitos(dados.telefone),
    email: temAcesso ? dados.email.trim().toLowerCase() : null,
  };
  validarContato(cliente);
  if (temAcesso) {
    await validarEmailUnico(cliente.email, id);
  }
  await clienteRepository.atualizar(id, cliente);
}

/**
 * Impede excluir cliente com veículo ou ordem de serviço (RF018, regras 1 e 2 e fluxo alternativo 2).
 *
 * @param {number|string} id Id do cliente.
 * @throws {ErroNegocio} Quando o cliente tiver pelo menos um veículo ou uma ordem de serviço.
 */
async function validarSemVinculos(id) {
  const { veiculos, ordens } = await clienteRepository.contarVinculos(id);
  if (veiculos > 0 || ordens > 0) {
    throw new ErroNegocio('Cliente com veículo ou ordem de serviço não pode ser excluído.');
  }
}

/**
 * Exclui um cliente e o acesso dele ao sistema (RF018).
 *
 * @param {number|string} id Id do cliente.
 * @returns {Promise<void>}
 * @throws {ErroNaoEncontrado} Quando o cliente não existir.
 * @throws {ErroNegocio} Quando o cliente tiver veículo ou ordem de serviço.
 */
async function excluir(id) {
  await buscarPorId(id);
  await validarSemVinculos(id);
  await clienteRepository.excluir(id);
}

module.exports = {
  listar,
  listarVeiculos,
  cadastrar,
  buscarPorId,
  alterar,
  excluir,
};
