const { app: electronApp } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

const userDataPath = electronApp.getPath("userData");
const dbPath = path.join(userDataPath, "banco.db");
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.prepare(`
CREATE TABLE IF NOT EXISTS Formulario (
  idFormulario INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo VARCHAR(75),
  descricao TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  link_url TEXT,
  formId TEXT
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Quiz (
  idQuiz INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo VARCHAR(75),
  descricao TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  link_url TEXT,
  quizId TEXT
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Tipo_Pergunta (
  idTipo_Pergunta INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Pergunta (
  idPergunta INTEGER PRIMARY KEY AUTOINCREMENT,
  idTipo_Pergunta INTEGER,
  idFormulario INTEGER,
  titulo VARCHAR(255),
  descricao TEXT,
  obrigatoria BOOLEAN,
  favorita BOOLEAN,
  FOREIGN KEY (idTipo_Pergunta) REFERENCES Tipo_Pergunta(idTipo_Pergunta),
  FOREIGN KEY (idFormulario) REFERENCES Formulario(idFormulario)
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Questao (
  idQuestao INTEGER PRIMARY KEY AUTOINCREMENT,
  idTipo_Pergunta INTEGER,
  idQuiz INTEGER,
  titulo VARCHAR(255),
  descricao TEXT,
  obrigatoria BOOLEAN,
  favorita BOOLEAN,
  FOREIGN KEY (idTipo_Pergunta) REFERENCES Tipo_Pergunta(idTipo_Pergunta),
  FOREIGN KEY (idQuiz) REFERENCES Quiz(idQuiz)
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Alternativa (
  idAlternativa INTEGER PRIMARY KEY AUTOINCREMENT,
  idPergunta INTEGER,
  idQuestao INTEGER,
  texto TEXT,
  FOREIGN KEY (idPergunta) REFERENCES Pergunta(idPergunta),
  FOREIGN KEY (idQuestao) REFERENCES Questao(idQuestao)
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Participante (
  idParticipante INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Resposta (
  idResposta INTEGER PRIMARY KEY AUTOINCREMENT,
  idParticipante INTEGER,
  idPergunta INTEGER,
  idQuestao INTEGER,
  idAlternativa INTEGER,
  valor TEXT,
  data_resposta DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idParticipante) REFERENCES Participante(idParticipante),
  FOREIGN KEY (idPergunta) REFERENCES Pergunta(idPergunta),
  FOREIGN KEY (idQuestao) REFERENCES Questao(idQuestao),
  FOREIGN KEY (idAlternativa) REFERENCES Alternativa(idAlternativa)
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Token (
  idToken INTEGER PRIMARY KEY AUTOINCREMENT,
  accessToken TEXT NOT NULL,
  refreshToken TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiryDate INTEGER NOT NULL
);`).run();

module.exports = db;
