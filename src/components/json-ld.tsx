interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}

/**
 * Renders one or more JSON-LD <script> blocks. Escapes `</script>` and HTML
 * special characters in the JSON payload so a hostile string downstream
 * cannot break out of the script tag and execute arbitrary HTML/JS.
 *
 * Inputs are static today (everything in src/lib/seo.ts) but hardening costs
 * nothing and protects against future regressions.
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeStringify(item) }}
        />
      ))}
    </>
  )
}

// U+2028 / U+2029 are line/paragraph separators that JSON permits literally
// but a JavaScript <script>-tag string literal forbids. We can't put them
// inline as regex literals because the TypeScript lexer treats them as line
// terminators in source. Build them with String.fromCharCode to sidestep
// that lexer behavior, then build a single RegExp at module-init.
const LS = String.fromCharCode(0x2028)
const PS = String.fromCharCode(0x2029)
const LINE_SEP_RE = new RegExp(`[${LS}${PS}]`, "g")

/**
 * JSON.stringify, then escape the sequences a JSON value can produce that
 * would let an attacker break out of a <script> tag: <, >, &, and the two
 * Unicode line-terminator characters (U+2028, U+2029).
 */
function safeStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEP_RE, (ch) =>
      ch === LS ? "\\u2028" : "\\u2029"
    )
}
