/**
 * Optional future contact API helper.
 * Current site parity uses mailto links only.
 */
export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  subject?: string;
};

export async function submitContact(payload: ContactPayload): Promise<{ ok: boolean; error?: string }> {
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;
  if (!endpoint) {
    return {
      ok: false,
      error:
        'No VITE_CONTACT_ENDPOINT configured. Use mailto links or set the endpoint in .env.',
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        to: import.meta.env.VITE_CONTACT_EMAIL || 'mike@simmsgroupconsulting.com',
        service: import.meta.env.VITE_EMAIL_SERVICE || 'custom',
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Request failed with status ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
