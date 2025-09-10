const db = require("./db");
const { google } = require("googleapis");
const { getAuthClient } = require("./googleAuth");

async function salvarFormularioCompleto(dadosForm) {
  const insertFormulario = db.prepare(
    "INSERT INTO Formulario (Titulo, Descricao, Link_Url, formId) VALUES (?, ?, ?, ?)"
  );
  const insertPergunta = db.prepare(
    "INSERT INTO Pergunta (Tipo_Pergunta_idTipo_Pergunta, Formulario_idFormulario, Titulo, Obrigatorio, Favorita) VALUES (?, ?, ?, ?, ?)"
  );
  const insertAlternativa = db.prepare(
    "INSERT INTO Alternativa (Pergunta_idPergunta, Texto) VALUES (?, ?)"
  );
  const getTipoPergunta = db.prepare(
    "SELECT idTipo_Pergunta FROM Tipo_Pergunta WHERE Descricao = ?"
  );



  const salvar = db.transaction((dadosForm) => {
    const result = insertFormulario.run(
      dadosForm.titulo,
      dadosForm.descricao,
      dadosForm.linkUrl,
      dadosForm.formId
    );

    const formularioId = result.lastInsertRowid;

    dadosForm.questoes.forEach((q) => {
      const tipo = getTipoPergunta.get(q.tipo);
      let tipoId = tipo ? tipo.idTipo_Pergunta : db.prepare("INSERT INTO Tipo_Pergunta (Descricao) VALUES (?)").run(q.tipo).lastInsertRowid;

      const resPergunta = insertPergunta.run(
        tipoId,
        formularioId,
        q.titulo,
        q.obrigatoria ? 1 : 0,
        q.favorito ? 1 : 0
      );

      const perguntaId = resPergunta.lastInsertRowid;

      if (q.opcoes && q.opcoes.length > 0) {
        q.opcoes.forEach((opcao) => insertAlternativa.run(perguntaId, opcao));
      }
    });

    return formularioId;
  });

  return salvar(dadosForm);
}

function apagarFormulario(idFormulario) {
  db.prepare(
    "DELETE FROM Alternativa WHERE Pergunta_idPergunta IN (SELECT idPergunta FROM Pergunta WHERE Formulario_idFormulario = ?)"
  ).run(idFormulario);
  db.prepare("DELETE FROM Pergunta WHERE Formulario_idFormulario = ?").run(idFormulario);
  db.prepare(
    "DELETE FROM Resposta WHERE Pergunta_idPergunta IN (SELECT idPergunta FROM Pergunta WHERE Formulario_idFormulario = ?)"
  ).run(idFormulario);
  db.prepare("DELETE FROM Formulario WHERE idFormulario = ?").run(idFormulario);
}

function listarFormularios() {
  return db.prepare("SELECT * FROM Formulario ORDER BY idFormulario").all();
}

function listarQuestoesPorFormulario(idForm) {
  return db.prepare("SELECT * FROM Pergunta WHERE Formulario_idFormulario = ? ORDER BY idPergunta").all(idForm);
}

function buscarFormularioPorId(idFormulario) {
  return db.prepare("SELECT * FROM Formulario WHERE idFormulario = ?").get(idFormulario);
}

async function createGoogleForm(newForm) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: "v1", auth });

  const createRes = await formsApi.forms.create({ requestBody: { info: { title: newForm.titulo } } });
  const formId = createRes.data.formId;

  const requests = (newForm.questoes || []).map((questao, index) => {
    const item = { title: questao.titulo, questionItem: { question: {} } };
    switch (questao.tipo) {
      case "TEXTO": item.questionItem.question = { textQuestion: { paragraph: false } }; break;
      case "PARAGRAFO": item.questionItem.question = { textQuestion: { paragraph: true } }; break;
      case "NUMERO": item.questionItem.question = { textQuestion: {} }; break;
      case "UNICA": item.questionItem.question = { choiceQuestion: { type: "RADIO", options: (questao.opcoes || []).map(v => ({ value: v })) } }; break;
      case "MULTIPLA": item.questionItem.question = { choiceQuestion: { type: "CHECKBOX", options: (questao.opcoes || []).map(v => ({ value: v })) } }; break;
      case "DATA": item.questionItem.question = { dateQuestion: {} }; break;
      case "DATAHORA": item.questionItem.question = { dateTimeQuestion: {} }; break;
      case "ESCALA": item.questionItem.question = { scaleQuestion: { low: questao.low || 1, high: questao.high || 5 } }; break;
      case "VERDADEIRO_FALSO": item.questionItem.question = { choiceQuestion: { type: "RADIO", options: [{ value: "Verdadeiro" }, { value: "Falso" }] } }; break;
      case "UPLOAD": item.questionItem.question = { fileUploadQuestion: { maxFiles: questao.maxFiles || 1, maxFileSize: questao.maxFileSize || 10 } }; break;
    }
    return { createItem: { item, location: { index } } };
  });

  requests.push({ updateFormInfo: { info: { description: newForm.descricao || "" }, updateMask: "description" } });
  await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

  return { formId, formUrl: createRes.data.responderUri, titulo: newForm.titulo, descricao: newForm.descricao, questoes: newForm.questoes };
}

async function criarQuiz(newForm) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: "v1", auth });

  const createRes = await formsApi.forms.create({
    requestBody: { info: { title: newForm.titulo } }
  });

  const formId = createRes.data.formId;
  const tiposComCorrecao = ["TEXTO", "UNICA", "MULTIPLA", "VERDADEIRO_FALSO"];

  const requests = [
    {
      updateSettings: {
        settings: { quizSettings: { isQuiz: true } },
        updateMask: "quizSettings.isQuiz"
      }
    },
    {
      updateFormInfo: {
        info: { description: newForm.descricao || "" },
        updateMask: "description"
      }
    },
    ...(newForm.questoes || []).map((questao, index) => {
      const item = {
        title: questao.titulo,
        questionItem: { question: {} }
      };

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
          item.questionItem.question = {
            choiceQuestion: {
              type: "RADIO",
              options: (questao.opcoes || []).map(v => ({ value: v }))
            }
          };
          break;
        case "MULTIPLA":
          item.questionItem.question = {
            choiceQuestion: {
              type: "CHECKBOX",
              options: (questao.opcoes || []).map(v => ({ value: v }))
            }
          };
          break;
        case "DATA":
          item.questionItem.question = { dateQuestion: {} };
          break;
        case "DATAHORA":
          item.questionItem.question = { dateTimeQuestion: {} };
          break;
        case "ESCALA":
          item.questionItem.question = {
            scaleQuestion: {
              low: questao.low || 1,
              high: questao.high || 5
            }
          };
          break;
        case "VERDADEIRO_FALSO":
          item.questionItem.question = {
            choiceQuestion: {
              type: "RADIO",
              options: [{ value: "Verdadeiro" }, { value: "Falso" }]
            }
          };
          break;
        case "UPLOAD":
          item.questionItem.question = {
            fileUploadQuestion: {
              maxFiles: questao.maxFiles || 1,
              maxFileSize: questao.maxFileSize || 10
            }
          };
          break;
      }

      if (
        tiposComCorrecao.includes(questao.tipo) &&
        (questao.pontos || questao.respostasCorretas)
      ) {
        if (questao.tipo === 'VERDADEIRO_FALSO') {
          item.questionItem.question.grading = {
            pointValue: questao.pontos || 1,
            correctAnswers: {
              answers: (questao.valorCorreto || []).map(i => ({
                value: questao.opcoes?.[i] || i
              }))
            },
            whenRight: { text: questao.feedbackCorreto || "Correto!" },
            whenWrong: { text: questao.feedbackErrado || "Resposta incorreta." }
          };
        }
        else {
          item.questionItem.question.grading = {
            pointValue: questao.pontos || 1,
            correctAnswers: {
              answers: (questao.respostasCorretas || []).map(i => ({
                value: questao.opcoes?.[i] || i
              }))
            },
            whenRight: { text: questao.feedbackCorreto || "Correto!" },
            whenWrong: { text: questao.feedbackErrado || "Resposta incorreta." }
          };
        }
      }

      return {
        createItem: {
          item,
          location: { index }
        }
      };
    })
  ];

  // 3. Executa o batchUpdate
  await formsApi.forms.batchUpdate({
    formId,
    requestBody: { requests }
  });

  return {
    formId,
    formUrl: createRes.data.responderUri,
    titulo: newForm.titulo,
    descricao: newForm.descricao,
    questoes: newForm.questoes
  };
}

async function listarRespostas(formId) {
  const auth = await getAuthClient();
  const forms = google.forms({ version: "v1", auth });
  try {
    const res = await forms.forms.responses.list({ formId });
    return res.data.responses || [];
  } catch (err) {
    console.error("Erro ao buscar respostas:", err);
    return [];
  }
}

module.exports = { salvarFormularioCompleto, apagarFormulario, listarFormularios, listarQuestoesPorFormulario, buscarFormularioPorId, createGoogleForm, criarQuiz, listarRespostas };
