/**
 * Rotas de Cliente (BP05).
 * Liga cada URL de /api/clientes à função do controller. Todas exigem login de Administrador (RNF007).
 */

const express = require('express');
const clienteController = require('../controllers/cliente.controller');
const { verificarToken, permitirPerfis } = require('../middlewares/autenticacao');
const { PERFIL } = require('../constantes');

const router = express.Router();

router.use(verificarToken, permitirPerfis(PERFIL.ADMINISTRADOR));

router.post('/', clienteController.cadastrar);

router.get('/', clienteController.listar);

router.get('/:id', clienteController.buscarPorId);

router.put('/:id', clienteController.alterar);

router.delete('/:id', clienteController.excluir);

router.get('/:id/veiculos', clienteController.listarVeiculos);

module.exports = router;