/**
 * Funções de formatação usadas por mais de uma tela.
 */

/**
 * Formata um preço vindo do banco ("150.00") em reais ("R$ 150,00").
 *
 * @param {number|string} preco Preço do serviço.
 * @returns {string} Preço formatado.
 */
export function formatarPreco(preco) {
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata a data de abertura vinda da API ("2026-11-27T02:10:00.000Z") como "27/11/2026".
 *
 * @param {string|Date} data Data vinda do banco.
 * @returns {string} Data no formato brasileiro.
 */
export function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

/**
 * Texto exibido para cada status da ordem de serviço (RF013, regra 1).
 * As chaves são os valores do ENUM da tabela OrdemServico.
 */
export const TEXTO_DO_STATUS = Object.freeze({
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_PECAS: 'Aguardando peças',
  CONCLUIDA: 'Concluída',
});

/**
 * Converte o status do banco ("EM_ANDAMENTO") no texto da tela ("Em andamento").
 *
 * @param {string} status Status da ordem de serviço.
 * @returns {string} Texto do status (ou o próprio valor, se for desconhecido).
 */
export function formatarStatus(status) {
  return TEXTO_DO_STATUS[status] ?? status;
}

/**
 * Mudanças de status permitidas (RF014, regras 1 e 2), iguais às do backend (constantes.js).
 * Aqui servem só para mostrar as opções certas; quem valida de verdade é a API.
 */
export const TRANSICOES_STATUS = Object.freeze({
  ABERTA: ['EM_ANDAMENTO'],
  EM_ANDAMENTO: ['AGUARDANDO_PECAS', 'CONCLUIDA'],
  AGUARDANDO_PECAS: ['EM_ANDAMENTO'],
  CONCLUIDA: [],
});