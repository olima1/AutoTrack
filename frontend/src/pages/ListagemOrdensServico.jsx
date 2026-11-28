import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lerMensagemDeErro, listarOrdensServico } from '../services/api.js';
import { TEXTO_DO_STATUS, formatarData, formatarPreco, formatarStatus } from '../utils/formatacao.js';

/**
 * Tela I_ListagemOrdensServico (RF013).
 * Mostra as ordens de serviço da mais recente para a mais antiga, com filtros de status,
 * placa e nome do cliente, e leva à abertura de uma nova ordem (RF012).
 *
 * @returns {JSX.Element}
 */
function ListagemOrdensServico() {
  const [ordens, setOrdens] = useState([]);
  const [filtros, setFiltros] = useState({ status: '', placa: '', cliente: '' });
  const [erro, setErro] = useState('');

  /**
   * Busca as ordens na API com os filtros atuais.
   *
   * @returns {Promise<void>}
   */
  async function buscar() {
    try {
      setOrdens(await listarOrdensServico(filtros));
      setErro('');
    } catch (falha) {
      setErro(lerMensagemDeErro(falha));
    }
  }

  // Ao abrir a tela: todas as ordens, sem filtro.
  useEffect(() => {
    buscar();
  }, []);

  /**
   * Atualiza o filtro que mudou, usando o name do campo (status, placa ou cliente).
   *
   * @param {import('react').ChangeEvent<HTMLInputElement|HTMLSelectElement>} evento Mudança em um campo de filtro.
   */
  function alterarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros({ ...filtros, [name]: value });
  }

  /**
   * Aplica os filtros ao clicar em "Filtrar" ou apertar Enter.
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário de filtros.
   */
  function filtrar(evento) {
    evento.preventDefault();
    buscar();
  }

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Ordens de serviço</h1>
          <p className="subtitulo">Acompanhe o andamento de cada veículo na oficina.</p>
        </div>
        <Link to="/ordens-servico/nova" className="botao botao-primario">Nova ordem de serviço</Link>
      </div>

      <form className="filtros" onSubmit={filtrar}>
        <label className="rotulo" htmlFor="status">
          Status
          <select id="status" name="status" className="campo" value={filtros.status} onChange={alterarFiltro}>
            <option value="">Todos</option>
            {Object.entries(TEXTO_DO_STATUS).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </label>
        <label className="rotulo" htmlFor="placa">
          Placa
          <input id="placa" name="placa" className="campo" placeholder="Ex.: ABC1D23"
            value={filtros.placa} onChange={alterarFiltro} />
        </label>
        <label className="rotulo" htmlFor="cliente">
          Cliente
          <input id="cliente" name="cliente" className="campo" placeholder="Nome do cliente"
            value={filtros.cliente} onChange={alterarFiltro} />
        </label>
        <button type="submit" className="botao botao-secundario">Filtrar</button>
      </form>

      {erro && <p className="alerta-erro">{erro}</p>}

      <div className="cartao">
        {ordens.length === 0 ? (
          <p className="vazio">Nenhuma ordem de serviço encontrada.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Abertura</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((ordem) => (
                <tr key={ordem.id}>
                  <td><strong>#{ordem.id}</strong></td>
                  <td>{ordem.clienteNome}</td>
                  <td>{ordem.modelo} · {ordem.placa}</td>
                  <td>{formatarData(ordem.dataAbertura)}</td>
                  <td>
                    <span className={`status status-${ordem.status}`}>{formatarStatus(ordem.status)}</span>
                  </td>
                  <td>{formatarPreco(ordem.valorTotal)}</td>
                  <td>
                    {ordem.status === 'CONCLUIDA' ? (
                      <button type="button" className="botao botao-secundario botao-pequeno" disabled>Editar</button>
                    ) : (
                      <Link to={`/ordens-servico/${ordem.id}/editar`} className="botao botao-secundario botao-pequeno">Editar</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default ListagemOrdensServico;
