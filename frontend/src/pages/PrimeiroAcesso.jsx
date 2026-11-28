import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { alterarSenhaInicial, lerMensagemDeErro } from '../services/api.js';
import { encerrarSessao, salvarSessao } from '../services/sessao.js';

/** Campos que precisam estar preenchidos (RF017, fluxo alternativo 1). */
const CAMPOS_OBRIGATORIOS = ['novaSenha', 'confirmacao'];

/**
 * Tela I_PrimeiroAcesso (RF017).
 * No primeiro login, o Cliente troca a senha inicial definida pela oficina por uma senha própria.
 * A força da senha, a confirmação e a diferença da senha inicial são validadas pela API,
 * que devolve as mensagens de IE_SenhaFraca e IE_SenhasDiferentes.
 *
 * @returns {JSX.Element}
 */
function PrimeiroAcesso() {
  const navigate = useNavigate();
  const [dados, setDados] = useState({ novaSenha: '', confirmacao: '' });
  const [camposVazios, setCamposVazios] = useState([]);
  const [janela, setJanela] = useState(null);

  /**
   * Atualiza o campo que mudou, usando o name do input.
   *
   * @param {import('react').ChangeEvent<HTMLInputElement>} evento Mudança em um campo.
   */
  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setDados({ ...dados, [name]: value });
  }

  /**
   * Destaca os campos vazios ou envia a nova senha (RF017, passos 1 a 6).
   * No sucesso, troca o token da sessão pelo novo, já sem a pendência do primeiro acesso.
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário.
   * @returns {Promise<void>}
   */
  async function salvar(evento) {
    evento.preventDefault();
    const vazios = CAMPOS_OBRIGATORIOS.filter((campo) => !dados[campo]);
    setCamposVazios(vazios);
    if (vazios.length > 0) return;

    try {
      const resposta = await alterarSenhaInicial(dados);
      salvarSessao(resposta.token, 'CLIENTE', false);
      setJanela({ tipo: 'sucesso', titulo: 'Senha alterada', mensagem: resposta.mensagem });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível alterar a senha', mensagem: lerMensagemDeErro(erro) });
    }
  }

  /** Fecha o modal; depois do sucesso, leva ao painel do Cliente (passo 7). */
  function fecharJanela() {
    if (janela.tipo === 'sucesso') navigate('/cliente', { replace: true });
    setJanela(null);
  }

  /** Sai sem trocar a senha: encerra a sessão e volta ao login. */
  function sair() {
    encerrarSessao();
    navigate('/login', { replace: true });
  }

  /**
   * Classe do input: destacada em vermelho se o campo ficou vazio no último envio.
   *
   * @param {string} campo Nome do campo.
   * @returns {string} Classes CSS do input.
   */
  function classeDoCampo(campo) {
    return camposVazios.includes(campo) ? 'campo campo-erro' : 'campo';
  }

  return (
    <div className="login-pagina">
      <form className="login-cartao" onSubmit={salvar} noValidate>
        <h1 className="login-logo">AutoTrack</h1>
        <h2 className="primeiro-acesso-titulo">Crie sua senha</h2>
        <p className="login-subtitulo">Este é o seu primeiro acesso: troque a senha inicial definida pela oficina.</p>

        {camposVazios.length > 0 && <div className="alerta-erro">Preencha todos os campos obrigatórios.</div>}

        <label className="rotulo" htmlFor="novaSenha">
          Nova senha *
          <input id="novaSenha" name="novaSenha" type="password" className={classeDoCampo('novaSenha')}
            value={dados.novaSenha} onChange={alterarCampo} autoComplete="new-password" autoFocus />
        </label>
        <label className="rotulo" htmlFor="confirmacao">
          Confirmar nova senha *
          <input id="confirmacao" name="confirmacao" type="password" className={classeDoCampo('confirmacao')}
            value={dados.confirmacao} onChange={alterarCampo} autoComplete="new-password" />
        </label>

        <p className="observacoes dica-senha">Mínimo de 8 caracteres, com letras e números, diferente da senha inicial.</p>

        <button type="submit" className="botao botao-primario">Salvar</button>
        <button type="button" className="botao botao-secundario" onClick={sair}>Sair</button>
      </form>

      {janela && (
        <Modal tipo={janela.tipo} titulo={janela.titulo} mensagem={janela.mensagem} onFechar={fecharJanela} />
      )}
    </div>
  );
}

export default PrimeiroAcesso;
