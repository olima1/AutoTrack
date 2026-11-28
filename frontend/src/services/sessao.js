/**
 * Sessão do usuário no navegador (RF001, RF002).
 * O token fica no localStorage para continuar logado ao recarregar a página.
 */

const CHAVE_TOKEN = 'autotrack.token';
const CHAVE_PERFIL = 'autotrack.perfil';

/**
 * Guarda o token e o perfil recebidos no login.
 *
 * @param {string} token Token JWT devolvido pela API.
 * @param {string} perfil 'ADMINISTRADOR' ou 'CLIENTE'.
 * @returns {void}
 */
export function salvarSessao(token, perfil) {
  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(CHAVE_PERFIL, perfil);
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
 * Apaga a sessão (logout ou token expirado).
 *
 * @returns {void}
 */
export function encerrarSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_PERFIL);
}

/** Tela inicial de cada perfil depois do login. */
const ROTA_INICIAL = Object.freeze({
  ADMINISTRADOR: '/ordens-servico',
  CLIENTE: '/cliente',
});

/**
 * Tela para onde o usuário vai depois do login, conforme o perfil (RF001).
 *
 * @param {string|null} perfil 'ADMINISTRADOR' ou 'CLIENTE'.
 * @returns {string} Caminho da tela inicial (o login, se o perfil for desconhecido).
 */
export function rotaInicial(perfil) {
  return ROTA_INICIAL[perfil] ?? '/login';
}
