"use strict";

/**
 * VIEW
 * Responsible for: all DOM manipulation, rendering, UI updates
 */
export class View {
  #screens = {};
  #elements = {};
  #audioContext = null;

  constructor() {
    this.#screens = {
      register: document.getElementById("screen-register"),
      start: document.getElementById("screen-start"),
      profile: document.getElementById("screen-profile"),
      quiz:  document.getElementById("screen-quiz"),
      stats: document.getElementById("screen-stats")
    };

    this.#elements = {
      tabRegister:      document.getElementById("tab-register"),
      tabLogin:         document.getElementById("tab-login"),
      panelRegister:    document.getElementById("panel-register"),
      panelLogin:       document.getElementById("panel-login"),
      registerForm:     document.getElementById("register-form"),
      registerName:     document.getElementById("register-name"),
      registerEmail:    document.getElementById("register-email"),
      registerPassword: document.getElementById("register-password"),
      registerError:    document.getElementById("register-error"),
      btnRegister:      document.getElementById("btn-register"),
      loginForm:        document.getElementById("login-form"),
      loginEmail:       document.getElementById("login-email"),
      loginPassword:    document.getElementById("login-password"),
      loginError:       document.getElementById("login-error"),
      btnLogin:         document.getElementById("btn-login"),
      plannerForm:      document.getElementById("planner-form"),
      plannerTitle:     document.getElementById("planner-title"),
      plannerDate:      document.getElementById("planner-date"),
      plannerStatus:    document.getElementById("planner-status"),
      plannerList:      document.getElementById("planner-list"),
      topClockTime:     document.getElementById("top-clock-time"),
      topClockDate:     document.getElementById("top-clock-date"),
      newsStatus:       document.getElementById("news-status"),
      newsList:         document.getElementById("news-list"),
      usersCount:       document.getElementById("users-count"),
      btnProfile:       document.getElementById("btn-profile"),
      profileChipImage: document.getElementById("profile-chip-image"),
      btnProfileBack:   document.getElementById("btn-profile-back"),
      profileForm:      document.getElementById("profile-form"),
      profileImage:     document.getElementById("profile-image"),
      profileName:      document.getElementById("profile-name"),
      profileEmail:     document.getElementById("profile-email"),
      profilePhotoInput:document.getElementById("profile-photo-input"),
      profileStatus:    document.getElementById("profile-status"),
      welcomeUser:      document.getElementById("welcome-user"),
      btnLogout:        document.getElementById("btn-logout"),
      categoryBtns:     document.querySelectorAll(".cat-btn"),
      bestWeb:          document.getElementById("best-web"),
      bestMathe:        document.getElementById("best-mathe"),
      bestNoten:        document.getElementById("best-noten"),
      bestExtern:       document.getElementById("best-extern"),
      resultsRadarChart:document.getElementById("results-radar-chart"),
      resultsAnalysis:  document.getElementById("results-analysis"),
      quizCategoryLabel:document.getElementById("quiz-category-label"),
      quizCounter:      document.getElementById("quiz-counter"),
      qCurrent:         document.getElementById("q-current"),
      qTotal:           document.getElementById("q-total"),
      progressBar:      document.getElementById("progress-bar"),
      questionText:     document.getElementById("question-text"),
      vexflowContainer: document.getElementById("vexflow-container"),
      answersGrid:      document.getElementById("answers-grid"),
      feedbackArea:     document.getElementById("feedback-area"),
      feedbackText:     document.getElementById("feedback-text"),
      btnNext:          document.getElementById("btn-next"),
      btnBack:          document.getElementById("btn-back"),
      loadingArea:      document.getElementById("loading-area"),
      statCorrect:      document.getElementById("stat-correct"),
      statTotal:        document.getElementById("stat-total"),
      statPercent:      document.getElementById("stat-percent"),
      statMessage:      document.getElementById("stat-message"),
      statR:            document.getElementById("stat-r"),
      statW:            document.getElementById("stat-w"),
      btnRestartSame:   document.getElementById("btn-restart-same"),
      btnRestartHome:   document.getElementById("btn-restart-home")
    };
  }

  showScreen(name) {
    Object.values(this.#screens).forEach(s => s?.classList.remove("active"));
    this.#screens[name]?.classList.add("active");
  }

  showLoading(show) {
    this.#elements.loadingArea.style.display = show ? "flex" : "none";
    this.#elements.answersGrid.style.display = show ? "none" : "flex";
    this.#elements.feedbackArea.style.display = "none";
  }

  showRegisterError(message = "") {
    if (!this.#elements.registerError) return;
    this.#elements.registerError.textContent = message;
    this.#elements.registerError.style.display = message ? "block" : "none";
  }

  showLoginError(message = "") {
    if (!this.#elements.loginError) return;
    this.#elements.loginError.textContent = message;
    this.#elements.loginError.style.display = message ? "block" : "none";
  }

  resetRegisterForm() {
    if (!this.#elements.registerForm) return;
    this.#elements.registerForm.reset();
    this.showRegisterError("");
  }

  resetLoginForm() {
    if (!this.#elements.loginForm) return;
    this.#elements.loginForm.reset();
    this.showLoginError("");
  }

  getRegisterData() {
    return {
      name: this.#elements.registerName.value.trim(),
      email: this.#elements.registerEmail.value.trim(),
      password: this.#elements.registerPassword.value
    };
  }

  getLoginData() {
    return {
      email: this.#elements.loginEmail.value.trim(),
      password: this.#elements.loginPassword.value
    };
  }

  showAuthTab(tab) {
    const isRegister = tab === "register";
    this.#elements.tabRegister?.classList.toggle("active", isRegister);
    this.#elements.tabLogin?.classList.toggle("active", !isRegister);
    this.#elements.panelRegister?.classList.toggle("active", isRegister);
    this.#elements.panelLogin?.classList.toggle("active", !isRegister);
  }

  showUser(user) {
    if (!this.#elements.welcomeUser) return;
    this.#elements.welcomeUser.textContent = user?.name
      ? `Willkommen, ${user.name}!`
      : "";
    this.#setProfileImage(this.#elements.profileChipImage, user?.photo);
  }

  showUserCount(count) {
    if (!this.#elements.usersCount) return;
    this.#elements.usersCount.textContent = count;
  }

  showClock({ time, date }) {
    if (this.#elements.topClockTime) {
      this.#elements.topClockTime.textContent = time;
    }
    if (this.#elements.topClockDate) {
      this.#elements.topClockDate.textContent = date;
    }
  }

  showProfile(user, status = "Данные профиля загружены.") {
    if (this.#elements.profileName) {
      this.#elements.profileName.value = user?.name || "";
      this.#elements.profileName.dataset.previousEmail = user?.email || "";
    }
    if (this.#elements.profileEmail) {
      this.#elements.profileEmail.value = user?.email || "";
    }
    this.#setProfileImage(this.#elements.profileImage, user?.photo);
    if (this.#elements.profileStatus) {
      this.#elements.profileStatus.textContent = status;
    }
  }

  getProfileDraft() {
    return {
      previousEmail: this.#elements.profileName?.dataset.previousEmail || "",
      name: this.#elements.profileName?.value.trim() || "",
      email: this.#elements.profileEmail?.value.trim() || "",
      photo: this.#elements.profileImage?.dataset.photo || ""
    };
  }

  setProfileStatus(message) {
    if (this.#elements.profileStatus) {
      this.#elements.profileStatus.textContent = message;
    }
  }

  async readSelectedProfilePhoto() {
    const file = this.#elements.profilePhotoInput?.files?.[0];
    if (!file) return null;

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Фото не удалось загрузить."));
      reader.readAsDataURL(file);
    });
  }

  updateProfilePhoto(photoUrl) {
    this.#setProfileImage(this.#elements.profileImage, photoUrl);
    this.#setProfileImage(this.#elements.profileChipImage, photoUrl);
  }

  renderPlanner(tasks = []) {
    const container = this.#elements.plannerList;
    if (!container) return;

    container.innerHTML = "";

    if (!tasks.length) {
      const empty = document.createElement("p");
      empty.className = "planner-empty";
      empty.textContent = "Noch keine Aufgaben. Fuege deine erste Aufgabe hinzu.";
      container.appendChild(empty);
      return;
    }

    tasks
      .slice()
      .sort((a, b) => {
        if (a.done !== b.done) return a.done - b.done;
        return (a.date || "").localeCompare(b.date || "");
      })
      .forEach(task => {
        const item = document.createElement("article");
        item.className = "planner-item";
        if (task.done) item.classList.add("done");
        item.dataset.taskId = task.id;

        const top = document.createElement("div");
        top.className = "planner-item-top";

        const title = document.createElement("strong");
        title.className = "planner-item-title";
        title.textContent = task.title;

        const meta = document.createElement("span");
        meta.className = "planner-item-date";
        meta.textContent = task.date || "Ohne Datum";

        top.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "planner-item-actions";

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "planner-toggle-btn";
        toggleBtn.dataset.action = "toggle";
        toggleBtn.dataset.taskId = task.id;
        toggleBtn.textContent = task.done ? "Offen" : "Erledigt";

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "planner-delete-btn";
        deleteBtn.dataset.action = "delete";
        deleteBtn.dataset.taskId = task.id;
        deleteBtn.textContent = "Loeschen";

        actions.append(toggleBtn, deleteBtn);
        item.append(top, actions);
        container.appendChild(item);
      });
  }

  showNewsStatus(message) {
    if (this.#elements.newsStatus) {
      this.#elements.newsStatus.textContent = message;
    }
  }

  renderNews(items = []) {
    const container = this.#elements.newsList;
    if (!container) return;

    container.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "news-empty";
      empty.textContent = "Noch keine News verfuegbar.";
      container.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const link = document.createElement("a");
      link.className = "news-item";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const time = document.createElement("span");
      time.className = "news-time";
      time.textContent = item.timeLabel || "--:--";

      const content = document.createElement("div");
      content.className = "news-body";

      const title = document.createElement("strong");
      title.className = "news-title";
      title.textContent = item.title;

      const source = document.createElement("span");
      source.className = "news-source";
      source.textContent = item.source || "Tech";

      content.append(title, source);
      link.append(time, content);
      container.appendChild(link);
    });
  }

  showPlannerStatus(message) {
    if (this.#elements.plannerStatus) {
      this.#elements.plannerStatus.textContent = message;
    }
  }

  resetPlannerForm() {
    this.#elements.plannerForm?.reset();
  }

  getPlannerDraft() {
    return {
      title: this.#elements.plannerTitle?.value.trim() || "",
      date: this.#elements.plannerDate?.value || ""
    };
  }

  renderQuestion(questionData, category, progress) {
    const el = this.#elements;

    el.qCurrent.textContent = progress.current + 1;
    el.qTotal.textContent = progress.total;
    el.quizCategoryLabel.textContent = this.#categoryName(category);
    el.progressBar.style.width = progress.percent + "%";

    el.vexflowContainer.style.display = "none";
    el.vexflowContainer.innerHTML = "";

    if (category === "mathe") {
      el.questionText.innerHTML = `\\(${questionData.question}\\)`;
      if (window.renderMathInElement) {
        renderMathInElement(el.questionText, {
          delimiters: [
            { left: "\\(", right: "\\)", display: false }
          ]
        });
      }
    } else if (category === "noten") {
      el.questionText.innerHTML = `
        <div class="audio-quiz-card">
          <p class="audio-quiz-title">Welcher Ton / Akkord ist das?</p>
          <button type="button" class="audio-play-btn">Ton abspielen</button>
          <p class="audio-quiz-hint">Die Note wird mit VexFlow angezeigt und kann zusaetzlich angehoert werden.</p>
        </div>
      `;

      this.#renderVexflow(questionData.question, el.vexflowContainer);
      el.vexflowContainer.style.display = "block";

      const playBtn = el.questionText.querySelector(".audio-play-btn");
      playBtn?.addEventListener("click", async () => {
        try {
          await this.#playQuestionAudio(questionData.question);
        } catch (error) {
          console.warn("Audio playback failed:", error);
        }
      });

      setTimeout(() => {
        this.#playQuestionAudio(questionData.question).catch(error => {
          console.warn("Initial audio playback failed:", error);
        });
      }, 80);
    } else {
      el.questionText.textContent = questionData.question;
    }

    el.answersGrid.innerHTML = "";

    questionData.answers.forEach(answer => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.style.borderColor = "";
      btn.style.background = "";
      btn.style.color = "";

      if (category === "mathe") {
        btn.innerHTML = `\\(${answer}\\)`;
      } else {
        btn.textContent = answer;
      }

      btn.dataset.answer = answer;
      el.answersGrid.appendChild(btn);
    });

    el.feedbackArea.style.display = "none";
    el.answersGrid.style.display = "flex";
  }

  showFeedback(isCorrect, correctAnswer, selectedAnswer) {
    const el = this.#elements;

    const btns = el.answersGrid.querySelectorAll(".answer-btn");
    btns.forEach(btn => {
      btn.disabled = true;
      btn.classList.remove("selected");
      btn.classList.remove("correct", "wrong");
      btn.style.borderColor = "";
      btn.style.background = "";
      btn.style.color = "";

      if (btn.dataset.answer === correctAnswer) {
        btn.classList.add("correct");
        btn.style.borderColor = "#86C232";
        btn.style.background = "#eef9df";
        btn.style.color = "#86C232";
      }

      if (!isCorrect && btn.dataset.answer === selectedAnswer) {
        btn.classList.add("wrong");
        btn.style.borderColor = "#FF652F";
        btn.style.background = "#ffe4da";
        btn.style.color = "#FF652F";
      }
    });

    el.feedbackText.textContent = isCorrect
      ? "✅ Richtig!"
      : `❌ Falsch! Richtig wäre: ${correctAnswer}`;

    el.feedbackArea.style.display = "flex";
  }

  markSelectedButton(answer) {
    const btns = this.#elements.answersGrid.querySelectorAll(".answer-btn");
    btns.forEach(btn => {
      btn.classList.remove("selected");
      if (btn.dataset.answer === answer) btn.classList.add("selected");
    });
  }

  showStats(stats) {
    const el = this.#elements;
    el.statCorrect.textContent = stats.correct;
    el.statTotal.textContent = stats.total;
    el.statPercent.textContent = stats.percent;
    el.statR.textContent = stats.correct;
    el.statW.textContent = stats.wrong;

    let msg = "";
    if (stats.percent >= 90) msg = "Ausgezeichnet!";
    else if (stats.percent >= 70) msg = "Gut gemacht!";
    else if (stats.percent >= 50) msg = "Weiter üben!";
    else msg = "Nicht aufgeben – nochmal versuchen!";

    el.statMessage.textContent = msg;
  }

  updateProgressBar(percent) {
    this.#elements.progressBar.style.width = percent + "%";
  }

  showBestScores(bestScores) {
    const labels = {
      web: this.#elements.bestWeb,
      mathe: this.#elements.bestMathe,
      noten: this.#elements.bestNoten,
      extern: this.#elements.bestExtern
    };

    Object.entries(labels).forEach(([category, element]) => {
      if (!element) return;

      const best = bestScores[category];
      element.textContent = Number.isFinite(best)
        ? `Bestes Ergebnis: ${best}%`
        : "Noch kein Ergebnis";
    });

    this.#renderResultsRadar(bestScores);
  }

  /* ---------------- FIX ЗДЕСЬ ---------------- */
  onCategorySelect(handler) {
    this.#elements.categoryBtns.forEach(btn => {
      btn.addEventListener("click", () =>
        handler(btn.dataset.category) // <-- исправлено
      );
    });
  }
  /* ------------------------------------------- */

  onAnswerClick(handler) {
    this.#elements.answersGrid.addEventListener("click", e => {
      const btn = e.target.closest(".answer-btn");
      if (btn && !btn.disabled) {
        this.markSelectedButton(btn.dataset.answer);
        handler(btn.dataset.answer);
      }
    });
  }

  onNextQuestion(handler) {
    this.#elements.btnNext?.addEventListener("click", handler);
  }

  onBack(handler) {
    this.#elements.btnBack?.addEventListener("click", handler);
  }

  onRestartSame(handler) {
    this.#elements.btnRestartSame?.addEventListener("click", handler);
  }

  onRestartHome(handler) {
    this.#elements.btnRestartHome?.addEventListener("click", handler);
  }

  onRegister(handler) {
    this.#elements.registerForm?.addEventListener("submit", event => {
      event.preventDefault();
      handler(this.getRegisterData());
    });

    this.#elements.btnRegister?.addEventListener("click", event => {
      event.preventDefault();
      handler(this.getRegisterData());
    });
  }

  onLogin(handler) {
    this.#elements.loginForm?.addEventListener("submit", event => {
      event.preventDefault();
      handler(this.getLoginData());
    });

    this.#elements.btnLogin?.addEventListener("click", event => {
      event.preventDefault();
      handler(this.getLoginData());
    });
  }

  onLogout(handler) {
    this.#elements.btnLogout?.addEventListener("click", handler);
  }

  onOpenProfile(handler) {
    this.#elements.btnProfile?.addEventListener("click", handler);
  }

  onProfileBack(handler) {
    this.#elements.btnProfileBack?.addEventListener("click", handler);
  }

  onProfileSave(handler) {
    this.#elements.profileForm?.addEventListener("submit", event => {
      event.preventDefault();
      handler(this.getProfileDraft());
    });
  }

  onProfilePhotoChange(handler) {
    this.#elements.profilePhotoInput?.addEventListener("change", handler);
  }

  onPlannerAdd(handler) {
    this.#elements.plannerForm?.addEventListener("submit", event => {
      event.preventDefault();
      handler(this.getPlannerDraft());
    });
  }

  onPlannerAction(handler) {
    this.#elements.plannerList?.addEventListener("click", event => {
      const btn = event.target.closest("button[data-action]");
      if (!btn) return;
      handler({
        action: btn.dataset.action,
        taskId: btn.dataset.taskId
      });
    });
  }

  onShowRegister(handler) {
    this.#elements.tabRegister?.addEventListener("click", handler);
  }

  onShowLogin(handler) {
    this.#elements.tabLogin?.addEventListener("click", handler);
  }

  #renderVexflow(noteData, container) {
    if (!window.Vex?.Flow) {
      container.textContent = noteData;
      return;
    }

    const VF = window.Vex.Flow;
    container.innerHTML = "";

    try {
      const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
      renderer.resize(260, 120);

      const context = renderer.getContext();
      const stave = new VF.Stave(10, 20, 240);
      stave.addClef("treble");
      stave.setContext(context).draw();

      const notes = this.#parseVexflowNotes(noteData, VF);
      VF.Formatter.FormatAndDraw(context, stave, notes);
    } catch (error) {
      console.warn("VexFlow rendering failed:", error);
      container.textContent = noteData;
    }
  }

  #parseVexflowNotes(noteData, VF) {
    const normalized = noteData.trim();

    if (normalized.startsWith("(") && normalized.endsWith(")")) {
      const chordKeys = normalized
        .slice(1, -1)
        .trim()
        .split(/\s+/)
        .map(note => this.#toVexflowKey(note));

      return [
        new VF.StaveNote({
          clef: "treble",
          keys: chordKeys,
          duration: "q"
        })
      ];
    }

    return [
      new VF.StaveNote({
        clef: "treble",
        keys: [this.#toVexflowKey(normalized)],
        duration: "q"
      })
    ];
  }

  #toVexflowKey(note) {
    const match = note.match(/^([A-Ha-h])([#b]?)(\d)$/);
    if (!match) {
      throw new Error(`Invalid note format: ${note}`);
    }

    let [, letter, accidental, octave] = match;
    letter = letter.toLowerCase();

    if (letter === "h") {
      letter = "b";
    }

    return `${letter}${accidental}/${octave}`;
  }

  async #playQuestionAudio(noteData) {
    const context = this.#ensureAudioContext();
    if (context.state === "suspended") {
      await context.resume();
    }

    const notes = this.#parseAudioNotes(noteData);
    const now = context.currentTime;
    const duration = 1.1;

    notes.forEach((note, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = this.#noteToFrequency(note);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18 / notes.length, now + 0.04 + index * 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    });
  }

  #ensureAudioContext() {
    if (!this.#audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Audio wird in diesem Browser nicht unterstuetzt.");
      }
      this.#audioContext = new AudioContextClass();
    }

    return this.#audioContext;
  }

  #parseAudioNotes(noteData) {
    const normalized = noteData.trim();

    if (normalized.startsWith("(") && normalized.endsWith(")")) {
      return normalized
        .slice(1, -1)
        .trim()
        .split(/\s+/);
    }

    return [normalized];
  }

  #noteToFrequency(note) {
    const match = note.match(/^([A-Ha-h])([#b]?)(\d)$/);
    if (!match) {
      throw new Error(`Invalid note format: ${note}`);
    }

    let [, letter, accidental, octave] = match;
    letter = letter.toUpperCase();
    octave = Number(octave);

    const semitoneMap = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      H: 11,
      B: 10
    };

    let semitone = semitoneMap[letter];
    if (semitone === undefined) {
      throw new Error(`Unsupported note: ${note}`);
    }

    if (accidental === "#") semitone += 1;
    if (accidental === "b") semitone -= 1;

    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  #renderResultsRadar(bestScores) {
    const chart = this.#elements.resultsRadarChart;
    const analysis = this.#elements.resultsAnalysis;
    if (!chart || !analysis) return;

    const entries = [
      { key: "web", label: "Web", value: Number.isFinite(bestScores.web) ? bestScores.web : 0 },
      { key: "mathe", label: "Mathe", value: Number.isFinite(bestScores.mathe) ? bestScores.mathe : 0 },
      { key: "noten", label: "Noten", value: Number.isFinite(bestScores.noten) ? bestScores.noten : 0 },
      { key: "extern", label: "Extern", value: Number.isFinite(bestScores.extern) ? bestScores.extern : 0 }
    ];

    const hasAnyResult = entries.some(entry => entry.value > 0);
    if (!hasAnyResult) {
      chart.innerHTML = "<div class='results-radar-empty'>Noch keine Ergebnisse fuer die Diagramm-Analyse.</div>";
      analysis.textContent = "Starte mindestens ein Quiz. Danach siehst du hier deine staerksten und schwaechsten Bereiche.";
      return;
    }

    const size = 360;
    const center = size / 2;
    const radius = 118;
    const levels = [25, 50, 75, 100];
    const angleStep = (Math.PI * 2) / entries.length;

    const ringPolygons = levels.map(level => {
      const points = entries.map((_, index) => {
        const angle = -Math.PI / 2 + angleStep * index;
        const levelRadius = radius * (level / 100);
        return this.#polarToPoint(center, center, levelRadius, angle);
      });

      return `<polygon class="radar-ring" points="${points.map(point => `${point.x},${point.y}`).join(" ")}"></polygon>`;
    }).join("");

    const axes = entries.map((entry, index) => {
      const angle = -Math.PI / 2 + angleStep * index;
      const axisPoint = this.#polarToPoint(center, center, radius, angle);
      const labelPoint = this.#polarToPoint(center, center, radius + 28, angle);
      return `
        <line class="radar-axis" x1="${center}" y1="${center}" x2="${axisPoint.x}" y2="${axisPoint.y}"></line>
        <text class="radar-label" x="${labelPoint.x}" y="${labelPoint.y}">${entry.label}</text>
      `;
    }).join("");

    const scorePoints = entries.map((entry, index) => {
      const angle = -Math.PI / 2 + angleStep * index;
      return this.#polarToPoint(center, center, radius * (entry.value / 100), angle);
    });

    const scorePolygon = `<polygon class="radar-shape" points="${scorePoints.map(point => `${point.x},${point.y}`).join(" ")}"></polygon>`;
    const scoreDots = scorePoints.map((point, index) => `
      <circle class="radar-dot" cx="${point.x}" cy="${point.y}" r="4"></circle>
      <text class="radar-value" x="${point.x}" y="${point.y - 10}">${entries[index].value}</text>
    `).join("");

    const levelLabels = levels.map(level => {
      const y = center - radius * (level / 100);
      return `<text class="radar-level-label" x="${center + 8}" y="${y - 4}">${level}</text>`;
    }).join("");

    chart.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" class="results-radar-svg" role="img" aria-label="Radar-Diagramm deiner Quiz-Ergebnisse">
        ${ringPolygons}
        ${axes}
        ${levelLabels}
        ${scorePolygon}
        ${scoreDots}
      </svg>
    `;

    analysis.textContent = this.#buildResultsAnalysis(entries);
  }

  #buildResultsAnalysis(entries) {
    const sorted = [...entries].sort((a, b) => b.value - a.value);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const average = Math.round(entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length);

    if (entries.every(entry => entry.value >= 70)) {
      return `Sehr starkes Gesamtbild: Dein Durchschnitt liegt bei ${average}%. ${strongest.label} ist aktuell dein bester Bereich.`;
    }

    if (strongest.value === weakest.value) {
      return `Deine Ergebnisse sind aktuell sehr ausgeglichen. Der Durchschnitt ueber alle 4 Kategorien liegt bei ${average}%.`;
    }

    return `${strongest.label} ist aktuell deine staerkste Kategorie mit ${strongest.value}%. Am meisten Potenzial gibt es bei ${weakest.label} mit ${weakest.value}%. Durchschnitt: ${average}%.`;
  }

  #polarToPoint(centerX, centerY, radius, angle) {
    return {
      x: Number((centerX + Math.cos(angle) * radius).toFixed(2)),
      y: Number((centerY + Math.sin(angle) * radius).toFixed(2))
    };
  }

  #categoryName(cat) {
    const names = {
      web: "Web & Internet",
      mathe: "Mathematik",
      noten: "Noten",
      extern: "Online-Quiz"
    };
    return names[cat] || cat;
  }

  #setProfileImage(element, photoUrl) {
    if (!element) return;
    const fallback = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' rx='24' fill='%23f1e4d0'/><circle cx='60' cy='44' r='22' fill='%23ddc29b'/><path d='M25 98c7-18 23-28 35-28s28 10 35 28' fill='%23ddc29b'/></svg>";
    element.src = photoUrl || fallback;
    element.dataset.photo = photoUrl || "";
  }
}
