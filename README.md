# 📋 Curricularização – Gerenciador de Formulários

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

Aplicativo **desktop** para gerenciamento de formulários digitais, desenvolvido com foco na **criação, distribuição, coleta e análise de respostas**, integrando-se à **API do Google Forms**.

O sistema permite a geração automática de **PDFs**, **gráficos**, **relatórios analíticos** e **exportação de dados em XML**, facilitando a visualização e o tratamento das informações coletadas.

![Desktop App](https://img.shields.io/badge/Desktop%20App-Electron-blue?style=for-the-badge)
![Full Stack](https://img.shields.io/badge/Full%20Stack-Application-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🚀 Funcionalidades

- 📄 Criação e gerenciamento de formulários
- 🔗 Integração com a **API do Google Forms**
- 📥 Coleta e processamento de respostas
- 📊 Geração de gráficos e relatórios analíticos
- 🧾 Exportação de relatórios em **PDF**
- 📤 Exportação de dados em **XML**
- 💾 Persistência local de dados com **SQLite**
- 🖥️ Aplicativo desktop multiplataforma

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular**
- TypeScript
- HTML5 / CSS3

### Backend
- **Node.js**
- **Express**
- Integração com APIs externas (Google Forms)

### Desktop
- **Electron**

### Banco de Dados
- **SQLite**

![Google Forms API](https://img.shields.io/badge/Google%20Forms%20API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![PDF](https://img.shields.io/badge/Export-PDF-red?style=for-the-badge)
![XML](https://img.shields.io/badge/Export-XML-orange?style=for-the-badge)
![Charts](https://img.shields.io/badge/Data-Charts%20%26%20Reports-informational?style=for-the-badge)

---

## 📂 Arquitetura do Projeto

O projeto segue uma arquitetura desacoplada entre frontend e backend:

- **Frontend (Angular)**  
  Responsável pela interface do usuário, validações e interação com a API.

- **Backend (Express)**  
  Responsável pela lógica de negócio, integração com a API do Google Forms, geração de relatórios e comunicação com o banco de dados.

- **Electron**  
  Responsável por empacotar a aplicação web como um aplicativo desktop.

---

## ▶️ Como Executar o Projeto

### Pré-requisitos
- Node.js (versão LTS recomendada)
- npm ou pnpm
- Angular CLI

---

### 🔧 Backend

```bash
cd backend
npm install
npm run dev
