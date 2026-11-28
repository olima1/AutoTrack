/**
 * Controller da área do Cliente (BP05).
 * Recebe a requisição HTTP, chama o service e monta a resposta.
 */

const areaClienteService = require('../services/areaCliente.service');

/**
 * Devolve o painel do Cliente logado: nome, veículos, ordens em andamento e histórico (RF016).
 * O id do cliente vem do token (req.usuario.clienteId), nunca da URL: assim um Cliente
 * não consegue ver as ordens de outro (regra 1).
 *
 * @param {import('express').Request} req Requisição autenticada (req.usuario preenchido pelo verificarToken).
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function buscarPainel(req, res, next) {
  try {
    const painel = await areaClienteService.buscarPainel(req.usuario.clienteId);
    res.status(200).json(painel);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { buscarPainel };
