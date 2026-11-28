/**
 * Controller de Veículo (BP05).
 * Recebe a requisição HTTP, chama o service e monta a resposta.
 */

const veiculoService = require('../services/veiculo.service');

/**
 * Cadastra um veículo (RF010).
 * Responde 201 com o id e a mensagem da IS_VeiculoCadastrado.
 *
 * @param {import('express').Request} req Requisição com clienteId, placa, marca, modelo, ano e quilometragem no corpo.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function cadastrar(req, res, next) {
  try {
    const id = await veiculoService.cadastrar(req.body);
    res.status(201).json({ id, mensagem: 'Veículo cadastrado com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

/**
 * Lista os veículos, com busca opcional por placa ou nome do cliente (RF011).
 * Responde 200 com a lista (vazia se nenhum veículo for encontrado).
 *
 * @param {import('express').Request} req Requisição com o texto da busca em req.query.busca.
 * @param {import('express').Response} res Resposta HTTP.
 * @param {import('express').NextFunction} next Repassa o erro ao middleware de erros.
 * @returns {Promise<void>}
 */
async function listar(req, res, next) {
  try {
    const veiculos = await veiculoService.listar(req.query.busca);
    res.status(200).json(veiculos);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { cadastrar, listar };
