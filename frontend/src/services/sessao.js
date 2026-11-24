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