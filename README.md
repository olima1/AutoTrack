# AutoTrack

Sistema web de gestão de **ordens de serviço para oficinas mecânicas**, com acompanhamento do conserto pelo cliente.

> Projeto Final da disciplina **GCC188 - Engenharia de Software** (2026/2).
> Integrante: Gabriel Lima Leandro.

---

## 1. Contexto do problema e solução

### Problema
Em muitas oficinas mecânicas de pequeno porte, a entrada e a saída de veículos são controladas em papel, cadernos ou planilhas soltas. Isso causa três problemas principais:

- **Comunicação com o cliente:** o dono do veículo precisa ligar ou mandar mensagem para saber se o carro está pronto, e a oficina interrompe o trabalho para responder.
- **Perda de histórico:** não há registro organizado de quais serviços foram feitos em cada veículo, quando e por quanto.
- **Controle de serviços e preços:** os serviços oferecidos e seus valores não ficam padronizados, gerando orçamentos diferentes para o mesmo serviço.

### Solução
O AutoTrack é um sistema web que permite à oficina:

- Cadastrar o **catálogo de serviços** oferecidos (nome, descrição, preço);
- Cadastrar **clientes** e seus **veículos**;
- Abrir, consultar, alterar e excluir **ordens de serviço**, ligando um cliente, um veículo e os serviços realizados, com status (Aberta, Em andamento, Aguardando peças, Concluída);
- Permitir que o **cliente** acesse o sistema com login e acompanhe o status das ordens de serviço dos seus veículos.

Todo acesso ao sistema exige login.

---

## 2. Instruções para uso

Pré-requisitos: [Node.js](https://nodejs.org/) e [MySQL](https://dev.mysql.com/downloads/) instalados (versões na seção 4).

1. Baixe o projeto: botão **Code → Download ZIP** no GitHub e extraia, ou `git clone https://github.com/olima1/AutoTrack.git`.
2. Crie o banco de dados no MySQL:
   ```sql
   CREATE DATABASE autotrack;
   ```
3. Configure o backend: dentro da pasta `backend`, copie o arquivo `.env.example` para `.env` e preencha usuário e senha do seu MySQL.
4. Inicie o backend (terminal 1):
   ```bash
   cd backend
   npm install
   npm start
   ```
   Deve aparecer: `API AutoTrack rodando em http://localhost:3001`.
5. Inicie o frontend (terminal 2):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
6. Abra o navegador em **http://localhost:5173**.

---

## 3. Instruções para devs

1. Clone o projeto:
   ```bash
   git clone https://github.com/olima1/AutoTrack.git
   cd AutoTrack
   ```
   (alternativa: baixar o ZIP pelo GitHub e extrair)
2. Instale as dependências:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Crie o arquivo `backend/.env` a partir de `backend/.env.example`.
4. Rode o backend em modo desenvolvimento (reinicia ao salvar): `cd backend && npm run dev`.
5. Rode o frontend: `cd frontend && npm run dev` e acesse **http://localhost:5173**.
6. Teste a API: **http://localhost:3001/api/health** deve responder `{"status":"ok", ...}`.

---

## 4. Tecnologias

- **frontend:** React 19.3.1, React Router DOM 7.18.4, Axios 1.21.0, Vite 8.3.5
- **backend:** Node.js 24.13.0, Express 5.3.0, mysql2 3.24.6, bcryptjs 3.0.3, jsonwebtoken 9.0.3, cors 2.8.6, dotenv 18.0.9
- **banco de dados:** MySQL 8.4.3
- **outras:**
  - npm 11.6.2 (gerenciador de pacotes do Node, instala as bibliotecas do projeto)
  - Nodemon 3.1.14 (reinicia o backend automaticamente durante o desenvolvimento)
  - Git 2.55.0.windows.5 (controle de versão do código e da documentação)
  - Visual Studio Code 1.143.1 (IDE usada para programar)
  - Astah UML 12.0.0 (ferramenta para os diagramas UML: casos de uso, classes, sequência, implantação)
  - Figma (prototipação das interfaces)

---

## 5. Organização do projeto

* **`backend/`**: API REST em Node.js/Express.
  * **`backend/src/`**: código-fonte da API (`server.js` é o ponto de entrada).
  * **`backend/.env.example`**: modelo das variáveis de ambiente (banco, porta, segredo JWT).
* **`frontend/`**: interface web em React (Vite).
  * **`frontend/src/`**: componentes e telas da aplicação.
* **`Padrões Adotados/`**: padrões que o projeto segue (ex.: regras de verificação e análise de requisitos).
* **`Requisitos/`**: documento de requisitos, diagramas de casos de uso (Astah) e protótipos de interface.
* **`Diagramas/`**: diagramas de projeto (classes, pacotes, sequência e implantação), a partir da Sprint 2.
* **`teste/`**: casos de teste de validação e scripts de teste automatizado.

---

## 6. Regras de uso do Git

Estas regras valem para todo o trabalho no repositório. Elas existem para que o histórico conte o que foi feito, por quê e em qual tarefa, e para que a `main` esteja sempre funcionando.

### 6.1 Branches

- A **`main`** é a versão estável do projeto. Ninguém faz commit direto nela: tudo entra por pull request.
- Cada tarefa tem a **sua própria branch**, criada a partir da `main` atualizada.
- O nome da branch segue o padrão **`tipo/codigo-descricao`**, em minúsculas, com hífens e sem acentos:

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade de um requisito | `feat/rf003-cadastrar-servico` |
| `fix` | Correção de defeito | `fix/rf005-preco-negativo` |
| `docs` | Documentação, diagramas e requisitos | `docs/sprint2-diagrama-classes` |
| `test` | Testes unitários ou de validação | `test/rf003-validacao-selenium` |
| `refactor` | Melhoria de código sem mudar o comportamento | `refactor/servico-repository` |

- Quando a tarefa tem um requisito, o código dele (`rf003`, `rnf006`) vem logo depois do tipo. Assim a branch se liga ao requisito e à issue do kanban.

### 6.2 Commits

As mensagens seguem o padrão **Conventional Commits 1.0.0** (RNF010):

```
tipo(escopo): descrição curta

Corpo opcional explicando o porquê da mudança.

Refs #12
```

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de defeito |
| `docs` | Documentação (README, requisitos, diagramas) |
| `test` | Criação ou ajuste de testes |
| `refactor` | Reorganização do código sem mudar o comportamento |
| `style` | Formatação, sem mudança de lógica |
| `chore` | Configuração, dependências e tarefas de manutenção |

Regras da mensagem:

1. O **escopo** é a parte do sistema afetada: `servico`, `cliente`, `ordem-servico`, `auth`, `frontend`, `readme`, `requisitos`.
2. A **descrição** fica no presente, em português, em minúsculas, sem ponto final e com no máximo 72 caracteres. Ela completa a frase "este commit…": `adiciona`, `corrige`, `remove`.
3. Um commit faz **uma coisa só**. Duas mudanças independentes viram dois commits.
4. O rodapé liga o commit à issue do kanban: `Refs #12` durante a tarefa, `Closes #12` no commit que a conclui.
5. Faça **pelo menos um commit por dia** de trabalho na branch e envie com `git push`. O GitHub também serve de backup.

Exemplos:

```
feat(servico): adiciona rota POST /api/servicos
fix(servico): impede cadastro de preço menor ou igual a zero
docs(requisitos): adiciona RF018 Excluir cliente
test(servico): cobre validação de nome duplicado
chore(backend): adiciona dependência mysql2
```

### 6.3 Pull requests e merge

1. Terminada a tarefa, envie a branch e abra um **pull request para a `main`**.
2. O título do PR segue o mesmo padrão dos commits. A descrição diz o que foi feito e cita as tarefas da planilha (`#19`) e as issues (`Closes #12`).
3. O merge é feito com **"Create a merge commit"**, sem squash, para preservar no histórico cada commit da tarefa.
4. Depois do merge, a branch é apagada no GitHub, e a `main` local é atualizada com `git checkout main` e `git pull`.

### 6.4 Kanban

- Ao começar uma tarefa, mova o cartão para **Desenvolvendo**. A coluna aceita no máximo 2 itens: termine uma tarefa antes de puxar outra.
- Com o código pronto, o cartão vai para **Teste de Sistema**. Depois do merge e dos testes, vai para **Finalizado**.
- O título de cada issue começa pelo código do requisito (`RF003 - Cadastrar serviço - Backend`), o mesmo usado no nome da branch e nos commits.

### 6.5 Tags e releases

- Cada sprint termina com uma **tag anotada** e uma **Release** no GitHub, com a lista do que foi entregue.
- O nome da tag é **`V0.<número da sprint + 1>`**: V0.1 para a Sprint 0, V0.2 para a Sprint 1, V0.3 para a Sprint 2 e V0.4 para a Sprint 3.
- Correções depois de uma release ganham um terceiro número: `V0.2.1`.

```bash
git checkout main
git pull
git tag -a V0.3 -m "Sprint 2 - Projeto e Implementação"
git push origin V0.3
```

### 6.6 Onde fica cada coisa

| Pasta | Conteúdo |
|---|---|
| `backend/` | Código da API (Node.js/Express) |
| `frontend/` | Código da interface (React) |
| `teste/` | Casos de teste de validação e scripts de teste automatizado |
| `Requisitos/` | Documento de requisitos, diagrama de casos de uso, telas e mapa de navegação |
| `Diagramas/` | Diagramas de projeto: classes, pacotes, sequência e implantação |
| `Padrões Adotados/` | Regras do projeto: verificação de requisitos e boas práticas de codificação |

Código fica somente em `backend/`, `frontend/` e `teste/`. Documentação nunca vai dentro das pastas de código, a não ser o README de cada uma.

### 6.7 O que não vai para o repositório

O `.gitignore` impede que estes arquivos sejam versionados:

- **`node_modules/`**: dependências, reinstaladas com `npm install`;
- **`.env`**: senhas do banco e o segredo do JWT. Só o modelo `.env.example` é versionado;
- **`dist/`, `build/` e `coverage/`**: arquivos gerados pela compilação e pelos testes;
- **`*.log`**, **`~$*`** (travas do Word) e **`*.bak`** (backups do Astah);
- arquivos do sistema e do editor, como `Thumbs.db` e `.vscode/`.

O `.gitattributes` padroniza o fim de linha dos arquivos de texto. Assim o Git não acusa como "modificado" um arquivo que só mudou de CRLF (Windows) para LF.

---

## 7. Releases

| Tag | Sprint | Conteúdo |
|---|---|---|
| V0.1 | Sprint 0 | Repositório, README, tecnologias, ambiente e regras de verificação de requisitos |
| V0.2 | Sprint 1 | Documento de requisitos, casos de uso, protótipo, avaliação R01–R11 e kanban |
| V0.2.1 | Sprint 1 | Ajuste: RF018 Excluir cliente e remoção do campo usuario_id da tabela OrdemServico |
