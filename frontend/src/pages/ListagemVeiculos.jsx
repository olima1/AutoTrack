import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lerMensagemDeErro, listarVeiculos } from '../services/api.js';
import { formatarQuilometragem } from '../utils/formatacao.js';

/**
 * Tela I_ListagemVeiculos (RF010 e RF011).
 * Lista os veículos em ordem alfabética de placa com marca, modelo, ano, quilometragem
 * e cliente (RF011, regra 2), filtra por parte da placa ou do nome do cliente ao clicar
 * em "Pesquisar" e leva ao cadastro de um novo veículo (RF010).
 *
 * @returns {JSX.Element}
 */
function ListagemVeiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  /**
   * Busca os veículos na API com o texto atual do campo "Buscar" (passos 2 e 4).
   *
   * @returns {Promise<void>}
   */
  async function buscar() {
    try {
      setVeiculos(await listarVeiculos(busca));
      setErro('');
    } catch (falha) {
      setErro(lerMensagemDeErro(falha));
    }
  }

  // Ao abrir a tela: todos os veículos, sem filtro (passo 2).
  useEffect(() => {
    buscar();
  }, []);

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
          <h1>Veículos</h1>
          <p className="subtitulo">Veículos dos clientes da oficina.</p>
        </div>
        <Link to="/veiculos/novo" className="botao botao-primario">Novo veículo</Link>
      </div>

      <form className="busca" onSubmit={pesquisar}>
        <input type="search" className="campo campo-busca" placeholder="Buscar por placa ou cliente"
          value={busca} onChange={(evento) => setBusca(evento.target.value)} />
        <button type="submit" className="botao botao-secundario">Pesquisar</button>
      </form>

      {erro && <p className="alerta-erro">{erro}</p>}

      <div className="cartao">
        {veiculos.length === 0 ? (
          <p className="vazio">Nenhum veículo encontrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Ano</th>
                <th>Quilometragem</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td><strong>{veiculo.placa}</strong></td>
                  <td>{veiculo.marca}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.ano}</td>
                  <td>{formatarQuilometragem(veiculo.quilometragem)}</td>
                  <td>{veiculo.clienteNome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default ListagemVeiculos;
