import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatarData, formatarPreco, formatarStatus, TEXTO_DO_STATUS } from '../utils/formatacao.js';

/** Etapas do andamento, na ordem em que aparecem na linha do tempo. */
const ETAPAS = Object.keys(TEXTO_DO_STATUS);

/**
 * Linha do tempo com as 4 etapas da ordem; as etapas até o status atual ficam marcadas.
 *
 * @param {object} props
 * @param {string} props.status Status atual da ordem.
 * @returns {JSX.Element}
 */
function LinhaDoTempo({ status }) {
  const atual = ETAPAS.indexOf(status);
  return (
    <ol className="linha-tempo">
      {ETAPAS.map((etapa, indice) => (
        <li key={etapa} className={indice <= atual ? 'etapa etapa-feita' : 'etapa'}>
          <span className="etapa-numero">{indice < atual ? '✓' : indice + 1}</span>
          <span>{TEXTO_DO_STATUS[etapa]}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Cartão com os detalhes de uma ordem: status, serviços, datas, valor total e observações (passos 3 e 6).
 *
 * @param {object} props
 * @param {object} props.ordem Ordem de serviço com a lista de serviços.
 * @returns {JSX.Element}
 */
function DetalheOrdem({ ordem }) {
  return (
    <section className="cartao painel-cartao">
      <div className="painel-titulo">
        <div>
          <h2>Ordem de serviço #{ordem.id}</h2>
          <p className="subtitulo">
            {ordem.marca} {ordem.modelo} · {ordem.placa} · aberta em {formatarData(ordem.dataAbertura)}
            {ordem.dataConclusao && ` · concluída em ${formatarData(ordem.dataConclusao)}`}
          </p>
        </div>
        <span className={`status status-${ordem.status}`}>{formatarStatus(ordem.status)}</span>
      </div>
      <LinhaDoTempo status={ordem.status} />
      <small className="subtitulo">Serviços</small>
      {ordem.servicos.map((servico) => (
        <p key={servico.nome} className="resumo-linha">
          <span>{servico.nome}</span>
          <span>{formatarPreco(servico.precoCobrado)}</span>
        </p>
      ))}
      <p className="resumo-linha resumo-total">
        <span>Valor total</span>
        <strong>{formatarPreco(ordem.valorTotal)}</strong>
      </p>
      {ordem.observacoes && (
        <div className="observacoes">
          <small>Observações da oficina</small>
          <p>{ordem.observacoes}</p>
        </div>
      )}
    </section>
  );
}

/**
 * Tela I_AcompanhamentoOrdemServico (RF016).
 * Mostra em destaque a ordem em andamento e, abaixo, o histórico das ordens concluídas (regra 3).
 * Clicar numa ordem do histórico mostra os detalhes dela; "Voltar" retorna à ordem em andamento.
 * Os dados vêm do LayoutCliente, atualizados a cada 30 segundos (RNF005).
 *
 * @returns {JSX.Element}
 */
function AcompanhamentoOrdemServico() {
  const { painel } = useOutletContext();
  const [selecionadaId, setSelecionadaId] = useState(null);
  if (!painel) {
    return <p className="vazio">Carregando...</p>;
  }

  const todas = [...painel.emAndamento, ...painel.historico];
  if (todas.length === 0) {
    return <p className="vazio">Você não possui ordens de serviço.</p>;
  }
  const selecionada = todas.find((ordem) => ordem.id === selecionadaId) ?? todas[0];

  return (
    <>
      <div className="pagina-cabecalho">
        <div>
          <h1>Acompanhar ordem de serviço</h1>
          <p className="subtitulo">Esta página é atualizada automaticamente a cada 30 segundos.</p>
        </div>
      </div>

      {painel.emAndamento.length > 1 && (
        <div className="acoes cliente-abas">
          {painel.emAndamento.map((ordem) => (
            <button key={ordem.id} type="button" onClick={() => setSelecionadaId(ordem.id)}
              className={ordem.id === selecionada.id ? 'botao botao-primario botao-pequeno' : 'botao botao-secundario botao-pequeno'}>
              #{ordem.id} · {ordem.placa}
            </button>
          ))}
        </div>
      )}

      <DetalheOrdem ordem={selecionada} />

      <div className="pagina-cabecalho historico-cabecalho">
        <h2>Histórico</h2>
        {selecionadaId !== null && (
          <button type="button" className="botao botao-secundario" onClick={() => setSelecionadaId(null)}>Voltar</button>
        )}
      </div>
      <div className="cartao">
        {painel.historico.length === 0 ? (
          <p className="vazio">Nenhuma ordem de serviço concluída.</p>
        ) : (
          <table className="tabela tabela-clicavel">
            <thead>
              <tr>
                <th>Número</th>
                <th>Veículo</th>
                <th>Conclusão</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {painel.historico.map((ordem) => (
                <tr key={ordem.id} onClick={() => setSelecionadaId(ordem.id)}
                  className={ordem.id === selecionada.id ? 'linha-selecionada' : ''}>
                  <td><strong>#{ordem.id}</strong></td>
                  <td>{ordem.modelo} · {ordem.placa}</td>
                  <td>{ordem.dataConclusao ? formatarData(ordem.dataConclusao) : '—'}</td>
                  <td><span className={`status status-${ordem.status}`}>{formatarStatus(ordem.status)}</span></td>
                  <td>{formatarPreco(ordem.valorTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default AcompanhamentoOrdemServico;
