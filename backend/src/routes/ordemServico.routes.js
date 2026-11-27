const ordemServicoController = require('../controllers/ordemServico.controller');
const { verificarToken, permitirPerfis } = require('../middlewares/autenticacao');
const { PERFIL } = require('../constantes');
const express = require('express');

const router = express.Router();

router.use(verificarToken, permitirPerfis(PERFIL.ADMINISTRADOR));

router.post('/', ordemServicoController.abrir);

router.get('/', ordemServicoController.listar);

module.exports = router;