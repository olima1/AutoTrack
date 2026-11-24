/**
 * Controller do acesso ao sistema (BP05).
 */
const authService = require('../services/auth.service');

/**
 * Realiza o login (RF001).
 * Responde 200 com o token, o perfil e se é o primeiro acesso.
 *
 * @param {import('express').Request} req Requisição com e-mail e senha no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function login(req, res, next) {
  try {
    const sessao = await authService.login(req.body);
    res.status(200).json(sessao);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { login };