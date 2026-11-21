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

/**
 * Lista os serviços, com filtro opcional pelo nome (RF004).
 * Responde 200 com a lista (vazia se nenhum serviço for encontrado).
 *
 * @param {import('express').Request} req Requisição com o texto da pesquisa em req.query.busca.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function listar(req, res, next) {
  try {
    const servicos = await servicoService.listar(req.query.busca);
    res.status(200).json({servicos});
  } catch (erro) {
    next(erro);
  }
}

module.exports = { cadastrar, listar };