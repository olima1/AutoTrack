import { Navigate, Outlet } from 'react-router-dom';
import { lerPerfil, lerToken, rotaInicial } from '../services/sessao.js';

/**
 * Só deixa abrir as rotas internas se houver alguém logado com o perfil certo (RNF007).
 * Sem token, redireciona para a tela de login. Com outro perfil, redireciona para a
 * tela inicial desse perfil (um Cliente que digitar /servicos volta para a área dele).
 * Quem protege os dados de verdade é a API (permitirPerfis); aqui é só a navegação.
 *
 * @param {object} props
 * @param {string} [props.perfil] Perfil exigido ('ADMINISTRADOR' ou 'CLIENTE').
 * @returns {JSX.Element}
 */
function RotaProtegida({ perfil }) {
  if (!lerToken()) {
    return <Navigate to="/login" replace />;
  }
  if (perfil && lerPerfil() !== perfil) {
    return <Navigate to={rotaInicial(lerPerfil())} replace />;
  }
  return <Outlet />;
}

export default RotaProtegida;
