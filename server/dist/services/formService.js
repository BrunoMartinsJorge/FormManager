"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salvarFormularioCompleto = salvarFormularioCompleto;
exports.apagarFormulario = apagarFormulario;
exports.listarFormularios = listarFormularios;
exports.listarQuestoesPorFormulario = listarQuestoesPorFormulario;
exports.buscarFormularioPorId = buscarFormularioPorId;
exports.salvarPergunta = salvarPergunta;
exports.apagarPergunta = apagarPergunta;
exports.buscarQuestoesSalvas = buscarQuestoesSalvas;
const googleapis_1 = require("googleapis");
const googleAuth_1 = require("./googleAuth");
const data_source_1 = require("../database/data-source");
const Formulario_1 = require("../models/Formulario");
const Pergunta_1 = require("../models/Pergunta");
const Tipo_Pergunta_1 = require("../models/Tipo_Pergunta");
const Alternativa_1 = require("../models/Alternativa");
const ListaPerguntasDto_1 = require("../models/dto/ListaPerguntasDto");
async function salvarFormularioCompleto(dadosForm, userEmail) {
    const auth = await (0, googleAuth_1.getAuthClient)();
    const formsApi = googleapis_1.google.forms({ version: "v1", auth });
    const createRes = await formsApi.forms.create({
        requestBody: {
            info: { title: dadosForm.titulo }
        }
    });
    const formId = createRes.data.formId;
    const requests = (dadosForm.questoes || []).map((questao, index) => {
        const item = { title: questao.titulo, questionItem: { question: {} } };
        switch (questao.tipo) {
            case "TEXTO":
                item.questionItem.question = { textQuestion: { paragraph: false } };
                break;
            case "PARAGRAFO":
                item.questionItem.question = { textQuestion: { paragraph: true } };
                break;
            case "NUMERO":
                item.questionItem.question = { textQuestion: {} };
                break;
            case "UNICA":
                item.questionItem.question = { choiceQuestion: { type: "RADIO", options: (questao.opcoes || []).map((v) => ({ value: v })) } };
                break;
            case "MULTIPLA":
                item.questionItem.question = { choiceQuestion: { type: "CHECKBOX", options: (questao.opcoes || []).map((v) => ({ value: v })) } };
                break;
            case "DATA":
                item.questionItem.question = { dateQuestion: {} };
                break;
            case "DATAHORA":
                item.questionItem.question = { dateTimeQuestion: {} };
                break;
            case "ESCALA":
                item.questionItem.question = { scaleQuestion: { low: questao.low || 1, high: questao.high || 5 } };
                break;
            case "VERDADEIRO_FALSO":
                item.questionItem.question = { choiceQuestion: { type: "RADIO", options: [{ value: "Verdadeiro" }, { value: "Falso" }] } };
                break;
            case "UPLOAD":
                item.questionItem.question = { fileUploadQuestion: { maxFiles: questao.maxFiles || 1, maxFileSize: questao.maxFileSize || 10 } };
                break;
        }
        return { createItem: { item, location: { index } } };
    });
    requests.push({
        updateFormInfo: { info: { description: dadosForm.descricao || "" }, updateMask: "description" }
    });
    if (!formId)
        throw new Error("formId inválido");
    await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });
    return await data_source_1.AppDataSource.transaction(async (manager) => {
        const formRepo = manager.getRepository(Formulario_1.Formulario);
        const tipoRepo = manager.getRepository(Tipo_Pergunta_1.Tipo_Pergunta);
        const perguntaRepo = manager.getRepository(Pergunta_1.Pergunta);
        const altRepo = manager.getRepository(Alternativa_1.Alternativa);
        if (!createRes)
            throw new Error("Erro ao criar formulário");
        console.log(createRes);
        const form = formRepo.create({
            Titulo: dadosForm.titulo,
            Descricao: dadosForm.descricao,
            Link_Url: createRes.data.responderUri ?? "",
            formId: formId ?? "",
            email: userEmail ?? 'sem_email',
            publicado: dadosForm.false
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
async function apagarFormulario(idFormulario) {
    const repo = data_source_1.AppDataSource.getRepository(Formulario_1.Formulario);
    await repo.delete(idFormulario);
}
async function listarFormularios(userEmail) {
    if (!userEmail)
        return [];
    const repo = data_source_1.AppDataSource.getRepository(Formulario_1.Formulario);
    return await repo.find({ where: { email: userEmail }, relations: ["Perguntas", "Perguntas.Alternativas"] });
}
async function listarQuestoesPorFormulario(idForm) {
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    return await repo.find({
        where: { Formulario: { idFormulario: idForm } },
        relations: ["Alternativas"],
    });
}
async function buscarFormularioPorId(idFormulario) {
    const repo = data_source_1.AppDataSource.getRepository(Formulario_1.Formulario);
    return await repo.findOne({
        where: { idFormulario },
        relations: ["Perguntas", "Perguntas.Alternativas"],
    });
}
async function salvarPergunta(form) {
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    const tipo = await data_source_1.AppDataSource.getRepository(Tipo_Pergunta_1.Tipo_Pergunta).findOneBy({ Descricao: form.tipo });
    let alternativas = [];
    if (form.opcoes && form.opcoes.length > 0) {
        alternativas = form.opcoes.map(opt => {
            const alt = new Alternativa_1.Alternativa();
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
    return await repo.save(pergunta);
}
async function apagarPergunta(idPergunta) {
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    await repo.delete(idPergunta);
}
async function buscarQuestoesSalvas(email) {
    if (!email)
        return [];
    const repo = data_source_1.AppDataSource.getRepository(Pergunta_1.Pergunta);
    const questoes = await repo.find({ where: { Favorita: true }, relations: ["Alternativas", "Tipo_Pergunta"] });
    return questoes.map((pergunta) => ListaPerguntasDto_1.ListaPerguntasDto.convert(pergunta));
}
