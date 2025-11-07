import { google } from 'googleapis';
import { getAuthClient, oAuth2Client } from './googleAuth';
import { AppDataSource } from '../database/data-source';
import { Formulario } from '../models/Formulario';
import { Pergunta } from '../models/Pergunta';
import { Tipo_Pergunta } from '../models/Tipo_Pergunta';
import { NewQuestFormSaved } from '../forms/NewQuestFormSaved';
import { ListaPerguntasDto } from '../models/dto/ListaPerguntasDto';
import { Alternativa_Pergunta } from '../models/Alternativa_Pergunta';
import {
  QuestaoUnica,
  QuestoesFormatadas,
  Resposta_Questao,
  RespostasFormDto,
  RespostaUnica,
} from '../models/dto/RespostasFormDto';
import { FormulariosListaDto } from '../models/dto/FormulariosListaDto';
import { getTypeQuestLabel, TypeQuestEnum } from '../enums/TypeQuestEnum';
import { FormularioForm, NovaPergunta } from '../forms/FormularioForm';

export async function salvarFormularioCompleto(
  dadosForm: FormularioForm,
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

  (dadosForm.questoes || []).forEach((questao: NovaPergunta, index: number) => {
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
      case 'PONTUACAO':
        item.questionItem.question = {
          ratingQuestion: {
            ratingScaleLevel: questao.nivelPontuacao,
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
        item.questionItem.question.dateQuestion.includeTime =
          questao.tempo || false;
        item.questionItem.question.dateQuestion.includeYear =
          questao.anos || false;
        break;
      case 'ESCALA':
        item.questionItem.question = {
          scaleQuestion: {
            lowLabel: questao.startLabel || '',
            low: questao.low || 1,
            highLabel: questao.endLabel || '',
            high: questao.high || 5,
          },
        };
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
      publicado: createRes.data.responderUri ? true : false,
    });
    await formRepo.save(form);

    for (const q of dadosForm.questoes) {
      let tipo = await tipoRepo.findOne({ where: { Descricao: q.tipo } });
      if (!tipo) {
        tipo = tipoRepo.create({ Descricao: q.tipo });
        await tipoRepo.save(tipo);
      }

      if (!q.idPergunta) {
        const pergunta = perguntaRepo.create({
          Tipo_Pergunta: tipo,
          Formulario: form,
          Titulo: q.titulo,
          Favorita: false,
          anos: q.anos ?? false,
          tempo: q.tempo ?? false,
          DescricaoImagem: q.descricaoImagem ?? '',
          UrlImagem: q.imagemUrl ?? '',
          obrigatorio: q.obrigatorio ?? false,
          low: q.low ?? 0,
          endLabel: q.endLabel ?? '',
          high: q.high ?? 0,
          iconPontuacao: q.iconPontuacao ?? '',
          nivelPontuacao: q.nivelPontuacao ?? 0,
          startLabel: q.startLabel ?? '',
        });

        await perguntaRepo.save(pergunta);

        if (q.opcoes?.length) {
          for (const opcao of q.opcoes) {
            const alt = altRepo.create({ Pergunta: pergunta, Texto: opcao });
            await altRepo.save(alt);
          }
        }
      }
    }

    return {
      url: createRes.data.responderUri ?? '',
      formId: form.formId,
    };
  });
}

export async function editarPerguntaSalva(dados: NewQuestFormSaved) {
  const repoPergunta = AppDataSource.getRepository(Pergunta);
  const repoTipo = AppDataSource.getRepository(Tipo_Pergunta);
  const repoAlt = AppDataSource.getRepository(Alternativa_Pergunta);

  const questao = await repoPergunta.findOne({
    where: { idPergunta: dados.idPergunta },
    relations: ['Alternativas', 'Tipo_Pergunta'],
  });

  if (!questao) throw new Error('Questão não encontrada!');

  const tipoNovo = await repoTipo.findOneBy({
    Descricao: dados.tipo,
  });

  questao.Titulo = dados.titulo;
  questao.Tipo_Pergunta = tipoNovo ?? questao.Tipo_Pergunta;
  questao.Favorita = true;
  questao.anos = dados.anos ?? false;
  questao.tempo = dados.tempo ?? false;
  questao.DescricaoImagem = dados.descricaoImagem ?? '';
  questao.UrlImagem = dados.imagemUrl ?? '';
  questao.obrigatorio = dados.obrigatorio ?? false;
  questao.low = dados.low ?? 0;
  questao.endLabel = dados.endLabel ?? '';
  questao.high = dados.high ?? 0;
  questao.iconPontuacao = dados.iconPontuacao ?? '';
  questao.nivelPontuacao = dados.nivelPontuacao ?? 0;
  questao.startLabel = dados.startLabel ?? '';
  questao.idPergunta = dados.idPergunta ?? 0;

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
  let tipo = await AppDataSource.getRepository(Tipo_Pergunta).findOneBy({
    Descricao: form.tipo,
  });
  if (!tipo) {
    const tiposSalvos = Object.values(TypeQuestEnum);
    if (tiposSalvos.includes(form.tipo as TypeQuestEnum)) {
      const newTipo = new Tipo_Pergunta();
      newTipo.Descricao = form.tipo;
      await AppDataSource.getRepository(Tipo_Pergunta).save(newTipo);
      tipo = newTipo;
    }
  }
  if (!tipo) {
    throw new Error('Tipo de pergunta inválido!');
  }
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
    .filter((quest) => quest.questionItem?.question)
    .map((quest) => {
      const q = quest.questionItem.question;
      let tipo: TypeQuestEnum = TypeQuestEnum.TEXTO;
      let opcoes: string[] | undefined;
      const escala = {
        low: q.scaleQuestion?.low,
        high: q.scaleQuestion?.high,
        endLabel: q.scaleQuestion?.endLabel,
        startLabel: q.scaleQuestion?.startLabel,
      };

      if (q.textQuestion) {
        tipo = q.textQuestion.paragraph
          ? TypeQuestEnum.PARAGRAFO
          : TypeQuestEnum.TEXTO;
      } else if (q.choiceQuestion) {
        const { type, options } = q.choiceQuestion;
        opcoes = options?.map((o: any) => o.value) || [];

        switch (type) {
          case 'RADIO':
            tipo = TypeQuestEnum.UNICA;
            break;
          case 'CHECKBOX':
            tipo = TypeQuestEnum.MULTIPLA;
            break;
          case 'DROP_DOWN':
            tipo = TypeQuestEnum.UNICA;
            break;
          default:
            tipo = TypeQuestEnum.UNICA;
        }
      } else if (q.scaleQuestion) {
        tipo = TypeQuestEnum.ESCALA;
      } else if (q.dateQuestion) {
        tipo = TypeQuestEnum.DATA;
      } else if (q.timeQuestion) {
        tipo = TypeQuestEnum.TEMPO;
      } else if (q.imageQuestion) {
        tipo = TypeQuestEnum.IMAGEM;
      } else if (q.pointQuestion) {
        tipo = TypeQuestEnum.PONTUACAO;
      } else {
        tipo = TypeQuestEnum.TEXTO;
      }

      return {
        id: q.questionId,
        titulo: quest.title || '',
        tipo,
        escala,
        opcoes,
      };
    });

  const respostasFormatadas: RespostaUnica[] = responses.map((resp: any) => {
    const respostasQuestao: Resposta_Questao[] = [];

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
      usuarioEmail: resp.respondentEmail,
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
  for (const pergunta of questoes) {
    if (!pergunta.Tipo_Pergunta && typeof pergunta.Tipo_Pergunta === 'string') {
      const tiposSalvos = Object.values(TypeQuestEnum);
      if (tiposSalvos.includes(pergunta.Tipo_Pergunta as TypeQuestEnum)) {
        const newTipo = new Tipo_Pergunta();
        newTipo.Descricao = pergunta.Tipo_Pergunta;
        await AppDataSource.getRepository(Tipo_Pergunta).save(newTipo);
        pergunta.Tipo_Pergunta = newTipo;
      }
    }
  }
  return questoes.map((pergunta) => ListaPerguntasDto.convert(pergunta));
}
