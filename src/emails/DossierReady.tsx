import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface Props {
  companyName: string
  thesis: string
  dossierUrl: string
  topOpportunity: string
}

export function DossierReadyEmail({
  companyName,
  thesis,
  dossierUrl,
  topOpportunity,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your Insinuate dossier for {companyName} is ready.</Preview>
      <Body
        style={{
          backgroundColor: '#030303',
          color: '#F0EDE6',
          fontFamily:
            "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: '40px 0',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#0A0A0A',
            border: '1px solid rgba(240, 237, 230, 0.05)',
            borderRadius: '8px',
            padding: '48px',
          }}
        >
          <Section>
            <Text
              style={{
                color: '#00F0FF',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginTop: 0,
                marginBottom: '24px',
              }}
            >
              INSINUATE DOSSIER · COMPLETE
            </Text>
            <Heading
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '36px',
                fontWeight: 400,
                lineHeight: 1.1,
                color: '#F0EDE6',
                marginTop: 0,
                marginBottom: '24px',
              }}
            >
              Your dossier for {companyName} is ready.
            </Heading>
            <Text style={{ color: '#F0EDE6CC', fontSize: '16px', lineHeight: 1.6 }}>
              {thesis}
            </Text>
          </Section>

          <Hr style={{ borderColor: 'rgba(240, 237, 230, 0.1)', margin: '32px 0' }} />

          <Section>
            <Text
              style={{
                color: '#00F0FF',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Top opportunity
            </Text>
            <Text style={{ color: '#F0EDE6', fontSize: '18px', lineHeight: 1.5 }}>
              {topOpportunity}
            </Text>
          </Section>

          <Section style={{ marginTop: '40px', textAlign: 'center' }}>
            <Link
              href={dossierUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#00F0FF',
                color: '#030303',
                padding: '16px 32px',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '13px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              Read the full dossier →
            </Link>
          </Section>

          <Hr style={{ borderColor: 'rgba(240, 237, 230, 0.1)', margin: '40px 0 24px' }} />
          <Text
            style={{
              color: '#F0EDE680',
              fontSize: '13px',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            We don&apos;t consult. We build. <br />
            Reply to this email or{' '}
            <Link
              href="https://calendly.com/kianjquinlan/30min"
              style={{ color: '#00F0FF' }}
            >
              book 30 min
            </Link>{' '}
            to discuss the build.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default DossierReadyEmail
