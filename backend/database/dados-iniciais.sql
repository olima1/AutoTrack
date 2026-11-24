-- Administrador da oficina. A senha fica só como hash bcrypt (RNF006).
-- As credenciais de acesso estão no README, seção "Como executar".
INSERT INTO Usuario (email, senha_hash, perfil, primeiro_acesso)
VALUES ('admin@autotrack.com', '$2b$10$QtUNYf7tHrq91arxjL5OwepZkP6gYHo5Ym69IO2SbTuj01wCVHwci', 'ADMINISTRADOR', FALSE);