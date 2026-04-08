"use strict";

export class Storage {
  static #KEY = "lernprogramm-history";
  static #ACCOUNT_KEY = "lernprogramm-account";
  static #ACCOUNTS_KEY = "lernprogramm-accounts";
  static #USER_KEY = "lernprogramm-user";
  static #PLANNER_KEY = "lernprogramm-planner";

  static #normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  static saveResult(category, stats) {
    const history = this.getHistory();
    history.push({
      category,
      correct: stats.correct,
      total: stats.total,
      percent: stats.percent,
      date: new Date().toLocaleDateString("de-DE")
    });
    localStorage.setItem(this.#KEY, JSON.stringify(history));
  }

  static getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.#KEY)) || [];
    } catch {
      return [];
    }
  }

  static clearHistory() {
    localStorage.removeItem(this.#KEY);
  }

  static getBestScore(category) {
    const history = this.getHistory().filter(h => h.category === category);
    if (!history.length) return null;
    return Math.max(...history.map(h => h.percent));
  }

  static getAccounts() {
    try {
      const accounts = JSON.parse(localStorage.getItem(this.#ACCOUNTS_KEY));
      if (Array.isArray(accounts)) {
        return accounts
          .filter(account => account && typeof account === "object")
          .map(account => ({
            ...account,
            email: this.#normalizeEmail(account.email)
          }));
      }
    } catch {}

    const legacy = this.getAccount();
    return legacy ? [legacy] : [];
  }

  static saveAccount(user) {
    const normalizedUser = {
      ...user,
      email: this.#normalizeEmail(user.email)
    };

    localStorage.setItem(this.#ACCOUNT_KEY, JSON.stringify(normalizedUser));
    const accounts = this.getAccounts().filter(account => account.email !== normalizedUser.email);
    accounts.push(normalizedUser);
    localStorage.setItem(this.#ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  static getAccount() {
    try {
      const account = JSON.parse(localStorage.getItem(this.#ACCOUNT_KEY));
      if (!account) return null;
      return {
        ...account,
        email: this.#normalizeEmail(account.email)
      };
    } catch {
      return null;
    }
  }

  static saveUser(user) {
    localStorage.setItem(this.#USER_KEY, JSON.stringify({
      ...user,
      email: this.#normalizeEmail(user.email)
    }));
  }

  static getUser() {
    try {
      const user = JSON.parse(localStorage.getItem(this.#USER_KEY));
      if (!user) return null;
      return {
        ...user,
        email: this.#normalizeEmail(user.email)
      };
    } catch {
      return null;
    }
  }

  static clearUser() {
    localStorage.removeItem(this.#USER_KEY);
  }

  static getAccountByEmail(email) {
    const normalizedEmail = this.#normalizeEmail(email);
    return this.getAccounts().find(user => user.email === normalizedEmail) || null;
  }

  static findUserByCredentials(email, password) {
    const normalizedEmail = this.#normalizeEmail(email);
    return this.getAccounts().find(user =>
      user.email === normalizedEmail && String(user.password || "") === String(password || "")
    ) || null;
  }

  static updateAccount(updatedUser, previousEmail = updatedUser.email) {
    const normalizedPreviousEmail = this.#normalizeEmail(previousEmail);
    const existingAccount = this.getAccountByEmail(previousEmail) || this.getAccountByEmail(updatedUser.email);
    const normalizedUser = {
      ...existingAccount,
      ...updatedUser,
      email: this.#normalizeEmail(updatedUser.email),
      password: updatedUser.password || existingAccount?.password || "",
      registeredAt: updatedUser.registeredAt || existingAccount?.registeredAt || new Date().toISOString()
    };

    const accounts = this.getAccounts()
      .filter(account => account.email !== normalizedPreviousEmail)
      .filter(account => account.email !== normalizedUser.email);

    accounts.push(normalizedUser);
    localStorage.setItem(this.#ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.setItem(this.#ACCOUNT_KEY, JSON.stringify(normalizedUser));
  }

  static accountExists(email) {
    const normalizedEmail = this.#normalizeEmail(email);
    return this.getAccounts().some(user => user.email === normalizedEmail);
  }

  static getUserCount() {
    return this.getAccounts().length;
  }

  static getPlannerMap() {
    try {
      return JSON.parse(localStorage.getItem(this.#PLANNER_KEY)) || {};
    } catch {
      return {};
    }
  }

  static getUserPlanner(email) {
    const planner = this.getPlannerMap();
    return planner[email] || [];
  }

  static saveUserPlanner(email, tasks) {
    const planner = this.getPlannerMap();
    planner[email] = tasks;
    localStorage.setItem(this.#PLANNER_KEY, JSON.stringify(planner));
  }
}
