const { app: electronApp, BrowserWindow, Menu } = require("electron");
const path = require("path");
const url = require("url");

const serverPath = path.join(__dirname, "server", "dist", "server.js");
const { startExpress } = require(serverPath);

let mainWindow;

async function createWindow() {
  try {
    await startExpress();
    console.log("✅ Servidor Express + TypeORM iniciado com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao iniciar o servidor Express:", err);
  }

  process.on("uncaughtException", (err) => {
    console.error("🔥 Erro não tratado:", err);
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "logo.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const menu = Menu.buildFromTemplate([
    {
      label: "Visão",
      submenu: [
        {
          label: "Abrir Tela Cheia",
          role: "togglefullscreen"
        },
        {
          label: "Recarregar Aplicativo",
          accelerator: "Ctrl+R",
          click: () => {
            mainWindow.loadFile(
              path.join(__dirname, "dist/Angular_Electron/browser/index.html")
            );
          }
        }
      ]
    },
    {
      label: "Ajuda",
      submenu: [
        {
          label: "Manual do Usuário",
          click: () => {
            const { shell } = require("electron");
            const docPath = path.join(__dirname, "documentacao.pdf");
            shell.openPath(docPath);
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
  mainWindow.maximize();

  const indexPath = url.format({
    pathname: path.join(
      __dirname +
      "/dist/Angular_Electron/browser/index.html"
    ),
    protocol: "file:",
    slashes: true,
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:4200"
      : indexPath;

  mainWindow.loadURL(startUrl);
}
electronApp.whenReady().then(createWindow);
