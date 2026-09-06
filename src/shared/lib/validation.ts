/**
 * Field-level validators shared by the hand-rolled forms.
 *
 * The repo has no validation library on purpose (see README "Known gaps"), so
 * the rules live here rather than being retyped per form — the email pattern
 * had already been written twice before this file existed.
 */

/**
 * Deliberately permissive: something@something.tld, no dots-and-dashes rulebook.
 *
 * A regex strict enough to reject every invalid address also rejects valid ones
 * (`+` tags, new TLDs, IDN), and the only check that actually proves an address
 * works is sending mail to it. This catches typos; the server has the last word.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

/**
 * Bulgarian landlines (02 952 1234), mobiles (0888 123 456) and international
 * (+359 88 812 3456) all have to pass, and clubs write them with any mix of
 * spaces, dashes, slashes and brackets. So: check the digit count, not the shape.
 */
export function isPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[\d\s\-/().]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '').length;
  return digits >= 6 && digits <= 20;
}

/**
 * Accepts what a club is likely to paste for "website or social": a full URL, a
 * bare domain, or a Facebook/Instagram page. Only the shape is checked here —
 * `normalizeUrl` is what turns it into something linkable.
 */
export function isUrlLike(value: string): boolean {
  const trimmed = value.trim();
  if (/\s/.test(trimmed)) return false;
  return /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(trimmed);
}

/** Adds the scheme a bare domain is missing, so the stored value is a real URL. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
