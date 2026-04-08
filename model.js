"use strict";

/**
 * MODEL
 * Responsible for: loading questions, quiz state, statistics
 */
export class Model {
  #questions = [];
  #currentIndex = 0;
  #correctCount = 0;
  #wrongCount = 0;
  #category = null;
  #totalQuestions = 10;
  #newsApiBase = "https://hacker-news.firebaseio.com/v0";

  // Сервер преподавателя
  #apiBase = "https://vogtserver.de:8888/api";
  #auth = btoa("marufkhm3@gmail.com:maruf123");

  // Твои вопросы на сервере (ID которые вернул сервер при загрузке)
  #myQuizIds = [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86];

  async loadCategory(category) {
    this.#category = category;
    this.#currentIndex = 0;
    this.#correctCount = 0;
    this.#wrongCount = 0;

    if (category === "extern") {
      this.#questions = await this.#fetchExternalQuestions();
    } else {
      const data = await this.#fetchLocalQuestions();
      const pool = data[category] || [];
      this.#questions = this.#shuffle([...pool]).slice(0, this.#totalQuestions);
    }
  }

  async #fetchLocalQuestions() {
    const resp = await fetch("data/fragen.json");
    if (!resp.ok) throw new Error("Fragen konnten nicht geladen werden.");
    return resp.json();
  }

  async #fetchExternalQuestions() {
    try {
      // Берём случайные 10 ID из твоих вопросов
      const selectedIds = this.#shuffle([...this.#myQuizIds]).slice(0, this.#totalQuestions);

      // Загружаем каждый вопрос по ID
      const promises = selectedIds.map(id =>
        fetch(`${this.#apiBase}/quizzes/${id}`, {
          headers: { "Authorization": "Basic " + this.#auth }
        }).then(r => r.ok ? r.json() : null)
      );

      const results = await Promise.all(promises);
      const quizzes = results.filter(q => q !== null);

      if (quizzes.length === 0) throw new Error("Keine Fragen erhalten");

      // Преобразуем формат сервера → формат приложения
      // answer[0] = индекс правильного ответа в options[]
      return quizzes.map(quiz => ({
        id:   quiz.id,
        a:    quiz.text,                    // текст вопроса
        l:    this.#reorderOptions(quiz),   // варианты, правильный первым
        extern: true
      }));

    } catch (e) {
      console.warn("Server nicht erreichbar, verwende Fallback.", e);
      return this.#getFallbackExternFragen();
    }
  }

  // Ставим правильный ответ на первое место (как ожидает checkAnswer)
  // Сервер не возвращает answer[] при GET — поэтому при загрузке
  // мы записывали правильный ответ с answer:[0] или answer:[1] и т.д.
  // Здесь просто оставляем options как есть, правильный — тот что загружали первым
  // Для вопросов где answer:[0] — options[0] правильный (большинство твоих вопросов)
  // Для вопросов где answer:[1] — нужно поменять местами
  #reorderOptions(quiz) {
    // Сервер не отдаёт answer при GET, поэтому используем
    // отдельный запрос /solve для проверки (см. checkAnswerExtern)
    return quiz.options;
  }

  getCurrentQuestion() {
    if (this.#currentIndex >= this.#questions.length) return null;
    const q = this.#questions[this.#currentIndex];
    const shuffled = this.#shuffle([...q.l]);
    return {
      question:      q.a,
      answers:       shuffled,
      correctAnswer: q.l[0],   // для локальных вопросов
      extern:        q.extern || false,
      id:            q.id || null,
      originalOptions: q.l     // оригинальный порядок для /solve
    };
  }

  // Для локальных вопросов — синхронная проверка
  checkAnswer(answer) {
    const q = this.#questions[this.#currentIndex];
    const isCorrect = answer === q.l[0];
    if (isCorrect) this.#correctCount++;
    else this.#wrongCount++;
    this.#currentIndex++;
    return isCorrect;
  }

  // Для внешних вопросов — проверка через /solve на сервере
  async checkAnswerExtern(answer) {
    const q = this.#questions[this.#currentIndex];

    try {
      // Находим индекс выбранного ответа в оригинальном порядке options
      const answerIndex = q.l.indexOf(answer);

      const resp = await fetch(`${this.#apiBase}/quizzes/${q.id}/solve`, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + this.#auth,
          "Content-Type": "application/json"
        },
        body: JSON.stringify([answerIndex])
      });

      const result = await resp.json();
      const isCorrect = result.success === true;

      if (isCorrect) this.#correctCount++;
      else this.#wrongCount++;
      this.#currentIndex++;
      return isCorrect;

    } catch (e) {
      console.warn("Solve fehlgeschlagen, lokale Pruefung.", e);
      return this.checkAnswer(answer);
    }
  }

  isFinished() {
    return this.#currentIndex >= this.#questions.length;
  }

  getProgress() {
    return {
      current: this.#currentIndex,
      total:   this.#questions.length,
      percent: this.#questions.length > 0
        ? Math.round((this.#currentIndex / this.#questions.length) * 100)
        : 0
    };
  }

  getStats() {
  const stats = {
    correct: this.#correctCount,
    wrong: this.#wrongCount,
    total: this.#questions.length,
    percent: this.#questions.length > 0
      ? Math.round((this.#correctCount / this.#questions.length) * 100)
      : 0
  };
  console.log("Generated stats:", stats); // Отладка
  return stats;
}

  getCategory() { return this.#category; }

  async fetchTechNews() {
    try {
      const idsResponse = await fetch(`${this.#newsApiBase}/newstories.json`);
      if (!idsResponse.ok) throw new Error("News-IDs konnten nicht geladen werden.");

      const storyIds = (await idsResponse.json()).slice(0, 18);
      const newsItems = await Promise.all(
        storyIds.map(id =>
          fetch(`${this.#newsApiBase}/item/${id}.json`)
            .then(response => response.ok ? response.json() : null)
            .catch(() => null)
        )
      );

      const preparedItems = newsItems
        .filter(item => item?.type === "story" && item.title && item.url)
        .slice(0, 6)
        .map(item => ({
          id: item.id,
          title: item.title,
          url: item.url,
          source: this.#hostnameFromUrl(item.url),
          timeLabel: this.#formatNewsTime(item.time)
        }));

      if (!preparedItems.length) {
        throw new Error("Keine News verfuegbar.");
      }

      return preparedItems;
    } catch (error) {
      console.warn("News konnten nicht geladen werden, verwende Fallback.", error);
      return this.#getFallbackNews();
    }
  }

  #getFallbackExternFragen() {
    return this.#shuffle([
      {"a":"Was ist die Hauptstadt von Deutschland?","l":["Berlin","München","Hamburg","Frankfurt"]},
      {"a":"Wie viele Bits hat ein Byte?","l":["8","4","16","6"]},
      {"a":"Welche Sprache laeuft im Browser nativ?","l":["JavaScript","Python","Java","C++"]},
      {"a":"Was steht OSI fuer?","l":["Open Systems Interconnection","Open Software Interface","Operating System Integration","Online Service Index"]},
      {"a":"Was wird fuer HTTPS genutzt?","l":["TLS/SSL","MD5","SHA-1","BASE64"]},
      {"a":"Was bedeutet URL?","l":["Uniform Resource Locator","Universal Resource Link","Unified Routing Label","Uniform Reference Locator"]},
      {"a":"Was ist IPv6?","l":["Internet Protocol Version 6","Internet Packet Version 6","Internal Protocol Version 6","Input Protocol Variant 6"]},
      {"a":"In welchem Jahr wurde das WWW erfunden?","l":["1989","1975","2000","1995"]},
      {"a":"Was ist das Binaerequivalent von 10?","l":["1010","1100","1001","0110"]},
      {"a":"Wer erfand das Telefon?","l":["Alexander Graham Bell","Thomas Edison","Nikola Tesla","Guglielmo Marconi"]}
    ]).slice(0, 10);
  }

  #shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  #hostnameFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "tech";
    }
  }

  #formatNewsTime(unixSeconds) {
    if (!unixSeconds) return "--:--";

    return new Date(unixSeconds * 1000).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  #getFallbackNews() {
    return [
      {
        id: "fallback-1",
        timeLabel: "12:56",
        title: "KI-Tools beschleunigen die Softwareentwicklung in Unternehmen.",
        url: "https://news.ycombinator.com/",
        source: "Hacker News"
      },
      {
        id: "fallback-2",
        timeLabel: "12:27",
        title: "Cloud-Plattformen investieren weiter in sichere DevOps-Prozesse.",
        url: "https://news.ycombinator.com/",
        source: "Hacker News"
      },
      {
        id: "fallback-3",
        timeLabel: "12:06",
        title: "Neue Web-Standards verbessern Performance und Barrierefreiheit.",
        url: "https://news.ycombinator.com/",
        source: "Hacker News"
      },
      {
        id: "fallback-4",
        timeLabel: "11:54",
        title: "Unternehmen setzen staerker auf Cybersecurity und Identity-Management.",
        url: "https://news.ycombinator.com/",
        source: "Hacker News"
      }
    ];
  }
}
