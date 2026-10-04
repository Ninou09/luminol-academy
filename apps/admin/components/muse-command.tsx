'use client';

import { useActionState, useRef } from 'react';
import type { Locale } from '@luminol/localization';
import { commandAction } from '../app/muse/actions';
import { getMuseCopy } from '../lib/muse-copy';

export function MuseCommand({
  locale,
  canFinance,
}: {
  locale: Locale;
  canFinance: boolean;
}) {
  const copy = getMuseCopy(locale);
  const [state, action, pending] = useActionState(commandAction, {
    error: false,
  });
  const request = useRef('');
  return (
    <form
      action={action}
      className="muse-command"
      onSubmit={(event) => {
        const input = event.currentTarget.elements.namedItem('requestId');
        if (input instanceof HTMLInputElement) {
          request.current = crypto.randomUUID();
          input.value = request.current;
        }
      }}
    >
      <input type="hidden" name="requestId" defaultValue="" />
      <label htmlFor="muse-prompt">{copy.conversation}</label>
      <textarea
        id="muse-prompt"
        name="prompt"
        required
        minLength={2}
        maxLength={1000}
        rows={3}
        placeholder={copy.prompt}
        dir="auto"
        disabled={pending}
      />
      <div className="muse-command-bar">
        <select
          name="intent"
          aria-label={copy.nextAction}
          disabled={pending}
          defaultValue=""
        >
          <option value="">{copy.prompt}</option>
          {Object.entries(copy.intentions)
            .filter(([key]) => key !== 'revenue' || canFinance)
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
        <button disabled={pending}>
          {pending ? copy.pending : copy.submit}{' '}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      {state.error && <p role="alert">{copy.error}</p>}
    </form>
  );
}
