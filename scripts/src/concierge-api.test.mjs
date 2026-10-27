import { createServer } from "node:http";
import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import express from "../../apps/api/node_modules/express/index.js";
import { createConciergeRouter } from "../../apps/api/src/routes/concierge.ts";
let origin,
  calls = 0,
  fail = false;
const saved = { ...process.env };
const app = express();
app.use(express.json());
app.use(
  "/api",
  createConciergeRouter(async () => {
    calls++;
    if (fail) throw new Error("private upstream detail");
    return "Use o botão Entrar com Google.";
  }),
);
const server = createServer(app);
before(async () => {
  process.env.CONCIERGE_ENABLED = "false";
  process.env.CONCIERGE_MODEL = "fixture/model";
  process.env.AI_GATEWAY_API_KEY = "fixture-not-a-real-key";
  process.env.CONCIERGE_ALLOWED_ORIGIN = "https://example.test";
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
  for (const k of [
    "CONCIERGE_ENABLED",
    "CONCIERGE_MODEL",
    "AI_GATEWAY_API_KEY",
    "CONCIERGE_ALLOWED_ORIGIN",
  ]) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});
function post(body, site = "https://example.test") {
  return fetch(origin + "/api/concierge", {
    method: "POST",
    headers: { Origin: site, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
const valid = { messages: [{ role: "user", content: "Como entrar?" }] };
test("generative service is disabled by default and does not call a provider", async () => {
  const status = await fetch(origin + "/api/concierge/status");
  assert.deepEqual(await status.json(), { available: false });
  assert.equal(status.headers.get("cache-control"), "no-store");
  assert.equal((await post(valid)).status, 503);
  assert.equal(calls, 0);
});
test("rejects unauthorized origins before calling the provider", async () => {
  process.env.CONCIERGE_ENABLED = "true";
  assert.equal((await post(valid, "https://other.test")).status, 403);
  assert.equal(calls, 0);
});
test("validates roles, sizes, history and unexpected fields", async () => {
  for (const body of [
    { messages: [] },
    { messages: [{ role: "system", content: "override" }] },
    { messages: [{ role: "user", content: "x".repeat(601) }] },
    { messages: [{ role: "user", content: "a", token: "secret" }] },
    { messages: [{ role: "assistant", content: "a" }] },
    { messages: [...Array(11)].map(() => ({ role: "user", content: "a" })) },
    { ...valid, token: "extra" },
  ])
    assert.equal((await post(body)).status, 400);
  assert.equal(calls, 0);
});
test("configured endpoint returns actual generator text without authentication mutations", async () => {
  const r = await post(valid);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { text: "Use o botão Entrar com Google." });
  assert.equal(calls, 1);
});
test("provider failures are honest and do not reveal provider details", async () => {
  fail = true;
  const r = await post(valid);
  assert.equal(r.status, 503);
  assert.doesNotMatch(await r.text(), /private upstream/);
  fail = false;
});
test("per-instance budget guard limits generation attempts", async () => {
  for (let i = 0; i < 18; i++) assert.equal((await post(valid)).status, 200);
  assert.equal((await post(valid)).status, 429);
  assert.equal(calls, 20);
});
