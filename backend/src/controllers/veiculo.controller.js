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

module.exports = { cadastrar };
