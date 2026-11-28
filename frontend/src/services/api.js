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

/**
 * Lista os clientes em ordem alfabética, com busca opcional por nome ou CPF (RF008).
 * Sem busca, devolve todos (usado também no formulário da ordem de serviço, RF012).
 *
 * @param {string} [busca] Parte do nome ou do CPF.
 * @returns {Promise<{ id: number, nome: string, cpf: string, telefone: string, email: string|null }[]>} Clientes encontrados.
 */
export async function listarClientes(busca) {
  const resposta = await api.get('/clientes', { params: { busca } });
  return resposta.data;
}

/**
 * Lista os veículos de um cliente (RF012, passo 6).
 * Lista vazia indica cliente sem veículo (fluxo alternativo 1).
 *
 * @param {number|string} clienteId Id do cliente selecionado.
 * @returns {Promise<{ id: number, placa: string, marca: string, modelo: string }[]>} Veículos do cliente.
 */
export async function listarVeiculosDoCliente(clienteId) {
  const resposta = await api.get(`/clientes/${clienteId}/veiculos`);
  return resposta.data;
}

/**
 * Abre uma ordem de serviço (RF012).
 *
 * @param {{ clienteId: number, veiculoId: number, servicosIds: number[], observacoes?: string }} dados Dados do formulário.
 * @returns {Promise<{ id: number, mensagem: string }>} Id da ordem criada e mensagem de sucesso.
 */
export async function abrirOrdemServico(dados) {
  const resposta = await api.post('/ordens-servico', dados);
  return resposta.data;
}

/**
 * Lista as ordens de serviço com filtros opcionais (RF013).
 * O axios transforma os filtros na query string: ?status=ABERTA&placa=abc&cliente=ana.
 *
 * @param {{ status?: string, placa?: string, cliente?: string }} filtros Filtros da tela.
 * @returns {Promise<object[]>} Ordens com cliente, veículo, status e valor, da mais recente para a mais antiga.
 */
export async function listarOrdensServico(filtros) {
  const resposta = await api.get('/ordens-servico', { params: filtros });
  return resposta.data;
}

/**
 * Busca uma ordem de serviço com os seus serviços, para a tela de edição (RF014, passo 2).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @returns {Promise<object>} Ordem com cliente, veículo, status, observações e servicos ({ servicoId, precoCobrado }).
 */
export async function buscarOrdemServico(id) {
  const resposta = await api.get(`/ordens-servico/${id}`);
  return resposta.data;
}

/**
 * Altera o status, os serviços e as observações de uma ordem de serviço (RF014).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @param {{ status: string, servicosIds: number[], observacoes?: string }} dados Campos que podem mudar.
 * @returns {Promise<{ mensagem: string }>} Mensagem de sucesso.
 */
export async function alterarOrdemServico(id, dados) {
  const resposta = await api.put(`/ordens-servico/${id}`, dados);
  return resposta.data;
}

/**
 * Exclui uma ordem de serviço com status Aberta (RF015).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @returns {Promise<{ mensagem: string }>} Mensagem de sucesso.
 */
export async function excluirOrdemServico(id) {
  const resposta = await api.delete(`/ordens-servico/${id}`);
  return resposta.data;
}

/**
 * Cadastra um cliente e o acesso dele ao sistema (RF007).
 *
 * @param {{ nome: string, cpf: string, telefone: string, email: string, senha: string }} dados Dados do formulário.
 * @returns {Promise<{ id: number, mensagem: string }>} Id do cliente criado e mensagem de sucesso.
 */
export async function cadastrarCliente(dados) {
  const resposta = await api.post('/clientes', dados);
  return resposta.data;
}

/**
 * Busca um cliente com o e-mail de acesso, para a tela de alteração (RF009, passo 2).
 *
 * @param {number|string} id Id do cliente.
 * @returns {Promise<{ id: number, nome: string, cpf: string, telefone: string, email: string|null }>} O cliente.
 */
export async function buscarCliente(id) {
  const resposta = await api.get(`/clientes/${id}`);
  return resposta.data;
}

/**
 * Altera o nome, o telefone e o e-mail de acesso de um cliente (RF009).
 *
 * @param {number|string} id Id do cliente.
 * @param {{ nome: string, telefone: string, email?: string }} dados Campos que podem mudar (o CPF não muda).
 * @returns {Promise<{ mensagem: string }>} Mensagem de sucesso.
 */
export async function alterarCliente(id, dados) {
  const resposta = await api.put(`/clientes/${id}`, dados);
  return resposta.data;
}

/**
 * Exclui um cliente sem veículo nem ordem de serviço, junto com o acesso dele (RF018).
 *
 * @param {number|string} id Id do cliente.
 * @returns {Promise<{ mensagem: string }>} Mensagem de sucesso.
 */
export async function excluirCliente(id) {
  const resposta = await api.delete(`/clientes/${id}`);
  return resposta.data;
}

/**
 * Cadastra um veículo vinculado a um cliente (RF010).
 *
 * @param {{ clienteId: number|string, placa: string, marca: string, modelo: string, ano: number|string, quilometragem?: number|string }} dados Dados do formulário.
 * @returns {Promise<{ id: number, mensagem: string }>} Id do veículo criado e mensagem de sucesso.
 */
export async function cadastrarVeiculo(dados) {
  const resposta = await api.post('/veiculos', dados);
  return resposta.data;
}

/**
 * Lista os veículos com o nome do cliente, com busca opcional por placa ou cliente (RF011).
 *
 * @param {string} [busca] Parte da placa ou do nome do cliente.
 * @returns {Promise<{ id: number, placa: string, marca: string, modelo: string, ano: number, quilometragem: number, clienteNome: string }[]>} Veículos em ordem de placa.
 */
export async function listarVeiculos(busca) {
  const resposta = await api.get('/veiculos', { params: { busca } });
  return resposta.data;
}

/**
 * Painel do Cliente logado: nome, veículos, ordens em andamento e histórico (RF016).
 * O cliente é identificado pelo token, não por um id na URL.
 *
 * @returns {Promise<{ nome: string, veiculos: object[], emAndamento: object[], historico: object[] }>} Dados da área do cliente.
 */
export async function buscarPainelCliente() {
  const resposta = await api.get('/area-cliente');
  return resposta.data;
}

/**
 * Troca a senha inicial do Cliente no primeiro acesso (RF017).
 *
 * @param {{ novaSenha: string, confirmacao: string }} dados Nova senha e confirmação.
 * @returns {Promise<{ token: string, mensagem: string }>} Novo token da sessão e a mensagem de sucesso.
 */
export async function alterarSenhaInicial(dados) {
  const resposta = await api.put('/auth/senha-inicial', dados);
  return resposta.data;
}
