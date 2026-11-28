/**
 * Regras de negócio do Veículo (BP05).
 * Valida os dados recebidos do controller e usa os repositories para acessar o banco.
 */

const veiculoRepository = require('../repositories/veiculo.repository');
const clienteRepository = require('../repositories/cliente.repository');
const { ErroValidacao, ErroNegocio } = require('../erros');
const { placaValida } = require('../utils/validacoes');
const { ANO_MINIMO_VEICULO, TAMANHO_MAXIMO_MARCA, TAMANHO_MAXIMO_MODELO } = require('../constantes');

/** Campos que o formulário de veículo precisa preencher (RF010, fluxo alternativo 1). */
const CAMPOS_OBRIGATORIOS = ['clienteId', 'placa', 'marca', 'modelo', 'ano'];

/**
 * Verifica se os campos obrigatórios foram preenchidos (RF010, fluxo alternativo 1).
 * A quilometragem é opcional: vazia, vale 0 (o DEFAULT da tabela).
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
 * Limpa os dados: placa em maiúsculas sem espaços, textos sem espaços nas pontas e números convertidos.
 *
 * @param {object} dados Dados recebidos do formulário.
 * @returns {{ placa: string, marca: string, modelo: string, ano: number, quilometragem: number, clienteId: number }} Veículo pronto para validar.
 */
function prepararVeiculo(dados) {
  const quilometragem = String(dados.quilometragem ?? '').trim();
  return {
    placa: String(dados.placa).replace(/\s/g, '').toUpperCase(),
    marca: String(dados.marca).trim(),
    modelo: String(dados.modelo).trim(),
    ano: Number(dados.ano),
    quilometragem: quilometragem === '' ? 0 : Number(quilometragem),
    clienteId: Number(dados.clienteId),
  };
}

/**
 * Valida as regras 1 a 3 do RF010 e os tamanhos das colunas.
 *
 * @param {{ placa: string, marca: string, modelo: string, ano: number, quilometragem: number }} veiculo Dados preparados.
 * @throws {ErroValidacao} Na primeira regra que não for atendida.
 */
function validarFormatos(veiculo) {
  if (!placaValida(veiculo.placa)) {
    throw new ErroValidacao('A placa deve seguir o formato AAA0A00 ou AAA-0000.');
  }
  if (veiculo.marca.length > TAMANHO_MAXIMO_MARCA || veiculo.modelo.length > TAMANHO_MAXIMO_MODELO) {
    throw new ErroValidacao(`A marca deve ter no máximo ${TAMANHO_MAXIMO_MARCA} e o modelo ${TAMANHO_MAXIMO_MODELO} caracteres.`);
  }
  const anoMaximo = new Date().getFullYear() + 1;
  if (!Number.isInteger(veiculo.ano) || veiculo.ano < ANO_MINIMO_VEICULO || veiculo.ano > anoMaximo) {
    throw new ErroValidacao(`O ano deve estar entre ${ANO_MINIMO_VEICULO} e ${anoMaximo}.`);
  }
  if (!Number.isInteger(veiculo.quilometragem) || veiculo.quilometragem < 0) {
    throw new ErroValidacao('A quilometragem deve ser um número inteiro maior ou igual a zero.');
  }
}

/**
 * Aplica as regras que consultam o banco: o cliente existe (regra 4) e a placa é única (regra 1).
 *
 * @param {{ placa: string, clienteId: number }} veiculo Dados preparados.
 * @throws {ErroNegocio} Quando o cliente não existir ou a placa já estiver cadastrada.
 */
async function validarRegrasNegocio(veiculo) {
  const [cliente, veiculoComPlaca] = await Promise.all([
    clienteRepository.buscarPorId(veiculo.clienteId),
    veiculoRepository.buscarPorPlaca(veiculo.placa),
  ]);
  if (!cliente) {
    throw new ErroNegocio('O cliente selecionado não existe.');
  }
  if (veiculoComPlaca) {
    throw new ErroNegocio('Já existe um veículo com esta placa.');
  }
}

/**
 * Cadastra um veículo vinculado a um cliente (RF010).
 *
 * @param {{ clienteId: number, placa: string, marca: string, modelo: string, ano: number, quilometragem?: number }} [dados] Dados do formulário.
 * @returns {Promise<number>} Id do veículo criado.
 * @throws {ErroValidacao} Quando faltar campo ou algum formato for inválido.
 * @throws {ErroNegocio} Quando o cliente não existir ou a placa já estiver cadastrada.
 */
async function cadastrar(dados = {}) {
  validarObrigatorios(dados);
  const veiculo = prepararVeiculo(dados);
  validarFormatos(veiculo);
  await validarRegrasNegocio(veiculo);
  return veiculoRepository.inserir(veiculo);
}

module.exports = { cadastrar };
