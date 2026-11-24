/**
 * Chamadas à API do AutoTrack (BP05).
 * As páginas usam estas funções e nunca chamam o axios diretamente.
 */

import axios from "axios";

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

/**
 * Lista os serviços, com filtro opcional pelo nome (RF004).
 *
 * @param {string} [busca] Trecho do nome digitado na pesquisa.
 * @returns {Promise<object[]>} Serviços encontrados.
 */
export async function listarServicos(busca) {
  const resposta = await api.get('/servicos', { params: { busca } });
  return resposta.data;
}

/**
 * Busca um serviço pelo id para preencher o formulário de alteração (RF005).
 *
 * @param {number|string} id Id do serviço.
 * @returns {Promise<object>} O serviço.
 */
export async function buscarServico(id) {
  const resposta = await api.get(`/servicos/${id}`);
  return resposta.data;
}

/**
 * Cadastra um serviço (RF003).
 *
 * @param {{ nome: string, descricao?: string, preco: number|string }} dados Dados do formulário.
 * @returns {Promise<{ id: number, mensagem: string }>} Id criado e mensagem de sucesso.
 */
export async function cadastrarServico(dados) {
  const resposta = await api.post('/servicos', dados);
  return resposta.data;
}

/**
 * Altera um serviço (RF005).
 *
 * @param {number|string} id Id do serviço.
 * @param {{ nome: string, descricao?: string, preco: number|string }} dados Dados do formulário.
 * @returns {Promise<{ mensagem: string }>} Mensagem de sucesso.
 */
export async function alterarServico(id, dados) {
  const resposta = await api.put(`/servicos/${id}`, dados);
  return resposta.data;
}