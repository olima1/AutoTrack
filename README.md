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
* **`teste/`**: casos de teste de validação e scripts de teste automatizado.

---

## 6. Releases

| Tag | Sprint | Conteúdo |
|---|---|---|
| V0.1 | Sprint 0 | Repositório, README, tecnologias, ambiente e regras de verificação de requisitos |
