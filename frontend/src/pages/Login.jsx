import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fazerLogin, lerMensagemDeErro } from '../services/api';
import { rotaInicial, salvarSessao } from '../services/sessao';

/**
 * Tela I_Login (RF001).
 *
 * @returns {JSX.Element}
 */
function Login() {
  const navigate = useNavigate();
  const [dados, setDados] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setDados({ ...dados, [name]: value });
  }

  async function entrar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const sessao = await fazerLogin(dados);
      salvarSessao(sessao.token, sessao.perfil);
      navigate(rotaInicial(sessao.perfil), { replace: true });
    } catch (falha) {
      setErro(lerMensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-pagina">
      <form className="login-cartao" onSubmit={entrar} noValidate>
        <h1 className="login-logo">AutoTrack</h1>
        <p className="login-subtitulo">Entre com seu e-mail e senha</p>

        {erro && <div className="alerta-erro">{erro}</div>}

        <label className="rotulo" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="campo"
          value={dados.email} onChange={alterarCampo} autoFocus />

        <label className="rotulo" htmlFor="senha">Senha</label>
        <input id="senha" name="senha" type="password" className="campo"
          value={dados.senha} onChange={alterarCampo} />

        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default Login;