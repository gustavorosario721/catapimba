import { Router, type Response } from "express";
import { authenticate } from "../lib/identity";

export const workspaceRouter = Router();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const actions = new Set([
  "access.request",
  "member.save",
  "project.save",
  "project.team",
  "criterion.save",
  "event.save",
  "event.status",
  "event.publish",
  "evaluation.submit",
]);
function failure(res: Response, error: { code?: string; message?: string }) {
  const status =
    error.code === "42501"
      ? 403
      : error.code === "P0002"
        ? 404
        : [
              "22023",
              "22P02",
              "22007",
              "22008",
              "23502",
              "23503",
              "23505",
              "23514",
            ].includes(error.code ?? "")
          ? 400
          : 503;
  const message =
    status === 403
      ? "Você não possui acesso a esta operação neste contexto."
      : status === 404
        ? "Registro não encontrado neste contexto."
        : status === 400
          ? error.code === "22023" &&
            error.message &&
            /[áéíóúãõç]/i.test(error.message)
            ? error.message
            : "Verifique os campos e vínculos informados."
          : "Não foi possível concluir a operação. Tente novamente.";
  res.status(status).json({ error: message });
}
workspaceRouter.get("/workspace/catalog", async (req, res) => {
  const identity = await authenticate(req, res);
  if (!identity) return;
  const { data, error } = await identity.client.rpc("workspace_catalog");
  if (error) {
    failure(res, error);
    return;
  }
  res.json(data);
});
workspaceRouter.get("/workspace/:institutionId", async (req, res) => {
  const identity = await authenticate(req, res);
  if (!identity) return;
  if (!uuid.test(String(req.params.institutionId))) {
    res.status(400).json({ error: "Instituição inválida." });
    return;
  }
  const { data, error } = await identity.client.rpc("workspace_read", {
    p_institution: req.params.institutionId,
  });
  if (error) {
    failure(res, error);
    return;
  }
  res.json(data);
});
workspaceRouter.post("/workspace/:institutionId/commands", async (req, res) => {
  const identity = await authenticate(req, res);
  if (!identity) return;
  const body = req.body;
  if (
    !uuid.test(String(req.params.institutionId)) ||
    !body ||
    Array.isArray(body) ||
    Object.keys(body).some((k) => !["action", "data"].includes(k)) ||
    !actions.has(body.action) ||
    !body.data ||
    typeof body.data !== "object" ||
    Array.isArray(body.data)
  ) {
    res.status(400).json({ error: "Operação ou dados inválidos." });
    return;
  }
  const { data, error } = await identity.client.rpc("workspace_command", {
    p_institution: req.params.institutionId,
    p_action: body.action,
    p_data: body.data,
  });
  if (error) {
    failure(res, error);
    return;
  }
  res.json(data);
});

export function csvCell(value: unknown) {
  let cell = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(cell) || /^[\t\r]/.test(cell)) cell = `'${cell}`;
  return `"${cell.replaceAll('"', '""')}"`;
}
workspaceRouter.get("/workspace/:institutionId/export", async (req, res) => {
  const identity = await authenticate(req, res);
  if (!identity) return;
  if (
    !uuid.test(String(req.params.institutionId)) ||
    !["projects", "results"].includes(String(req.query.type))
  ) {
    res.status(400).json({ error: "Exportação inválida." });
    return;
  }
  const { data, error } = await identity.client.rpc("workspace_read", {
    p_institution: req.params.institutionId,
  });
  if (error) {
    failure(res, error);
    return;
  }
  if (!data.capabilities.manageEvents) {
    res
      .status(403)
      .json({ error: "Exportação restrita à gestão institucional." });
    return;
  }
  let rows: unknown[][];
  if (req.query.type === "projects") {
    rows = [
      ["Projeto", "Descrição", "Categoria", "Etapa", "Ano", "Semestre"],
      ...data.projects.map((p: Record<string, unknown>) => [
        p.name,
        p.summary,
        p.category,
        p.stage,
        p.year,
        p.semester,
      ]),
    ];
  } else {
    const event = data.results.find(
      (e: { event_id: string }) => e.event_id === req.query.event,
    );
    if (!event) {
      res.status(404).json({ error: "Banca não encontrada neste contexto." });
      return;
    }
    rows = [
      [
        "Banca",
        "Projeto",
        "Posição",
        "Média",
        "Avaliações",
        "Esperadas",
        "Publicado",
      ],
      ...event.rows.map((r: Record<string, unknown>) => [
        event.name,
        r.name,
        r.position,
        r.score,
        r.submitted,
        r.expected,
        event.published ? "Sim" : "Não",
      ]),
    ];
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="elo-${req.query.type}.csv"`,
  );
  res.send(
    "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
  );
});
