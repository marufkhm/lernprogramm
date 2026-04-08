"use strict";

import { Storage } from "./storage.js";

/**
 * PRESENTER
 * Responsible for: coordinating Model and View, handling user interactions
 */
export class Presenter {
  #model;
  #view;
  #currentCategory = null;
  #tasks = [];
  #clockTimer = null;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
    this.#bindEvents();
    this.#bootstrap();
  }

  #bindEvents() {
    this.#view.onShowRegister(() => this.#showRegisterTab());
    this.#view.onShowLogin(() => this.#showLoginTab());
    this.#view.onRegister(data => this.#register(data));
    this.#view.onLogin(data => this.#login(data));
    this.#view.onOpenProfile(() => this.#openProfile());
    this.#view.onProfileBack(() => this.#goHome());
    this.#view.onProfileSave(draft => this.#saveProfile(draft));
    this.#view.onProfilePhotoChange(() => this.#handleProfilePhotoChange());
    this.#view.onPlannerAdd(draft => this.#addTask(draft));
    this.#view.onPlannerAction(payload => this.#handlePlannerAction(payload));
    this.#view.onLogout(() => this.#logout());
    this.#view.onCategorySelect(cat => this.#startQuiz(cat));
    this.#view.onAnswerClick(answer => this.#handleAnswer(answer));
    this.#view.onNextQuestion(() => this.#nextQuestion());
    this.#view.onBack(() => this.#goHome());
    this.#view.onRestartSame(() => this.#startQuiz(this.#currentCategory));
    this.#view.onRestartHome(() => this.#goHome());
  }

  #bootstrap() {
    this.#updateBestScores();
    this.#updateUserCount();
    this.#startClock();
    this.#loadNews();
    const user = Storage.getUser();

    if (user) {
      if (user.password) {
        Storage.saveAccount(user);
      }
      this.#view.showUser(user);
      this.#view.showProfile(user);
      this.#loadPlanner();
      this.#view.showScreen("start");
      return;
    }

    this.#view.resetRegisterForm();
    this.#view.resetLoginForm();
    this.#view.showAuthTab("register");
    this.#view.showScreen("register");
  }

  #showRegisterTab() {
    this.#view.showRegisterError("");
    this.#view.showLoginError("");
    this.#view.showAuthTab("register");
  }

  #showLoginTab() {
    this.#view.showRegisterError("");
    this.#view.showLoginError("");
    this.#view.showAuthTab("login");
  }

  #register(data) {
    window.__lernprogrammPresenterHandledRegister = true;

    if (!data.name || !data.email || !data.password) {
      this.#view.showRegisterError("Bitte alle Felder ausfuellen.");
      window.__lernprogrammPresenterHandledRegister = false;
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      this.#view.showRegisterError("Bitte eine gueltige E-Mail-Adresse eingeben.");
      window.__lernprogrammPresenterHandledRegister = false;
      return;
    }

    if (data.password.length < 6) {
      this.#view.showRegisterError("Das Passwort muss mindestens 6 Zeichen haben.");
      window.__lernprogrammPresenterHandledRegister = false;
      return;
    }

    if (Storage.accountExists(data.email)) {
      this.#view.showRegisterError("Ein Benutzer mit dieser E-Mail existiert bereits.");
      window.__lernprogrammPresenterHandledRegister = false;
      return;
    }

    const user = {
      name: data.name,
      email: data.email,
      password: data.password,
      registeredAt: new Date().toISOString()
    };

    Storage.saveAccount(user);
    Storage.saveUser(user);
    this.#view.showUser(user);
    this.#view.showProfile(user);
    this.#updateBestScores();
    this.#updateUserCount();
    this.#loadPlanner();
    this.#view.showRegisterError("");
    this.#view.resetLoginForm();
    alert(`Registrierung erfolgreich! Willkommen, ${user.name}.`);
    this.#view.showScreen("start");
  }

  #login(data) {
    if (!data.email || !data.password) {
      this.#view.showLoginError("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    const user = Storage.findUserByCredentials(data.email, data.password);
    if (!user) {
      this.#view.showLoginError("E-Mail oder Passwort ist falsch.");
      return;
    }

    this.#view.showLoginError("");
    Storage.saveUser(user);
    this.#view.showUser(user);
    this.#view.showProfile(user);
    this.#updateBestScores();
    this.#updateUserCount();
    this.#loadPlanner();
    alert(`Login erfolgreich! Willkommen zurueck, ${user.name}.`);
    this.#view.showScreen("start");
  }

  #logout() {
    Storage.clearUser();
    this.#view.resetRegisterForm();
    this.#view.resetLoginForm();
    this.#view.showUser(null);
    this.#view.showAuthTab("login");
    this.#view.showScreen("register");
  }

  async #startQuiz(category) {
    this.#currentCategory = category;
    this.#view.showScreen("quiz");
    this.#view.showLoading(true);
    try {
      await this.#model.loadCategory(category);
      const progress = this.#model.getProgress();
      if (progress.total === 0) {
        throw new Error("Keine Fragen fuer diese Kategorie gefunden.");
      }
      this.#view.showLoading(false);
      this.#showCurrentQuestion();
    } catch (e) {
      alert("Fehler beim Laden der Fragen: " + e.message);
      this.#goHome();
    }
  }

  #showCurrentQuestion() {
    if (this.#model.isFinished()) {
      this.#showStats();
      return;
    }
    const question = this.#model.getCurrentQuestion();
    const progress = this.#model.getProgress();
    this.#view.renderQuestion(question, this.#currentCategory, progress);
    this.#view.updateProgressBar(progress.percent);
  }

  async #handleAnswer(answer) {
    const q = this.#model.getCurrentQuestion();
    let isCorrect;
    if (q.extern) {
      this.#view.showLoading(true);
      isCorrect = await this.#model.checkAnswerExtern(answer);
      this.#view.showLoading(false);
    } else {
      isCorrect = this.#model.checkAnswer(answer);
    }
    const progress = this.#model.getProgress();
    this.#view.showFeedback(isCorrect, q.correctAnswer, answer, this.#currentCategory);
    this.#view.updateProgressBar(progress.percent);
  }

  #nextQuestion() {
    if (this.#model.isFinished()) {
      this.#showStats();
    } else {
      this.#showCurrentQuestion();
    }
  }

  #showStats() {
    const stats = this.#model.getStats();
    Storage.saveResult(this.#currentCategory, stats); // ← сохраняем результат
    this.#updateBestScores();
    this.#view.showStats(stats);
    this.#view.showScreen("stats");
  }

  #goHome() {
    const user = Storage.getUser();
    this.#view.showUser(user);
    this.#view.showProfile(user);
    this.#updateBestScores();
    this.#updateUserCount();
    this.#loadPlanner();
    this.#loadNews();
    this.#view.showScreen("start");
  }

  #updateBestScores() {
    this.#view.showBestScores({
      web: Storage.getBestScore("web"),
      mathe: Storage.getBestScore("mathe"),
      noten: Storage.getBestScore("noten"),
      extern: Storage.getBestScore("extern")
    });
  }

  #updateUserCount() {
    this.#view.showUserCount(Storage.getUserCount());
  }

  #openProfile() {
    const user = Storage.getUser();
    if (!user) return;
    this.#view.showProfile(user);
    this.#view.showScreen("profile");
  }

  #saveProfile(draft) {
    const currentUser = Storage.getUser();
    if (!currentUser) return;

    if (!draft.name || !draft.email) {
      this.#view.setProfileStatus("Заполни имя и почту.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(draft.email)) {
      this.#view.setProfileStatus("Укажи корректную почту.");
      return;
    }

    if (draft.email !== draft.previousEmail && Storage.accountExists(draft.email)) {
      this.#view.setProfileStatus("Пользователь с такой почтой уже существует.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: draft.name,
      email: draft.email,
      photo: draft.photo || ""
    };

    Storage.updateAccount(updatedUser, draft.previousEmail || currentUser.email);
    Storage.saveUser(updatedUser);
    this.#view.showUser(updatedUser);
    this.#view.showProfile(updatedUser, "Профиль сохранён.");
    this.#updateUserCount();
    this.#loadPlanner();
  }

  async #handleProfilePhotoChange() {
    try {
      const photo = await this.#view.readSelectedProfilePhoto();
      if (!photo) return;
      this.#view.updateProfilePhoto(photo);
      this.#view.setProfileStatus("Фото загружено. Не забудь сохранить профиль.");
    } catch (error) {
      this.#view.setProfileStatus(error.message);
    }
  }

  #addTask(draft) {
    if (!draft.title) {
      this.#view.showPlannerStatus("Bitte zuerst eine Aufgabe eingeben.");
      return;
    }

    const task = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: draft.title,
      date: draft.date || "",
      done: false,
      createdAt: new Date().toISOString()
    };

    this.#tasks = [task, ...this.#tasks];
    this.#persistPlanner();
    this.#view.renderPlanner(this.#tasks);
    this.#view.resetPlannerForm();
    this.#view.showPlannerStatus("Aufgabe hinzugefuegt.");
  }

  #handlePlannerAction({ action, taskId }) {
    if (!taskId) return;

    if (action === "toggle") {
      this.#tasks = this.#tasks.map(task =>
        task.id === taskId ? { ...task, done: !task.done } : task
      );
      this.#persistPlanner();
      this.#view.renderPlanner(this.#tasks);
      this.#view.showPlannerStatus("Aufgabe aktualisiert.");
      return;
    }

    if (action === "delete") {
      this.#tasks = this.#tasks.filter(task => task.id !== taskId);
      this.#persistPlanner();
      this.#view.renderPlanner(this.#tasks);
      this.#view.showPlannerStatus("Aufgabe geloescht.");
    }
  }

  #loadPlanner() {
    const user = Storage.getUser();
    if (!user) return;
    this.#tasks = Storage.getUserPlanner(user.email);
    this.#view.renderPlanner(this.#tasks);
    this.#view.showPlannerStatus(this.#tasks.length
      ? "Plane deinen Tag und hake erledigte Aufgaben ab."
      : "Noch keine Aufgaben.");
  }

  #persistPlanner() {
    const user = Storage.getUser();
    if (!user) return;
    Storage.saveUserPlanner(user.email, this.#tasks);
  }

  async #loadNews() {
    this.#view.showNewsStatus("News werden geladen...");

    const news = await this.#model.fetchTechNews();
    this.#view.renderNews(news);
    this.#view.showNewsStatus("Neueste Meldungen aus der IT-Welt.");
  }

  #startClock() {
    const updateClock = () => {
      const now = new Date();
      this.#view.showClock({
        time: now.toLocaleTimeString("de-DE", {
          timeZone: "Asia/Almaty",
          hour: "2-digit",
          minute: "2-digit"
        }),
        date: now.toLocaleDateString("de-DE", {
          timeZone: "Asia/Almaty",
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        })
      });
    };

    updateClock();

    if (this.#clockTimer) {
      clearInterval(this.#clockTimer);
    }

    this.#clockTimer = setInterval(updateClock, 1000);
  }
}
