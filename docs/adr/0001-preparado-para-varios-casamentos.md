# Base de dados preparada para vários casamentos desde o início

A primeira versão serve um só casamento, mas o objetivo é tornar-se uma plataforma para vários casais. Por isso, todas as tabelas têm `wedding_id` e todas as regras de acesso (RLS) filtram por casamento desde o primeiro dia. Acrescentar isto depois obrigaria a migrar dados e reescrever todas as políticas de segurança; fazê-lo já custa apenas uma coluna e um índice por tabela. Cada casamento tem um `slug` (ex.: `ana-e-joao`) para o link próprio no futuro.
