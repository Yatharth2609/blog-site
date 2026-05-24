/**
 * components/JsonLd.tsx
 *
 * Server-side JSON-LD structured data injector.
 * Renders a <script type="application/ld+json"> tag with the given data.
 * Safe to use in Server Components — no client JS required.
 */

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
