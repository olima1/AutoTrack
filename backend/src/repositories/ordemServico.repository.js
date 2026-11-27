/**
 * Acesso às tabelas OrdemServico e ServicoDaOrdem no MySQL (BP05).
 * Só executa SQL e devolve os dados; as regras de negócio ficam no ordemServico.service.js.
 */
const pool = require('../config/database');
const { STATUS_ORDEM } = require('../constantes');

/**
 * Verifica se o veículo tem alguma ordem de serviço que ainda não foi concluída (RF012, regra 3).
 *
 * @param {number|string} veiculoId Id do veículo.
 * @returns {Promise<boolean>} true se existir ordem aberta, em andamento ou aguardando peças.
 */
async function existeOrdemNaoConcluida(veiculoId) {
  const [linhas] = await pool.query(
    'SELECT COUNT(*) AS quantidade FROM OrdemServico WHERE veiculo_id = ? AND status <> ?',
    [veiculoId, STATUS_ORDEM.CONCLUIDA],
  );
  return linhas[0].quantidade > 0;
}

/**
 * Grava a ordem de serviço com status "Aberta" e os seus serviços em uma única transação (RF012).
 * Se qualquer INSERT falhar, o rollback desfaz tudo: não fica ordem sem serviço no banco.
 *
 * @param {{ clienteId: number, veiculoId: number, observacoes: string|null, valorTotal: number }} ordem Dados da ordem.
 * @param {{ servicoId: number, precoCobrado: number }[]} itens Serviços da ordem com o preço copiado do catálogo (regra 5).
 * @returns {Promise<number>} Id da ordem de serviço criada.
 */
async function inserir(ordem, itens) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [resultado] = await conexao.query(
      'INSERT INTO OrdemServico (cliente_id, veiculo_id, status, observacoes, valor_total) VALUES (?, ?, ?, ?, ?)',
      [ordem.clienteId, ordem.veiculoId, STATUS_ORDEM.ABERTA, ordem.observacoes, ordem.valorTotal]
    );
    const linhas = itens.map((item) => [resultado.insertId, item.servicoId, item.precoCobrado]);
    await conexao.query(
      'INSERT INTO ServicoDaOrdem (ordem_servico_id, servico_id, preco_cobrado) VALUES ?',
      [linhas]
    );
    await conexao.commit();
    return resultado.insertId;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = { inserir, existeOrdemNaoConcluida };