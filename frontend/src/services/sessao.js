/**
 * Sessão do usuário no navegador (RF001, RF002 e RF017).
 * O token fica no localStorage para continuar logado ao recarregar a página.
 */

const CHAVE_TOKEN = 'autotrack.token';
const CHAVE_PERFIL = 'autotrack.perfil';
const CHAVE_PRIMEIRO_ACESSO = 'autotrack.primeiroAcesso';

/**
 * Guarda o token, o perfil e se a senha inicial ainda precisa ser trocada.
 *
 * @param {string} token Token JWT devolvido pela API.
 * @param {string} perfil 'ADMINISTRADOR' ou 'CLIENTE'.
 * @param {boolean} [primeiroAcesso] true enquanto o Cliente não trocar a senha inicial (RF017).
 * @returns {void}
 */
export function salvarSessao(token, perfil, primeiroAcesso = false) {
  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(CHAVE_PERFIL, perfil);
  localStorage.setItem(CHAVE_PRIMEIRO_ACESSO, String(primeiroAcesso));
}

/**
 * @returns {string|null} Token salvo, ou null se ninguém estiver logado.
 */
export function lerToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

/**
 * @returns {string|null} Perfil do usuário logado.
 */
export function lerPerfil() {
  return localStorage.getItem(CHAVE_PERFIL);
}

/**
 * @returns {boolean} true se o usuário ainda precisa trocar a senha inicial (RF017, regra 1).
 */
export function lerPrimeiroAcesso() {
  return localStorage.getItem(CHAVE_PRIMEIRO_ACESSO) === 'true';
}

/**
 * Apaga a sessão (logout ou token expirado).
 *
 * @returns {void}
 */
export function encerrarSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_PERFIL);
  localStorage.removeItem(CHAVE_PRIMEIRO_ACESSO);
}

/** Tela inicial de cada perfil depois do login. */
const ROTA_INICIAL = Object.freeze({
  ADMINISTRADOR: '/ordens-servico',
  CLIENTE: '/cliente',
});

/**
 * Tela para onde o usuário vai depois do login, conforme o perfil (RF001).
 * O Cliente que ainda não trocou a senha inicial vai para I_PrimeiroAcesso (RF017).
 *
 * @param {string|null} perfil 'ADMINISTRADOR' ou 'CLIENTE'.
 * @param {boolean} [primeiroAcesso] true se a senha inicial ainda não foi trocada.
 * @returns {string} Caminho da tela inicial (o login, se o perfil for desconhecido).
 */
export function rotaInicial(perfil, primeiroAcesso = false) {
  if (perfil === 'CLIENTE' && primeiroAcesso) return '/primeiro-acesso';
  return ROTA_INICIAL[perfil] ?? '/login';
}
