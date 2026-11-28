import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import { cadastrarVeiculo, lerMensagemDeErro, listarClientes } from '../services/api.js';

/** Mensagem da interface IE_CamposObrigatorios. */
const MENSAGEM_CAMPOS_OBRIGATORIOS = 'Preencha todos os campos obrigatórios.';

/** Campos que precisam estar preenchidos antes de enviar (RF010, fluxo alternativo 1). */
const CAMPOS_OBRIGATORIOS = ['clienteId', 'placa', 'marca', 'modelo', 'ano'];

/**
 * Tela I_FormularioVeiculo (RF010).
 * O Administrador seleciona o cliente e preenche placa, marca, modelo, ano e quilometragem.
 * Aceita ?clienteId=N na URL para já abrir com o cliente escolhido (vindo da ordem de serviço, RF012).
 * Os formatos e a placa duplicada são validados pela API, que devolve a mensagem exibida no modal de erro.
 *
 * @returns {JSX.Element}
 */
function FormularioVeiculo() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();

  const [clientes, setClientes] = useState([]);
  const [dados, setDados] = useState({
    clienteId: parametros.get('clienteId') ?? '',
    placa: '',
    marca: '',
    modelo: '',
    ano: '',
    quilometragem: '',
  });
  const [camposVazios, setCamposVazios] = useState([]);
  const [janela, setJanela] = useState(null);

  // Ao abrir a tela: lista de clientes para o select (passo 4)
  useEffect(() => {
    listarClientes()
      .then(setClientes)
      .catch((erro) => setJanela({ tipo: 'erro', titulo: 'Não foi possível carregar os clientes', mensagem: lerMensagemDeErro(erro) }));
  }, []);

  /**
   * Atualiza o campo que mudou, usando o name do input ou do select.
   *
   * @param {import('react').ChangeEvent<HTMLInputElement|HTMLSelectElement>} evento Mudança em um campo.
   */
  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setDados({ ...dados, [name]: value });
  }

  /**
   * Destaca os campos vazios ou envia o veículo para a API (RF010, passos 6 a 10).
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
      const resposta = await cadastrarVeiculo(dados);
      setJanela({ tipo: 'sucesso', titulo: 'Veículo cadastrado', mensagem: resposta.mensagem });
    } catch (erro) {
      setJanela({ tipo: 'erro', titulo: 'Não foi possível salvar', mensagem: lerMensagemDeErro(erro) });
    }
  }

  /** Fecha o modal; depois do sucesso, volta para a listagem de veículos (passo 11). */
  function fecharJanela() {
    if (janela.tipo === 'sucesso') navigate('/veiculos');
    setJanela(null);
  }

  /**
   * Classe do campo: destacada em vermelho se ficou vazio no último envio.
   *
   * @param {string} campo Nome do campo.
   * @returns {string} Classes CSS do campo.
   */
  function classeDoCampo(campo) {
    return camposVazios.includes(campo) ? 'campo campo-erro' : 'campo';
  }

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Novo veículo</h1>
          <p className="subtitulo">Todo veículo pertence a um cliente.</p>
        </div>
      </div>

      <form className="cartao formulario" onSubmit={salvar} noValidate>
        {camposVazios.length > 0 && <p className="alerta-erro">{MENSAGEM_CAMPOS_OBRIGATORIOS}</p>}

        <label className="rotulo">
          Cliente *
          <select name="clienteId" className={classeDoCampo('clienteId')} value={dados.clienteId} onChange={alterarCampo}>
            <option value="">Selecione o cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
        </label>

        <div className="ordem-linha">
          <label className="rotulo">
            Placa *
            <input type="text" name="placa" className={classeDoCampo('placa')} placeholder="ABC1D23 ou ABC-1234"
              value={dados.placa} onChange={alterarCampo} maxLength={8} />
          </label>
          <label className="rotulo">
            Marca *
            <input type="text" name="marca" className={classeDoCampo('marca')}
              value={dados.marca} onChange={alterarCampo} maxLength={40} />
          </label>
        </div>

        <label className="rotulo">
          Modelo *
          <input type="text" name="modelo" className={classeDoCampo('modelo')}
            value={dados.modelo} onChange={alterarCampo} maxLength={60} />
        </label>

        <div className="ordem-linha">
          <label className="rotulo">
            Ano *
            <input type="number" name="ano" className={classeDoCampo('ano')} min={1950}
              value={dados.ano} onChange={alterarCampo} />
          </label>
          <label className="rotulo">
            Quilometragem
            <input type="number" name="quilometragem" className="campo" min={0} placeholder="0"
              value={dados.quilometragem} onChange={alterarCampo} />
          </label>
        </div>

        <div className="formulario-botoes">
          <Link to="/veiculos" className="botao botao-secundario">Cancelar</Link>
          <button type="submit" className="botao botao-primario">Salvar</button>
        </div>
      </form>

      {janela && (
        <Modal tipo={janela.tipo} titulo={janela.titulo} mensagem={janela.mensagem} onFechar={fecharJanela} />
      )}
    </>
  );
}

export default FormularioVeiculo;
