/**
 * Rotas de Serviço (BP05).
 * Liga cada URL de /api/servicos à função do controller.
 */

const express = require('express');
const servicoController = require('../controllers/servico.controller');
const { verificarToken, permitirPerfis } = require('../middlewares/autenticacao');
const { PERFIL } = require('../constantes');

const router = express.Router();

router.use(verificarToken, permitirPerfis(PERFIL.ADMINISTRADOR));

router.post('/', servicoController.cadastrar);

router.get('/', servicoController.listar);

router.get('/:id', servicoController.buscarPorId);

router.put('/:id', servicoController.alterar);

router.delete('/:id', servicoController.excluir);


module.exports = router;