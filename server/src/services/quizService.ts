import { google } from "googleapis";
import { getAuthClient, oAuth2Client } from "./googleAuth";
import { AppDataSource } from "../database/data-source";
import { Formulario } from "../models/Formulario";
import { Pergunta } from "../models/Pergunta";
import { Tipo_Pergunta } from "../models/Tipo_Pergunta";
import { Alternativa } from "../models/Alternativa";
import { NewQuiz } from "../forms/NewForm";
import { Quiz } from "../models/Quiz";
import { Questao } from "../models/Questao";
import { ListaQuizDto, Questoes_Quiz, Respostas_Quiz } from "../models/dto/ListaQuizDto";

export async function createQuiz(quizForm: NewQuiz, userEmail: string | null) {
    const auth = await getAuthClient();
    const formsApi = google.forms({ version: "v1", auth });

    const createRes = await formsApi.forms.create({
        requestBody: {
            info: { title: quizForm.titulo }
        }
    });

    const formId = createRes.data.formId;
    if (!formId) throw new Error("formId inválido");

    const requests: any[] = (quizForm.questoes || []).map((questao: any, index: number) => {
        const item: any = { title: questao.titulo, questionItem: { question: {} } };
        switch (questao.tipo) {
            case "TEXTO": item.questionItem.question = { textQuestion: { paragraph: false } }; break;
            case "PARAGRAFO": item.questionItem.question = { textQuestion: { paragraph: true } }; break;
            case "NUMERO": item.questionItem.question = { textQuestion: {} }; break;
            case "UNICA": item.questionItem.question = { choiceQuestion: { type: "RADIO", options: (questao.opcoes || []).map((v: string) => ({ value: v })) } }; break;
            case "MULTIPLA": item.questionItem.question = { choiceQuestion: { type: "CHECKBOX", options: (questao.opcoes || []).map((v: string) => ({ value: v })) } }; break;
            case "DATA": item.questionItem.question = { dateQuestion: {} }; break;
            case "DATAHORA": item.questionItem.question = { dateTimeQuestion: {} }; break;
            case "ESCALA": item.questionItem.question = { scaleQuestion: { low: questao.low || 1, high: questao.high || 5 } }; break;
            case "VERDADEIRO_FALSO": item.questionItem.question = { choiceQuestion: { type: "RADIO", options: [{ value: "Verdadeiro" }, { value: "Falso" }] } }; break;
            case "UPLOAD": item.questionItem.question = { fileUploadQuestion: { maxFiles: questao.maxFiles || 1, maxFileSize: questao.maxFileSize || 10 } }; break;
        }
        return { createItem: { item, location: { index } } };
    });

    requests.push({
        updateSettings: {
            settings: { quizSettings: { isQuiz: true } },
            updateMask: "quizSettings"
        }
    });

    requests.push({
        updateFormInfo: { info: { description: quizForm.descricao || "" }, updateMask: "description" }
    } as any);


    await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

    return await AppDataSource.transaction(async (manager) => {
        const quizRepo = manager.getRepository(Quiz);
        const tipoRepo = manager.getRepository(Tipo_Pergunta);
        const perguntaRepo = manager.getRepository(Questao);
        const altRepo = manager.getRepository(Alternativa);

        if (!createRes || !createRes.data.responderUri) throw new Error("Erro ao criar formulário");

        const form = quizRepo.create({
            Titulo: quizForm.titulo,
            Descricao: quizForm.descricao,
            Link_Url: createRes.data.responderUri,
            formId,
            email: userEmail ?? 'sem_email'
        });
        await quizRepo.save(form);

        for (const q of quizForm.questoes) {
            let tipo = await tipoRepo.findOne({ where: { Descricao: q.tipo } });
            if (!tipo) {
                tipo = tipoRepo.create({ Descricao: q.tipo });
                await tipoRepo.save(tipo);
            }

            const pergunta = perguntaRepo.create({
                Tipo_Pergunta: tipo,
                Quiz: form,
                Titulo: q.titulo,
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

export async function listAllQuizzes(email: string | null) {
    if (!email) return [];
    const repo = AppDataSource.getRepository(Quiz);
    return await repo.find({ where: { email: email }, relations: ["Perguntas", "Perguntas.Alternativas"] });
}

export async function listarQuestoesPorFormulario(idForm: number) {
    const repo = AppDataSource.getRepository(Pergunta);
    return await repo.find({
        where: { Formulario: { idFormulario: idForm } },
        relations: ["Alternativas"],
    });
}

export async function buscarQuizPorId(quizId: string) {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId: quizId });
    const respostasRes = await forms.forms.responses.list({ formId: quizId });
    if (!formRes) return null;
    return convertQuizData(formRes.data.items, respostasRes.data.responses);
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