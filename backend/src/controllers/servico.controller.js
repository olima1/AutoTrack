/**
 * Controller de Serviço (BP05).
 * Recebe a requisição HTTP, chama o service e monta a resposta.
 */

const servicoService = require('../services/servico.service');

/**
 * Cadastra um serviço (RF003).
 * Responde 201 com o id e a mensagem da IS_ServicoCadastrado.
 *
 * @param {import('express').Request} req Requisição com os dados do serviço no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function cadastrar(req, res, next) {
  try {
    const id = await servicoService.cadastrar(req.body);
    res.status(201).json({ id, mensagem: 'Serviço cadastrado com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { cadastrar };