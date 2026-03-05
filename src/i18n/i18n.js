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
import useGameStore from '../store/useGameStore';

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
  const lang = useGameStore(state => state.settings?.language || 'en') || 'en';

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
