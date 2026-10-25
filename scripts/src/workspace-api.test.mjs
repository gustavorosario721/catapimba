import { createServer } from "node:http";
import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import app from "../../api/index.mjs";
const id = "92000000-0000-0000-0000-000000000001";
const calls = [];
const upstream = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url.startsWith("/auth/v1/user"))
    return res.end(
      JSON.stringify({
        id: "91000000-0000-0000-0000-000000000001",
        is_anonymous: false,
      }),
    );
  let input = "";
  for await (const chunk of req) input += chunk;
  const body = input ? JSON.parse(input) : {};
  calls.push({ url: req.url, body, authorization: req.headers.authorization });
  if (req.headers.authorization === "Bearer forbidden") {
    res.statusCode = 403;
    return res.end(
      JSON.stringify({ code: "42501", message: "permission denied" }),
    );
  }
  if (req.url.endsWith("/workspace_command"))
    return res.end(JSON.stringify({ ok: true, id }));
  res.end(
    JSON.stringify({
      capabilities: {
        manageEvents: req.headers.authorization === "Bearer manager",
      },
      projects: [
        {
          name: '=HYPERLINK("x")',
          summary: "  +SUM(1)",
          category: "@x",
          stage: "Descoberta",
          year: 2026,
          semester: 2,
        },
      ],
      results: [
        {
          event_id: id,
          name: "Banca",
          published: false,
          rows: [
            {
              name: "Projeto",
              position: 1,
              score: 4,
              submitted: 2,
              expected: 2,
            },
          ],
        },
      ],
    }),
  );
});
const server = createServer(app);
let origin;
const previous = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_PUBLISHABLE_KEY,
};
async function listen(s) {
  await new Promise((resolve) => s.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${s.address().port}`;
}
before(async () => {
  process.env.SUPABASE_URL = await listen(upstream);
  process.env.SUPABASE_PUBLISHABLE_KEY = "test";
  origin = await listen(server);
});
after(async () => {
  for (const s of [server, upstream]) {
    s.closeAllConnections();
    await new Promise((resolve) => s.close(resolve));
  }
  for (const [key, value] of [
    ["SUPABASE_URL", previous.url],
    ["SUPABASE_PUBLISHABLE_KEY", previous.key],
  ])
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
});
function call(suffix = "", token = "manager", body) {
  return fetch(`${origin}/api/workspace/${id}${suffix}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
test("workspace requires identity and preserves no-store", async () => {
  const r = await call("", null);
  assert.equal(r.status, 401);
  assert.equal(r.headers.get("cache-control"), "no-store");
});
test("SQL permission errors deny workspace read and commands", async () => {
  assert.equal((await call("", "forbidden")).status, 403);
  assert.equal(
    (await call("/commands", "forbidden", { action: "project.save", data: {} }))
      .status,
    403,
  );
});
test("command validates action, envelope and institution before RPC", async () => {
  const n = calls.length;
  for (const body of [
    { action: "unknown", data: {} },
    { action: "project.save", data: [] },
    { action: "project.save", data: {}, user_id: id },
  ])
    assert.equal((await call("/commands", "manager", body)).status, 400);
  assert.equal(
    (
      await fetch(`${origin}/api/workspace/invalid`, {
        headers: { Authorization: "Bearer manager" },
      })
    ).status,
    400,
  );
  assert.equal(calls.length, n);
});
test("server forwards authenticated user token and selected institution without privilege substitution", async () => {
  const r = await call("/commands", "manager", {
    action: "project.save",
    data: { name: "Projeto" },
  });
  assert.equal(r.status, 200);
  const c = calls.at(-1);
  assert.equal(c.authorization, "Bearer manager");
  assert.deepEqual(c.body, {
    p_institution: id,
    p_action: "project.save",
    p_data: { name: "Projeto" },
  });
});
test("exports require management and block unknown events", async () => {
  assert.equal((await call("/export?type=projects", "student")).status, 403);
  assert.equal((await call("/export?type=results&event=foreign")).status, 404);
});
test("CSV export quotes fields, neutralizes formulas and keeps headers", async () => {
  const r = await call("/export?type=projects");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/csv/);
  const csv = await r.text();
  assert.match(csv, /'=HYPERLINK\(""x""\)/);
  assert.match(csv, /'  \+SUM/);
  assert.match(csv, /'@x/);
});
