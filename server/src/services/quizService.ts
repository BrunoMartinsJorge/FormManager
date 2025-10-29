import { google } from 'googleapis';
import { getAuthClient, oAuth2Client } from './googleAuth';
import { AppDataSource } from '../database/data-source';
import { Formulario } from '../models/Formulario';
import { Pergunta } from '../models/Pergunta';
import { Tipo_Pergunta } from '../models/Tipo_Pergunta';
import { NewQuiz } from '../forms/NewForm';
import { Quiz } from '../models/Quiz';
import { Questao } from '../models/Questao';
import {
  ListaQuizDto,
  Questoes_Quiz,
  Respostas_Quiz,
} from '../models/dto/ListaQuizDto';
import { ListaQuestoesDto } from '../models/dto/ListaQuestoesDto';
import { NewQuestQuizSaved } from '../forms/NewQuestQuizSaved';
import { Alternativa_Questao } from '../models/Alternativa_Questao';

export async function createQuiz(quizForm: NewQuiz, userEmail: string | null) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: 'v1', auth });

  const createRes = await formsApi.forms.create({
    requestBody: {
      info: { title: quizForm.titulo },
    },
  });

  const formId = createRes.data.formId;
  if (!formId) throw new Error('formId inválido');

  const requests: any[] = (quizForm.questoes || []).map(
    (questao: any, index: number) => {
      const item: any = {
        title: questao.titulo,
        questionItem: { question: {} },
      };
      switch (questao.tipo) {
        case 'TEXTO':
          item.questionItem.question = { textQuestion: { paragraph: false } };
          break;
        case 'PARAGRAFO':
          item.questionItem.question = { textQuestion: { paragraph: true } };
          break;
        case 'NUMERO':
          item.questionItem.question = { textQuestion: {} };
          break;
        case 'UNICA':
          item.questionItem.question = {
            choiceQuestion: {
              type: 'RADIO',
              options: (questao.opcoes || []).map((v: string) => ({
                value: v,
              })),
            },
          };
          break;
        case 'MULTIPLA':
          item.questionItem.question = {
            choiceQuestion: {
              type: 'CHECKBOX',
              options: (questao.opcoes || []).map((v: string) => ({
                value: v,
              })),
            },
          };
          break;
        case 'DATA':
          item.questionItem.question = { dateQuestion: {} };
          break;
        case 'DATAHORA':
          item.questionItem.question = { dateTimeQuestion: {} };
          break;
        case 'ESCALA':
          item.questionItem.question = {
            scaleQuestion: { low: questao.low || 1, high: questao.high || 5 },
          };
          break;
        case 'VERDADEIRO_FALSO':
          item.questionItem.question = {
            choiceQuestion: {
              type: 'RADIO',
              options: [{ value: 'Verdadeiro' }, { value: 'Falso' }],
            },
          };
          break;
        case 'UPLOAD':
          item.questionItem.question = {
            fileUploadQuestion: {
              maxFiles: questao.maxFiles || 1,
              maxFileSize: questao.maxFileSize || 10,
            },
          };
          break;
      }
      return { createItem: { item, location: { index } } };
    }
  );

  requests.push({
    updateSettings: {
      settings: { quizSettings: { isQuiz: true } },
      updateMask: 'quizSettings',
    },
  });

  requests.push({
    updateFormInfo: {
      info: { description: quizForm.descricao || '' },
      updateMask: 'description',
    },
  } as any);

  await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

  return await AppDataSource.transaction(async (manager) => {
    const quizRepo = manager.getRepository(Quiz);
    const tipoRepo = manager.getRepository(Tipo_Pergunta);
    const questaoRepo = manager.getRepository(Questao);
    const altRepo = manager.getRepository(Alternativa_Questao);

    if (!createRes || !createRes.data.responderUri)
      throw new Error('Erro ao criar formulário');

    const form = quizRepo.create({
      Titulo: quizForm.titulo,
      Descricao: quizForm.descricao,
      Link_Url: createRes.data.responderUri,
      quizId: formId,
      email: userEmail ?? 'sem_email',
    });
    await quizRepo.save(form);

    for (const q of quizForm.questoes) {
      let tipo = await tipoRepo.findOne({ where: { Descricao: q.tipo } });
      if (!tipo) {
        tipo = tipoRepo.create({ Descricao: q.tipo });
        await tipoRepo.save(tipo);
      }

      const questao = questaoRepo.create({
        Tipo_Pergunta: tipo,
        Quiz: form,
        Titulo: q.titulo,
      });
      await questaoRepo.save(questao);

      if (q.opcoes?.length) {
        for (const opcao of q.opcoes) {
          const alt = altRepo.create({ Questao: questao, Texto: opcao });
          await altRepo.save(alt);
        }
      }
    }

    return createRes.data.responderUri;
  });
}

export async function apagarFormulario(idFormulario: number) {
  const repo = AppDataSource.getRepository(Formulario);
  await repo.delete(idFormulario);
}

export async function listAllQuizzes(email: string | null) {
  if (!email) return [];
  const repo = AppDataSource.getRepository(Quiz);
  return await repo.find({
    where: { email: email },
    relations: ['Perguntas', 'Perguntas.Alternativas'],
  });
}

export async function listarQuestoesPorFormulario(idForm: number) {
  const repo = AppDataSource.getRepository(Pergunta);
  return await repo.find({
    where: { Formulario: { idFormulario: idForm } },
    relations: ['Alternativas'],
  });
}

export async function buscarQuizPorId(quizId: string) {
  const forms = google.forms({ version: 'v1', auth: oAuth2Client });
  const formRes = await forms.forms.get({ formId: quizId });
  const respostasRes = await forms.forms.responses.list({ formId: quizId });
  if (!formRes) return null;
  return convertQuizData(formRes.data.items, respostasRes.data.responses);
}

export async function salvarQuestao(form: NewQuestQuizSaved) {
  const repo = AppDataSource.getRepository(Questao);
  const repoAlt = AppDataSource.getRepository(Alternativa_Questao);
  const repoTipo = AppDataSource.getRepository(Tipo_Pergunta);

  const tipo = await repoTipo.findOneBy({ Descricao: form.tipo });
  if (!tipo) throw new Error(`Tipo de pergunta '${form.tipo}' não encontrado`);

  const alternativas = form.opcoes
    ? form.opcoes.map((texto) => {
        const alt = new Alternativa_Questao();
        alt.Texto = texto;
        return alt;
      })
    : [];

  const questao = repo.create({
    Titulo: form.titulo,
    Tipo_Pergunta: tipo,
    Favorita: form.favorita ?? false,
    Pontuacao: form.pontos ?? 0,
    FeedbackCorreto: form.feedbackCorreto ?? '',
    FeedbackErrado: form.feedbackErrado ?? '',
    Alternativas: alternativas,
    AlternativasCorretas: [],
  });

  const savedQuestao = await repo.save(questao);

  for (const alt of alternativas) {
    alt.Questao = savedQuestao;
    await repoAlt.save(alt);
  }

  if (form.respostasCorretas?.length) {
    const alternativasSalvas = await repoAlt.findBy({
      Questao: { idPergunta: savedQuestao.idPergunta },
    });

    const corretas = form.respostasCorretas
      .map((i) => alternativasSalvas[i])
      .filter(Boolean);

    savedQuestao.AlternativasCorretas = corretas;
    await repo.save(savedQuestao);
  }

  return savedQuestao;
}

export async function listarTodasQuestoesFavoritas(): Promise<
  any[]
> {
  let response: ListaQuestoesDto[] = [];
  const questoesRepo = AppDataSource.getRepository(Questao);
  const questoes = await questoesRepo.find({
    where: { Favorita: true },
    relations: ['Alternativas', 'Tipo_Pergunta', 'AlternativasCorretas'],
  });

  if (!questoes) return response;
  
  response = questoes.map((q: Questao) => ListaQuestoesDto.convert(q));
  return response;
}

function convertQuizData(questoesQuiz: any, respostasQuiz: any): ListaQuizDto {
  const questoes = questoesQuiz || [];
  const responses = respostasQuiz || [];

  const questoesFormatadas: Questoes_Quiz[] = questoes.map((q: any) => {
    const question = q.questionItem?.question;
    let tipo = 'DESCONHECIDO';
    let opcoes: string[] | undefined;

    if (question.textQuestion) tipo = 'Texto';
    if (question.choiceQuestion) {
      tipo = 'Escolha';
      opcoes = question.choiceQuestion.options.map((o: any) => o.value);
    }
    if (question.scaleQuestion) tipo = 'Escala';
    if (question.dateQuestion) tipo = 'Data';

    const grading = question.grading || {};
    const valor = grading.pointValue || 0;
    const opcaoCorreta = grading.correctAnswers?.answers?.[0]?.value || null;

    return {
      id: question.questionId,
      titulo: q.title,
      tipo,
      opcoes,
      opcaoCorreta,
      valor,
    };
  });

  const respostasFormatadas: Respostas_Quiz[] = responses.map((resp: any) => {
    const respostasQuestao: any[] = [];

    Object.values(resp.answers).forEach((answer: any) => {
      const valor = answer.textAnswers?.answers?.[0]?.value ?? null;
      respostasQuestao.push({
        idQuestao: answer.questionId,
        valor,
        score: answer.grade?.score ?? 0,
        correta: answer.grade?.correct ?? false,
      });
    });

    return {
      idResposta: resp.responseId,
      dataEnviada: new Date(resp.lastSubmittedTime),
      respostas: respostasQuestao,
      totalScore: resp.totalScore ?? 0,
    };
  });

  return { questoes: questoesFormatadas, respostas: respostasFormatadas };
}
