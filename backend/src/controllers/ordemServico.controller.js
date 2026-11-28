/**
 * Controller de Ordem de Serviço (BP05).
 * Recebe a requisição HTTP, chama o service e monta a resposta.
 */

const ordemServicoService = require('../services/ordemServico.service');

/**
 * Abre uma ordem de serviço (RF012).
 * Responde 201 com o id e a mensagem da IS_OrdemServicoAberta.
 *
 * @param {import('express').Request} req Requisição com clienteId, veiculoId, servicosIds e observacoes no corpo.
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

/**
 * Lista as ordens de serviço com os filtros da URL (RF013).
 * Responde 200 com a lista (vazia se nenhuma ordem for encontrada).
 *
 * @param {import('express').Request} req Requisição com status, placa e cliente em req.query.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function listar(req, res, next) {
  try {
    const ordens = await ordemServicoService.listar(req.query);
    res.status(200).json(ordens);
  } catch (erro) {
    next(erro);
  }
}

/**
 * Busca uma ordem de serviço com os seus serviços, para a tela de edição (RF014, passo 2).
 * Responde 200 com a ordem ou 404 se ela não existir.
 *
 * @param {import('express').Request} req Requisição com o id da ordem em req.params.id.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function buscarPorId(req, res, next) {
  try {
    const ordem = await ordemServicoService.buscarPorId(req.params.id);
    res.status(200).json(ordem);
  } catch (erro) {
    next(erro);
  }
}

/**
 * Altera o status, as observações e os serviços de uma ordem de serviço (RF014).
 * Responde 200 com a mensagem da IS_OrdemServicoAlterada.
 *
 * @param {import('express').Request} req Requisição com o id em req.params.id e status, servicosIds e observacoes no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function alterar(req, res, next) {
  try {
    await ordemServicoService.alterar(req.params.id, req.body);
    res.status(200).json({ mensagem: 'Ordem de serviço alterada com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

/**
 * Exclui uma ordem de serviço (RF015).
 * Responde 200 com a mensagem da IS_OrdemServicoExcluida.
 *
 * @param {import('express').Request} req Requisição com o id da ordem em req.params.id.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function excluir(req, res, next) {
  try {
    await ordemServicoService.excluir(req.params.id);
    res.status(200).json({ mensagem: 'Ordem de serviço excluída com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { abrir, listar, alterar, buscarPorId, excluir };