"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formService_1 = require("../services/formService");
const googleapis_1 = require("googleapis");
const googleAuth_1 = require("../services/googleAuth");
const quizService_1 = require("../services/quizService");
const QuizDto_1 = require("../models/dto/QuizDto");
const router = (0, express_1.Router)();
/* AUTENTICAÇÃO DO USUÁRIO */
router.get('/auth/google', (req, res) => {
    const url = (0, googleAuth_1.generateAuthUrl)();
    res.json({ urlAuth: url }); // ← envia a URL para o frontend abrir em popup
});
router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (!code)
        return res.status(400).send('Código inválido.');
    try {
        const { tokens } = await googleAuth_1.oAuth2Client.getToken(code);
        googleAuth_1.oAuth2Client.setCredentials(tokens);
        const oauth2 = googleapis_1.google.oauth2({ auth: googleAuth_1.oAuth2Client, version: 'v2' });
        const { data } = await oauth2.userinfo.get();
        await (0, googleAuth_1.storeTokens)(tokens, data.email ?? undefined);
        res.send(`
      <html>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <h2>Login concluído!</h2>
          <p>Pode fechar esta janela.</p>
          <script>
            window.opener.postMessage(
              { token: ${JSON.stringify(tokens)}, email: "${data.email}" },
              "*"
            );
            window.close();
          </script>
        </body>
      </html>
    `);
    }
    catch (err) {
        console.error('Erro na autenticação:', err);
        res.status(500).send('Erro na autenticação do Google.');
    }
});
/* FORMULÁRIOS */
router.get('/formularios/questoes-salvas', async (req, res) => {
    const auth = await (0, googleAuth_1.getAuthClient)();
    const oauth2 = googleapis_1.google.oauth2({ auth, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;
    const forms = await (0, formService_1.buscarQuestoesSalvas)(userEmail ?? null);
    res.json(forms);
});
router.put('/formularios/questoes-salvas/edit', async (req, res) => {
    try {
        const bodyEdit = req.body;
        if (!bodyEdit)
            return res.status(400).send('Formulário inválido.');
        const quest = await (0, formService_1.editarQuestaoSalva)(bodyEdit);
        res.json(quest);
    }
    catch (err) {
        res.status(500).send('Erro ao editar pergunta');
        console.error(err);
    }
});
router.delete('/formularios/questoes-salvas/:questId', async (req, res) => {
    try {
        const id = Number(req.params.questId);
        if (!id)
            return res.status(400).send('ID inválido.');
        await (0, formService_1.apagarPergunta)(id);
        res.status(200).send('Pergunta apagada com sucesso!');
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Erro ao apagar pergunta');
    }
});
router.post('/formularios/questoes', async (req, res) => {
    const auth = await (0, googleAuth_1.getAuthClient)();
    if (!auth)
        return res.status(403).send('Usuário não autenticado.');
    const form = req.body;
    if (!form)
        res.status(400).send('Formulário inválido.');
    await (0, formService_1.salvarPergunta)(form);
    res.status(201).send();
});
router.delete('/formularios/questoes/:questId', async (req, res) => {
    try {
        const id = Number(req.params.questId);
        if (!id)
            return res.status(400).send('ID inválido.');
        await (0, formService_1.apagarPergunta)(id);
        res.status(200).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Erro ao apagar pergunta');
    }
});
router.post('/formularios', async (req, res) => {
    try {
        const auth = await (0, googleAuth_1.getAuthClient)();
        if (!auth)
            return res.status(403).send('Usuário não autenticado.');
        const oauth2 = googleapis_1.google.oauth2({ auth, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();
        const userEmail = userInfo.data.email;
        const url = await (0, formService_1.salvarFormularioCompleto)(req.body, userEmail ?? null);
        res.json({ url });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar formulário');
    }
});
router.get('/formularios', async (_, res) => {
    const auth = await (0, googleAuth_1.getAuthClient)();
    const oauth2 = googleapis_1.google.oauth2({ auth, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;
    const forms = await (0, formService_1.listarFormularios)(userEmail ?? null);
    res.json(forms);
});
router.get('/formularios/:id', async (req, res) => {
    const form = await (0, formService_1.buscarFormularioPorId)(Number(req.params.id));
    if (!form)
        return res.status(404).send('Formulário não encontrado');
    res.json(form);
});
router.get('/formularios/:formId/responses', async (req, res) => {
    const formId = req.params.formId;
    try {
        const forms = googleapis_1.google.forms({ version: 'v1', auth: googleAuth_1.oAuth2Client });
        const formRes = await forms.forms.get({ formId });
        const respostasRes = await forms.forms.responses.list({ formId });
        res.json({
            items: formRes.data.items || [],
            responses: respostasRes.data.responses || [],
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar dados do formulário.');
    }
});
/* QUIZZES */
router.get('/quiz/questoes-salvas', async (req, res) => {
    const forms = await (0, quizService_1.listarTodasQuestoesFavoritas)();
    res.json(forms);
});
router.post('/quiz/questoes-salvas', async (req, res) => {
    try {
        const form = req.body;
        if (!form)
            return res.status(400).send('Formulário inválido.');
        const forms = await (0, quizService_1.salvarQuestao)(form);
        res.json(forms);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar formulário');
    }
});
router.post('/quiz', async (req, res) => {
    try {
        const auth = await (0, googleAuth_1.getAuthClient)();
        const oauth2 = googleapis_1.google.oauth2({ auth, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();
        const userEmail = userInfo.data.email;
        const resultado = await (0, quizService_1.createQuiz)(req.body, userEmail ?? null);
        res.status(201).json({ url: resultado });
    }
    catch (err) {
        console.error('Erro ao criar quiz:', err.message || err);
        res
            .status(500)
            .json({ error: 'Erro ao criar quiz.', details: err.message || err });
    }
});
router.get('/quiz', async (req, res) => {
    try {
        const auth = await (0, googleAuth_1.getAuthClient)();
        const oauth2 = googleapis_1.google.oauth2({ auth, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();
        const userEmail = userInfo.data.email;
        const resultado = await (0, quizService_1.listAllQuizzes)(userEmail ?? null);
        const resultadoDto = resultado.map((quiz) => QuizDto_1.QuizDto.convert(quiz));
        res.status(201).json(resultadoDto);
    }
    catch (err) {
        console.error('Erro ao criar quiz:', err.message || err);
        res
            .status(500)
            .json({ error: 'Erro ao criar quiz.', details: err.message || err });
    }
});
router.get('/quiz/:quizId/responses', async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const responses = await (0, quizService_1.buscarQuizPorId)(quizId);
        if (!responses)
            return res.status(404).send('Quiz não encontrado');
        res.json(responses);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar dados do formulário.');
    }
});
exports.default = router;
