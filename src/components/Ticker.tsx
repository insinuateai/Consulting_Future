'use client'

const TICKER_ITEMS = [
  'Agent #47 completed invoice batch — 2s ago',
  '$12.4K saved for Client Echo today',
  'Lead scoring model v3.1 deployed — 99.2% accuracy',
  'Support agent resolved ticket #9,241 in 4s',
  'Pipeline optimization: 8.2x throughput increase',
  'Uptime: 99.97% — 42 agents active',
  'Contract extraction: 340 docs processed in 18min',
  'Outbound sequence launched — 1,200 prospects enrolled',
  'Anomaly detected + flagged in billing pipeline — 0 human intervention',
  'Client Delta: $4.1M ARR pipeline qualified overnight',
  'New deployment: Proposal generator v2 — avg. time 11s',
  'Agent cluster auto-scaled to handle 3.4x traffic spike',
]

export function Ticker() {
  // Duplicate for seamless infinite loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      aria-hidden="true"
      className={[
        'fixed bottom-0 left-0 right-0 z-40',
        'h-8 overflow-hidden',
        'bg-deep/90 backdrop-blur-sm',
        'border-t border-white/[0.05]',
        'flex items-center',
      ].join(' ')}
    >
      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{
          animation: 'ticker-scroll 40s linear infinite',
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-mono text-[10px] text-muted px-1">
              {item}
            </span>
            <span
              className="font-mono text-[10px] text-cyan mx-3"
              style={{ textShadow: '0 0 8px #00F0FF66' }}
            >
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
