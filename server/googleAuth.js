const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const devPath = path.join(__dirname, '..', 'client_secret.json');const prodPath = path.join(process.resourcesPath, 'client_secret.json');
const keyPath = fs.existsSync(devPath) ? devPath : prodPath;
const keys = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

const oAuth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
);

const SCOPES = [
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/forms",
  "https://www.googleapis.com/auth/script.projects",
  "https://www.googleapis.com/auth/script.scriptapp",
];

function getStoredTokens() {
  return db.prepare("SELECT * FROM tokens ORDER BY id DESC LIMIT 1").get();
}

function storeTokens(tokens) {
  db.prepare(
    "INSERT INTO tokens (accessToken, refreshToken, expiryDate) VALUES (?, ?, ?)"
  ).run(tokens.access_token, tokens.refresh_token, tokens.expiry_date);
}

async function getAuthClient() {
  const row = getStoredTokens();

  if (row) {
    oAuth2Client.setCredentials({
      access_token: row.accessToken,
      refresh_token: row.refreshToken,
      expiry_date: row.expiryDate,
    });

    if (Date.now() > row.expiryDate) {
      const newTokens = await oAuth2Client.refreshAccessToken();
      const creds = newTokens.credentials;
      storeTokens(creds);
      oAuth2Client.setCredentials(creds);
    }
  }

  return oAuth2Client;
}

module.exports = { oAuth2Client, SCOPES, getAuthClient };
