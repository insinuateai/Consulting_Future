import { anthropic, MODELS, cachedSystem } from '../anthropic'
import { deployApp, inlinePreview } from './deploy'
import type {
  BuildAppEvent,
  BuildAppInput,
  BuildPlan,
  GeneratedFile,
} from './types'

const SYSTEM_PROMPT = `You are the Insinuate.ai "Build Me One" engine. A founder
has described an app they want built in the next 90 seconds. Your job is to
ship a working single-page web application — HTML + vanilla JavaScript +
Tailwind CDN — that they can use immediately.

Rules:
- ONE index.html that works offline (besides tailwind CDN + fonts).
- Inline your JS in a <script type="module"> block, or in a separate main.js
  file loaded by the page.
- Use Tailwind via <script src="https://cdn.tailwindcss.com"></script>.
- No backend. No build step. No package.json needed. Must open in a browser as-is.
- Seed the app with 3-5 realistic sample rows so it looks alive on first load.
- Dark, cinematic aesthetic: near-black background, cyan accents, serif
  headings if you use any (Instrument Serif from Google Fonts), mono labels.
- Include an empty state, working interactions, keyboard shortcuts where
  sensible, and a subtle footer "Built in 90 seconds by Insinuate.ai".

Output format — FOLLOW EXACTLY:

First, a JSON plan block:
\`\`\`plan
{
  "appName": string,
  "summary": string,   // 1-2 sentences
  "files": string[],   // ordered file paths you will emit
  "stack": string[]    // e.g. ["HTML5", "Tailwind CDN", "Vanilla JS"]
}
\`\`\`

Then each file wrapped:
<file path="index.html" lang="html">
...contents...
</file>
<file path="main.js" lang="js">
...contents...
</file>

Emit 1-3 files total. No commentary between files. No closing prose.`

/**
 * Stream a Claude build. Yields BuildAppEvents (plan, per-file chunks, deploy)
 * so the route handler can forward them over SSE.
 */
export async function* runBuildApp(
  appId: string,
  input: BuildAppInput
): AsyncGenerator<BuildAppEvent> {
  yield { type: 'started', prompt: input.prompt, appId }

  const stream = anthropic().messages.stream({
    model: MODELS.opus(),
    max_tokens: 8000,
    system: [cachedSystem(SYSTEM_PROMPT)],
    messages: [
      {
        role: 'user',
        content: `Build the following app for a founder. Be ruthless about
shipping something that works — no half-built UI. Prompt:

"""
${input.prompt}
"""`,
      },
    ],
  })

  let buffer = ''
  let plan: BuildPlan | null = null
  let planEmitted = false
  let currentFile: { path: string; lang: string; content: string } | null = null
  const files: GeneratedFile[] = []

  const FILE_OPEN_RE = /<file\s+path="([^"]+)"\s+lang="([^"]+)">/
  const PLAN_RE = /```plan\s*([\s\S]*?)```/

  for await (const evt of stream) {
    if (evt.type !== 'content_block_delta' || evt.delta.type !== 'text_delta') continue
    buffer += evt.delta.text

    // 1. Try to extract the plan once
    if (!planEmitted) {
      const match = buffer.match(PLAN_RE)
      if (match) {
        try {
          plan = JSON.parse(match[1].trim())
          yield { type: 'plan', plan: plan! }
          planEmitted = true
          buffer = buffer.slice(match.index! + match[0].length)
        } catch {
          // keep accumulating; malformed partial
        }
      }
    }

    if (!planEmitted) continue

    // 2. Parse file open/close tags incrementally
    while (true) {
      if (!currentFile) {
        const open = buffer.match(FILE_OPEN_RE)
        if (!open) break
        currentFile = { path: open[1], lang: open[2], content: '' }
        yield { type: 'file.started', path: open[1] }
        buffer = buffer.slice(open.index! + open[0].length)
        continue
      }

      const closeIdx = buffer.indexOf('</file>')
      if (closeIdx === -1) {
        // No close yet — emit chunk of whatever we have
        if (buffer.length > 0) {
          currentFile.content += buffer
          yield { type: 'file.chunk', path: currentFile.path, chunk: buffer }
          buffer = ''
        }
        break
      }

      // Complete file
      const tail = buffer.slice(0, closeIdx)
      currentFile.content += tail
      if (tail) {
        yield { type: 'file.chunk', path: currentFile.path, chunk: tail }
      }
      const finished: GeneratedFile = {
        path: currentFile.path,
        content: currentFile.content.replace(/^\n+|\n+$/g, ''),
        language: normalizeLang(currentFile.lang),
      }
      files.push(finished)
      yield { type: 'file.done', file: finished }
      buffer = buffer.slice(closeIdx + '</file>'.length)
      currentFile = null
    }
  }
  await stream.finalMessage()

  if (files.length === 0) {
    yield { type: 'error', error: 'Model returned no files — prompt was likely rejected or ambiguous.' }
    return
  }

  yield { type: 'deploy.started' }
  let deploy
  try {
    deploy = await deployApp(appId, files)
  } catch {
    deploy = inlinePreview(appId, files)
  }
  yield { type: 'deploy.ready', result: deploy }
  yield { type: 'complete', appId, files, deploy }
}

function normalizeLang(lang: string): GeneratedFile['language'] {
  const l = lang.toLowerCase()
  if (['html', 'js', 'ts', 'css', 'md', 'json'].includes(l)) {
    return l as GeneratedFile['language']
  }
  if (l === 'javascript') return 'js'
  if (l === 'typescript') return 'ts'
  if (l === 'markdown') return 'md'
  return 'html'
}
