/**
 * WW3: GLOBAL COLLAPSE — Internationalisation System
 * Supported languages: 'en' (English), 'ru' (Russian), 'ge' (Georgian)
 *
 * Usage:
 *   import { useTranslation } from '../i18n/i18n';
 *   const t = useTranslation();
 *   <Text>{t('settings.title')}</Text>
 */

import React, { useCallback } from 'react';

// ─── Translation Table ────────────────────────────────────────────────────────

export const TRANSLATIONS = {

  // ── COMMON ─────────────────────────────────────────────────────────────────
  'common.back':          { en: 'BACK',          ru: 'НАЗАД', ge: 'უკან' },
  'common.confirm':       { en: 'CONFIRM',        ru: 'ПОДТВЕРДИТЬ', ge: 'დადასტურება' },
  'common.cancel':        { en: 'CANCEL',         ru: 'ОТМЕНА', ge: 'გაუქმება' },
  'common.close':         { en: 'CLOSE',          ru: 'ЗАКРЫТЬ', ge: 'დახურვა' },
  'common.on':            { en: 'ONLINE',         ru: 'ВКЛ', ge: 'ჩართულია' },
  'common.off':           { en: 'OFFLINE',        ru: 'ВЫКЛ', ge: 'გამორთულია' },
  'common.enabled':       { en: 'ENABLED',        ru: 'ВКЛЮЧЕНО', ge: 'ჩართულია' },
  'common.disabled':      { en: 'DISABLED',       ru: 'ВЫКЛЮЧЕНО', ge: 'გამორთულია' },
  'common.turn':          { en: 'Turn',           ru: 'Ход', ge: 'მოლოდინი' },
  'common.error':         { en: 'ERROR',          ru: 'ОШИБКА', ge: 'შეცდომა' },
  'common.warning':       { en: 'WARNING',        ru: 'ВНИМАНИЕ', ge: 'გაფრთხილება' },

  // ── SPLASH SCREEN ──────────────────────────────────────────────────────────
  'splash.studio':        { en: 'STUDIO · PRESENTS',    ru: 'СТУДИЯ · ПРЕДСТАВЛЯЕТ', ge: 'სტუდია · წარმოგიდგენთ' },

  // ── INTRO SCREEN ───────────────────────────────────────────────────────────
  'intro.tapToContinue':  { en: 'TAP TO CONTINUE',      ru: 'НАЖМИТЕ ЧТОБЫ ПРОДОЛЖИТЬ', ge: 'შეეხეთ გასაგრძელებლად' },

  // ── MAIN MENU ──────────────────────────────────────────────────────────────
  'menu.subtitle':        { en: 'GLOBAL COLLAPSE',      ru: 'ГЛОБАЛЬНЫЙ КОЛЛАПС', ge: 'გლობალური კოლაფსი' },
  'menu.newGame':         { en: 'NEW CAMPAIGN',         ru: 'НОВАЯ КАМПАНИЯ', ge: 'ახალი კამპანია' },
  'menu.continue':        { en: 'CONTINUE',             ru: 'ПРОДОЛЖИТЬ', ge: 'გაგრძელება' },
  'menu.settings':        { en: 'SETTINGS',             ru: 'НАСТРОЙКИ', ge: 'პარამეტრები' },
  'menu.credits':         { en: 'CREDITS',              ru: 'АВТОРЫ', ge: 'ავტორები' },
  'menu.noSave':          { en: 'No save found',        ru: 'Сохранение не найдено', ge: 'შენახვა ვერ მოიძებნა' },

  // ── FACTION SELECT ─────────────────────────────────────────────────────────
  'faction.title':        { en: 'SELECT YOUR FACTION',  ru: 'ВЫБЕРИТЕ ФРАКЦИЮ', ge: 'ფრაქციის არჩევა' },
  'faction.deploy':       { en: 'DEPLOY',               ru: 'РАЗВЕРНУТЬ', ge: 'განლაგება' },
  'faction.startingRegions': { en: 'Starting Regions',  ru: 'Начальные регионы', ge: 'საწყისი რეგიონები' },
  'faction.attackPower':  { en: 'Attack Power',         ru: 'Атака', ge: 'შეტევის ძალა' },
  'faction.defencePower': { en: 'Defence Power',        ru: 'Защита', ge: 'თავდაცვის ძალა' },
  'faction.nukes':        { en: 'Nuclear Arsenal',      ru: 'Ядерный арсенал', ge: 'ბირთვული არსენალი' },

  // ── SETTINGS ───────────────────────────────────────────────────────────────
  'settings.title':       { en: 'SYSTEM CONFIGURATION', ru: 'КОНФИГУРАЦИЯ СИСТЕМЫ', ge: 'სისტემის კონფიგურაცია' },
  'settings.audio':       { en: 'AUDIO PROTOCOLS',      ru: 'АУДИО ПРОТОКОЛЫ', ge: 'აუდიო პროტოკოლები' },
  'settings.interface':   { en: 'INTERFACE PROTOCOLS',  ru: 'ИНТЕРФЕЙС ПРОТОКОЛЫ', ge: 'ინტერფეისის პროტოკოლები' },
  'settings.language':    { en: 'LANGUAGE / ЯЗЫК',      ru: 'ЯЗЫК / LANGUAGE', ge: 'ენა / LANGUAGE' },
  'settings.music':       { en: 'Atmospheric Music',    ru: 'Атмосферная музыка', ge: 'ატმოსფერული მუსიკა' },
  'settings.sfx':         { en: 'Tactical SFX',         ru: 'Тактические звуки', ge: 'ტაქტიკური ეფექტები' },
  'settings.animations':  { en: 'Combat Animations',    ru: 'Боевые анимации', ge: 'საბრძოლო ანიმაციები' },
  'settings.langEnglish': { en: 'English',              ru: 'Английский', ge: 'ინგლისური' },
  'settings.langRussian': { en: 'Russian',              ru: 'Русский', ge: 'რუსული' },
  'settings.langGeorgian': { en: 'Georgian',             ru: 'Грузинский', ge: 'ქართული' },

  // ── TOP BAR ────────────────────────────────────────────────────────────────
  'hud.title':            { en: 'WORLD CONQUEST OVERVIEW', ru: 'ОБЗОР МИРОВОГО ЗАВОЕВАНИЯ', ge: 'მსოფლიო დაპყრობის მიმოხილვა' },
  'hud.oil':              { en: 'OIL',                  ru: 'НЕФТЬ', ge: 'ნავთობი' },
  'hud.steel':            { en: 'STEEL',                ru: 'СТАЛЬ', ge: 'მარაგი' },
  'hud.money':            { en: 'MONEY',                ru: 'ДЕНЬГИ', ge: 'ფული' },
  'hud.energy':           { en: 'ENERGY',               ru: 'ЭНЕРГИЯ', ge: 'სტაბილ.' },
  'hud.tp':               { en: 'TP',                   ru: 'НО', ge: 'ტ.წ' },

  // ── BOTTOM NAV ─────────────────────────────────────────────────────────────
  'nav.map':              { en: 'MAP',                  ru: 'КАРТА', ge: 'რუკა' },
  'nav.deploy':           { en: 'DEPLOY',               ru: 'ВОЙСКА', ge: 'განლ.' },
  'nav.research':         { en: 'RESEARCH',             ru: 'НАУКА', ge: 'კვლევა' },
  'nav.alliance':         { en: 'ALLIANCE',             ru: 'АЛЬЯНС', ge: 'ალიანსი' },
  'nav.endTurn':          { en: 'END TURN',             ru: 'КОНЕЦ ХОДА', ge: 'მოლოდინის დასასრული' },

  // ── TACTICAL BRIEFING PANEL ────────────────────────────────────────────────
  'briefing.title':       { en: 'TACTICAL BRIEFING',    ru: 'ТАКТИЧЕСКИЙ БРИФИНГ', ge: 'ტაქტიკური ინსტრუქტაჟი' },
  'briefing.missionReport': { en: 'MISSION REPORT:',   ru: 'ДОНЕСЕНИЕ:', ge: 'მისიის ანგარიში:' },

  // ── TERRAIN INTEL PANEL ────────────────────────────────────────────────────
  'intel.title':          { en: 'TERRAIN & DEPTH INTEL', ru: 'РАЗВЕДКА МЕСТНОСТИ', ge: 'ტერიტორიისა და სიღრმის დაზვერვა' },
  'intel.elevation':      { en: 'Elevation',            ru: 'Высота', ge: 'სიმაღლე' },
  'intel.depth':          { en: 'Depth',                ru: 'Глубина', ge: 'სიღრმე' },

  // ── SELECTION CARD ─────────────────────────────────────────────────────────
  'card.infantry':        { en: 'INF',                  ru: 'ПЕХ', ge: 'ქვ.ლ' },
  'card.armor':           { en: 'ARM',                  ru: 'БТТ', ge: 'ჯვ.ტ' },
  'card.air':             { en: 'AIR',                  ru: 'АВИ', ge: 'ავ' },
  'card.attack':          { en: 'ATTACK',               ru: 'АТАКА', ge: 'შეტევა' },
  'card.nuke':            { en: '☢ NUCLEAR STRIKE',     ru: '☢ ЯДЕРНЫЙ УДАР', ge: '☢ ბირთვული დარტყმა' },
  'card.orbital':         { en: '🛰 ORBITAL STRIKE',    ru: '🛰 ОРБИТАЛЬНЫЙ УДАР', ge: '🛰 ორბიტალური დარტყმა' },
  'card.blackout':        { en: '⚡ E-WAR BLACKOUT',    ru: '⚡ РЭБ ПОДАВЛЕНИЕ', ge: '⚡ ელ.ომის ბლოკადა' },
  'card.isolated':        { en: 'ISOLATED',             ru: 'ОКРУЖЁН', ge: 'გარშემორტყმული' },

  // ── ECONOMY PANEL ──────────────────────────────────────────────────────────
  'economy.title':        { en: 'PRODUCTION COMMAND',   ru: 'КОМАНДОВАНИЕ ПРОИЗВОДСТВОМ', ge: 'წარმოების სარდლობა' },
  'economy.buildInfantry': { en: 'Deploy Infantry',     ru: 'Развернуть пехоту', ge: 'ქვეითების განლაგება' },
  'economy.buildArmor':   { en: 'Deploy Armor',         ru: 'Развернуть бронетехнику', ge: 'ჯავშნის განლაგება' },
  'economy.buildAir':     { en: 'Deploy Air',           ru: 'Развернуть авиацию', ge: 'ავიაციის განლაგება' },
  'economy.funds':        { en: 'Funds',                ru: 'Фонды', ge: 'სახსრები' },
  'economy.oil':          { en: 'Oil',                  ru: 'Нефть', ge: 'ნავთობი' },
  'economy.supplies':     { en: 'Supplies',             ru: 'Снабжение', ge: 'მარაგი' },
  'economy.industry':     { en: 'Industry',             ru: 'Промышленность', ge: 'მრეწველობა' },
  'economy.noRegion':     { en: 'Select an owned region on the map first.', ru: 'Сначала выберите свой регион на карте.', ge: 'ჯერ აირჩიეთ საკუთარი რეგიონი რუკაზე.' },

  // ── DIPLOMACY PANEL ────────────────────────────────────────────────────────
  'diplomacy.title':      { en: 'DIPLOMACY COMMAND',    ru: 'ДИПЛОМАТИЧЕСКОЕ КОМАНДОВАНИЕ', ge: 'დიპლომატიის სარდლობა' },
  'diplomacy.trade':      { en: 'Black Market Trade',   ru: 'Чёрный рынок', ge: 'შავი ბაზრის ვაჭრობა' },
  'diplomacy.sanction':   { en: 'Cyber Sanctions',      ru: 'Кибер-санкции', ge: 'კიბერ სანქციები' },
  'diplomacy.proxy':      { en: 'Proxy Funding',        ru: 'Финансирование прокси', ge: 'პროქსი დაფინანსება' },

  // ── RESEARCH PANEL ─────────────────────────────────────────────────────────
  'research.title':       { en: 'RESEARCH COMMAND',     ru: 'НАУЧНОЕ КОМАНДОВАНИЕ', ge: 'კვლევის სარდლობა' },
  'research.techPoints':  { en: 'Tech Points',          ru: 'Научные очки', ge: 'ტექნიკური ქულები' },
  'research.unlock':      { en: 'UNLOCK',               ru: 'РАЗБЛОКИРОВАТЬ', ge: 'განბლოკვა' },
  'research.locked':      { en: 'LOCKED',               ru: 'ЗАБЛОКИРОВАНО', ge: 'დაბლოკილია' },
  'research.active':      { en: 'ACTIVE',               ru: 'АКТИВНО', ge: 'აქტიურია' },

  // ── GAME LOG MESSAGES ──────────────────────────────────────────────────────
  'log.turnCompleted':    { en: 'Turn {n} completed.',  ru: 'Ход {n} завершён.', ge: 'მოლოდინი {n} დასრულდა.' },
  'log.attackSuccess':    { en: 'SUCCESS: Operation in {region}', ru: 'УСПЕХ: Операция в {region}', ge: 'წარმატება: ოპერაცია {region}-ში' },
  'log.attackFailure':    { en: 'FAILURE: Operation in {region}', ru: 'ПРОВАЛ: Операция в {region}', ge: 'მარცხი: ოპერაცია {region}-ში' },
  'log.regionLost':       { en: 'STRATEGIC LOSS: {region} captured by {faction}', ru: 'СТРАТЕГИЧЕСКИЕ ПОТЕРИ: {region} захвачен {faction}', ge: 'სტრატეგიული დანაკარგი: {region} დაიპყრო {faction}-მა' },
  'log.attrition':        { en: 'WARNING: Isolated forces are suffering attrition!', ru: 'ВНИМАНИЕ: Окружённые войска несут потери от истощения!', ge: 'გაფრთხილება: გარშემორტყმული ძალები განიცდიან დანაკარგებს!' },
  'log.actII':            { en: '⚔ ACT II: GLOBAL WAR — Full mobilisation declared worldwide.', ru: '⚔ АКТ II: МИРОВАЯ ВОЙНА — Объявлена полная мобилизация.', ge: '⚔ აქტი II: გლობალური ომი — გამოცხადებულია სრული მობილიზაცია.' },
  'log.actIII':           { en: '☢ ACT III: ESCALATION — Nuclear doctrine is now active.', ru: '☢ АКТ III: ЭСКАЛАЦИЯ — Ядерная доктрина активирована.', ge: '☢ აქტი III: ესკალაცია — ბირთვული დოქტრინა გააქტიურებულია.' },
  'log.production':       { en: 'PRODUCTION: {unit} deployed in {region}', ru: 'ПРОИЗВОДСТВО: {unit} развёрнут в {region}', ge: 'წარმოება: {unit} განლაგდა {region}-ში' },

  // ── ACT BANNERS ────────────────────────────────────────────────────────────
  'act.ii':               { en: '⚔ ACT II · GLOBAL WAR',   ru: '⚔ АКТ II · МИРОВАЯ ВОЙНА', ge: '⚔ აქტი II · გლობალური ომი' },
  'act.iii':              { en: '☢ ACT III · ESCALATION',   ru: '☢ АКТ III · ЭСКАЛАЦИЯ', ge: '☢ აქტი III · ესკალაცია' },

  // ── GAME OVER SCREEN ───────────────────────────────────────────────────────
  'gameover.victory':     { en: '🏆 WORLD DOMINATION',      ru: '🏆 МИРОВОЕ ГОСПОДСТВО', ge: '🏆 მსოფლიო ბატონობა' },
  'gameover.military':    { en: '💀 MILITARY DEFEAT',        ru: '💀 ВОЕННОЕ ПОРАЖЕНИЕ', ge: '💀 სამხედრო მარცხი' },
  'gameover.collapse':    { en: '🔥 SYSTEMATIC COLLAPSE',   ru: '🔥 СИСТЕМНЫЙ КОЛЛАПС', ge: '🔥 სისტემური კოლაფსი' },
  'gameover.nuclear':     { en: '☢ NUCLEAR ANNIHILATION',   ru: '☢ ЯДЕРНОЕ УНИЧТОЖЕНИЕ', ge: '☢ ბირთვული განადგურება' },
  'gameover.sub.victory': { en: '{faction} conquers the globe in {n} turns.', ru: '{faction} завоевал мир за {n} ходов.', ge: '{faction}-მა დაიპყრო მსოფლიო {n} მოლოდინში.' },
  'gameover.sub.military': { en: 'All territory has been lost. The command structure has dissolved.', ru: 'Все территории потеряны. Командная структура распалась.', ge: 'ყველა ტერიტორია დაიკარგა. სარდლობა დაიშალა.' },
  'gameover.sub.collapse': { en: 'Internal stability reached zero. The government fell from within.', ru: 'Внутренняя стабильность упала до нуля. Правительство пало изнутри.', ge: 'შიდა სტაბილურობა ნულამდე ჩამოვიდა. მთავრობა დაეცა.' },
  'gameover.sub.nuclear': { en: 'The warheads fell. There is nothing left to command.', ru: 'Боеголовки упали. Командовать больше нечем.', ge: 'თავდასხმები დაეცა. სარდლობა შეუძლებელია.' },
  'gameover.summary':     { en: 'CAMPAIGN SUMMARY',         ru: 'ИТОГ КАМПАНИИ', ge: 'კამპანიის შეჯამება' },
  'gameover.turnsSurvived': { en: 'Turns survived:',        ru: 'Выжито ходов:', ge: 'გადარჩენილი მოლოდინები:' },
  'gameover.actReached':  { en: 'Act reached:',             ru: 'Достигнут акт:', ge: 'მიღწეული აქტი:' },
  'gameover.regionsHeld': { en: 'Regions held:',            ru: 'Удержано регионов:', ge: 'დაკავებული რეგიონები:' },
  'gameover.actLabel':    { en: 'ACT {n}',                  ru: 'АКТ {n}', ge: 'აქტი {n}' },

  // ── DIPLOMACY PANEL ────────────────────────────────────────────────────────
  'diplomacy.header':       { en: 'ALLIANCE OPERATIONS',     ru: 'ОПЕРАЦИИ АЛЬЯНСА', ge: 'ალიანსის ოპერაციები' },
  'diplomacy.stability':    { en: 'Domestic Stability:',     ru: 'Внутренняя стабильность:', ge: 'შიდა სტაბილურობა:' },
  'diplomacy.tradeBtn':     { en: 'BLACK MARKET TRADE',      ru: 'ЧЁРНЫЙ РЫНОК', ge: 'შავი ბაზრის ვაჭრობა' },
  'diplomacy.executeTradeBtn': { en: 'EXECUTE TRADE',        ru: 'ВЫПОЛНИТЬ СДЕЛКУ', ge: 'გარიგების შესრულება' },
  'diplomacy.sanctionBtn':  { en: 'CYBER SANCTIONS',         ru: 'КИБЕР-САНКЦИИ', ge: 'კიბერ სანქციები' },
  'diplomacy.proxyBtn':     { en: 'FUND REBEL PROXY',        ru: 'ФИНАНСИРОВАТЬ ПОВСТАНЦЕВ', ge: 'მეამბოხეების დაფინანსება' },
  'diplomacy.proxyImpact':  { en: 'IMPACT: MAJOR REBELLION', ru: 'ЭФФЕКТ: КРУПНОЕ ВОССТАНИЕ', ge: 'ეფექტი: მასიური აჯანყება' },

  // ── ECONOMY PANEL ──────────────────────────────────────────────────────────
  'economy.selectRegion':   { en: 'Select Owned Region',     ru: 'Выберите свой регион', ge: 'საკუთარი რეგიონის არჩევა' },
  'economy.header':         { en: 'DEPLOYMENT COMMAND',      ru: 'КОМАНДОВАНИЕ РАЗВЁРТЫВАНИЕМ', ge: 'განლაგების სარდლობა' },
  'economy.requiresInd':    { en: 'Requires {n} Industry',   ru: 'Требуется {n} промышленности', ge: 'საჭიროა {n} მრეწველობა' },

  // ── FACTION SELECT ─────────────────────────────────────────────────────────
  'faction.selectAlignment': { en: 'SELECT ALIGNMENT',       ru: 'ВЫБЕРИТЕ СТОРОНУ', ge: 'მხარის არჩევა' },
  'faction.subtitle':       { en: 'Choose your superpower for the impending global conflict', ru: 'Выберите сверхдержаву для надвигающегося глобального конфликта', ge: 'აირჩიეთ სუპერსახელმწიფო მოახლოებული გლობალური კონფლიქტისთვის' },
  'faction.back':           { en: 'BACK',                    ru: 'НАЗАД', ge: 'უკან' },
  'faction.initialize':     { en: 'INITIALIZE DEPLOYMENT',   ru: 'ИНИЦИАЛИЗИРОВАТЬ РАЗВЁРТЫВАНИЕ', ge: 'განლაგების ინიციალიზაცია' },

  // ── RESEARCH PANEL ─────────────────────────────────────────────────────────
  'research.header':        { en: 'RESEARCH & DEVELOPMENT',  ru: 'ИССЛЕДОВАНИЯ И РАЗРАБОТКИ', ge: 'კვლევა და განვითარება' },
  'research.subtitle':      { en: 'Advanced Weapons Programs', ru: 'Программы передового вооружения', ge: 'მოწინავე შეიარაღების პროგრამები' },

  // ── MAIN MENU ──────────────────────────────────────────────────────────────
  'menu.header':            { en: 'COMMAND & CONTROL CENTER', ru: 'ЦЕНТР УПРАВЛЕНИЯ И КОНТРОЛЯ', ge: 'სარდლობისა და კონტროლის ცენტრი' },
  'menu.headerSub':         { en: 'Initiate global mobilization protocols', ru: 'Инициировать протоколы глобальной мобилизации', ge: 'გლობალური მობილიზაციის პროტოკოლების ინიციირება' },
  'menu.loadContinue':      { en: 'LOAD / CONTINUE',         ru: 'ЗАГРУЗИТЬ / ПРОДОЛЖИТЬ', ge: 'ჩატვირთვა / გაგრძელება' },
  'menu.creditsAbout':      { en: 'CREDITS / ABOUT',         ru: 'АВТОРЫ / О ПРОЕКТЕ', ge: 'ავტორები / შესახებ' },
  'menu.selectMode':        { en: 'SELECT CAMPAIGN TYPE',    ru: 'ВЫБЕРИТЕ ТИП КАМПАНИИ', ge: 'კამპანიის ტიპის არჩევა' },
  'menu.gameMode':          { en: 'GAME MODE',               ru: 'РЕЖИМ ИГРЫ', ge: 'თამაშის რეჟიმი' },
  'menu.cancel':            { en: 'CANCEL',                  ru: 'ОТМЕНА', ge: 'გაუქმება' },

  // ── NUKE MODAL ─────────────────────────────────────────────────────────────
  'nuke.oneUse':            { en: 'One use per turn',        ru: 'Один пуск за ход', ge: 'ერთი გამოყენება მოლოდინზე' },
  'nuke.abort':             { en: 'ABORT',                   ru: 'ОТМЕНА', ge: 'გაუქმება' },

  // ── SELECTION CARD ─────────────────────────────────────────────────────────
  'card.close':             { en: 'CLOSE',                   ru: 'ЗАКРЫТЬ', ge: 'დახურვა' },

  // ── SPY OPS ────────────────────────────────────────────────────────────────
  'spy.title':              { en: '🕵 SPY OPS',              ru: '🕵 РАЗВЕДКА', ge: '🕵 დაზვერვა' },
  'spy.reveal':             { en: '👁 REVEAL REGION',        ru: '👁 РАЗВЕДАТЬ РЕГИОН', ge: '👁 რეგიონის გამჟღავნება' },
  'spy.sabotage':           { en: '💣 SABOTAGE INDUSTRY',    ru: '💣 ДИВЕРСИЯ НА ЗАВОДАХ', ge: '💣 სამრეწველო დივერსია' },
  'spy.assassinate':        { en: '🗡 ASSASSINATE LEADER (2 charges)', ru: '🗡 ЛИКВИДИРОВАТЬ ЛИДЕРА (2 заряда)', ge: '🗡 ლიდერის ლიკვიდაცია (2 მუხტი)' },
  'spy.close':              { en: 'CLOSE',                   ru: 'ЗАКРЫТЬ', ge: 'დახურვა' },
  'spy.noCharges':          { en: 'No charges remaining',    ru: 'Нет зарядов', ge: 'მუხტები ამოიწურა' },

  // ── WEATHER ────────────────────────────────────────────────────────────────
  'weather.clear':          { en: 'CLEAR',     ru: 'ЯСНО', ge: 'მკაფიო' },
  'weather.rain':           { en: 'RAIN',      ru: 'ДОЖДЬ', ge: 'წვიმა' },
  'weather.storm':          { en: 'STORM',     ru: 'ШТОРМ', ge: 'ქარიშხალი' },
  'weather.snow':           { en: 'BLIZZARD',  ru: 'ПУРГА', ge: 'ბუქი' },
  'weather.heatwave':       { en: 'HEAT',      ru: 'ЖАРА', ge: 'სიცხე' },
  'weather.fog':            { en: 'FOG',       ru: 'ТУМАН', ge: 'ნისლი' },

  // ── GAME LOG MESSAGES ──────────────────────────────────────────────────────
  'log.campaignStart':      { en: 'Campaign started as {faction} — {mode} mode', ru: 'Кампания начата за {faction} — режим {mode}', ge: 'კამპანია დაიწყო {faction}-ად — {mode} რეჟიმი' },
  'log.attackSuccess2':     { en: 'SUCCESS: Operation in {region}',  ru: 'УСПЕХ: Операция в {region}', ge: 'წარმატება: ოპერაცია {region}-ში' },
  'log.attackFailure2':     { en: 'FAILURE: Operation in {region}',  ru: 'ПРОВАЛ: Операция в {region}', ge: 'მარცხი: ოპერაცია {region}-ში' },
  'log.navalRequired':      { en: 'ERROR: Naval units require a coastal region.', ru: 'ОШИБКА: Морские единицы требуют прибрежного региона.', ge: 'შეცდომა: საზღვაო ნაწილებისთვის საჭიროა სანაპირო რეგიონი.' },
  'log.production2':        { en: 'PRODUCTION: {unit} deployed in {region}', ru: 'ПРОИЗВОДСТВО: {unit} развёрнут в {region}', ge: 'წარმოება: {unit} განლაგდა {region}-ში' },
  'log.insufficientInd':    { en: 'ERROR: Insufficient Industry in {region}', ru: 'ОШИБКА: Недостаточно промышленности в {region}', ge: 'შეცდომა: არასაკმარისი მრეწველობა {region}-ში' },
  'log.insufficientRes':    { en: 'ERROR: Insufficient Funds or Supplies', ru: 'ОШИБКА: Недостаточно средств или снабжения', ge: 'შეცდომა: არასაკმარისი სახსრები ან მარაგი' },
  'log.nuclearNoWarheads':  { en: 'NUCLEAR: No warheads in stockpile.', ru: 'ЯДЕРНОЕ: Нет боеголовок на складе.', ge: 'ბირთვული: საწყობი ცარიელია.' },
  'log.nuclearAlreadyUsed': { en: 'NUCLEAR: Launch protocol already executed this turn.', ru: 'ЯДЕРНОЕ: Протокол пуска уже выполнен в этом ходу.', ge: 'ბირთვული: გაშვება უკვე შესრულდა ამ მოლოდინში.' },
  'log.nuclearOwnTerritory':{ en: 'NUCLEAR: Cannot target own territory.', ru: 'ЯДЕРНОЕ: Нельзя атаковать свою территорию.', ge: 'ბირთვული: საკუთარი ტერიტორიის სამიზნედ გამოყენება შეუძლებელია.' },
  'log.nuclearNeutral':     { en: 'NUCLEAR: Cannot strike neutral regions.', ru: 'ЯДЕРНОЕ: Нельзя атаковать нейтральные регионы.', ge: 'ბირთვული: ნეიტრალური რეგიონების დარტყმა შეუძლებელია.' },
  'log.nuclearStrike':      { en: '☢ NUCLEAR STRIKE: {region} obliterated.', ru: '☢ ЯДЕРНЫЙ УДАР: {region} уничтожен.', ge: '☢ ბირთვული დარტყმა: {region} განადგურდა.' },
  'log.strategicLoss':      { en: 'STRATEGIC LOSS: {region} captured by {faction}', ru: 'СТРАТЕГИЧЕСКИЕ ПОТЕРИ: {region} захвачен {faction}', ge: 'სტრატეგიული დანაკარგი: {region} დაიპყრო {faction}-მა' },
  'log.deadHand':           { en: '☠ DEAD HAND: Automated retaliation — ☢ {region} obliterated!', ru: '☠ МЁРТВАЯ РУКА: Автоматический ответный удар — ☢ {region} уничтожен!', ge: '☠ მკვდარი ხელი: ავტომატური საპასუხო დარტყმა — ☢ {region} განადგურდა!' },
  'log.spyNoCharges':       { en: 'SPY: No operative charges remaining.', ru: 'РАЗВЕДКА: Нет зарядов агентов.', ge: 'დაზვერვა: მიმოქცევაში მუხტები არ არის.' },
  'log.spyReveal':          { en: '🕵 SPY REVEAL: {region} and surroundings exposed.', ru: '🕵 РАЗВЕДКА: {region} и окрестности раскрыты.', ge: '🕵 დაზვერვა: {region} გამჟღავნდა.' },
  'log.spySabotage':        { en: '💣 SABOTAGE: Infrastructure destroyed in {region}.', ru: '💣 ДИВЕРСИЯ: Инфраструктура уничтожена в {region}.', ge: '💣 დივერსია: ინფრასტრუქტურა განადგურდა {region}-ში.' },
  'log.spyAssassinate':     { en: '🗡 ASSASSINATION: High-value target eliminated in {faction}.', ru: '🗡 ЛИКВИДАЦИЯ: Важная цель устранена в {faction}.', ge: '🗡 ლიკვიდაცია: სამიზნე მოკლულია {faction}-ში.' },
  'log.researchComplete':   { en: 'RESEARCH COMPLETE: {name}', ru: 'ИССЛЕДОВАНИЕ ЗАВЕРШЕНО: {name}', ge: 'კვლევა დასრულდა: {name}' },
  'log.researchActive':     { en: 'RESEARCH: {name} already active.', ru: 'ИССЛЕДОВАНИЕ: {name} уже активно.', ge: 'კვლევა: {name} უკვე აქტიურია.' },
  'log.researchNoPoints':   { en: 'RESEARCH: Insufficient tech points (need {n}).', ru: 'ИССЛЕДОВАНИЕ: Недостаточно очков (нужно {n}).', ge: 'კვლევა: არასაკმარისი ქულები (საჭიროა {n}).' },
  'log.researchRequires':   { en: 'RESEARCH: Requires {name} first.', ru: 'ИССЛЕДОВАНИЕ: Сначала требуется {name}.', ge: 'კვლევა: ჯერ საჭიროა {name}.' },
  'log.researchBlocked':    { en: 'RESEARCH: Blocked by mutual exclusion.', ru: 'ИССЛЕДОВАНИЕ: Заблокировано взаимным исключением.', ge: 'კვლევა: დაბლოკილია.' },

  // ── CAMPAIGN MODE ──────────────────────────────────────────────────────────
  'campaign.title':         { en: 'CAMPAIGN',                ru: 'КАМПАНИЯ', ge: 'კამპანია' },
  'campaign.missions':      { en: 'MISSIONS',                ru: 'МИССИИ', ge: 'მისიები' },
  'campaign.objective':     { en: 'OBJECTIVE',               ru: 'ЦЕЛЬ', ge: 'ამოცანა' },
  'campaign.complete':      { en: 'COMPLETE',                ru: 'ВЫПОЛНЕНО', ge: 'შესრულებულია' },
  'campaign.failed':        { en: 'FAILED',                  ru: 'ПРОВАЛЕНО', ge: 'ჩაიშალა' },
  'campaign.active':        { en: 'ACTIVE',                  ru: 'АКТИВНО', ge: 'აქტიურია' },
  'campaign.reward':        { en: 'REWARD',                  ru: 'НАГРАДА', ge: 'ჯილდო' },
  'campaign.progress':      { en: 'Progress:',               ru: 'Прогресс:', ge: 'პროგრესი:' },


  // ── FACTION DESCRIPTIONS (from mapData FD) ────────────────────────────────
  'faction.nato.name':    { en: 'NATO Alliance',              ru: 'Альянс НАТО', ge: 'ნატოს ალიანსი' },
  'faction.nato.desc':    { en: 'Technological superiority & economic dominance.', ru: 'Технологическое превосходство и экономическое господство.', ge: 'ტექნოლოგიური უპირატესობა და ეკონომიკური ბატონობა.' },
  'faction.east.name':    { en: 'Eastern Alliance',           ru: 'Восточный Альянс', ge: 'აღმოსავლეთის ალიანსი' },
  'faction.east.desc':    { en: 'Vast Eurasian territory & nuclear arsenal.',      ru: 'Огромная евразийская территория и ядерный арсенал.', ge: 'ვრცელი ევრაზიული ტერიტორია და ბირთვული არსენალი.' },
  'faction.china.name':   { en: 'Pacific Pact',               ru: 'Тихоокеанский Пакт', ge: 'წყნარი ოკეანის პაქტი' },
  'faction.china.desc':   { en: "World's largest army & Pacific dominance.",      ru: 'Крупнейшая армия мира и господство в Тихом океане.' },
  'faction.command':      { en: 'COMMAND',                    ru: 'КОМАНДОВАНИЕ', ge: 'სარდლობა' },

  // ── GAME MODES (full labels + descriptions) ────────────────────────────────
  'mode.campaign.label':  { en: 'CAMPAIGN',   ru: 'КАМПАНИЯ', ge: 'კამპანია' },
  'mode.campaign.sub':    { en: 'Standard WW3 scenario. Control 60% to win.', ru: 'Стандартный сценарий ВМВ. Контроль 60% для победы.', ge: 'სტანდარტული WW3 სცენარი. 60%-ის კონტროლი გამარჯვებისთვის.' },
  'mode.blitz.label':     { en: 'BLITZ',      ru: 'БЛИЦКРИГ', ge: 'ბლიცკრიგი' },
  'mode.blitz.sub':       { en: 'Fast pace. 40% control wins. AI is very aggressive.', ru: 'Быстрый темп. 40% контроль — победа. ИИ очень агрессивен.', ge: 'სწრაფი ტემპი. 40% კონტროლი — გამარჯვება. ხელოვნური ინტელექტი ძალიან აგრესიულია.' },
  'mode.survival.label':  { en: 'SURVIVAL',   ru: 'ВЫЖИВАНИЕ', ge: 'გადარჩენა' },
  'mode.survival.sub':    { en: 'Start with 1 region. Two AI factions already at war.', ru: 'Начало с 1 региона. Два ИИ уже в состоянии войны.', ge: 'დაიწყეთ 1 რეგიონით. ორი ხელოვნური ინტელექტი უკვე ომობს.' },

  // ── STATS ──────────────────────────────────────────────────────────────────
  'stat.atk':             { en: 'ATK',        ru: 'АТК', ge: 'შეტ' },
  'stat.def':             { en: 'DEF',        ru: 'ЗАЩ', ge: 'თავდ' },
  'stat.nukes':           { en: 'NUKES',      ru: 'ЯДЕРКИ', ge: 'ბომბი' },

  // ── BOTTOM NAV ─────────────────────────────────────────────────────────────
  'nav.missions':         { en: 'MISSIONS',   ru: 'МИССИИ', ge: 'მისიები' },

  // ── INTRO SCREEN ───────────────────────────────────────────────────────────
  'intro.title':          { en: 'WORLD WAR III',   ru: 'ТРЕТЬЯ МИРОВАЯ ВОЙНА', ge: 'მსოფლიო ომი III' },
  'intro.subtitle':       { en: 'HOW WE GOT HERE', ru: 'КАК МЫ СЮДА ПРИШЛИ', ge: 'როგორ მივედით აქ' },
  'intro.burnLine':       { en: 'THE WORLD BURNS', ru: 'МИР ГОРИТ', ge: 'სამყარო იწვის' },
  'intro.enter':          { en: 'ENTER COMMAND CENTER', ru: 'ВОЙТИ В ЦЕНТР УПРАВЛЕНИЯ', ge: 'საბრძანებლო ცენტრში შესვლა' },


  // ── IN-GAME MAP SCREEN HUD ─────────────────────────────────────────────────
  'hud.tp':               { en: 'TP',         ru: 'НО', ge: 'ტ.წ' },
  'hud.regionIntel':      { en: 'REGION INTEL', ru: 'РАЗВЕДДАННЫЕ', ge: 'რეგიონის დაზვერვა' },
  'hud.eco':              { en: 'ECO',        ru: 'ЭКО', ge: 'ეკო' },
  'hud.ind':              { en: 'IND',        ru: 'ПРМ', ge: 'სამრ' },
  'hud.stb':              { en: 'STB',        ru: 'СТБ', ge: 'სტბ' },
  'hud.ready':            { en: 'READY',      ru: 'ГОТОВ', ge: 'მზადაა' },
  'hud.locked':           { en: 'LOCKED',     ru: 'ЗАПЕРТ', ge: 'დაბლოკილია' },

  // ── BOTTOM NAV TABS ────────────────────────────────────────────────────────
  'nav.map':              { en: 'MAP',        ru: 'КАРТА', ge: 'რუკა' },
  'nav.deploy':           { en: 'DEPLOY',     ru: 'РАЗВЁРН', ge: 'განლ.' },
  'nav.research':         { en: 'RESEARCH',   ru: 'НАУКА', ge: 'კვლევა' },
  'nav.alliance':         { en: 'ALLIANCE',   ru: 'АЛЬЯНС', ge: 'ალიანსი' },
  'nav.endTurn':          { en: 'END TURN',   ru: 'КОНЕЦ ХОДА', ge: 'მოლოდინის დასასრული' },

  // ── UNIT LABELS ────────────────────────────────────────────────────────────
  'unit.infantry':        { en: '⚔ INF',     ru: '⚔ ПЕХ', ge: '⚔ ქვ.ლ' },
  'unit.armor':           { en: '🛡 ARM',     ru: '🛡 БРН', ge: '🛡 ჯვ.ტ' },
  'unit.air':             { en: '✈ AIR',      ru: '✈ АВИ', ge: '✈ ავ' },
  'unit.destroyer':       { en: '⚓ DST',     ru: '⚓ ЭСМ', ge: '⚓ ესმ' },
  'unit.submarine':       { en: '🌊 SUB',     ru: '🌊 ПЛД', ge: '🌊 წყლ' },
  'unit.carrier':         { en: '🚢 CVN',     ru: '🚢 АВН', ge: '🚢 ავმ' },

  // ── SPECIAL ACTIONS ────────────────────────────────────────────────────────
  'action.nuke':          { en: 'NUKE',       ru: 'ЯДЕРНЫЙ', ge: 'ბირთვ.' },
  'action.orbital':       { en: 'ORBITAL',    ru: 'ОРБИТ.', ge: 'ორბიტ.' },
  'action.blackout':      { en: 'BLACKOUT',   ru: 'ЗАТМЕНИЕ', ge: 'ბლოკ.' },
  'action.attack':        { en: 'ATTACK',     ru: 'АТАКА', ge: 'შეტევა' },

  // ── GAME OVER TITLES ───────────────────────────────────────────────────────
  'gameover.title.military':  { en: 'MILITARY DEFEAT',   ru: 'ВОЕННОЕ ПОРАЖЕНИЕ', ge: 'სამხედრო მარცხი' },
  'gameover.title.collapse':  { en: 'STATE COLLAPSE',    ru: 'КОЛЛАПС ГОСУДАРСТВА', ge: 'სახელმწიფოს კოლაფსი' },
  'gameover.title.nuclear':   { en: 'NUCLEAR ANNIHILATION', ru: 'ЯДЕРНОЕ УНИЧТОЖЕНИЕ', ge: 'ბირთვული განადგურება' },
  'gameover.title.victory':   { en: 'TOTAL VICTORY',     ru: 'ПОЛНАЯ ПОБЕДА', ge: 'სრული გამარჯვება' },
  'gameover.default':         { en: 'GAME OVER',         ru: 'ИГРА ОКОНЧЕНА', ge: 'თამაში დასრულდა' },

  'gameover.mainMenu':    { en: 'MAIN MENU',                ru: 'ГЛАВНОЕ МЕНЮ', ge: 'მთავარი მენიუ' },
  'gameover.newCampaign': { en: 'NEW CAMPAIGN',             ru: 'НОВАЯ КАМПАНИЯ', ge: 'ახალი კამპანია' },

  // ── NUCLEAR MODAL ──────────────────────────────────────────────────────────
  'nuke.title':           { en: '☢ NUCLEAR LAUNCH',         ru: '☢ ЯДЕРНЫЙ ПУСК', ge: '☢ ბირთვული გაშვება' },
  'nuke.confirm':         { en: 'CONFIRM LAUNCH',           ru: 'ПОДТВЕРДИТЬ ПУСК', ge: 'გაშვების დადასტურება' },
  'nuke.cancel':          { en: 'ABORT',                    ru: 'ОТМЕНА', ge: 'გაუქმება' },
  'nuke.stockpile':       { en: 'Warheads remaining:',      ru: 'Боеголовок осталось:', ge: 'დარჩენილი თავდასხმები:' },

  // ── NEW FACTIONS (Phase 8) ─────────────────────────────────────────────────
  'faction.india.name':   { en: 'South Asian Bloc',          ru: 'Южноазиатский блок', ge: 'სამხრეთ აზიის ბლოკი' },
  'faction.india.desc':   { en: 'Rising superpower with nuclear arsenal and massive population.', ru: 'Растущая сверхдержава с ядерным арсеналом и огромным населением.', ge: 'მზარდი სუპერსახელმწიფო ბირთვული არსენალით.' },
  'faction.latam.name':   { en: 'Latin League',              ru: 'Латинская лига', ge: 'ლათინური ლიგა' },
  'faction.latam.desc':   { en: 'Resource-rich coalition uniting South America, Central America and Caribbean.', ru: 'Богатая ресурсами коалиция, объединяющая Южную и Центральную Америку.', ge: 'რესურსებით მდიდარი კოალიცია. პარტიზანული დოქტრინა.' },

  // ── LEADERBOARD & ACHIEVEMENTS ────────────────────────────────────────────
  'lb.title':             { en: 'ACHIEVEMENTS & LEADERBOARD', ru: 'ДОСТИЖЕНИЯ И РЕЙТИНГ', ge: 'მიღწევები და რეიტინგი' },
  'lb.unlocked':          { en: 'unlocked',                  ru: 'разблокировано', ge: 'განბლოკილია' },
  'lb.tab.rank':          { en: 'LEADERBOARD',               ru: 'РЕЙТИНГ', ge: 'რეიტინგი' },
  'lb.tab.ach':           { en: 'ACHIEVEMENTS',              ru: 'ДОСТИЖЕНИЯ', ge: 'მიღწევები' },
  'lb.empty':             { en: 'No runs recorded yet. Finish a game to appear here.', ru: 'Нет записей. Завершите игру, чтобы войти в рейтинг.', ge: 'ჩანაწერები არ არის. დაასრულეთ თამაში რეიტინგში გამოსავლენად.' },
  'lb.noRuns':            { en: 'No runs yet',               ru: 'Нет игр', ge: 'გათამაშებები არ არის' },
  'lb.score':             { en: 'SCORE',                     ru: 'ОЧКИ', ge: 'ქულა' },
  'lb.turns':             { en: 'Turns',                     ru: 'Ходов', ge: 'მოლოდინი' },
  'lb.regions':           { en: 'Regions',                   ru: 'Регионов', ge: 'რეგიონები' },
  'lb.reason.victory':    { en: 'VICTORY',                   ru: 'ПОБЕДА', ge: 'გამარჯვება' },
  'lb.reason.military':   { en: 'DEFEAT',                    ru: 'ПОРАЖЕНИЕ', ge: 'მარცხი' },
  'lb.reason.collapse':   { en: 'COLLAPSE',                  ru: 'КОЛЛАПС', ge: 'კოლაფსი' },
  'lb.reason.nuclear':    { en: 'ANNIHILATED',               ru: 'УНИЧТОЖЕН', ge: 'განადგურდა' },
  'lb.cat.all':           { en: 'ALL',                       ru: 'ВСЕ', ge: 'ყველა' },
  'lb.cat.conquest':      { en: 'Conquest',                  ru: 'Завоевание', ge: 'დაპყრობა' },
  'lb.cat.economy':       { en: 'Economy',                   ru: 'Экономика', ge: 'ეკონომიკა' },
  'lb.cat.spy':           { en: 'Intelligence',              ru: 'Разведка', ge: 'დაზვერვა' },
  'lb.cat.survival':      { en: 'Survival',                  ru: 'Выживание', ge: 'გადარჩენა' },
  'lb.cat.nuclear':       { en: 'Nuclear',                   ru: 'Ядерное', ge: 'ბირთვული' },
  'lb.cat.campaign':      { en: 'Campaign',                  ru: 'Кампания', ge: 'კამპანია' },
  'lb.ach.unlockedTurn':  { en: 'Turn',                      ru: 'Ход', ge: 'მოლოდინი' },
  'lb.ach.unlocked':      { en: 'ACHIEVEMENT UNLOCKED',      ru: 'ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО', ge: 'მიღწევა განბლოკილია' },

  // ── TRADE PANEL ───────────────────────────────────────────────────────────
  'trade.title':          { en: 'DIPLOMACY & ECONOMY',       ru: 'ДИПЛОМАТИЯ И ЭКОНОМИКА', ge: 'დიპლომატია და ეკონომიკა' },
  'trade.tab.trade':      { en: '📦 TRADE',                  ru: '📦 ТОРГОВЛЯ', ge: '📦 ვაჭრობა' },
  'trade.tab.sanctions':  { en: '🚫 SANCTIONS',              ru: '🚫 САНКЦИИ', ge: '🚫 სანქციები' },
  'trade.tab.blockade':   { en: '⚓ BLOCKADE',               ru: '⚓ БЛОКАДА', ge: '⚓ ბლოკადა' },
  'trade.activeRoutes':   { en: 'ACTIVE ROUTES',             ru: 'АКТИВНЫЕ МАРШРУТЫ', ge: 'აქტიური მარშრუტები' },
  'trade.newDeal':        { en: 'NEW DEAL',                  ru: 'НОВАЯ СДЕЛКА', ge: 'ახალი გარიგება' },
  'trade.partner':        { en: 'Trade Partner',             ru: 'Торговый партнёр', ge: 'სავაჭრო პარტნიორი' },
  'trade.youOffer':       { en: 'You Offer',                 ru: 'Вы предлагаете', ge: 'თქვენ გთავაზობთ' },
  'trade.youRequest':     { en: 'You Request',               ru: 'Вы запрашиваете', ge: 'თქვენ ითხოვთ' },
  'trade.establish':      { en: '📦 ESTABLISH ROUTE',        ru: '📦 УСТАНОВИТЬ МАРШРУТ', ge: '📦 მარშრუტის დამყარება' },
  'trade.turnsLeft':      { en: 'turns left',                ru: 'ходов осталось', ge: 'მოლოდინი დარჩა' },
  'trade.selectFaction':  { en: 'Select a target faction',   ru: 'Выберите фракцию', ge: 'სამიზნე ფრაქციის არჩევა' },
  'trade.established':    { en: '✓ Trade route established', ru: '✓ Торговый путь установлен', ge: '✓ სავაჭრო მარშრუტი დამყარდა' },
  'trade.sanctions.title': { en: 'ECONOMIC SANCTIONS',       ru: 'ЭКОНОМИЧЕСКИЕ САНКЦИИ', ge: 'ეკონომიკური სანქციები' },
  'trade.sanctions.desc': { en: "Freeze 8% of a faction's funds each turn for 5 turns. Cost: 400 funds.", ru: 'Заморозьте 8% средств цели каждый ход на 5 ходов. Стоимость: 400 средств.' },
  'trade.sanctions.active': { en: 'turns remaining',         ru: 'ходов осталось', ge: 'მოლოდინი დარჩა' },
  'trade.sanctions.none': { en: 'Not sanctioned',            ru: 'Не под санкциями', ge: 'სანქციები არ გამოიყენება' },
  'trade.sanctions.impose': { en: 'IMPOSE',                  ru: 'ВВЕСТИ', ge: 'გამოყენება' },
  'trade.sanctions.imposed': { en: '✓ Sanctions imposed',   ru: '✓ Санкции введены', ge: '✓ სანქციები გამოყენებულია' },
  'trade.blockade.title': { en: 'NAVAL BLOCKADE',            ru: 'МОРСКАЯ БЛОКАДА', ge: 'საზღვაო ბლოკადა' },
  'trade.blockade.desc':  { en: 'Blockade the selected region: -30 oil/turn for 4 turns. Cost: 300 funds.', ru: 'Блокируйте выбранный регион: -30 нефти в ход на 4 хода. Стоимость: 300 средств.', ge: 'შერჩეული რეგიონის ბლოკადა: -30 ნავთობი/მოლოდინი 4 მოლოდინი. ღირებულება: 300.' },
  'trade.blockade.selected': { en: 'Selected Region',        ru: 'Выбранный регион', ge: 'შერჩეული რეგიონი' },
  'trade.blockade.hint':  { en: '← Select an enemy region on the map', ru: '← Выберите вражеский регион на карте', ge: '← რუკაზე მტრის რეგიონის არჩევა' },
  'trade.blockade.impose': { en: '⚓ IMPOSE BLOCKADE',       ru: '⚓ ВВЕСТИ БЛОКАДУ', ge: '⚓ ბლოკადის გამოყენება' },
  'trade.blockade.imposed': { en: '✓ Blockade imposed',      ru: '✓ Блокада введена', ge: '✓ ბლოკადა გამოყენებულია' },
  'trade.blockade.active': { en: 'ACTIVE BLOCKADES',         ru: 'АКТИВНЫЕ БЛОКАДЫ', ge: 'აქტიური ბლოკადები' },
  'trade.blockade.selectFirst': { en: 'Select a region on the map first', ru: 'Сначала выберите регион на карте', ge: 'ჯერ რუკაზე რეგიონის არჩევა' },
  'trade.faction':        { en: 'Faction',                   ru: 'Фракция', ge: 'ფრაქცია' },
  'trade.res.funds':      { en: 'Funds',                     ru: 'Средства', ge: 'სახსრები' },
  'trade.res.oil':        { en: 'Oil',                       ru: 'Нефть', ge: 'ნავთობი' },
  'trade.res.supplies':   { en: 'Supplies',                  ru: 'Снабж.', ge: 'მარაგი' },
  'trade.res.techPoints': { en: 'Tech Pts',                  ru: 'Наука', ge: 'ტექ. ქულ.' },

  // ── BOTTOM NAV NEW BUTTONS ────────────────────────────────────────────────
  'nav.stats':            { en: 'STATS',                     ru: 'СТАТ', ge: 'სტატ.' },
  'nav.rank':             { en: 'RANK',                      ru: 'РЕЙТ', ge: 'რეიტ.' },
  'nav.trade':            { en: 'TRADE',                     ru: 'ТОРГ', ge: 'ვაჭ.' },

  // ── DIPLOMACY PANEL (Phase 8 missing) ─────────────────────────────────────
  'diplomacy.tradeDesc':    { en: 'Bypass embargoes. Pay a premium for immediate material reserves.', ru: 'Обойти эмбарго. Заплатить премию за немедленные резервы.', ge: 'ემბარგოს გვერდის ავლით. გადაიხადეთ პრემია სახსრებისთვის.' },
  'diplomacy.tradeCost':    { en: 'COST: $200',           ru: 'СТОИМОСТЬ: $200', ge: 'ღირებულება: $200' },
  'diplomacy.tradeGain':    { en: 'GAIN: 50 OIL / 100 SUP', ru: 'ПОЛУЧИТЬ: 50 НЕФ / 100 СНБ', ge: 'მოიგეთ: 50 ნავთობი / 100 მარაგი' },
  'diplomacy.sanctionDesc': { en: 'Launch SWIFT/cyber attacks to vaporize enemy funds and cripple morale.', ru: 'SWIFT/кибератаки для уничтожения фондов врага и подрыва морали.', ge: 'SWIFT/კიბერ შეტევები მტრის სახსრების განადგურებისთვის.' },
  'diplomacy.sanctionCost': { en: 'COST: $500',           ru: 'СТОИМОСТЬ: $500', ge: 'ღირებულება: $500' },
  'diplomacy.sanctionEffect':{ en: 'TARGET: -15 STAB / -$400', ru: 'ЦЕЛЬ: -15 СТБ / -$400', ge: 'სამიზნე: -15 სტბ / -$400' },

  // ── INTRO SCREEN ───────────────────────────────────────────────────────────
  'intro.youAreOne':        { en: 'You are one of them.', ru: 'Вы один из них.', ge: 'თქვენ მათ შორის ერთ-ერთი ხართ.' },

  // ── CAMPAIGN (missing) ────────────────────────────────────────────────────
  'campaign.missionComplete': { en: 'MISSION COMPLETE',   ru: 'МИССИЯ ВЫПОЛНЕНА', ge: 'მისია შესრულდა' },

  // ── HUD (missing) ─────────────────────────────────────────────────────────
  'hud.processing':         { en: 'PROCESSING...',        ru: 'ОБРАБОТКА...', ge: 'დამუშავება...' },
  'intel.detected':         { en: 'detected',             ru: 'обнаружено', ge: 'აღმოჩენილია' },
  'intel.tapRegion':        { en: 'Tap a region\nto view intel', ru: 'Нажмите на регион\nдля разведданных', ge: 'შეეხეთ რეგიონს\nდაზვერვისთვის' },

  // ── FACTION NAMES (new factions for display) ──────────────────────────────
  'faction.india.name':     { en: 'South Asian Bloc',     ru: 'Южноазиатский блок', ge: 'სამხრეთ აზიის ბლოკი' },
  'faction.india.desc':     { en: 'Rising superpower with nuclear arsenal and massive population. Strong defense.', ru: 'Растущая сверхдержава с ядерным арсеналом и огромным населением. Сильная оборона.', ge: 'მზარდი სუპერსახელმწიფო ბირთვული არსენალით.' },
  'faction.latam.name':     { en: 'Latin League',         ru: 'Латинская лига', ge: 'ლათინური ლიგა' },
  'faction.latam.desc':     { en: 'Resource-rich coalition. Controls critical raw materials, guerrilla doctrine.', ru: 'Богатая ресурсами коалиция. Контролирует сырьё, доктрина партизанской войны.', ge: 'რესურსებით მდიდარი კოალიცია. პარტიზანული დოქტრინა.' },
  'faction.nato.name':      { en: 'NATO Alliance',        ru: 'Альянс НАТО', ge: 'ნატოს ალიანსი' },
  'faction.nato.desc':      { en: 'Technological superiority & economic dominance. Best attack, strong economy.', ru: 'Технологическое превосходство и экономическое господство. Лучшая атака, сильная экономика.', ge: 'ტექნოლოგიური უპირატესობა და ეკონომიკური ბატონობა.' },
  'faction.east.name':      { en: 'Eastern Alliance',     ru: 'Восточный альянс', ge: 'აღმოსავლეთის ალიანსი' },
  'faction.east.desc':      { en: 'Vast Eurasian territory & nuclear arsenal. Best defense, most nukes.', ru: 'Огромная евразийская территория и ядерный арсенал. Лучшая оборона, больше всего ракет.', ge: 'ვრცელი ევრაზიული ტერიტორია და ბირთვული არსენალი.' },
  'faction.china.name':     { en: 'Pacific Pact',         ru: 'Тихоокеанский пакт', ge: 'წყნარი ოკეანის პაქტი' },
  'faction.china.desc':     { en: "World's largest army & Pacific dominance. Balanced stats, large starts.", ru: 'Крупнейшая армия мира и господство в Тихом океане. Сбалансированные характеристики.' },

  // ── CONFIRM DIALOGS ────────────────────────────────────────────────────────
  'confirm.attack.detail':  { en: 'Launch military assault on {region}. Victory is not guaranteed.', ru: 'Начать военную атаку на {region}. Победа не гарантирована.', ge: 'სამხედრო შეტევის გახსნა {region}-ზე. გამარჯვება გარანტირებული არ არის.' },
  'confirm.orbital.detail': { en: 'Fire orbital kinetic strike at {region}. Destroys 50% of enemy forces. One use remaining.', ru: 'Нанести орбитальный удар по {region}. Уничтожает 50% сил противника. Остался один заряд.', ge: 'ორბიტალური დარტყმა {region}-ზე. ანადგურებს მტრის ძალების 50%-ს. ერთი გამოყენება დარჩა.' },
  'confirm.blackout.detail':{ en: 'Deploy E-WAR blackout in {region}. Disrupts enemy intel for 3 turns. One charge expended.', ru: 'Развернуть ЭВ-блэкаут в {region}. Нарушает разведку противника на 3 хода. Один заряд израсходован.', ge: 'ელ-ომის ბლოკადა {region}-ში. 3 მოლოდინს ანგრევს მტრის დაზვერვას. ერთი მუხტი იხარჯება.' },

  // ── UNDO SYSTEM ────────────────────────────────────────────────────────────
  'undo.action':  { en: 'UNDO',        ru: 'ОТМЕНИТЬ',         ge: 'გაუქმება' },
  'undo.label':   { en: 'Last action', ru: 'Последнее дейст.',  ge: 'ბოლო მოქმედება' },
  'undo.attack':  { en: 'Attack',      ru: 'Атака',             ge: 'შეტევა' },
  'undo.build':   { en: 'Deployment',  ru: 'Развёртывание',     ge: 'განლაგება' },

  // ── TOOLTIPS ───────────────────────────────────────────────────────────────
  'tooltip.oil':       { en: 'Oil - Used to build and move units. Runs low in long wars.', ru: 'Нефть - для строительства войск. Заканчивается в долгих войнах.', ge: 'ნავთობი - სამხედრო ნაწილების მშენებლობისა და გადაადგილებისთვის.' },
  'tooltip.steel':     { en: 'Supplies - Military logistics and unit maintenance.', ru: 'Припасы - логистика и обслуживание войск.', ge: 'მარაგი - სამხედრო ლოგისტიკა.' },
  'tooltip.funds':     { en: 'Funds - Your treasury. Needed for every operation and research.', ru: 'Средства - казна. Нужны для операций и исследований.', ge: 'სახსრები - სახაზინო. ყველა ოპერაციისთვის.' },
  'tooltip.stability': { en: 'Stability - Internal cohesion. Hits 0 = collapse and defeat.', ru: 'Стабильность - сплочённость. 0 = крах.', ge: 'სტაბილურობა - 0-ზე ჩამოსვლა ნიშნავს კოლაფსს.' },

  // ── TUTORIAL ───────────────────────────────────────────────────────────────
  'tut.skip':   { en: 'SKIP',           ru: 'ПРОПУСТИТЬ', ge: 'გამოტოვება' },
  'tut.next':   { en: 'NEXT',           ru: 'ДАЛЕЕ',       ge: 'შემდეგი' },
  'tut.prev':   { en: 'BACK',           ru: 'НАЗАД',       ge: 'უკან' },
  'tut.finish': { en: 'ENTER BATTLE',   ru: 'В БОЙ',       ge: 'ბრძოლაში' },

  'tut.welcome.title': { en: 'WELCOME, COMMANDER', ru: 'ДОБРО ПОЖАЛОВАТЬ, КОМАНДИР', ge: 'კეთილი იყოს, მეთაური' },
  'tut.welcome.body':  { en: 'World War III has begun. You command one of five global superpowers. Conquer territory, manage your economy, research weapons, and survive the escalation to nuclear war. This briefing will prepare you for command.', ru: 'Третья Мировая война началась. Вы командуете одной из пяти мировых держав. Этот инструктаж подготовит вас к командованию.', ge: 'მსოფლიო ომი III დაიწყო. თქვენ ხელმძღვანელობთ ხუთი გლობალური სუპერსახელმწიფოდან ერთ-ერთს. ეს ინსტრუქტაჟი მოამზადებს თქვენ სარდლობისთვის.' },

  'tut.map.title': { en: 'THE WORLD MAP', ru: 'КАРТА МИРА', ge: 'მსოფლიოს რუკა' },
  'tut.map.body':  { en: 'The map shows 46 territories across all continents, color-coded by faction. Pinch to zoom, drag to pan, tap a territory to select it.', ru: 'Карта показывает 46 территорий. Щипок — зум, перетаскивание — прокрутка, нажатие — выбор.', ge: 'რუკა გვიჩვენებს 46 ტერიტორიას. ორი თითით — ზუმი, გადათრევა — გადაადგილება, შეხება — არჩევა.' },

  'tut.resources.title': { en: 'YOUR RESOURCES', ru: 'ВАШИ РЕСУРСЫ', ge: 'თქვენი რესურსები' },
  'tut.resources.body':  { en: 'Four resources power your war machine: Oil (build units), Supplies (logistics), Funds (everything), Stability (if it hits 0, you collapse). Hold any resource icon for a detailed tooltip.', ru: 'Четыре ресурса: Нефть, Припасы, Средства, Стабильность. Если стабильность упадёт до 0 — крах. Удерживайте иконку для подсказки.', ge: 'ოთხი რესურსი: ნავთობი, მარაგი, სახსრები, სტაბილურობა. სტაბილურობა 0-ზე = კოლაფსი. დიდხანს შეეხეთ ნებისმიერ ხატულას.' },

  'tut.select.title': { en: 'SELECTING TERRITORIES', ru: 'ВЫБОР ТЕРРИТОРИЙ', ge: 'ტერიტორიების არჩევა' },
  'tut.select.body':  { en: 'Tap any territory to select it and view its stats. Select YOUR territory to highlight attackable neighbors in red. Strategic territories (gold ring) are worth securing first.', ru: 'Нажмите территорию для выбора. Выберите СВОЮ — вражеские соседи выделятся красным. Стратегические (золотое кольцо) захватывайте первыми.', ge: 'შეეხეთ ტერიტორიას მის ასარჩევად. თქვენი ტერიტორიის არჩევისას მტრის მეზობლები წითლად გამოჩნდება.' },

  'tut.attack.title': { en: 'ATTACKING', ru: 'АТАКА', ge: 'შეტევა' },
  'tut.attack.body':  { en: 'Select your territory, then tap a red enemy neighbor. Press ATTACK in the action card. A confirm dialog appears before every attack — no accidental moves. Combat is resolved by unit strength, tech, and weather.', ru: 'Выберите свою территорию, затем красного врага. Нажмите АТАКА. Диалог подтверждения защищает от случайных ходов.', ge: 'აირჩიეთ თქვენი ტერიტორია, შემდეგ წითელი მტრის. ყოველ შეტევამდე გამოჩნდება დადასტურების დიალოგი.' },

  'tut.deploy.title': { en: 'DEPLOYING UNITS', ru: 'РАЗВЁРТЫВАНИЕ ВОЙСК', ge: 'ნაწილების განლაგება' },
  'tut.deploy.body':  { en: 'Tap DEPLOY in the bottom nav. Select an owned region, then build: Infantry (cheap), Armor (strong, costs oil), Air (powerful, costs supplies), Naval (coastal only). Costs funds, oil, and supplies.', ru: 'Нажмите РАЗВЕРНУТЬ внизу. Выберите регион и стройте: Пехоту, Броню, Авиацию или Флот (прибрежные).', ge: 'განლ. — ნაწილების პანელი. ქვეითი, ჯავშანი, ავიაცია, საზღვაო (სანაპიროზე). ყველა სახსრებს, ნავთობს, მარაგს მოიხმარს.' },

  'tut.research.title': { en: 'RESEARCH & TECHNOLOGY', ru: 'ИССЛЕДОВАНИЯ И ТЕХНОЛОГИИ', ge: 'კვლევა და ტექნოლოგია' },
  'tut.research.body':  { en: 'Tech Points (TP) accumulate each turn. Spend them in RESEARCH to unlock military upgrades, economic bonuses, spy tools, and nuclear weapons. Some techs are mutually exclusive — choose your doctrine.', ru: 'Техноочки накапливаются. Трать на ИССЛЕДОВАНИЯ: военные, экономические, разведка, ядерное оружие. Некоторые взаимоисключают друг друга.', ge: 'TP ყოველ მოლოდინში გროვდება. კვლ. ჩანართი — სამხედრო, ეკონომიკური, სადაზვერვო, ბირთვული ტექნოლოგიები.' },

  'tut.endturn.title': { en: 'ENDING YOUR TURN', ru: 'ЗАВЕРШЕНИЕ ХОДА', ge: 'მოლოდინის დასასრული' },
  'tut.endturn.body':  { en: 'Press END TURN when done. All AI factions act simultaneously. Each turn resources are collected, events may fire, and stability shifts. Use UNDO (bottom bar) to reverse your last action before ending the turn.', ru: 'Нажмите КОНЕЦ ХОДА. ИИ ходят одновременно. Используйте ОТМЕНИТЬ для отмены последнего действия до конца хода.', ge: 'მოლ. (END TURN) — დაასრულეთ სვლა. ყველა ხელოვნური ინტელექტი ერთდროულად მოქმედებს. ᲒᲐᲣᲥᲛᲔᲑᲐ გასაუქმებელია ბოლო ქმედება.' },

  'tut.stability.title': { en: 'STABILITY & COLLAPSE', ru: 'СТАБИЛЬНОСТЬ И КОЛЛАПС', ge: 'სტაბილურობა და კოლაფსი' },
  'tut.stability.body':  { en: 'Stability drops when you lose territories, suffer bad events, run low on resources, or get sabotaged. If it reaches 0, your government collapses — instant defeat. Keep it above 40% at all times.', ru: 'Стабильность падает от потери территорий, плохих событий и диверсий. 0 = крах. Держите выше 40%.', ge: 'სტაბილურობა ეცემა ტერიტორიების დაკარგვით, ცუდი მოვლენებით. 0 = კოლაფსი. ყოველთვის 40%-ზე მაღლა.' },

  'tut.nukes.title': { en: 'NUCLEAR DOCTRINE', ru: 'ЯДЕРНАЯ ДОКТРИНА', ge: 'ბირთვული დოქტრინა' },
  'tut.nukes.body':  { en: 'In Act III, nukes become available to all. Each launch destroys a region and reduces ALL factions stability by 8. Can only fire once per turn. Research Dead Hand for automatic retaliation.', ru: 'В Акте III ядерное оружие у всех. Удар уничтожает регион и снижает стабильность всех на 8. Один раз в ход.', ge: 'აქტი III-დან ბირთვული ყველასთვის. ყოველი გაშვება ყველა ფრაქციის სტაბილურობას -8-ით ამცირებს.' },

  'tut.done.title': { en: 'BRIEFING COMPLETE', ru: 'ИНСТРУКТАЖ ЗАВЕРШЁН', ge: 'ინსტრუქტაჟი დასრულდა' },
  'tut.done.body':  { en: 'You are ready, Commander. Expand early, balance economy with military, research before Act III, keep stability above 40%, and remember — diplomacy can win wars without a shot. Good luck.', ru: 'Вы готовы, Командир. Расширяйтесь, балансируйте экономику с армией, исследуйте до Акта III. Удачи.', ge: 'მზად ხართ, მეთაური. ადრე გაფართოვდით, შეაბალანსეთ ეკონომიკა სამხედრო ძალასთან. გამარჯვება გისურვებთ.' },

};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useTranslation() — returns a t(key, vars?) function.
 * vars is an object of {placeholder: value} pairs.
 * Example: t('log.turnCompleted', { n: 5 }) → "Turn 5 completed."
 */
// Shared language ref — written by the store, read by components.
// This breaks the circular dependency: i18n no longer imports the store.
export const langRef = { current: 'en' };
const _langListeners = new Set();
export function _setLang(lang) {
  langRef.current = lang || 'en';
  _langListeners.forEach(fn => fn(langRef.current));
}

export function useTranslation() {
  const [lang, setLang] = React.useState(langRef.current);
  React.useEffect(() => {
    setLang(langRef.current);
    _langListeners.add(setLang);
    return () => _langListeners.delete(setLang);
  }, []);
  const t = useCallback((key, vars = {}) => {
    try {
      const entry = TRANSLATIONS[key];
      if (!entry) return key;
      let str = entry[lang] || entry['en'] || key;
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\{${k}\}`, 'g'), v);
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
