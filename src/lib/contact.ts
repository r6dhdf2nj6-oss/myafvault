/**
 * Public support inbox for mailto links (feedback and vault add requests).
 * Override with VITE_REQUEST_EMAIL if the address needs to change per deploy.
 */
export const CONTACT_EMAIL =
  (import.meta.env.VITE_REQUEST_EMAIL as string | undefined)?.trim() ||
  "myafvault@crediblenerds.com";

export const VAULT_ADD_REQUEST_SUBJECT = "Vault add request";

export const VAULT_ADD_REQUEST_BODY = `I'd like to request a figure or set be added to the vault.

Figure name:
Line / franchise:
Year:
SKU (if known):
Link or photo:
`;

export function vaultAddRequestMailto(): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(VAULT_ADD_REQUEST_SUBJECT)}&body=${encodeURIComponent(VAULT_ADD_REQUEST_BODY)}`;
}
