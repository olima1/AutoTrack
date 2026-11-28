/**
 * Regras de negócio do acesso ao sistema (RF001) e da troca da senha inicial (RF017).
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');
const { ErroValidacao, ErroNaoAutenticado, ErroNegocio } = require('../erros');
const { CUSTO_BCRYPT, TAMANHO_MINIMO_SENHA, TEMPO_SESSAO_MINUTOS } = require('../constantes');

/** Mensagem da interface IE_SenhaFraca (RF017, fluxo alternativo 2). */
const MENSAGEM_SENHA_FRACA = 'Use no mínimo 8 caracteres, com letras e números, diferente da senha inicial.';

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
 * O token também diz se a senha inicial ainda precisa ser trocada (RF017, regra 1).
 *
 * @param {{ id: number, perfil: string, cliente_id: number|null, primeiro_acesso: number|boolean }} usuario Usuário autenticado.
 * @param {boolean} [primeiroAcesso] Pendência da troca de senha (por padrão, a que está no banco).
 * @returns {string} Token JWT.
 */
function gerarToken(usuario, primeiroAcesso = Boolean(usuario.primeiro_acesso)) {
  return jwt.sign(
    {
      id: usuario.id,
      perfil: usuario.perfil,
      clienteId: usuario.cliente_id,
      primeiroAcesso,
    },
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

/**
 * Verifica o preenchimento dos dois campos (RF017, passo 2 e fluxo alternativo 1).
 *
 * @param {{ novaSenha?: string, confirmacao?: string }} dados Dados recebidos do formulário.
 * @throws {ErroValidacao} Quando algum dos campos estiver vazio.
 */
function validarPreenchimento(dados) {
  if (!dados.novaSenha || !dados.confirmacao) {
    throw new ErroValidacao('Preencha todos os campos obrigatórios.');
  }
}

/**
 * Verifica a força da nova senha e a confirmação (RF017, passos 3 e 4, regras 2 e 3).
 *
 * @param {{ novaSenha: string, confirmacao: string }} dados Dados recebidos do formulário.
 * @param {string} senhaHashAtual Hash da senha inicial, para impedir repetir a mesma senha.
 * @returns {Promise<void>}
 * @throws {ErroValidacao} Quando a senha for fraca ou a confirmação não conferir.
 */
async function validarNovaSenha(dados, senhaHashAtual) {
  const { novaSenha, confirmacao } = dados;
  const forte = novaSenha.length >= TAMANHO_MINIMO_SENHA && /[A-Za-z]/.test(novaSenha) && /\d/.test(novaSenha);
  if (!forte || (await bcrypt.compare(novaSenha, senhaHashAtual))) {
    throw new ErroValidacao(MENSAGEM_SENHA_FRACA);
  }
  if (confirmacao !== novaSenha) {
    throw new ErroValidacao('A confirmação não confere com a nova senha.');
  }
}

/**
 * Troca a senha inicial do Cliente por uma senha própria no primeiro acesso (RF017).
 * Grava só o hash (regra 4) e devolve um token novo, já sem a pendência do primeiro acesso.
 *
 * @param {number} usuarioId Id do usuário logado (vem do token).
 * @param {{ novaSenha?: string, confirmacao?: string }} [dados] Dados do formulário.
 * @returns {Promise<{ token: string, mensagem: string }>} Novo token da sessão e a mensagem da IS_SenhaAlterada.
 * @throws {ErroValidacao} Quando faltar campo, a senha for fraca ou a confirmação não conferir.
 * @throws {ErroNegocio} Quando a senha inicial já tiver sido trocada.
 */
async function alterarSenhaInicial(usuarioId, dados = {}) {
  validarPreenchimento(dados);
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario || !usuario.primeiro_acesso) {
    throw new ErroNegocio('A senha inicial já foi alterada.');
  }
  await validarNovaSenha(dados, usuario.senha_hash);

  const senhaHash = await bcrypt.hash(dados.novaSenha, CUSTO_BCRYPT);
  await usuarioRepository.atualizarSenha(usuarioId, senhaHash);
  return {
    token: gerarToken(usuario, false),
    mensagem: 'Senha alterada com sucesso!',
  };
}

module.exports = { login, alterarSenhaInicial };