const express = require("express");
const { oAuth2Client, SCOPES } = require("./googleAuth");
const { criarQuiz, createGoogleForm, salvarFormularioCompleto, listarFormularios, apagarFormulario, buscarFormularioPorId, listarRespostas } = require("./formService");
const { google } = require("googleapis");

const router = express.Router();

router.get("/auth/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES, prompt: "consent" });
  res.send({ urlAuth: url });
});

router.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Código não recebido do Google.");

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    res.send(`
      <html>
        <body style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif;">
          <h2>Autenticação concluída!</h2>
          <p>Você já pode fechar esta aba.</p>
          <script>
            window.opener.postMessage(
              { token: ${JSON.stringify(tokens)} },
            "*"
          );</script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro na autenticação.");
  }
});

router.get("/validate-token", async (req, res) => {
  try {
    const row = getStoredTokens();
    if (!row) return res.status(401).json({ valid: false, message: "Nenhum token encontrado" });

    oAuth2Client.setCredentials({
      access_token: row.accessToken,
      refresh_token: row.refreshToken,
      expiry_date: row.expiryDate,
    });
    if (Date.now() > row.expiryDate) {
      const { credentials } = await oAuth2Client.refreshToken(row.refreshToken);
      storeTokens(credentials);
      oAuth2Client.setCredentials(credentials);
    }

    res.json({ valid: true });
  } catch (err) {
    console.error(err);
    res.status(401).json({ valid: false, message: "Token inválido" });
  }
});

router.post("/api/quiz", async (req, res) => {
  try {
    const resultado = await criarQuiz(req.body);
    const dadosSalvar = { titulo: req.body.titulo, descricao: req.body.descricao, questoes: req.body.questoes, formId: resultado.formId, linkUrl: resultado.formUrl };
    await salvarFormularioCompleto(dadosSalvar);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar quiz:", err.message || err);
    res.status(500).json({ error: "Erro ao criar quiz.", details: err.message || err });
  }
});

router.post("/api/forms", async (req, res) => {
  try {
    const resultado = await createGoogleForm(req.body);
    const dadosSalvar = { titulo: req.body.titulo, descricao: req.body.descricao, questoes: req.body.questoes, formId: resultado.formId, linkUrl: resultado.formUrl };
    await salvarFormularioCompleto(dadosSalvar);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar formulário:", err.message || err);
    res.status(500).json({ error: "Erro ao criar formulário.", details: err.message || err });
  }
});

router.get("/forms/quest/:formId", async (req, res) => {
  const formId = req.params.formId;
  try {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId });
    res.json({ items: formRes.data.items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar dados do formulário.");
  }
});

router.get("/forms/:formId/responses", async (req, res) => {
  const formId = req.params.formId;
  try {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId });
    const respostasRes = await forms.forms.responses.list({ formId });
    res.json({ items: formRes.data.items || [], responses: respostasRes.data.responses || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar dados do formulário.");
  }
});

router.get("/api/forms/:formId", (req, res) => {
  const form = buscarFormularioPorId(req.params.formId);
  if (!form) return res.status(404).send("Formulário não encontrado");
  res.json(form);
});

router.get("/api/forms", (req, res) => res.json(listarFormularios()));

router.delete("/api/forms/:formId", (req, res) => {
  apagarFormulario(req.params.formId);
  res.sendStatus(200);
});

module.exports = router;
