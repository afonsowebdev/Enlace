-- =====================================================================
-- Storage: bucket privado para as memórias (fotos e vídeos)
-- Caminho de cada ficheiro: {wedding_id}/{guest_id}/{uuid}.{ext}
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories',
  'memories',
  false,                       -- privado: só com URL assinado
  52428800,                    -- 50 MB (limite do plano gratuito do Supabase)
  array['image/*', 'video/*']
)
on conflict (id) do nothing;

-- O convidado só envia para a sua própria pasta.
create policy memories_objects_insert_guest on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'memories'
    and (storage.foldername(name))[2]::bigint
        = (select private.current_guest_id(((storage.foldername(name))[1])::bigint))
  );

-- O convidado lê os seus ficheiros; os noivos leem todos os do casamento.
create policy memories_objects_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'memories'
    and (
      (storage.foldername(name))[2]::bigint
        = (select private.current_guest_id(((storage.foldername(name))[1])::bigint))
      or (select private.is_wedding_host(((storage.foldername(name))[1])::bigint))
    )
  );

-- Apagar: o próprio convidado ou os noivos.
create policy memories_objects_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'memories'
    and (
      (storage.foldername(name))[2]::bigint
        = (select private.current_guest_id(((storage.foldername(name))[1])::bigint))
      or (select private.is_wedding_host(((storage.foldername(name))[1])::bigint))
    )
  );
