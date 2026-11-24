import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { encerrarSessao } from '../services/sessao.js';

/**
 * Moldura das telas do Administrador: menu lateral e área de conteúdo.
 * A página da rota atual aparece no lugar do <Outlet />.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  const navigate = useNavigate();

  /** Encerra a sessão e volta para a tela de login (RF002). */
  function sair() {
    encerrarSessao();
    navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <aside className="menu">
        <div className="menu-logo">AutoTrack</div>
        <nav className="menu-itens">
          <NavLink to="/painel" className="menu-item">Painel</NavLink>
          <NavLink to="/ordens-servico" className="menu-item">Ordens de serviço</NavLink>
          <NavLink to="/clientes" className="menu-item">Clientes</NavLink>
          <NavLink to="/veiculos" className="menu-item">Veículos</NavLink>
          <NavLink to="/servicos" className="menu-item">Serviços</NavLink>
        </nav>
        <div className="menu-rodape">
          <div className="menu-usuario">
            <span className="menu-avatar">A</span>
            <div>
              <strong>Oficina Lima</strong>
              <small>Administrador</small>
            </div>
          </div>
          <button type="button" className="menu-item" onClick={sair}>Sair</button>
        </div>
      </aside>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;