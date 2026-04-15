import { serverEnv } from '../env'

/**
 * ElevenLabs TTS. Returns a URL to the generated audio (cached by provider)
 * or null if not configured. Falls back gracefully.
 */
export async function synthesizeVoice(
  text: string
): Promise<{ audioUrl: string } | null> {
  const apiKey = serverEnv.ELEVENLABS_API_KEY
  const voiceId = serverEnv.ELEVENLABS_VOICE_ID
  if (!apiKey || !voiceId) return null

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )
  if (!res.ok) {
    throw new Error(`ElevenLabs error: ${res.status} ${await res.text()}`)
  }
  // We get back raw audio; caller should persist to Supabase Storage and
  // surface a public URL. For the MVP we return a data URL so the feature
  // works end-to-end even without storage wired.
  const buf = Buffer.from(await res.arrayBuffer())
  return { audioUrl: `data:audio/mpeg;base64,${buf.toString('base64')}` }
}

/**
 * HeyGen avatar video generation. Kicks off an async render and returns
 * a video_id + polling URL. Caller polls until status=completed.
 */
export async function startHeyGenRender(args: {
  scriptText: string
  audioUrl?: string
}): Promise<{ videoId: string } | null> {
  const apiKey = serverEnv.HEYGEN_API_KEY
  const avatarId = serverEnv.HEYGEN_AVATAR_ID
  if (!apiKey || !avatarId) return null

  const voice = args.audioUrl
    ? { type: 'audio', audio_url: args.audioUrl }
    : {
        type: 'text',
        input_text: args.scriptText,
        voice_id: 'en-US-JennyNeural',
      }

  const res = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_inputs: [
        {
          character: { type: 'avatar', avatar_id: avatarId },
          voice,
        },
      ],
      dimension: { width: 1280, height: 720 },
    }),
  })
  if (!res.ok) {
    throw new Error(`HeyGen error: ${res.status} ${await res.text()}`)
  }
  const json = (await res.json()) as { data?: { video_id?: string } }
  const id = json.data?.video_id
  if (!id) return null
  return { videoId: id }
}

export async function pollHeyGenStatus(
  videoId: string
): Promise<{ status: string; videoUrl?: string }> {
  const apiKey = serverEnv.HEYGEN_API_KEY
  if (!apiKey) return { status: 'failed' }
  const res = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    { headers: { 'X-Api-Key': apiKey } }
  )
  if (!res.ok) return { status: 'failed' }
  const json = (await res.json()) as {
    data?: { status?: string; video_url?: string }
  }
  return {
    status: json.data?.status ?? 'unknown',
    videoUrl: json.data?.video_url,
  }
}
