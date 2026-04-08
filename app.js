"use strict";

import { Model } from "./model.js";
import { View } from "./view.js";
import { Presenter } from "./presenter.js";

// Register Service Worker for PWA offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(reg => console.log("Service Worker registriert:", reg.scope))
      .catch(err => console.warn("Service Worker Fehler:", err));
  });
}

function setupRegistrationFallback() {
  const form = document.getElementById("register-form");
  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const errorEl = document.getElementById("register-error");
  const welcomeEl = document.getElementById("welcome-user");
  const registerScreen = document.getElementById("screen-register");
  const startScreen = document.getElementById("screen-start");

  if (!form || form.dataset.fallbackBound === "true") return;
  form.dataset.fallbackBound = "true";

  form.addEventListener("submit", event => {
    if (window.__lernprogrammPresenterHandledRegister === true) return;

    event.preventDefault();

    const name = nameInput?.value.trim() || "";
    const email = (emailInput?.value.trim() || "").toLowerCase();
    const password = passwordInput?.value || "";

    if (!name || !email || !password) {
      if (errorEl) {
        errorEl.textContent = "Bitte alle Felder ausfuellen.";
        errorEl.style.display = "block";
      }
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      if (errorEl) {
        errorEl.textContent = "Bitte eine gueltige E-Mail-Adresse eingeben.";
        errorEl.style.display = "block";
      }
      return;
    }

    if (password.length < 6) {
      if (errorEl) {
        errorEl.textContent = "Das Passwort muss mindestens 6 Zeichen haben.";
        errorEl.style.display = "block";
      }
      return;
    }

    const user = {
      name,
      email,
      password,
      registeredAt: new Date().toISOString()
    };

    const accounts = (() => {
      try {
        return JSON.parse(localStorage.getItem("lernprogramm-accounts")) || [];
      } catch {
        return [];
      }
    })();

    if (accounts.some(account => String(account?.email || "").toLowerCase() === email)) {
      if (errorEl) {
        errorEl.textContent = "Ein Benutzer mit dieser E-Mail existiert bereits.";
        errorEl.style.display = "block";
      }
      return;
    }

    accounts.push(user);

    localStorage.setItem("lernprogramm-account", JSON.stringify(user));
    localStorage.setItem("lernprogramm-accounts", JSON.stringify(accounts));
    localStorage.setItem("lernprogramm-user", JSON.stringify(user));

    if (errorEl) {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }

    if (welcomeEl) {
      welcomeEl.textContent = `Willkommen, ${name}!`;
    }

    registerScreen?.classList.remove("active");
    startScreen?.classList.add("active");
    alert(`Registrierung erfolgreich! Willkommen, ${name}.`);
  });
}

function setupAuthTabsFallback() {
  const tabRegister = document.getElementById("tab-register");
  const tabLogin = document.getElementById("tab-login");
  const panelRegister = document.getElementById("panel-register");
  const panelLogin = document.getElementById("panel-login");

  const showTab = (tab) => {
    const isRegister = tab === "register";
    tabRegister?.classList.toggle("active", isRegister);
    tabLogin?.classList.toggle("active", !isRegister);
    panelRegister?.classList.toggle("active", isRegister);
    panelLogin?.classList.toggle("active", !isRegister);
  };

  tabRegister?.addEventListener("click", () => showTab("register"));
  tabLogin?.addEventListener("click", () => showTab("login"));
}

try {
  const model = new Model();
  const view = new View();
  const presenter = new Presenter(model, view);
  window.__lernprogrammPresenterReady = true;
} catch (error) {
  console.error("Bootstrap Fehler:", error);
}

setupRegistrationFallback();
setupAuthTabsFallback();

console.log("Lernprogramm DKU gestartet – HTW Dresden 2026");
