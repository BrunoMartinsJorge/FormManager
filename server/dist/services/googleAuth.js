"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCOPES = exports.oAuth2Client = void 0;
exports.generateAuthUrl = generateAuthUrl;
exports.storeTokens = storeTokens;
exports.getAuthClient = getAuthClient;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const data_source_1 = require("../database/data-source");
const Token_1 = require("../models/Token");
const devPath = path_1.default.join(__dirname, "..", "..", "client_secret.json");
const prodPath = path_1.default.join(process.resourcesPath, "client_secret.json");
const keyPath = fs_1.default.existsSync(devPath) ? devPath : prodPath;
const keys = JSON.parse(fs_1.default.readFileSync(keyPath, "utf-8"));
exports.oAuth2Client = new googleapis_1.google.auth.OAuth2(keys.web.client_id, keys.web.client_secret, keys.web.redirect_uris[0]);
exports.SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/forms.responses.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
];
function generateAuthUrl() {
    return exports.oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: exports.SCOPES,
    });
}
async function getStoredTokens() {
    return await data_source_1.AppDataSource.getRepository(Token_1.Token).findOne({
        where: {},
        order: { id: "DESC" },
    });
}
async function storeTokens(tokens, email) {
    // ⚠️ Define credenciais antes de chamar userinfo
    exports.oAuth2Client.setCredentials(tokens);
    // Busca dados do usuário autenticado
    const oauth2 = googleapis_1.google.oauth2({ auth: exports.oAuth2Client, version: "v2" });
    const { data: userInfo } = await oauth2.userinfo.get();
    const repo = data_source_1.AppDataSource.getRepository(Token_1.Token);
    const token = repo.create({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        email: email ?? userInfo.email ?? null,
    });
    await repo.save(token);
}
async function getAuthClient() {
    const row = await getStoredTokens();
    if (row) {
        exports.oAuth2Client.setCredentials({
            access_token: row.accessToken,
            refresh_token: row.refreshToken,
            expiry_date: row.expiryDate,
        });
        if (Date.now() > row.expiryDate) {
            const { credentials } = await exports.oAuth2Client.refreshAccessToken();
            await storeTokens(credentials);
            exports.oAuth2Client.setCredentials(credentials);
        }
    }
    return exports.oAuth2Client;
}
