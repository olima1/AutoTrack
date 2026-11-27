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