/**
 * Classes de erro da API. O middleware de erros usa o statusHttp
 * de cada uma para montar a resposta HTTP (BP06).
 */

/**
 * Erro lançado quando um dado recebido é inválido, como campo obrigatório vazio ou preço menor ou igual a zero.
 */
class ErroValidacao extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroValidacao';
    this.statusHttp = 400;
  }
}

/**
 * Erro lançado quando o registro procurado não existe, como ao alterar ou excluir um serviço com id inexistente.
 */
class ErroNaoEncontrado extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroNaoEncontrado';
    this.statusHttp = 404;
  }
}

/**
 * Erro lançado quando uma regra de negócio é violada, como nome de serviço já cadastrado ou serviço em uso numa ordem de serviço.
 */
class ErroNegocio extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroNegocio';
    this.statusHttp = 409;
  }
}

/**
 * Erro lançado quando o usuário não está logado, a sessão expirou ou as credenciais estão incorretas.
 */
class ErroNaoAutenticado extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroNaoAutenticado';
    this.statusHttp = 401;
  }
}

/**
 * Erro lançado quando o usuário está logado, mas o perfil dele não pode acessar o recurso.
 */
class ErroAcessoNegado extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroAcessoNegado';
    this.statusHttp = 403;
  }
}

module.exports = { ErroValidacao, ErroNaoEncontrado, ErroNegocio, ErroAcessoNegado, ErroNaoAutenticado };
