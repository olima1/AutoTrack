/**
 * Valores fixos de regra de negócio usados pela API.
 * Ficam centralizados aqui para não haver números ou textos
 * "mágicos" espalhados pelo código (BP07).
 */

/** Tamanho máximo do nome do serviço, igual ao VARCHAR(60) da tabela Servico. */
const TAMANHO_MAXIMO_NOME_SERVICO = 60;

/** Tamanho máximo da descrição do serviço, igual ao VARCHAR(255) da tabela Servico. */
const TAMANHO_MAXIMO_DESCRICAO_SERVICO = 255;

module.exports = { TAMANHO_MAXIMO_NOME_SERVICO, TAMANHO_MAXIMO_DESCRICAO_SERVICO };