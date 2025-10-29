"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuiz = createQuiz;
exports.apagarFormulario = apagarFormulario;
exports.listAllQuizzes = listAllQuizzes;
exports.listarQuestoesPorFormulario = listarQuestoesPorFormulario;
exports.buscarQuizPorId = buscarQuizPorId;
exports.salvarQuestao = salvarQuestao;
exports.listarTodasQuestoesFavoritas = listarTodasQuestoesFavoritas;
const googleapis_1 = require("googleapis");
const googleAuth_1 = require("./googleAuth");
const data_source_1 = require("../database/data-source");
const Formulario_1 = require("../models/Formulario");
const Pergunta_1 = require("../models/Pergunta");
const Tipo_Pergunta_1 = require("../models/Tipo_Pergunta");
const Quiz_1 = require("../models/Quiz");
const Questao_1 = require("../models/Questao");
const Alternativa_Questao_1 = require("../models/Alternativa_Questao");
async function createQuiz(quizForm, userEmail) {
    const auth = await (0, googleAuth_1.getAuthClient)();
    const formsApi = googleapis_1.google.forms({ version: 'v1', auth });
    const createRes = await formsApi.forms.create({
        requestBody: {
            info: { title: quizForm.titulo },
        },
    });
    const formId = createRes.data.formId;
    if (!formId)
        throw new Error('formId inválido');
    const requests = (quizForm.questoes || []).map((questao, index) => {
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
            case 'NUMERO':
                item.questionItem.question = { textQuestion: {} };
                break;
            case 'UNICA':
                item.questionItem.question = {
                    choiceQuestion: {
                        type: 'RADIO',
                        options: (questao.opcoes || []).map((v) => ({
                            value: v,
                        })),
                    },
                };
                break;
            case 'MULTIPLA':
                item.questionItem.question = {
                    choiceQuestion: {
                        type: 'CHECKBOX',
                        options: (questao.opcoes || []).map((v) => ({
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
    });
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
    });
    await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });
    return await data_source_1.AppDataSource.transaction(async (manager) => {
        const quizRepo = manager.getRepository(Quiz_1.Quiz);
        const tipoRepo = manager.getRepository(Tipo_Pergunta_1.Tipo_Pergunta);
        const questaoRepo = manager.getRepository(Questao_1.Questao);
        const altRepo = manager.getRepository(Alternativa_Questao_1.Alternativa_Questao);
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
async function apagarFormulario(idFormulario) {
    const repo = data_source_1.AppDataSource.getRepository(Formulario_1.Formulario);
    await repo.delete(idFormulario);
}
async function listAllQuizzes(email) {
    if (!email)
        return [];
    const repo = data_source_1.AppDataSource.getRepository(Quiz_1.Quiz);
    return await repo.find({
        where: { email: email },
        relations: ['Perguntas', 'Perguntas.Alternativas'],
    });
}
async function listarQuestoesPorFormulario(idForm) {
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    return await repo.find({
        where: { Formulario: { idFormulario: idForm } },
        relations: ['Alternativas'],
    });
}
async function buscarQuizPorId(quizId) {
    const forms = googleapis_1.google.forms({ version: 'v1', auth: googleAuth_1.oAuth2Client });
    const formRes = await forms.forms.get({ formId: quizId });
    const respostasRes = await forms.forms.responses.list({ formId: quizId });
    if (!formRes)
        return null;
    return convertQuizData(formRes.data.items, respostasRes.data.responses);
}
async function salvarQuestao(form) {
    const repo = data_source_1.AppDataSource.getRepository(Questao_1.Questao);
    const repoAlt = data_source_1.AppDataSource.getRepository(Alternativa_Questao_1.Alternativa_Questao);
    const repoTipo = data_source_1.AppDataSource.getRepository(Tipo_Pergunta_1.Tipo_Pergunta);
    const tipo = await repoTipo.findOneBy({ Descricao: form.tipo });
    if (!tipo)
        throw new Error(`Tipo de pergunta '${form.tipo}' não encontrado`);
    // Cria alternativas
    const alternativas = form.opcoes
        ? form.opcoes.map((texto) => {
            const alt = new Alternativa_Questao_1.Alternativa_Questao();
            alt.Texto = texto;
            return alt;
        })
        : [];
    // Cria a questão sem AlternativasCorretas inicialmente
    const questao = repo.create({
        Titulo: form.titulo,
        Tipo_Pergunta: tipo,
        Favorita: form.favorita ?? false,
        Pontuacao: form.pontos ?? 0,
        FeedbackCorreto: form.feedbackCorreto ?? '',
        FeedbackErrado: form.feedbackErrado ?? '',
        Alternativas: alternativas,
        AlternativasCorretas: [], // vazio por enquanto
    });
    // Salva a questão com todas as alternativas
    const savedQuestao = await repo.save(questao);
    // Salva individualmente as alternativas vinculadas à questão
    for (const alt of alternativas) {
        alt.Questao = savedQuestao;
        await repoAlt.save(alt);
    }
    // Agora associa apenas as alternativas corretas
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
async function listarTodasQuestoesFavoritas() {
    const questoesRepo = data_source_1.AppDataSource.getRepository(Questao_1.Questao);
    const questoes = await questoesRepo.find({
        where: { Favorita: true },
        relations: ['Alternativas', 'Tipo_Pergunta', 'AlternativasCorretas'],
    });
    return questoes;
}
function convertQuizData(questoesQuiz, respostasQuiz) {
    const questoes = questoesQuiz || [];
    const responses = respostasQuiz || [];
    const questoesFormatadas = questoes.map((q) => {
        const question = q.questionItem?.question;
        let tipo = 'DESCONHECIDO';
        let opcoes;
        if (question.textQuestion)
            tipo = 'Texto';
        if (question.choiceQuestion) {
            tipo = 'Escolha';
            opcoes = question.choiceQuestion.options.map((o) => o.value);
        }
        if (question.scaleQuestion)
            tipo = 'Escala';
        if (question.dateQuestion)
            tipo = 'Data';
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
    const respostasFormatadas = responses.map((resp) => {
        const respostasQuestao = [];
        Object.values(resp.answers).forEach((answer) => {
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
