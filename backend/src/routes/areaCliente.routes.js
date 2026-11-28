/**
 * Rotas da área do Cliente (BP05).
 * Liga as URLs de /api/area-cliente ao controller. Todas exigem login de Cliente (RNF007);
 * o Administrador recebe 403 aqui, assim como o Cliente recebe 403 nas rotas do Administrador.
 */

const express = require('express');
const areaClienteController = require('../controllers/areaCliente.controller');
const { verificarToken, permitirPerfis, exigirSenhaAlterada } = require('../middlewares/autenticacao');
const { PERFIL } = require('../constantes');

const router = express.Router();

// O Cliente só entra na área dele depois de trocar a senha inicial (RF017, regra 1).
router.use(verificarToken, permitirPerfis(PERFIL.CLIENTE), exigirSenhaAlterada);

router.get('/', areaClienteController.buscarPainel);

module.exports = router;
