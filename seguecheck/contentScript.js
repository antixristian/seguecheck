(() => {
  const ROOT_ID = "me-segue-de-volta-root";

  // Se o modal já estiver aberto na página, destaca-o suavemente sem interromper buscas em andamento.
  const existingRoot = document.getElementById(ROOT_ID);
  if (existingRoot?.shadowRoot) {
    const dialog = existingRoot.shadowRoot.querySelector(".dialog");
    if (dialog) {
      dialog.classList.remove("pulse");
      void dialog.offsetWidth;
      dialog.classList.add("pulse");
      setTimeout(() => dialog.classList.remove("pulse"), 500);
    }
    return;
  }

  // Constantes de configuração e segurança
  const LARGE_ACCOUNT_THRESHOLD = 10000;
  const CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 72 horas
  const MAX_UNFOLLOWS_PER_MINUTE = 5;
  const MAX_UNFOLLOWS_PER_HOUR = 60;
  const MINUTE_MS = 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const DEFAULT_IG_APP_ID = "936619743392459";

  const PROFILE_GRAPHQL_ENDPOINTS = [
    {
      url: "https://www.instagram.com/api/graphql",
      docId: "28036671149327607",
      variables: {
        enable_integrity_filters: true,
        __relay_internal__pv__PolarisCannesGuardianExperienceEnabledrelayprovider: true,
        __relay_internal__pv__PolarisCASB976ProfileEnabledrelayprovider: false,
        __relay_internal__pv__PolarisWebSchoolsEnabledrelayprovider: false,
        __relay_internal__pv__PolarisRepostsConsumptionEnabledrelayprovider: true,
        __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false
      }
    },
    {
      url: "https://www.instagram.com/graphql/query",
      docId: "27937681195819736",
      variables: {
        render_surface: "PROFILE",
        enable_integrity_filters: true,
        __relay_internal__pv__PolarisCannesGuardianExperienceEnabledrelayprovider: true,
        __relay_internal__pv__PolarisCASB976ProfileEnabledrelayprovider: false,
        __relay_internal__pv__PolarisRepostsConsumptionEnabledrelayprovider: false,
        __relay_internal__pv__PolarisWebSchoolsEnabledrelayprovider: false
      }
    }
  ];

  // Ícones da interface baseados em Google Material Symbols Rounded (Apache 2.0).
  const ICONS = {
    brand: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16m-4-4 4 4-4 4"/><path d="M20 17H4m4-4-4 4 4 4" opacity=".7"/></svg>`,
    close: `<svg width="19" height="19" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>`,
    search: `<svg width="16" height="16" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>`,
    verified: `<svg width="16" height="16" viewBox="0 -960 960 960" fill="currentColor" aria-label="Verificado"><path d="m438-452-58-57q-11-11-27.5-11T324-508q-11 11-11 28t11 28l86 86q12 12 28 12t28-12l170-170q12-12 11.5-28T636-592q-12-12-28.5-12.5T579-593L438-452ZM326-90l-58-98-110-24q-15-3-24-15.5t-7-27.5l11-113-75-86q-10-11-10-26t10-26l75-86-11-113q-2-15 7-27.5t24-15.5l110-24 58-98q8-13 22-17.5t28 1.5l104 44 104-44q14-6 28-1.5t22 17.5l58 98 110 24q15 3 24 15.5t7 27.5l-11 113 75 86q10 11 10 26t-10 26l-75 86 11 113q2 15-7 27.5T802-212l-110 24-58 98q-8 13-22 17.5T584-74l-104-44-104 44q-14 6-28 1.5T326-90Z"/></svg>`,
    starOutline: `<svg width="17" height="17" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143Zm126 18L314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Zm0-201Z"/></svg>`,
    starSolid: `<svg width="17" height="17" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M480-269 314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Z"/></svg>`
  };

  // Utilitários básicos
  function getCookie(name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  }

  function computeJazoest(dtsg) {
    if (!dtsg) return "";
    let sum = 0;
    for (let i = 0; i < dtsg.length; i++) {
      sum += dtsg.charCodeAt(i);
    }
    return `2${sum}`;
  }

  function extractTokenFromSource(source, tokenName) {
    const match = source.match(new RegExp(`\\["${tokenName}",\\[\\],\\{"token":"([^"]+)"`));
    return match ? match[1] : null;
  }

  // Extrai tokens lendo apenas as tags <script> primeiro (muito mais rápido que serializar todo o DOM do feed)
  function extractInstagramContext() {
    let scriptSource = "";
    const scripts = document.scripts;
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].textContent) {
        scriptSource += scripts[i].textContent + "\n";
      }
    }

    const parseFrom = (src) => ({
      viewerId:
        src.match(/\\?"viewerId\\?":\\?"(\w+)\\?"/i)?.[1] ||
        src.match(/\\?"appScopedIdentity\\?":\\?"(\w+)\\?"/i)?.[1] ||
        null,
      csrfToken: src.match(/(?<="csrf_token":").+?(?=")/i)?.[0] || null,
      appId: src.match(/(?<="X-IG-App-ID":").+?(?=")/i)?.[0] || null,
      rolloutHash: src.match(/(?<="rollout_hash":").+?(?=")/i)?.[0] || null,
      dtsg: extractTokenFromSource(src, "DTSGInitialData"),
      lsd: extractTokenFromSource(src, "LSD")
    });

    let parsed = parseFrom(scriptSource);
    if (!parsed.viewerId || !parsed.dtsg) {
      const fallbackHtml = document.documentElement.innerHTML;
      const fallback = parseFrom(fallbackHtml);
      parsed = {
        viewerId: parsed.viewerId || fallback.viewerId,
        csrfToken: parsed.csrfToken || fallback.csrfToken,
        appId: parsed.appId || fallback.appId,
        rolloutHash: parsed.rolloutHash || fallback.rolloutHash,
        dtsg: parsed.dtsg || fallback.dtsg,
        lsd: parsed.lsd || fallback.lsd
      };
    }

    const viewerId = parsed.viewerId || getCookie("ds_user_id");
    const csrfToken = parsed.csrfToken || getCookie("csrftoken");
    const appId = parsed.appId || DEFAULT_IG_APP_ID;
    const wwwClaim = sessionStorage.getItem("www-claim-v2");
    const sessionNonce = Math.random().toString(36).slice(2, 8).padEnd(6, "0");

    const apiHeaders = {
      "x-asbd-id": "359341",
      "x-ig-max-touch-points": String(navigator.maxTouchPoints ?? 0),
      "x-requested-with": "XMLHttpRequest",
      "X-Ig-App-Id": appId
    };

    const mutationHeaders = {
      "X-Asbd-Id": "359341",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      "X-Ig-App-Id": appId
    };

    if (wwwClaim) {
      apiHeaders["X-Ig-Www-Claim"] = wwwClaim;
      mutationHeaders["X-Ig-Www-Claim"] = wwwClaim;
    }
    if (csrfToken) {
      apiHeaders["X-Csrftoken"] = csrfToken;
      mutationHeaders["X-Csrftoken"] = csrfToken;
    }
    if (parsed.rolloutHash) {
      mutationHeaders["X-Instagram-Ajax"] = parsed.rolloutHash;
    }

    return {
      viewerId,
      dtsg: parsed.dtsg,
      jazoest: computeJazoest(parsed.dtsg),
      lsd: parsed.lsd,
      apiHeaders,
      mutationHeaders,
      getWebSessionId() {
        try {
          const sessionPart = (localStorage.getItem("Session") || "").split(":")[0];
          const tabPart = sessionStorage.getItem("TabId");
          return sessionPart && tabPart ? `${sessionPart}:${tabPart}:${sessionNonce}` : null;
        } catch {
          return null;
        }
      }
    };
  }

  // Tratamento padronizado de erros e cancelamento
  function createAppError(message, { fatal = false, account = false, limited = false } = {}) {
    const err = new Error(message);
    err.userMessage = message;
    err.fatal = fatal || account;
    err.account = account;
    err.limited = limited;
    return err;
  }

  function createAbortError() {
    const err = new Error("Operação pausada pelo usuário.");
    err.aborted = true;
    return err;
  }

  function sleep(ms, signal) {
    const duration = ms ?? Math.floor(Math.random() * 2500) + 1000;
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(createAbortError());
        return;
      }
      const onAbort = () => {
        clearTimeout(timer);
        reject(createAbortError());
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, duration);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  async function parseJsonResponse(response) {
    const url = response.url || "";
    if (/\/accounts\/login|\/login\//.test(url)) {
      throw createAppError("Sua sessão expirou. Faça login no Instagram e tente novamente.", { account: true });
    }
    if (/\/challenge/.test(url)) {
      throw createAppError(
        "O Instagram solicitou uma verificação de segurança. Confirme na página do Instagram e tente novamente.",
        { account: true }
      );
    }
    try {
      return await response.json();
    } catch {
      throw createAppError("O Instagram não retornou os dados esperados. Verifique se sua conta está conectada.");
    }
  }

  async function buildHttpError(response) {
    const status = response.status;
    let body = null;
    try {
      body = JSON.parse(await response.text());
    } catch {
      // Corpo não-JSON ignorado
    }
    const apiMessage = typeof body?.message === "string" ? body.message : "";

    if (apiMessage === "login_required") {
      return createAppError("Sua sessão expirou. Faça login no Instagram e tente novamente.", { account: true });
    }
    if (apiMessage === "checkpoint_required" || apiMessage === "challenge_required") {
      return createAppError(
        "O Instagram solicitou uma verificação de segurança. Conclua a verificação no Instagram e tente de novo.",
        { account: true }
      );
    }
    if (apiMessage === "feedback_required" || body?.spam) {
      return createAppError(
        "O Instagram bloqueou temporariamente esta ação na sua conta. Aguarde algumas horas antes de tentar novamente.",
        { account: true }
      );
    }
    if (/wait a few minutes/i.test(apiMessage)) {
      return createAppError(
        "O Instagram pediu para aguardar alguns minutos antes de novas consultas. Tente retomar mais tarde.",
        { limited: true }
      );
    }
    if (status === 429) {
      return createAppError(
        "Limite temporário de consultas atingido no Instagram. Aguarde um pouco e clique em Continuar.",
        { limited: true }
      );
    }
    if (status === 401 || status === 403) {
      return createAppError("O Instagram recusou a consulta. Recarregue a página, confira seu login e tente de novo.", {
        fatal: true
      });
    }

    const detail = apiMessage ? `: ${escapeHtml(apiMessage.slice(0, 140))}` : "";
    return createAppError(`Não foi possível concluir a requisição no Instagram (status ${status}${detail}).`);
  }

  // Estado principal da aplicação
  const ctx = extractInstagramContext();
  const previousBodyOverflow = document.body.style.overflowY;
  const uiAbortController = new AbortController();

  let scanAbortController = null;
  let isScanning = false;
  let isScanPaused = false;
  let profileCounts = { followers: 0, following: 0 };
  let allResults = []; // Todos os não-seguidores carregados ({ id, username, full_name, profile_pic_url, is_verified, is_private })
  let activeScanState = null;
  let protectedIds = new Set();
  let unfollowedInSession = new Set();
  let unfollowTimestamps = [];

  let filters = {
    unverified: true,
    verified: false,
    showProtectedOnly: false,
    search: "",
    sortBy: "recent"
  };

  // Chaves de armazenamento local isoladas por conta do Instagram
  const STORAGE_KEYS = {
    prefs: "msdv_prefs",
    result: () => `msdv_result_${ctx.viewerId}`,
    resume: () => `msdv_resume_${ctx.viewerId}`,
    protected: () => `msdv_protected_${ctx.viewerId}`,
    unfollowLog: () => `msdv_unfollow_log_${ctx.viewerId}`
  };

  // Persistência em chrome.storage.local
  async function cleanupExpiredStorage() {
    try {
      const allData = await chrome.storage.local.get(null);
      const now = Date.now();
      const keysToRemove = Object.keys(allData).filter((key) => {
        if (!key.startsWith("msdv_result_") && !key.startsWith("msdv_resume_")) return false;
        const entry = allData[key];
        return !entry?.time || now - entry.time > CACHE_TTL_MS;
      });
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
      }
    } catch {
      // Falha silenciosa de limpeza de cache
    }
  }

  async function loadUserPreferences() {
    try {
      const keys = [STORAGE_KEYS.prefs];
      if (ctx.viewerId) {
        keys.push(STORAGE_KEYS.protected(), STORAGE_KEYS.unfollowLog());
      }
      const stored = await chrome.storage.local.get(keys);

      if (stored[STORAGE_KEYS.prefs]) {
        const p = stored[STORAGE_KEYS.prefs];
        if (typeof p.unverified === "boolean") filters.unverified = p.unverified;
        if (typeof p.verified === "boolean") filters.verified = p.verified;
        if (p.sortBy === "recent" || p.sortBy === "az") filters.sortBy = p.sortBy;
      }

      if (ctx.viewerId) {
        const savedProtected = stored[STORAGE_KEYS.protected()];
        if (Array.isArray(savedProtected)) {
          protectedIds = new Set(savedProtected.map(String));
        }
        const savedTimestamps = stored[STORAGE_KEYS.unfollowLog()];
        if (Array.isArray(savedTimestamps)) {
          const now = Date.now();
          unfollowTimestamps = savedTimestamps.filter((ts) => typeof ts === "number" && now - ts < HOUR_MS);
        }
      }
    } catch {
      // Mantém padrões em memória
    }
  }

  function saveFilterPreferences() {
    chrome.storage.local
      .set({
        [STORAGE_KEYS.prefs]: {
          unverified: filters.unverified,
          verified: filters.verified,
          sortBy: filters.sortBy
        }
      })
      .catch(() => {});
  }

  function saveProtectedIds() {
    if (!ctx.viewerId) return;
    chrome.storage.local.set({ [STORAGE_KEYS.protected()]: [...protectedIds] }).catch(() => {});
  }

  function pruneAndGetQuota() {
    const now = Date.now();
    unfollowTimestamps = unfollowTimestamps.filter((ts) => now - ts < HOUR_MS);
    const lastMinute = unfollowTimestamps.filter((ts) => now - ts < MINUTE_MS).length;
    return { minute: lastMinute, hour: unfollowTimestamps.length };
  }

  function recordUnfollowTimestamp() {
    unfollowTimestamps.push(Date.now());
    pruneAndGetQuota();
    if (ctx.viewerId) {
      chrome.storage.local.set({ [STORAGE_KEYS.unfollowLog()]: unfollowTimestamps }).catch(() => {});
    }
  }

  function createBucket() {
    return {
      ids: new Set(),
      cursors: new Set(),
      after: "",
      time: Date.now(),
      complete: false,
      done: false
    };
  }

  function serializeBucket(bucket) {
    return {
      ...bucket,
      ids: [...bucket.ids],
      cursors: [...bucket.cursors]
    };
  }

  function deserializeBucket(raw) {
    return {
      ...raw,
      ids: new Set(raw.ids || []),
      cursors: new Set(raw.cursors || [])
    };
  }

  async function loadCachedResult() {
    if (!ctx.viewerId) return null;
    try {
      const key = STORAGE_KEYS.result();
      const entry = (await chrome.storage.local.get(key))[key];
      if (!entry || !Array.isArray(entry.rows) || Date.now() - entry.time > CACHE_TTL_MS) {
        return null;
      }
      return entry;
    } catch {
      return null;
    }
  }

  async function saveCachedResult(rows) {
    if (!ctx.viewerId) return;
    const cleanRows = rows.filter((u) => !unfollowedInSession.has(u.id));
    await chrome.storage.local
      .set({
        [STORAGE_KEYS.result()]: {
          time: Date.now(),
          rows: cleanRows
        }
      })
      .catch(() => {});
  }

  async function loadResumeState() {
    if (!ctx.viewerId) return null;
    try {
      const key = STORAGE_KEYS.resume();
      const entry = (await chrome.storage.local.get(key))[key];
      if (!entry || !entry.time || Date.now() - entry.time > CACHE_TTL_MS) {
        return null;
      }
      return {
        followers: deserializeBucket(entry.followers),
        following: deserializeBucket(entry.following),
        result: (entry.result || []).filter((u) => !unfollowedInSession.has(u.id)),
        loaded: entry.loaded || 0,
        time: entry.time
      };
    } catch {
      return null;
    }
  }

  function saveResumeState(state) {
    if (!ctx.viewerId || !state) return;
    const refTime = (state.followers.done ? state.following : state.followers).time || Date.now();
    if (Date.now() - refTime >= CACHE_TTL_MS) return;

    chrome.storage.local
      .set({
        [STORAGE_KEYS.resume()]: {
          followers: serializeBucket(state.followers),
          following: serializeBucket(state.following),
          result: state.result.filter((u) => !unfollowedInSession.has(u.id)),
          loaded: state.loaded,
          time: refTime
        }
      })
      .catch(() => {});
  }

  async function clearResumeState() {
    if (!ctx.viewerId) return;
    await chrome.storage.local.remove(STORAGE_KEYS.resume()).catch(() => {});
  }

  async function removeUserFromStoredCaches(userId) {
    const cached = await loadCachedResult();
    if (cached) {
      cached.rows = cached.rows.filter((u) => u.id !== userId);
      chrome.storage.local.set({ [STORAGE_KEYS.result()]: cached }).catch(() => {});
    }
    const resume = await loadResumeState();
    if (resume) {
      resume.result = resume.result.filter((u) => u.id !== userId);
      saveResumeState(resume);
    }
  }

  // Construção do DOM isolado via Shadow Root
  const hostEl = document.createElement("div");
  hostEl.id = ROOT_ID;
  const shadow = hostEl.attachShadow({ mode: "open" });

  const styles = window.__MSDV_STYLES__ || "";
  shadow.innerHTML = `
    <style>${styles}</style>
    <div class="backdrop" data-close-backdrop="true">
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="seguecheck-title">
        <header class="header">
          <div class="brand">
            <div class="brand-icon">${ICONS.brand}</div>
            <h1 class="brand-title" id="seguecheck-title">SegueCheck</h1>
          </div>
          <button type="button" class="btn-close" data-action="close" title="Fechar (Esc)" aria-label="Fechar">
            ${ICONS.close}
          </button>
        </header>

        <section class="controls-section">
          <dl class="summary">
            <div class="summary-main">
              <dt>Não te seguem de volta</dt>
              <dd id="stat-nonfollowers">—</dd>
            </div>
            <div class="summary-detail">
              <dt>Seguidores</dt>
              <dd id="stat-followers">—</dd>
            </div>
            <div class="summary-detail">
              <dt>Seguindo</dt>
              <dd id="stat-following">—</dd>
            </div>
          </dl>

          <div class="action-row">
            <div class="status-caption" id="status-caption" role="status">Verificando sessão...</div>
            <div class="action-buttons">
              <button type="button" class="btn-primary" id="btn-scan" disabled>Analisar perfis</button>
              <button type="button" class="btn-secondary" id="btn-pause" style="display:none">Pausar</button>
            </div>
          </div>

          <div class="progress-wrap" id="progress-wrap">
            <div class="progress-meta">
              <span id="progress-stage">Preparando análise...</span>
              <span id="progress-percent">0%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
          </div>

          <div class="banner-alert" id="banner-alert" role="alert"></div>
          <div class="banner-alert warning" id="large-account-warning" role="group" aria-labelledby="large-account-message">
            <div id="large-account-message">
              <strong>Você tem mais de 10 mil seguidores.</strong>
              A extensão pode não funcionar corretamente. Deseja prosseguir?
            </div>
            <div class="confirmation-actions">
              <button type="button" class="btn-secondary" id="btn-cancel-large-account">Cancelar</button>
              <button type="button" class="btn-primary" id="btn-confirm-large-account">Prosseguir</button>
            </div>
          </div>
        </section>

        <section class="filters-bar" aria-label="Filtros de perfis">
          <div class="search-row">
            <div class="search-box">
              <span class="search-icon">${ICONS.search}</span>
              <input type="search" class="search-input" id="search-input" placeholder="Buscar perfis" aria-label="Buscar por usuário ou nome" autocomplete="off" spellcheck="false">
              <button type="button" class="search-clear" id="search-clear" aria-label="Limpar busca">${ICONS.close}</button>
            </div>
            <select class="sort-select" id="sort-select" aria-label="Ordenar perfis">
              <option value="recent">Mais recentes</option>
              <option value="az">Ordem A–Z</option>
            </select>
          </div>

          <div class="checkbox-group">
            <label class="check-chip active" id="chip-unverified">
              <input type="checkbox" id="chk-unverified" checked>
              <span>Não verificados</span>
              <span class="chip-count" id="count-unverified">0</span>
            </label>

            <label class="check-chip" id="chip-verified">
              <input type="checkbox" id="chk-verified">
              <span>Verificados</span>
              <span class="chip-count" id="count-verified">0</span>
            </label>

            <button type="button" class="btn-protected-toggle" id="btn-protected-view" aria-pressed="false">
              ${ICONS.starOutline}
              <span>Protegidos</span>
              <span class="chip-count" id="count-protected">0</span>
            </button>
          </div>
        </section>

        <section class="results-container" id="results-list" aria-label="Resultados da análise"></section>

        <footer class="footer" id="quota-info" hidden></footer>
      </div>
    </div>
  `;

  document.body.appendChild(hostEl);
  document.body.style.overflowY = "hidden";

  // Referências rápidas aos elementos da UI
  const ui = {
    statFollowers: shadow.getElementById("stat-followers"),
    statFollowing: shadow.getElementById("stat-following"),
    statNonFollowers: shadow.getElementById("stat-nonfollowers"),
    btnScan: shadow.getElementById("btn-scan"),
    btnPause: shadow.getElementById("btn-pause"),
    statusCaption: shadow.getElementById("status-caption"),
    progressWrap: shadow.getElementById("progress-wrap"),
    progressStage: shadow.getElementById("progress-stage"),
    progressPercent: shadow.getElementById("progress-percent"),
    progressFill: shadow.getElementById("progress-fill"),
    bannerAlert: shadow.getElementById("banner-alert"),
    largeAccountWarning: shadow.getElementById("large-account-warning"),
    btnCancelLargeAccount: shadow.getElementById("btn-cancel-large-account"),
    btnConfirmLargeAccount: shadow.getElementById("btn-confirm-large-account"),
    chipUnverified: shadow.getElementById("chip-unverified"),
    chkUnverified: shadow.getElementById("chk-unverified"),
    countUnverified: shadow.getElementById("count-unverified"),
    chipVerified: shadow.getElementById("chip-verified"),
    chkVerified: shadow.getElementById("chk-verified"),
    countVerified: shadow.getElementById("count-verified"),
    btnProtectedView: shadow.getElementById("btn-protected-view"),
    countProtected: shadow.getElementById("count-protected"),
    searchInput: shadow.getElementById("search-input"),
    searchClear: shadow.getElementById("search-clear"),
    sortSelect: shadow.getElementById("sort-select"),
    resultsList: shadow.getElementById("results-list"),
    quotaInfo: shadow.getElementById("quota-info")
  };

  // Funções de atualização visual
  function showAlert(type, htmlMessage) {
    if (!htmlMessage) {
      ui.bannerAlert.className = "banner-alert";
      ui.bannerAlert.innerHTML = "";
      return;
    }
    ui.bannerAlert.className = `banner-alert visible ${type}`;
    ui.bannerAlert.innerHTML = htmlMessage;
  }

  function updateQuotaFooter() {
    const quota = pruneAndGetQuota();
    ui.quotaInfo.hidden = quota.hour === 0;
    ui.quotaInfo.textContent = `Ações recentes: ${quota.minute}/${MAX_UNFOLLOWS_PER_MINUTE} por min · ${quota.hour}/${MAX_UNFOLLOWS_PER_HOUR} por h`;
  }

  function syncFilterControlsUI() {
    ui.chkUnverified.checked = filters.unverified;
    ui.chkVerified.checked = filters.verified;
    ui.chipUnverified.classList.toggle("active", filters.unverified && !filters.showProtectedOnly);
    ui.chipVerified.classList.toggle("active", filters.verified && !filters.showProtectedOnly);
    ui.btnProtectedView.classList.toggle("active", filters.showProtectedOnly);
    ui.btnProtectedView.setAttribute("aria-pressed", String(filters.showProtectedOnly));
    ui.sortSelect.value = filters.sortBy;
    ui.searchClear.classList.toggle("visible", filters.search.length > 0);
  }

  function matchesActiveFilters(user) {
    if (unfollowedInSession.has(user.id)) return false;

    const isProtected = protectedIds.has(user.id);
    if (filters.showProtectedOnly) {
      if (!isProtected) return false;
    } else {
      if (isProtected) return false;
      if (user.is_verified && !filters.verified) return false;
      if (!user.is_verified && !filters.unverified) return false;
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      const inHandle = (user.username || "").toLowerCase().includes(term);
      const inName = (user.full_name || "").toLowerCase().includes(term);
      if (!inHandle && !inName) return false;
    }

    return true;
  }

  function getFilteredResults() {
    const matched = allResults.filter(matchesActiveFilters);
    if (filters.sortBy === "az") {
      matched.sort((a, b) => (a.username || "").localeCompare(b.username || "", "pt-BR"));
    }
    return matched;
  }

  function updateCountersUI() {
    let unverifiedCount = 0;
    let verifiedCount = 0;
    let protectedCount = 0;

    for (let i = 0; i < allResults.length; i++) {
      const u = allResults[i];
      if (unfollowedInSession.has(u.id)) continue;
      if (protectedIds.has(u.id)) {
        protectedCount++;
      } else if (u.is_verified) {
        verifiedCount++;
      } else {
        unverifiedCount++;
      }
    }

    ui.countUnverified.textContent = unverifiedCount.toLocaleString("pt-BR");
    ui.countVerified.textContent = verifiedCount.toLocaleString("pt-BR");
    ui.countProtected.textContent = protectedCount.toLocaleString("pt-BR");

    if (allResults.length > 0 || (!isScanning && ui.statNonFollowers.dataset.initialized === "1")) {
      const total = unverifiedCount + verifiedCount + protectedCount;
      ui.statNonFollowers.textContent = total.toLocaleString("pt-BR");
      ui.statNonFollowers.dataset.initialized = "1";
    }
  }

  function createUserRowElement(user) {
    const row = document.createElement("div");
    row.className = "user-row";
    row.dataset.userId = user.id;

    const handle = escapeHtml(user.username || "");
    const fullName = escapeHtml(user.full_name || "");
    const picUrl = escapeHtml(user.profile_pic_url || "");
    const initial = escapeHtml((user.username || "?").charAt(0).toUpperCase());
    const isProtected = protectedIds.has(user.id);

    row.innerHTML = `
      <a href="https://www.instagram.com/${handle}/" target="_blank" rel="noopener noreferrer" class="user-link">
        <div class="avatar-wrap">
          ${
            picUrl
              ? `<img src="${picUrl}" loading="lazy" alt="" class="avatar-img"><div class="avatar-fallback">${initial}</div>`
              : `<div class="avatar-fallback" style="display:flex">${initial}</div>`
          }
        </div>
        <div class="user-meta">
          <div class="user-handle-line">
            <span class="user-handle">@${handle}</span>
            ${user.is_verified ? `<span class="verified-badge" title="Conta verificada">${ICONS.verified}</span>` : ""}
            ${user.is_private ? `<span class="private-tag">Privado</span>` : ""}
          </div>
          ${fullName ? `<span class="user-fullname">${fullName}</span>` : ""}
        </div>
      </a>
      <div class="row-actions">
        <button
          type="button"
          class="btn-protect ${isProtected ? "protected" : ""}"
          data-action="toggle-protect"
          data-id="${escapeHtml(user.id)}"
          aria-label="Proteger @${handle}"
          aria-pressed="${isProtected}"
          title="${isProtected ? "Remover dos protegidos" : "Proteger perfil (ocultar desta lista)"}"
        >
          ${isProtected ? ICONS.starSolid : ICONS.starOutline}
        </button>
        <button
          type="button"
          class="btn-unfollow"
          data-action="unfollow"
          data-id="${escapeHtml(user.id)}"
        >
          Deixar de seguir
        </button>
      </div>
    `;

    return row;
  }

  function renderEmptyState(title, subtitle) {
    ui.resultsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${ICONS.search}</div>
        <div class="empty-state-title">${escapeHtml(title)}</div>
        <div>${escapeHtml(subtitle)}</div>
      </div>
    `;
  }

  function renderResultsList() {
    updateCountersUI();
    const visibleItems = getFilteredResults();

    if (visibleItems.length === 0) {
      if (isScanning) {
        renderEmptyState(
          "Analisando sua conta...",
          "Os perfis compatíveis com os filtros marcados aparecerão aqui automaticamente."
        );
        return;
      }

      if (allResults.length === 0) {
        if (isScanPaused) {
          renderEmptyState("Análise pausada", "Clique em Continuar análise para retomar de onde parou.");
        } else if (ui.statNonFollowers.dataset.initialized === "1") {
          renderEmptyState(
            "Tudo em dia por aqui!",
            "Todos os perfis analisados seguem você de volta."
          );
        } else {
          renderEmptyState(
            "Pronto para analisar",
            "Clique em Analisar perfis para ver quem não te segue de volta."
          );
        }
        return;
      }

      if (!filters.showProtectedOnly && !filters.unverified && !filters.verified) {
        renderEmptyState(
          "Nenhum filtro selecionado",
          "Marque 'Não verificados' e/ou 'Verificados' acima para exibir os perfis."
        );
        return;
      }

      if (filters.showProtectedOnly) {
        renderEmptyState(
          "Nenhum perfil protegido",
          "Clique na estrela ao lado de um perfil para guardá-lo aqui e ocultá-lo da lista principal."
        );
        return;
      }

      renderEmptyState(
        "Nenhum perfil para este filtro",
        filters.search
          ? "Nenhum resultado corresponde à sua busca atual."
          : "Não há perfis nesta categoria. Confira os contadores das outras opções acima."
      );
      return;
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < visibleItems.length; i++) {
      fragment.appendChild(createUserRowElement(visibleItems[i]));
    }
    ui.resultsList.replaceChildren(fragment);
  }

  function updateProgressUI(loadedCount, stageLabel) {
    const totalExpected = profileCounts.followers + profileCounts.following;
    ui.progressWrap.classList.add("visible");
    if (stageLabel) {
      ui.progressStage.textContent = stageLabel;
    }

    if (!totalExpected) {
      ui.progressPercent.textContent = `${loadedCount.toLocaleString("pt-BR")} perfis`;
      ui.progressFill.style.width = "50%";
      return;
    }

    const ratio = Math.min(0.99, Math.max(0, loadedCount / totalExpected));
    const pct = Math.round(ratio * 100);
    ui.progressPercent.textContent = `${pct}%`;
    ui.progressFill.style.width = `${pct}%`;
  }

  // Rede: Requisições à API do Instagram
  async function fetchInstagramJson(url, hasPriorProgress, signal) {
    for (let attempt = 0; ; attempt++) {
      if (signal?.aborted) throw createAbortError();

      try {
        const headers = { ...ctx.apiHeaders };
        const webSessionId = ctx.getWebSessionId();
        if (webSessionId) headers["X-Web-Session-Id"] = webSessionId;

        const response = await fetch(url, { headers, signal });
        if (response.status !== 200) {
          throw await buildHttpError(response);
        }
        return await parseJsonResponse(response);
      } catch (err) {
        if (err?.name === "AbortError" || err?.aborted) {
          throw createAbortError();
        }
        if (err.fatal || err.limited) {
          throw err;
        }
        if (attempt > 0) {
          if (!navigator.onLine) {
            throw createAppError(
              hasPriorProgress
                ? "Sem conexão com a internet. Seu progresso foi salvo — reconecte e clique em Continuar."
                : "Sem conexão com a internet. Verifique sua rede e tente novamente."
            );
          }
          if (hasPriorProgress) err.limited = true;
          throw err;
        }
      }

      await sleep(8000, signal);
    }
  }

  function mapApiUser(raw) {
    return {
      id: String(raw.pk !== undefined && raw.pk !== null ? raw.pk : raw.pk_id),
      username: raw.username || "",
      full_name: raw.full_name || "",
      profile_pic_url: raw.profile_pic_url || "",
      is_verified: Boolean(raw.is_verified),
      is_private: Boolean(raw.is_private)
    };
  }

  async function fetchPaginatedFriendship(kind, bucket, signal, onBatch, beforePage) {
    if (!bucket.after) {
      bucket.time = Date.now();
    }

    while (!signal.aborted) {
      if (beforePage) await beforePage();
      if (bucket.after) {
        await sleep(undefined, signal);
      }

      let url = `https://www.instagram.com/api/v1/friendships/${ctx.viewerId}/${kind}/?count=50`;
      url += kind === "followers" ? "&search_surface=follow_list_page" : "&order=date_followed_latest";
      if (bucket.after) {
        url += `&max_id=${encodeURIComponent(bucket.after)}`;
      }

      const data = await fetchInstagramJson(url, (activeScanState?.loaded || 0) > 0, signal);
      if (!data) break;

      bucket.time = Date.now();
      const users = Array.isArray(data.users) ? data.users : [];
      const uniqueBatch = [];

      for (let i = 0; i < users.length; i++) {
        const mapped = mapApiUser(users[i]);
        if (mapped.id && mapped.id !== "undefined" && !bucket.ids.has(mapped.id)) {
          bucket.ids.add(mapped.id);
          uniqueBatch.push(mapped);
        }
      }

      if (onBatch) onBatch(uniqueBatch);

      const nextCursor =
        data.next_max_id !== undefined && data.next_max_id !== null ? String(data.next_max_id) : "";

      bucket.complete = data.has_more === false;
      if (bucket.complete) break;
      if (!nextCursor || users.length === 0 || bucket.cursors.has(nextCursor)) break;

      bucket.cursors.add(nextCursor);
      bucket.after = nextCursor;
    }

    bucket.done = !signal.aborted;
  }

  async function fetchProfileCounts() {
    let lastError = null;

    for (const endpoint of PROFILE_GRAPHQL_ENDPOINTS) {
      try {
        const params = {
          av: ctx.viewerId,
          __d: "www",
          __user: "0",
          __a: "1",
          __comet_req: "7",
          fb_api_caller_class: "RelayModern",
          fb_api_req_friendly_name: "PolarisProfilePageContentQuery",
          server_timestamps: "true",
          variables: JSON.stringify({ ...endpoint.variables, id: String(ctx.viewerId) }),
          doc_id: endpoint.docId
        };

        const headers = {
          ...ctx.apiHeaders,
          "x-fb-friendly-name": "PolarisProfilePageContentQuery"
        };

        if (ctx.dtsg) {
          params.fb_dtsg = ctx.dtsg;
          params.jazoest = ctx.jazoest;
        }
        if (ctx.lsd) {
          params.lsd = ctx.lsd;
          headers["x-fb-lsd"] = ctx.lsd;
        }

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers,
          body: new URLSearchParams(params),
          credentials: "include"
        });

        if (response.status !== 200) {
          throw await buildHttpError(response);
        }

        const cleanText = (await response.text()).replace(/^for\s*\(;;\);/, "");
        const parsed = JSON.parse(cleanText);
        if (parsed?.data?.user) {
          return {
            followers: parsed.data.user.follower_count || 0,
            following: parsed.data.user.following_count || 0
          };
        }
      } catch (err) {
        if (err?.account) throw err;
        lastError = err;
      }
    }

    if (lastError) {
      console.info("[SegueCheck] Contadores prévios via GraphQL indisponíveis; usando contagem direta.");
    }
    return null;
  }

  function confirmLargeAccount(signal) {
    if (signal.aborted) return Promise.resolve(false);

    return new Promise((resolve) => {
      const listeners = new AbortController();
      const options = { once: true, signal: listeners.signal };
      const finish = (confirmed) => {
        listeners.abort();
        ui.largeAccountWarning.classList.remove("visible");
        resolve(confirmed);
      };

      ui.btnConfirmLargeAccount.addEventListener("click", () => finish(true), options);
      ui.btnCancelLargeAccount.addEventListener("click", () => finish(false), options);
      signal.addEventListener("abort", () => finish(false), options);
      ui.largeAccountWarning.classList.add("visible");
      ui.btnCancelLargeAccount.focus();
    });
  }

  // Execução principal da análise (Seguidores -> Seguindo)
  async function startOrResumeScan() {
    if (isScanning) return;

    if (!filters.showProtectedOnly && !filters.unverified && !filters.verified) {
      showAlert("warning", "Marque pelo menos uma opção (<strong>Não verificados</strong> e/ou <strong>Verificados</strong>) antes de analisar.");
      return;
    }

    showAlert("", "");
    isScanning = true;
    activeScanState = null;
    scanAbortController = new AbortController();
    const { signal } = scanAbortController;

    ui.btnScan.disabled = true;
    let largeAccountApproved = false;
    if (profileCounts.followers > LARGE_ACCOUNT_THRESHOLD) {
      largeAccountApproved = await confirmLargeAccount(signal);
      if (!largeAccountApproved || signal.aborted) {
        isScanning = false;
        ui.btnScan.disabled = false;
        if (!signal.aborted) ui.btnScan.focus();
        return;
      }
    }

    isScanPaused = false;
    ui.btnScan.textContent = "Analisando...";
    ui.btnPause.style.display = "inline-flex";
    ui.statusCaption.textContent = "Consultando o Instagram...";

    const resumed = await loadResumeState();
    await clearResumeState();

    const followersBucket = resumed ? resumed.followers : createBucket();
    const followingBucket = resumed ? resumed.following : createBucket();
    const checkFollowerCount = async () => {
      if (!largeAccountApproved && followersBucket.ids.size > LARGE_ACCOUNT_THRESHOLD) {
        largeAccountApproved = await confirmLargeAccount(signal);
        if (!largeAccountApproved) throw createAbortError();
      }
      if (signal.aborted) throw createAbortError();
    };
    allResults = resumed ? [...resumed.result] : [];
    const existingResultIds = new Set(allResults.map((u) => u.id));

    if (!resumed) {
      delete ui.statNonFollowers.dataset.initialized;
      ui.statNonFollowers.textContent = "0";
    }

    activeScanState = {
      followers: followersBucket,
      following: followingBucket,
      result: allResults,
      loaded: resumed ? resumed.loaded : 0
    };

    renderResultsList();
    updateProgressUI(
      activeScanState.loaded,
      followersBucket.done ? "Comparando quem você segue..." : "Lendo lista de seguidores..."
    );

    try {
      // Etapa 1: Seguidores
      if (!followersBucket.done) {
        await fetchPaginatedFriendship(
          "followers",
          followersBucket,
          signal,
          (batch) => {
            activeScanState.loaded += batch.length;
            updateProgressUI(
              activeScanState.loaded,
              `Lendo seguidores (${followersBucket.ids.size.toLocaleString("pt-BR")})...`
            );
          },
          checkFollowerCount
        );
      }

      await checkFollowerCount();

      if (!profileCounts.followers && followersBucket.complete) {
        ui.statFollowers.textContent = followersBucket.ids.size.toLocaleString("pt-BR");
      }

      // Etapa 2: Seguindo e comparação em tempo real
      if (!followingBucket.done) {
        updateProgressUI(activeScanState.loaded, "Comparando quem você segue...");

        await fetchPaginatedFriendship("following", followingBucket, signal, (batch) => {
          activeScanState.loaded += batch.length;
          updateProgressUI(
            activeScanState.loaded,
            `Comparando seguindo (${followingBucket.ids.size.toLocaleString("pt-BR")})...`
          );

          const newlyVisible = [];
          for (let i = 0; i < batch.length; i++) {
            const candidate = batch[i];
            if (!followersBucket.ids.has(candidate.id) && !existingResultIds.has(candidate.id)) {
              existingResultIds.add(candidate.id);
              allResults.push(candidate);
              if (matchesActiveFilters(candidate)) {
                newlyVisible.push(candidate);
              }
            }
          }

          updateCountersUI();

          if (newlyVisible.length > 0) {
            // Se estiver em ordem alfabética ou havia estado vazio na tela, re-renderiza limpo;
            // caso contrário, apenas anexa o novo lote via DocumentFragment (custo mínimo de DOM).
            const hasEmptyPlaceholder = Boolean(ui.resultsList.querySelector(".empty-state"));
            if (filters.sortBy === "az" || hasEmptyPlaceholder) {
              renderResultsList();
            } else {
              const frag = document.createDocumentFragment();
              for (let i = 0; i < newlyVisible.length; i++) {
                frag.appendChild(createUserRowElement(newlyVisible[i]));
              }
              ui.resultsList.appendChild(frag);
            }
          }
        });
      }

      if (!profileCounts.following && followingBucket.complete) {
        ui.statFollowing.textContent = followingBucket.ids.size.toLocaleString("pt-BR");
      }

      // Finalização da análise
      isScanning = false;
      ui.btnPause.style.display = "none";
      ui.btnScan.disabled = false;
      ui.btnScan.textContent = "Atualizar lista";
      ui.progressFill.style.width = "100%";
      ui.progressPercent.textContent = "100%";
      ui.progressStage.textContent = "Análise concluída";
      ui.statNonFollowers.dataset.initialized = "1";

      const nowFormatted = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      ui.statusCaption.textContent = `Atualizado às ${nowFormatted}`;

      const followersIncomplete =
        !followersBucket.complete ||
        (profileCounts.followers > 0 && followersBucket.ids.size < 0.9 * profileCounts.followers);

      if (!followersIncomplete && followingBucket.complete) {
        await saveCachedResult(allResults);
      }

      if (followersIncomplete) {
        const detail = profileCounts.followers
          ? `O Instagram retornou ${followersBucket.ids.size.toLocaleString("pt-BR")} de ${profileCounts.followers.toLocaleString("pt-BR")} seguidores.`
          : "O Instagram não retornou a lista completa de seguidores.";
        showAlert(
          "warning",
          `<strong>Atenção: lista de seguidores parcial</strong><br>${detail} Alguns perfis abaixo podem já seguir você — confira o perfil antes de deixar de seguir ou atualize mais tarde.`
        );
      }

      renderResultsList();
    } catch (err) {
      isScanning = false;
      ui.btnPause.style.display = "none";
      ui.btnScan.disabled = false;

      if (err?.aborted) {
        isScanPaused = true;
        saveResumeState(activeScanState);
        ui.btnScan.textContent = "Continuar análise";
        ui.statusCaption.textContent = "Análise pausada — progresso salvo";
        ui.progressStage.textContent = "Pausado";
        renderResultsList();
        return;
      }

      saveResumeState(activeScanState);
      ui.btnScan.textContent = activeScanState?.loaded > 0 ? "Continuar análise" : "Analisar perfis";
      ui.progressWrap.classList.remove("visible");

      if (err?.limited) {
        const msg =
          activeScanState?.loaded > 0
            ? "O Instagram limitou temporariamente as consultas. Seu progresso foi salvo: aguarde alguns minutos e clique em Continuar análise."
            : "O Instagram limitou temporariamente as consultas. Aguarde alguns minutos e tente novamente.";
        showAlert("danger", msg);
        ui.statusCaption.textContent = "Aguardando liberação do Instagram";
        return;
      }

      const fallbackMsg = err?.userMessage || `Não foi possível concluir a análise (${escapeHtml(err?.message || err)}).`;
      showAlert("danger", fallbackMsg);
      ui.statusCaption.textContent = "Falha na consulta";
    }
  }

  // Ação: Deixar de seguir com janela deslizante real de segurança
  async function handleUnfollowClick(button) {
    if (button.disabled) return;

    const quota = pruneAndGetQuota();
    updateQuotaFooter();

    if (quota.minute >= MAX_UNFOLLOWS_PER_MINUTE) {
      showAlert(
        "warning",
        `<strong>Proteção anti-bloqueio:</strong> limite de ${MAX_UNFOLLOWS_PER_MINUTE} unfollows por minuto atingido. Aguarde alguns segundos.`
      );
      return;
    }
    if (quota.hour >= MAX_UNFOLLOWS_PER_HOUR) {
      showAlert(
        "warning",
        `<strong>Proteção anti-bloqueio:</strong> limite de ${MAX_UNFOLLOWS_PER_HOUR} unfollows por hora atingido para proteger sua conta.`
      );
      return;
    }

    const userId = button.dataset.id;
    if (!userId) return;

    button.disabled = true;
    button.innerHTML = `<span class="spinner" aria-label="Processando..."></span>`;

    try {
      const dtsg = ctx.dtsg || extractTokenFromSource(document.documentElement.innerHTML, "DTSGInitialData") || "";
      const bodyParams = new URLSearchParams({
        container_module: "profile",
        nav_chain: "PolarisProfilePostsTabRoot:profilePage:1:via_cold_start",
        user_id: userId,
        jazoest: dtsg ? computeJazoest(dtsg) : "",
        fb_dtsg: dtsg
      });

      const response = await fetch(`https://www.instagram.com/api/v1/friendships/destroy/${userId}/`, {
        method: "POST",
        headers: ctx.mutationHeaders,
        credentials: "include",
        mode: "cors",
        body: bodyParams.toString()
      });

      if (!response.ok) {
        throw await buildHttpError(response);
      }

      const json = await response.json();
      if (!json || json.status !== "ok") {
        throw createAppError("O Instagram não confirmou a remoção deste perfil. Tente novamente mais tarde.");
      }

      unfollowedInSession.add(userId);
      recordUnfollowTimestamp();
      updateQuotaFooter();
      updateCountersUI();
      removeUserFromStoredCaches(userId);

      button.classList.add("done");
      button.textContent = "Deixou de seguir";
    } catch (err) {
      button.disabled = false;
      button.textContent = "Deixar de seguir";
      showAlert(
        "danger",
        err?.userMessage || "O Instagram recusou a ação de deixar de seguir no momento. Aguarde alguns minutos."
      );
    }
  }

  function handleToggleProtect(button) {
    const userId = button.dataset.id;
    if (!userId) return;

    if (protectedIds.has(userId)) {
      protectedIds.delete(userId);
    } else {
      protectedIds.add(userId);
    }

    saveProtectedIds();
    renderResultsList();
  }

  // Fechamento limpo do modal (cancela buscas ativas, salva progresso e limpa listeners)
  function closeModal() {
    if (isScanning && scanAbortController) {
      scanAbortController.abort();
      saveResumeState(activeScanState);
    }
    uiAbortController.abort();
    document.body.style.overflowY = previousBodyOverflow;
    hostEl.remove();
  }

  // Eventos de interface
  shadow.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.hasAttribute("data-close-backdrop") || target.closest('[data-action="close"]')) {
      closeModal();
      return;
    }

    const unfollowBtn = target.closest('[data-action="unfollow"]');
    if (unfollowBtn instanceof HTMLButtonElement) {
      handleUnfollowClick(unfollowBtn);
      return;
    }

    const protectBtn = target.closest('[data-action="toggle-protect"]');
    if (protectBtn instanceof HTMLButtonElement) {
      handleToggleProtect(protectBtn);
    }
  });

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    },
    { signal: uiAbortController.signal }
  );

  // Fallback automático para fotos de perfil expiradas no cache (compatível com CSP estrito)
  ui.resultsList.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement && target.classList.contains("avatar-img")) {
        target.style.display = "none";
        const fallback = target.nextElementSibling;
        if (fallback instanceof HTMLElement) {
          fallback.style.display = "flex";
        }
      }
    },
    true
  );

  ui.btnScan.addEventListener("click", () => {
    startOrResumeScan();
  });

  ui.btnPause.addEventListener("click", () => {
    if (isScanning && scanAbortController) {
      scanAbortController.abort();
    }
  });

  ui.chkUnverified.addEventListener("change", () => {
    filters.unverified = ui.chkUnverified.checked;
    filters.showProtectedOnly = false;
    saveFilterPreferences();
    syncFilterControlsUI();
    renderResultsList();
  });

  ui.chkVerified.addEventListener("change", () => {
    filters.verified = ui.chkVerified.checked;
    filters.showProtectedOnly = false;
    saveFilterPreferences();
    syncFilterControlsUI();
    renderResultsList();
  });

  ui.btnProtectedView.addEventListener("click", () => {
    filters.showProtectedOnly = !filters.showProtectedOnly;
    syncFilterControlsUI();
    renderResultsList();
  });

  ui.searchInput.addEventListener("input", () => {
    filters.search = ui.searchInput.value.trim();
    syncFilterControlsUI();
    renderResultsList();
  });

  ui.searchClear.addEventListener("click", () => {
    filters.search = "";
    ui.searchInput.value = "";
    syncFilterControlsUI();
    renderResultsList();
    ui.searchInput.focus();
  });

  ui.sortSelect.addEventListener("change", () => {
    filters.sortBy = ui.sortSelect.value === "az" ? "az" : "recent";
    saveFilterPreferences();
    renderResultsList();
  });

  // Inicialização assíncrona
  (async function initialize() {
    await cleanupExpiredStorage();
    await loadUserPreferences();
    syncFilterControlsUI();
    updateQuotaFooter();

    // Atualiza o contador da janela deslizante a cada 15s apenas enquanto o modal estiver aberto
    const quotaTimer = setInterval(updateQuotaFooter, 15000);
    uiAbortController.signal.addEventListener("abort", () => clearInterval(quotaTimer), { once: true });

    if (!ctx.viewerId) {
      ui.btnScan.disabled = true;
      ui.statusCaption.textContent = "Sessão não identificada";
      showAlert(
        "danger",
        "<strong>Login no Instagram não detectado.</strong> Entre na sua conta do Instagram e clique no ícone da extensão novamente."
      );
      renderEmptyState("Você não está conectado", "Faça login no Instagram para analisar seus seguidores.");
      return;
    }

    try {
      const counts = await fetchProfileCounts();
      if (counts) {
        profileCounts = counts;
        ui.statFollowers.textContent = counts.followers.toLocaleString("pt-BR");
        ui.statFollowing.textContent = counts.following.toLocaleString("pt-BR");
      }
    } catch (err) {
      if (err?.account) {
        ui.statusCaption.textContent = "Ação necessária na conta";
        showAlert("danger", err.userMessage);
        renderEmptyState("Sessão indisponível", "Verifique sua conta do Instagram e tente novamente.");
        return;
      }
    }

    const resumed = await loadResumeState();
    if (resumed) {
      isScanPaused = true;
      allResults = resumed.result;
      ui.statNonFollowers.dataset.initialized = "1";
      ui.btnScan.disabled = false;
      ui.btnScan.textContent = "Continuar análise";
      ui.statusCaption.textContent = "Análise anterior pausada";
      renderResultsList();
      return;
    }

    const cached = await loadCachedResult();
    if (cached) {
      allResults = cached.rows;
      ui.statNonFollowers.dataset.initialized = "1";
      const formattedDate = new Date(cached.time).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
      ui.statusCaption.textContent = `Última análise: ${formattedDate}`;
      ui.btnScan.disabled = false;
      ui.btnScan.textContent = "Atualizar lista";
      renderResultsList();
      return;
    }

    ui.statusCaption.textContent = "Pronto para iniciar";
    ui.btnScan.disabled = false;
    ui.btnScan.textContent = "Analisar perfis";
    renderResultsList();
  })();
})();
