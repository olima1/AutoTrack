import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import Login from './pages/Login.jsx';
import ListagemServicos from './pages/ListagemServicos.jsx';
import FormularioServico from './pages/FormularioServico.jsx';
import FormularioOrdemServico from './pages/FormularioOrdemServico.jsx';
import ListagemOrdensServico from './pages/ListagemOrdensServico.jsx';
import ListagemClientes from './pages/ListagemClientes.jsx';
import FormularioCliente from './pages/FormularioCliente.jsx';
import ListagemVeiculos from './pages/ListagemVeiculos.jsx';
import FormularioVeiculo from './pages/FormularioVeiculo.jsx';
import LayoutCliente from './components/LayoutCliente.jsx';
import DashboardCliente from './pages/DashboardCliente.jsx';
import AcompanhamentoOrdemServico from './pages/AcompanhamentoOrdemServico.jsx';

/**
 * Rotas do frontend. /login é pública. As telas do Administrador exigem o perfil ADMINISTRADOR
 * e usam o Layout com menu lateral; as do Cliente (/cliente) exigem o perfil CLIENTE e usam
 * o LayoutCliente (RNF007). Endereço desconhecido vai para o login.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RotaProtegida perfil="ADMINISTRADOR" />}>
        <Route element={<Layout />}>
          <Route path="/servicos" element={<ListagemServicos />} />
          <Route path="/servicos/novo" element={<FormularioServico />} />
          <Route path="/servicos/:id/editar" element={<FormularioServico />} />
          <Route path="/ordens-servico" element={<ListagemOrdensServico />} />
          <Route path="/ordens-servico/nova" element={<FormularioOrdemServico />} />
          <Route path="/ordens-servico/:id/editar" element={<FormularioOrdemServico />} />
          <Route path="/clientes" element={<ListagemClientes />} />
          <Route path="/clientes/novo" element={<FormularioCliente />} />
          <Route path="/clientes/:id/editar" element={<FormularioCliente />} />
          <Route path="/veiculos" element={<ListagemVeiculos />} />
          <Route path="/veiculos/novo" element={<FormularioVeiculo />} />
        </Route>
      </Route>
      <Route element={<RotaProtegida perfil="CLIENTE" />}>
        <Route element={<LayoutCliente />}>
          <Route path="/cliente" element={<DashboardCliente />} />
          <Route path="/cliente/ordens" element={<AcompanhamentoOrdemServico />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;