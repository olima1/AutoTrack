-- Administrador da oficina. A senha fica só como hash bcrypt (RNF006).
-- As credenciais de acesso estão no README, seção "Como executar".
INSERT INTO Usuario (email, senha_hash, perfil, primeiro_acesso)
VALUES ('admin@autotrack.com', '$2b$10$QtUNYf7tHrq91arxjL5OwepZkP6gYHo5Ym69IO2SbTuj01wCVHwci', 'ADMINISTRADOR', FALSE);

-- Clientes e veículos de exemplo, para abrir ordens de serviço
-- enquanto os CRUDs de Cliente (RF007) e Veículo (RF010) não existem.
INSERT INTO Cliente (nome, cpf, telefone) VALUES
  ('Ana Souza', '11122233344', '35999990001'),
  ('Bruno Lima', '55566677788', '35999990002'),
  ('Carla Dias', '99988877766', '35999990003');

INSERT INTO Veiculo (placa, marca, modelo, ano, quilometragem, cliente_id) VALUES
  ('ABC1D23', 'Fiat', 'Argo', 2020, 45000, 1),
  ('XYZ9K87', 'Volkswagen', 'Gol', 2015, 120000, 1),
  ('QWE4R56', 'Chevrolet', 'Onix', 2022, 18000, 2);