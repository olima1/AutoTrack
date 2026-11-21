/**
 * Middleware de erros da API (BP06).
 * Erros com statusHttp (ErroValidacao, ErroNaoEncontrado, ErroNegocio) viram
 * uma resposta com o código e a mensagem do próprio erro. Qualquer outro erro
 * é registrado no terminal e vira 500, sem detalhes técnicos para o usuário.
 *
 * @param {Error} erro Erro lançado por uma rota, controller ou service.
 * @param {import('express').Request} _req Requisição (não usada).
 * @param {import('express').Response} res Resposta HTTP enviada ao frontend.
 * @param {import('express').NextFunction} _next Próximo middleware (não usado, mas obrigatório para o Express reconhecer o tratamento de erros).
 */
function tratarErros(erro, _req, res, _next) {
  if (erro.statusHttp) {
    return res.status(erro.statusHttp).json({ erro: erro.message });
  }
  
  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = tratarErros;