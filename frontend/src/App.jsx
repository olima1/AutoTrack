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

/**
 * Rotas do frontend. /login é pública; as demais exigem sessão (RotaProtegida)
 * e usam o Layout com menu lateral. Endereço desconhecido vai para o login.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/servicos" element={<ListagemServicos />} />
          <Route path="/servicos/novo" element={<FormularioServico />} />
          <Route path="/servicos/:id/editar" element={<FormularioServico />} />
          <Route path="/ordens-servico" element={<ListagemOrdensServico />} />
          <Route path="/ordens-servico/nova" element={<FormularioOrdemServico />} />
          <Route path="/ordens-servico/:id/editar" element={<FormularioOrdemServico />} />
          <Route path="/clientes" element={<ListagemClientes />} />
          <Route path="/clientes/novo" element={<FormularioCliente />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;