# Convidados entram com sessão anónima do Supabase

Os convidados só escrevem o nome: não criam conta nem recebem códigos. Para mesmo assim proteger os dados com RLS, cada convidado recebe uma sessão anónima do Supabase (`signInAnonymously`) e o seu registo fica ligado a esse `auth.uid()`. Assim, um convidado só pode cancelar as suas reservas e ver as suas memórias. Consequência aceite: se o convidado mudar de telemóvel ou limpar o browser, aparece como um convidado novo. Os noivos usam conta com email e palavra-passe.
