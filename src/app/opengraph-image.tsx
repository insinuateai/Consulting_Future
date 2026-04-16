import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Insinuate.ai — We Don\'t Consult, We Build'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#030303',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient orb */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,0,110,0.05) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: '14px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#00F0FF',
              fontFamily: 'monospace',
              display: 'flex',
            }}
          >
            AI Consulting Agency
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 300,
              color: '#F0EDE6',
              letterSpacing: '-0.02em',
              display: 'flex',
            }}
          >
            Insinuate.ai
          </div>
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(240,237,230,0.5)',
              maxWidth: '600px',
              textAlign: 'center',
              lineHeight: 1.5,
              display: 'flex',
            }}
          >
            We don&apos;t consult, we build.
          </div>

          {/* Separator line */}
          <div
            style={{
              width: '60px',
              height: '1px',
              background: 'rgba(0,240,255,0.3)',
              marginTop: '16px',
              display: 'flex',
            }}
          />

          <div
            style={{
              fontSize: '16px',
              color: 'rgba(240,237,230,0.35)',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              display: 'flex',
            }}
          >
            48-Hour Proof of Concept — Production AI Systems
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
