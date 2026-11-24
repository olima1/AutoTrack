/**
 * Janela sobre a tela para as interfaces IS_ (sucesso), IE_ (erro) e de confirmação (perigo).
 * Sem botões próprios (children), mostra um botão OK que chama onFechar.
 *
 * @param {object} props
 * @param {'sucesso'|'erro'|'perigo'} props.tipo Define a cor da janela.
 * @param {string} props.titulo Título da janela.
 * @param {string} props.mensagem Mensagem exibida ao usuário.
 * @param {() => void} [props.onFechar] Função chamada ao clicar em OK.
 * @param {import('react').ReactNode} [props.children] Botões próprios, no lugar do OK.
 * @returns {JSX.Element}
 */
function Modal({ tipo, titulo, mensagem, onFechar, children }) {
  return (
    <div className="modal-fundo" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className={`modal modal-${tipo}`}>
        <h2 id="modal-titulo">{titulo}</h2>
        <p>{mensagem}</p>
        <div className="modal-botoes">
          {children ?? (
            <button type="button" className="botao botao-primario" onClick={onFechar}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;