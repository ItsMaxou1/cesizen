// Tests de bout en bout (E2E) du back-office CESIZen avec Selenium WebDriver.
// Ils pilotent un vrai navigateur Chrome (sans interface en CI) contre l'application démarrée
// (front + API + base de données).
//
// Variables d'environnement :
//   E2E_BASE_URL     URL du back-office            (défaut http://localhost:4173)
//   E2E_API_URL      URL de l'API                  (défaut http://localhost:3001)
//   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD  compte admin créé par le seed de l'API
//   E2E_HEADLESS     "false" pour voir le navigateur en local
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:4173';
const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin.e2e@cesizen.test';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'MotDePasseE2E!2026';
const TIMEOUT = 10000;

let driver;

before(async () => {
  const options = new chrome.Options();
  if (process.env.E2E_HEADLESS !== 'false') options.addArguments('--headless=new');
  options.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--window-size=1366,900');
  driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
});

after(async () => {
  if (driver) await driver.quit();
});

// Capture d'écran en cas d'échec (publiée comme artefact par la CI)
const screenshotOnFailure = async (name, fn) => {
  try {
    await fn();
  } catch (error) {
    fs.mkdirSync('e2e-screenshots', { recursive: true });
    const png = await driver.takeScreenshot();
    fs.writeFileSync(`e2e-screenshots/${name}.png`, png, 'base64');
    throw error;
  }
};

const viderSession = async () => {
  await driver.get(BASE_URL + '/login');
  await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
};

const seConnecter = async (email, motDePasse) => {
  await driver.get(BASE_URL + '/login');
  const champEmail = await driver.wait(until.elementLocated(By.css('input[type="email"]')), TIMEOUT);
  await champEmail.clear();
  await champEmail.sendKeys(email);
  const champMdp = await driver.findElement(By.css('input[type="password"]'));
  await champMdp.clear();
  await champMdp.sendKeys(motDePasse);
  await driver.findElement(By.css('button[type="submit"]')).click();
};

test('un visiteur non connecté est redirigé vers la page de connexion', () =>
  screenshotOnFailure('redirection-login', async () => {
    await viderSession();
    await driver.get(BASE_URL + '/categories');
    await driver.wait(until.urlContains('/login'), TIMEOUT);
    const titre = await driver.findElement(By.css('h1')).getText();
    assert.match(titre, /CESIZen - Administration/);
  }));

test('un mauvais mot de passe affiche un message d\'erreur', () =>
  screenshotOnFailure('mauvais-mot-de-passe', async () => {
    await viderSession();
    await seConnecter(ADMIN_EMAIL, 'mauvais-mot-de-passe');
    const erreur = await driver.wait(until.elementLocated(By.css('.erreur')), TIMEOUT);
    assert.ok((await erreur.getText()).length > 0);
    assert.match(await driver.getCurrentUrl(), /\/login/);
  }));

test('un utilisateur sans rôle administrateur est refusé', () =>
  screenshotOnFailure('refus-non-admin', async () => {
    const email = `user.${Date.now()}@cesizen.test`;
    const motDePasse = 'UtilisateurE2E!2026';
    const res = await fetch(API_URL + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mot_de_passe: motDePasse, nom: 'Test', prenom: 'Utilisateur' }),
    });
    assert.ok(res.ok, `inscription impossible (HTTP ${res.status})`);
    await viderSession();
    await seConnecter(email, motDePasse);
    const erreur = await driver.wait(until.elementLocated(By.css('.erreur')), TIMEOUT);
    assert.match(await erreur.getText(), /administrateur/);
  }));

test('l\'administrateur se connecte et accède au tableau de bord', () =>
  screenshotOnFailure('connexion-admin', async () => {
    await viderSession();
    await seConnecter(ADMIN_EMAIL, ADMIN_PASSWORD);
    const menu = await driver.wait(until.elementLocated(By.css('.sidebar')), TIMEOUT);
    assert.match(await menu.getText(), /Bonjour/);
    assert.match(await menu.getText(), /Catégories/);
  }));

test('l\'administrateur crée une catégorie qui apparaît dans la liste', () =>
  screenshotOnFailure('creation-categorie', async () => {
    const nom = `Catégorie E2E ${Date.now()}`;
    await driver.findElement(By.linkText('Catégories')).click();
    await driver.wait(until.elementLocated(By.css('input[placeholder="Nom"]')), TIMEOUT);
    await driver.findElement(By.css('input[placeholder="Nom"]')).sendKeys(nom);
    await driver.findElement(By.css('input[placeholder="Description"]')).sendKeys('Créée par Selenium');
    await driver.findElement(By.xpath('//button[normalize-space()="Ajouter"]')).click();
    const cellule = await driver.wait(
      until.elementLocated(By.xpath(`//td[normalize-space()="${nom}"]`)),
      TIMEOUT
    );
    assert.equal(await cellule.getText(), nom);
  }));

test('l\'administrateur se déconnecte', () =>
  screenshotOnFailure('deconnexion', async () => {
    await driver.findElement(By.xpath('//button[normalize-space()="Se déconnecter"]')).click();
    await driver.get(BASE_URL + '/');
    await driver.wait(until.urlContains('/login'), TIMEOUT);
  }));
