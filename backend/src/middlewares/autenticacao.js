/**
 * Middlewares de autenticação e autorização (RF001, RNF007).
 */
const jwt = require('jsonwebtoken');
const { ErroNaoAutenticado, ErroAcessoNegado } = require('../erros');

/**
 * Exige um token JWT válido no cabeçalho Authorization ("Bearer <token>").
 * Guarda os dados do usuário em req.usuario para as próximas camadas.
 *
 * @param {import('express').Request} req Requisição HTTP.
 * @param {import('express').Response} _res Resposta HTTP (não usada).
 * @param {import('express').NextFunction} next Segue para a rota ou repassa o erro.
 * @returns {void}
 */
function verificarToken(req, _res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(new ErroNaoAutenticado('Faça login para continuar.'));
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new ErroNaoAutenticado('Sessão expirada. Faça login novamente.'));
  }
}

/**
 * Libera a rota só para os perfis informados. Usar depois do verificarToken.
 *
 * @param {...string} perfis Perfis permitidos (PERFIL.ADMINISTRADOR, PERFIL.CLIENTE).
 * @returns {import('express').RequestHandler} Middleware que responde 403 para os outros perfis.
 */
function permitirPerfis(...perfis) {
  return (req, _res, next) => {
    if (!perfis.includes(req.usuario.perfil)) {
      return next(new ErroAcessoNegado('Seu perfil não tem acesso a esta funcionalidade.'));
    }
    return next();
  };
}

module.exports = { verificarToken, permitirPerfis };