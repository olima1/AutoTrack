/**
 * Controller de Cliente (BP05).
 * Recebe a requisição HTTP, chama o service e monta a resposta.
 */

const clienteService = require('../services/cliente.service');

/**
 * Lista os clientes, com busca opcional por nome ou CPF (RF008).
 * Responde 200 com a lista (vazia se nenhum cliente for encontrado).
 *
 * @param {import('express').Request} req Requisição com o texto da busca em req.query.busca.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function listar(req, res, next) {
  try {
    const clientes = await clienteService.listar(req.query.busca);
    res.status(200).json(clientes);
  } catch (erro) {
    next(erro);
  }
}

/**
 * Lista os veículos de um cliente para o formulário da ordem de serviço (RF012).
 * Responde 200 com a lista (vazia se o cliente não tiver veículo).
 *
 * @param {import('express').Request} req Requisição com o id do cliente em req.params.id.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function listarVeiculos(req, res, next) {
  try {
    const veiculo = await clienteService.listarVeiculos(req.params.id);
    res.status(200).json(veiculo);
  } catch (erro) {
    next(erro);
  }
}

/**
 * Cadastra um cliente e o acesso dele (RF007).
 * Responde 201 com o id e a mensagem da IS_ClienteCadastrado.
 *
 * @param {import('express').Request} req Requisição com nome, cpf, telefone, email e senha no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function cadastrar(req, res, next) {
  try {
    const id = await clienteService.cadastrar(req.body);
    res.status(201).json({ id, mensagem: 'Cliente cadastrado com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

/**
 * Busca um cliente com o e-mail de acesso, para a tela de alteração (RF009, passo 2).
 * Responde 200 com o cliente ou 404 se ele não existir.
 *
 * @param {import('express').Request} req Requisição com o id do cliente em req.params.id.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function buscarPorId(req, res, next) {
  try {
    const cliente = await clienteService.buscarPorId(req.params.id);
    res.status(200).json(cliente);
  } catch (erro) {
    next(erro);
  }
}

/**
 * Altera o nome, o telefone e o e-mail de acesso de um cliente (RF009).
 * Responde 200 com a mensagem da IS_ClienteAlterado.
 *
 * @param {import('express').Request} req Requisição com o id em req.params.id e nome, telefone e email no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function alterar(req, res, next) {
  try {
    await clienteService.alterar(req.params.id, req.body);
    res.status(200).json({ mensagem: 'Cliente alterado com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

/**
 * Exclui um cliente e o acesso dele (RF018).
 * Responde 200 com a mensagem da IS_ClienteExcluido.
 *
 * @param {import('express').Request} req Requisição com o id do cliente em req.params.id.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function excluir(req, res, next) {
  try {
    await clienteService.excluir(req.params.id);
    res.status(200).json({ mensagem: 'Cliente excluído com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, listarVeiculos, cadastrar, buscarPorId, alterar, excluir };