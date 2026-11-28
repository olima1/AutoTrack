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

/**
 * Lista as ordens de serviço com cliente e veículo, aplicando só os filtros preenchidos (RF013).
 * Os valores digitados vão sempre nos ? (sem risco de SQL injection).
 *
 * @param {{ status?: string, placa?: string, cliente?: string }} filtros Filtros opcionais e combináveis.
 * @returns {Promise<object[]>} Ordens com clienteNome, placa e modelo, da mais recente para a mais antiga.
 */
async function buscarComFiltros(filtros) {
  const condicoes = [];
  const valores = [];

  if (filtros.status) {
    condicoes.push('o.status = ?');
    valores.push(filtros.status);
  }
  if (filtros.placa) {
    condicoes.push('v.placa LIKE ?');
    valores.push('%' + filtros.placa + '%');
  }
  if (filtros.cliente) {
    condicoes.push('c.nome LIKE ?');
    valores.push('%' + filtros.cliente + '%');
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
  const [linhas] = await pool.query(
    `SELECT o.id, o.data_abertura AS dataAbertura, o.status, o.valor_total AS valorTotal, c.nome AS clienteNome, v.placa, v.modelo
    FROM OrdemServico o JOIN Cliente c ON c.id = o.cliente_id JOIN Veiculo v ON v.id = o.veiculo_id
    ${where} ORDER BY o.data_abertura DESC, o.id DESC`, valores
  );
  return linhas;
}

/**
 * Busca uma ordem de serviço com o cliente e o veículo, para a tela de edição (RF014, passo 2).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @returns {Promise<object|null>} A ordem (com clienteId, veiculoId, clienteNome, placa e modelo) ou null se não existir.
 */
async function buscarPorId(id) {
  const [linhas] = await pool.query(`SELECT o.id, o.data_abertura AS dataAbertura, o.status, o.valor_total AS valorTotal,
    c.nome AS clienteNome, v.placa, v.modelo, o.observacoes, o.cliente_id AS clienteId, o.veiculo_id AS veiculoId
    FROM OrdemServico o JOIN Cliente c ON c.id = o.cliente_id JOIN Veiculo v ON v.id = o.veiculo_id WHERE o.id = ?`,
    [id]
  );
  return linhas[0] ?? null;
}

/**
 * Lista os serviços já gravados na ordem, com o preço cobrado na abertura (RF014, regra 5).
 *
 * @param {number|string} id Id da ordem de serviço.
 * @returns {Promise<{ servicoId: number, precoCobrado: string }[]>} Serviços da ordem.
 */
async function buscarServicosDaOrdem(id) {
  const [linhas] = await pool.query(
    'SELECT servico_id AS servicoId, preco_cobrado AS precoCobrado FROM ServicoDaOrdem WHERE ordem_servico_id = ?',
    [id]
  );
  return linhas;
}

/**
 * Atualiza a ordem de serviço em uma única transação (RF014):
 * status, observações, valor total e data de conclusão; remove os serviços desmarcados
 * e insere os serviços novos. Se qualquer comando falhar, o rollback desfaz tudo.
 *
 * @param {number|string} id Id da ordem de serviço.
 * @param {{ status: string, observacoes: string|null, valorTotal: number }} ordem Dados novos da ordem.
 * @param {object} servicos Serviços da ordem depois da alteração.
 * @param {{ servicoId: number, precoCobrado: number }[]} servicos.itensNovos Só os serviços adicionados agora, com o preço vigente (regra 5).
 * @param {number[]} servicos.servicosIds Ids de todos os serviços que ficaram marcados (os outros são removidos).
 * @returns {Promise<void>}
 */
async function atualizar(id, ordem, { itensNovos, servicosIds }) {
  // A data de conclusão usa o relógio do MySQL (NOW()), o mesmo da data de abertura (CURRENT_TIMESTAMP).
  const concluida = ordem.status === STATUS_ORDEM.CONCLUIDA;
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    await conexao.query(
      'UPDATE OrdemServico SET status = ?, observacoes = ?, valor_total = ?, data_conclusao = IF(?, NOW(), NULL) WHERE id = ?',
      [ordem.status, ordem.observacoes, ordem.valorTotal, concluida, id]
    );
    await conexao.query('DELETE FROM ServicoDaOrdem WHERE ordem_servico_id = ? AND servico_id NOT IN (?)', [id, servicosIds]);
    if (itensNovos.length > 0) {
      const linhas = itensNovos.map((item) => [id, item.servicoId, item.precoCobrado]);
      await conexao.query('INSERT INTO ServicoDaOrdem (ordem_servico_id, servico_id, preco_cobrado) VALUES ?', [linhas]);
    }
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

/**
 * Exclui a ordem de serviço e os serviços vinculados a ela em uma única transação (RF015, passo 6).
 * Os serviços da ordem (ServicoDaOrdem) são apagados primeiro, porque a chave estrangeira
 * impede apagar uma ordem que ainda tem serviços. Se algo falhar, o rollback desfaz tudo.
 *
 * @param {number|string} id Id da ordem de serviço.
 * @returns {Promise<void>}
 */
async function excluir(id) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    await conexao.query('DELETE FROM ServicoDaOrdem WHERE ordem_servico_id = ?', [id]);
    await conexao.query('DELETE FROM OrdemServico WHERE id = ?', [id]);
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

/**
 * Lista as ordens de serviço de um cliente com o veículo, da mais recente para a mais antiga (RF016, passo 2).
 * Filtra pelo cliente_id: o Cliente só vê as ordens dos próprios veículos (regra 1).
 *
 * @param {number} clienteId Id do cliente logado (vem do token, nunca da URL).
 * @returns {Promise<object[]>} Ordens com datas, status, observações, valor total e veículo.
 */
async function buscarPorCliente(clienteId) {
  const [linhas] = await pool.query(
    `SELECT o.id, o.data_abertura AS dataAbertura, o.data_conclusao AS dataConclusao, o.status,
       o.observacoes, o.valor_total AS valorTotal, v.placa, v.marca, v.modelo
     FROM OrdemServico o
     JOIN Veiculo v ON v.id = o.veiculo_id
     WHERE o.cliente_id = ?
     ORDER BY o.data_abertura DESC, o.id DESC`,
    [clienteId]
  );
  return linhas;
}

/**
 * Lista os serviços de várias ordens de uma vez, com o nome e o preço cobrado (RF016, passo 6).
 *
 * @param {number[]} ordensIds Ids das ordens de serviço.
 * @returns {Promise<{ ordemId: number, nome: string, precoCobrado: string }[]>} Serviços das ordens.
 */
async function buscarServicosDasOrdens(ordensIds) {
  if (ordensIds.length === 0) {
    return [];
  }
  const [linhas] = await pool.query(
    `SELECT sdo.ordem_servico_id AS ordemId, s.nome, sdo.preco_cobrado AS precoCobrado
     FROM ServicoDaOrdem sdo
     JOIN Servico s ON s.id = sdo.servico_id
     WHERE sdo.ordem_servico_id IN (?)
     ORDER BY s.nome`,
    [ordensIds]
  );
  return linhas;
}

module.exports = {
  inserir,
  existeOrdemNaoConcluida,
  buscarComFiltros,
  atualizar,
  buscarPorId,
  buscarServicosDaOrdem,
  excluir,
  buscarPorCliente,
  buscarServicosDasOrdens,
};