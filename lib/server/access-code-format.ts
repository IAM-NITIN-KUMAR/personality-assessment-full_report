// One-time access code format. Alphabet drops 0/O and 1/I so codes can be
// read out over the phone or WhatsApp without ambiguity.
import { randomBytes } from "node:crypto";

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 8;

/** Uniform pick per char: 32 divides 256, so a byte mod 32 is unbiased. */
export function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
