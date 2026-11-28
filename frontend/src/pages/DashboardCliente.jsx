import { Link, useOutletContext } from 'react-router-dom';
import { formatarData, formatarPreco, formatarQuilometragem, formatarStatus } from '../utils/formatacao.js';

/**
 * Tela I_DashboardCliente (RF016, pré-condição).
 * Painel inicial do Cliente: resumo da ordem de serviço em andamento e os veículos dele.
 * Os dados vêm do LayoutCliente, que os atualiza a cada 30 segundos.
 *
 * @returns {JSX.Element}
 */
function DashboardCliente() {
  const { painel, atualizadoEm } = useOutletContext();
  if (!painel) {
    return <p className="vazio">Carregando...</p>;
  }

  const ordem = painel.emAndamento[0];
  const primeiroNome = painel.nome.split(' ')[0];

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Olá, {primeiroNome}</h1>
          <p className="subtitulo">Veja como está o seu veículo na oficina.</p>
        </div>
      </div>

      <section className="cartao painel-cartao">
        {ordem ? (
          <>
            <div className="painel-titulo">
              <div>
                <h2>Ordem de serviço #{ordem.id}</h2>
                <p className="subtitulo">
                  {ordem.marca} {ordem.modelo} · {ordem.placa} · aberta em {formatarData(ordem.dataAbertura)}
                </p>
              </div>
              <span className={`status status-${ordem.status}`}>{formatarStatus(ordem.status)}</span>
            </div>
            <div className="painel-resumo">
              <div><small>Serviços</small><strong>{ordem.servicos.length} serviço(s)</strong></div>
              <div><small>Valor total</small><strong>{formatarPreco(ordem.valorTotal)}</strong></div>
              <div><small>Última atualização</small><strong>{atualizadoEm?.toLocaleTimeString('pt-BR')}</strong></div>
            </div>
            <Link to="/cliente/ordens" className="botao botao-primario">Acompanhar ordem de serviço</Link>
          </>
        ) : (
          <p className="vazio">Nenhuma ordem de serviço em andamento.</p>
        )}
      </section>

      <section className="cartao painel-cartao">
        <h2>Meus veículos</h2>
        {painel.veiculos.length === 0 ? (
          <p className="subtitulo">Nenhum veículo cadastrado.</p>
        ) : (
          painel.veiculos.map((veiculo) => (
            <p key={veiculo.id} className="resumo-linha">
              <span>{veiculo.marca} {veiculo.modelo} {veiculo.ano}</span>
              <span className="subtitulo">{veiculo.placa} · {formatarQuilometragem(veiculo.quilometragem)}</span>
            </p>
          ))
        )}
      </section>
    </>
  );
}

export default DashboardCliente;
