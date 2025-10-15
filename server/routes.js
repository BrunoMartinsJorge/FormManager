const express = require("express");
const { oAuth2Client, SCOPES } = require("./googleAuth");
const {
  criarQuiz,
  createGoogleForm,
  salvarFormularioCompleto,
  listarFormularios,
  apagarFormulario,
  buscarFormularioPorId,
  listarRespostas,
  findAllQuestionsFavorites,
  listarQuizzes,
  salvarQuizCompleto,
  insertNewQuestionFavorite,
  findAllQuestionsByFormId
} = require("./formService");
const { google } = require("googleapis");

const router = express.Router();

// ------------------- Função utilitária -------------------
function handleGoogleAuthError(err) {
  if (
    err.message.includes("No access") ||
    err.message.includes("invalid_grant") ||
    err.message.includes("Token")
  ) {
    const error = new Error("Token expirado ou inválido");
    error.status = 403;
    throw error;
  }
  throw err;
}

// ------------------- Google OAuth -------------------
router.get("/auth/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
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
            );
          </script>
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

// ------------------- Quiz Routes -------------------
router.post("/api/quiz", async (req, res) => {
  try {
    const resultado = await criarQuiz(req.body);
    const dadosSalvar = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      questoes: req.body.questoes,
      formId: resultado.formId,
      linkUrl: resultado.formUrl,
    };
    await salvarQuizCompleto(dadosSalvar);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar quiz:", err.message || err);
    res.status(500).json({ error: "Erro ao criar quiz.", details: err.message || err });
  }
});

router.get("/api/quiz", (req, res) => {
  try {
    const quizzes = listarQuizzes();
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar quizzes" });
  }
});

// ------------------- Formulários Internos (/api) -------------------
router.post("/api/forms", async (req, res) => {
  try {
    const resultado = await createGoogleForm(req.body);
    const dadosSalvar = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      questoes: req.body.questoes,
      formId: resultado.formId,
      linkUrl: resultado.formUrl,
    };
    await salvarFormularioCompleto(dadosSalvar);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar formulário:", err.message || err);
    res.status(500).json({ error: "Erro ao criar formulário.", details: err.message || err });
  }
});

router.get("/api/forms/:formId/questions", async (req, res) => {
  try {
    const questoes = await findAllQuestionsByFormId(req.params.formId);
    if (!questoes) return res.status(404).send("Questões não encontradas");
    
    res.json(questoes);
  } catch (err) {
    try {
      handleGoogleAuthError(err);
    } catch (authErr) {
      return next(authErr);
    }
    console.error("Erro ao buscar questões:", err.message || err);
    res.status(500).json({ error: "Erro ao buscar questões.", details: err.message || err });
  }
});

router.get("/api/forms/:formId/responses", async (req, res) => {
  try {
    const respostas = listarRespostas(req.params.formId);
    if (!respostas) return res.status(404).send("Respostas não encontradas");
    res.json(respostas);
  } catch (err) {
    console.error("Erro ao buscar respostas:", err.message || err);
    res.status(500).json({ error: "Erro ao buscar respostas.", details: err.message || err });
  }
});

router.get("/api/forms", (req, res) => res.json(listarFormularios()));

router.get("/api/forms/:formId", (req, res) => {
  const form = buscarFormularioPorId(req.params.formId);
  if (!form) return res.status(404).send("Formulário não encontrado");
  res.json(form);
});

router.delete("/api/forms/:formId", (req, res) => {
  apagarFormulario(req.params.formId);
  res.sendStatus(200);
});

// ------------------- Rotas Google Forms (externas) -------------------
router.get("/forms/find-favorite-questions", async (req, res) => {
  try {
    const questions = await findAllQuestionsFavorites();
    res.json({ questions: questions || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar questões favoritas.");
  }
});

router.post("/forms/add-question-favorite", async (req, res) => {
  try {
    insertNewQuestionFavorite(req.body);
    const questions = await findAllQuestionsFavorites();
    res.json({ questions: questions || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao salvar questão nas favoritas.");
  }
});

// --- Google Forms: estrutura do formulário
router.get("/forms/google/:formId", async (req, res, next) => {
  const formId = req.params.formId;
  try {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId });
    res.json({ items: formRes.data.items || [] });
  } catch (err) {
    try {
      handleGoogleAuthError(err);
    } catch (authErr) {
      return next(authErr);
    }
    console.error(err);
    res.status(500).send("Erro ao buscar dados do formulário.");
  }
});

router.get("/forms/quiz/google/:formId/responses", async (req, res, next) => {
  const formId = req.params.formId;
  try {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId });
    
    const respostasRes = await forms.forms.responses.list({ formId });

    res.json({
      items: formRes.data.items || [],
      responses: respostasRes.data.responses || [],
    });
  } catch (err) {
    try {
      handleGoogleAuthError(err);
    } catch (authErr) {
      return next(authErr);
    }
    console.error(err);
    res.status(500).send("Erro ao buscar respostas do formulário.");
  }
});

// --- Google Forms: respostas
router.get("/forms/google/:formId/responses", async (req, res, next) => {
  const formId = req.params.formId;
  try {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId });
    const respostasRes = await forms.forms.responses.list({ formId });
    res.json({
      items: formRes.data.items || [],
      responses: respostasRes.data.responses || [],
    });
  } catch (err) {
    try {
      handleGoogleAuthError(err);
    } catch (authErr) {
      return next(authErr);
    }
    console.error(err);
    res.status(500).send("Erro ao buscar respostas do formulário.");
  }
});

module.exports = router;
