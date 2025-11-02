import { Router, Request, Response } from 'express';

import {
  salvarFormularioCompleto,
  listarFormularios,
  buscarFormularioPorId,
  buscarQuestoesSalvas,
  salvarPergunta,
  apagarPergunta,
  editarPerguntaSalva,
  buscarRespostasDoFormularioPorId,
} from '../services/formService';
import { google } from 'googleapis';
import {
  generateAuthUrl,
  getAuthClient,
  oAuth2Client,
  SCOPES,
  storeTokens,
} from '../services/googleAuth';
import {
  buscarQuizPorId,
  createQuiz,
  editarQuestaoSalva,
  listAllQuizzes,
  listarTodasQuestoesFavoritas,
  salvarQuestao,
} from '../services/quizService';
import { QuizDto } from '../models/dto/QuizDto';
import { NewQuestQuizSaved } from '../forms/NewQuestQuizSaved';

const router = Router();

/* AUTENTICAÇÃO DO USUÁRIO */

router.get('/auth/google', (req, res) => {
  const url = generateAuthUrl();
  res.json({ urlAuth: url }); // ← envia a URL para o frontend abrir em popup
});

router.get('/oauth2callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('Código inválido.');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    await storeTokens(tokens, data.email ?? undefined);

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
  } catch (err) {
    console.error('Erro na autenticação:', err);
    res.status(500).send('Erro na autenticação do Google.');
  }
});

/* FORMULÁRIOS */

router.get('/formularios/questoes-salvas', async (req, res) => {
  const auth = await getAuthClient();
  const oauth2 = google.oauth2({ auth, version: 'v2' });
  const userInfo = await oauth2.userinfo.get();
  const userEmail = userInfo.data.email;
  const forms = await buscarQuestoesSalvas(userEmail ?? null);
  res.json(forms);
});

router.put('/formularios/questoes-salvas/edit', async (req, res) => {
  try {
    const bodyEdit = req.body;
    if (!bodyEdit) return res.status(400).send('Formulário inválido.');
    const quest = await editarPerguntaSalva(bodyEdit);
    res.json(quest);
  } catch (err) {
    res.status(500).send('Erro ao editar pergunta');
    console.error(err);
  }
});

router.delete('/formularios/questoes-salvas/:questId', async (req, res) => {
  try {
    const id = Number(req.params.questId);
    if (!id) return res.status(400).send('ID inválido.');
    await apagarPergunta(id);
    res.status(200).send('Pergunta apagada com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao apagar pergunta');
  }
});

router.post('/formularios/questoes', async (req, res) => {
  const auth = await getAuthClient();
  if (!auth) return res.status(403).send('Usuário não autenticado.');
  const form = req.body;
  if (!form) res.status(400).send('Formulário inválido.');
  await salvarPergunta(form);
  res.status(201).send();
});

router.delete(
  '/formularios/questoes/:questId',
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.questId);
      if (!id) return res.status(400).send('ID inválido.');
      await apagarPergunta(id);
      res.status(200).send();
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao apagar pergunta');
    }
  }
);

router.post('/formularios', async (req, res) => {
  try {
    const auth = await getAuthClient();
    if (!auth) return res.status(403).send('Usuário não autenticado.');
    const oauth2 = google.oauth2({ auth, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;

    const url = await salvarFormularioCompleto(req.body, userEmail ?? null);
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar formulário');
  }
});

router.get('/formularios', async (_, res) => {
  const auth = await getAuthClient();
  const oauth2 = google.oauth2({ auth, version: 'v2' });
  const userInfo = await oauth2.userinfo.get();
  const userEmail = userInfo.data.email;
  const forms = await listarFormularios(userEmail ?? null);
  res.json(forms);
});

router.get('/formularios/:id', async (req, res) => {
  const form = await buscarFormularioPorId(Number(req.params.id));
  if (!form) return res.status(404).send('Formulário não encontrado');
  res.json(form);
});

router.get('/formularios/:formId/responses', async (req, res) => {
  const formId = req.params.formId;
  try {
    const resposta = await buscarRespostasDoFormularioPorId(formId);
    if (!resposta) return res.status(404).send('Formulário não encontrado');
    res.json(resposta);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar dados do formulário.');
  }
});

/* QUIZZES */

router.put('/quiz/questoes-salvas', async (req, res) => {
  try {
    const bodyEdit = req.body;
    if (!bodyEdit) return res.status(400).send('Formulário inválido.');
    const quest = await editarQuestaoSalva(bodyEdit);
    res.json(quest);
  } catch (err) {
    res.status(500).send('Erro ao editar pergunta');
    console.error(err);
  }
});

router.get('/quiz/questoes-salvas', async (req, res) => {
  const forms = await listarTodasQuestoesFavoritas();
  res.json(forms);
});

router.post('/quiz/questoes-salvas', async (req, res) => {
  try {
    const form: NewQuestQuizSaved = req.body;
    if (!form) return res.status(400).send('Formulário inválido.');
    const forms = await salvarQuestao(form);
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar formulário');
  }
});

router.post('/quiz', async (req, res) => {
  try {
    const auth = await getAuthClient();
    const oauth2 = google.oauth2({ auth, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;

    const resultado = await createQuiz(req.body, userEmail ?? null);

    res.status(201).json({ url: resultado });
  } catch (err: any) {
    console.error('Erro ao criar quiz:', err.message || err);
    res
      .status(500)
      .json({ error: 'Erro ao criar quiz.', details: err.message || err });
  }
});

router.get('/quiz', async (req, res) => {
  try {
    const auth = await getAuthClient();
    const oauth2 = google.oauth2({ auth, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;
    const resultado = await listAllQuizzes(userEmail ?? null);
    res.status(201).json(resultado);
  } catch (err: any) {
    console.error('Erro ao criar quiz:', err.message || err);
    res
      .status(500)
      .json({ error: 'Erro ao criar quiz.', details: err.message || err });
  }
});

router.get('/quiz/:quizId/responses', async (req, res) => {
  const quizId = req.params.quizId;
  try {
    const responses = await buscarQuizPorId(quizId);
    if (!responses) return res.status(404).send('Quiz não encontrado');
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar dados do formulário.');
  }
});

export default router;
