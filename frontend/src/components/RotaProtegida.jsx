import { Navigate, Outlet } from 'react-router-dom';
import { lerToken } from '../services/sessao';

/**
 * Só deixa abrir as rotas internas se houver alguém logado (RNF007).
 * Sem token, redireciona para a tela de login.
 *
 * @returns {JSX.Element}
 */
function RotaProtegida() {
  return lerToken() ? <Outlet /> : <Navigate to="/login" replace />
}

export default RotaProtegida;