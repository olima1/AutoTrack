/**
 * Janela sobre a tela para as interfaces IS_ (sucesso) e IE_ (erro).
 *
 * @param {object} props
 * @param {'sucesso'|'erro'} props.tipo Define a cor da janela.
 * @param {string} props.titulo Título da janela.
 * @param {string} props.mensagem Mensagem exibida ao usuário.
 * @param {() => void} props.onFechar Função chamada ao clicar em OK.
 * @returns {JSX.Element}
 */
function Modal({ tipo, titulo, mensagem, onFechar }) {
  return (
    <div className="modal-fundo" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className={`modal modal-${tipo}`}>
        <h2 id="modal-titulo">{titulo}</h2>
        <p>{mensagem}</p>
        <div className="modal-botoes">
          <button type="button" className="botao botao-primario" onClick={onFechar}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;