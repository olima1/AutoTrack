/**
 * Ponto de entrada da API do AutoTrack.
 * Responsável por carregar as variáveis de ambiente, configurar o Express
 * e iniciar o servidor HTTP.
 */
require('dotenv').config();


const express = require('express');
const cors = require('cors');

const tratarErros = require('./middlewares/tratarErros');
const app = express();
const PORT = process.env.PORT || 3001;

// Permite que o frontend faça requisições e que a API leia JSON.
app.use(cors());
app.use(express.json());

/**
 * Rota de verificação de saúde da API.
 * Usada para confirmar que o backend está no ar.
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API AutoTrack em execução' });
});

/**app.use(tratarErros) necessita ser o último app.use */
app.use(tratarErros);

app.listen(PORT, () => {
  console.log(`API AutoTrack rodando em http://localhost:${PORT}`);
});
