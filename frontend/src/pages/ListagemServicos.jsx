import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarServicos } from '../services/api';

/**
 * Formata um preço vindo do banco ("150.00") em reais ("R$ 150,00").
 *
 * @param {number|string} preco Preço do serviço.
 * @returns {string} Preço formatado.
 */
function formatarPreco(preco) {
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Interface I_ListagemServicos (RF004).
 * Lista os serviços do catálogo, com busca pelo nome, e leva ao cadastro e à alteração.
 *
 * @returns {JSX.Element}
 */
function ListagemServicos() {
  const [servicos, setServicos] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');

  // Busca de novo a cada letra digitada.
  useEffect(() => {
    listarServicos(busca)
      .then((lista) => {
        setServicos(lista);
        setErro('');
      })
      .catch(() => setErro('Não foi possível carregar os serviços. Verifique se a API está no ar.'));
  }, [busca]);

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
                  <td className="acoes">
                    <Link
                      to={`/servicos/${servico.id}/editar`}
                      className="botao botao-secundario botao-pequeno"
                    >
                      Editar
                    </Link>
                    <button type="button" className="botao botao-perigo botao-pequeno" disabled>
                      Excluir
                    </button>
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

export default ListagemServicos;