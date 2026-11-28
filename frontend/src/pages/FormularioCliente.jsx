import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { alterarCliente, buscarCliente, cadastrarCliente, lerMensagemDeErro } from '../services/api.js';
import { formatarCpf, formatarTelefone } from '../utils/formatacao.js';

/** Mensagem da interface IE_CamposObrigatorios. */
const MENSAGEM_CAMPOS_OBRIGATORIOS = 'Preencha todos os campos obrigatórios.';

/** Campos obrigatórios no cadastro (RF007, fluxo alternativo 1). */
const CAMPOS_CADASTRO = ['nome', 'cpf', 'telefone', 'email', 'senha'];

/** Campos obrigatórios na alteração: o CPF não muda (RF009, regra 1) e a senha não é alterada aqui. */
const CAMPOS_ALTERACAO = ['nome', 'telefone'];

/**
 * Tela I_FormularioCliente (RF007 e RF009).
 * Sem id na URL, cadastra o cliente e o acesso dele (e-mail e senha inicial).
 * Com id, abre preenchida para alterar nome, telefone e e-mail; o CPF fica travado (RF009, regra 1)
 * e o e-mail só pode ser alterado se o cliente tiver acesso ao sistema.
 * Os formatos e os duplicados são validados pela API, que devolve a mensagem exibida no modal de erro.
 *
 * @returns {JSX.Element}
 */
function FormularioCliente() {
  const { id } = useParams();
  const ehEdicao = Boolean(id);
  const navigate = useNavigate();

  const [dados, setDados] = useState({ nome: '', cpf: '', telefone: '', email: '', senha: '' });
  // Na edição: se o cliente já tem acesso ao sistema (e-mail em Usuario)
  const [temAcesso, setTemAcesso] = useState(true);
  const [camposVazios, setCamposVazios] = useState([]);
  const [janela, setJanela] = useState(null);

  // Na edição: carrega o cliente e preenche o formulário (RF009, passo 2)
  useEffect(() => {
    if (!ehEdicao) return;
    buscarCliente(id)
      .then((cliente) => {
        setTemAcesso(cliente.email !== null);
        setDados({
          nome: cliente.nome,
          cpf: formatarCpf(cliente.cpf),
          telefone: formatarTelefone(cliente.telefone),
          email: cliente.email ?? '',
          senha: '',
        });
      })
      .catch((erro) => setJanela({
        tipo: 'erro', titulo: 'Cliente não encontrado', mensagem: lerMensagemDeErro(erro), voltarParaLista: true,
      }));
  }, [id, ehEdicao]);

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
   * Campos obrigatórios conforme o modo: cadastro, ou alteração com/sem acesso.
   *
   * @returns {string[]} Nomes dos campos a conferir.
   */
  function camposObrigatorios() {
    if (!ehEdicao) return CAMPOS_CADASTRO;
    return temAcesso ? [...CAMPOS_ALTERACAO, 'email'] : CAMPOS_ALTERACAO;
  }

  /**
   * Envia para a API: cadastra (RF007) ou altera (RF009) o cliente.
   *
   * @returns {Promise<{ mensagem: string }>} Resposta da API.
   */
  function enviar() {
    if (!ehEdicao) return cadastrarCliente(dados);
    const alteracao = { nome: dados.nome, telefone: dados.telefone };
    return alterarCliente(id, temAcesso ? { ...alteracao, email: dados.email } : alteracao);
  }

  /**
   * Destaca os campos vazios ou envia o cliente para a API e mostra o modal de sucesso ou de erro.
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário.
   * @returns {Promise<void>}
   */
  async function salvar(evento) {
    evento.preventDefault();
    const vazios = camposObrigatorios().filter((campo) => !dados[campo].trim());
    setCamposVazios(vazios);
    if (vazios.length > 0) return;

    try {
      const resposta = await enviar();
      const titulo = ehEdicao ? 'Cliente alterado' : 'Cliente cadastrado';
      setJanela({ tipo: 'sucesso', titulo, mensagem: resposta.mensagem, voltarParaLista: true });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível salvar', mensagem: lerMensagemDeErro(erro), voltarParaLista: false });
    }
  }

  /** Fecha o modal; depois do sucesso (ou se o cliente não existir), volta para a listagem. */
  function fecharJanela() {
    if (janela.voltarParaLista) navigate('/clientes');
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
          <h1>{ehEdicao ? 'Editar cliente' : 'Novo cliente'}</h1>
          <p className="subtitulo">
            {ehEdicao
              ? 'O CPF não pode ser alterado depois do cadastro.'
              : 'O e-mail e a senha inicial formam o acesso do Cliente ao AutoTrack.'}
          </p>
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
              value={dados.cpf} onChange={alterarCampo} maxLength={14} inputMode="numeric" disabled={ehEdicao} />
          </label>
          <label className="rotulo">
            Telefone *
            <input type="tel" name="telefone" className={classeDoCampo('telefone')} placeholder="(35) 99812-4410"
              value={dados.telefone} onChange={alterarCampo} maxLength={15} />
          </label>
        </div>

        <div className="ordem-linha">
          <label className="rotulo">
            E-mail de acesso {temAcesso && '*'}
            <input type="email" name="email" className={classeDoCampo('email')}
              value={dados.email} onChange={alterarCampo} maxLength={100} disabled={!temAcesso}
              placeholder={temAcesso ? '' : 'Cliente sem acesso ao sistema'} />
          </label>
          {!ehEdicao && (
            <label className="rotulo">
              Senha inicial *
              <input type="password" name="senha" className={classeDoCampo('senha')} placeholder="Mínimo de 8 caracteres"
                value={dados.senha} onChange={alterarCampo} autoComplete="new-password" />
            </label>
          )}
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
