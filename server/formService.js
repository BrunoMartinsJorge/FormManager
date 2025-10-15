import db from "./db.js";
import { google } from "googleapis";
import { getAuthClient } from "./googleAuth.js";

async function salvarFormularioCompleto(dadosForm) {
  const insertFormulario = db.prepare(
    "INSERT INTO Formulario (Titulo, Descricao, Link_Url, formId) VALUES (?, ?, ?, ?)"
  );
  const insertPergunta = db.prepare(
    "INSERT INTO Pergunta (idTipo_Pergunta, titulo, favorita) VALUES (?, ?, ?)"
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
        q.titulo,
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

function insertNewQuestionFavorite(question) {
  const insertPergunta = db.prepare(
    `INSERT INTO Pergunta (idTipo_Pergunta, titulo, favorita, url_imagem, descricao_imagem)
     VALUES (?, ?, ?, ?, ?)`
  );

  const insertAlternativa = db.prepare(
    `INSERT INTO Alternativa (idPergunta, texto) VALUES (?, ?)`
  );

  const getTipoPergunta = db.prepare(
    `SELECT idTipo_Pergunta FROM Tipo_Pergunta WHERE descricao = ?`
  );

  const insertTipo = db.prepare("INSERT INTO Tipo_Pergunta (descricao) VALUES (?)");

  const salvar = db.transaction((question) => {
    let tipo = getTipoPergunta.get(question.tipo);
    let tipoId = tipo ? tipo.idTipo_Pergunta : insertTipo.run(question.tipo).lastInsertRowid;

    const resPergunta = insertPergunta.run(
      tipoId,
      question.titulo,
      1,
      question.imagemUrl,
      question.descricaoImagem
    );

    const perguntaId = resPergunta.lastInsertRowid;

    if (question.opcoes && question.opcoes.length > 0) {
      question.opcoes.forEach((opcao) => insertAlternativa.run(perguntaId, opcao));
    }

    return perguntaId;
  });

  return salvar(question);
}

async function salvarQuizCompleto(dadosQuiz) {
  const insertQuiz = db.prepare(
    "INSERT INTO Quiz (Titulo, Descricao, Link_Url, quizId) VALUES (?, ?, ?, ?)"
  );
  const insertQuestao = db.prepare(
    "INSERT INTO Questao (idTipo_Pergunta, idQuiz, Titulo, Obrigatoria, Favorita) VALUES (?, ?, ?, ?, ?)"
  );
  const insertAlternativa = db.prepare(
    "INSERT INTO Alternativa (idQuestao, Texto) VALUES (?, ?)"
  );
  const getTipoPergunta = db.prepare(
    "SELECT idTipo_Pergunta FROM Tipo_Pergunta WHERE Descricao = ?"
  );

  const salvar = db.transaction((dadosQuiz) => {
    // Inserindo o quiz
    const result = insertQuiz.run(
      dadosQuiz.titulo,
      dadosQuiz.descricao,
      dadosQuiz.linkUrl,
      dadosQuiz.formId
    );

    const quizId = result.lastInsertRowid;

    // Iterando sobre as questões do quiz
    dadosQuiz.questoes.forEach((q) => {
      // Busca ou cria o tipo de pergunta
      const tipo = getTipoPergunta.get(q.tipo);
      let tipoId = tipo
        ? tipo.idTipo_Pergunta
        : db
          .prepare("INSERT INTO Tipo_Pergunta (Descricao) VALUES (?)")
          .run(q.tipo).lastInsertRowid;

      // Insere a questão
      const resQuestao = insertQuestao.run(
        tipoId,
        quizId,
        q.titulo,
        q.obrigatoria ? 1 : 0,
        q.favorito ? 1 : 0
      );

      const questaoId = resQuestao.lastInsertRowid;

      // Insere alternativas da questão, se houver
      if (q.opcoes && q.opcoes.length > 0) {
        q.opcoes.forEach((opcao) =>
          insertAlternativa.run(questaoId, opcao)
        );
      }
    });

    return quizId;
  });

  return salvar(dadosQuiz);
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

function listarQuizzes() {
  return db.prepare("SELECT * FROM Quiz ORDER BY idQuiz").all();
}

function listarQuestoesPorFormulario(idForm) {
  return db.prepare("SELECT * FROM Pergunta WHERE Formulario_idFormulario = ? ORDER BY idPergunta").all(idForm);
}

function buscarFormularioPorId(idFormulario) {
  return db.prepare("SELECT * FROM Formulario WHERE idFormulario = ?").get(idFormulario);
}

async function createGoogleForm(newForm) {
  const auth = await getAuthClient();
  const forms = google.forms({ version: "v1", auth: auth });

  const createRes = await forms.forms.create({
    requestBody: { info: { title: newForm.titulo } },
  });
  const formId = createRes.data.formId;

  let currentIndex = 0;
  const requests = (newForm.questoes || []).flatMap((questao, index) => {
    const reqs = [];

    if (questao.imagemUrl) {
      reqs.push({
        createItem: {
          item: {
            title: "Imagem relacionada à pergunta",
            imageItem: { image: { sourceUri: questao.imagemUrl } },
          },
          location: { index: currentIndex },
        },
      });
      currentIndex++;
    }

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
        item.questionItem.question = {
          choiceQuestion: {
            type: "RADIO",
            options: (questao.opcoes || []).map(v => ({ value: v })),
          },
        };
        break;
      case "MULTIPLA":
        item.questionItem.question = {
          choiceQuestion: {
            type: "CHECKBOX",
            options: (questao.opcoes || []).map(v => ({ value: v })),
          },
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
          scaleQuestion: { low: questao.low || 1, high: questao.high || 5 },
        };
        break;
      case "VERDADEIRO_FALSO":
        item.questionItem.question = {
          choiceQuestion: { type: "RADIO", options: [{ value: "Verdadeiro" }, { value: "Falso" }] },
        };
        break;
      case "UPLOAD":
        item.questionItem.question = { fileUploadQuestion: { maxFiles: questao.maxFiles || 1, maxFileSize: questao.maxFileSize || 10 } };
        break;
    }

    reqs.push({
      createItem: {
        item,
        location: { index: currentIndex },
      },
    });

    return reqs;
  });

  requests.push({
    updateFormInfo: { info: { description: newForm.descricao || "" }, updateMask: "description" },
  });

  await forms.forms.batchUpdate({ formId, requestBody: { requests } });

  return {
    formId,
    formUrl: createRes.data.responderUri,
    titulo: newForm.titulo,
    descricao: newForm.descricao,
    questoes: newForm.questoes,
  };
}

async function findAllQuestionsByFormId(formId) {
  const auth = await getAuthClient();
  const forms = google.forms({ version: "v1", auth });

  const response = await forms.forms.get({ formId });
  const form = response.data;

  if (!form.items) return [];

  const questoes_formatadas = form.items.map((item) => {
    const questao = item.questionItem?.question;

    return {
      id: item.itemId,
      titulo: item.title || "",
      tipo: questao
        ? questao.choiceQuestion
          ? "MULTIPLA_ESCOLHA"
          : questao.textQuestion
            ? "TEXTO"
            : "OUTRO"
        : "IMAGEM",
      favorito: false,
      imagem: item.imageItem?.image?.sourceUri || null,
      descricaoImagem: item.imageItem?.image?.altText || null,
      opcoes: questao?.choiceQuestion?.options?.map((opt) => opt.value) || [],
    };
  });

  return questoes_formatadas;
}

async function findAllQuestionsFavorites() {
  const questoes = db.prepare(
    "SELECT * FROM Pergunta WHERE favorita = 1 ORDER BY idPergunta"
  ).all();
  const tipo_perguntas = db.prepare(
    "SELECT idTipo_Pergunta, descricao FROM Tipo_Pergunta"
  ).all();

  const questoes_formatadas = questoes.map((q) => {

    const tipo = tipo_perguntas.find((t) => t.idTipo_Pergunta === q.idTipo_Pergunta);
    return {
      ...q,
      tipo: tipo ? tipo.Descricao : null,
    };
  });

  return questoes_formatadas.map((questao) => {

    return {
      id: questao.idPergunta,
      titulo: questao.titulo,
      tipo: questao.tipo,
      favorito: questao.favorita === 1,
      imagem: questao.url_imagem,
      descricaoImagem: questao.descricao_imagem,
      opcoes: db
        .prepare("SELECT texto FROM Alternativa WHERE idPergunta = ? ORDER BY idAlternativa")
        .all(questao.idPergunta)
        .map((alt) => alt.texto),
    };
  });
}

async function criarQuiz(newForm) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: "v1", auth });

  const createRes = await formsApi.forms.create({
    requestBody: { info: { title: newForm.titulo } }
  });

  createRes.data.settings.emailCollectionType = "AUTO_COLLECTION";

  const formId = createRes.data.formId;
  const tiposComCorrecao = ["UNICA", "MULTIPLA", "VERDADEIRO_FALSO"];

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

  await formsApi.forms.batchUpdate({
    formId,
    requestBody: { requests }
  });

  console.log(createRes);

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

export {
  salvarFormularioCompleto,
  apagarFormulario,
  listarFormularios,
  listarQuestoesPorFormulario,
  buscarFormularioPorId,
  createGoogleForm,
  criarQuiz,
  listarRespostas,
  listarQuizzes,
  salvarQuizCompleto,
  findAllQuestionsFavorites,
  insertNewQuestionFavorite,
  findAllQuestionsByFormId,
};