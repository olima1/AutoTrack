/**
 * Controller de Cliente (BP05).
 * Recebe a requisição HTTP, chama o service e monta a resposta.
 */

const clienteService = require('../services/cliente.service');

/**
 * Lista os clientes para o formulário da ordem de serviço (RF012).
 * Responde 200 com a lista.
 *
 * @param {import('express').Request} _req Requisição HTTP (não usada).
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function listar(_req, res, next) {
  try {
    const clientes = await clienteService.listar();
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

module.exports = { listar, listarVeiculos, cadastrar };