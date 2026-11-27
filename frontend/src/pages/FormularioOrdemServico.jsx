import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import {
  abrirOrdemServico,
  lerMensagemDeErro,
  listarClientes,
  listarServicos,
  listarVeiculosDoCliente,
} from '../services/api.js';
import { formatarPreco } from '../utils/formatacao.js';

/**
 * Soma os preços dos serviços selecionados, em centavos, para mostrar o total na tela (RF012, passo 10).
 * É só para o usuário ver: o valor gravado é calculado de novo pelo backend (regra 6).
 *
 * @param {{ preco: string|number }[]} servicos Serviços selecionados.
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
 * Tela I_FormularioOrdemServico (RF012).
 * O Administrador escolhe o cliente, um veículo dele e os serviços; o total é somado na hora
 * e a ordem é enviada para a API, que aplica as regras de negócio.
 *
 * @returns {JSX.Element}
 */
function FormularioOrdemServico() {
  const navigate = useNavigate();

  // Listas que vêm da API
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [erroCarregamento, setErroCarregamento] = useState('');

  // O que o usuário escolheu no formulário
  const [dados, setDados] = useState({ clienteId: '', veiculoId: '', servicosIds: [], observacoes: '' });
  const [janela, setJanela] = useState(null);

  // Ao abrir a tela: busca clientes e serviços (passos 4 e 8)
  useEffect(() => {
    Promise.all([listarClientes(), listarServicos()])
      .then(([listaClientes, listaServicos]) => {
        setClientes(listaClientes);
        setServicos(listaServicos);
      })
      .catch((erro) => setErroCarregamento(lerMensagemDeErro(erro)));
  }, []);

  // Quando o cliente muda: busca os veículos dele (passo 6)
  useEffect(() => {
    if (!dados.clienteId) {
      setVeiculos([]);
      return;
    }
    listarVeiculosDoCliente(dados.clienteId)
      .then(setVeiculos)
      .catch((erro) => setErroCarregamento(lerMensagemDeErro(erro)));
  }, [dados.clienteId]);

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
   * Marca o serviço se ele não estiver na lista, ou desmarca se já estiver (passo 9).
   *
   * @param {number} servicoId Id do serviço clicado.
   */
  function alternarServico(servicoId) {
    const jaMarcado = dados.servicosIds.includes(servicoId);
    const servicosIds = jaMarcado
      ? dados.servicosIds.filter((id) => id !== servicoId)
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
   * Envia a ordem para a API e mostra IS_OrdemServicoAberta ou a mensagem de erro (passos 11 a 15).
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário.
   * @returns {Promise<void>}
   */
  async function salvar(evento) {
    evento.preventDefault();
    try {
      const resposta = await abrirOrdemServico(dados);
      setJanela({ tipo: 'sucesso', titulo: 'Ordem de serviço aberta', mensagem: resposta.mensagem });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível abrir a ordem', mensagem: lerMensagemDeErro(erro) });
    }
  }

  /** Fecha o modal; depois do sucesso, volta para a listagem de ordens (passo 16). */
  function fecharJanela() {
    if (janela.tipo === 'sucesso') navigate('/ordens-servico');
    setJanela(null);
  }

  const clienteSemVeiculo = dados.clienteId !== '' && veiculos.length === 0;
  const servicosSelecionados = servicos.filter((servico) => dados.servicosIds.includes(servico.id));
  const valorTotal = calcularValorTotal(servicosSelecionados);

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Nova ordem de serviço</h1>
          <p className="subtitulo">Selecione o cliente, o veículo e os serviços. O valor total é calculado automaticamente.</p>
        </div>
      </div>

      {erroCarregamento && <p className="alerta-erro">{erroCarregamento}</p>}

      <form className="ordem-layout" onSubmit={salvar} noValidate>
        <div className="cartao formulario">
          <div className="ordem-linha">
            <label className="rotulo" htmlFor="cliente">
              Cliente *
              <select id="cliente" className="campo" value={dados.clienteId} onChange={alterarCliente}>
                <option value="">Selecione o cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </label>

            <label className="rotulo" htmlFor="veiculo">
              Veículo *
              <select id="veiculo" className="campo" value={dados.veiculoId} onChange={alterarVeiculo}
                disabled={dados.clienteId === ''}>
                <option value="">Selecione o veículo</option>
                {veiculos.map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>{veiculo.modelo} · {veiculo.placa}</option>
                ))}
              </select>
            </label>
          </div>

          {clienteSemVeiculo && <p className="alerta-erro">Cliente sem veículo cadastrado.</p>}

          <div className="rotulo">
            Serviços *
            <div className="lista-servicos">
              {servicos.map((servico) => {
                const marcado = dados.servicosIds.includes(servico.id);
                return (
                  <label key={servico.id} className={marcado ? 'item-servico item-servico-marcado' : 'item-servico'}>
                    <input type="checkbox" checked={marcado} onChange={() => alternarServico(servico.id)} />
                    <span className="item-servico-nome">{servico.nome}</span>
                    <span>{formatarPreco(servico.preco)}</span>
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
            <strong>Aberta</strong>
          </p>
          {servicosSelecionados.map((servico) => (
            <p key={servico.id} className="resumo-linha">
              <span>{servico.nome}</span>
              <span>{formatarPreco(servico.preco)}</span>
            </p>
          ))}
          <p className="resumo-linha resumo-total">
            <span>Valor total</span>
            <strong>{formatarPreco(valorTotal)}</strong>
          </p>
          <button type="submit" className="botao botao-primario">Abrir ordem de serviço</button>
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
