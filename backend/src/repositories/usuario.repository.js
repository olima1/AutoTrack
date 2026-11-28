/**
 * Acesso à tabela Usuario no MySQL (BP05).
 */
const pool = require('../config/database');

/**
 * Busca um usuário pelo e-mail (RF001).
 *
 * @param {string} email E-mail de acesso.
 * @returns {Promise<object|null>} O usuário encontrado ou null se não existir.
 */
async function buscarPorEmail(email) {
  const [linhas] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
  return linhas[0] ?? null;
}

/**
 * Busca um usuário pelo id, para conferir a senha atual e o primeiro acesso (RF017).
 *
 * @param {number} id Id do usuário (vem do token).
 * @returns {Promise<object|null>} O usuário encontrado ou null se não existir.
 */
async function buscarPorId(id) {
  const [linhas] = await pool.query('SELECT * FROM Usuario WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

/**
 * Grava o hash da nova senha e registra que o primeiro acesso foi concluído (RF017, passo 5).
 *
 * @param {number} id Id do usuário.
 * @param {string} senhaHash Hash bcrypt da nova senha (regra 4, RNF006).
 * @returns {Promise<void>}
 */
async function atualizarSenha(id, senhaHash) {
  await pool.query('UPDATE Usuario SET senha_hash = ?, primeiro_acesso = FALSE WHERE id = ?', [senhaHash, id]);
}

module.exports = { buscarPorEmail, buscarPorId, atualizarSenha };