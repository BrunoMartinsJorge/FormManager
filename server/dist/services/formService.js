"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salvarFormularioCompleto = salvarFormularioCompleto;
exports.editarPerguntaSalva = editarPerguntaSalva;
exports.apagarFormulario = apagarFormulario;
exports.listarFormularios = listarFormularios;
exports.listarQuestoesPorFormulario = listarQuestoesPorFormulario;
exports.buscarFormularioPorId = buscarFormularioPorId;
exports.salvarPergunta = salvarPergunta;
exports.apagarPergunta = apagarPergunta;
exports.buscarRespostasDoFormularioPorId = buscarRespostasDoFormularioPorId;
exports.buscarQuestoesSalvas = buscarQuestoesSalvas;
const googleapis_1 = require("googleapis");
const googleAuth_1 = require("./googleAuth");
const data_source_1 = require("../database/data-source");
const Formulario_1 = require("../models/Formulario");
const Pergunta_1 = require("../models/Pergunta");
const Tipo_Pergunta_1 = require("../models/Tipo_Pergunta");
const ListaPerguntasDto_1 = require("../models/dto/ListaPerguntasDto");
const Alternativa_Pergunta_1 = require("../models/Alternativa_Pergunta");
const FormulariosListaDto_1 = require("../models/dto/FormulariosListaDto");
async function salvarFormularioCompleto(dadosForm, userEmail) {
    const auth = await (0, googleAuth_1.getAuthClient)();
    const formsApi = googleapis_1.google.forms({ version: 'v1', auth });
    const createRes = await formsApi.forms.create({
        requestBody: {
            info: { title: dadosForm.titulo },
        },
    });
    const formId = createRes.data.formId;
    let requests = [];
    (dadosForm.questoes || []).forEach((questao, index) => {
        const item = {
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
                return; // <-- evita continuar o fluxo e criar outro item duplicado
            case 'NUMERO':
                item.questionItem.question = { textQuestion: {} };
                break;
            case 'UNICA':
                item.questionItem.question = {
                    choiceQuestion: {
                        type: 'RADIO',
                        options: (questao.opcoes || []).map((v) => ({ value: v })),
                    },
                };
                break;
            case 'MULTIPLA':
                item.questionItem.question = {
                    choiceQuestion: {
                        type: 'CHECKBOX',
                        options: (questao.opcoes || []).map((v) => ({ value: v })),
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
    if (!formId)
        throw new Error('formId inválido');
    await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });
    return await data_source_1.AppDataSource.transaction(async (manager) => {
        const formRepo = manager.getRepository(Formulario_1.Formulario);
        const tipoRepo = manager.getRepository(Tipo_Pergunta_1.Tipo_Pergunta);
        const perguntaRepo = manager.getRepository(Pergunta_1.Pergunta);
        const altRepo = manager.getRepository(Alternativa_Pergunta_1.Alternativa_Pergunta);
        if (!createRes)
            throw new Error('Erro ao criar formulário');
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
async function editarPerguntaSalva(dados) {
    const repoPergunta = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    const repoTipo = data_source_1.AppDataSource.getRepository(Tipo_Pergunta_1.Tipo_Pergunta);
    const repoAlt = data_source_1.AppDataSource.getRepository(Alternativa_Pergunta_1.Alternativa_Pergunta);
    const questao = await repoPergunta.findOne({
        where: { idPergunta: dados.idPergunta },
        relations: ['Alternativas', 'Tipo_Pergunta'],
    });
    if (!questao)
        throw new Error('Questão não encontrada!');
    const tipo = await repoTipo.findOneBy({
        Descricao: questao.Tipo_Pergunta.Descricao,
    });
    questao.Titulo = dados.titulo;
    questao.Tipo_Pergunta = tipo ?? questao.Tipo_Pergunta;
    questao.Favorita = true;
    if (dados.opcoes && dados.opcoes.length > 0) {
        questao.Alternativas = await Promise.all(dados.opcoes.map(async (opt) => {
            const alt = new Alternativa_Pergunta_1.Alternativa_Pergunta();
            alt.Pergunta = questao;
            alt.Texto = opt;
            await repoAlt.save(alt);
            return alt;
        }));
    }
    await repoPergunta.save(questao);
    questao.Alternativas?.forEach((a) => {
        if ('Pergunta' in a) {
            delete a.Pergunta;
        }
    });
    return questao;
}
async function apagarFormulario(idFormulario) {
    const repo = data_source_1.AppDataSource.getRepository(Formulario_1.Formulario);
    await repo.delete(idFormulario);
}
async function listarFormularios(userEmail) {
    if (!userEmail)
        return [];
    const repo = data_source_1.AppDataSource.getRepository(Formulario_1.Formulario);
    const forms = await repo.find({
        where: { email: userEmail },
    });
    if (!forms)
        return [];
    return forms.map((form) => FormulariosListaDto_1.FormulariosListaDto.convert(form));
}
async function listarQuestoesPorFormulario(idForm) {
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    return await repo.find({
        where: { Formulario: { idFormulario: idForm } },
        relations: ['Alternativas'],
    });
}
async function buscarFormularioPorId(idFormulario) {
    const repo = data_source_1.AppDataSource.getRepository(Formulario_1.Formulario);
    return await repo.findOne({
        where: { idFormulario },
        relations: ['Perguntas', 'Perguntas.Alternativas'],
    });
}
async function salvarPergunta(form) {
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    const tipo = await data_source_1.AppDataSource.getRepository(Tipo_Pergunta_1.Tipo_Pergunta).findOneBy({
        Descricao: form.tipo,
    });
    const repoAlt = data_source_1.AppDataSource.getRepository(Alternativa_Pergunta_1.Alternativa_Pergunta);
    let alternativas = [];
    if (form.opcoes && form.opcoes.length > 0) {
        alternativas = form.opcoes.map((opt) => {
            const alt = new Alternativa_Pergunta_1.Alternativa_Pergunta();
            alt.Texto = opt;
            return alt;
        });
    }
    const pergunta = repo.create({
        Titulo: form.titulo,
        Formulario: null,
        Alternativas: alternativas,
        Tipo_Pergunta: tipo,
        Favorita: true,
    });
    const saved = await repo.save(pergunta);
    saved.Alternativas.forEach((alt) => {
        alt.Pergunta = saved;
        repoAlt.save(alt);
    });
    return saved;
}
async function apagarPergunta(idPergunta) {
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    await repo.delete(idPergunta);
}
async function buscarRespostasDoFormularioPorId(idForm) {
    const form = googleapis_1.google.forms({ version: 'v1', auth: googleAuth_1.oAuth2Client });
    const formRes = await form.forms.get({ formId: idForm });
    const respostasRes = await form.forms.responses.list({ formId: idForm });
    const ativo = !!formRes.data.responderUri;
    return convertQuestionData(ativo, {
        items: formRes.data.items || [],
        responses: respostasRes.data.responses || [],
    });
}
function convertQuestionData(ativo, data) {
    const questoes = data.items || [];
    const responses = data.responses || [];
    const questoesFormatadas = questoes
        .filter((quest) => quest.questionItem && quest.questionItem.question)
        .map((quest) => {
        const q = quest.questionItem.question;
        let tipo = 'DESCONHECIDO';
        let opcoes;
        if (q.textQuestion)
            tipo = 'Texto';
        if (q.choiceQuestion) {
            tipo = 'Escolha';
            opcoes = q.choiceQuestion.options.map((o) => o.value);
        }
        if (q.scaleQuestion)
            tipo = 'Escala';
        if (q.dateQuestion)
            tipo = 'Data';
        return {
            id: q.questionId,
            titulo: quest.title,
            tipo,
            opcoes,
        };
    });
    const respostasFormatadas = responses.map((resp) => {
        const respostasQuestao = [];
        // Extrair respostas das questões
        Object.values(resp.answers || {}).forEach((answer) => {
            if (answer.textAnswers) {
                answer.textAnswers.answers.forEach((a) => {
                    respostasQuestao.push({
                        idQuestao: answer.questionId,
                        valor: a.value,
                    });
                });
            }
            if (answer.choiceAnswers) {
                answer.choiceAnswers.answers.forEach((a) => {
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
    const questoesFormatadasResponse = {
        questoes: questoesFormatadas,
        respostas: respostasFormatadas,
    };
    const resposta = {
        ativo,
        questoesFormatadas: questoesFormatadasResponse,
        respostasPorUsuario: mapearRespostasPorRespondente(data),
    };
    return resposta;
}
function mapearRespostasPorRespondente(data) {
    const questoes = data.items || [];
    const responses = data.responses || [];
    return responses.map((resp) => {
        const respostasUsuario = [];
        Object.values(resp.answers).forEach((answer) => {
            const questao = questoes.find((q) => q.questionItem?.question?.questionId === answer.questionId);
            if (!questao)
                return;
            const titulo = questao.title;
            const idQuestao = answer.questionId;
            if (answer.textAnswers) {
                answer.textAnswers.answers.forEach((a) => {
                    respostasUsuario.push({
                        idQuestao,
                        titulo,
                        valor: a.value,
                    });
                });
            }
            if (answer.choiceAnswers) {
                answer.choiceAnswers.answers.forEach((a) => {
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
async function buscarQuestoesSalvas(email) {
    if (!email)
        return [];
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    const questoes = await repo.find({
        where: { Favorita: true },
        relations: ['Alternativas', 'Tipo_Pergunta'],
    });
    return questoes.map((pergunta) => ListaPerguntasDto_1.ListaPerguntasDto.convert(pergunta));
}
