import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ListagemServicos from './pages/ListagemServicos.jsx';
import FormularioServico from './pages/FormularioServico.jsx';

/**
 * Rotas do frontend. As telas do Administrador usam o Layout (menu lateral).
 * Qualquer endereço desconhecido volta para a listagem de serviços.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/servicos" element={<ListagemServicos />} />
        <Route path="/servicos/novo" element={<FormularioServico />}/>
        <Route path="/servicos/:id/editar" element={<FormularioServico />} />
      </Route>
      <Route path="*" element={<Navigate to="/servicos" replace />} />
    </Routes>
  );
}

export default App;
