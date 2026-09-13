# Interactive Podcast Tutor

## Supabase secrets

Set these secrets before deploying the three podcast Edge Functions:

```text
ANTHROPIC_API_KEY
CLAUDE_MODEL                 # optional; defaults to claude-sonnet-4-5-20250929
OPENAI_API_KEY
WHISPER_MODEL                # optional; defaults to whisper-1
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_ID          # one Arabic-capable voice used for narration and corrections
ELEVENLABS_MODEL_ID          # optional; defaults to eleven_multilingual_v2
YOUTUBE_AUDIO_EXTRACTOR_URL  # required only when a video has no usable captions
YOUTUBE_AUDIO_EXTRACTOR_KEY  # optional bearer token for the extractor
```

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` automatically to deployed Edge Functions.

## Caption fallback contract

The normal path reads a public video's YouTube caption track. If no track is
available, `create-podcast-session` calls `YOUTUBE_AUDIO_EXTRACTOR_URL` with:

```json
{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "video_id": "...",
  "format": "audio"
}
```

The extractor must return a temporary, server-readable URL:

```json
{ "audio_url": "https://..." }
```

The Edge Function downloads at most 25 MB and sends that audio to Whisper with
Arabic language guidance. Private, unreachable, age-restricted, or oversized
videos move the session to `failed` with a student-friendly Arabic message.

## Deployment

Apply the migration, then deploy:

```bash
supabase db push
supabase functions deploy create-podcast-session
supabase functions deploy submit-checkpoint-answer
supabase functions deploy get-session-status
```

The `podcast-audio` bucket is private. Audio paths are stored in Postgres and
the status function returns one-hour signed URLs. The database revokes browser
access to `podcast_segments.answer_key`; grading reads it only through the
service-role Edge Function.
