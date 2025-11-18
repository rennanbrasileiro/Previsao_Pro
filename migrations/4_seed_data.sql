-- Seed data: Popular banco com dados de exemplo

-- Inserir condomínio
INSERT OR IGNORE INTO condominios (id, nome, cnpj, tipo, endereco, area_total_m2, ativo) 
VALUES (
  1, 
  'SOUZA MELO TOWER', 
  '25.184.237/0001-09', 
  'comercial', 
  'Av. Eng. Domingos Ferreira, 1967 - Boa Viagem - Recife-PE CEP: 51.111-021', 
  3511.31, 
  1
);

-- Inserir centros de custo (se não existirem)
INSERT OR IGNORE INTO centros_custo (id, nome, condominio_id, area_m2, endereco, cnpj, razao_social, ativo, percentual_rateio) 
VALUES (
  1,
  'SUDENE', 
  1, 
  3197.64, 
  'Pavimentos Térreo, 5°, 7°, 8°, 9°, 10°, 11°, 12°, 13° e 14°', 
  '00.000.000/0001-00', 
  'SUPERINTENDÊNCIA DO DESENVOLVIMENTO DO NORDESTE', 
  1,
  91.07
);

INSERT OR IGNORE INTO centros_custo (id, nome, condominio_id, area_m2, endereco, ativo, percentual_rateio) 
VALUES (
  2,
  'SOUZA & MACEDO', 
  1, 
  156.835, 
  '50% da área total do 6º andar', 
  1,
  4.47
);

INSERT OR IGNORE INTO centros_custo (id, nome, condominio_id, area_m2, endereco, ativo, percentual_rateio) 
VALUES (
  3,
  'BRITO E SOBRAL', 
  1, 
  156.835, 
  '50% da área total do 6º andar', 
  1,
  4.47
);

-- Inserir competência de exemplo (Novembro 2025)
INSERT OR IGNORE INTO competencias (id, mes, ano, condominio_id, status, area_total_m2, taxa_m2, acrescimo_percentual)
VALUES (
  1,
  11,
  2025,
  1,
  'rascunho',
  3511.31,
  17.24,
  10
);

-- Inserir itens de previsão para a competência
INSERT OR IGNORE INTO previsao_itens (competencia_id, categoria, descricao, valor, ordem) VALUES
(1, 'Despesas de Pessoal', 'Folha de pagamento dos 7 funcionários (1 ASG)+(1 ADM)+(1 RECP)+(4 PORT)', 26239.82, 1),

(1, 'Contratos Mensais', 'Manutenção de elevadores - ATLAS SCHINDLER', 4395.60, 1),
(1, 'Contratos Mensais', 'Manutenção de jardim - NATIVUS PAISAGISMO', 414.00, 2),
(1, 'Contratos Mensais', 'Manutenção elétrica - MAS ELETRICIDADE', 859.00, 3),
(1, 'Contratos Mensais', 'Manutenção de gerador - GENTEC', 454.88, 4),
(1, 'Contratos Mensais', 'Manutenção de bombas - JM CORREA BOMBAS', 450.00, 5),
(1, 'Contratos Mensais', 'Manutenção de ar condicionado - NOVO CLIMA', 1440.00, 6),
(1, 'Contratos Mensais', 'Manutenção nos portões, semáforos e interfone - MEGA SOLUÇÕES', 467.95, 7),
(1, 'Contratos Mensais', 'Serviço contábil - DATACONTE', 1008.72, 8),
(1, 'Contratos Mensais', 'Telefonia móvel - CLARO BR', 70.00, 9),
(1, 'Contratos Mensais', 'Internet banda larga - ALGAR TELECOM', 266.89, 10),
(1, 'Contratos Mensais', 'Manutenção ponto eletrônico - VIVA TECNOLOGY', 130.00, 11),

(1, 'Despesas Concessionárias (Estimado)', 'CELPE', 8850.66, 1),
(1, 'Despesas Concessionárias (Estimado)', 'COMPESA', 7271.44, 2),

(1, 'Despesas Anuais (Estimado)', 'MANUTENÇÃO PREDITIVA ANUAL', 1200.00, 1),
(1, 'Despesas Anuais (Estimado)', 'SEGURO', 500.22, 2),

(1, 'Despesas Mensais Variáveis (Estimado)', 'Despesas variáveis mensais', 1000.00, 1);

-- Inserir itens de centro de custo para SUDENE
INSERT OR IGNORE INTO centro_custo_itens (competencia_id, centro_custo_id, categoria, descricao, valor, ordem) VALUES
(1, 1, 'Pessoal', 'Folha de pagamento dos 5 funcionários (5 ASG)', 14881.11, 1),

(1, 1, 'Contratos', 'Manutenção de ar condicionado - MB CLIMATIZAÇÃO', 10560.00, 1),
(1, 1, 'Contratos', 'Locação de nobreaks - MAPROS', 9040.00, 2),
(1, 1, 'Contratos', 'Purificadores de água - BRASTEMP', 1050.72, 3),
(1, 1, 'Contratos', 'Análise de água - TOPLAB AMBIENTAL', 456.66, 4),
(1, 1, 'Contratos', 'Serviço de dedetização - SANEDRIN', 300.00, 5),
(1, 1, 'Contratos', 'Manutenção predial - MM PINTURAS E SERVIÇOS', 2600.00, 6),

(1, 1, 'Variáveis', 'Aquisição de papel toalha - BRAVI', 1453.50, 1),
(1, 1, 'Variáveis', 'Aquisição de papel higiênico - BRAVI', 832.70, 2),
(1, 1, 'Variáveis', 'Aquisição de material de limpeza - FC ATACADISTA', 2233.52, 3),
(1, 1, 'Variáveis', 'Aquisição de insumos para copa - FC ATACADISTA', 777.40, 4);

-- Inserir despesas extraordinárias para SUDENE
INSERT OR IGNORE INTO despesas_extras (competencia_id, centro_custo_id, categoria, descricao, valor, tipo, justificativa, aprovado) VALUES
(1, 1, 'Reforma', 'Aquisição de material para pintura e emassamento - FERREIRA COSTA', 622.60, 'extraordinaria', 'Reforma no 12º andar (Sala da FINEP)', 1),
(1, 1, 'Elétrica', 'Aquisição de material elétrico - JAGUAR MATERIAIS ELÉTRICOS', 838.25, 'extraordinaria', 'Readequação elétrica no 8º andar para instalação do setor de fisioterapia', 1),
(1, 1, 'Reforma', 'Aquisição de forro mineral - SPAÇO REVEST', 9250.00, 'extraordinaria', 'Reforma no 12º andar (Sala da FINEP)', 1),
(1, 1, 'Reforma', 'Serviço em paredes em Drywall, readequação elétrica, aquisição de portas - CONSTRUTORA MENDES E SANTOS', 11452.40, 'extraordinaria', 'Reforma no 12º andar (Sala da FINEP) e 8º andar', 1);
