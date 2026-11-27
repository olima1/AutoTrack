
const ordemServicoService = require('../services/ordemServico.service');

/**
 * Cadastra um serviço (RF003).
 * Responde 201 com o id e a mensagem da IS_ServicoCadastrado.
 *
 * @param {import('express').Request} req Requisição com os dados do serviço no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function abrir(req, res, next) {
  try {
    const id = await ordemServicoService.abrir(req.body);
    res.status(201).json({ id, mensagem: 'Ordem de serviço aberta com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

async function listar(req, res, next) {
  try {
    const ordens = await ordemServicoService.listar(req.query);
    res.status(200).json(ordens);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { abrir, listar };