import { serverEnv } from '../env'
import type { DeployResult, GeneratedFile } from './types'

/**
 * Deploy to Vercel when VERCEL_TOKEN is configured; otherwise return an
 * inline preview (files served from our /apps/[id] route).
 */
export async function deployApp(
  appId: string,
  files: GeneratedFile[]
): Promise<DeployResult> {
  const token = serverEnv.VERCEL_API_TOKEN
  if (!token) {
    return inlinePreview(appId, files)
  }
  try {
    const payload = {
      name: `insinuate-app-${appId}`,
      target: 'production' as const,
      files: files.map((f) => ({
        file: f.path,
        data: f.content,
      })),
      projectSettings: {
        framework: null,
        devCommand: null,
        buildCommand: null,
        outputDirectory: null,
      },
    }
    const res = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Vercel deploy failed: ${res.status}`)
    const json = (await res.json()) as { url?: string; id?: string }
    if (!json.url) throw new Error('Vercel deploy missing url')
    return {
      url: `https://${json.url}`,
      previewUrl: `https://${json.url}`,
      inline: false,
    }
  } catch {
    return inlinePreview(appId, files)
  }
}

/**
 * Stateless inline preview — our own /apps/[id] page reads from the Supabase
 * row and renders the app's index.html in a sandboxed iframe. Returns the
 * URL the UI should iframe.
 */
export function inlinePreview(appId: string, _files: GeneratedFile[]): DeployResult {
  return {
    url: `/apps/${appId}`,
    previewUrl: `/apps/${appId}`,
    inline: true,
  }
}
