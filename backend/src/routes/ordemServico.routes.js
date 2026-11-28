/**
 * Rotas de Ordem de Serviço (BP05).
 * Liga cada URL de /api/ordens-servico à função do controller. Todas exigem login de Administrador (RNF007).
 */

const ordemServicoController = require('../controllers/ordemServico.controller');
const { verificarToken, permitirPerfis } = require('../middlewares/autenticacao');
const { PERFIL } = require('../constantes');
const express = require('express');

const router = express.Router();

router.use(verificarToken, permitirPerfis(PERFIL.ADMINISTRADOR));

router.post('/', ordemServicoController.abrir);

router.get('/', ordemServicoController.listar);

router.get('/:id', ordemServicoController.buscarPorId);

router.put('/:id', ordemServicoController.alterar);

router.delete('/:id', ordemServicoController.excluir);

module.exports = router;