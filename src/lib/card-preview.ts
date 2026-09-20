export function cardPreview(back: string): string {
  const definitionLine = back
    .split("\n")
    .find((line) => line.startsWith("• "))
  if (definitionLine) return definitionLine.replace(/^•\s*/, "")
  return back.split("\n").find((line) => line.trim()) ?? back
}
