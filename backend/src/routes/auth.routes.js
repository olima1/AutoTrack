/**
 * Rotas de acesso ao sistema (BP05).
 */
const express = require('express');
const authController = require('../controllers/auth.controller');
const { verificarToken, permitirPerfis } = require('../middlewares/autenticacao');
const { PERFIL } = require('../constantes');

const router = express.Router();

router.post('/login', authController.login);

router.put('/senha-inicial', verificarToken, permitirPerfis(PERFIL.CLIENTE), authController.alterarSenhaInicial);

module.exports = router;