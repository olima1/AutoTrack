import { Link } from 'react-router-dom';

/**
 * Tela I_ListagemOrdensServico (RF012, passos 2 e 3).
 * Versão provisória: só o cabeçalho e o botão de nova ordem. A tabela com os filtros entra no RF013.
 *
 * @returns {JSX.Element}
 */
function ListagemOrdensServico() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Ordens de serviço</h1>
          <p className="subtitulo">Ordens de serviço abertas na oficina.</p>
        </div>
        <Link to="/ordens-servico/nova" className="botao botao-primario">Nova ordem de serviço</Link>
      </div>
      <div className="cartao">
        <p className="vazio">Nenhuma ordem de serviço para exibir.</p>
      </div>
    </>
  );
}

export default ListagemOrdensServico;
