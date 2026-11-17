# Boas Práticas de Codificação — AutoTrack

**Versão:** 1.0 — 17/11/2026
**Tarefa:** #22 (Sprint 2) — Detalhar e aplicar boas práticas de codificação para garantir legibilidade.
**Base:** *Clean Code* (Robert C. Martin), princípios **SOLID** e o material de codificação da sala virtual.

Este documento define as 7 regras que todo código do AutoTrack segue, no backend (Node.js/Express), no frontend (React) e nos testes. Cada regra traz o motivo, um exemplo certo e um errado tirados do próprio projeto, e como verificar se ela foi cumprida. As regras BP01 e BP02 são as obrigatórias da tarefa: padrão de notação e documentação do código.

---

## BP01 — Padrão de notação *(obrigatória)*

Cada tipo de nome tem uma única forma de escrita:

| O quê | Padrão | Exemplo |
|---|---|---|
| Variáveis, funções e parâmetros | `camelCase` | `precoCobrado`, `cadastrarServico()` |
| Classes e componentes React | `PascalCase` | `ServicoService`, `ListagemServicos` |
| Constantes de valor fixo | `UPPER_SNAKE_CASE` | `STATUS_ORDEM`, `TEMPO_SESSAO_MINUTOS` |
| Tabelas e colunas do banco | `PascalCase` (tabela) e `snake_case` (coluna), como no dicionário de dados | `OrdemServico.data_abertura` |
| Arquivos do backend | minúsculas, com a camada no nome | `servico.controller.js`, `servico.repository.js` |
| Arquivos de componentes React | `PascalCase`, igual ao componente | `ListagemServicos.jsx` |
| Rotas da API | substantivo no plural, minúsculas | `/api/servicos`, `/api/ordens-servico` |

Os nomes ficam **em português** e usam o vocabulário do glossário (regra R10): `servico`, `cliente`, `veiculo`, `ordemServico`. Palavras reservadas e nomes de bibliotecas continuam em inglês (`req`, `res`, `useState`).

```js
// Certo
const TEMPO_SESSAO_MINUTOS = 60;
async function buscarServicoPorId(id) { /* ... */ }

// Errado: mistura de padrões, idiomas e abreviações
const tempo_sessao = 60;
async function GetSrv(ID) { /* ... */ }
```

**Verificação:** o ESLint do projeto acusa nomes fora de `camelCase` (regra `camelcase`). Na revisão do PR, conferir os nomes de arquivos, rotas e constantes pela tabela.

---

## BP02 — Documentação do código *(obrigatória)*

1. Toda **função exportada** (controller, service, repository, utilitário) e todo **componente React** tem um comentário **JSDoc** acima dela, com o que faz, os parâmetros, o retorno e os erros que pode lançar.
2. Comentários dentro do código explicam o **porquê** de uma decisão, nunca repetem **o que** a linha já diz.
3. Quando a função implementa uma regra de negócio, o comentário cita o requisito (`RF012`).
4. Código comentado (desativado) não é commitado: o histórico do Git guarda as versões antigas.

```js
// Certo
/**
 * Abre uma ordem de serviço para um veículo (RF012).
 * O preço de cada serviço é copiado para ServicoDaOrdem no momento da abertura,
 * para que uma mudança futura no catálogo não altere ordens já abertas.
 *
 * @param {{ clienteId: number, veiculoId: number, servicosIds: number[] }} dados
 * @returns {Promise<number>} id da ordem de serviço criada
 * @throws {ErroNegocio} se o veículo já tiver uma ordem de serviço não concluída
 */
async function abrirOrdemServico(dados) { /* ... */ }

// Errado: comentário que só repete o código
// soma 1 no contador
contador = contador + 1;
```

**Verificação:** na revisão do PR, toda função exportada nova tem JSDoc com `@param` e `@returns`; nenhum bloco de código comentado.

---

## BP03 — Nomes que revelam a intenção *(Clean Code)*

- O nome diz **para que serve** a variável ou função, sem precisar de comentário.
- Funções começam com **verbo**: `cadastrarServico`, `validarCpf`, `calcularValorTotal`.
- Booleanos começam com `eh`, `tem` ou `pode`: `ehAdministrador`, `temVeiculo`, `podeExcluir`.
- Proibido: nomes de uma letra (fora de índices `i`, `j` em laços curtos), abreviações (`srv`, `cli`, `qtd`) e nomes genéricos (`data`, `info`, `tmp`, `aux`, `obj`).

```js
// Certo
const temOrdemAberta = ordens.some((ordem) => ordem.status !== STATUS_ORDEM.CONCLUIDA);

// Errado
const x = arr.some((o) => o.s !== 'Concluída');
```

**Verificação:** na revisão do PR, procurar nomes da lista proibida e funções que não começam com verbo.

---

## BP04 — Funções pequenas, com uma responsabilidade *(Clean Code)*

- Cada função faz **uma coisa só**. Se a descrição dela precisa de "e", ela deve ser dividida.
- Até cerca de **25 linhas** por função e até **3 parâmetros**. Com mais dados, a função recebe um objeto.
- No máximo **2 níveis de aninhamento** (`if` dentro de `for`). Condições de saída vêm primeiro, com retorno antecipado.

```js
// Certo: retorno antecipado e cada passo em uma função
async function excluirServico(id) {
  const servico = await servicoRepository.buscarPorId(id);
  if (!servico) throw new ErroNaoEncontrado('Serviço não encontrado.');
  if (await servicoRepository.estaEmUso(id)) throw new ErroNegocio('Serviço vinculado a uma ordem de serviço.');
  await servicoRepository.excluir(id);
}

// Errado: tudo aninhado em uma função só
async function excluir(id) {
  const s = await db.query('SELECT ...', [id]);
  if (s.length > 0) {
    const uso = await db.query('SELECT ...', [id]);
    if (uso.length === 0) {
      await db.query('DELETE ...', [id]);
    } else { /* ... */ }
  } else { /* ... */ }
}
```

**Verificação:** o ESLint acusa funções acima do limite (regras `max-lines-per-function: 25`, `max-params: 3` e `max-depth: 2`).

---

## BP05 — Uma responsabilidade por camada *(SOLID — princípio da responsabilidade única)*

O backend é dividido em camadas, e cada uma só conversa com a camada logo abaixo:

| Camada | Arquivo | Faz | Não faz |
|---|---|---|---|
| **Rota** | `servico.routes.js` | Liga URL e método HTTP ao controller, e aplica o middleware de autenticação | Regra de negócio, SQL |
| **Controller** | `servico.controller.js` | Lê a requisição, chama o service e monta a resposta HTTP | Regra de negócio, SQL |
| **Service** | `servico.service.js` | Aplica as **regras de negócio** dos requisitos (ex.: nome único, preço maior que zero) | SQL, `req`/`res` |
| **Repository** | `servico.repository.js` | Executa o **SQL** no MySQL e devolve os dados | Regra de negócio, `req`/`res` |

No frontend, a separação é entre **páginas** (`pages/`, uma por interface `I_` do protótipo), **componentes** reutilizáveis (`components/`) e **chamadas à API** (`services/api.js`). Componentes não chamam o `axios` diretamente.

```js
// Certo: o controller só traduz HTTP <-> service
async function cadastrar(req, res, next) {
  try {
    const id = await servicoService.cadastrar(req.body);
    res.status(201).json({ id, mensagem: 'Serviço cadastrado com sucesso!' });
  } catch (erro) {
    next(erro);
  }
}

// Errado: SQL e regra de negócio dentro da rota
router.post('/servicos', async (req, res) => {
  if (req.body.preco <= 0) return res.status(400).send('erro');
  await db.query('INSERT INTO Servico ...', [req.body.nome, req.body.preco]);
  res.send('ok');
});
```

**Verificação:** nenhum `db.query` fora de `*.repository.js`; nenhum `req` ou `res` fora de rotas e controllers. A organização segue o diagrama de pacotes da tarefa #19.

---

## BP06 — Validar a entrada e tratar os erros em um lugar só *(Clean Code)*

1. A API **nunca confia no frontend**: o service valida todo dado recebido (campos obrigatórios, formato do CPF e da placa, preço maior que zero), mesmo que a tela já tenha validado.
2. Erros de negócio são lançados como **erros com tipo** (`ErroValidacao`, `ErroNaoEncontrado`, `ErroNegocio`, `ErroAcessoNegado`). Nenhuma camada devolve `null` ou `false` para indicar erro.
3. Um **middleware de erros único** transforma cada tipo no código HTTP certo, sempre com o mesmo formato de resposta:

| Erro | Código HTTP | Quando |
|---|---|---|
| `ErroValidacao` | 400 | Campo obrigatório vazio ou em formato inválido |
| `ErroNaoAutenticado` | 401 | Sem login ou sessão expirada (RNF007) |
| `ErroAcessoNegado` | 403 | Cliente pedindo dados de outro cliente (RNF008) |
| `ErroNaoEncontrado` | 404 | Registro inexistente |
| `ErroNegocio` | 409 | Regra de negócio violada (nome duplicado, serviço em uso) |
| Qualquer outro | 500 | Erro inesperado: registrado no log, sem detalhes técnicos na resposta |

```json
{ "erro": "Já existe um serviço com este nome." }
```

As mensagens são as mesmas das interfaces `IE_` do Documento de Requisitos.

**Verificação:** nenhum `try/catch` que engole o erro sem repassar (`catch (e) {}`); toda rota passa os erros para `next(erro)`; os testes de validação conferem o código HTTP de cada fluxo alternativo.

---

## BP07 — Sem valores mágicos nem segredos no código *(Clean Code)*

- Números e textos com significado de negócio viram **constantes nomeadas** em `backend/src/constantes.js`: status da ordem de serviço, tempo de sessão, custo do bcrypt, tamanho mínimo da senha.
- **Senhas, chaves e endereços** ficam no arquivo `.env`, lidos por `process.env`. O `.env` não é versionado (seção 6.7 do README); o `.env.example` mostra as variáveis sem os valores reais.

```js
// Certo
const STATUS_ORDEM = Object.freeze({
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_PECAS: 'Aguardando peças',
  CONCLUIDA: 'Concluída',
});
const CUSTO_BCRYPT = 10; // RNF006
const segredoJwt = process.env.JWT_SEGREDO;

// Errado
if (ordem.status === 'Concluída') { /* ... */ }
const token = jwt.sign(dados, 'minha-chave-123', { expiresIn: 3600 });
```

**Verificação:** buscar no código (Ctrl+Shift+F) pelos textos dos status e por `expiresIn:` com número; buscar por senhas e chaves escritas entre aspas.

---

## Como as regras são aplicadas

- **Automático:** o ESLint roda no backend e no frontend (`npm run lint`) com as regras citadas em BP01 e BP04. O Prettier padroniza a formatação (indentação de 2 espaços, aspas simples, ponto e vírgula).
- **Na revisão:** antes de cada merge, o PR é conferido com o checklist abaixo.

### Checklist de revisão do pull request

| Regra | Pergunta | S/N |
|---|---|---|
| BP01 | Os nomes seguem o padrão de notação da tabela? | |
| BP02 | Toda função exportada nova tem JSDoc? Há código comentado? | |
| BP03 | Os nomes dizem para que servem, sem abreviações? | |
| BP04 | As funções novas têm até cerca de 25 linhas e 2 níveis de aninhamento? | |
| BP05 | SQL só no repository e regra de negócio só no service? | |
| BP06 | A entrada é validada na API e os erros seguem a tabela de códigos HTTP? | |
| BP07 | Há valores mágicos ou segredos escritos no código? | |
| — | O `npm run lint` passou sem erros? | |
