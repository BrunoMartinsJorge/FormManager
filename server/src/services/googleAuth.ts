import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../database/data-source";
import { Token } from "../models/Token";

const devPath = path.join(__dirname, "..", "..", "client_secret.json");
const prodPath = path.join(process.resourcesPath, "client_secret.json");
const keyPath = fs.existsSync(devPath) ? devPath : prodPath;
const keys = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

export const oAuth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
);

export const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://https://www.googleapis.com/auth/drive"
];

export function generateAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

async function getStoredTokens(): Promise<Token | null> {
  return await AppDataSource.getRepository(Token).findOne({
    where: {},
    order: { id: "DESC" },
  });
}

export async function storeTokens(tokens: any, email?: string): Promise<void> {
  // ⚠️ Define credenciais antes de chamar userinfo
  oAuth2Client.setCredentials(tokens);

  // Busca dados do usuário autenticado
  const oauth2 = google.oauth2({ auth: oAuth2Client, version: "v2" });
  const { data: userInfo } = await oauth2.userinfo.get();

  const repo = AppDataSource.getRepository(Token);
  const token = repo.create({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date,
    email: email ?? userInfo.email ?? null,
  });

  await repo.save(token);
}

export async function getAuthClient() {
  const row = await getStoredTokens();
  if (row) {
    oAuth2Client.setCredentials({
      access_token: row.accessToken,
      refresh_token: row.refreshToken,
      expiry_date: row.expiryDate,
    });

    if (Date.now() > row.expiryDate) {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      await storeTokens(credentials);
      oAuth2Client.setCredentials(credentials);
    }
  }

  return oAuth2Client;
}
