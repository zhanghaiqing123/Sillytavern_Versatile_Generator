// ============================================
// 多功能生成器 (Multifunction Generator) v4.7.2
// 发行定位: 严谨专业·图鉴与事件生成引擎 (修复移动端地址栏遮挡与滚动问题1)
// 运行环境：SillyTavern + TavernHelper
// ============================================

(async function () {(异步 函数 () {
    'use strict';

    const hostWindow = window.parent;
    const STORAGE_KEY_POS = 'multi-gen-fab-pos';
    const STORAGE_KEY_API = 'multi-gen-api-cfg';
    const STORAGE_KEY_UI = 'multi-gen-ui-cfg';
    const STORAGE_KEY_WB_V4 = 'multi-gen-wb-cache-v4';
    const STORAGE_KEY_CUSTOM_GEN = 'multi-gen-custom-modules';
    const STORAGE_KEY_GEN_ORDER = 'multi-gen-order-list';
    const STORAGE_KEY_FMT = 'multi-gen-wb-format';
    const STORAGE_KEY_HISTORY = 'multi-gen-history';
    const FAB_SIZE = 44;
    const EDGE_GAP = 12;
    const MAX_HISTORY_LIMIT = 7;

    // --- 核心预设骨架 ---
    const DEFAULT_GENERATORS = [
        {
            id: 'def_char', name: '角色生成器', tag: '角色', icon: '👤', isDefault: true,
            sys: '请根据上下文内容和用户需求，创造一个充满立体感、拥有合理动机和优缺点的鲜活角色。避免刻板印象，注重细节描写。',
            namePrompt: '为一个充满立体感的角色起一个恰当的名字，可附带别称。',
            fields: [
                { name: '外貌特征', pmt: '描写其体态、五官、典型的穿搭风格或标志性饰品。请注重视觉画面感，切忌像贴标签一样死板。' },
                { name: '性格特点', pmt: '描述其表层性格、深层欲望，以及不可忽视的心理缺陷或怪癖。' },
                { name: '背景经历', pmt: '写一段简明扼要的过去，必须交代他为何会出现在当前的世界观或局势中。' },
                { name: '能力与弱点', pmt: '描述其擅长的技能、战斗流派或特殊能力，同时必须明确写出与其能力相对应的软肋或代价。' }
            ]
        },
        {
            id: 'def_item', name: '物品生成器', tag: '物品', icon: '💎', isDefault: true,
            sys: '请根据上下文内容和用户需求，仔细斟酌创造一件引人入胜的物品。注重它的质感、机制以及它能给剧情带来的多维变数。',
            namePrompt: '为这件物品构思一个精准且引人入胜的名称。',
            fields: [
                { name: '外观形态', pmt: '描写物品的大小、主要材质、颜色、气味，以及它在静止或被激活时的视觉表现。' },
                { name: '功能与机制', pmt: '详细说明该物品的作用、它的深层运行原理或者是其蕴含的超自然效果。' },
                { name: '来历传闻', pmt: '简述这件物品的最初锻造者、前任主人，或者围绕它发生过的坊间传说。' },
                { name: '负面限制', pmt: '严谨描述使用该物品必须付出的代价、前置条件，或者是引发反噬的致命安全缺陷。' }
            ]
        },
        {
            id: 'def_build', name: '建筑生成器', tag: '建筑', icon: '🏛️', isDefault: true,
            sys: '请根据上下文内容和用户需求，为剧情量身设计一个极具氛围感和沉浸感的地理坐标或宏大建筑。要让文字具有画面感，构建清晰的空间结构。',
            namePrompt: '为该地标或建筑起一个具有氛围感的名字。',
            fields: [
                { name: '总体印象', pmt: '描述角色从远处第一眼看到该地标时的宏观外观轮廓、建筑流派风格以及周遭的环境氛围。' },
                { name: '内部空间', pmt: '描写场景内部的具体构造、布局分布，以及光影、气味、声音等多感官细节。' },
                { name: '驻留生态', pmt: '描述该地点平常会有什么样的生物、人群活动，以及此处的治安与潜在规则。' },
                { name: '潜藏探索点', pmt: '列出地点内部隐藏着的一个秘密、精密机关、诱人宝藏，或是一处存在致命危险的未探明区域。' }
            ]
        },
        {
            id: 'def_event', name: '随机事件生成器', tag: '事件', icon: '🎲', isDefault: true,
            sys: '请根据上下文内容和用户需求，推演并立刻生成一场能改变角色现状的突发事件，拒绝平淡安稳，制造极具张力的戏剧冲突！',
            namePrompt: '为这场随机突发事件起一个极具戏剧张力的名字（如：血月之反叛）。',
            fields: [
                { name: '事件肇始', pmt: '描写事件最初被触发爆发时的细微征兆或第一接触画面（例如：突兀的巨响、通讯的中断、地面的猛颤）。' },
                { name: '核心冲突', pmt: '详细勾勒事件爆发的后果、危险波及程度，以及它正在采取何种手段直接威胁主角团。' },
                { name: '牵涉因素', pmt: '交代这场事件背后是否有暗推手、无辜卷入的第三方，或者是某种巧合产生的碰撞。' },
                { name: '破局关键', pmt: '给出1至2个摆在角色面前的艰难选择，或者暗示现场遗留着的一丝可能的解决途径。' }
            ]
        }
    ];

    // --- 全局架构表 ---
    const AppState = {
        configLoaded: false,
        globalCfg: {
            uiTheme: 'light', showFab: true, limitBreakPrompt: '你是一个强大的创作助手，拥有极强的发散想象能力。',
            historyMax: 4, wbTri: 'selective', wbPos: 'after_character_definition', wbOrd: 100,
            charExtractTag: '', userExtractTag: '', excludeRegexes: []
        },
        customGenerators: [], generatorOrder: [], generators: [], activeIndex: 0,
        apiSettings: {
            apiType: 'openai', apiUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', apiKey: '', model: 'gemini-2.5-flash-lite',
            temperature: 0.8, maxTokens: 12000, topP: 0.9, frequencyPenalty: 0, presencePenalty: 0
        },
        tempFormData: {},
        activeRoleWorldbook: null,
        curCharName: '全局通用',
        allWbNames: [],
        wbCacheMap: {},
        savedWbSelections: {},
        wbViewShowAll: false,
        wbViewExpanded: new Set(),
        lastGeneratedPrompt: "",
        historyData: []
    };

    let floatingBall = null; let mainModal = null; let previewModal = null; let historyModal = null;

    // ============================================
    // 工具层
    // ============================================
    function log(msg, type = 'info') { console.log(`[多功能生成器] ${msg}`); if (typeof toastr !== 'undefined') toastr[type](msg); }
    const safeRun = typeof errorCatched === 'function' ? errorCatched : (fn) => async (...args) => { try { return await fn(...args); } catch (e) { log(e.message, 'error'); } };
    function saveStorage(key, data) { try { hostWindow.localStorage.setItem(key, JSON.stringify(data)); } catch (e) { } }

    function loadStorage(key, defaultVal) {
        try {
            const r = hostWindow.localStorage.getItem(key);
            if (!r) return defaultVal;
            const parsed = JSON.parse(r);
            if (Array.isArray(defaultVal)) return Array.isArray(parsed) ? parsed : defaultVal;
            return { ...defaultVal, ...parsed };
        } catch (e) {
            return defaultVal;
        }
    }

    function uuidGen() { if (typeof builtin !== 'undefined' && builtin.uuidv4) return builtin.uuidv4(); return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function () { return (Math.random() * 16 | 0).toString(16); }); }
    async function safetyClipboard(txt) { if (typeof builtin !== 'undefined' && builtin.copyText) { builtin.copyText(txt); return true; } const t = document.createElement("textarea"); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) { } document.body.removeChild(t); return true; }

    function applyExclusions(text) {
        if(!text) return "";
        let res = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
        const rules = AppState.globalCfg.excludeRegexes || [];
        rules.forEach(r => { try { res = res.replace(new RegExp(r, 'gi'), ''); } catch(e){} });
        return res;
    }

    // ============================================
    // 载入与序列层
    // ============================================
    async function loadConfiguration() {
        AppState.globalCfg = loadStorage(STORAGE_KEY_UI, AppState.globalCfg);
        if (!AppState.globalCfg.excludeRegexes) AppState.globalCfg.excludeRegexes = [];
        AppState.apiSettings = loadStorage(STORAGE_KEY_API, AppState.apiSettings);
        AppState.savedWbSelections = loadStorage(STORAGE_KEY_WB_V4, {});
        AppState.historyData = loadStorage(STORAGE_KEY_HISTORY, []);

        let customJSON = null;
        try { if (typeof getVariables === 'function') customJSON = getVariables({ type: 'global' })[STORAGE_KEY_CUSTOM_GEN]; } catch (e) { }
        if (!customJSON) customJSON = hostWindow.localStorage.getItem(STORAGE_KEY_CUSTOM_GEN);
        AppState.customGenerators = customJSON ? JSON.parse(customJSON) : [];

        let rawOrder = null;
        try { if (typeof getVariables === 'function') rawOrder = getVariables({ type: 'global' })[STORAGE_KEY_GEN_ORDER]; } catch(e){}
        if (!rawOrder) rawOrder = hostWindow.localStorage.getItem(STORAGE_KEY_GEN_ORDER);
        let parsedOrder = rawOrder ? JSON.parse(rawOrder) : [];
        if (!Array.isArray(parsedOrder)) parsedOrder = [];
        AppState.generatorOrder = parsedOrder;

        compileGenerators();
        AppState.configLoaded = true;
        return true;
    }

    function saveCustomGenerators() {
        const jsonStr = JSON.stringify(AppState.customGenerators);
        try { if (typeof insertOrAssignVariables === 'function') { let p = {}; p[STORAGE_KEY_CUSTOM_GEN] = jsonStr; insertOrAssignVariables(p, { type: 'global' }); } } catch (e) { }
        saveStorage(STORAGE_KEY_CUSTOM_GEN, jsonStr);
    }

    function saveOrder() {
        const jsonStr = JSON.stringify(AppState.generatorOrder);
        try { if (typeof insertOrAssignVariables === 'function') { let p = {}; p[STORAGE_KEY_GEN_ORDER] = jsonStr; insertOrAssignVariables(p, { type: 'global' }); } } catch (e) { }
        saveStorage(STORAGE_KEY_GEN_ORDER, AppState.generatorOrder);
    }

    function compileGenerators() {
        let defs = JSON.parse(JSON.stringify(DEFAULT_GENERATORS));
        let cMap = {}; AppState.customGenerators.forEach(c => cMap[c.id] = c);
        let unmerged = []; AppState.customGenerators.forEach(c => { if (!c.id.startsWith('def_')) unmerged.push(c); });
        AppState.generators = defs.map(d => cMap[d.id] ? cMap[d.id] : d).concat(unmerged);

        if (AppState.generatorOrder.length > 0) {
            AppState.generators.sort((a, b) => {
                let ia = AppState.generatorOrder.indexOf(a.id); let ib = AppState.generatorOrder.indexOf(b.id);
                if (ia === -1) ia = 999; if (ib === -1) ib = 999;
                return ia - ib;
            });
        }
        AppState.generators.forEach((g, idx) => {
            if (!AppState.tempFormData[idx]) {
                AppState.tempFormData[idx] = {
                    namePrompt: g.namePrompt || '为该对象生成一个合适的名字，可附带别称（用括号包裹）。',
                    fields: JSON.parse(JSON.stringify(g.fields)),
                    style: '', historyCount: AppState.globalCfg.historyMax, historyExtra: '',
                    genOnly: '', genNot: '', allowFreeGen: false, extraReq: ''
                };
            }
        });
    }

    async function ensureWbFetched(wbName) {
        if (!wbName) return false;
        if (!AppState.wbCacheMap[wbName]) {
            if (typeof getWorldbook === 'function') {
                const arr = await getWorldbook(wbName);
                if (arr) AppState.wbCacheMap[wbName] = arr;
            } else { AppState.wbCacheMap[wbName] = []; }
        }
        return true;
    }

    async function loadCurrentWorldbookContext() {
        try {
            if (typeof getCurrentCharacterName === 'function') {
                const name = await getCurrentCharacterName();
                if (name) AppState.curCharName = name;
            } else if (typeof getCharData === 'function') {
                const cdata = getCharData('current');
                if (cdata && cdata.name) AppState.curCharName = cdata.name;
            }
        } catch (e) {}

        if (!AppState.savedWbSelections[AppState.curCharName]) {
            AppState.savedWbSelections[AppState.curCharName] = {};
        }

        try {
            if (typeof getWorldbookNames === 'function') AppState.allWbNames = await getWorldbookNames() || [];
            if (typeof getCharWorldbookNames === 'function') {
                const binds = await getCharWorldbookNames('current');
                const target = binds.primary || (binds.additional && binds.additional[0]);
                if (target) {
                    AppState.activeRoleWorldbook = target;
                    if (!AppState.savedWbSelections[AppState.curCharName][target]) {
                        AppState.savedWbSelections[AppState.curCharName][target] = { enabled: true, entries: [] };
                    }
                    await ensureWbFetched(target);
                } else {
                    AppState.activeRoleWorldbook = null;
                }
            }
        } catch(e){}
    }

    // ============================================
    // 视图封装 (CSS)
    // ============================================
    function buildBaseModal(id, zIndex = 9999999) {
        const m = hostWindow.document.createElement('div'); m.id = 'multigen-' + id;
        m.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100vh; height: 100dvh;
            background: rgba(0,0,0,0.75); backdrop-filter: blur(5px); z-index: ${zIndex};
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            overflow: hidden; touch-action: pan-y;
        `;
        return m;
    }

    function injectCSS() {
        if (hostWindow.document.getElementById('multigen-styles')) return;
        const style = hostWindow.document.createElement('style');
        style.id = 'multigen-styles';
        style.textContent = `
            @keyframes mg-fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
            .mg-theme-light { --bg: #ffffff; --bg-sec: #f6f8fa; --text: #171717; --border: #cbd5e1; --primary: #3b82f6; --primary-hover: #2563eb; --ph-color: #6b7280; }
            .mg-theme-dark  { --bg: #1e293b; --bg-sec: #0f172a; --text: #ffffff; --border: #334155; --primary: #3b82f6; --primary-hover: #2563eb; --ph-color: #cbd5e1; }

            .mg-theme-light .mg-custom-append::-webkit-input-placeholder { color: #171717 !important; font-weight: bold; opacity: 0.6; }
            .mg-theme-dark .mg-custom-append::-webkit-input-placeholder { color: #f1f5f9 !important; font-weight: bold; opacity: 0.6; }

            .mg-container { background: var(--bg); color: var(--text); border-radius: 16px; width: 92%; max-width: 960px; height: 86vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.5); animation: mg-fadeIn 0.2s ease-out; overflow: hidden; }
            .mg-header { padding: 16px 24px; background: var(--bg-sec); border-bottom: 2px solid var(--primary); display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 18px; }
            .mg-close { cursor: pointer; font-size: 26px; color: var(--text); opacity: 0.6; line-height: 1; margin-left: 15px;}
            .mg-close:hover { opacity: 1; color: #ef4444; }
            .mg-body { display: flex; flex: 1; overflow: hidden; }
            .mg-sidebar { width: 220px; border-right: 1px solid var(--border); overflow-y: auto; background: var(--bg-sec); flex-shrink:0; }
            .mg-content { flex: 1; padding: 24px; overflow-y: auto; overflow-x: hidden; }
            .mg-nav-item { padding: 14px 20px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; border-left: 4px solid transparent; font-size: 15px; }
            .mg-nav-item:hover { background: rgba(120,120,120,0.1); }
            .mg-nav-item.active { background: var(--bg); border-left-color: var(--primary); font-weight: bold; }
            .mg-block { border: 1px solid var(--border); border-radius: 10px; margin-bottom: 24px; background: var(--bg); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .mg-block-header { padding: 14px 18px; background: var(--bg-sec); font-weight: auto; border-bottom: 1px solid var(--border); border-radius: 10px 10px 0 0; }
            .mg-block-body { padding: 20px; display: flex; flex-direction: column;}
            .mg-input { width: 100%; box-sizing: border-box; padding: 12px 14px; margin: 6px 0 16px 0; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-family: inherit; font-size: 15px; transition: border 0.2s; }
            .mg-input:focus { border-color: var(--primary); outline: none; }
            .mg-input::placeholder { color: var(--ph-color); opacity: 1; font-weight: normal; }
            .mg-input-inline { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); text-align: center; }
            .mg-btn { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 15px; }
            .mg-btn:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
            .mg-btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
            .mg-btn-outline:hover { background: rgba(120,120,120,0.05); box-shadow: none;}
            .mg-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
            .mg-field-row { background: var(--bg-sec); padding: 14px 18px; border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--border); overflow:hidden; }
            .mg-twocol { display: flex; gap: 16px; flex-wrap: wrap; }
            .mg-twocol > div { flex: 1 1 200px; min-width: 0; box-sizing: border-box; }
            .mg-desc { font-size: 13px; opacity: 0.6; font-weight: normal; margin-left: 6px;}

            .mg-scroll::-webkit-scrollbar { width: 6px; }
            .mg-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
            .pmt-scroll::-webkit-scrollbar { width: 16px; background: rgba(0,0,0,0.05); border-radius: 8px;}
            .pmt-scroll::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 8px; border: 4px solid transparent; background-clip: padding-box; }

            .mg-gen-item { background:var(--bg); border-bottom:1px solid var(--border); padding: 16px; display:flex; flex-direction:column; gap:12px; }

            .wb-tree-node { border: 2px solid var(--border); border-radius: 8px; margin-bottom: 12px; overflow:hidden; background: var(--bg); box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
            .wb-tree-head { display:flex; align-items:center; padding:12px 14px; background:var(--bg-sec); cursor:pointer; font-size:15px; }
            .wb-tree-body { padding:14px; border-top:1px solid var(--border); background:var(--bg); }

            /* 适配手机端与动态视口，彻底解决地址栏底端遮挡与按钮出界的问题 */
            @media (max-width: 850px) {
                .mg-container { width: 100%; height: 100%; height: 100dvh; max-height: 100dvh; border-radius: 0; }
                .mg-body { flex-direction: column; }
                .mg-sidebar { width: 100%; height: auto; display: flex; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); }
                .mg-nav-item { border-left: none; border-bottom: 4px solid transparent; white-space: nowrap; flex: 0 0 auto;}
                .mg-nav-item.active { border-left-color: transparent; border-bottom-color: var(--primary); }
            }
        `;
        hostWindow.document.head.appendChild(style);
    }

    const openMainModal = safeRun(async () => {
        if (!AppState.configLoaded) { const loaded = await loadConfiguration(); if (!loaded) return; }
        await loadCurrentWorldbookContext();
        injectCSS();
        if (!mainModal) { mainModal = buildBaseModal('main'); hostWindow.document.body.appendChild(mainModal); }
        renderMainModalUI();
    });

    function renderMainModalUI(tabSwitched = false) {
        const theme = AppState.globalCfg.uiTheme === 'dark' ? 'mg-theme-dark' : 'mg-theme-light';
        const isSettings = AppState.activeIndex === -1; const isBuilder = AppState.activeIndex === -2;
        const curGen = (!isSettings && !isBuilder) ? AppState.generators[AppState.activeIndex] : null;

        let navHtml = AppState.generators.map((g, i) => `<div class="mg-nav-item ${AppState.activeIndex === i ? 'active' : ''}" data-idx="${i}"><span>${g.icon || '📝'}</span> ${g.name}</div>`).join('');
        navHtml += `<div class="mg-nav-item ${isBuilder ? 'active' : ''}" data-idx="-2"><span>⚒️</span> 生成器工坊</div><div class="mg-nav-item ${isSettings ? 'active' : ''}" data-idx="-1"><span>⚙️</span> 设置与配置</div>`;

        let contentHtml = '';
        if (isSettings) contentHtml = renderSettingsHTML();
        else if (isBuilder) contentHtml = renderBuilderHTML();
        else contentHtml = renderGeneratorHTML(curGen, AppState.activeIndex);

        let container = mainModal.querySelector('.mg-container');
        let scrollArea = mainModal.querySelector('#mg-content-area');
        let savedScrollTop = scrollArea ? scrollArea.scrollTop : 0;

        if (!container) {
            mainModal.innerHTML = `<div class="mg-container ${theme}"><div class="mg-header"><div>🪄 多功能生成器 <span style="font-size:12px;opacity:0.6;font-weight:normal">v4.7.2</span></div><div class="mg-close" id="mg-close-main">×</div></div><div class="mg-body"><div class="mg-sidebar">${navHtml}</div><div class="mg-content mg-scroll" id="mg-content-area">${contentHtml}</div></div></div>`;
            mainModal.querySelector('#mg-close-main').onclick = () => { mainModal.remove(); mainModal = null; };
        } else {
            container.className = `mg-container ${theme}`;
            mainModal.querySelector('.mg-sidebar').innerHTML = navHtml; mainModal.querySelector('#mg-content-area').innerHTML = contentHtml;
        }

        mainModal.querySelectorAll('.mg-nav-item').forEach(el => {
            el.onclick = () => {
                if (!isSettings && !isBuilder) saveCurrentForm(AppState.activeIndex);
                const newIdx = parseInt(el.getAttribute('data-idx'));
                if (AppState.activeIndex !== newIdx) { AppState.activeIndex = newIdx; renderMainModalUI(true); }
            };
        });

        if (isSettings) bindSettingsEvents();
        else if (isBuilder) bindBuilderEvents();
        else if (curGen) { bindGeneratorEvents(AppState.activeIndex); renderWbAccordionBox(''); }

        if (container) { const currentScrollArea = mainModal.querySelector('#mg-content-area'); if (tabSwitched) currentScrollArea.scrollTop = 0; else currentScrollArea.scrollTop = savedScrollTop; }
    }

    // --- 设置页 ----
    function renderSettingsHTML() {
        const api = AppState.apiSettings; const cfg = AppState.globalCfg;
        return `
            <h2 style="margin-top:0">⚙️ 系统设置与配置</h2>
            <div class="mg-block"><div class="mg-block-header">✂️ 剧情提取规则 (默认去除 <think> 过程内容)</div><div class="mg-block-body"><p style="margin-top:0; font-size:14px; opacity:0.8; margin-bottom:16px;">如果您的预设包含大量推演思维链，请填入特定容器标签名去壳（不填尖括号）。若留空，则提取全文。</p><div class="mg-twocol"><div><label>AI 正文提取标签</label><input id="ui-char-tag" class="mg-input" placeholder="例如: content (留空即提取全文)" value="${cfg.charExtractTag || ''}"></div><div><label>用户输入提取标签</label><input id="ui-user-tag" class="mg-input" placeholder="例如: 本轮用户输入 (留空即提取全文)" value="${cfg.userExtractTag || ''}"></div></div></div></div>

            <div class="mg-block"><div class="mg-block-header">🚫 文本排异规则 (正则表达式过滤)</div><div class="mg-block-body">
                <p style="margin-top:0; font-size:14px; opacity:0.8;">历史消息与世界书内容提取时，将剔除被下方正则表达式所匹配的内容。</p>
                <div id="cfg-regex-list" style="margin-bottom:12px; display:flex; flex-direction:column; gap:8px;"></div>
                <div style="display:flex; gap:8px; align-items:flex-start;">
                    <textarea id="cfg-regex-input" class="mg-input mg-scroll" style="margin:0; flex:1; resize:vertical; min-height:40px; max-height:150px; font-family:monospace;" placeholder="例如: <状态数据>[\\s\\S]*?<\\/状态数据>"></textarea>
                    <button id="cfg-regex-add" class="mg-btn" style="margin:0; padding:8px 12px; font-size:13px; flex-shrink:0;">➕ 追加</button>
                </div>
            </div></div>

            <div class="mg-block"><div class="mg-block-header">🎨 交互与全局偏好配置</div><div class="mg-block-body"><div class="mg-twocol"><div><label>界面风格</label><select id="ui-theme" class="mg-input"><option value="light" ${cfg.uiTheme === 'light' ? 'selected' : ''}>浅色调 (Light)</option><option value="dark" ${cfg.uiTheme === 'dark' ? 'selected' : ''}>暗色调 (Dark)</option></select></div><div><label>显示悬浮球</label><select id="ui-fab" class="mg-input"><option value="true" ${cfg.showFab ? 'selected' : ''}>显示 (支持悬浮球拖拽)</option><option value="false" ${!cfg.showFab ? 'selected' : ''}>隐藏 (可在设置中恢复)</option></select></div></div><label>全局提示词</label><textarea id="ui-limit" class="mg-input" rows="2">${cfg.limitBreakPrompt}</textarea><div><label>默认历史抓取楼层数</label><input id="ui-hist" type="number" class="mg-input" value="${cfg.historyMax}"></div></div></div>
            <div class="mg-block"><div class="mg-block-header">🔖 世界书默认注入配置</div><div class="mg-block-body"><div class="mg-twocol"><div><label>触发方式</label><select id="wb-tri" class="mg-input"><option value="selective" ${cfg.wbTri === 'selective' ? 'selected' : ''}>🟢 绿灯 (关键词触发)</option><option value="constant" ${cfg.wbTri === 'constant' ? 'selected' : ''}>🔵 蓝灯 (常驻)</option></select></div><div><label>注入位置</label><select id="wb-pos" class="mg-input"><option value="after_character_definition" ${cfg.wbPos === 'after_character_definition' ? 'selected' : ''}>角色定义之后</option><option value="before_character_definition" ${cfg.wbPos === 'before_character_definition' ? 'selected' : ''}>角色定义之前</option></select></div><div><label>顺序排序号</label><input id="wb-ord" type="number" class="mg-input" value="${cfg.wbOrd || 100}"></div></div></div></div>
            <div class="mg-block"><div class="mg-block-header">🔌 大型语言模型 API 设定</div><div class="mg-block-body"><div class="mg-twocol"><div><label>接口协议</label><select id="cfg-type" class="mg-input"><option value="openai" ${api.apiType === 'openai' ? 'selected' : ''}>OpenAI 兼容协议</option><option value="claude" ${api.apiType === 'claude' ? 'selected' : ''}>Claude 协议</option></select></div><div><label>模型名称</label><div style="display:flex; gap:8px;"><input id="cfg-model" class="mg-input" style="flex:1; margin:0;" value="${api.model || ''}"><button id="btn-fetch-models" class="mg-btn" style="padding:0 12px; margin:0;" title="从该地址拉取可用模型列表">🔄拉取</button></div><select id="cfg-model-select" class="mg-input" style="display:none; margin-top:8px; margin-bottom:0;"></select></div></div><label style="margin-top:16px; display:block;">API 地址</label><input id="cfg-url" class="mg-input" value="${api.apiUrl || ''}"><label>API 密钥</label><input id="cfg-key" type="password" class="mg-input" value="${api.apiKey || ''}"><div class="mg-twocol" style="margin-bottom: 20px;"><div><label>温度</label><input id="cfg-temp" type="number" step="0.1" class="mg-input" value="${api.temperature}"></div><div><label>最大回复量 (Max Tokens)</label><input id="cfg-max" type="number" class="mg-input" value="${api.maxTokens}"></div></div><button class="mg-btn" id="cfg-save" style="width:100%;">💾 保存设置</button></div></div>
        `;
    }

    function bindSettingsEvents() {
        const root = mainModal;

        function refreshRegexListUI() {
            const wrap = root.querySelector('#cfg-regex-list');
            if (AppState.globalCfg.excludeRegexes.length === 0) {
                wrap.innerHTML = '<div style="font-size:12px; opacity:0.5;">(尚未配置任何排异规则)</div>';
            } else {
                wrap.innerHTML = AppState.globalCfg.excludeRegexes.map((rx, i) => `
                    <div style="display:flex; gap:8px; align-items:center; background:var(--bg-sec); padding:6px 12px; border:1px solid var(--border); border-radius:6px;">
                        <code style="flex:1; word-break:break-all; font-family:monospace; color:var(--text); opacity:0.8;">${rx}</code>
                        <button class="mg-btn-outline _del_regex" data-idx="${i}" style="border:none; color:#ef4444; padding:4px; font-weight:bold;">✖</button>
                    </div>
                `).join('');
                wrap.querySelectorAll('._del_regex').forEach(btn => btn.onclick = (e) => {
                     AppState.globalCfg.excludeRegexes.splice(parseInt(btn.getAttribute('data-idx'), 10), 1);
                     refreshRegexListUI();
                });
            }
        }
        refreshRegexListUI();

        root.querySelector('#cfg-regex-add').onclick = () => {
            const v = root.querySelector('#cfg-regex-input').value.trim();
            if(!v) return;
            try { new RegExp(v, 'g'); } catch(e) { alert("正则表达式语法错误，请检查转义字符。"); return; }
            AppState.globalCfg.excludeRegexes.push(v);
            root.querySelector('#cfg-regex-input').value = '';
            refreshRegexListUI();
        };

        root.querySelector('#cfg-save').onclick = () => {
            AppState.globalCfg.charExtractTag = root.querySelector('#ui-char-tag').value.trim(); AppState.globalCfg.userExtractTag = root.querySelector('#ui-user-tag').value.trim(); AppState.globalCfg.uiTheme = root.querySelector('#ui-theme').value; AppState.globalCfg.showFab = root.querySelector('#ui-fab').value === 'true'; AppState.globalCfg.limitBreakPrompt = root.querySelector('#ui-limit').value; AppState.globalCfg.historyMax = parseInt(root.querySelector('#ui-hist').value); AppState.globalCfg.wbTri = root.querySelector('#wb-tri').value; AppState.globalCfg.wbPos = root.querySelector('#wb-pos').value; AppState.globalCfg.wbOrd = parseInt(root.querySelector('#wb-ord').value); saveStorage(STORAGE_KEY_UI, AppState.globalCfg);
            AppState.apiSettings = { apiType: root.querySelector('#cfg-type').value, apiUrl: root.querySelector('#cfg-url').value, apiKey: root.querySelector('#cfg-key').value, model: root.querySelector('#cfg-model').value, temperature: parseFloat(root.querySelector('#cfg-temp').value), maxTokens: parseInt(root.querySelector('#cfg-max').value), topP: AppState.apiSettings.topP }; saveStorage(STORAGE_KEY_API, AppState.apiSettings);
            log('设置保存成功', 'success'); createFloatingBall(); renderMainModalUI();
        };

        const fetchBtn = root.querySelector('#btn-fetch-models');
        if (fetchBtn) {
            fetchBtn.onclick = safeRun(async () => {
                const apiurl = root.querySelector('#cfg-url').value; const key = root.querySelector('#cfg-key').value; if (!apiurl) { alert("请先填写大模型的 API 地址"); return; }
                const oldText = fetchBtn.innerText; fetchBtn.innerText = '⏳';
                try {
                    const models = await getModelList({ apiurl, key });
                    if (models && models.length > 0) {
                        const sel = root.querySelector('#cfg-model-select'); sel.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join(''); sel.style.display = 'block'; sel.onchange = () => { root.querySelector('#cfg-model').value = sel.value; };
                        const currentModel = root.querySelector('#cfg-model').value; if (models.includes(currentModel)) sel.value = currentModel; else sel.value = models[0] || currentModel; log('模型列表拉取成功', 'success');
                    } else { alert("未返回列表。"); }
                } catch (e) { alert("获取失败: " + e.message); }
                fetchBtn.innerText = oldText;
            });
        }
    }

    // --- 工坊页面 ---
    function renderBuilderHTML() {
        let listHtml = AppState.generators.map((g, gIdx) => {
            let isLocked = g.isDefault && !AppState.customGenerators.find(c => c.id === g.id);
            let toolBtns = isLocked ? `<button class="mg-btn-outline _builder_unlock" data-gid="${g.id}" style="padding:6px 12px; color:var(--primary); font-weight:bold;">🔒 编辑</button>` : `<button class="mg-btn-outline _builder_edit" data-gid="${g.id}" style="padding:6px 12px;">⚙️ 编辑</button>${g.isDefault ? `<button class="mg-btn-outline _builder_reset" data-gid="${g.id}" style="padding:6px 12px; color:#ef4444;" title="恢复默认">↺ 恢复默认</button>` : `<button class="mg-btn-outline _builder_del" data-gid="${g.id}" style="padding:6px 12px; color:#ef4444;">🗑️ 删除</button>`}`;
            return `<div class="mg-block mg-gen-item" draggable="true" data-gid="${g.id}"><div style="background:var(--bg); border:none; display:flex; flex-direction:column; gap:12px;"><div style="display:flex; align-items:center; gap:10px;"><span style="cursor:grab; opacity:0.5; font-size:18px; padding-right:10px;">≡</span><span style="font-size:20px;">${g.icon}</span><b style="font-size:16px; color:var(--text);">${g.name}</b><span class="mg-desc">(${g.tag})</span>${isLocked ? '' : '<span style="font-size:12px; background:rgba(16,185,129,0.1); color:#10b981; padding:2px 6px; border-radius:4px; font-weight:bold;">已修改</span>'}</div><div style="display:flex; gap:8px; flex-wrap:wrap;"><button class="mg-btn-outline _builder_exp" data-gid="${g.id}" style="padding:6px 12px;">📤 导出</button>${toolBtns}</div></div></div>`;
        }).join('');
        return `<h2 style="margin-top:0">⚒️ 生成器工坊</h2><p style="opacity:0.8; font-size:14px; margin-bottom:20px;">在此创建、编辑和管理自定义生成器。</p><div style="display:flex; gap:12px; margin-bottom:20px;"><button class="mg-btn" id="builder-add" style="flex:1; font-size:16px;">✨ 新建生成器</button><button class="mg-btn mg-btn-outline" id="builder-import" style="flex:1;">📥 导入生成器</button></div><hr style="border:none; border-top:1px dashed var(--border); margin-bottom:20px;"><div id="builder-list" style="display:flex; flex-direction:column; gap:10px;"><p style="opacity:0.6; font-size:13px; text-align:center;">（拖拽 ≡ 图标以重排序）</p>${listHtml}</div><div style="height: 60px;"></div>`;
    }

    function bindBuilderEvents() {
        const root = mainModal.querySelector('#mg-content-area');
        root.querySelector('#builder-add').onclick = () => openBuilderEditor(null);

        root.querySelector('#builder-import').onclick = () => {
            const theme = AppState.globalCfg.uiTheme === 'dark' ? 'mg-theme-dark' : 'mg-theme-light';
            const iModal = buildBaseModal('import');
            iModal.innerHTML = `
                <div class="mg-container ${theme}" style="max-width:600px; height:auto; max-height:85vh; box-shadow:0 10px 40px rgba(0,0,0,0.6);">
                    <div class="mg-header"><div>📥 导入代码片段</div><div class="mg-close" id="imp-close">×</div></div>
                    <div class="mg-body mg-scroll" style="flex-direction:column; padding:20px; overflow-y:auto;">
                        <p style="margin-top:0; font-size:14px; opacity:0.8; margin-bottom:12px;">请在下方粘贴生成器的 JSON 代码片段：</p>
                        <textarea id="imp-text" class="mg-input mg-scroll" style="flex:1 0 200px; min-height: 220px; resize:vertical; font-family:monospace; line-height: 1.5;" placeholder='{"name": "...", "tag": "...", "fields": [...]}'></textarea>
                        <div style="text-align:right; margin-top:20px; display:flex; justify-content:flex-end; gap:16px; margin-bottom: 20px;">
                            <button class="mg-btn mg-btn-outline" id="imp-cancel">取消</button>
                            <button class="mg-btn" id="imp-ok" style="padding:12px 30px;">📥 确认导入</button>
                        </div>
                    </div>
                </div>
            `;
            hostWindow.document.body.appendChild(iModal);

            const closer = () => iModal.remove();
            iModal.querySelector('#imp-close').onclick = closer;
            iModal.querySelector('#imp-cancel').onclick = closer;
            iModal.querySelector('#imp-ok').onclick = () => {
                const str = iModal.querySelector('#imp-text').value.trim();
                if (!str) { alert("粘贴内容为空。"); return; }
                try {
                    const obj = JSON.parse(str);
                    if (!obj.tag || !obj.fields) throw new Error("JSON 格式错误，缺少 tag 或 fields 字段");
                    obj.id = uuidGen(); obj.isDefault = false;
                    AppState.customGenerators.push(obj);
                    AppState.generatorOrder.push(obj.id);
                    saveCustomGenerators();
                    saveOrder();
                    compileGenerators();
                    renderMainModalUI();
                    log('导入成功', 'success');
                    closer();
                } catch (e) { alert("导入失败: " + e.message); }
            };
        };

        root.querySelectorAll('._builder_exp').forEach(btn => btn.onclick = async (e) => { const gid = e.target.getAttribute('data-gid'); const gen = AppState.generators.find(g => g.id === gid); const clone = JSON.parse(JSON.stringify(gen)); delete clone.id; delete clone.isDefault; await safetyClipboard(JSON.stringify(clone)); alert('生成器配置已复制到剪贴板。'); });
        root.querySelectorAll('._builder_unlock').forEach(btn => btn.onclick = (e) => { if (!confirm("确定要编辑此默认生成器吗？\n(如果后续需要，可以随时点击[恢复默认]撤销)")) return; openBuilderEditor(AppState.generators.find(g => g.id === e.target.getAttribute('data-gid'))); });
        root.querySelectorAll('._builder_edit').forEach(btn => btn.onclick = (e) => openBuilderEditor(AppState.generators.find(g => g.id === e.target.getAttribute('data-gid'))));
        root.querySelectorAll('._builder_del').forEach(btn => btn.onclick = (e) => {
            e.stopPropagation();
            if (!confirm("确定要删除此自定义生成器吗？此操作不可逆。")) return;
            const gid = e.target.getAttribute('data-gid');
            AppState.customGenerators = AppState.customGenerators.filter(c => c.id !== gid);
            AppState.generatorOrder = AppState.generatorOrder.filter(id => id !== gid);
            saveCustomGenerators();
            saveOrder();
            compileGenerators();
            renderMainModalUI();
            log('删除成功', 'info');
        });

        root.querySelectorAll('._builder_reset').forEach(btn => btn.onclick = (e) => { if (!confirm("确定要移除所有修改，恢复系统默认配置吗？")) return; const gid = e.target.getAttribute('data-gid'); AppState.customGenerators = AppState.customGenerators.filter(c => c.id !== gid); saveCustomGenerators(); compileGenerators(); renderMainModalUI(); });

        let dragGid = null; root.querySelectorAll('.mg-gen-item').forEach(row => { row.ondragstart = (e) => { dragGid = row.getAttribute('data-gid'); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragGid); setTimeout(() => row.style.opacity = '0.5', 0); }; row.ondragover = (e) => e.preventDefault(); row.ondragenter = (e) => { e.preventDefault(); row.style.border = "2px dashed var(--primary)"; }; row.ondragleave = (e) => { row.style.border = "none"; }; row.ondrop = (e) => { e.preventDefault(); row.style.border = "none"; let tGid = row.getAttribute('data-gid'); if (dragGid && dragGid !== tGid) { let curOrder = AppState.generators.map(g => g.id); let from = curOrder.indexOf(dragGid); let to = curOrder.indexOf(tGid); if (from > -1 && to > -1) { let item = curOrder.splice(from, 1)[0]; curOrder.splice(to, 0, item); AppState.generatorOrder = curOrder; saveOrder(); compileGenerators(); renderMainModalUI(); } } }; row.ondragend = () => { row.style.opacity = '1'; }; });
    }

    function openBuilderEditor(genObj) {
        const isNew = !genObj; let cGen = isNew ? { id: uuidGen(), name: '', tag: '', icon: '', sys: '', namePrompt: '为该对象生成一个合适的名字，可附带别称（用括号包裹）。', isDefault: false, fields: [] } : JSON.parse(JSON.stringify(genObj));
        let theme = AppState.globalCfg.uiTheme === 'dark' ? 'mg-theme-dark' : 'mg-theme-light'; let bModal = buildBaseModal('b_edit');
        bModal.innerHTML = `<div class="mg-container ${theme}" style="max-width:800px; height:90vh; max-height: 90dvh; box-shadow:0 0 100px rgba(0,0,0,0.8);"><div class="mg-header"><div>${isNew ? '✨ 新建生成器' : '⚙️ 编辑生成器'}</div><div class="mg-close" id="bedit-close">×</div></div><div class="mg-body mg-scroll" style="flex-direction:column; padding:20px; overflow-y:auto;" id="bedit-scroll"><div class="mg-twocol"><div><label>生成器名称</label><input id="be-name" class="mg-input" value="${cGen.name}" placeholder="例如：功法生成器"></div><div><label>提取标签</label><input id="be-tag" class="mg-input" value="${cGen.tag}" placeholder="例如：功法"></div><div><label>图标</label><input id="be-icon" class="mg-input" value="${cGen.icon}" placeholder="例如：📜"></div></div><label>System Prompt</label><textarea id="be-sys" class="mg-input mg-scroll" rows="8" placeholder="填写发给该生成器的基础规则与系统设定..." style="resize:vertical; min-height:120px; font-family:inherit;">${cGen.sys}</textarea><hr style="border:none; border-top:1px dashed var(--border); margin:12px 0;"><label>【固定首项】“名字”字段生成规则</label><textarea id="be-namepmt" class="mg-input" rows="2">${cGen.namePrompt || ''}</textarea><div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:10px; margin-bottom:10px;"><h4 style="margin:0; color:var(--text);">生成字段 <span style="font-size:12px; font-weight:normal; opacity:0.8;">(禁止使用“名字”或“关键词”作为字段名)</span></h4><span style="font-size:12px; opacity:0.6;">(拖拽 ≡ 图标调整顺序)</span></div><div id="be-fields-list"></div><button class="mg-btn mg-btn-outline" id="be-add-field" style="width:100%; border-style:dashed; margin-bottom:20px;">+ 新增字段</button><div style="flex:1;"></div><div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px; border-top:1px solid var(--border); padding-top:20px; padding-bottom: 20px;"><button class="mg-btn mg-btn-outline" id="be-cancel">取消</button><button class="mg-btn" id="be-save" style="padding:10px 40px;">💾 保存</button></div></div></div>`;
        hostWindow.document.body.appendChild(bModal);
        function syncDOM() { cGen.fields = Array.from(bModal.querySelectorAll('.mg-field-row')).map(row => ({ name: row.querySelector('._bf_name').value.trim(), pmt: row.querySelector('._bf_pmt').value.trim() })); }
        function renderFields() { const wrap = bModal.querySelector('#be-fields-list'); const sc = bModal.querySelector('#bedit-scroll'); const savedScroll = sc ? sc.scrollTop : 0; wrap.innerHTML = cGen.fields.map((f, i) => `<div class="mg-field-row" draggable="true" data-bidx="${i}" style="padding:12px; background:var(--bg-sec); border-radius:6px; margin-bottom:10px; border:1px solid var(--border);"><div style="display:flex; gap:10px; align-items:flex-start;"><span style="cursor:grab; opacity:0.5; margin-top:12px; font-size:18px;">≡</span><div style="flex:1; display:flex; flex-direction:column; gap:8px;"><input class="mg-input _bf_name" style="margin:0; font-weight:bold;" placeholder="字段名称" value="${f.name}"><textarea class="mg-input _bf_pmt" rows="2" style="margin:0; resize:vertical;" placeholder="撰写该节点的格式逻辑限制...">${f.pmt}</textarea></div><button class="mg-btn-outline _del_bf" title="删除该项" style="padding:6px 12px; color:#ef4444; border:none; margin-top:8px;">🗑️</button></div></div>`).join(''); wrap.querySelectorAll('._del_bf').forEach(btn => { btn.onclick = (e) => { syncDOM(); const i = parseInt(e.target.closest('.mg-field-row').getAttribute('data-bidx')); cGen.fields.splice(i, 1); renderFields(); } }); let dragIdx = null; wrap.querySelectorAll('.mg-field-row').forEach(row => { row.ondragstart = (e) => { syncDOM(); dragIdx = parseInt(row.getAttribute('data-bidx')); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragIdx); setTimeout(() => row.style.opacity = '0.5', 0); }; row.ondragover = (e) => e.preventDefault(); row.ondragenter = (e) => { e.preventDefault(); row.style.border = "2px dashed var(--primary)"; }; row.ondragleave = (e) => { row.style.border = "1px solid var(--border)"; }; row.ondrop = (e) => { e.preventDefault(); row.style.border = "1px solid var(--border)"; let tIdx = parseInt(row.getAttribute('data-bidx')); if (dragIdx !== null && dragIdx !== tIdx) { let item = cGen.fields.splice(dragIdx, 1)[0]; cGen.fields.splice(tIdx, 0, item); renderFields(); } }; row.ondragend = () => { row.style.opacity = '1'; }; }); if (sc) sc.scrollTop = savedScroll; }
        renderFields();
        bModal.querySelector('#be-add-field').onclick = () => { syncDOM(); cGen.fields.push({ name: '', pmt: '' }); renderFields(); };
        const closer = () => { bModal.remove(); }; bModal.querySelector('#bedit-close').onclick = closer; bModal.querySelector('#be-cancel').onclick = closer;
        bModal.querySelector('#be-save').onclick = () => { syncDOM(); cGen.name = bModal.querySelector('#be-name').value.trim(); cGen.tag = bModal.querySelector('#be-tag').value.trim(); cGen.icon = bModal.querySelector('#be-icon').value.trim(); cGen.sys = bModal.querySelector('#be-sys').value.trim(); cGen.namePrompt = bModal.querySelector('#be-namepmt').value.trim(); if (!cGen.name || !cGen.tag || !cGen.icon || !cGen.sys || !cGen.namePrompt) { alert("生成器名称、标签、图标、名称规则或 System Prompt 为空，请填写完整！"); return; } if (cGen.fields.length === 0) { alert("至少必须添加一条字段定义"); return; } for (let i = 0; i < cGen.fields.length; i++) { if (!cGen.fields[i].name || !cGen.fields[i].pmt) { alert(`第 ${i + 1} 个字段信息空缺！`); return; } } if (cGen.fields.some(f => f.name.includes('名字') || f.name.includes('关键'))) { alert("禁止使用“名字”或“关键词”作为字段名。"); return; } let existIdx = AppState.customGenerators.findIndex(c => c.id === cGen.id); if (existIdx !== -1) AppState.customGenerators[existIdx] = cGen; else AppState.customGenerators.push(cGen); if (existIdx === -1) AppState.generatorOrder.push(cGen.id); saveCustomGenerators(); saveOrder(); compileGenerators(); bModal.remove(); renderMainModalUI(); log('配置已保存', 'success'); };
    }

    // --- 主面板渲染 ---
    function renderGeneratorHTML(gen, idx) {
        const tData = AppState.tempFormData[idx];
        let fixedNameHtml = `<div class="mg-field-row" style="border-left:4px solid var(--primary);"><div style="font-weight:bold; margin-bottom:10px; font-size:16px;"><span>🏷️ 固定字段: 名字</span></div><textarea class="mg-input" id="fixed-name-pmt" rows="2" style="margin:0; resize:vertical; font-family:inherit;" placeholder="请对生成的名称做细节规则要求...">${tData.namePrompt || ''}</textarea></div>`;
        let fieldsHtml = tData.fields.map((f, fidx) => `<div class="mg-field-row" data-fidx="${fidx}" draggable="true"><div style="font-weight:bold; margin-bottom:10px; font-size:16px; display:flex; justify-content:space-between; align-items:center;"><span><span style="cursor:grab; opacity:0.5; margin-right:8px;" title="拖拽调整顺序">≡</span>🏷️ 字段: ${f.name}</span><button class="mg-btn-outline _del_field" title="删除该项" style="padding:4px 8px; font-size:13px; cursor:pointer; border-color:transparent; color:#ef4444;">🗑️</button></div><textarea class="mg-input f-pmt" rows="2" style="margin:0; resize:vertical; font-family:inherit;" placeholder="请输入该字段的限定提示词...">${f.pmt || ''}</textarea></div>`).join('');
        return `
            <h2 style="margin-top:0">${gen.name}</h2>
            <details class="mg-block" open>
                <summary class="mg-block-header" style="cursor:pointer; user-select:none;">📂 上下文参考设置</summary>
                <div class="mg-block-body">
                    <div style="margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                            <b style="font-size:15px;">📚 关联世界书条目</b>
                            <button class="mg-btn-outline" id="wb-refresh-btn" style="padding:4px 10px; font-size:12px; font-weight:bold;">🔄 刷新数据</button>
                        </div>
                        <div style="display:flex; gap:10px; margin-top:10px; margin-bottom:10px;">
                            <input id="wb-search-input" class="mg-input" style="flex:1; margin:0;" placeholder="搜索条目名称或关键词...">
                        </div>
                        <div id="wb-accordion-area" class="mg-scroll" style="min-height:40px; max-height:300px; overflow-y:auto; border:1px solid var(--border); border-radius:8px; padding:10px; background:var(--bg-sec);">
                        </div>

                        <div style="margin-top:16px;">
                            <b style="font-size:14px; opacity:0.8;">已选中的世界书条目 <span class="mg-desc">(可在此取消勾选)</span></b>
                            <div id="wb-selected-area" class="mg-scroll" style="margin-top:8px; min-height:40px; max-height:200px; overflow-y:auto; border:1px solid var(--border); border-radius:8px; padding:10px; background:var(--bg);">
                                <!-- dynamic -->
                            </div>
                        </div>

                    </div>

                    <div class="mg-twocol" style="margin-bottom:12px; background:var(--bg); border:1px dashed var(--border); padding:10px; border-radius:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <b>💬 历史消息参考</b>
                            <input type="number" id="gen-hist" class="mg-input-inline" style="width:60px; height: 32px; margin:0;" value="${tData.historyCount}">
                            <span class="mg-desc">楼 (0则不包含)</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <b>📌 额外指定楼层</b>
                            <input type="text" id="gen-hist-extra" class="mg-input-inline" style="flex:1; max-width:140px; height: 32px; margin:0;" value="${tData.historyExtra || ''}" placeholder="如: 9,15 (选填)">
                        </div>
                    </div>

                    <div style="background:var(--bg-sec); padding:16px; border-radius:8px; margin-top:10px; border: 1px solid rgba(0,0,0,0.05);"><label style="display:flex; align-items:center; cursor:pointer; font-weight:bold; color:var(--primary); margin-bottom:12px;"><input type="checkbox" id="gen-free" style="transform: scale(1.2); margin-right:8px;" ${tData.allowFreeGen ? 'checked' : ''}>允许 AI 适度发散创造 (不勾选则严格限制范围)</label><input id="gen-only" class="mg-input" style="margin-bottom:10px;" placeholder="生成的主旨/倾向是什么？[选填]" value="${tData.genOnly}"><input id="gen-not" class="mg-input" style="margin-bottom:4px;" placeholder="规避/不生成的内容是什么？[选填]" value="${tData.genNot}"></div>
                </div>
            </details>
            <div class="mg-block"><div class="mg-block-header">📝 局部指令限定</div><div class="mg-block-body"><p style="font-size:13px; opacity:0.8; margin-top:0;">以下设置将在本次生成中覆盖默认设定。</p><b>额外要求</b><input class="mg-input" id="gen-extra" placeholder="例如：强制要求主角受伤..." value="${tData.extraReq}"><b>文笔风格/基调</b><input class="mg-input" id="gen-style" style="margin-bottom:16px;" placeholder="例如：悲壮史诗、惊悚悬疑..." value="${tData.style}"><hr style="border:none; border-top: 1px dashed var(--border); margin:0 0 16px 0;"><div id="gen-fields" style="background:var(--bg-sec); padding:16px; border-radius:10px;">${fixedNameHtml}${fieldsHtml}<button class="mg-btn mg-btn-outline" id="btn-add-field" style="width:100%; border-style: dashed; padding: 10px; font-weight:normal;">+ 新增字段</button></div></div></div>
            <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:20px;"><button class="mg-btn mg-btn-outline" id="btn-reset">🗑️ 重置当前表单</button><button class="mg-btn" id="btn-gen" style="font-size:16px; padding: 12px 40px; box-shadow: 0 4px 15px rgba(59,130,246,0.4)">🚀 开始生成</button></div><div style="height: 60px;"></div>
        `;
    }

    // --- 世界书挂载树与汇总区渲染 ---
    function renderWbAccordionBox(query = '') {
        const area = mainModal.querySelector('#wb-accordion-area'); if (!area) return;
        let charData = AppState.savedWbSelections[AppState.curCharName] || {};
        let wbsToShow = new Set();
        if (AppState.activeRoleWorldbook) wbsToShow.add(AppState.activeRoleWorldbook);
        Object.keys(charData).forEach(k => { if (charData[k].enabled || (charData[k].entries && charData[k].entries.length > 0)) wbsToShow.add(k); });
        if (AppState.wbViewShowAll) AppState.allWbNames.forEach(n => wbsToShow.add(n));

        let sortedWbs = Array.from(wbsToShow).sort((a,b) => {
            let aEnabled = charData[a]?.enabled ? 1 : 0; let bEnabled = charData[b]?.enabled ? 1 : 0;
            if (aEnabled !== bEnabled) return bEnabled - aEnabled; return a.localeCompare(b);
        });

        if (sortedWbs.length === 0) { area.innerHTML = '<div style="margin: 10px; font-size:13px; opacity:0.6; text-align:center;">暂无世界书数据</div>'; return; }

        let html = '';
        if (query.trim()) {
            const q = query.toLowerCase(); let hitCount = 0;
            sortedWbs.forEach(wbName => {
                const cnf = charData[wbName]; const isEnabled = cnf ? cnf.enabled : false;
                if (!isEnabled) return;
                const srcArr = AppState.wbCacheMap[wbName] || [];
                srcArr.forEach(e => {
                    const kStr = e.strategy?.keys ? e.strategy.keys.join(',') : '';
                    if (e.name.toLowerCase().includes(q) || kStr.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)) {
                        hitCount++; const isSel = cnf.entries && cnf.entries.includes(e.name);
                        html += `<div style="display:flex; align-items:center; margin-bottom:8px; padding:6px; background:var(--bg); border:1px solid ${isSel ? 'var(--primary)': 'var(--border)'}; border-radius:6px;">
                            <input type="checkbox" class="wb-item-chk" data-wb="${wbName}" data-en="${e.name}" ${isSel?'checked':''}>
                            <div style="flex:1; margin-left:8px;"><b style="opacity:0.6;font-size:12px;">[${wbName}]</b> ${e.name}</div>
                            <span class="wb-item-view" data-wb="${wbName}" data-en="${e.name}" style="cursor:pointer; opacity:0.7;">👁️</span>
                        </div>`;
                    }
                });
            });
            html = hitCount === 0 ? '<div style="opacity:0.5; text-align:center;">未找到匹配项。</div>' : html;
        } else {
            sortedWbs.forEach(wbName => {
                const cnf = charData[wbName] || {}; const isEnabled = cnf.enabled || false; const isExp = AppState.wbViewExpanded.has(wbName);
                const hasCache = !!AppState.wbCacheMap[wbName];

                let entries = (AppState.wbCacheMap[wbName] || []).slice().sort((a,b) => {
                    let oa = (a.position && a.position.order !== undefined) ? a.position.order : 100;
                    let ob = (b.position && b.position.order !== undefined) ? b.position.order : 100;
                    return oa - ob;
                });

                const innerLoad = !hasCache ? `<div style="text-align:center; padding:10px; opacity:0.6">⏳ 勾选后加载详细条目...</div>` : `
                    <div style="margin-bottom:10px;"><button class="mg-btn-outline wb-sel-all" data-wb="${wbName}" style="padding:4px 8px;font-size:12px;">全选</button> <button class="mg-btn-outline wb-unsel-all" data-wb="${wbName}" style="padding:4px 8px;font-size:12px;">取消全选</button></div>
                    ${entries.map(e => `<div style="display:flex; align-items:center; margin-bottom:6px; padding-bottom:6px; border-bottom:1px solid rgba(120,120,120,0.1);"><input type="checkbox" class="wb-item-chk" data-wb="${wbName}" data-en="${e.name}" ${!isEnabled?'disabled':''} ${cnf.entries&&cnf.entries.includes(e.name)?'checked':''}><span style="flex:1; margin-left:8px; opacity: ${isEnabled?'1':'0.5'}">${e.name}</span><span class="wb-item-view" data-wb="${wbName}" data-en="${e.name}" style="cursor:pointer; opacity:0.7;">👁️</span></div>`).join('')}
                `;
                html += `
                <div class="wb-tree-node">
                    <div class="wb-tree-head">
                        <input type="checkbox" class="wb-grp-chk" data-wb="${wbName}" ${isEnabled ? 'checked':''}>
                        <b class="wb-grp-title" data-wb="${wbName}" style="flex:1; margin-left:8px;">${wbName}</b>
                        <span class="wb-grp-title" data-wb="${wbName}">${isExp ? '▲' : '▼'}</span>
                    </div>
                    ${isExp ? `<div class="wb-tree-body">${innerLoad}</div>` : ''}
                </div>`;
            });
            if (!AppState.wbViewShowAll && AppState.allWbNames.length > wbsToShow.size) {
                html += `<button class="mg-btn-outline" id="wb-btn-more" style="width:100%; border-style:dashed;">⬇️ 加载所有世界书</button>`;
            }
        }
        area.innerHTML = html;

        area.querySelectorAll('.wb-grp-chk').forEach(cb => cb.onchange = async (e) => {
            const wN = e.target.getAttribute('data-wb'); if (!charData[wN]) charData[wN] = { enabled: false, entries: [] };
            charData[wN].enabled = e.target.checked; saveStorage(STORAGE_KEY_WB_V4, AppState.savedWbSelections);
            if (e.target.checked && AppState.wbViewExpanded.has(wN) && !AppState.wbCacheMap[wN]) { await ensureWbFetched(wN); }
            renderWbAccordionBox(query);
        });
        area.querySelectorAll('.wb-grp-title').forEach(span => span.onclick = async (e) => {
            const wN = e.target.getAttribute('data-wb');
            if (AppState.wbViewExpanded.has(wN)) AppState.wbViewExpanded.delete(wN); else { AppState.wbViewExpanded.add(wN); if(charData[wN] && charData[wN].enabled && !AppState.wbCacheMap[wN]) await ensureWbFetched(wN); }
            renderWbAccordionBox(query);
        });
        area.querySelectorAll('.wb-item-chk').forEach(cb => cb.onchange = (e) => {
            const wN = e.target.getAttribute('data-wb'); const eN = e.target.getAttribute('data-en');
            if (!charData[wN]) charData[wN] = { enabled: true, entries: [] }; if (!charData[wN].entries) charData[wN].entries = [];
            if (e.target.checked) { if (!charData[wN].entries.includes(eN)) charData[wN].entries.push(eN); } else { charData[wN].entries = charData[wN].entries.filter(x => x !== eN); }
            saveStorage(STORAGE_KEY_WB_V4, AppState.savedWbSelections); renderWbAccordionBox(query);
        });
        area.querySelectorAll('.wb-sel-all').forEach(btn => btn.onclick = (e) => {
            const wN = e.target.getAttribute('data-wb'); const arr = AppState.wbCacheMap[wN];
            if (arr.length > 20) { if (!confirm(`⚠️ 注意：\n当前世界书包含 ${arr.length} 个条目。\n强行选中过多条目会导致上下文 Token 超载，是否继续全选？`)) return; }
            if (!charData[wN]) charData[wN] = { enabled: true, entries: [] };
            charData[wN].entries = arr.map(x => x.name); saveStorage(STORAGE_KEY_WB_V4, AppState.savedWbSelections); renderWbAccordionBox(query);
        });
        area.querySelectorAll('.wb-unsel-all').forEach(btn => btn.onclick = (e) => {
            const wN = e.target.getAttribute('data-wb'); if (charData[wN]) charData[wN].entries = []; saveStorage(STORAGE_KEY_WB_V4, AppState.savedWbSelections); renderWbAccordionBox(query);
        });
        const moreBtn = area.querySelector('#wb-btn-more');
        if (moreBtn) moreBtn.onclick = async () => { AppState.wbViewShowAll = true; renderWbAccordionBox(query); };

        const selArea = mainModal.querySelector('#wb-selected-area');
        if (selArea) {
            let selHtml = ''; let totalSelected = 0;
            Object.keys(charData).forEach(wbName => {
                const cnf = charData[wbName] || {};
                if (cnf.entries && cnf.entries.length > 0) {
                    const isWbEnabled = cnf.enabled;
                    let entList = cnf.entries.slice();
                    const cache = AppState.wbCacheMap[wbName];
                    if (cache) {
                        entList.sort((a,b) => {
                            const ea = cache.find(x=>x.name===a); const eb = cache.find(x=>x.name===b);
                            const oa = ea && ea.position && ea.position.order !== undefined ? ea.position.order : 100;
                            const ob = eb && eb.position && eb.position.order !== undefined ? eb.position.order : 100;
                            return oa - ob;
                        });
                    }
                    entList.forEach(eName => {
                        totalSelected++;
                        selHtml += `
                        <div style="display:flex; align-items:center; margin-bottom:6px; padding:6px; border:1px solid var(--border); border-radius:6px; background:var(--bg-sec);">
                            <input type="checkbox" class="wb-sel-chk" data-wb="${wbName}" data-en="${eName}" checked>
                            <div style="flex:1; margin-left:8px; font-size:14px;">
                                <span style="font-size:12px; opacity:${isWbEnabled ? '0.8' : '0.3'};">[${wbName}]</span>
                                <span style="margin-left:4px;">${eName}</span>
                            </div>
                            <span class="wb-item-view" data-wb="${wbName}" data-en="${eName}" style="cursor:pointer; opacity:0.7;">👁️</span>
                        </div>`;
                    });
                }
            });

            if (totalSelected === 0) selHtml = '<div style="opacity:0.5; text-align:center; padding: 10px;">尚未选择任何条目</div>';
            else selHtml += `<div style="text-align:right; margin-top:8px;"><button class="mg-btn-outline" id="wb-clear-all" style="padding:4px 10px; font-size:12px; color:#ef4444; border:1px solid #ef4444; border-radius:4px; cursor:pointer; background:transparent;">🗑️ 清空已选条目</button></div>`;

            selArea.innerHTML = selHtml;

            selArea.querySelectorAll('.wb-sel-chk').forEach(cb => {
                cb.onchange = (e) => {
                    const wN = e.target.getAttribute('data-wb'); const eN = e.target.getAttribute('data-en');
                    if (charData[wN] && charData[wN].entries) {
                        charData[wN].entries = charData[wN].entries.filter(x => x !== eN);
                        saveStorage(STORAGE_KEY_WB_V4, AppState.savedWbSelections); renderWbAccordionBox(query);
                    }
                };
            });
            const clrBtn = selArea.querySelector('#wb-clear-all');
            if (clrBtn) {
                clrBtn.onclick = () => {
                    Object.keys(charData).forEach(wN => { charData[wN].entries = []; });
                    saveStorage(STORAGE_KEY_WB_V4, AppState.savedWbSelections); renderWbAccordionBox(query);
                };
            }
        }

        mainModal.querySelectorAll('.wb-item-view').forEach(btn => btn.onclick = (e) => {
            const wN = e.target.getAttribute('data-wb'); const eN = e.target.getAttribute('data-en');
            const entryStr = (AppState.wbCacheMap[wN] || []).find(x => x.name === eN)?.content || '加载失败，未获取到内容';
            const vMod = buildBaseModal('entry_view', 10000000);
            const themeStyle = AppState.globalCfg.uiTheme === 'dark' ? 'mg-theme-dark' : 'mg-theme-light';
            vMod.innerHTML = `<div class="mg-container ${themeStyle}" style="max-width:600px; height:auto; max-height:80vh;"><div class="mg-header"><div>👁️ ${eN}</div><div class="mg-close" id="ev-close">×</div></div><div class="mg-body mg-scroll" style="padding:20px; overflow-y:auto; font-family:monospace; line-height:1.6; white-space:pre-wrap;">${entryStr}</div></div>`;
            hostWindow.document.body.appendChild(vMod); vMod.querySelector('#ev-close').onclick = () => vMod.remove();
        });
    }

    function bindGeneratorEvents(idx) {
        const root = mainModal.querySelector('#mg-content-area');
        const wbInput = root.querySelector('#wb-search-input');

        root.querySelector('#wb-refresh-btn').onclick = async () => {
            const btn = root.querySelector('#wb-refresh-btn');
            btn.innerText = '⏳ 刷新中...';
            AppState.wbCacheMap = {};
            await loadCurrentWorldbookContext();
            renderWbAccordionBox(root.querySelector('#wb-search-input').value);
            btn.innerText = '🔄 刷新数据';
            log('世界书详细数据重新获取成功', 'success');
        };

        if (wbInput) {
            let debounceTimer; wbInput.addEventListener('input', (e) => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { renderWbAccordionBox(e.target.value); }, 300); });
        }
        root.querySelector('#btn-add-field').onclick = () => { const fname = prompt("新字段名 (禁止使用'名字'或'关键词'):"); if (!fname || fname.includes('名字') || fname.includes('关键')) return; if (AppState.tempFormData[idx].fields.some(f => f.name === fname)) return; saveCurrentForm(idx); AppState.tempFormData[idx].fields.push({ name: fname, pmt: '' }); renderMainModalUI(); };
        root.querySelectorAll('._del_field').forEach(btn => { btn.onclick = (e) => { saveCurrentForm(idx); const fidx = parseInt(e.target.closest('.mg-field-row').getAttribute('data-fidx')); AppState.tempFormData[idx].fields.splice(fidx, 1); renderMainModalUI(); } });
        let dragFidx = null; root.querySelectorAll('.mg-field-row[data-fidx]').forEach(row => { row.ondragstart = (e) => { saveCurrentForm(idx); dragFidx = parseInt(row.getAttribute('data-fidx')); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragFidx); setTimeout(() => row.style.opacity = '0.5', 0); }; row.ondragover = (e) => e.preventDefault(); row.ondragenter = (e) => { e.preventDefault(); row.style.border = "2px dashed var(--primary)"; }; row.ondragleave = (e) => { row.style.border = "1px solid var(--border)"; }; row.ondrop = (e) => { e.preventDefault(); row.style.border = "1px solid var(--border)"; let tFidx = parseInt(row.getAttribute('data-fidx')); if (dragFidx !== null && dragFidx !== tFidx) { let arr = AppState.tempFormData[idx].fields; let item = arr.splice(dragFidx, 1)[0]; arr.splice(tFidx, 0, item); renderMainModalUI(); } }; row.ondragend = () => { row.style.opacity = '1'; }; });
        root.querySelector('#btn-reset').onclick = () => { if (confirm("确定重置当前文本框内的设定吗？未提交的修改将被清空。")) { const g = AppState.generators[idx]; AppState.tempFormData[idx] = { namePrompt: g.namePrompt || '为该对象生成一个合适的名字，可附带别称（用括号包裹）。', fields: JSON.parse(JSON.stringify(g.fields)), style: '', historyCount: AppState.globalCfg.historyMax, historyExtra: '', genOnly: '', genNot: '', allowFreeGen: false, extraReq: '' }; renderMainModalUI(); } };
        root.querySelector('#btn-gen').onclick = safeRun(async () => {
            const nPmt = root.querySelector('#fixed-name-pmt').value.trim();
            if (!nPmt) { alert("『名字』字段生成提示词不可为空。"); return; }
            saveCurrentForm(idx); await triggerGenerateInit(idx);
        });
    }

    function saveCurrentForm(idx) {
        if (!mainModal) return; const root = mainModal.querySelector('#mg-content-area'); if (!root) return; const tData = AppState.tempFormData[idx];
        tData.historyCount = parseInt(root.querySelector('#gen-hist')?.value || 0); tData.historyExtra = root.querySelector('#gen-hist-extra')?.value || ''; tData.genOnly = root.querySelector('#gen-only')?.value || ''; tData.genNot = root.querySelector('#gen-not')?.value || ''; tData.allowFreeGen = root.querySelector('#gen-free')?.checked || false; tData.extraReq = root.querySelector('#gen-extra')?.value || ''; tData.style = root.querySelector('#gen-style')?.value || '';
        if (root.querySelector('#fixed-name-pmt')) tData.namePrompt = root.querySelector('#fixed-name-pmt').value.trim();
        root.querySelectorAll('.mg-field-row[data-fidx]').forEach(row => { const fidx = parseInt(row.getAttribute('data-fidx')); if (tData.fields[fidx]) tData.fields[fidx].pmt = row.querySelector('.f-pmt').value; });
    }

    // ============================================
    // 大模型交互
    // ============================================
    async function buildPrompt(idx) {
        const gen = AppState.generators[idx]; const tData = AppState.tempFormData[idx]; const gb = AppState.globalCfg;
        let pParts = []; let sysText = "";
        if (gb.limitBreakPrompt) sysText += gb.limitBreakPrompt + "\n";
        if (gen.sys) sysText += gen.sys;
        if (sysText) pParts.push(`<system_directive>\n${sysText.trim()}\n</system_directive>`);

        let contextParts = []; let charData = AppState.savedWbSelections[AppState.curCharName] || {};
        for (let wb of Object.keys(charData)) {
            if (charData[wb].enabled && charData[wb].entries && charData[wb].entries.length > 0) {
                await ensureWbFetched(wb);
                const activeEntries = (AppState.wbCacheMap[wb]||[]).filter(e => charData[wb].entries.includes(e.name));
                if (activeEntries.length > 0) {
                    let wbLines = activeEntries.map(e => `[索引:${wb} | 条目:${e.name}]\n${applyExclusions(e.content)}`).join('\n\n');
                    contextParts.push(`<world_lore_reference>\n${wbLines}\n</world_lore_reference>`);
                }
            }
        }

        if ((tData.historyCount > 0 || (tData.historyExtra && tData.historyExtra.trim() !== '')) && typeof getChatMessages === 'function' && typeof getLastMessageId === 'function') {
            try {
                let targetIds = new Set();
                const lastId = getLastMessageId();

                if (tData.historyExtra && tData.historyExtra.trim() !== '') {
                    tData.historyExtra.split(/[,，]/).forEach(numStr => {
                        const num = parseInt(numStr.trim(), 10);
                        if (!isNaN(num) && num >= 0 && num <= lastId) { targetIds.add(num); }
                    });
                }

                let collectedCount = 0;
                for (let id = lastId; id >= 0 && collectedCount < tData.historyCount; id--) {
                    const msgs = getChatMessages(id);
                    if (msgs && msgs.length > 0 && !msgs[0].is_hidden) { targetIds.add(id); collectedCount++; }
                }

                let sortedIds = Array.from(targetIds).sort((a, b) => a - b);
                let historyTexts = [];

                for (let i = 0; i < sortedIds.length; i++) {
                    const id = sortedIds[i]; const msgs = getChatMessages(id);
                    if (msgs && msgs.length > 0) {
                        const m = msgs[0]; if (m.is_hidden) continue;
                        const roleName = m.role === 'user' ? '用户' : (m.role === 'assistant' ? '角色' : '系统');
                        let rawText = m.message;
                        if (m.role === 'assistant' && gb.charExtractTag) { const reg = new RegExp(`<${gb.charExtractTag}>([\\s\\S]*?)<\\/${gb.charExtractTag}>`, 'i'); const match = rawText.match(reg); if (match) rawText = match[1]; }
                        else if (m.role === 'user' && gb.userExtractTag) { const reg = new RegExp(`<${gb.userExtractTag}>([\\s\\S]*?)<\\/${gb.userExtractTag}>`, 'i'); const match = rawText.match(reg); if (match) rawText = match[1]; }

                        let cleanText = applyExclusions(rawText).trim();
                        historyTexts.push(`[楼层 ${id}] ${roleName}: ${cleanText}`);
                    }
                }
                if (historyTexts.length > 0) contextParts.push(`<recent_story_context>\n${historyTexts.join('\n\n')}\n</recent_story_context>`);
            } catch (e) { console.error("历史抓取异常", e); }
        }

        if (contextParts.length > 0) pParts.push(`<上下文参考>\n${contextParts.join('\n\n')}\n</上下文参考>`);

        if (tData.genOnly || tData.genNot || tData.extraReq || tData.style || !tData.allowFreeGen) {
            let reqs = "<generation_constraints>\n";
            if (tData.genOnly) reqs += `- 专注生成目标: ${tData.genOnly}\n`;
            if (tData.genNot) reqs += `- 不生成相关内容: 规避和涉及 ${tData.genNot} 有关的内容\n`;
            if (tData.allowFreeGen) reqs += `- 发散控制: 允许依据当前上下文进行适当的发散性创造\n`; else reqs += `- 发散控制: 严格限制输出，禁止衍生未被要求的要素\n`;
            if (tData.extraReq) reqs += `- 用户额外要求: ${tData.extraReq}\n`; if (tData.style) reqs += `- 期望文笔风格/主题基调: ${tData.style}\n`; reqs += "</generation_constraints>"; pParts.push(reqs);
        }

        let ruleBlock = `<output_format_requirement>\n请务必严格按照XML格式节点约束最终结果，拒绝输出任何多余过渡短语。\n排版要求：如果某个节点的内容包含多个子项或要点，请绝对不要挤在同一行，必须使用换行及 Markdown 的无序列表格式（即“- ”开头）排版：\n\n<${gen.tag}>\n<名字>${tData.namePrompt}</名字>\n`;
        tData.fields.forEach(f => { ruleBlock += `<${f.name}>${f.pmt}</${f.name}>\n`; });
        ruleBlock += `<关键词>请填入其名字以及别称/小名(如果有)，用英文逗号分隔</关键词>\n</${gen.tag}>\n</output_format_requirement>`; pParts.push(ruleBlock); return pParts.join('\n\n');
    }

    async function triggerGenerateInit(idx, promptOverride = null) {
        if (!AppState.apiSettings.apiKey && AppState.apiSettings.apiType !== 'kobold') { log("未配置 API 密钥，请在设置中配置", "warning"); return; }
        const finalPrompt = promptOverride || await buildPrompt(idx); if (mainModal) mainModal.style.display = 'none';
        previewModal = buildBaseModal('preview'); const theme = AppState.globalCfg.uiTheme === 'dark' ? 'mg-theme-dark' : 'mg-theme-light';
        previewModal.innerHTML = `
        <div class="mg-container ${theme}">
            <div class="mg-header"><div>提示词预览文本</div><div class="mg-close" id="pmt-close">×</div></div>
            <div class="mg-body mg-scroll" style="flex-direction:column; padding:20px; padding-bottom: max(20px, env(safe-area-inset-bottom)); overflow-y:auto; overflow-x:hidden;">
                <p style="margin-top:0; font-size:14px; opacity:0.8; margin-bottom:12px; flex-shrink:0;">以下内容将发送给 AI，您可以在此编辑和调整：</p>
                <div style="position:relative; flex: 1 0 150px; display:flex; width:100%; border: 1px solid var(--border); border-radius: 8px; overflow:hidden; background: var(--bg);">
                    <textarea id="pmt-text" class="pmt-scroll" style="flex:1; width:100%; resize:none; border:none; padding:12px; padding-right:55px; font-family:monospace; line-height: 1.5; color:var(--text); background:transparent; font-size:14px; outline:none;">${finalPrompt}</textarea>
                    <div style="position:absolute; right:12px; bottom:15px; display:flex; flex-direction:column; gap:12px;">
                        <button id="pmt-up" class="mg-btn" style="padding:10px; border-radius:50%; font-size:14px; box-shadow:0 3px 8px rgba(0,0,0,0.3);" title="一键置顶">▲</button>
                        <button id="pmt-dn" class="mg-btn" style="padding:10px; border-radius:50%; font-size:14px; box-shadow:0 3px 8px rgba(0,0,0,0.3);" title="一键沉底">▼</button>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px; margin-top:16px; flex-shrink:0;">
                    <div style="display:flex; align-items:center; gap:8px; justify-content:flex-end;">
                        <label style="font-size:13px; opacity:0.8; font-weight:bold;">临时生成模型:</label>
                        <select id="pmt-model-select" class="mg-input" style="margin:0; padding:6px 10px; width:auto; max-width:200px; font-size:13px;">
                            <option value="${AppState.apiSettings.model}">${AppState.apiSettings.model}</option>
                        </select>
                        <button id="pmt-fetch-models" class="mg-btn-outline" style="padding:4px 8px; font-size:12px;" title="拉取当前 API 可用模型列表">🔄</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px;">
                        <button class="mg-btn mg-btn-outline" id="pmt-history" style="padding:10px 16px; font-size:14px;">🕰️ 历史记录</button>
                        <button class="mg-btn" id="pmt-run" style="padding:10px 24px; font-size:14px; white-space:nowrap;">✨ 确认并发送</button>
                    </div>
                </div>
            </div>
        </div>`;
        hostWindow.document.body.appendChild(previewModal);
        previewModal.querySelector('#pmt-close').onclick = () => { previewModal.remove(); previewModal = null; if (mainModal) mainModal.style.display = 'flex'; };

        const ta = previewModal.querySelector('#pmt-text');
        previewModal.querySelector('#pmt-up').onclick = () => { ta.scrollTo({ top: 0, behavior: 'smooth' }); };
        previewModal.querySelector('#pmt-dn').onclick = () => { ta.scrollTo({ top: ta.scrollHeight, behavior: 'smooth' }); };

        const pmtModelSelect = previewModal.querySelector('#pmt-model-select');
        const pmtFetchBtn = previewModal.querySelector('#pmt-fetch-models');
        pmtFetchBtn.onclick = safeRun(async () => {
            const apiurl = AppState.apiSettings.apiUrl; const key = AppState.apiSettings.apiKey;
            if (!apiurl) { alert("接口地址似乎不存在，请先至基础设置调整。"); return; }
            pmtFetchBtn.innerText = '⏳';
            try {
                const models = await getModelList({ apiurl, key });
                if (models && models.length > 0) {
                    const currentSel = pmtModelSelect.value;
                    pmtModelSelect.innerHTML = models.map(m => `<option value="${m}" ${m===currentSel?'selected':''}>${m}</option>`).join('');
                    if (!models.includes(currentSel)) pmtModelSelect.innerHTML += `<option value="${currentSel}" selected>${currentSel}</option>`;
                    log('候选模型获取完毕', 'success');
                } else alert("接口未返回备用模型列表。");
            } catch(e) { alert("获取失败: " + e.message); }
            pmtFetchBtn.innerText = '🔄';
        });

        previewModal.querySelector('#pmt-history').onclick = () => { openHistoryModal(); };

        const btnRun = previewModal.querySelector('#pmt-run');
        const genData = AppState.generators[idx];
        btnRun.onclick = safeRun(async () => {
            const actualPrompt = ta.value; AppState.lastGeneratedPrompt = actualPrompt; btnRun.innerText = '⏳ 生成中...'; btnRun.disabled = true;
            const apiCfg = AppState.apiSettings;
            const selectedTempModel = pmtModelSelect.value;
            let resultText = "";
            try {
                resultText = await generateRaw({ ordered_prompts: [{ role: 'user', content: actualPrompt }], custom_api: { apiurl: apiCfg.apiUrl, key: apiCfg.apiKey, model: selectedTempModel, source: apiCfg.apiType, temperature: apiCfg.temperature, max_tokens: apiCfg.maxTokens, top_p: apiCfg.topP, frequency_penalty: apiCfg.frequencyPenalty, presence_penalty: apiCfg.presencePenalty } });
                resultText = resultText.replace(/^```[\w-]*\n?/gm, '').replace(/```$/gm, '').trim();

                // 压入缓存历史
                AppState.historyData.unshift({ id: Date.now(), genId: genData.id, genName: genData.name, rawText: resultText, time: new Date().toLocaleString() });
                if(AppState.historyData.length > MAX_HISTORY_LIMIT) AppState.historyData.pop();
                saveStorage(STORAGE_KEY_HISTORY, AppState.historyData);

                log("生成成功", "success");
            } catch (err) { alert(`生成发生异常:\n${err.message}`); btnRun.innerText = '✨ 重新生成'; btnRun.disabled = false; return; }
            previewModal.remove(); previewModal = null; openResultEditor(idx, resultText);
        });
    }

    function openHistoryModal() {
        if (AppState.historyData.length === 0) { alert("目前暂无生成缓存记录。"); return; }
        let currentHIdx = 0;
        const theme = AppState.globalCfg.uiTheme === 'dark' ? 'mg-theme-dark' : 'mg-theme-light';
        historyModal = buildBaseModal('history', 10000000);
        historyModal.innerHTML = `
        <div class="mg-container ${theme}" style="max-width: 800px; height: 80vh;">
            <div class="mg-header"><div>🕰️ 缓存记录 (<span id="h-counter"></span>)</div><div class="mg-close" id="h-close">×</div></div>
            <div class="mg-body mg-scroll" style="flex-direction:column; padding:20px; padding-bottom: max(20px, env(safe-area-inset-bottom)); overflow-y:auto; overflow-x:hidden;">
                <div style="font-size:13px; opacity:0.8; margin-bottom:8px; display:flex; justify-content:space-between; flex-shrink:0;">
                    <span>原生成器：<b id="h-gen-name"></b></span>
                    <span>生成时间：<span id="h-time"></span></span>
                </div>
                <textarea id="h-text" class="mg-input mg-scroll" style="flex: 1 0 150px; resize:none; font-family:monospace; line-height:1.5; font-size:14px;" readonly></textarea>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; flex-shrink:0; padding-bottom:10px;">
                    <div style="display:flex; gap:8px;">
                        <button class="mg-btn-outline" id="h-prev" style="padding:10px; font-weight:normal;">◀ 上一条</button>
                        <button class="mg-btn-outline" id="h-next" style="padding:10px; font-weight:normal;">下一条 ▶</button>
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button class="mg-btn-outline" id="h-del" style="color:#ef4444; border-color:transparent; padding:10px;">🗑️ 删除</button>
                        <button class="mg-btn" id="h-apply" style="padding:10px 20px;">📝 写入处理</button>
                    </div>
                </div>
            </div>
        </div>`;
        hostWindow.document.body.appendChild(historyModal);

        const textUI = historyModal.querySelector('#h-text');
        const counterUI = historyModal.querySelector('#h-counter');
        const genNameUI = historyModal.querySelector('#h-gen-name');
        const timeUI = historyModal.querySelector('#h-time');
        const btnPrev = historyModal.querySelector('#h-prev');
        const btnNext = historyModal.querySelector('#h-next');

        function renderH() {
            if(AppState.historyData.length === 0) { historyModal.remove(); historyModal = null; return; }
            if(currentHIdx < 0) currentHIdx = 0; if(currentHIdx >= AppState.historyData.length) currentHIdx = AppState.historyData.length - 1;
            const item = AppState.historyData[currentHIdx];
            counterUI.innerText = `${currentHIdx + 1} / ${AppState.historyData.length}`;
            genNameUI.innerText = item.genName || '未知生成器';
            timeUI.innerText = item.time;
            textUI.value = item.rawText;
            btnPrev.disabled = currentHIdx === 0;
            btnNext.disabled = currentHIdx === AppState.historyData.length - 1;
        }
        renderH();

        historyModal.querySelector('#h-close').onclick = () => { historyModal.remove(); historyModal = null; };
        btnPrev.onclick = () => { currentHIdx--; renderH(); };
        btnNext.onclick = () => { currentHIdx++; renderH(); };
        historyModal.querySelector('#h-del').onclick = () => {
            AppState.historyData.splice(currentHIdx, 1);
            saveStorage(STORAGE_KEY_HISTORY, AppState.historyData);
            log('记录已删除', 'info'); renderH();
        };
        historyModal.querySelector('#h-apply').onclick = () => {
            const item = AppState.historyData[currentHIdx];
            let rawIdx = AppState.generators.findIndex(g => g.id === item.genId);
            if(rawIdx === -1) { alert("注意：这条记录对应的原生生成器已丢失（可能被删除）。将尝试套用当前的排版模板..."); rawIdx = AppState.activeIndex; }
            historyModal.remove(); historyModal = null;
            if(previewModal) { previewModal.remove(); previewModal = null; }
            openResultEditor(rawIdx, item.rawText);
        };
    }

    function parseCardsRegex(tagType, fullText) {
        const rootRegex = new RegExp(`<(${tagType})[^>]*>([\\s\\S]*?)<\\/\\1>`, 'gi'); let cards = []; let rootMatch;
        while ((rootMatch = rootRegex.exec(fullText)) !== null) {
            let body = rootMatch[2].trim(); let parsedFields = {}; const childRegex = /<([^>]+)>([\s\S]*?)<\/\1>/gi; let childMatch; let foundChildTags = false;
            while ((childMatch = childRegex.exec(body)) !== null) { foundChildTags = true; parsedFields[childMatch[1].trim()] = childMatch[2].trim(); }
            if (!foundChildTags) {
                const lines = body.split('\n'); let lastKey = null;
                lines.forEach(l => {
                    let colIdx = l.indexOf(':'); if (colIdx === -1) colIdx = l.indexOf('：');
                    if (colIdx !== -1 && colIdx < 30) { lastKey = l.substring(0, colIdx).trim().replace(/\*\*/g, '').replace(/</g, '').replace(/>/g, ''); parsedFields[lastKey] = l.substring(colIdx + 1).trim(); } else if (lastKey && l.trim() !== '') { parsedFields[lastKey] += '\n' + l; }
                });
            }
            let cName = parsedFields['名字'] || parsedFields[`${tagType}名字`] || parsedFields['名称'] || "未命名设定";
            if (parsedFields['名字']) delete parsedFields['名字']; if (parsedFields[`${tagType}名字`]) delete parsedFields[`${tagType}名字`]; if (parsedFields['名称']) delete parsedFields['名称']; cards.push({ type: tagType, pureName: cName, parsedFields, raw: rootMatch[0] });
        } return cards;
    }

    function openResultEditor(idx, aiResponseText) {
        const gen = AppState.generators[idx]; const tData = AppState.tempFormData[idx];
        const cards = parseCardsRegex(gen.tag, aiResponseText);
        if (cards.length === 0) { log("未检测到 XML 闭合标签，已使用容错机制载入原始文本", "warning"); cards.push({ type: gen.tag, pureName: '未格式化片段', parsedFields: {}, rawTextFallback: aiResponseText }); }

        const resModal = buildBaseModal('res'); const theme = AppState.globalCfg.uiTheme === 'dark' ? 'mg-theme-dark' : 'mg-theme-light'; const savedFormat = loadStorage(STORAGE_KEY_FMT, 'yaml');
        resModal.innerHTML = `<div class="mg-container ${theme}"><div class="mg-header"><div>📥 处理结果 (${cards.length} 项)</div><div style="display:flex; align-items:center;"><button id="res-regen" class="mg-btn mg-btn-outline" style="padding:6px 14px; font-size:14px; font-weight:normal;">🔄 重新生成</button><div class="mg-close" id="res-close">×</div></div></div><div class="mg-body mg-scroll" style="padding:20px; overflow-y:auto; flex-direction:column; gap:20px;" id="res-cards-container"></div></div>`;
        const container = resModal.querySelector('#res-cards-container');

        let validTargets = new Set();
        if (AppState.activeRoleWorldbook) validTargets.add(AppState.activeRoleWorldbook);
        let cD = AppState.savedWbSelections[AppState.curCharName] || {};
        Object.keys(cD).forEach(w => { if (cD[w].enabled) validTargets.add(w); });

        cards.forEach((c, i) => {
            let parsedFields = c.parsedFields || {}; if (c.rawTextFallback) parsedFields['完整原始文本'] = c.rawTextFallback;
            let kwFound = ''; ['关键词', '关键字', '关键词建议', 'keys'].forEach(k => { if (parsedFields[k]) { kwFound = kwFound ? kwFound + ',' + parsedFields[k] : parsedFields[k]; delete parsedFields[k]; } });
            let finalFieldsHtml = '';
            tData.fields.forEach(f => { const val = parsedFields[f.name] || ''; finalFieldsHtml += `<div style="margin-bottom:12px;"><b style="font-size:15px; margin-bottom:4px; display:block;">${f.name}</b><textarea class="mg-input _val_input" data-k="${f.name}" style="margin:0; resize:vertical; font-family:inherit;" rows="${val.length > 50 ? 4 : 2}">${val}</textarea></div>`; });
            Object.keys(parsedFields).forEach(fname => { if (!tData.fields.some(field => field.name === fname)) finalFieldsHtml += `<div style="margin-bottom:12px;"><b style="font-size:15px; margin-bottom:4px; display:block;">${fname} <span style="opacity:0.6;font-size:12px;font-weight:normal">(发散衍生项)</span></b><textarea class="mg-input _val_input" data-k="${fname}" style="margin:0; resize:vertical; font-family:inherit;" rows="${parsedFields[fname].length > 50 ? 4 : 2}">${parsedFields[fname]}</textarea></div>`; });
            const gb = AppState.globalCfg; const placeh = "可以用于书写补充说明（追加到末尾）。若倾向于YAML格式存储，请注意手动自带缩进，如：\n  额外说明: |-\n    - 环境排异\n    - 高辐射";

            const cardHtml = `<div class="mg-block" data-cidx="${i}"><div class="mg-block-header" style="background:var(--primary); color:white; display:flex; align-items:center;"><span style="margin-right:10px; font-weight:bold;">${c.type} | </span><input class="mg-input _c_pure_name" value="${c.pureName}" style="flex:1; max-width:300px; padding:6px 12px; margin:0; background:var(--bg); color:var(--text); font-weight:bold; border:1px solid var(--border);"></div><div class="mg-block-body"><div style="margin-bottom: 20px;">${finalFieldsHtml}</div><div style="margin-bottom: 24px;"><b style="font-size:15px; margin-bottom:4px; display:block;">📝 补充说明（选填）</b><textarea class="mg-input _c_custom_append mg-custom-append" rows="3" placeholder="${placeh}" style="margin:0; resize:vertical; border: 1px dashed var(--primary); font-family:inherit; font-weight:500;"></textarea></div><hr style="border:none; border-top:1px dashed var(--border); margin:0 0 20px 0;"><div style="background:var(--bg-sec); padding:16px; border-radius:10px; border:1px solid rgba(0,0,0,0.05)"><h4 style="margin-top:0; margin-bottom:16px;">写入世界书配置</h4><div style="margin-bottom:12px;"><span class="mg-desc" style="margin-left:0;">触发关键词 (用英文逗号分隔)</span><input class="mg-input _c_kw" value="${kwFound}" style="margin:4px 0 0 0;"></div><div class="mg-twocol"><div><span class="mg-desc" style="margin-left:0;">存储格式</span><select class="mg-input _c_fmt" style="margin-top:4px;"><option value="yaml" ${savedFormat === 'yaml' ? 'selected' : ''}>YAML 格式</option><option value="md" ${savedFormat === 'md' ? 'selected' : ''}>Markdown 格式</option><option value="raw" ${savedFormat === 'raw' ? 'selected' : ''}>原生文本格式</option></select></div><div><span class="mg-desc" style="margin-left:0;">🎯 目标世界书</span><select class="mg-input _c_twb" style="margin-top:4px;">${Array.from(validTargets).map(w => `<option value="${w}">${w === AppState.activeRoleWorldbook ? w + ' (默认)' : w}</option>`).join('')}</select></div><div style="display:flex; gap:16px;"><div style="flex:1;"><span class="mg-desc" style="margin-left:0;">注入位置</span><select class="mg-input _c_pos" style="margin-top:4px;"><option value="after_character_definition" ${gb.wbPos === 'after_character_definition' ? 'selected' : ''}>角色定义之后</option><option value="before_character_definition" ${gb.wbPos === 'before_character_definition' ? 'selected' : ''}>角色定义之前</option></select></div><div style="flex:1;"><span class="mg-desc" style="margin-left:0;">顺序排位</span><input class="mg-input _c_ord" type="number" value="${gb.wbOrd || 100}" style="margin-top:4px;"></div><div style="flex:1;"><span class="mg-desc" style="margin-left:0;">触发方式</span><select class="mg-input _c_tri" style="margin-top:4px;"><option value="selective" ${gb.wbTri === 'selective' ? 'selected' : ''}>🟢 绿灯 (需关键词)</option><option value="constant" ${gb.wbTri === 'constant' ? 'selected' : ''}>🔵 蓝灯 (常驻)</option></select></div></div></div><button class="mg-btn _c_inject" style="width:100%; margin-top:16px; padding:14px; font-size:16px;">🔖 写入进所选世界书</button></div></div></div>`;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        resModal.querySelector('#res-regen').onclick = () => { resModal.remove(); triggerGenerateInit(idx, AppState.lastGeneratedPrompt); };
        container.querySelectorAll('._c_inject').forEach((btn) => {
            btn.onclick = safeRun(async (e) => {
                const blk = e.target.closest('.mg-block'); const wbTarget = blk.querySelector('._c_twb').value;
                if (!wbTarget) { alert("尚未确立目标世界书，请选择。"); return; }
                const pureName = blk.querySelector('._c_pure_name').value.trim(); const worldbookEntryTitle = `${gen.tag} | ${pureName}`;
                const strategy = blk.querySelector('._c_tri').value; const positionType = blk.querySelector('._c_pos').value; const ord = parseInt(blk.querySelector('._c_ord').value); const customAppendText = blk.querySelector('._c_custom_append').value; const kwLine = blk.querySelector('._c_kw').value; let fmt = blk.querySelector('._c_fmt').value; saveStorage(STORAGE_KEY_FMT, fmt);

                let finalContent = `<${gen.tag}>\n`;
                if (fmt === 'yaml') {
                    finalContent += `${pureName}:\n\n`; blk.querySelectorAll('._val_input').forEach(inp => { const text = inp.value.trim(); if (text !== '') { const key = inp.getAttribute('data-k'); const indentedText = text.split('\n').map(l => '    ' + l).join('\n'); finalContent += `  ${key}: |-\n${indentedText}\n\n`; } });
                } else if (fmt === 'md') {
                    finalContent += `## ${pureName}\n\n`; blk.querySelectorAll('._val_input').forEach(inp => { const text = inp.value.trim(); if (text !== '') { const key = inp.getAttribute('data-k'); finalContent += `### ${key}\n${text}\n\n`; } });
                } else {
                    finalContent += `名字: ${pureName}\n\n`; blk.querySelectorAll('._val_input').forEach(inp => { const text = inp.value.trim(); if (text !== '') { const key = inp.getAttribute('data-k'); finalContent += `${key}:\n${text}\n\n`; } });
                }
                if (customAppendText.trim() !== '') finalContent += `${customAppendText}\n`; finalContent += `</${gen.tag}>`;

                const existList = await getWorldbook(wbTarget);
                if (existList.find(x => x.name === worldbookEntryTitle)) { if (!confirm(`世界书中已存在同名条目 [ ${worldbookEntryTitle} ]，是否要覆盖它？`)) return; await deleteWorldbookEntries(wbTarget, x => x.name === worldbookEntryTitle); }

                await createWorldbookEntries(wbTarget, [{ name: worldbookEntryTitle, enabled: true, content: finalContent, strategy: { type: strategy, keys: strategy === 'selective' ? kwLine.split(/[,，]/).map(x => x.trim()).filter(Boolean) : [] }, position: { type: positionType, order: ord }, recursion: { prevent_incoming: true, prevent_outgoing: true, delay_until: null } }]);
                log(`成功！[ ${worldbookEntryTitle} ] 已写入世界书。`, 'success'); btn.innerText = '✅ 设定已写入世界书'; btn.disabled = true; btn.style.background = '#10b981';
            });
        });
        hostWindow.document.body.appendChild(resModal); resModal.querySelector('#res-close').onclick = () => { resModal.remove(); if (mainModal) mainModal.style.display = 'flex'; };
    }

    function createFloatingBall() {
        if (floatingBall) floatingBall.remove(); if (!AppState.globalCfg.showFab) return;
        const pos = loadStorage(STORAGE_KEY_POS, { x: hostWindow.innerWidth - FAB_SIZE - 16, y: hostWindow.innerHeight - 120 });
        floatingBall = hostWindow.document.createElement('div'); floatingBall.title = "点击打开多功能生成器，右键隐藏"; floatingBall.style.cssText = `position: fixed; bottom: auto; top: ${pos.y}px; left: ${pos.x}px; width: ${FAB_SIZE}px; height: ${FAB_SIZE}px; border-radius: 50%; background: rgba(15,23,42,0.92); backdrop-filter: blur(10px); cursor: grab; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4); color: white; z-index: 999990; user-select: none; touch-action: none; font-size: 24px; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.2)`; floatingBall.textContent = '🎲';
        let isDrag = false, start = {}, base = {}, moved = false;
        function onMove(e) { const dx = e.clientX - start.x, dy = e.clientY - start.y; if (Math.abs(dx) > 3 || Math.abs(dy) > 3) { moved = true; isDrag = true; let nx = base.x + dx, ny = base.y + dy; nx = Math.max(EDGE_GAP, Math.min(nx, hostWindow.innerWidth - FAB_SIZE - EDGE_GAP)); ny = Math.max(EDGE_GAP, Math.min(ny, hostWindow.innerHeight - FAB_SIZE - EDGE_GAP)); floatingBall.style.left = nx + 'px'; floatingBall.style.top = ny + 'px'; saveStorage(STORAGE_KEY_POS, { x: nx, y: ny }); } }
        function onUp() { hostWindow.removeEventListener('pointermove', onMove); hostWindow.removeEventListener('pointerup', onUp); floatingBall.style.cursor = 'grab'; setTimeout(() => moved = false, 100); }
        floatingBall.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; e.preventDefault(); isDrag = false; moved = false; start = { x: e.clientX, y: e.clientY }; base = { x: floatingBall.getBoundingClientRect().left, y: floatingBall.getBoundingClientRect().top }; floatingBall.style.cursor = 'grabbing'; hostWindow.addEventListener('pointermove', onMove); hostWindow.addEventListener('pointerup', onUp); });
        floatingBall.addEventListener('click', (e) => { if (!moved) { e.stopPropagation(); openMainModal(); } });
        floatingBall.addEventListener('contextmenu', (e) => { e.preventDefault(); if (confirm("确定要隐藏悬浮球吗？可以在设置中重新开启。")) { AppState.globalCfg.showFab = false; saveStorage(STORAGE_KEY_UI, AppState.globalCfg); createFloatingBall(); log("悬浮球已隐蔽显示。", "info"); } });
        hostWindow.addEventListener('resize', () => { if (floatingBall) { const nx = Math.max(EDGE_GAP, Math.min(parseFloat(floatingBall.style.left), hostWindow.innerWidth - FAB_SIZE - EDGE_GAP)); const ny = Math.max(EDGE_GAP, Math.min(parseFloat(floatingBall.style.top), hostWindow.innerHeight - FAB_SIZE - EDGE_GAP)); floatingBall.style.left = nx + 'px'; floatingBall.style.top = ny + 'px'; } });
        hostWindow.document.body.appendChild(floatingBall);
    }

    async function init() {
        log('多功能生成器系统加载完毕。');
        await loadConfiguration(); createFloatingBall();
        if (typeof appendInexistentScriptButtons === 'function' && typeof getButtonEvent === 'function') { appendInexistentScriptButtons([{ name: '生成器', visible: true }]); eventOn(getButtonEvent('生成器'), () => { openMainModal(); }); }
        if (typeof eventOn === 'function' && typeof tavern_events !== 'undefined') { eventOn(tavern_events.CHAT_CHANGED, async () => { await loadCurrentWorldbookContext(); if (mainModal) renderMainModalUI(); }); }
    }

    window.addEventListener('beforeunload', () => { if (floatingBall) floatingBall.remove(); if (mainModal) mainModal.remove(); if (previewModal) previewModal.remove(); if (historyModal) historyModal.remove();});
    if (hostWindow.document.readyState === 'loading') hostWindow.document.addEventListener('DOMContentLoaded', init); else init();

})();