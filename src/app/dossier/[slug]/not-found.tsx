import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
        404 · DOSSIER NOT FOUND
      </div>
      <h1 className="mt-4 font-serif text-5xl text-warm">
        This dossier doesn&apos;t exist (yet).
      </h1>
      <p className="mt-4 max-w-md text-warm/65">
        Generate one for your business — it takes 90 seconds.
      </p>
      <Link
        href="/#dossier"
        className="mt-8 rounded bg-cyan-400 px-8 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-deep transition hover:bg-cyan-300"
      >
        Generate your dossier →
      </Link>
    </div>
  )
}
