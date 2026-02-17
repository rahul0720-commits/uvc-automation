import SrtParser from 'srt-parser-2';

/**
 * Parse an SRT file buffer into clean conversation text
 */
export function parseSrt(buffer) {
  const parser = new SrtParser();
  const text = buffer.toString('utf-8');
  const parsed = parser.fromSrt(text);
  return parsed.map((item) => item.text.replace(/<[^>]*>/g, '').trim()).filter(Boolean).join(' ');
}

/**
 * Parse a plain text transcript (Riverside TXT format)
 * Preserves speaker labels if present
 */
export function parseTxt(buffer) {
  const text = buffer.toString('utf-8');
  // Remove timestamps like [00:00:00] or (00:00:00) or 00:00:00
  return text
    .replace(/[\[\(]?\d{1,2}:\d{2}(:\d{2})?[\]\)]?\s*/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Auto-detect format and parse transcript
 */
export function parseTranscript(buffer, filename) {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'srt') {
    return parseSrt(buffer);
  }
  return parseTxt(buffer);
}
