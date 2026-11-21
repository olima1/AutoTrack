CREATE TABLE Servico (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    preco DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    CHECK (preco > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;