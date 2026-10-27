# Regras de Verificação e Análise de Requisitos — AutoTrack

**Versão:** 1.0 — 27/10/2026
**Base:** características de uma boa especificação de requisitos apresentadas no capítulo 1 do livro *Engenharia de Software Aplicada* (Rogério Magela): **correta, não ambígua, completa, consistente, classificada por importância, verificável, modificável e rastreável**.

Este documento define as regras que **todo requisito** do AutoTrack deve obedecer. Cada regra é objetiva: duas pessoas que verifiquem o mesmo requisito devem chegar ao mesmo resultado (cumpre / não cumpre). Na tarefa #16 (Sprint 1), todos os requisitos serão avaliados com o checklist da seção 3.

---

## 1. Nomenclatura e identificação

### R01 — Identificador único *(rastreável, modificável)*
- Requisito funcional: `RF` + 3 dígitos (ex.: `RF001`).
- Requisito não funcional: `RNF` + 3 dígitos (ex.: `RNF001`).
- A numeração é sequencial, sem lacunas na primeira versão do documento.
- Um identificador nunca é reaproveitado: se um requisito for removido, seu número fica marcado como **"removido"** e não volta a ser usado.

**Verificação:** o identificador segue o padrão `RF\d{3}` ou `RNF\d{3}` e não aparece duas vezes no documento.

### R02 — Nome do requisito funcional *(não ambígua, rastreável)*
- O nome começa com **verbo no infinitivo** (terminado em *-ar*, *-er* ou *-ir*). Ex.: "Cadastrar serviço", "Abrir ordem de serviço".
- O nome tem **no máximo 6 palavras**.
- O nome do RF é **idêntico** (mesmas palavras, mesma ordem) ao nome do caso de uso correspondente no diagrama de casos de uso.

**Verificação:** a primeira palavra termina em -ar/-er/-ir; contar as palavras (≤ 6); comparar o texto com o caso de uso no Astah.

### R03 — Identificador de interface *(rastreável)*
Toda interface citada em um requisito usa o prefixo:
- `I_` para tela (ex.: `I_Login`);
- `IE_` para tela/mensagem de erro (ex.: `IE_LoginSenhaInvalida`);
- `IS_` para tela/mensagem de sucesso (ex.: `IS_ServicoCadastrado`).

O mesmo nome deve existir no protótipo (Figma).

**Verificação:** o nome começa com `I_`, `IE_` ou `IS_` e existe uma tela com esse nome no protótipo.

---

## 2. Regras de redação e conteúdo

### R04 — Um requisito por vez *(não ambígua, verificável)*
O nome de um requisito descreve **uma única ação**. Não pode conter as conjunções **"e"**, **"ou"**, **"e/ou"** nem a barra **"/"** ligando dois verbos.
- Errado: "Cadastrar e alterar serviço".
- Certo: "Cadastrar serviço" e "Alterar serviço" (dois requisitos).

**Verificação:** procurar no nome as palavras "e", "ou", "e/ou" e o caractere "/" entre verbos.

### R05 — Lista de palavras proibidas *(não ambígua)*
Nenhum requisito (nome, resumo, fluxos, regras de negócio ou descrição de RNF) pode conter as palavras/expressões abaixo, por serem subjetivas:

> fácil, facilmente, amigável, intuitivo, simples, rápido, rapidamente, eficiente, adequado, adequadamente, flexível, moderno, bom, melhor, robusto, suficiente, vários, alguns, muitos, normalmente, geralmente, se possível, quando necessário, aproximadamente, etc., entre outros.

**Verificação:** busca textual (Ctrl+F) por cada palavra da lista. Resultado esperado: zero ocorrências.

### R06 — Requisito não funcional mensurável *(verificável)*
Todo RNF contém **pelo menos um** dos itens:
- um **valor numérico com unidade** (ex.: "em até 2 segundos", "mínimo de 8 caracteres", "99% do tempo"); ou
- o **nome e o número de versão** de uma tecnologia (ex.: "Google Chrome 120 ou superior", "MySQL 8.0").

**Verificação:** o texto do RNF contém um número seguido de unidade ou um nome de tecnologia seguido de número de versão.

### R07 — Prioridade definida *(classificada por importância)*
Todo requisito (RF e RNF) tem **exatamente uma** prioridade marcada entre: **Essencial**, **Importante** ou **Desejável**, conforme as definições do documento de requisitos.

**Verificação:** exatamente um dos três valores está marcado.

### R08 — Campos obrigatórios da tabela de RF *(completa)*
Toda tabela de requisito funcional tem preenchidos os campos: **Prioridade, Atores, Resumo, Pré-condição, Interfaces, Fluxo principal e Regras de negócio** (mínimo 1 regra). O campo Pós-condição é opcional.

Além disso:
- a **Pré-condição** informa (a) se o ator precisa estar logado e (b) em qual interface (`I_...`) o ator está no início;
- o **Fluxo principal** tem as colunas **Ator** e **Sistema**.

**Verificação:** nenhum dos campos listados está vazio; a pré-condição contém a palavra "logado" (ou "não precisa estar logado") e um identificador `I_`.

### R09 — Tamanho das frases *(não ambígua)*
- O **Resumo** de um RF tem no máximo **40 palavras**.
- Cada **passo** dos fluxos (principal e alternativos) tem no máximo **25 palavras** e começa com verbo.
- Cada **descrição de RNF** tem no máximo **50 palavras**.

**Verificação:** contagem de palavras (contador do Word).

### R10 — Vocabulário único *(consistente)*
Os termos do domínio são usados **sempre com o mesmo nome**, conforme o glossário do documento de requisitos. Sinônimos não são permitidos. Termos fixados:

| Termo oficial | Não usar |
|---|---|
| Ordem de serviço | OS, pedido, chamado, manutenção |
| Cliente | dono, proprietário, usuário final |
| Veículo | carro, automóvel |
| Serviço | produto, item, conserto |
| Administrador | gerente, dono da oficina, admin |

**Verificação:** busca textual pelas palavras da coluna "Não usar". Resultado esperado: zero ocorrências (exceto dentro do próprio glossário).

### R11 — Rastreabilidade com o caso de uso *(rastreável)*
Todo RF aparece como caso de uso no diagrama de casos de uso, ligado a **pelo menos um ator** (ou a outro caso de uso por `<<include>>`/`<<extend>>`).

**Verificação:** para cada RF, localizar o caso de uso de mesmo nome no diagrama e conferir a ligação.

---

## 3. Checklist de verificação (usado na tarefa #16)

Para cada requisito, marcar **S** (cumpre) ou **N** (não cumpre). Requisito com qualquer **N** deve ser corrigido antes da release.

| Requisito | R01 | R02 | R03 | R04 | R05 | R06* | R07 | R08** | R09 | R10 | R11** | Problema encontrado / correção |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RF001 |  |  |  |  |  | — |  |  |  |  |  |  |
| RNF001 |  | — | — |  |  |  |  | — |  |  | — |  |

\* R06 só se aplica a RNF.  \*\* R02, R03, R08 e R11 só se aplicam a RF.
