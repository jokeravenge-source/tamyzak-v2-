-- Owner-selected destination. Runtime resolves this username to a canonical
-- numeric group ID and rejects channels/private chats before sending anything.
INSERT INTO public.battle_channel_settings(id,enabled,chat_id,invite_url,updated_at)
VALUES(true,true,'@tamayzak','https://t.me/tamayzak',clock_timestamp())
ON CONFLICT(id) DO UPDATE SET enabled=EXCLUDED.enabled,chat_id=EXCLUDED.chat_id,
 invite_url=EXCLUDED.invite_url,updated_at=EXCLUDED.updated_at;
