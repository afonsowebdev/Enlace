# Reserva única garantida pela base de dados

Um artigo (presente físico) não pode ser reservado duas vezes; os presentes em dinheiro seguem outra regra (ADR 0005). Em vez de verificar isso só no código da aplicação (o que falha quando dois convidados carregam no mesmo presente ao mesmo segundo), a tabela `gift_reservations` tem uma restrição `unique (gift_id)`. A base de dados recusa a segunda reserva de forma atómica e a aplicação apenas traduz esse erro numa mensagem amigável ("Este presente acabou de ser reservado").
