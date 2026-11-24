/**
 * Chamadas à API do AutoTrack (BP05).
 * As páginas usam estas funções e nunca chamam o axios diretamente.
 */

import axios from 'axios';
import { lerToken, encerrarSessao } from './sessao';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

// Antes de cada requisição: se houver token, envia no cabeçalho Authorization (RNF007).
api.interceptors.request.use((config) => {
  const token = lerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Depois de cada resposta: 401 fora do login = sessão expirada, volta para a tela de login.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const ehLogin = erro.config?.url === '/auth/login';
    if (erro.response?.status === 401 && !ehLogin) {
      encerrarSessao();
      window.location.href = '/login';
    }
    return Promise.reject(erro);
  }
);

/**
 * Faz login (RF001).
 *
 * @param {{ email: string, senha: string }} credenciais E-mail e senha digitados.
 * @returns {Promise<{ token: string, perfil: string, primeiroAcesso: boolean }>} Dados da sessão.
 */
export async function fazerLogin(credenciais) {
  const resposta = await api.post('/auth/login', credenciais);
  return resposta.data;
}

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

/**
 * Exclui um serviço (RF006).
 *
 * @param {number|string} id Id do serviço.
 * @returns {Promise<{ mensagem: string }>} Mensagem de sucesso.
 */
export async function excluirServico(id) {
  const resposta = await api.delete(`/servicos/${id}`);
  return resposta.data;
}

/**
 * Lê a mensagem de erro enviada pela API no formato { erro: '...' } (BP06).
 * Se a API nem respondeu, devolve uma mensagem genérica.
 *
 * @param {object} erro Erro lançado pelo axios.
 * @returns {string} Mensagem para o usuário.
 */
export function lerMensagemDeErro(erro) {
  return erro.response?.data?.erro ?? 'Não foi possível falar com a API. Verifique se ela está no ar.';
}