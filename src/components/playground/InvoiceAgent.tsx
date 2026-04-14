'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  INVOICE_SAMPLES,
  INVOICE_STAGES,
  type InvoiceSample,
  type InvoiceExtractedField,
} from '@/lib/playgroundAgents'
import { useSoundContext } from '@/lib/SoundContext'
import { useCountUp } from '@/hooks/useCountUp'

const EASE = [0.16, 1, 0.3, 1] as const

interface BoxRect { x: number; y: number; w: number; h: number }

function formatCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function InvoicePreview({
  sample,
  fieldRefs,
}: {
  sample: InvoiceSample
  fieldRefs: React.MutableRefObject<Record<string, HTMLSpanElement | null>>
}) {
  const setRef = (key: string) => (el: HTMLSpanElement | null) => {
    fieldRefs.current[key] = el
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded p-6 text-warm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan/10 border border-cyan/20 flex items-center justify-center font-display text-cyan text-xl">
            {sample.vendorInitial}
          </div>
          <div>
            <span
              ref={setRef('vendor')}
              data-field="vendor"
              className="font-display text-lg block leading-tight"
            >
              {sample.vendor}
            </span>
            <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
              Invoice
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] text-muted uppercase tracking-widest">Invoice #</p>
          <span ref={setRef('invoiceNumber')} data-field="invoiceNumber" className="font-mono text-sm">
            {sample.invoiceNumber}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
        <div>
          <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-1">Issue date</p>
          <span ref={setRef('issueDate')} data-field="issueDate" className="font-mono text-sm">
            {sample.issueDate}
          </span>
        </div>
        <div>
          <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-1">Due date</p>
          <span ref={setRef('dueDate')} data-field="dueDate" className="font-mono text-sm">
            {sample.dueDate}
          </span>
        </div>
        <div className="col-span-2">
          <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-1">Bill to</p>
          <span className="font-mono text-sm">{sample.billTo}</span>
        </div>
      </div>

      {/* Line items */}
      <table className="w-full text-left mb-6">
        <thead>
          <tr className="font-mono text-[9px] uppercase tracking-widest text-muted">
            <th className="pb-2 font-normal">Description</th>
            <th className="pb-2 font-normal text-right">Qty</th>
            <th className="pb-2 font-normal text-right">Unit</th>
            <th className="pb-2 font-normal text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs">
          {sample.lineItems.map((li, i) => (
            <tr key={i} className="border-t border-white/5">
              <td className="py-2 pr-2">{li.description}</td>
              <td className="py-2 text-right tabular-nums">{li.qty}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(li.unit)}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(li.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-56 space-y-1 font-mono text-xs">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(sample.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Tax</span>
            <span ref={setRef('tax')} data-field="tax" className="tabular-nums">
              {formatCurrency(sample.tax)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10 text-warm">
            <span>Total</span>
            <span ref={setRef('total')} data-field="total" className="tabular-nums font-bold">
              {formatCurrency(sample.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfidenceRow({
  field,
  index,
}: {
  field: InvoiceExtractedField
  index: number
}) {
  const pct = useCountUp(field.confidence, 900)
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.12, ease: EASE }}
      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
    >
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
          {field.label}
        </p>
        <p className="font-mono text-sm text-warm truncate">{field.value}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-16 h-px bg-white/10 relative overflow-hidden">
          <motion.div
            className="h-full bg-cyan"
            initial={{ width: 0 }}
            animate={{ width: `${field.confidence}%` }}
            transition={{ duration: 0.9, ease: EASE, delay: index * 0.12 }}
          />
        </div>
        <span className="font-mono text-[10px] text-cyan tabular-nums w-9 text-right">
          {pct}%
        </span>
      </div>
    </motion.div>
  )
}

export function InvoiceAgent() {
  const [sampleId, setSampleId] = useState(INVOICE_SAMPLES[0].id)
  const [running, setRunning] = useState(false)
  const [stageIdx, setStageIdx] = useState(-1)
  const [revealedFields, setRevealedFields] = useState<InvoiceExtractedField[]>([])
  const [boxes, setBoxes] = useState<Record<string, BoxRect>>({})
  const fieldRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const { playEffect } = useSoundContext()

  const sample = INVOICE_SAMPLES.find((s) => s.id === sampleId)!
  const activeStage = stageIdx >= 0 ? INVOICE_STAGES[stageIdx] : null
  const progress = activeStage?.pct ?? 0
  const done = stageIdx === INVOICE_STAGES.length - 1

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const reset = () => {
    clearTimers()
    setRunning(false)
    setStageIdx(-1)
    setRevealedFields([])
    setBoxes({})
  }

  useEffect(() => () => clearTimers(), [])

  useLayoutEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleId])

  const measureBox = (key: string): BoxRect | null => {
    const el = fieldRefs.current[key]
    const container = containerRef.current
    if (!el || !container) return null
    const er = el.getBoundingClientRect()
    const cr = container.getBoundingClientRect()
    return { x: er.left - cr.left, y: er.top - cr.top, w: er.width, h: er.height }
  }

  const run = () => {
    clearTimers()
    setRunning(true)
    setStageIdx(-1)
    setRevealedFields([])
    setBoxes({})
    playEffect('click')
    playEffect('xray-scan')

    INVOICE_STAGES.forEach((stage, i) => {
      timers.current.push(
        setTimeout(() => {
          setStageIdx(i)
          if (stage.label === 'Field extraction') {
            sample.extracted.forEach((f, j) => {
              timers.current.push(
                setTimeout(() => {
                  const box = measureBox(f.key)
                  if (box) setBoxes((prev) => ({ ...prev, [f.key]: box }))
                  setRevealedFields((prev) => [...prev, f])
                }, j * 160)
              )
            })
          }
          if (stage.label === 'Done') playEffect('xray-complete')
        }, stage.delayMs)
      )
    })
  }

  return (
    <div ref={containerRef} className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: invoice preview + samples */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {INVOICE_SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                playEffect('click')
                setSampleId(s.id)
              }}
              onMouseEnter={() => playEffect('hover')}
              className={[
                'font-mono text-[10px] uppercase tracking-widest px-3 py-2 rounded border transition-all duration-300',
                s.id === sampleId
                  ? 'border-cyan text-cyan bg-cyan/5'
                  : 'border-white/10 text-muted hover:text-warm hover:border-white/20',
              ].join(' ')}
            >
              {s.vendor}
            </button>
          ))}
        </div>

        <div className="relative">
          <InvoicePreview sample={sample} fieldRefs={fieldRefs} />

          {/* Bounding boxes */}
          <AnimatePresence>
            {Object.entries(boxes).map(([key, box]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute pointer-events-none border border-cyan rounded-sm"
                style={{
                  left: box.x - 4,
                  top: box.y - 2,
                  width: box.w + 8,
                  height: box.h + 4,
                  boxShadow: '0 0 12px rgba(0,240,255,0.35)',
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: pipeline */}
      <div className="space-y-4">
        <div className="glass-panel-strong p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`font-mono text-sm ${done ? 'text-green' : running ? 'text-muted' : 'text-muted/60'}`}>
              {activeStage?.label ?? 'Ready to extract'}
              {running && !done && <span className="text-cyan animate-pulse ml-1">▋</span>}
            </span>
            <span className="font-mono text-xs text-muted tabular-nums">{progress}%</span>
          </div>
          <div className="h-px bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan rounded-full"
              animate={{
                width: `${progress}%`,
                boxShadow: done ? '0 0 12px rgba(0,240,255,0.65)' : 'none',
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>

          {!running && (
            <button
              onClick={run}
              onMouseEnter={() => playEffect('hover')}
              className="mt-6 w-full bg-cyan text-deep font-mono text-sm uppercase tracking-wider py-3 rounded-xl transition-all duration-300 hover:shadow-[0_0_32px_rgba(0,240,255,0.38)]"
            >
              Extract Invoice
            </button>
          )}

          {running && (
            <div className="mt-6 space-y-0">
              {revealedFields.map((f, i) => (
                <ConfidenceRow key={f.key} field={f} index={i} />
              ))}
              {revealedFields.length === 0 && (
                <p className="font-mono text-xs text-muted text-center py-8">
                  Waiting on extraction…
                </p>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="glass-panel p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  Processed in
                </p>
                <p className="font-mono text-lg text-green tabular-nums">
                  {sample.processingTime}
                </p>
              </div>
              <button
                onClick={reset}
                className="font-mono text-xs text-muted uppercase tracking-wider hover:text-cyan transition-colors"
              >
                ↩ Run again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
