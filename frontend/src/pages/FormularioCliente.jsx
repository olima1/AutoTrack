import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { cadastrarCliente, lerMensagemDeErro } from '../services/api.js';

/** Mensagem da interface IE_CamposObrigatorios. */
const MENSAGEM_CAMPOS_OBRIGATORIOS = 'Preencha todos os campos obrigatórios.';

/** Campos que precisam estar preenchidos antes de enviar (RF007, fluxo alternativo 1). */
const CAMPOS_OBRIGATORIOS = ['nome', 'cpf', 'telefone', 'email', 'senha'];

/**
 * Tela I_FormularioCliente (RF007).
 * Cadastra o cliente e o acesso dele ao sistema (e-mail e senha inicial).
 * Os formatos (CPF, telefone, e-mail, senha) e os duplicados são validados pela API,
 * que devolve a mensagem exibida no modal de erro.
 *
 * @returns {JSX.Element}
 */
function FormularioCliente() {
  const navigate = useNavigate();
  const [dados, setDados] = useState({ nome: '', cpf: '', telefone: '', email: '', senha: '' });
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
   * Destaca os campos vazios ou envia o cliente para a API (RF007, passos 5 a 9).
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário.
   * @returns {Promise<void>}
   */
  async function salvar(evento) {
    evento.preventDefault();
    const vazios = CAMPOS_OBRIGATORIOS.filter((campo) => !dados[campo].trim());
    setCamposVazios(vazios);
    if (vazios.length > 0) return;

    try {
      const resposta = await cadastrarCliente(dados);
      setJanela({ tipo: 'sucesso', titulo: 'Cliente cadastrado', mensagem: resposta.mensagem });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível salvar', mensagem: lerMensagemDeErro(erro) });
    }
  }

  /** Fecha o modal; depois do sucesso, volta para a listagem de clientes (passo 10). */
  function fecharJanela() {
    if (janela.tipo === 'sucesso') navigate('/clientes');
    setJanela(null);
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
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Novo cliente</h1>
          <p className="subtitulo">O e-mail e a senha inicial formam o acesso do Cliente ao AutoTrack.</p>
        </div>
      </div>

      <form className="cartao formulario" onSubmit={salvar} noValidate>
        {camposVazios.length > 0 && <p className="alerta-erro">{MENSAGEM_CAMPOS_OBRIGATORIOS}</p>}

        <label className="rotulo">
          Nome completo *
          <input type="text" name="nome" className={classeDoCampo('nome')}
            value={dados.nome} onChange={alterarCampo} maxLength={100} />
        </label>

        <div className="ordem-linha">
          <label className="rotulo">
            CPF *
            <input type="text" name="cpf" className={classeDoCampo('cpf')} placeholder="123.456.789-09"
              value={dados.cpf} onChange={alterarCampo} maxLength={14} inputMode="numeric" />
          </label>
          <label className="rotulo">
            Telefone *
            <input type="tel" name="telefone" className={classeDoCampo('telefone')} placeholder="(35) 99812-4410"
              value={dados.telefone} onChange={alterarCampo} maxLength={15} />
          </label>
        </div>

        <div className="ordem-linha">
          <label className="rotulo">
            E-mail de acesso *
            <input type="email" name="email" className={classeDoCampo('email')}
              value={dados.email} onChange={alterarCampo} maxLength={100} />
          </label>
          <label className="rotulo">
            Senha inicial *
            <input type="password" name="senha" className={classeDoCampo('senha')} placeholder="Mínimo de 8 caracteres"
              value={dados.senha} onChange={alterarCampo} autoComplete="new-password" />
          </label>
        </div>

        <div className="formulario-botoes">
          <Link to="/clientes" className="botao botao-secundario">Cancelar</Link>
          <button type="submit" className="botao botao-primario">Salvar</button>
        </div>
      </form>

      {janela && (
        <Modal tipo={janela.tipo} titulo={janela.titulo} mensagem={janela.mensagem} onFechar={fecharJanela} />
      )}
    </>
  );
}

export default FormularioCliente;
