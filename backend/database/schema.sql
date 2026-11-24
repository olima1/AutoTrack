CREATE DATABASE IF NOT EXISTS autotrack;
USE autotrack;

CREATE TABLE Servico (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    preco DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    CHECK (preco > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Cliente (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  cpf CHAR(11) NOT NULL UNIQUE,
  telefone VARCHAR(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Usuario (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha_hash VARCHAR(60) NOT NULL,
  perfil ENUM('ADMINISTRADOR', 'CLIENTE') NOT NULL,
  cliente_id INT UNIQUE,
  primeiro_acesso BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  FOREIGN KEY (cliente_id) REFERENCES Cliente (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Veiculo (
  id INT NOT NULL AUTO_INCREMENT,
  placa VARCHAR(8) NOT NULL UNIQUE,
  marca VARCHAR(40) NOT NULL,
  modelo VARCHAR(60) NOT NULL,
  ano SMALLINT NOT NULL,
  quilometragem INT NOT NULL DEFAULT 0,
  cliente_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cliente_id) REFERENCES Cliente (id),
  CHECK (ano >= 1950),
  CHECK (quilometragem >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE OrdemServico (
  id INT NOT NULL AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  veiculo_id INT NOT NULL,
  data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_conclusao DATETIME,
  status ENUM('ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECAS', 'CONCLUIDA') NOT NULL DEFAULT 'ABERTA',
  observacoes VARCHAR(255),
  valor_total DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (cliente_id) REFERENCES Cliente (id),
  FOREIGN KEY (veiculo_id) REFERENCES Veiculo (id),
  CHECK (valor_total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ServicoDaOrdem (
  ordem_servico_id INT NOT NULL,
  servico_id INT NOT NULL,
  preco_cobrado DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (ordem_servico_id, servico_id),
  FOREIGN KEY (ordem_servico_id) REFERENCES OrdemServico (id),
  FOREIGN KEY (servico_id) REFERENCES Servico (id),
  CHECK (preco_cobrado > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;