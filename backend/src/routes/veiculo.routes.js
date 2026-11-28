/**
 * Rotas de Veículo (BP05).
 * Liga cada URL de /api/veiculos à função do controller. Todas exigem login de Administrador (RNF007).
 */

const express = require('express');
const veiculoController = require('../controllers/veiculo.controller');
const { verificarToken, permitirPerfis } = require('../middlewares/autenticacao');
const { PERFIL } = require('../constantes');

const router = express.Router();

router.use(verificarToken, permitirPerfis(PERFIL.ADMINISTRADOR));

router.post('/', veiculoController.cadastrar);

module.exports = router;
