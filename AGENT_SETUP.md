# Ask ReVolve setup

The OpenAI key must be stored as a server-only Vercel environment variable. Never put it in HTML, browser JavaScript, the repository, or chat.

1. In Vercel, open Jacky's projects → hpe-revolve → Settings → Environment Variables.
2. Add `OPENAI_API_KEY` for Production using your own OpenAI project key. Do not expose it to the client.
3. Optional: set `OPENAI_MODEL`. The default is `gpt-5.6-terra`.
4. Redeploy the application so the function receives the new variable.
5. Open `/demo`, choose Ask ReVolve, and ask why RV-1048 is blocked.

The endpoint is `/api/agent`. GET reports configuration status without revealing secrets. POST uses the OpenAI Responses API and read-only function tools for fixed sample returns, workflow rules, and allowed actions. No HPE APIs or write tools are available. Browser-local edits and new travelers are intentionally not synchronized; the interface states that limitation.

The function limits question/history sizes, tool rounds, output tokens, and request time, and applies a best-effort per-instance rate limit. For a wider public rollout, configure a durable account/IP quota or Vercel firewall controls and monitor API usage. The per-instance limit is not a guaranteed account-wide spending cap.

Tests use mocked OpenAI responses and do not need or spend an API key. A real model answer can only be verified after the server environment variable is configured and the app is redeployed.
