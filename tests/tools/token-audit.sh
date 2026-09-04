#!/usr/bin/env bash
# PLAN.md §10.4 — mechanical token audit. Zero hits outside the documented
# exceptions. Run from the repo root.
set -uo pipefail
SRC="src"
fail=0

report() { # label, pattern, allowed-explanation
  local label="$1" pattern="$2" allow="${3:-}"
  local hits
  if [ -n "$allow" ]; then
    hits=$(grep -rnE "$pattern" "$SRC" | grep -vE "$allow" || true)
  else
    hits=$(grep -rnE "$pattern" "$SRC" || true)
  fi
  local n; n=$(printf '%s' "$hits" | grep -c . || true)
  printf '%-46s %s\n' "$label" "$n hit(s)"
  if [ "$n" != "0" ]; then printf '%s\n' "$hits" | sed 's/^/      /'; fail=1; fi
}

echo "── 1. retired palette hexes ──────────────────────────────────────────"
RETIRED='#060a13|#0d1117|#1e2538|#3b5bdb|#2b4bc6|#e8b339|#9775cd|#5b8af5|#8b9dc3|#4a5568|#6b7a94|#3d4a5c|#0a0e17|#131c30|#1a2236|#2a3348|#111822|#111620|#1a2744'
report "retired hexes" "$RETIRED"

echo "── 2. the three values DESIGN.md §4.5 corrects ───────────────────────"
# #3b4860 survives only as --tx-ghost; #8a7f6e and #a89c88 only in the print map
report "superseded token values" '#5c6d89|#3b4860|#8a7f6e' \
  '(--tx-ghost: #3b4860|--tx3: #8a7f6e)'

echo "── 3. radii above 3px ────────────────────────────────────────────────"
report "tailwind radius utilities" 'rounded-(lg|xl|2xl|3xl|full|md)'
report "border-radius over 3px in CSS" 'border-radius: *(4|5|6|7|8|9|1[0-9]|2[0-9])px'

echo "── 4. atmosphere: blur, glow, shadow, gradient text ──────────────────"
report "blur / backdrop / glow / gradient text" \
  'blur|backdrop|glow|shadow-\[|drop-shadow|bg-gradient|bg-clip-text' \
  'box-shadow'

echo "── 5. animate- utilities outside the motion layer ────────────────────"
report "tailwind animate- utilities" 'animate-'

echo "── 6. box-shadow, which is only the focus ring and the seg control ───"
report "box-shadow outside the allowed set" 'box-shadow' \
  'rgba\(94, ?201, ?214|inset 0 (0 0 (0|1)px|-2px 0|-2px 0 -2px) var\(--(cyan|cyan-d|amber)\)|inset 2px 0 0 var\(--cyan\)|box-shadow \.|box-shadow:none|, *box-shadow|transition: *box-shadow'

echo
if [ "$fail" = "0" ]; then echo "TOKEN AUDIT: clean"; else echo "TOKEN AUDIT: hits above"; fi
exit "$fail"
