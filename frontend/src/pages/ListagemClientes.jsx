import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { excluirCliente, lerMensagemDeErro, listarClientes } from '../services/api.js';
import { formatarCpf, formatarTelefone } from '../utils/formatacao.js';

/**
 * Tela I_ListagemClientes (RF007, RF008, RF009 e RF018).
 * Lista os clientes em ordem alfabética com nome, CPF, telefone e e-mail (RF008, regra 2),
 * filtra por parte do nome ou do CPF ao clicar em "Pesquisar" e leva ao cadastro (RF007)
 * e à alteração (RF009) e exclui clientes com confirmação (RF018).
 *
 * @returns {JSX.Element}
 */
function ListagemClientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
  const [janela, setJanela] = useState(null);

  /**
   * Busca os clientes na API com o texto atual do campo "Buscar" (passos 2 e 4).
   *
   * @returns {Promise<void>}
   */
  async function buscar() {
    try {
      setClientes(await listarClientes(busca));
      setErro('');
    } catch (falha) {
      setErro(lerMensagemDeErro(falha));
    }
  }

  // Ao abrir a tela: todos os clientes, sem filtro (passo 2).
  useEffect(() => {
    buscar();
  }, []);

  /**
   * Exclui o cliente confirmado na janela I_ConfirmacaoExclusaoCliente (RF018)
   * e mostra IS_ClienteExcluido ou IE_ClienteComVinculo.
   *
   * @returns {Promise<void>}
   */
  async function confirmarExclusao() {
    const cliente = clienteParaExcluir;
    setClienteParaExcluir(null);
    try {
      const resposta = await excluirCliente(cliente.id);
      setClientes(clientes.filter((item) => item.id !== cliente.id));
      setJanela({ tipo: 'sucesso', titulo: 'Cliente excluído', mensagem: resposta.mensagem });
    } catch (falha) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível excluir', mensagem: lerMensagemDeErro(falha) });
    }
  }

  /**
   * Aplica a busca ao clicar em "Pesquisar" ou apertar Enter (passo 3).
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário de busca.
   */
  function pesquisar(evento) {
    evento.preventDefault();
    buscar();
  }

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Clientes</h1>
          <p className="subtitulo">Clientes da oficina e o acesso deles ao AutoTrack.</p>
        </div>
        <Link to="/clientes/novo" className="botao botao-primario">Novo cliente</Link>
      </div>

      <form className="busca" onSubmit={pesquisar}>
        <input type="search" className="campo campo-busca" placeholder="Buscar por nome ou CPF"
          value={busca} onChange={(evento) => setBusca(evento.target.value)} />
        <button type="submit" className="botao botao-secundario">Pesquisar</button>
      </form>

      {erro && <p className="alerta-erro">{erro}</p>}

      <div className="cartao">
        {clientes.length === 0 ? (
          <p className="vazio">Nenhum cliente encontrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{formatarCpf(cliente.cpf)}</td>
                  <td>{formatarTelefone(cliente.telefone)}</td>
                  <td>{cliente.email ?? '—'}</td>
                  <td>
                    <div className="acoes">
                      <Link to={`/clientes/${cliente.id}/editar`} className="botao botao-secundario botao-pequeno">
                        Editar
                      </Link>
                      <button type="button" className="botao botao-perigo botao-pequeno"
                        onClick={() => setClienteParaExcluir(cliente)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {clienteParaExcluir && (
        <Modal
          tipo="perigo"
          titulo="Excluir cliente?"
          mensagem={`O cliente ${clienteParaExcluir.nome} (CPF ${formatarCpf(clienteParaExcluir.cpf)}) e o acesso dele ao sistema serão excluídos. Esta ação não pode ser desfeita.`}
        >
          <button type="button" className="botao botao-secundario" onClick={() => setClienteParaExcluir(null)}>
            Cancelar
          </button>
          <button type="button" className="botao botao-perigo-cheio" onClick={confirmarExclusao}>
            Confirmar exclusão
          </button>
        </Modal>
      )}

      {janela && (
        <Modal tipo={janela.tipo} titulo={janela.titulo} mensagem={janela.mensagem} onFechar={() => setJanela(null)} />
      )}
    </>
  );
}

export default ListagemClientes;
