import { generateVideoScript, scriptToText } from './script'
import { startHeyGenRender, synthesizeVoice } from './providers'
import type { VideoInput, VideoRenderResult } from './types'

/**
 * One-shot kickoff: script → voice → HeyGen render start.
 * Does NOT poll to completion — returns a render handle the caller can
 * resume via pollHeyGenStatus. For the MVP, if any provider is unconfigured
 * we return status='manual' and a fully-formed script so the founder can
 * record it by hand in 2 minutes.
 */
export async function kickoffPersonalizedVideo(
  input: VideoInput
): Promise<VideoRenderResult & { heygenVideoId?: string }> {
  const script = await generateVideoScript(input)
  const scriptText = scriptToText(script)

  let audioUrl: string | undefined
  try {
    const voice = await synthesizeVoice(scriptText)
    audioUrl = voice?.audioUrl
  } catch {
    // voice failure shouldn't block — HeyGen can TTS on its own
  }

  let heygenVideoId: string | undefined
  try {
    const render = await startHeyGenRender({ scriptText, audioUrl })
    heygenVideoId = render?.videoId
  } catch {
    // render failure is fine — fall through to manual
  }

  if (heygenVideoId) {
    return {
      status: 'rendering',
      provider: 'heygen',
      scriptText,
      audioUrl,
      heygenVideoId,
    }
  }
  return {
    status: 'manual',
    provider: 'none',
    scriptText,
    audioUrl,
  }
}
