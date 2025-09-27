const { app: electronApp, BrowserWindow, Menu } = require("electron");
const path = require("path");
const url = require("url");
const { startExpress } = require("./server/expressServer");
const db = require("./server/db");

let mainWindow;

async function createWindow() {
  await startExpress();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "logo.ico"),
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  const template = [
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
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.maximize();

  const indexPath = url.format({
    pathname: path.join(__dirname, "dist/Angular_Electron/browser/index.html"),
    protocol: "file:",
    slashes: true,
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:4200"
      : indexPath;

  mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === "development")
    mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

electronApp.whenReady().then(createWindow);

electronApp.on("window-all-closed", () => {
  if (process.platform !== "darwin") electronApp.quit();
});

electronApp.on("before-quit", () => db.close());
