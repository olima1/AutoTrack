import { Navigate, Outlet } from 'react-router-dom';
import { lerPerfil, lerPrimeiroAcesso, lerToken, rotaInicial } from '../services/sessao.js';

/**
 * Só deixa abrir as rotas internas se houver alguém logado com o perfil certo (RNF007).
 * Sem token, redireciona para a tela de login. Com outro perfil, redireciona para a
 * tela inicial desse perfil (um Cliente que digitar /servicos volta para a área dele).
 * Enquanto o Cliente não trocar a senha inicial, só a tela de primeiro acesso abre (RF017, regra 1).
 * Quem protege os dados de verdade é a API (permitirPerfis e exigirSenhaAlterada); aqui é só a navegação.
 *
 * @param {object} props
 * @param {string} [props.perfil] Perfil exigido ('ADMINISTRADOR' ou 'CLIENTE').
 * @param {boolean} [props.primeiroAcesso] true na rota da tela de primeiro acesso.
 * @returns {JSX.Element}
 */
function RotaProtegida({ perfil, primeiroAcesso = false }) {
  if (!lerToken()) {
    return <Navigate to="/login" replace />;
  }
  const destino = rotaInicial(lerPerfil(), lerPrimeiroAcesso());
  const perfilErrado = perfil && lerPerfil() !== perfil;
  const telaErrada = perfil === 'CLIENTE' && lerPrimeiroAcesso() !== primeiroAcesso;
  if (perfilErrado || telaErrada) {
    return <Navigate to={destino} replace />;
  }
  return <Outlet />;
}

export default RotaProtegida;
