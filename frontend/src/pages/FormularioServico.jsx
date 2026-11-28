import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { alterarServico, buscarServico, cadastrarServico, lerMensagemDeErro } from '../services/api.js';

/** Mensagem da interface IE_CamposObrigatorios. */
const MENSAGEM_CAMPOS_OBRIGATORIOS = 'Preencha todos os campos obrigatórios.';

/** Campos que precisam estar preenchidos antes de enviar. */
const CAMPOS_OBRIGATORIOS = ['nome', 'preco'];

/**
 * Interface I_FormularioServico.
 * Sem id na URL, cadastra um serviço (RF003). Com id, carrega e altera o serviço (RF005).
 *
 * @returns {JSX.Element}
 */
function FormularioServico() {
  const { id } = useParams();
  const ehEdicao = Boolean(id);
  const navigate = useNavigate();

  const [dados, setDados] = useState({ nome: '', descricao: '', preco: '' });
  const [camposVazios, setCamposVazios] = useState([]);
  const [janela, setJanela] = useState(null);

  // Na alteração, preenche o formulário com os dados atuais do serviço.
  useEffect(() => {
    if (!ehEdicao) return;
    buscarServico(id).then((servico) => setDados({
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco,
    })).catch((erro) => setJanela({
      tipo: 'erro', titulo: 'Serviço não encontrado', mensagem: lerMensagemDeErro(erro), voltarParaLista: true,
    }));
  }, [id, ehEdicao]);

  /**
   * Atualiza o campo que mudou, usando o name do input.
   *
   * @param {import('react').ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} evento Mudança em um campo.
   */
  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setDados({ ...dados, [name]: value });
  }

  /**
   * Destaca os campos vazios ou envia o serviço para a API: cadastra (RF003) ou altera (RF005).
   *
   * @param {import('react').FormEvent<HTMLFormElement>} evento Envio do formulário.
   * @returns {Promise<void>}
   */
  async function salvar(evento) {
    evento.preventDefault();
    const vazios = CAMPOS_OBRIGATORIOS.filter((campo) => !String(dados[campo]).trim());
    setCamposVazios(vazios);
    if (vazios.length > 0) return;

    try {
      const resposta = ehEdicao ? await alterarServico(id, dados) : await cadastrarServico(dados);
      const titulo = ehEdicao ? 'Serviço alterado' : 'Serviço cadastrado';
      setJanela({ tipo: 'sucesso', titulo: titulo, mensagem: resposta.mensagem, voltarParaLista: true });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível salvar', mensagem: lerMensagemDeErro(erro), voltarParaLista: false });
    }
  }

  /** Fecha o modal; quando indicado, volta para a listagem de serviços. */
  function fecharJanela() {
    if (janela.voltarParaLista) navigate('/servicos');
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
          <h1>{ehEdicao ? 'Editar serviço' : 'Novo serviço'}</h1>
          <p className="subtitulo">Campos marcados com * são obrigatórios.</p>
        </div>
      </div>

      <form className="cartao formulario" onSubmit={salvar} noValidate>
        {camposVazios.length > 0 && <p className="alerta-erro">{MENSAGEM_CAMPOS_OBRIGATORIOS}</p>}

        <label className="rotulo">
          Nome *
          <input type="text" name="nome" className={classeDoCampo('nome')} value={dados.nome} onChange={alterarCampo} maxLength={60} />
        </label>

        <label className="rotulo">
          Descrição
          <textarea name="descricao" className="campo" rows={3} value={dados.descricao} onChange={alterarCampo} maxLength={255} />
        </label>

        <label className="rotulo rotulo-curto">
          Preço (R$) *
          <input name="preco" type="number" step="0.01" min="0.01" className={classeDoCampo('preco')} value={dados.preco} onChange={alterarCampo} />
        </label>

        <div className="formulario-botoes">
          <Link to="/servicos" className="botao botao-secundario">Cancelar</Link>
          <button type="submit" className="botao botao-primario">Salvar</button>
        </div>
      </form>

      {janela && (
        <Modal tipo={janela.tipo} titulo={janela.titulo} mensagem={janela.mensagem} onFechar={fecharJanela} />
      )}
    </>
  );
}

export default FormularioServico;
