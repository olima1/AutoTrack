import { useEffect, useState } from 'react';
import axios from 'axios';

const URL_API = 'http://localhost:3001/api';

/**
 * Tela inicial provisória (Sprint 0).
 * Apenas confirma que o frontend está no ar e consegue falar com a API.
 */
function App() {
  const [statusApi, setStatusApi] = useState('verificando...');

  useEffect(() => {
    axios
      .get(`${URL_API}/health`)
      .then((resposta) => setStatusApi(resposta.data.mensagem))
      .catch(() => setStatusApi('API fora do ar - inicie o backend'));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 32 }}>
      <h1>AutoTrack</h1>
      <p>Gestão de ordens de serviço para oficinas mecânicas.</p>
      <p>
        Status da API: <strong>{statusApi}</strong>
      </p>
    </main>
  );
}

export default App;
