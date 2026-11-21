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
    res.status(200).json({ servicos });
  } catch (erro) {
    next(erro);
  }
}

/**
 * Busca um serviço pelo id para preencher a I_FormularioServico (RF005).
 * Responde 200 com o serviço.
 *
 * @param {import('express').Request} req Requisição com o id em req.params.id.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function buscarPorId(req, res, next) {
  try {
    const servico = await servicoService.buscarPorId(req.params.id);
    res.status(200).json(servico);
  } catch (erro) {
    next(erro);
  }
}

/**
 * Altera um serviço (RF005).
 * Responde 200 com a mensagem da IS_ServicoAlterado.
 *
 * @param {import('express').Request} req Requisição com o id em req.params.id e os dados no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function alterar(req, res, next) {
  try {
    await servicoService.alterar(req.params.id, req.body);
    res.status(200).json({ mensagem: 'Serviço alterado com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { cadastrar, listar, buscarPorId, alterar };