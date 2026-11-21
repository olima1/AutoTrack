/**
 * Rotas de Serviço (BP05).
 * Liga cada URL de /api/servicos à função do controller.
 */

const express = require('express');
const servicoController = require('../controllers/servico.controller');

const router = express.Router();

router.post('/', servicoController.cadastrar);

router.get('/', servicoController.listar);

module.exports = router;