import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import {
  abrirOrdemServico,
  alterarOrdemServico,
  buscarOrdemServico,
  lerMensagemDeErro,
  listarClientes,
  listarServicos,
  listarVeiculosDoCliente,
} from '../services/api.js';
import { formatarPreco, formatarStatus, TRANSICOES_STATUS } from '../utils/formatacao.js';

/**
 * Soma os preços dos serviços selecionados, em centavos, para mostrar o total na tela (RF012 e RF014).
 * É só para o usuário ver: o valor gravado é calculado de novo pelo backend.
 *
 * @param {{ preco: string|number }[]} servicos Serviços selecionados com o preço a somar.
 * @returns {number} Valor total em reais.
 */
function calcularValorTotal(servicos) {
  const totalEmCentavos = servicos.reduce(
    (soma, servico) => soma + Math.round(Number(servico.preco) * 100),
    0
  );
  return totalEmCentavos / 100;
}

/**
 * Tela I_FormularioOrdemServico (RF012 e RF014).
 * Na abertura, o Administrador escolhe o cliente, um veículo dele e os serviços.
 * Na edição (/ordens-servico/:id/editar), o formulário abre preenchido, com cliente e veículo
 * travados (regra 4), e permite mudar o status, os serviços e as observações.
 * O total é somado na hora; quem aplica as regras de negócio é a API.
 *
 * @returns {JSX.Element}
 */
function FormularioOrdemServico() {
  const { id } = useParams();
  const ehEdicao = Boolean(id);
  const navigate = useNavigate();

  // Listas que vêm da API
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [erroCarregamento, setErroCarregamento] = useState('');

  // O que o usuário escolheu no formulário
  const [dados, setDados] = useState({ clienteId: '', veiculoId: '', servicosIds: [], observacoes: '', status: '' });
  // Na edição: a ordem como está no banco (status de origem e preços cobrados)
  const [ordemOriginal, setOrdemOriginal] = useState(null);
  const [janela, setJanela] = useState(null);

  // Ao abrir a tela: busca clientes e serviços
  useEffect(() => {
    Promise.all([listarClientes(), listarServicos()])
      .then(([listaClientes, listaServicos]) => {
        setClientes(listaClientes);
        setServicos(listaServicos);
      })
      .catch((erro) => setErroCarregamento(lerMensagemDeErro(erro)));
  }, []);

  // Quando o cliente muda: busca os veículos dele
  useEffect(() => {
    if (!dados.clienteId) {
      setVeiculos([]);
      return;
    }
    listarVeiculosDoCliente(dados.clienteId)
      .then(setVeiculos)
      .catch((erro) => setErroCarregamento(lerMensagemDeErro(erro)));
  }, [dados.clienteId]);

  // Na edição: carrega a ordem e preenche o formulário (RF014, passo 2)
  useEffect(() => {
    if (!ehEdicao) return;
    buscarOrdemServico(id)
      .then((ordem) => {
        setOrdemOriginal(ordem);
        setDados({
          clienteId: String(ordem.clienteId),
          veiculoId: String(ordem.veiculoId),
          servicosIds: ordem.servicos.map((item) => item.servicoId),
          observacoes: ordem.observacoes ?? '',
          status: ordem.status,
        });
      })
      .catch((erro) => setErroCarregamento(lerMensagemDeErro(erro)));
  }, [id, ehEdicao]);

  /**
   * Troca o cliente e limpa o veículo escolhido (ele era do cliente anterior).
   *
   * @param {import('react').ChangeEvent<HTMLSelectElement>} evento Mudança no select de cliente.
   */
  function alterarCliente(evento) {
    setDados({ ...dados, clienteId: evento.target.value, veiculoId: '' });
  }

  /**
   * Troca o veículo escolhido.
   *
   * @param {import('react').ChangeEvent<HTMLSelectElement>} evento Mudança no select de veículo.
   */
  function alterarVeiculo(evento) {
    setDados({ ...dados, veiculoId: evento.target.value });
  }

  /**
   * Troca o status escolhido (RF014, regras 1 e 2).
   *
   * @param {import('react').ChangeEvent<HTMLSelectElement>} evento Mudança no select de status.
   */
  function alterarStatus(evento) {
    setDados({ ...dados, status: evento.target.value });
  }

  /**
   * Marca o serviço se ele não estiver na lista, ou desmarca se já estiver (passo 9).
   *
   * @param {number} servicoId Id do serviço clicado.
   */
  function alternarServico(servicoId) {
    const jaMarcado = dados.servicosIds.includes(servicoId);
    const servicosIds = jaMarcado
      ? dados.servicosIds.filter((idMarcado) => idMarcado !== servicoId)
      : [...dados.servicosIds, servicoId];
    setDados({ ...dados, servicosIds });
  }

  /**
   * Atualiza o texto das observações.
   *
   * @param {import('react').ChangeEvent<HTMLTextAreaElement>} evento Mudança no campo de observações.
   */
  function alterarObservacoes(evento) {
    setDados({ ...dados, observacoes: evento.target.value });
  }

  /**
   * Preço exibido para o serviço (RF014, regra 5): o cobrado na abertura, se ele já estava
   * na ordem, ou o preço atual do catálogo, se ele é novo (ou se é uma ordem nova).
   *
   * @param {{ id: number, preco: string }} servico Serviço do catálogo.
   * @returns {string|number} Preço a exibir e somar.
   */
  function precoDoServico(servico) {
    const itemDaOrdem = ordemOriginal?.servicos.find((item) => item.servicoId === servico.id);
    return itemDaOrdem ? itemDaOrdem.precoCobrado : servico.preco;
  }

  /**
   * Envia a ordem para a API: abre (RF012) ou altera (RF014) e mostra o modal de sucesso ou de erro.
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário.
   * @returns {Promise<void>}
   */
  async function salvar(evento) {
    evento.preventDefault();
    try {
      // Na edição só vão os campos que podem mudar; cliente e veículo ficam fixos (regra 4).
      const resposta = ehEdicao
        ? await alterarOrdemServico(id, {
          status: dados.status,
          servicosIds: dados.servicosIds,
          observacoes: dados.observacoes,
        })
        : await abrirOrdemServico(dados);
      const titulo = ehEdicao ? 'Ordem de serviço alterada' : 'Ordem de serviço aberta';
      setJanela({ tipo: 'sucesso', titulo, mensagem: resposta.mensagem });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível salvar', mensagem: lerMensagemDeErro(erro) });
    }
  }

  /** Fecha o modal; depois do sucesso, volta para a listagem de ordens. */
  function fecharJanela() {
    if (janela.tipo === 'sucesso') navigate('/ordens-servico');
    setJanela(null);
  }

  const clienteSemVeiculo = !ehEdicao && dados.clienteId !== '' && veiculos.length === 0;
  const servicosSelecionados = servicos.filter((servico) => dados.servicosIds.includes(servico.id));
  const valorTotal = calcularValorTotal(servicosSelecionados.map((servico) => ({ preco: precoDoServico(servico) })));

  // Status atual + os destinos permitidos a partir dele (RF014, regras 1 e 2)
  const opcoesStatus = ordemOriginal
    ? [ordemOriginal.status, ...TRANSICOES_STATUS[ordemOriginal.status]]
    : [];

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>{ehEdicao ? `Editar ordem de serviço #${id}` : 'Nova ordem de serviço'}</h1>
          <p className="subtitulo">
            {ehEdicao
              ? 'Altere o status, os serviços ou as observações. Cliente e veículo não podem ser alterados.'
              : 'Selecione o cliente, o veículo e os serviços. O valor total é calculado automaticamente.'}
          </p>
        </div>
      </div>

      {erroCarregamento && <p className="alerta-erro">{erroCarregamento}</p>}

      <form className="ordem-layout" onSubmit={salvar} noValidate>
        <div className="cartao formulario">
          <div className="ordem-linha">
            <label className="rotulo" htmlFor="cliente">
              Cliente *
              <select id="cliente" className="campo" value={dados.clienteId} onChange={alterarCliente}
                disabled={ehEdicao}>
                <option value="">Selecione o cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </label>

            <label className="rotulo" htmlFor="veiculo">
              Veículo *
              <select id="veiculo" className="campo" value={dados.veiculoId} onChange={alterarVeiculo}
                disabled={ehEdicao || dados.clienteId === ''}>
                <option value="">Selecione o veículo</option>
                {veiculos.map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>{veiculo.modelo} · {veiculo.placa}</option>
                ))}
              </select>
            </label>
          </div>

          {clienteSemVeiculo && <p className="alerta-erro">Cliente sem veículo cadastrado.</p>}

          {ehEdicao && (
            <label className="rotulo rotulo-curto" htmlFor="status">
              Status *
              <select id="status" className="campo" value={dados.status} onChange={alterarStatus}>
                {opcoesStatus.map((status) => (
                  <option key={status} value={status}>{formatarStatus(status)}</option>
                ))}
              </select>
            </label>
          )}

          <div className="rotulo">
            Serviços *
            <div className="lista-servicos">
              {servicos.map((servico) => {
                const marcado = dados.servicosIds.includes(servico.id);
                return (
                  <label key={servico.id} className={marcado ? 'item-servico item-servico-marcado' : 'item-servico'}>
                    <input type="checkbox" checked={marcado} onChange={() => alternarServico(servico.id)} />
                    <span className="item-servico-nome">{servico.nome}</span>
                    <span>{formatarPreco(precoDoServico(servico))}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <label className="rotulo" htmlFor="observacoes">
            Observações
            <textarea id="observacoes" className="campo" rows="3"
              value={dados.observacoes} onChange={alterarObservacoes} />
          </label>
        </div>

        <aside className="cartao resumo">
          <h2>Resumo</h2>
          <p className="resumo-linha">
            <span>Status</span>
            <strong>{ehEdicao ? formatarStatus(dados.status) : 'Aberta'}</strong>
          </p>
          {servicosSelecionados.map((servico) => (
            <p key={servico.id} className="resumo-linha">
              <span>{servico.nome}</span>
              <span>{formatarPreco(precoDoServico(servico))}</span>
            </p>
          ))}
          <p className="resumo-linha resumo-total">
            <span>Valor total</span>
            <strong>{formatarPreco(valorTotal)}</strong>
          </p>
          <button type="submit" className="botao botao-primario">
            {ehEdicao ? 'Salvar' : 'Abrir ordem de serviço'}
          </button>
          <Link to="/ordens-servico" className="botao botao-secundario">Cancelar</Link>
        </aside>
      </form>

      {janela && (
        <Modal tipo={janela.tipo} titulo={janela.titulo} mensagem={janela.mensagem} onFechar={fecharJanela} />
      )}
    </>
  );
}

export default FormularioOrdemServico;
