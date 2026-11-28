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

/**
 * Troca a senha inicial do Cliente no primeiro acesso (RF017).
 * Responde 200 com o novo token e a mensagem da IS_SenhaAlterada.
 *
 * @param {import('express').Request} req Requisição autenticada com novaSenha e confirmacao no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function alterarSenhaInicial(req, res, next) {
  try {
    const resultado = await authService.alterarSenhaInicial(req.usuario.id, req.body);
    res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { login, alterarSenhaInicial };