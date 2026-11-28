import { Link } from 'react-router-dom';

/**
 * Tela I_ListagemVeiculos (RF010, passos 2 e 3).
 * Versão provisória: só o cabeçalho e o botão de novo veículo.
 * A tabela com a busca por placa ou cliente entra no RF011.
 *
 * @returns {JSX.Element}
 */
function ListagemVeiculos() {
  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Veículos</h1>
          <p className="subtitulo">Veículos dos clientes da oficina.</p>
        </div>
        <Link to="/veiculos/novo" className="botao botao-primario">Novo veículo</Link>
      </div>
      <div className="cartao">
        <p className="vazio">Nenhum veículo para exibir.</p>
      </div>
    </>
  );
}

export default ListagemVeiculos;
