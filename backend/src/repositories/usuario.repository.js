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

module.exports = { buscarPorEmail };