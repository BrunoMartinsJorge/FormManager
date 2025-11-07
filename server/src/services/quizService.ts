import { google } from 'googleapis';
import { getAuthClient, oAuth2Client } from './googleAuth';
import { AppDataSource } from '../database/data-source';
import { Formulario } from '../models/Formulario';
import { NewQuiz } from '../forms/NewForm';
import { Quiz } from '../models/Quiz';
import { Questao } from '../models/Questao';
import { ListaQuestoesDto } from '../models/dto/ListaQuestoesDto';
import { NewQuestQuizSaved } from '../forms/NewQuestQuizSaved';
import { Alternativa_Questao } from '../models/Alternativa_Questao';
import { Tipo_Questao } from '../models/Tipo_Questao';
import { QuizDto } from '../models/dto/QuizDto';
import {
  QuestaoUnica,
  QuestoesFormatadas,
  Resposta_Questao,
  RespostasFormDto,
  RespostaUnica,
} from '../models/dto/RespostasFormDto';
import { TypeQuestEnum } from '../enums/TypeQuestEnum';

export async function createQuiz(quizForm: NewQuiz, userEmail: string | null) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: 'v1', auth });

  const createRes = await formsApi.forms.create({
    requestBody: { info: { title: quizForm.titulo } },
  });

  const formId = createRes.data.formId;
  if (!formId) throw new Error('formId inválido');

  await formsApi.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [
        {
          updateSettings: {
            settings: { quizSettings: { isQuiz: true } },
            updateMask: 'quizSettings',
          },
        },
      ],
    },
  });

  const tiposComCorrecao = ['UNICA', 'MULTIPLA'];

  let requests: any[] = [];

  (quizForm.questoes || []).forEach((questao: any, index: number) => {
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
      case 'PONTUACAO':
        item.questionItem.question = {
          ratingQuestion: {
            ratingScaleLevel: questao.pontuacao,
            iconType: questao.iconPontuacao ?? 'STAR',
          },
        };
        break;
      case 'IMAGEM':
        requests.push({
          createItem: {
            item: {
              title: questao.descricaoImagem || '',
              imageItem: {
                image: {
                  sourceUri: questao.imagemUrl,
                },
              },
            },
            location: { index: requests.length },
          },
        });
        return;
      case 'ESCALA':
        item.questionItem.question = {
          scaleQuestion: {
            low: questao.low || 1,
            high: questao.high || 5,
          },
        };
        break;
      case 'UNICA':
        item.questionItem.question = {
          choiceQuestion: {
            type: 'RADIO',
            options: (questao.opcoes || []).map((v: any) => ({
              value: v.texto || v,
            })),
            shuffle: false,
          },
        };
        break;
      case 'MULTIPLA':
        item.questionItem.question = {
          choiceQuestion: {
            type: 'CHECKBOX',
            options: (questao.opcoes || []).map((v: any) => ({
              value: v.texto || v,
            })),
            shuffle: false,
          },
        };
        break;
      case 'DATA':
        item.questionItem.question = { dateQuestion: {} };
        item.questionItem.question.dateQuestion.includeTime =
          questao.tempo || false;
        item.questionItem.question.dateQuestion.includeYear =
          questao.anos || false;
        break;
      case 'TEMPO':
        item.questionItem.question = {
          timeQuestion: {
            duration: true,
          },
        };
        break;
    }

    item.questionItem.question.required = questao.obrigatorio || false;

    if (
      tiposComCorrecao.includes(questao.tipo) &&
      ((Array.isArray(questao.respostasCorretas) &&
        questao.respostasCorretas.length > 0) ||
        questao.valorCorreto !== undefined)
    ) {
      let corretas: (number | string)[] = [];
      corretas =
        Array.isArray(questao.respostasCorretas) &&
        questao.respostasCorretas.length > 0
          ? questao.respostasCorretas
          : Array.isArray(questao.valorCorreto)
          ? questao.valorCorreto
          : [questao.valorCorreto];

      item.questionItem.question.grading = {
        pointValue: questao.pontuacao || 1,
        correctAnswers: {
          answers: corretas.map((i: number | string) => ({
            value:
              typeof i === 'number'
                ? questao.opcoes?.[i]?.texto || questao.opcoes?.[i] || String(i)
                : i,
          })),
        },
        whenRight: { text: questao.feedbackCorreto || 'Correto!' },
        whenWrong: {
          text:
            questao.feedbackErrado ||
            'Resposta incorreta.',
        },
      };
    }

    requests.push({
      createItem: {
        item,
        location: { index: requests.length },
      },
    });

    return { createItem: { item, location: { index } } };
  });

  requests.push({
    updateFormInfo: {
      info: { description: quizForm.descricao || '' },
      updateMask: 'description',
    },
  });

  await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

  await formsApi.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [
        {
          updateSettings: {
            settings: { emailCollectionType: 'VERIFIED' },
            updateMask: 'emailCollectionType',
          },
        },
      ],
    },
  });

  return await AppDataSource.transaction(async (manager) => {
    const quizRepo = manager.getRepository(Quiz);
    const tipoRepo = manager.getRepository(Tipo_Questao);
    const questaoRepo = manager.getRepository(Questao);
    const altRepo = manager.getRepository(Alternativa_Questao);

    if (!createRes?.data?.responderUri)
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
        Tipo_Questao: tipo,
        Quiz: form,
        Titulo: q.titulo,
      });
      const questaoSaved = await questaoRepo.save(questao);

      if (q.opcoes?.length) {
        for (const opcao of q.opcoes) {
          const alt = altRepo.create({
            Questao: questaoSaved,
            Texto: opcao.texto || '',
          });
          await altRepo.save(alt);
        }
      }
    }

    return createRes.data.responderUri;
  });
}

export async function apagarQuestao(idQuestao: number) {
  const repo = AppDataSource.getRepository(Questao);
  await repo.delete(idQuestao);
}

export async function listAllQuizzes(email: string | null): Promise<QuizDto[]> {
  if (!email) return [];
  const repo = AppDataSource.getRepository(Quiz);
  const quizzes: Quiz[] = await repo.find({
    where: { email: email },
    relations: ['Questoes', 'Questoes.Alternativas'],
  });
  if (!quizzes) return [];
  return quizzes.map((quiz) => QuizDto.convert(quiz));
}

export async function buscarQuizPorId(quizId: string) {
  const forms = google.forms({ version: 'v1', auth: oAuth2Client });
  const formRes = await forms.forms.get({ formId: quizId });
  const respostasRes = await forms.forms.responses.list({ formId: quizId });
  const ativo = !!formRes.data.responderUri;
  if (!formRes) return null;
  return convertQuestionData(ativo, {
    items: formRes.data.items || [],
    responses: respostasRes.data.responses || [],
  });
}

export async function salvarQuestao(form: NewQuestQuizSaved) {
  const repo = AppDataSource.getRepository(Questao);
  const repoAlt = AppDataSource.getRepository(Alternativa_Questao);

  let tipo = await AppDataSource.getRepository(Tipo_Questao).findOneBy({
    Descricao: form.tipo,
  });
  if (!tipo) {
    const tiposSalvos = Object.values(TypeQuestEnum);
    if (tiposSalvos.includes(form.tipo as TypeQuestEnum)) {
      const newTipo = new Tipo_Questao();
      newTipo.Descricao = form.tipo;
      await AppDataSource.getRepository(Tipo_Questao).save(newTipo);
      tipo = newTipo;
    }
  }
  if (!tipo) {
    throw new Error('Tipo de pergunta inválido!');
  }

  let alternativas: Alternativa_Questao[] = [];

  if (form.opcoes && form.opcoes.length > 0) {
    alternativas = form.opcoes.map((opt) => {
      const alt = new Alternativa_Questao();
      alt.Texto = opt;
      return alt;
    });
  }

  const questao = repo.create({
    Titulo: form.titulo,
    Tipo_Questao: tipo,
    Favorita: true,
    Pontuacao: form.pontuacao ?? 0,
    FeedbackCorreto: form.feedbackCorreto ?? '',
    FeedbackErrado: form.feedbackErrado ?? '',
    AlternativasCorretas: [],
    Quiz: null,
    anos: form.anos ?? false,
    tempo: form.tempo ?? false,
    DescricaoImagem: form.descricaoImagem ?? '',
    UrlImagem: form.imagemUrl ?? '',
    low: form.low ?? 0,
    high: form.high ?? 0,
    endLabel: form.endLabel ?? '',
    startLabel: form.startLabel ?? '',
    nivelPontuacao: form.nivelPontuacao ?? 0,
    iconPontuacao: form.iconPontuacao ?? '',
    obrigatorio: form.obrigatorio ?? false,
  });

  const savedQuestao = await repo.save(questao);

  for (const alt of alternativas) {
    alt.Questao = savedQuestao;
    await repoAlt.save(alt);
  }

  if (form.respostasCorretas?.length) {
    const alternativasSalvas = await repoAlt.findBy({
      Questao: { idQuestao: savedQuestao.idQuestao },
    });

    const corretas = alternativasSalvas.filter((alt) =>
      form.respostasCorretas?.some(
        (c) =>
          (c && c === alt.Texto) ||
          c?.trim().toLowerCase() === alt.Texto.trim().toLowerCase()
      )
    );

    savedQuestao.AlternativasCorretas = corretas;
    await repo.save(savedQuestao);
  }

  return savedQuestao;
}

export async function editarQuestaoSalva(dados: ListaQuestoesDto) {
  const repoPergunta = AppDataSource.getRepository(Questao);
  const repoTipo = AppDataSource.getRepository(Tipo_Questao);
  const repoAlt = AppDataSource.getRepository(Alternativa_Questao);

  const questao = await repoPergunta.findOne({
    where: { idQuestao: dados.id },
    relations: ['Alternativas', 'Tipo_Questao'],
  });

  if (!questao) throw new Error('Questão não encontrada!');

  const tipo = await repoTipo.findOneBy({
    Descricao: dados.tipo,
  });

  questao.Titulo = dados.titulo;
  questao.Tipo_Questao = tipo ?? questao.Tipo_Questao;
  questao.Favorita = true;
  questao.DescricaoImagem = dados.descricaoImagem;
  questao.UrlImagem = dados.urlImagem;
  questao.Pontuacao = dados.pontuacao ?? 0;
  questao.FeedbackCorreto = dados.feedbackCorreto ?? '';
  questao.FeedbackErrado = dados.feedbackErrado ?? '';
  questao.AlternativasCorretas = [];
  questao.Alternativas = [];
  questao.anos = dados.anos ?? false;
  questao.tempo = dados.tempo ?? false;
  questao.low = dados.low ?? 0;
  questao.endLabel = dados.endLabel ?? '';
  questao.high = dados.high ?? 0;
  questao.iconPontuacao = dados.iconPontuacao ?? '';
  questao.nivelPontuacao = dados.nivelPontuacao ?? 0;
  questao.startLabel = dados.startLabel ?? '';
  questao.obrigatorio = dados.obrigatorio ?? false;

  if (dados.opcoes && dados.opcoes.length > 0) {
    questao.Alternativas = await Promise.all(
      dados.opcoes.map(async (opt) => {
        const alt = new Alternativa_Questao();
        alt.Questao = questao;
        alt.Texto = opt;
        await repoAlt.save(alt);
        return alt;
      })
    );
  }

  const savedQuest = await repoPergunta.save(questao);

  for (const alt of questao.Alternativas) {
    alt.Questao = savedQuest;
    await repoAlt.save(alt);
  }

  if (dados.respostasCorretas?.length) {
    const alternativasSalvas = await repoAlt.findBy({
      Questao: { idQuestao: savedQuest.idQuestao },
    });

    const corretas = alternativasSalvas.filter((alt) =>
      dados.respostasCorretas?.some(
        (c) =>
          (c && c === alt.Texto) ||
          c?.trim().toLowerCase() === alt.Texto.trim().toLowerCase()
      )
    );

    savedQuest.AlternativasCorretas = corretas;
    await repoPergunta.save(savedQuest);
  }

  return ListaQuestoesDto.convert(questao);
}

export async function listarTodasQuestoesFavoritas() {
  let response: ListaQuestoesDto[] = [];
  const questoesRepo = AppDataSource.getRepository(Questao);
  const questoes = await questoesRepo.find({
    where: { Favorita: true },
    relations: ['Alternativas', 'Tipo_Questao', 'AlternativasCorretas'],
  });

  if (!questoes) return response;
  console.log(questoes);

  response = questoes.map((q: Questao) => ListaQuestoesDto.convert(q));
  return response;
}

function convertQuestionData(ativo: boolean, data: any): RespostasFormDto {
  const questoes = data.items || [];
  const responses = data.responses || [];

  const questoesFormatadas: QuestaoUnica[] = questoes
    .filter((q: any) => q.questionItem?.question)
    .map((quest: any) => {
      const question = quest.questionItem.question;
      let tipo = 'DESCONHECIDO';
      let opcoes: string[] | undefined;

      if (question.textQuestion) tipo = 'Texto';
      if (question.choiceQuestion) {
        tipo = 'Escolha';
        opcoes =
          question.choiceQuestion.options?.map((o: any) => o.value) || [];
      }
      if (question.scaleQuestion) tipo = 'Escala';
      if (question.dateQuestion) tipo = 'Data';

      return {
        id: question.questionId,
        titulo: quest.title,
        tipo,
        opcoes,
      };
    });

  // --- RESPOSTAS ---
  const respostasFormatadas: RespostaUnica[] = responses.map((resp: any) => {
    const respostasQuestao: Resposta_Questao[] = [];

    Object.values(resp.answers || {}).forEach((answer: any) => {
      const idQuestao = answer.questionId;

      const textAnswers = answer.textAnswers?.answers || [];
      const choiceAnswers = answer.choiceAnswers?.answers || [];

      [...textAnswers, ...choiceAnswers].forEach((a: any) => {
        respostasQuestao.push({
          idQuestao,
          valor: a.value ?? null,
        });
      });
    });

    return {
      idResposta: resp.responseId,
      dataEnviada: new Date(resp.lastSubmittedTime),
      usuarioEmail: resp.respondentEmail ?? null,
      respostas: respostasQuestao,
    };
  });

  const questoesFormatadasResponse: QuestoesFormatadas = {
    questoes: questoesFormatadas,
    respostas: respostasFormatadas,
  };

  const resposta: RespostasFormDto = {
    ativo,
    questoesFormatadas: questoesFormatadasResponse,
    respostasPorUsuario: mapearRespostasPorRespondente(data),
  };

  return resposta;
}

function mapearRespostasPorRespondente(data: any): any[] {
  const questoes = data.items || [];
  const responses = data.responses || [];

  return responses.map((resp: any) => {
    const respostasUsuario: any[] = [];

    Object.values(resp.answers || {}).forEach((answer: any) => {
      const idQuestao = answer.questionId;

      const questao = questoes.find(
        (q: any) => q.questionItem?.question?.questionId === idQuestao
      );

      if (!questao) return;

      const titulo = questao.title;
      const textAnswers = answer.textAnswers?.answers || [];
      const choiceAnswers = answer.choiceAnswers?.answers || [];

      [...textAnswers, ...choiceAnswers].forEach((a: any) => {
        respostasUsuario.push({
          idQuestao,
          titulo,
          valor: a.value ?? null,
        });
      });
    });

    return {
      idResposta: resp.responseId,
      usuarioEmail: resp.respondentEmail ?? null,
      dataEnviada: new Date(resp.lastSubmittedTime),
      respostas: respostasUsuario,
    };
  });
}
