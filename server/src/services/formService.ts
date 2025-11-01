import { google } from 'googleapis';
import { getAuthClient, oAuth2Client } from './googleAuth';
import { AppDataSource } from '../database/data-source';
import { Formulario } from '../models/Formulario';
import { Pergunta } from '../models/Pergunta';
import { Tipo_Pergunta } from '../models/Tipo_Pergunta';
import { NewQuestFormSaved } from '../forms/NewQuestFormSaved';
import { ListaPerguntasDto } from '../models/dto/ListaPerguntasDto';
import { EditQuest } from '../forms/EditQuestao';
import { Alternativa_Pergunta } from '../models/Alternativa_Pergunta';
import {
  QuestaoUnica,
  QuestoesFormatadas,
  Resposta_Questao,
  RespostasFormDto,
  RespostaUnica,
} from '../models/dto/RespostasFormDto';
import { FormulariosListaDto } from '../models/dto/FormulariosListaDto';

export async function salvarFormularioCompleto(
  dadosForm: any,
  userEmail: string | null
) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: 'v1', auth });

  const createRes = await formsApi.forms.create({
    requestBody: {
      info: { title: dadosForm.titulo },
    },
  });
  const formId = createRes.data.formId;

  let requests: any[] = [];

  (dadosForm.questoes || []).forEach((questao: any, index: number) => {
    // 1️⃣ Se tiver imagem, adiciona item de imagem antes
    if (questao.imagemUrl) {
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
    }

    // 2️⃣ Depois adiciona a pergunta
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
            options: (questao.opcoes || []).map((v: string) => ({ value: v })),
          },
        };
        break;
      case 'MULTIPLA':
        item.questionItem.question = {
          choiceQuestion: {
            type: 'CHECKBOX',
            options: (questao.opcoes || []).map((v: string) => ({ value: v })),
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

    requests.push({
      createItem: {
        item,
        location: { index: requests.length },
      },
    });
  });

  requests.push({
    updateFormInfo: {
      info: { description: dadosForm.descricao || '' },
      updateMask: 'description',
    },
  });

  requests.push({
    updateSettings: {
      settings: { emailCollectionType: 'VERIFIED' },
      updateMask: 'emailCollectionType',
    },
  });

  if (!formId) throw new Error('formId inválido');

  await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

  return await AppDataSource.transaction(async (manager) => {
    const formRepo = manager.getRepository(Formulario);
    const tipoRepo = manager.getRepository(Tipo_Pergunta);
    const perguntaRepo = manager.getRepository(Pergunta);
    const altRepo = manager.getRepository(Alternativa_Pergunta);

    if (!createRes) throw new Error('Erro ao criar formulário');

    const form = formRepo.create({
      Titulo: dadosForm.titulo,
      Descricao: dadosForm.descricao,
      Link_Url: createRes.data.responderUri ?? '',
      formId: formId ?? '',
      email: userEmail ?? 'sem_email',
      publicado: dadosForm.false,
    });
    await formRepo.save(form);

    for (const q of dadosForm.questoes) {
      let tipo = await tipoRepo.findOne({ where: { Descricao: q.tipo } });
      if (!tipo) {
        tipo = tipoRepo.create({ Descricao: q.tipo });
        await tipoRepo.save(tipo);
      }

      const pergunta = perguntaRepo.create({
        Tipo_Pergunta: tipo,
        Formulario: form,
        Titulo: q.titulo,
        Favorita: q.favorito,
      });
      await perguntaRepo.save(pergunta);

      if (q.opcoes?.length) {
        for (const opcao of q.opcoes) {
          const alt = altRepo.create({ Pergunta: pergunta, Texto: opcao });
          await altRepo.save(alt);
        }
      }
    }

    return createRes.data.responderUri;
  });
}

export async function editarPerguntaSalva(dados: EditQuest) {
  const repoPergunta = AppDataSource.getRepository(Pergunta);
  const repoTipo = AppDataSource.getRepository(Tipo_Pergunta);
  const repoAlt = AppDataSource.getRepository(Alternativa_Pergunta);

  const questao = await repoPergunta.findOne({
    where: { idPergunta: dados.idPergunta },
    relations: ['Alternativas', 'Tipo_Pergunta'],
  });

  if (!questao) throw new Error('Questão não encontrada!');

  const tipo = await repoTipo.findOneBy({
    Descricao: questao.Tipo_Pergunta.Descricao,
  });

  questao.Titulo = dados.titulo;
  questao.Tipo_Pergunta = tipo ?? questao.Tipo_Pergunta;
  questao.Favorita = true;

  if (dados.opcoes && dados.opcoes.length > 0) {
    questao.Alternativas = await Promise.all(
      dados.opcoes.map(async (opt) => {
        const alt = new Alternativa_Pergunta();
        alt.Pergunta = questao;
        alt.Texto = opt;
        await repoAlt.save(alt);
        return alt;
      })
    );
  }

  await repoPergunta.save(questao);

  questao.Alternativas?.forEach((a) => {
    if ('Pergunta' in a) {
      delete (a as any).Pergunta;
    }
  });

  return questao;
}

export async function apagarFormulario(idFormulario: number) {
  const repo = AppDataSource.getRepository(Formulario);
  await repo.delete(idFormulario);
}

export async function listarFormularios(userEmail: string | null) {
  if (!userEmail) return [];
  const repo = AppDataSource.getRepository(Formulario);
  const forms = await repo.find({
    where: { email: userEmail },
  });
  if (!forms) return [];
  return forms.map((form) => FormulariosListaDto.convert(form));
}

export async function listarQuestoesPorFormulario(idForm: number) {
  const repo = AppDataSource.getRepository(Pergunta);
  return await repo.find({
    where: { Formulario: { idFormulario: idForm } },
    relations: ['Alternativas'],
  });
}

export async function buscarFormularioPorId(idFormulario: number) {
  const repo = AppDataSource.getRepository(Formulario);
  return await repo.findOne({
    where: { idFormulario },
    relations: ['Perguntas', 'Perguntas.Alternativas'],
  });
}

export async function salvarPergunta(form: NewQuestFormSaved) {
  const repo = AppDataSource.getRepository(Pergunta);
  const tipo = await AppDataSource.getRepository(Tipo_Pergunta).findOneBy({
    Descricao: form.tipo,
  });
  const repoAlt = AppDataSource.getRepository(Alternativa_Pergunta);

  let alternativas: Alternativa_Pergunta[] = [];

  if (form.opcoes && form.opcoes.length > 0) {
    alternativas = form.opcoes.map((opt) => {
      const alt = new Alternativa_Pergunta();
      alt.Texto = opt;
      return alt;
    });
  }

  const pergunta = repo.create({
    Titulo: form.titulo,
    Formulario: null,
    Alternativas: alternativas,
    Tipo_Pergunta: tipo!,
    Favorita: true,
  });

  const saved = await repo.save(pergunta);

  saved.Alternativas.forEach((alt) => {
    alt.Pergunta = saved;
    repoAlt.save(alt);
  });

  return saved;
}

export async function apagarPergunta(idPergunta: number) {
  const repo = AppDataSource.getRepository(Pergunta);
  await repo.delete(idPergunta);
}

export async function buscarRespostasDoFormularioPorId(
  idForm: string
): Promise<RespostasFormDto> {
  const form = google.forms({ version: 'v1', auth: oAuth2Client });

  const formRes = await form.forms.get({ formId: idForm });
  const respostasRes = await form.forms.responses.list({ formId: idForm });

  const ativo = !!formRes.data.responderUri;

  return convertQuestionData(ativo, {
    items: formRes.data.items || [],
    responses: respostasRes.data.responses || [],
  });
}

function convertQuestionData(ativo: boolean, data: any): RespostasFormDto {
  const questoes: any[] = data.items || [];
  const responses = data.responses || [];

  const questoesFormatadas: QuestaoUnica[] = questoes
    .filter((quest) => quest.questionItem && quest.questionItem.question)
    .map((quest) => {
      const q = quest.questionItem.question;
      let tipo = 'DESCONHECIDO';
      let opcoes: string[] | undefined;

      if (q.textQuestion) tipo = 'Texto';
      if (q.choiceQuestion) {
        tipo = 'Escolha';
        opcoes = q.choiceQuestion.options.map((o: any) => o.value);
      }
      if (q.scaleQuestion) tipo = 'Escala';
      if (q.dateQuestion) tipo = 'Data';

      return {
        id: q.questionId,
        titulo: quest.title,
        tipo,
        opcoes,
      };
    });

  const respostasFormatadas: RespostaUnica[] = responses.map((resp: any) => {
    const respostasQuestao: Resposta_Questao[] = [];

    // Extrair respostas das questões
    Object.values(resp.answers || {}).forEach((answer: any) => {
      if (answer.textAnswers) {
        answer.textAnswers.answers.forEach((a: any) => {
          respostasQuestao.push({
            idQuestao: answer.questionId,
            valor: a.value,
          });
        });
      }

      if (answer.choiceAnswers) {
        answer.choiceAnswers.answers.forEach((a: any) => {
          respostasQuestao.push({
            idQuestao: answer.questionId,
            valor: a.value,
          });
        });
      }
    });

    return {
      idResposta: resp.responseId,
      dataEnviada: new Date(resp.lastSubmittedTime),
      usuarioEmail: resp.respondentEmail, // <-- Aqui pegamos o email do respondente
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

    Object.values(resp.answers).forEach((answer: any) => {
      const questao = questoes.find(
        (q: any) => q.questionItem?.question?.questionId === answer.questionId
      );

      if (!questao) return;

      const titulo = questao.title;
      const idQuestao = answer.questionId;

      if (answer.textAnswers) {
        answer.textAnswers.answers.forEach((a: any) => {
          respostasUsuario.push({
            idQuestao,
            titulo,
            valor: a.value,
          });
        });
      }

      if (answer.choiceAnswers) {
        answer.choiceAnswers.answers.forEach((a: any) => {
          respostasUsuario.push({
            idQuestao,
            titulo,
            valor: a.value,
          });
        });
      }
    });

    return {
      idResposta: resp.responseId,
      dataEnviada: resp.lastSubmittedTime,
      respostas: respostasUsuario,
    };
  });
}

export async function buscarQuestoesSalvas(email: string | null) {
  if (!email) return [];
  const repo = AppDataSource.getRepository(Pergunta);
  const questoes = await repo.find({
    where: { Favorita: true },
    relations: ['Alternativas', 'Tipo_Pergunta'],
  });
  return questoes.map((pergunta) => ListaPerguntasDto.convert(pergunta));
}
