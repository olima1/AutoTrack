# Avaliação dos Requisitos — Sprint 1 (tarefa #16)

**Data:** 10/11/2026 · **Avaliador:** Gabriel Lima Leandro
**Base:** checklist da seção 3 de `Regras de Verificação e Análise de Requisitos.md` (R01–R11).
**Método:** as regras foram verificadas por script (`check.js`) sobre os mesmos dados que geram o Documento de Requisitos, e o resultado foi conferido por leitura.

**S** = cumpre · **N** = não cumpre · **—** = regra não se aplica ao tipo de requisito.

| Requisito | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RF001 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF002 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF017 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF003 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF004 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF005 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF006 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF007 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF008 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF009 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF010 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF011 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF012 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF013 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF014 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF015 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RF016 | S | S | S | S | S | - | S | S | S | S | S | Aprovado |
| RNF001 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF002 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF003 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF004 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF005 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF006 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF007 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF008 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF009 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF010 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF011 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |
| RNF012 | S | - | - | S | S | S | S | - | S | S | - | Aprovado |

## Resumo
- 17 requisitos funcionais e 12 não funcionais avaliados; nenhum com falha nas regras R01–R11.
- R02 e R11 conferidos manualmente com o diagrama `Requisitos/Diagrama de Casos de Uso - AutoTrack.asta`: cada caso de uso tem nome idêntico ao do RF e está ligado a pelo menos um ator (Administrador: RF001–RF015; Cliente: RF001, RF002, RF016 e RF017). Correções feitas no diagrama durante a conferência: "Realizar Login/Logout" separado em dois casos de uso (R04), "Acompanhar status de serviços" renomeado para o nome do RF016 (R02, R10) e removida a ligação do Administrador com o RF016.
- R03 conferido: as 39 interfaces do catálogo existem com o mesmo nome na página Protótipo do Figma (https://www.figma.com/design/vRuKwacCSuyKdjBh6kGo9H/AutoTrack).
- RF017 (Alterar senha inicial) incluído em 10/11/2026 para cobrir o primeiro acesso do Cliente, pedido na tarefa #10. O identificador segue a regra R01: o próximo número livre, sem renumerar os demais.
- Correções feitas durante a avaliação: termo "dono" trocado por "titular" (R10); nome do RNF001 ajustado (R04); RNF008 reescrito com valor mensurável, código HTTP 403 (R06).
