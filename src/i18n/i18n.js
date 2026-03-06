/**
 * WW3: GLOBAL COLLAPSE — Internationalisation System
 * Supported languages: 'en' (English), 'ru' (Russian)
 *
 * Usage:
 *   import { useTranslation } from '../i18n/i18n';
 *   const t = useTranslation();
 *   <Text>{t('settings.title')}</Text>
 */

import { useCallback } from 'react';
// lazy import to break require cycle
const getStore = () => require('../store/useGameStore').default;

// ─── Translation Table ────────────────────────────────────────────────────────

export const TRANSLATIONS = {

  // ── COMMON ─────────────────────────────────────────────────────────────────
  'common.back':          { en: 'BACK',          ru: 'НАЗАД' },
  'common.confirm':       { en: 'CONFIRM',        ru: 'ПОДТВЕРДИТЬ' },
  'common.cancel':        { en: 'CANCEL',         ru: 'ОТМЕНА' },
  'common.close':         { en: 'CLOSE',          ru: 'ЗАКРЫТЬ' },
  'common.on':            { en: 'ONLINE',         ru: 'ВКЛ' },
  'common.off':           { en: 'OFFLINE',        ru: 'ВЫКЛ' },
  'common.enabled':       { en: 'ENABLED',        ru: 'ВКЛЮЧЕНО' },
  'common.disabled':      { en: 'DISABLED',       ru: 'ВЫКЛЮЧЕНО' },
  'common.turn':          { en: 'Turn',           ru: 'Ход' },
  'common.error':         { en: 'ERROR',          ru: 'ОШИБКА' },
  'common.warning':       { en: 'WARNING',        ru: 'ВНИМАНИЕ' },

  // ── SPLASH SCREEN ──────────────────────────────────────────────────────────
  'splash.studio':        { en: 'STUDIO · PRESENTS',    ru: 'СТУДИЯ · ПРЕДСТАВЛЯЕТ' },

  // ── INTRO SCREEN ───────────────────────────────────────────────────────────
  'intro.tapToContinue':  { en: 'TAP TO CONTINUE',      ru: 'НАЖМИТЕ ЧТОБЫ ПРОДОЛЖИТЬ' },

  // ── MAIN MENU ──────────────────────────────────────────────────────────────
  'menu.subtitle':        { en: 'GLOBAL COLLAPSE',      ru: 'ГЛОБАЛЬНЫЙ КОЛЛАПС' },
  'menu.newGame':         { en: 'NEW CAMPAIGN',         ru: 'НОВАЯ КАМПАНИЯ' },
  'menu.continue':        { en: 'CONTINUE',             ru: 'ПРОДОЛЖИТЬ' },
  'menu.settings':        { en: 'SETTINGS',             ru: 'НАСТРОЙКИ' },
  'menu.credits':         { en: 'CREDITS',              ru: 'АВТОРЫ' },
  'menu.noSave':          { en: 'No save found',        ru: 'Сохранение не найдено' },

  // ── FACTION SELECT ─────────────────────────────────────────────────────────
  'faction.title':        { en: 'SELECT YOUR FACTION',  ru: 'ВЫБЕРИТЕ ФРАКЦИЮ' },
  'faction.deploy':       { en: 'DEPLOY',               ru: 'РАЗВЕРНУТЬ' },
  'faction.startingRegions': { en: 'Starting Regions',  ru: 'Начальные регионы' },
  'faction.attackPower':  { en: 'Attack Power',         ru: 'Атака' },
  'faction.defencePower': { en: 'Defence Power',        ru: 'Защита' },
  'faction.nukes':        { en: 'Nuclear Arsenal',      ru: 'Ядерный арсенал' },

  // ── SETTINGS ───────────────────────────────────────────────────────────────
  'settings.title':       { en: 'SYSTEM CONFIGURATION', ru: 'КОНФИГУРАЦИЯ СИСТЕМЫ' },
  'settings.audio':       { en: 'AUDIO PROTOCOLS',      ru: 'АУДИО ПРОТОКОЛЫ' },
  'settings.interface':   { en: 'INTERFACE PROTOCOLS',  ru: 'ИНТЕРФЕЙС ПРОТОКОЛЫ' },
  'settings.language':    { en: 'LANGUAGE / ЯЗЫК',      ru: 'ЯЗЫК / LANGUAGE' },
  'settings.music':       { en: 'Atmospheric Music',    ru: 'Атмосферная музыка' },
  'settings.sfx':         { en: 'Tactical SFX',         ru: 'Тактические звуки' },
  'settings.animations':  { en: 'Combat Animations',    ru: 'Боевые анимации' },
  'settings.langEnglish': { en: 'English',              ru: 'Английский' },
  'settings.langRussian': { en: 'Russian',              ru: 'Русский' },

  // ── TOP BAR ────────────────────────────────────────────────────────────────
  'hud.title':            { en: 'WORLD CONQUEST OVERVIEW', ru: 'ОБЗОР МИРОВОГО ЗАВОЕВАНИЯ' },
  'hud.oil':              { en: 'OIL',                  ru: 'НЕФТЬ' },
  'hud.steel':            { en: 'STEEL',                ru: 'СТАЛЬ' },
  'hud.money':            { en: 'MONEY',                ru: 'ДЕНЬГИ' },
  'hud.energy':           { en: 'ENERGY',               ru: 'ЭНЕРГИЯ' },
  'hud.tp':               { en: 'TP',                   ru: 'НО' },  // Tech Points / Научные Очки

  // ── BOTTOM NAV ─────────────────────────────────────────────────────────────
  'nav.map':              { en: 'MAP',                  ru: 'КАРТА' },
  'nav.deploy':           { en: 'DEPLOY',               ru: 'ВОЙСКА' },
  'nav.research':         { en: 'RESEARCH',             ru: 'НАУКА' },
  'nav.alliance':         { en: 'ALLIANCE',             ru: 'АЛЬЯНС' },
  'nav.endTurn':          { en: 'END TURN',             ru: 'КОНЕЦ ХОДА' },

  // ── TACTICAL BRIEFING PANEL ────────────────────────────────────────────────
  'briefing.title':       { en: 'TACTICAL BRIEFING',    ru: 'ТАКТИЧЕСКИЙ БРИФИНГ' },
  'briefing.missionReport': { en: 'MISSION REPORT:',   ru: 'ДОНЕСЕНИЕ:' },

  // ── TERRAIN INTEL PANEL ────────────────────────────────────────────────────
  'intel.title':          { en: 'TERRAIN & DEPTH INTEL', ru: 'РАЗВЕДКА МЕСТНОСТИ' },
  'intel.elevation':      { en: 'Elevation',            ru: 'Высота' },
  'intel.depth':          { en: 'Depth',                ru: 'Глубина' },

  // ── SELECTION CARD ─────────────────────────────────────────────────────────
  'card.infantry':        { en: 'INF',                  ru: 'ПЕХ' },
  'card.armor':           { en: 'ARM',                  ru: 'БТТ' },
  'card.air':             { en: 'AIR',                  ru: 'АВИ' },
  'card.attack':          { en: 'ATTACK',               ru: 'АТАКА' },
  'card.nuke':            { en: '☢ NUCLEAR STRIKE',     ru: '☢ ЯДЕРНЫЙ УДАР' },
  'card.orbital':         { en: '🛰 ORBITAL STRIKE',    ru: '🛰 ОРБИТАЛЬНЫЙ УДАР' },
  'card.blackout':        { en: '⚡ E-WAR BLACKOUT',    ru: '⚡ РЭБ ПОДАВЛЕНИЕ' },
  'card.isolated':        { en: 'ISOLATED',             ru: 'ОКРУЖЁН' },

  // ── ECONOMY PANEL ──────────────────────────────────────────────────────────
  'economy.title':        { en: 'PRODUCTION COMMAND',   ru: 'КОМАНДОВАНИЕ ПРОИЗВОДСТВОМ' },
  'economy.buildInfantry': { en: 'Deploy Infantry',     ru: 'Развернуть пехоту' },
  'economy.buildArmor':   { en: 'Deploy Armor',         ru: 'Развернуть бронетехнику' },
  'economy.buildAir':     { en: 'Deploy Air',           ru: 'Развернуть авиацию' },
  'economy.funds':        { en: 'Funds',                ru: 'Фонды' },
  'economy.oil':          { en: 'Oil',                  ru: 'Нефть' },
  'economy.supplies':     { en: 'Supplies',             ru: 'Снабжение' },
  'economy.industry':     { en: 'Industry',             ru: 'Промышленность' },
  'economy.noRegion':     { en: 'Select an owned region on the map first.', ru: 'Сначала выберите свой регион на карте.' },

  // ── DIPLOMACY PANEL ────────────────────────────────────────────────────────
  'diplomacy.title':      { en: 'DIPLOMACY COMMAND',    ru: 'ДИПЛОМАТИЧЕСКОЕ КОМАНДОВАНИЕ' },
  'diplomacy.trade':      { en: 'Black Market Trade',   ru: 'Чёрный рынок' },
  'diplomacy.sanction':   { en: 'Cyber Sanctions',      ru: 'Кибер-санкции' },
  'diplomacy.proxy':      { en: 'Proxy Funding',        ru: 'Финансирование прокси' },

  // ── RESEARCH PANEL ─────────────────────────────────────────────────────────
  'research.title':       { en: 'RESEARCH COMMAND',     ru: 'НАУЧНОЕ КОМАНДОВАНИЕ' },
  'research.techPoints':  { en: 'Tech Points',          ru: 'Научные очки' },
  'research.unlock':      { en: 'UNLOCK',               ru: 'РАЗБЛОКИРОВАТЬ' },
  'research.locked':      { en: 'LOCKED',               ru: 'ЗАБЛОКИРОВАНО' },
  'research.active':      { en: 'ACTIVE',               ru: 'АКТИВНО' },

  // ── GAME LOG MESSAGES ──────────────────────────────────────────────────────
  'log.turnCompleted':    { en: 'Turn {n} completed.',  ru: 'Ход {n} завершён.' },
  'log.attackSuccess':    { en: 'SUCCESS: Operation in {region}', ru: 'УСПЕХ: Операция в {region}' },
  'log.attackFailure':    { en: 'FAILURE: Operation in {region}', ru: 'ПРОВАЛ: Операция в {region}' },
  'log.regionLost':       { en: 'STRATEGIC LOSS: {region} captured by {faction}', ru: 'СТРАТЕГИЧЕСКИЕ ПОТЕРИ: {region} захвачен {faction}' },
  'log.attrition':        { en: 'WARNING: Isolated forces are suffering attrition!', ru: 'ВНИМАНИЕ: Окружённые войска несут потери от истощения!' },
  'log.actII':            { en: '⚔ ACT II: GLOBAL WAR — Full mobilisation declared worldwide.', ru: '⚔ АКТ II: МИРОВАЯ ВОЙНА — Объявлена полная мобилизация.' },
  'log.actIII':           { en: '☢ ACT III: ESCALATION — Nuclear doctrine is now active.', ru: '☢ АКТ III: ЭСКАЛАЦИЯ — Ядерная доктрина активирована.' },
  'log.production':       { en: 'PRODUCTION: {unit} deployed in {region}', ru: 'ПРОИЗВОДСТВО: {unit} развёрнут в {region}' },

  // ── ACT BANNERS ────────────────────────────────────────────────────────────
  'act.ii':               { en: '⚔ ACT II · GLOBAL WAR',   ru: '⚔ АКТ II · МИРОВАЯ ВОЙНА' },
  'act.iii':              { en: '☢ ACT III · ESCALATION',   ru: '☢ АКТ III · ЭСКАЛАЦИЯ' },

  // ── GAME OVER SCREEN ───────────────────────────────────────────────────────
  'gameover.victory':     { en: '🏆 WORLD DOMINATION',      ru: '🏆 МИРОВОЕ ГОСПОДСТВО' },
  'gameover.military':    { en: '💀 MILITARY DEFEAT',        ru: '💀 ВОЕННОЕ ПОРАЖЕНИЕ' },
  'gameover.collapse':    { en: '🔥 SYSTEMATIC COLLAPSE',   ru: '🔥 СИСТЕМНЫЙ КОЛЛАПС' },
  'gameover.nuclear':     { en: '☢ NUCLEAR ANNIHILATION',   ru: '☢ ЯДЕРНОЕ УНИЧТОЖЕНИЕ' },
  'gameover.sub.victory': { en: '{faction} conquers the globe in {n} turns.', ru: '{faction} завоевал мир за {n} ходов.' },
  'gameover.sub.military': { en: 'All territory has been lost. The command structure has dissolved.', ru: 'Все территории потеряны. Командная структура распалась.' },
  'gameover.sub.collapse': { en: 'Internal stability reached zero. The government fell from within.', ru: 'Внутренняя стабильность упала до нуля. Правительство пало изнутри.' },
  'gameover.sub.nuclear': { en: 'The warheads fell. There is nothing left to command.', ru: 'Боеголовки упали. Командовать больше нечем.' },
  'gameover.summary':     { en: 'CAMPAIGN SUMMARY',         ru: 'ИТОГ КАМПАНИИ' },
  'gameover.turnsSurvived': { en: 'Turns survived:',        ru: 'Выжито ходов:' },
  'gameover.actReached':  { en: 'Act reached:',             ru: 'Достигнут акт:' },
  'gameover.regionsHeld': { en: 'Regions held:',            ru: 'Удержано регионов:' },
  'gameover.actLabel':    { en: 'ACT {n}',                  ru: 'АКТ {n}' },

  // ── DIPLOMACY PANEL ────────────────────────────────────────────────────────
  'diplomacy.header':       { en: 'ALLIANCE OPERATIONS',     ru: 'ОПЕРАЦИИ АЛЬЯНСА' },
  'diplomacy.stability':    { en: 'Domestic Stability:',     ru: 'Внутренняя стабильность:' },
  'diplomacy.tradeBtn':     { en: 'BLACK MARKET TRADE',      ru: 'ЧЁРНЫЙ РЫНОК' },
  'diplomacy.executeTradeBtn': { en: 'EXECUTE TRADE',        ru: 'ВЫПОЛНИТЬ СДЕЛКУ' },
  'diplomacy.sanctionBtn':  { en: 'CYBER SANCTIONS',         ru: 'КИБЕР-САНКЦИИ' },
  'diplomacy.proxyBtn':     { en: 'FUND REBEL PROXY',        ru: 'ФИНАНСИРОВАТЬ ПОВСТАНЦЕВ' },
  'diplomacy.proxyImpact':  { en: 'IMPACT: MAJOR REBELLION', ru: 'ЭФФЕКТ: КРУПНОЕ ВОССТАНИЕ' },

  // ── ECONOMY PANEL ──────────────────────────────────────────────────────────
  'economy.selectRegion':   { en: 'Select Owned Region',     ru: 'Выберите свой регион' },
  'economy.header':         { en: 'DEPLOYMENT COMMAND',      ru: 'КОМАНДОВАНИЕ РАЗВЁРТЫВАНИЕМ' },
  'economy.requiresInd':    { en: 'Requires {n} Industry',   ru: 'Требуется {n} промышленности' },

  // ── FACTION SELECT ─────────────────────────────────────────────────────────
  'faction.selectAlignment': { en: 'SELECT ALIGNMENT',       ru: 'ВЫБЕРИТЕ СТОРОНУ' },
  'faction.subtitle':       { en: 'Choose your superpower for the impending global conflict', ru: 'Выберите сверхдержаву для надвигающегося глобального конфликта' },
  'faction.back':           { en: 'BACK',                    ru: 'НАЗАД' },
  'faction.initialize':     { en: 'INITIALIZE DEPLOYMENT',   ru: 'ИНИЦИАЛИЗИРОВАТЬ РАЗВЁРТЫВАНИЕ' },

  // ── RESEARCH PANEL ─────────────────────────────────────────────────────────
  'research.header':        { en: 'RESEARCH & DEVELOPMENT',  ru: 'ИССЛЕДОВАНИЯ И РАЗРАБОТКИ' },
  'research.subtitle':      { en: 'Advanced Weapons Programs', ru: 'Программы передового вооружения' },

  // ── MAIN MENU ──────────────────────────────────────────────────────────────
  'menu.header':            { en: 'COMMAND & CONTROL CENTER', ru: 'ЦЕНТР УПРАВЛЕНИЯ И КОНТРОЛЯ' },
  'menu.headerSub':         { en: 'Initiate global mobilization protocols', ru: 'Инициировать протоколы глобальной мобилизации' },
  'menu.loadContinue':      { en: 'LOAD / CONTINUE',         ru: 'ЗАГРУЗИТЬ / ПРОДОЛЖИТЬ' },
  'menu.creditsAbout':      { en: 'CREDITS / ABOUT',         ru: 'АВТОРЫ / О ПРОЕКТЕ' },
  'menu.selectMode':        { en: 'SELECT CAMPAIGN TYPE',    ru: 'ВЫБЕРИТЕ ТИП КАМПАНИИ' },
  'menu.gameMode':          { en: 'GAME MODE',               ru: 'РЕЖИМ ИГРЫ' },
  'menu.cancel':            { en: 'CANCEL',                  ru: 'ОТМЕНА' },

  // ── NUKE MODAL ─────────────────────────────────────────────────────────────
  'nuke.oneUse':            { en: 'One use per turn',        ru: 'Один пуск за ход' },
  'nuke.abort':             { en: 'ABORT',                   ru: 'ОТМЕНА' },

  // ── SELECTION CARD ─────────────────────────────────────────────────────────
  'card.close':             { en: 'CLOSE',                   ru: 'ЗАКРЫТЬ' },

  // ── SPY OPS ────────────────────────────────────────────────────────────────
  'spy.title':              { en: '🕵 SPY OPS',              ru: '🕵 РАЗВЕДКА' },
  'spy.reveal':             { en: '👁 REVEAL REGION',        ru: '👁 РАЗВЕДАТЬ РЕГИОН' },
  'spy.sabotage':           { en: '💣 SABOTAGE INDUSTRY',    ru: '💣 ДИВЕРСИЯ НА ЗАВОДАХ' },
  'spy.assassinate':        { en: '🗡 ASSASSINATE LEADER (2 charges)', ru: '🗡 ЛИКВИДИРОВАТЬ ЛИДЕРА (2 заряда)' },
  'spy.close':              { en: 'CLOSE',                   ru: 'ЗАКРЫТЬ' },
  'spy.noCharges':          { en: 'No charges remaining',    ru: 'Нет зарядов' },

  // ── WEATHER ────────────────────────────────────────────────────────────────
  'weather.clear':          { en: 'CLEAR',     ru: 'ЯСНО' },
  'weather.rain':           { en: 'RAIN',      ru: 'ДОЖДЬ' },
  'weather.storm':          { en: 'STORM',     ru: 'ШТОРМ' },
  'weather.snow':           { en: 'BLIZZARD',  ru: 'ПУРГА' },
  'weather.heatwave':       { en: 'HEAT',      ru: 'ЖАРА' },
  'weather.fog':            { en: 'FOG',       ru: 'ТУМАН' },

  // ── GAME LOG MESSAGES ──────────────────────────────────────────────────────
  'log.campaignStart':      { en: 'Campaign started as {faction} — {mode} mode', ru: 'Кампания начата за {faction} — режим {mode}' },
  'log.attackSuccess2':     { en: 'SUCCESS: Operation in {region}',  ru: 'УСПЕХ: Операция в {region}' },
  'log.attackFailure2':     { en: 'FAILURE: Operation in {region}',  ru: 'ПРОВАЛ: Операция в {region}' },
  'log.navalRequired':      { en: 'ERROR: Naval units require a coastal region.', ru: 'ОШИБКА: Морские единицы требуют прибрежного региона.' },
  'log.production2':        { en: 'PRODUCTION: {unit} deployed in {region}', ru: 'ПРОИЗВОДСТВО: {unit} развёрнут в {region}' },
  'log.insufficientInd':    { en: 'ERROR: Insufficient Industry in {region}', ru: 'ОШИБКА: Недостаточно промышленности в {region}' },
  'log.insufficientRes':    { en: 'ERROR: Insufficient Funds or Supplies', ru: 'ОШИБКА: Недостаточно средств или снабжения' },
  'log.nuclearNoWarheads':  { en: 'NUCLEAR: No warheads in stockpile.', ru: 'ЯДЕРНОЕ: Нет боеголовок на складе.' },
  'log.nuclearAlreadyUsed': { en: 'NUCLEAR: Launch protocol already executed this turn.', ru: 'ЯДЕРНОЕ: Протокол пуска уже выполнен в этом ходу.' },
  'log.nuclearOwnTerritory':{ en: 'NUCLEAR: Cannot target own territory.', ru: 'ЯДЕРНОЕ: Нельзя атаковать свою территорию.' },
  'log.nuclearNeutral':     { en: 'NUCLEAR: Cannot strike neutral regions.', ru: 'ЯДЕРНОЕ: Нельзя атаковать нейтральные регионы.' },
  'log.nuclearStrike':      { en: '☢ NUCLEAR STRIKE: {region} obliterated.', ru: '☢ ЯДЕРНЫЙ УДАР: {region} уничтожен.' },
  'log.strategicLoss':      { en: 'STRATEGIC LOSS: {region} captured by {faction}', ru: 'СТРАТЕГИЧЕСКИЕ ПОТЕРИ: {region} захвачен {faction}' },
  'log.deadHand':           { en: '☠ DEAD HAND: Automated retaliation — ☢ {region} obliterated!', ru: '☠ МЁРТВАЯ РУКА: Автоматический ответный удар — ☢ {region} уничтожен!' },
  'log.spyNoCharges':       { en: 'SPY: No operative charges remaining.', ru: 'РАЗВЕДКА: Нет зарядов агентов.' },
  'log.spyReveal':          { en: '🕵 SPY REVEAL: {region} and surroundings exposed.', ru: '🕵 РАЗВЕДКА: {region} и окрестности раскрыты.' },
  'log.spySabotage':        { en: '💣 SABOTAGE: Infrastructure destroyed in {region}.', ru: '💣 ДИВЕРСИЯ: Инфраструктура уничтожена в {region}.' },
  'log.spyAssassinate':     { en: '🗡 ASSASSINATION: High-value target eliminated in {faction}.', ru: '🗡 ЛИКВИДАЦИЯ: Важная цель устранена в {faction}.' },
  'log.researchComplete':   { en: 'RESEARCH COMPLETE: {name}', ru: 'ИССЛЕДОВАНИЕ ЗАВЕРШЕНО: {name}' },
  'log.researchActive':     { en: 'RESEARCH: {name} already active.', ru: 'ИССЛЕДОВАНИЕ: {name} уже активно.' },
  'log.researchNoPoints':   { en: 'RESEARCH: Insufficient tech points (need {n}).', ru: 'ИССЛЕДОВАНИЕ: Недостаточно очков (нужно {n}).' },
  'log.researchRequires':   { en: 'RESEARCH: Requires {name} first.', ru: 'ИССЛЕДОВАНИЕ: Сначала требуется {name}.' },
  'log.researchBlocked':    { en: 'RESEARCH: Blocked by mutual exclusion.', ru: 'ИССЛЕДОВАНИЕ: Заблокировано взаимным исключением.' },

  // ── CAMPAIGN MODE ──────────────────────────────────────────────────────────
  'campaign.title':         { en: 'CAMPAIGN',                ru: 'КАМПАНИЯ' },
  'campaign.missions':      { en: 'MISSIONS',                ru: 'МИССИИ' },
  'campaign.objective':     { en: 'OBJECTIVE',               ru: 'ЦЕЛЬ' },
  'campaign.complete':      { en: 'COMPLETE',                ru: 'ВЫПОЛНЕНО' },
  'campaign.failed':        { en: 'FAILED',                  ru: 'ПРОВАЛЕНО' },
  'campaign.active':        { en: 'ACTIVE',                  ru: 'АКТИВНО' },
  'campaign.reward':        { en: 'REWARD',                  ru: 'НАГРАДА' },
  'campaign.progress':      { en: 'Progress:',               ru: 'Прогресс:' },


  // ── FACTION DESCRIPTIONS (from mapData FD) ────────────────────────────────
  'faction.nato.name':    { en: 'NATO Alliance',              ru: 'Альянс НАТО' },
  'faction.nato.desc':    { en: 'Technological superiority & economic dominance.', ru: 'Технологическое превосходство и экономическое господство.' },
  'faction.east.name':    { en: 'Eastern Alliance',           ru: 'Восточный Альянс' },
  'faction.east.desc':    { en: 'Vast Eurasian territory & nuclear arsenal.',      ru: 'Огромная евразийская территория и ядерный арсенал.' },
  'faction.china.name':   { en: 'Pacific Pact',               ru: 'Тихоокеанский Пакт' },
  'faction.china.desc':   { en: "World's largest army & Pacific dominance.",      ru: 'Крупнейшая армия мира и господство в Тихом океане.' },
  'faction.command':      { en: 'COMMAND',                    ru: 'КОМАНДОВАНИЕ' },

  // ── GAME MODES (full labels + descriptions) ────────────────────────────────
  'mode.campaign.label':  { en: 'CAMPAIGN',   ru: 'КАМПАНИЯ' },
  'mode.campaign.sub':    { en: 'Standard WW3 scenario. Control 60% to win.', ru: 'Стандартный сценарий ВМВ. Контроль 60% для победы.' },
  'mode.blitz.label':     { en: 'BLITZ',      ru: 'БЛИЦКРИГ' },
  'mode.blitz.sub':       { en: 'Fast pace. 40% control wins. AI is very aggressive.', ru: 'Быстрый темп. 40% контроль — победа. ИИ очень агрессивен.' },
  'mode.survival.label':  { en: 'SURVIVAL',   ru: 'ВЫЖИВАНИЕ' },
  'mode.survival.sub':    { en: 'Start with 1 region. Two AI factions already at war.', ru: 'Начало с 1 региона. Два ИИ уже в состоянии войны.' },

  // ── STATS ──────────────────────────────────────────────────────────────────
  'stat.atk':             { en: 'ATK',        ru: 'АТК' },
  'stat.def':             { en: 'DEF',        ru: 'ЗАЩ' },
  'stat.nukes':           { en: 'NUKES',      ru: 'ЯДЕРКИ' },

  // ── BOTTOM NAV ─────────────────────────────────────────────────────────────
  'nav.missions':         { en: 'MISSIONS',   ru: 'МИССИИ' },

  // ── INTRO SCREEN ───────────────────────────────────────────────────────────
  'intro.title':          { en: 'WORLD WAR III',   ru: 'ТРЕТЬЯ МИРОВАЯ ВОЙНА' },
  'intro.subtitle':       { en: 'HOW WE GOT HERE', ru: 'КАК МЫ СЮДА ПРИШЛИ' },
  'intro.burnLine':       { en: 'THE WORLD BURNS', ru: 'МИР ГОРИТ' },
  'intro.enter':          { en: 'ENTER COMMAND CENTER', ru: 'ВОЙТИ В ЦЕНТР УПРАВЛЕНИЯ' },


  // ── IN-GAME MAP SCREEN HUD ─────────────────────────────────────────────────
  'hud.tp':               { en: 'TP',         ru: 'НО' },
  'hud.regionIntel':      { en: 'REGION INTEL', ru: 'РАЗВЕДДАННЫЕ' },
  'hud.eco':              { en: 'ECO',        ru: 'ЭКО' },
  'hud.ind':              { en: 'IND',        ru: 'ПРМ' },
  'hud.stb':              { en: 'STB',        ru: 'СТБ' },
  'hud.ready':            { en: 'READY',      ru: 'ГОТОВ' },
  'hud.locked':           { en: 'LOCKED',     ru: 'ЗАПЕРТ' },

  // ── BOTTOM NAV TABS ────────────────────────────────────────────────────────
  'nav.map':              { en: 'MAP',        ru: 'КАРТА' },
  'nav.deploy':           { en: 'DEPLOY',     ru: 'РАЗВЁРН' },
  'nav.research':         { en: 'RESEARCH',   ru: 'НАУКА' },
  'nav.alliance':         { en: 'ALLIANCE',   ru: 'АЛЬЯНС' },
  'nav.endTurn':          { en: 'END TURN',   ru: 'КОНЕЦ ХОДА' },

  // ── UNIT LABELS ────────────────────────────────────────────────────────────
  'unit.infantry':        { en: '⚔ INF',     ru: '⚔ ПЕХ' },
  'unit.armor':           { en: '🛡 ARM',     ru: '🛡 БРН' },
  'unit.air':             { en: '✈ AIR',      ru: '✈ АВИ' },
  'unit.destroyer':       { en: '⚓ DST',     ru: '⚓ ЭСМ' },
  'unit.submarine':       { en: '🌊 SUB',     ru: '🌊 ПЛД' },
  'unit.carrier':         { en: '🚢 CVN',     ru: '🚢 АВН' },

  // ── SPECIAL ACTIONS ────────────────────────────────────────────────────────
  'action.nuke':          { en: 'NUKE',       ru: 'ЯДЕРНЫЙ' },
  'action.orbital':       { en: 'ORBITAL',    ru: 'ОРБИТ.' },
  'action.blackout':      { en: 'BLACKOUT',   ru: 'ЗАТМЕНИЕ' },
  'action.attack':        { en: 'ATTACK',     ru: 'АТАКА' },

  // ── GAME OVER TITLES ───────────────────────────────────────────────────────
  'gameover.title.military':  { en: 'MILITARY DEFEAT',   ru: 'ВОЕННОЕ ПОРАЖЕНИЕ' },
  'gameover.title.collapse':  { en: 'STATE COLLAPSE',    ru: 'КОЛЛАПС ГОСУДАРСТВА' },
  'gameover.title.nuclear':   { en: 'NUCLEAR ANNIHILATION', ru: 'ЯДЕРНОЕ УНИЧТОЖЕНИЕ' },
  'gameover.title.victory':   { en: 'TOTAL VICTORY',     ru: 'ПОЛНАЯ ПОБЕДА' },
  'gameover.default':         { en: 'GAME OVER',         ru: 'ИГРА ОКОНЧЕНА' },

  'gameover.mainMenu':    { en: 'MAIN MENU',                ru: 'ГЛАВНОЕ МЕНЮ' },
  'gameover.newCampaign': { en: 'NEW CAMPAIGN',             ru: 'НОВАЯ КАМПАНИЯ' },

  // ── NUCLEAR MODAL ──────────────────────────────────────────────────────────
  'nuke.title':           { en: '☢ NUCLEAR LAUNCH',         ru: '☢ ЯДЕРНЫЙ ПУСК' },
  'nuke.confirm':         { en: 'CONFIRM LAUNCH',           ru: 'ПОДТВЕРДИТЬ ПУСК' },
  'nuke.cancel':          { en: 'ABORT',                    ru: 'ОТМЕНА' },
  'nuke.stockpile':       { en: 'Warheads remaining:',      ru: 'Боеголовок осталось:' },

};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useTranslation() — returns a t(key, vars?) function.
 * vars is an object of {placeholder: value} pairs.
 * Example: t('log.turnCompleted', { n: 5 }) → "Turn 5 completed."
 */
export function useTranslation() {
  const lang = getStore()(state => state.settings?.language || 'en') || 'en';

  const t = useCallback((key, vars = {}) => {
    try {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    let str = entry[lang] || entry['en'] || key;

    // Replace {placeholder} tokens
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });

    return str;
    } catch(e) { return key; }
  }, [lang]);

  return t;
}

// ─── Static helper (outside React components) ─────────────────────────────────
export function translate(key, lang = 'en', vars = {}) {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  let str = entry[lang] || entry['en'] || key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  });
  return str;
}
