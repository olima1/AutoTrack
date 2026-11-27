import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { excluirServico, lerMensagemDeErro, listarServicos } from '../services/api';
import { formatarPreco } from '../utils/formatacao';

/**
 * Interface I_ListagemServicos (RF004 e RF006).
 * Lista os serviços do catálogo, com busca pelo nome, leva ao cadastro e à alteração,
 * e exclui serviços com confirmação.
 *
 * @returns {JSX.Element}
 */
function ListagemServicos() {
  const [servicos, setServicos] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  const [servicoParaExcluir, setServicosParaExcluir] = useState(null);
  const [janela, setJanela] = useState(null);

  // Busca de novo a cada letra digitada.
  useEffect(() => {
    listarServicos(busca)
      .then((lista) => {
        setServicos(lista);
        setErro('');
      })
      .catch(() => setErro('Não foi possível carregar os serviços. Verifique se a API está no ar.'));
  }, [busca]);

  /**
   * Exclui o serviço confirmado na janela I_ConfirmacaoExclusaoServico (RF006)
   * e mostra IS_ServicoExcluido ou IE_ServicoEmUso.
   *
   * @returns {Promise<void>}
   */
  async function confirmarExclusao() {
    const servico = servicoParaExcluir;
    setServicosParaExcluir(null);
    try {
      const resposta = await excluirServico(servico.id);
      setServicos(servicos.filter((item) => item.id !== servico.id));
      setJanela({ tipo: 'sucesso', titulo: 'Serviço excluído', mensagem: resposta.mensagem });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível excluir', mensagem: lerMensagemDeErro(erro) });
    }
  }

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Serviços</h1>
          <p className="subtitulo">Catálogo de serviços oferecidos pela oficina e seus preços atuais.</p>
        </div>
        <Link to="/servicos/novo" className="botao botao-primario">Novo serviço</Link>
      </div>

      <input
        type="search"
        className="campo campo-busca"
        placeholder="Buscar serviço pelo nome"
        value={busca}
        onChange={(evento) => setBusca(evento.target.value)}
      />

      {erro && <p className="alerta-erro">{erro}</p>}

      <div className="cartao">
        {servicos.length === 0 ? (
          <p className="vazio">Nenhum serviço encontrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.id}>
                  <td>{servico.nome}</td>
                  <td>{servico.descricao || '—'}</td>
                  <td>{formatarPreco(servico.preco)}</td>
                  <td>
                    <div className="acoes">
                      <Link
                        to={`/servicos/${servico.id}/editar`}
                        className="botao botao-secundario botao-pequeno"
                      >
                        Editar
                      </Link>
                      <button type="button" className="botao botao-perigo botao-pequeno" onClick={() => setServicosParaExcluir(servico)}>
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
      {servicoParaExcluir && (
        <Modal
          tipo="perigo"
          titulo="Excluir serviço?"
          mensagem={`O serviço "${servicoParaExcluir.nome}" será excluído do catálogo. Esta ação não pode ser desfeita.`}
        >
          <button type="button" className="botao botao-secundario" onClick={() => setServicosParaExcluir(null)}>
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

export default ListagemServicos;