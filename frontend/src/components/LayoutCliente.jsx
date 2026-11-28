import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { buscarPainelCliente, lerMensagemDeErro } from '../services/api.js';
import { encerrarSessao } from '../services/sessao.js';

/** Intervalo de atualização automática das ordens do cliente (RNF005: 30 segundos). */
const INTERVALO_ATUALIZACAO_MS = 30000;

/**
 * Moldura das telas do Cliente: barra superior e área de conteúdo (RF016).
 * Busca o painel do cliente ao abrir e de novo a cada 30 segundos, sem recarregar a página (RNF005),
 * e entrega os dados às páginas pelo contexto do <Outlet />.
 *
 * @returns {JSX.Element}
 */
function LayoutCliente() {
  const navigate = useNavigate();
  const [painel, setPainel] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [erro, setErro] = useState('');

  // Busca agora e repete a cada 30 s; o clearInterval para a repetição ao sair da área do cliente.
  useEffect(() => {
    function atualizar() {
      buscarPainelCliente()
        .then((dados) => {
          setPainel(dados);
          setAtualizadoEm(new Date());
          setErro('');
        })
        .catch((falha) => setErro(lerMensagemDeErro(falha)));
    }
    atualizar();
    const temporizador = setInterval(atualizar, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(temporizador);
  }, []);

  /** Encerra a sessão e volta para a tela de login (RF002). */
  function sair() {
    encerrarSessao();
    navigate('/login', { replace: true });
  }

  return (
    <div className="cliente-layout">
      <header className="cliente-topo">
        <div className="cliente-logo">AutoTrack</div>
        <nav className="cliente-menu">
          <NavLink to="/cliente" end className="cliente-menu-item">Início</NavLink>
          <NavLink to="/cliente/ordens" className="cliente-menu-item">Minhas ordens de serviço</NavLink>
          {painel && <span className="cliente-nome">{painel.nome}</span>}
          <button type="button" className="botao botao-secundario" onClick={sair}>Sair</button>
        </nav>
      </header>
      <main className="cliente-conteudo">
        {erro && <p className="alerta-erro">{erro}</p>}
        <Outlet context={{ painel, atualizadoEm }} />
      </main>
    </div>
  );
}

export default LayoutCliente;
