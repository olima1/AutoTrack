/**
 * Regras de negócio do Cliente (BP05).
 * Valida os dados recebidos do controller e usa os repositories para acessar o banco.
 */

const bcrypt = require('bcryptjs');
const clienteRepository = require('../repositories/cliente.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const veiculoRepository = require('../repositories/veiculo.repository');
const { ErroValidacao, ErroNegocio } = require('../erros');
const { cpfValido, emailValido, somenteDigitos } = require('../utils/validacoes');
const {
  CUSTO_BCRYPT,
  DIGITOS_TELEFONE,
  TAMANHO_MAXIMO_EMAIL,
  TAMANHO_MAXIMO_NOME_CLIENTE,
  TAMANHO_MINIMO_SENHA,
} = require('../constantes');

/** Campos que o formulário de cliente precisa preencher (RF007, fluxo alternativo 1). */
const CAMPOS_OBRIGATORIOS = ['nome', 'cpf', 'telefone', 'email', 'senha'];

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
  return veiculoRepository.listarPorCliente(clienteId);
}

/**
 * Verifica se todos os campos obrigatórios foram preenchidos (RF007, fluxo alternativo 1).
 *
 * @param {object} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando algum campo estiver vazio.
 */
function validarObrigatorios(dados) {
  const faltando = CAMPOS_OBRIGATORIOS.some((campo) => !String(dados[campo] ?? '').trim());
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
 * Valida os formatos das regras 1 a 4 do RF007 e os tamanhos das colunas.
 *
 * @param {{ nome: string, cpf: string, telefone: string, email: string, senha: string }} cliente Dados preparados.
 * @throws {ErroValidacao} Na primeira regra que não for atendida.
 */
function validarFormatos(cliente) {
  if (cliente.nome.length > TAMANHO_MAXIMO_NOME_CLIENTE) {
    throw new ErroValidacao(`O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME_CLIENTE} caracteres.`);
  }
  if (!cpfValido(cliente.cpf)) {
    throw new ErroValidacao('CPF inválido.');
  }
  if (!DIGITOS_TELEFONE.includes(cliente.telefone.length)) {
    throw new ErroValidacao('O telefone deve ter 10 ou 11 dígitos.');
  }
  if (!emailValido(cliente.email) || cliente.email.length > TAMANHO_MAXIMO_EMAIL) {
    throw new ErroValidacao('E-mail inválido.');
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

module.exports = { listar, listarVeiculos, cadastrar };
