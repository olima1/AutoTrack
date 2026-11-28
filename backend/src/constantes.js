/**
 * Valores fixos de regra de negócio usados pela API.
 * Ficam centralizados aqui para não haver números ou textos
 * "mágicos" espalhados pelo código (BP07).
 */

/** Tamanho máximo do nome do serviço, igual ao VARCHAR(60) da tabela Servico. */
const TAMANHO_MAXIMO_NOME_SERVICO = 60;

/** Tamanho máximo da descrição do serviço, igual ao VARCHAR(255) da tabela Servico. */
const TAMANHO_MAXIMO_DESCRICAO_SERVICO = 255;

/** Custo do hash bcrypt das senhas (RNF006: mínimo 10). */
const CUSTO_BCRYPT = 10;

/** Validade da sessão depois do login, em minutos (RNF007). */
const TEMPO_SESSAO_MINUTOS = 60;

/** Perfis de acesso da tabela Usuario. */
const PERFIL = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR',
  CLIENTE: 'CLIENTE',
});

/** Tamanho máximo da observações da ordem de serviço, igual ao VARCHAR(255) da tabela OrdemServico. */
const TAMANHO_MAXIMO_OBSERVACOES_ORDEM = 255;

/** Status da ordem de serviço, com valores iguais ao da tabela OrdemServico. */
const STATUS_ORDEM = Object.freeze({
  ABERTA: 'ABERTA',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  AGUARDANDO_PECAS: 'AGUARDANDO_PECAS',
  CONCLUIDA: 'CONCLUIDA',
});

/** Mudanças de status permitidas na ordem de serviço (RF014, regras 1 e 2). */
const TRANSICOES_STATUS = Object.freeze({
  ABERTA: ['EM_ANDAMENTO'],
  EM_ANDAMENTO: ['AGUARDANDO_PECAS', 'CONCLUIDA'],
  AGUARDANDO_PECAS: ['EM_ANDAMENTO'],
  CONCLUIDA: [],
});

/** Tamanho mínimo da senha do cliente (RF007, regra 4). */
const TAMANHO_MINIMO_SENHA = 8;

/** Tamanho máximo do nome do cliente, igual ao VARCHAR(100) da tabela Cliente. */
const TAMANHO_MAXIMO_NOME_CLIENTE = 100;

/** Tamanho máximo do e-mail, igual ao VARCHAR(100) da tabela Usuario. */
const TAMANHO_MAXIMO_EMAIL = 100;

/** Quantidades de dígitos aceitas no telefone: fixo (10) ou celular (11) com DDD (RF007, regra 3). */
const DIGITOS_TELEFONE = Object.freeze([10, 11]);

/** Ano mínimo do veículo, igual ao CHECK da tabela Veiculo (RF010, regra 2). */
const ANO_MINIMO_VEICULO = 1950;

/** Tamanho máximo da marca do veículo, igual ao VARCHAR(40) da tabela Veiculo. */
const TAMANHO_MAXIMO_MARCA = 40;

/** Tamanho máximo do modelo do veículo, igual ao VARCHAR(60) da tabela Veiculo. */
const TAMANHO_MAXIMO_MODELO = 60;

module.exports = {
  TAMANHO_MAXIMO_NOME_SERVICO,
  TAMANHO_MAXIMO_DESCRICAO_SERVICO,
  CUSTO_BCRYPT,
  PERFIL,
  TEMPO_SESSAO_MINUTOS,
  TAMANHO_MAXIMO_OBSERVACOES_ORDEM,
  STATUS_ORDEM,
  TRANSICOES_STATUS,
  TAMANHO_MINIMO_SENHA,
  TAMANHO_MAXIMO_NOME_CLIENTE,
  TAMANHO_MAXIMO_EMAIL,
  DIGITOS_TELEFONE,
  ANO_MINIMO_VEICULO,
  TAMANHO_MAXIMO_MARCA,
  TAMANHO_MAXIMO_MODELO,
};