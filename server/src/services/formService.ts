import { google } from 'googleapis';
import { getAuthClient } from './googleAuth';
import { AppDataSource } from '../database/data-source';
import { Formulario } from '../models/Formulario';
import { Pergunta } from '../models/Pergunta';
import { Tipo_Pergunta } from '../models/Tipo_Pergunta';
import { Alternativa } from '../models/Alternativa';
import { NewQuestFormSaved } from '../forms/NewQuestFormSaved';
import { ListaPerguntasDto } from '../models/dto/ListaPerguntasDto';

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

  if (!formId) throw new Error('formId inválido');

  await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

  return await AppDataSource.transaction(async (manager) => {
    const formRepo = manager.getRepository(Formulario);
    const tipoRepo = manager.getRepository(Tipo_Pergunta);
    const perguntaRepo = manager.getRepository(Pergunta);
    const altRepo = manager.getRepository(Alternativa);

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
    console.log(form);

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

export async function apagarFormulario(idFormulario: number) {
  const repo = AppDataSource.getRepository(Formulario);
  await repo.delete(idFormulario);
}

export async function listarFormularios(userEmail: string | null) {
  if (!userEmail) return [];
  const repo = AppDataSource.getRepository(Formulario);
  return await repo.find({
    where: { email: userEmail },
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

  let alternativas: Alternativa[] = [];

  if (form.opcoes && form.opcoes.length > 0) {
    alternativas = form.opcoes.map((opt) => {
      const alt = new Alternativa();
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

  return await repo.save(pergunta);
}

export async function apagarPergunta(idPergunta: number) {
  const repo = AppDataSource.getRepository(Pergunta);
  await repo.delete(idPergunta);
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
