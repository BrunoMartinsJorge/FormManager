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
        { label: "Tela cheia", role: "togglefullscreen" },
        {
          label: "Recarregar",
          accelerator: "Ctrl+R",
          click: () => {
            mainWindow.loadURL("http://localhost:4200");
          },
        },
      ],
    },
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
