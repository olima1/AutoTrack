import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lerMensagemDeErro, listarClientes } from '../services/api.js';
import { formatarCpf } from '../utils/formatacao.js';

/**
 * Tela I_ListagemClientes (RF007, passos 2 e 3).
 * Lista os clientes em ordem alfabética e leva ao cadastro de um novo cliente.
 * A busca por nome ou CPF e as colunas de telefone e e-mail entram no RF008.
 *
 * @returns {JSX.Element}
 */
function ListagemClientes() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState('');

  // Ao abrir a tela: todos os clientes
  useEffect(() => {
    listarClientes()
      .then((lista) => {
        setClientes(lista);
        setErro('');
      })
      .catch((falha) => setErro(lerMensagemDeErro(falha)));
  }, []);

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Clientes</h1>
          <p className="subtitulo">Clientes da oficina e o acesso deles ao AutoTrack.</p>
        </div>
        <Link to="/clientes/novo" className="botao botao-primario">Novo cliente</Link>
      </div>

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
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{formatarCpf(cliente.cpf)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default ListagemClientes;
