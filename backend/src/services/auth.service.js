/**
 * Regras de negócio do acesso ao sistema (RF001).
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');
const { ErroValidacao, ErroNaoAutenticado } = require('../erros');
const { TEMPO_SESSAO_MINUTOS } = require('../constantes');

/**
 * Verifica se o e-mail e a senha foram preenchidos (RF001, IE_LoginCamposVazios).
 *
 * @param {{ email?: string, senha?: string }} dados Dados recebidos do formulário de login.
 * @throws {ErroValidacao} Quando o e-mail ou a senha estiverem vazios.
 */
function validarCredenciais(dados = {}) {
  const { email, senha } = dados;
  const emailPreenchido = typeof email === 'string' && email.trim() !== '';
  const senhaPreenchida = typeof senha === 'string' && senha !== '';
  if (!emailPreenchido || !senhaPreenchida) {
    throw new ErroValidacao('Informe e-mail e senha.');
  }
}

/**
 * Gera o token JWT da sessão com o perfil do usuário (RF001), válido por 60 minutos (RNF007).
 *
 * @param {{ id: number, perfil: string, cliente_id: number|null }} usuario Usuário autenticado.
 * @returns {string} Token JWT.
 */
function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, perfil: usuario.perfil, clienteId: usuario.cliente_id },
    process.env.JWT_SECRET,
    { expiresIn: `${TEMPO_SESSAO_MINUTOS}m` },
  );
}

/**
 * Autentica o usuário pelo e-mail e senha e abre a sessão (RF001).
 * A mensagem de erro é a mesma para e-mail e senha incorretos (regra 2 do RF001).
 *
 * @param {{ email?: string, senha?: string }} dados Dados recebidos do formulário de login.
 * @returns {Promise<{ token: string, perfil: string, primeiroAcesso: boolean }>} Dados da sessão.
 * @throws {ErroValidacao} Quando o e-mail ou a senha estiverem vazios.
 * @throws {ErroNaoAutenticado} Quando o e-mail ou a senha estiverem incorretos.
 */
async function login(dados) {
  validarCredenciais(dados);
  const usuario = await usuarioRepository.buscarPorEmail(dados.email.trim());
  const senhaConfere = usuario !== null && (await bcrypt.compare(dados.senha, usuario.senha_hash));
  if (!senhaConfere) {
    throw new ErroNaoAutenticado('E-mail ou senha incorretos.');
  }
  return {
    token: gerarToken(usuario),
    perfil: usuario.perfil,
    primeiroAcesso: Boolean(usuario.primeiro_acesso),
  };
}

module.exports = { login };