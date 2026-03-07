import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions, Animated, Modal
} from 'react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';

const { width, height } = Dimensions.get('window');

const SCAN_COUNT = 12;

const CreditsScreen = ({ onClose }) => {
    const t    = useTranslation();
    const lang = useGameStore(s => s.settings?.language || 'en');
    const ru   = lang === 'ru';
    const ge   = lang === 'ge';

    const fadeAnim    = useRef(new Animated.Value(0)).current;
    const scanAnim    = useRef(new Animated.Value(0)).current;
    const glowAnim    = useRef(new Animated.Value(0)).current;
    const [tab, setTab] = useState('credits'); // 'credits' | 'about'

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        // Scanline loop
        Animated.loop(
            Animated.timing(scanAnim, { toValue: 1, duration: 3500, useNativeDriver: true })
        ).start();
        // Glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
            ])
        ).start();
        return () => {
            fadeAnim.stopAnimation();
            scanAnim.stopAnimation();
            glowAnim.stopAnimation();
        };
    }, []);

    const scanlineY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, height] });
    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.0] });

    return (
        <Modal visible={true} animationType="none" transparent={false} onRequestClose={onClose} statusBarTranslucent>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            {/* Scanline effect */}
            <Animated.View style={[styles.scanline, { transform: [{ translateY: scanlineY }] }]} pointerEvents="none" />

            <View style={styles.panel}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Animated.Text style={[styles.headerStudio, { opacity: glowOpacity }]}>
                            SOFTCURSE STUDIO
                        </Animated.Text>
                        <Text style={styles.headerTitle}>
                            {ru ? 'МИРОВАЯ ВОЙНА III: ГЛОБАЛЬНЫЙ КОЛЛАПС' : 'WORLD WAR III: GLOBAL COLLAPSE'}
                        </Text>
                        <Text style={styles.headerVersion}>v3.1.0 // NIGHTMARE ENGINE</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab bar */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'credits' && styles.tabActive]}
                        onPress={() => setTab('credits')}
                    >
                        <Text style={[styles.tabText, tab === 'credits' && styles.tabTextActive]}>
                            {ru ? '👤 АВТОРЫ' : ge ? '👤 ავტორები' : '👤 CREDITS'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'about' && styles.tabActive]}
                        onPress={() => setTab('about')}
                    >
                        <Text style={[styles.tabText, tab === 'about' && styles.tabTextActive]}>
                            {ru ? '📖 ОБ ИГРЕ' : ge ? '📖 შესახებ' : '📖 ABOUT'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* ── CREDITS TAB ── */}
                    {tab === 'credits' && (
                        <View style={styles.creditsContainer}>

                            {/* Studio logo block */}
                            <View style={styles.studioBlock}>
                                <Animated.Text style={[styles.studioGlyph, { opacity: glowOpacity }]}>⬡</Animated.Text>
                                <Text style={styles.studioName}>SOFTCURSE STUDIO</Text>
                                <Text style={styles.studioTagline}>
                                    {ru ? 'НЕЗАВИСИМАЯ СТУДИЯ РАЗРАБОТКИ ИГР' : ge ? 'დამოუკიდებელი სათამაშო სტუდია' : 'INDEPENDENT GAME DEVELOPMENT STUDIO'}
                                </Text>
                                <View style={styles.studioDivider} />
                            </View>

                            {/* Solo developer */}
                            <View style={styles.devBlock}>
                                <View style={styles.devBadge}>
                                    <Text style={styles.devBadgeText}>
                                        {ru ? 'РАЗРАБОТЧИК' : 'DEVELOPER'}
                                    </Text>
                                </View>
                                <Text style={styles.devName}>Dante Berezinsky</Text>
                                <Text style={styles.devTitle}>
                                    {ru
                                        ? 'Основатель & Создатель Softcurse Studio'
                                        : ge ? 'Softcurse Studio-ს დამფუძნებელი & შემქმნელი'
                                        : 'Founder & Creator of Softcurse Studio'}
                                </Text>
                                <View style={styles.devRoles}>
                                    {[
                                        ru ? 'Разработка игры'       : ge ? 'თამაშის განვითარება'     : 'Game Development',
                                        ru ? 'Игровой дизайн'       : ge ? 'თამაშის დიზაინი'        : 'Game Design',
                                        ru ? 'Системы ИИ'           : ge ? 'ხელოვნური ინტელექტი'   : 'AI Systems',
                                        ru ? 'UI/UX Дизайн'         : ge ? 'UI/UX დიზაინი'          : 'UI/UX Design',
                                        ru ? 'Стратегические системы': ge ? 'სტრატეგიული სისტემები' : 'Strategy Systems',
                                        ru ? 'Нарративный дизайн'   : ge ? 'ნარატიული დიზაინი'      : 'Narrative Design',
                                        ru ? 'Оптимизация движка'   : ge ? 'ძრავის ოპტიმიზაცია'    : 'Engine Optimization',
                                        ru ? 'Интернационализация'  : ge ? 'ლოკალიზაცია (EN/RU/GE)': 'Localization (EN/RU/GE)',
                                    ].map((role, i) => (
                                        <View key={i} style={styles.roleChip}>
                                            <Text style={styles.roleChipText}>{role}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.soloNote}>
                                    <Text style={styles.soloNoteText}>
                                        {ru
                                            ? '★ Эта игра полностью создана одним человеком —\nот кода до дизайна, от механик до нарратива.'
                                            : ge ? '★ ეს თამაში მთლიანად ერთმა ადამიანმა შექმნა —\nკოდიდან დიზაინამდე, მექანიკიდან ნარატივამდე.'
                                            : '★ This game was built entirely by one person —\nfrom code to design, mechanics to narrative.'}
                                    </Text>
                                </View>
                            </View>

                            {/* Tech credits */}
                            <View style={styles.techBlock}>
                                <Text style={styles.sectionLabel}>
                                    {ru ? 'ТЕХНОЛОГИИ' : ge ? 'ტექნოლოგიები' : 'BUILT WITH'}
                                </Text>
                                {[
                                    { name: 'React Native',       role: ru ? 'Мобильный движок'     : 'Mobile Engine' },
                                    { name: 'Expo',               role: ru ? 'Платформа разработки' : 'Dev Platform' },
                                    { name: 'Zustand',            role: ru ? 'Управление состоянием': 'State Management' },
                                    { name: 'React Native Skia',  role: ru ? 'Рендеринг карты'      : 'Map Rendering' },
                                    { name: 'expo-av',            role: ru ? 'Аудио система'         : 'Audio System' },
                                    { name: 'Lucide Icons',       role: ru ? 'Иконки интерфейса'    : 'UI Icons' },
                                ].map((tech, i) => (
                                    <View key={i} style={styles.techRow}>
                                        <Text style={styles.techName}>{tech.name}</Text>
                                        <View style={styles.techDot} />
                                        <Text style={styles.techRole}>{tech.role}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Special thanks */}
                            <View style={styles.thanksBlock}>
                                <Text style={styles.sectionLabel}>
                                    {ru ? 'ОСОБАЯ БЛАГОДАРНОСТЬ' : ge ? 'განსაკუთრებული მადლობა' : 'SPECIAL THANKS'}
                                </Text>
                                <Text style={styles.thanksText}>
                                    {ru
                                        ? 'Всем, кто верил в этот проект.\nСообществу разработчиков React Native.\nВсем игрокам, которые дали обратную связь.\n\nИ тем, кто не спал до 3 ночи,\nдебаггируя систему ИИ.'
                                        : ge ? 'ყველას, ვინც ამ პროექტს სჯეროდა.\nReact Native-ის დეველოპერთა საზოგადოებას.\nყველა მოთამაშეს, ვინც გამოხმაურება გასცა.\n\nმათ, ვინც გამთენიამდე ეღვიძა\nხელოვნური ინტელექტის სისტემის გამართვაზე.'
                                        : 'Everyone who believed in this project.\nThe React Native developer community.\nAll players who gave feedback.\n\nAnd to whoever stayed up until 3am\ndebugging the AI systems.'}
                                </Text>
                            </View>

                            {/* Copyright */}
                            <View style={styles.copyrightBlock}>
                                <Text style={styles.copyrightText}>
                                    © 2026 SOFTCURSE STUDIO
                                </Text>
                                <Text style={styles.copyrightSub}>
                                    {ru
                                        ? 'Все права защищены. Любое сходство с реальными событиями случайно.'
                                        : ge ? 'ყველა უფლება დაცულია. ნებისმიერი მსგავსება რეალურ მოვლენებთან შემთხვევითია.'
                                        : 'All rights reserved. Any resemblance to actual events is coincidental.'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* ── ABOUT TAB ── */}
                    {tab === 'about' && (
                        <View style={styles.aboutContainer}>

                            {/* Title card */}
                            <View style={styles.aboutTitleCard}>
                                <Text style={styles.aboutGameTitle}>
                                    {ru ? 'МИРОВАЯ ВОЙНА III' : ge ? 'მსოფლიო ომი III' : 'WORLD WAR III'}
                                </Text>
                                <Text style={styles.aboutGameSubtitle}>
                                    {ru ? 'ГЛОБАЛЬНЫЙ КОЛЛАПС' : ge ? 'გლობალური კოლაფსი' : 'GLOBAL COLLAPSE'}
                                </Text>
                                <Text style={styles.aboutGenre}>
                                    {ru
                                        ? 'Глобальная пошаговая стратегия · Геополитическая симуляция'
                                        : ge ? 'გლობალური სვლა-სვლა სტრატეგია · გეოპოლიტიკური სიმულაცია'
                                        : 'Grand Turn-Based Strategy · Geopolitical Simulation'}
                                </Text>
                            </View>

                            {/* About sections */}
                            {(ru ? ABOUT_SECTIONS_RU : ge ? ABOUT_SECTIONS_GE : ABOUT_SECTIONS_EN).map((section, i) => (
                                <View key={i} style={styles.aboutSection}>
                                    <View style={styles.aboutSectionHeader}>
                                        <Text style={styles.aboutSectionIcon}>{section.icon}</Text>
                                        <Text style={styles.aboutSectionTitle}>{section.title}</Text>
                                    </View>
                                    <Text style={styles.aboutSectionText}>{section.body}</Text>
                                </View>
                            ))}

                            {/* System specs */}
                            <View style={styles.specsBlock}>
                                <Text style={styles.sectionLabel}>
                                    {ru ? 'ХАРАКТЕРИСТИКИ ИГРЫ' : ge ? 'თამაშის მახასიათებლები' : 'GAME SPECS'}
                                </Text>
                                {[
                                    { label: ru ? 'Регионы' : ge ? 'რეგიონები' : 'Regions',           value: '46' },
                                    { label: ru ? 'Фракции' : ge ? 'ფრაქციები' : 'Factions',           value: '5' },
                                    { label: ru ? 'Технологии' : ge ? 'ტექნოლოგიები' : 'Technologies',   value: '20+' },
                                    { label: ru ? 'Миссии' : ge ? 'მისიები' : 'Missions',            value: '18' },
                                    { label: ru ? 'Мировые события' : ge ? 'მსოფლიო მოვლენები' : 'World Events', value: '42+' },
                                    { label: ru ? 'Достижения' : ge ? 'მიღწევები' : 'Achievements',   value: '41' },
                                    { label: ru ? 'Языки' : ge ? 'ენები' : 'Languages',            value: 'EN / RU / GE' },
                                    { label: ru ? 'Игровые режимы' : ge ? 'თამაშის რეჟიმები' : 'Game Modes', value: ru ? '3 (Кампания / Блицкриг / Выживание)' : ge ? '3 (კამპანია / ბლიცკრიგი / გადარჩენა)' : '3 (Campaign / Blitz / Survival)' },
                                ].map((spec, i) => (
                                    <View key={i} style={styles.specRow}>
                                        <Text style={styles.specLabel}>{spec.label}</Text>
                                        <Text style={styles.specValue}>{spec.value}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ height: 30 }} />
                        </View>
                    )}

                </ScrollView>
            </View>
        </Animated.View>
        </Modal>
    );
};

const ABOUT_SECTIONS_GE = [
    {
        icon: '🌍',
        title: 'კონცეფცია',
        body: 'მსოფლიო ომი III: გლობალური კოლაფსი — გლობალური სტრატეგია ახლო მომავალში. სამყარო გახლეჩილია ნაციონალიზმის ზრდით, რესურსების დეფიციტით, პროქსი ომებით. თქვენ ხელმძღვანელობთ ხუთი სუპერსახელმწიფოდან ერთ-ერთს. ეს არ არის სიდიადის თამაში — ეს არის გადარჩენის და ძალაუფლების ფასის თამაში.',
    },
    {
        icon: '⚙',
        title: 'ძირითადი სისტემები',
        body: 'თამაში მუშაობს Nightmare Engine-ზე — სტრატეგიული ბირთვი, რომელიც ერთდროულად მოდელირებს სამხედრო ძალას, ეკონომიკურ ზეწოლას, ტექნოლოგიურ განვითარებას და სტაბილურობას. ყოველ მოლოდინში ხუთი ხელოვნური ინტელექტის ფრაქცია დამოუკიდებელ სტრატეგიულ დოქტრინებს ახორციელებს.',
    },
    {
        icon: '🗺',
        title: 'რუკა',
        body: '46 ტერიტორია ყველა კონტინენტზე გამოსახულია React Native Skia SVG რუკაზე. თითოეულ რეგიონს აქვს საკუთარი ეკონომიკა, მრეწველობა, სტაბილურობა და სტრატეგიული ღირებულება. ომის ნისლი გაძლევს არასრული დაზვერვის პირობებში მოქმედების საშუალებას.',
    },
    {
        icon: '☢',
        title: 'სამი-აქტიანი ესკალაცია',
        body: 'კამპანიები სამ აქტში ვითარდება. აქტი I: ჩვეულებრივი ომი და დიპლომატია. აქტი II: სრული მობილიზაცია, დიპლომატიური არხები დახურულია. აქტი III: ბირთვული დოქტრინა გააქტიურდა, მკვდარი ხელის სისტემა შეიარაღებულია.',
    },
    {
        icon: '💡',
        title: 'ტექნოლოგიების ხე',
        body: 'ოცზე მეტი კვლევითი კვანძი ხსნის მოწინავე სამხედრო შესაძლებლობებს, ეკონომიკურ ბონუსებს და სპეციალურ იარაღს. ურთიერთგამომრიცხავი გზები სტრატეგიულ ვალდებულებებს ძალავს — ყველაფრის ქონა შეუძლებელია.',
    },
    {
        icon: '🕵',
        title: 'დაზვერვა და დიპლომატია',
        body: 'სადაზვერვო ოპერაციები: გამოავლინეთ მტრის ძალები, განადგურეთ ინფრასტრუქტურა, ლიკვიდირება მოახდინეთ ხელმძღვანელობაზე. ეკონომიკური დიპლომატია: სავაჭრო მარშრუტები, სანქციები და საზღვაო ბლოკადები.',
    },
    {
        icon: '🎯',
        title: 'კამპანიის მისიები',
        body: '18 პროგრესული მისია ამატებს ამოცანებს ქვიშაყუთს — ადრეული ტერიტორიული მიზნებიდან გვიანდელ გადარჩენის გამოწვევებამდე. მისიების შესრულება ჯილდოებს სახსრებით, ნავთობით და მარაგებით.',
    },
    {
        icon: '🏆',
        title: 'პროგრესი',
        body: '41 მიღწევა აკვირდება ოსტატობას ყველა განზომილებაში: დაპყრობა, ეკონომიკა, დაზვერვა, გადარჩენა და ბირთვული ესკალაცია. რეიტინგი ინახავს საუკეთესო გათამაშებებს 10,000 ქულიანი ბონუსით სრული გამარჯვებისთვის.',
    },
    {
        icon: '🔊',
        title: 'დიზაინის ფილოსოფია',
        body: 'გლობალური კოლაფსი შეიქმნა ერთი კითხვის გარშემო: როგორია სუპერსახელმწიფოს მეთაურობა განადგურების პირას? პასუხი მოითხოვდა სისტემებს, სადაც ყოველ გადაწყვეტილებას წონა აქვს და ბირთვული ომი ყოველთვის შესაძლებელია.',
    },
];

const ABOUT_SECTIONS_EN = [
    {
        icon: '🌍',
        title: 'CONCEPT',
        body: 'World War III: Global Collapse is a grand strategy game set in the near future — a world fractured by rising nationalism, resource scarcity, proxy wars, and collapsing multilateral institutions. You take command of one of five global superpowers and guide them through the most catastrophic conflict in human history.\n\nThis is not a game about glory. It\'s a game about survival, hard choices, and the cost of power.',
    },
    {
        icon: '⚙',
        title: 'CORE SYSTEMS',
        body: 'The game runs on the Nightmare Engine — a purpose-built strategy layer that models military power, economic pressure, technological advancement, internal stability, and intelligence operations simultaneously.\n\nEvery turn, five AI factions pursue independent strategic doctrines: Blitz, Defensive, Economic, Expansionist, or Diplomatic. They adapt based on battlefield losses, threat assessment, and resource availability. No two campaigns play out the same way.',
    },
    {
        icon: '🗺',
        title: 'THE MAP',
        body: '46 territories spanning every continent are rendered on a custom SVG world map built with React Native Skia. Each region has its own economic output, industrial capacity, stability rating, and strategic value. Coastal regions support naval operations. Strategic regions accelerate tech and income. Isolated regions suffer attrition.\n\nFog of War forces you to operate with incomplete intelligence — spy operations are often the only way to know what you\'re walking into.',
    },
    {
        icon: '☢',
        title: 'THREE-ACT ESCALATION',
        body: 'Campaigns unfold across three acts of escalating intensity:\n\nACT I — TENSION: Conventional warfare, diplomacy, and economic competition define the early game. Factions jockey for position and resources.\n\nACT II — GLOBAL WAR: Full mobilisation. Diplomatic channels close. AI becomes unrestricted. Every faction fights for survival.\n\nACT III — ESCALATION: Nuclear doctrine activates. The Dead Hand system arms. Each launch risks retaliation. Stability collapses faster. Victory becomes desperate.',
    },
    {
        icon: '💡',
        title: 'TECHNOLOGY TREE',
        body: 'Twenty-plus research nodes unlock advanced military capabilities, economic bonuses, intelligence upgrades, and special weapons. Mutually exclusive paths force strategic commitments — you cannot have everything.\n\nKey technologies include Orbital Strike platforms, Cyber Warfare infrastructure viruses, Advanced Nuclear Doctrine, Carrier Battle Groups, and Dead Hand automated retaliation systems.',
    },
    {
        icon: '🕵',
        title: 'INTELLIGENCE & DIPLOMACY',
        body: 'Spy Operations allow you to reveal enemy troop movements, sabotage industrial infrastructure, and assassinate enemy leadership — each at the cost of limited operative charges that replenish slowly.\n\nThe new Economic Diplomacy system (Phase 8) adds Trade Routes, Economic Sanctions, and Naval Blockades — giving you leverage over enemies without firing a shot. Resource warfare can be just as decisive as military conquest.',
    },
    {
        icon: '🎯',
        title: 'CAMPAIGN MISSIONS',
        body: '18 progressive campaign missions layer objectives over the sandbox — from early territorial goals to late-game survival challenges and Act III special objectives. Completing missions rewards funds, oil, and supplies that can turn the tide of a losing campaign.\n\nThe final mission — Absolute Victory — requires controlling 70% of all territories. Getting there requires mastering every system the game offers.',
    },
    {
        icon: '🏆',
        title: 'PROGRESSION',
        body: '41 achievements track mastery across every dimension of play: conquest, economy, intelligence, survival, nuclear escalation, and campaign completion. A persistent leaderboard records your best runs scored by territory control, turns survived, captures, and missions completed — with a 10,000 point bonus for full victory.\n\nEvery faction plays differently. Every mode changes the rules. True mastery means winning as all five factions across all three game modes.',
    },
    {
        icon: '🔊',
        title: 'DESIGN PHILOSOPHY',
        body: 'Global Collapse was designed around one question: what does it actually feel like to command a superpower on the edge of annihilation?\n\nThe answer meant building systems that create genuine tension — where every decision has weight, where the map can tip against you without warning, where nuclear war is always possible but never trivial, and where the statistics screen at the end tells a story specific to that campaign and no other.\n\nThe game does not flinch from the horror of what it depicts. The world events, the act transitions, the game over screens — they are designed to land with consequence.',
    },
];

const ABOUT_SECTIONS_RU = [
    {
        icon: '🌍',
        title: 'КОНЦЕПЦИЯ',
        body: 'Мировая Война III: Глобальный Коллапс — глобальная стратегия в ближайшем будущем. Мир разорван ростом национализма, нехваткой ресурсов, прокси-войнами и крахом международных институтов. Вы берёте командование одной из пяти сверхдержав и ведёте её через самый катастрофический конфликт в истории человечества.\n\nЭто не игра о славе. Это игра о выживании, тяжёлых решениях и цене власти.',
    },
    {
        icon: '⚙',
        title: 'ОСНОВНЫЕ СИСТЕМЫ',
        body: 'Игра работает на движке Nightmare Engine — специально разработанном стратегическом ядре, одновременно моделирующем военную мощь, экономическое давление, технологическое развитие, внутреннюю стабильность и разведывательные операции.\n\nКаждый ход пять ИИ-фракций преследуют независимые стратегические доктрины: Блицкриг, Оборона, Экономика, Экспансия или Дипломатия. Они адаптируются на основе потерь, оценки угроз и доступных ресурсов. Ни одна кампания не проходит одинаково.',
    },
    {
        icon: '🗺',
        title: 'КАРТА',
        body: '46 территорий на каждом континенте отображены на кастомной SVG-карте мира, построенной на React Native Skia. Каждый регион имеет собственный экономический выход, промышленный потенциал, рейтинг стабильности и стратегическую ценность. Прибрежные регионы поддерживают морские операции. Стратегические регионы ускоряют технологии и доход. Окружённые регионы теряют войска от истощения.\n\nТуман войны вынуждает действовать при неполной разведке — шпионаж часто единственный способ знать, во что вы идёте.',
    },
    {
        icon: '☢',
        title: 'ТРЁХАКТНАЯ ЭСКАЛАЦИЯ',
        body: 'Кампании разворачиваются в трёх актах нарастающей интенсивности:\n\nАКТ I — НАПРЯЖЕНИЕ: Обычная война, дипломатия и экономическая конкуренция. Фракции борются за позиции и ресурсы.\n\nАКТ II — МИРОВАЯ ВОЙНА: Полная мобилизация. Дипломатические каналы закрыты. ИИ без ограничений. Каждая фракция борется за выживание.\n\nАКТ III — ЭСКАЛАЦИЯ: Ядерная доктрина активируется. Система Мёртвой Руки взведена. Каждый пуск рискует возмездием. Стабильность рушится быстрее. Победа становится отчаянной.',
    },
    {
        icon: '💡',
        title: 'ДЕРЕВО ТЕХНОЛОГИЙ',
        body: 'Более двадцати исследовательских узлов открывают продвинутые военные возможности, экономические бонусы, улучшения разведки и специальное оружие. Взаимоисключающие пути вынуждают делать стратегический выбор — невозможно иметь всё.\n\nКлючевые технологии: орбитальные платформы, инфраструктурные вирусы кибервойны, продвинутая ядерная доктрина, ударные авианосные группы и автоматические системы ответного удара Мёртвой Руки.',
    },
    {
        icon: '🕵',
        title: 'РАЗВЕДКА И ДИПЛОМАТИЯ',
        body: 'Шпионские операции позволяют раскрывать передвижения противника, саботировать промышленную инфраструктуру и ликвидировать вражеское командование — каждое за счёт ограниченных зарядов агентов, пополняемых медленно.\n\nНовая система Экономической Дипломатии (Фаза 8) добавляет Торговые Пути, Экономические Санкции и Морские Блокады — давление на врагов без единого выстрела. Война ресурсов может быть такой же решающей, как военное завоевание.',
    },
    {
        icon: '🎯',
        title: 'МИССИИ КАМПАНИИ',
        body: '18 последовательных миссий накладывают цели на песочницу — от ранних территориальных задач до испытаний на выживание в Акте III. Выполнение миссий вознаграждает средствами, нефтью и снабжением, способными переломить ход проигрышной кампании.\n\nФинальная миссия — Абсолютная Победа — требует контроля над 70% всех территорий. Достичь этого возможно только овладев каждой системой игры.',
    },
    {
        icon: '🏆',
        title: 'ПРОГРЕСС',
        body: '41 достижение отслеживает мастерство по всем измерениям: завоевание, экономика, разведка, выживание, ядерная эскалация и завершение кампании. Постоянная таблица лидеров фиксирует лучшие прохождения по территориальному контролю, выжитым ходам, захватам и выполненным миссиям — с бонусом 10 000 очков за полную победу.\n\nКаждая фракция играется по-разному. Каждый режим меняет правила. Настоящее мастерство — победить за все пять фракций во всех трёх режимах.',
    },
    {
        icon: '🔊',
        title: 'ФИЛОСОФИЯ ДИЗАЙНА',
        body: 'Глобальный Коллапс был создан вокруг одного вопроса: каково это на самом деле — командовать сверхдержавой на краю уничтожения?\n\nОтвет потребовал систем, создающих настоящее напряжение — где каждое решение имеет вес, где карта может обернуться против вас без предупреждения, где ядерная война всегда возможна, но никогда не тривиальна, и где экран статистики в конце рассказывает историю, специфичную именно для этой кампании.\n\nИгра не уклоняется от ужаса того, что изображает. Мировые события, переходы между актами, экраны окончания — всё это разработано с последствиями.',
    },
];

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#03080f',
        zIndex: 400,
    },
    scanline: {
        position: 'absolute',
        left: 0, right: 0,
        height: 2,
        backgroundColor: 'rgba(58,158,255,0.06)',
        zIndex: 1,
    },
    panel: {
        flex: 1,
        zIndex: 2,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#0d1e2e',
        backgroundColor: '#030a12',
    },
    headerLeft: { flex: 1 },
    headerStudio: {
        color: '#3a9eff',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 5,
        marginBottom: 4,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerVersion: {
        color: '#2a4a5a',
        fontSize: 9,
        letterSpacing: 2,
    },
    closeBtn: { padding: 16, marginTop: -8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: '#5f8090', fontSize: 26, fontWeight: '300' },

    // ── Tabs ──────────────────────────────────────────────────────────────
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#0d1e2e',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#3a9eff',
        backgroundColor: 'rgba(58,158,255,0.05)',
    },
    tabText: {
        color: '#2a4a5a',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
    },
    tabTextActive: { color: '#3a9eff' },

    scroll: { flex: 1 },

    // ── CREDITS ─────────────────────────────────────────────────────────────
    creditsContainer: {
        padding: 20,
    },
    studioBlock: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    studioGlyph: {
        fontSize: 48,
        color: '#3a9eff',
        marginBottom: 12,
    },
    studioName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 6,
        marginBottom: 6,
    },
    studioTagline: {
        color: '#2a5070',
        fontSize: 9,
        letterSpacing: 3,
        textAlign: 'center',
    },
    studioDivider: {
        width: 60,
        height: 1,
        backgroundColor: '#0d2030',
        marginTop: 24,
    },

    devBlock: {
        alignItems: 'center',
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: '#0d2030',
        marginBottom: 24,
        backgroundColor: '#040c16',
    },
    devBadge: {
        backgroundColor: '#3a9eff',
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 16,
    },
    devBadgeText: {
        color: '#000',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 4,
    },
    devName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 6,
    },
    devTitle: {
        color: '#3a7090',
        fontSize: 11,
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    devRoles: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    roleChip: {
        borderWidth: 1,
        borderColor: '#0d2030',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#060e18',
    },
    roleChipText: {
        color: '#3a7090',
        fontSize: 9,
        letterSpacing: 1,
        fontWeight: '700',
    },
    soloNote: {
        marginTop: 4,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#0d2030',
        paddingTop: 16,
    },
    soloNoteText: {
        color: '#f0a030',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 18,
        fontStyle: 'italic',
    },

    sectionLabel: {
        color: '#2a4a5a',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 14,
    },

    techBlock: {
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#0d1e2e',
        padding: 16,
    },
    techRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#050e18',
        gap: 10,
    },
    techName: {
        color: '#c0d8e8',
        fontSize: 12,
        fontWeight: '700',
        width: 140,
    },
    techDot: {
        width: 4, height: 4,
        backgroundColor: '#1a3a4a',
        borderRadius: 2,
    },
    techRole: {
        color: '#3a5060',
        fontSize: 11,
        flex: 1,
    },

    thanksBlock: {
        marginBottom: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#0d1e2e',
        backgroundColor: '#040c16',
    },
    thanksText: {
        color: '#4a6a7a',
        fontSize: 12,
        lineHeight: 22,
        fontStyle: 'italic',
    },

    copyrightBlock: {
        alignItems: 'center',
        paddingVertical: 30,
        borderTopWidth: 1,
        borderTopColor: '#0d1e2e',
    },
    copyrightText: {
        color: '#1a3040',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 6,
    },
    copyrightSub: {
        color: '#0d2030',
        fontSize: 9,
        textAlign: 'center',
        letterSpacing: 1,
    },

    // ── ABOUT ────────────────────────────────────────────────────────────────
    aboutContainer: {
        padding: 20,
    },
    aboutTitleCard: {
        alignItems: 'center',
        paddingVertical: 28,
        borderWidth: 1,
        borderColor: '#0d2030',
        marginBottom: 24,
        backgroundColor: '#040c16',
    },
    aboutGameTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 4,
    },
    aboutGameSubtitle: {
        color: '#e74c3c',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 5,
        marginBottom: 12,
    },
    aboutGenre: {
        color: '#2a5070',
        fontSize: 9,
        textAlign: 'center',
        letterSpacing: 2,
        paddingHorizontal: 20,
    },

    aboutSection: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#0a1a28',
        backgroundColor: '#040c16',
    },
    aboutSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#0a1a28',
        backgroundColor: '#06101a',
    },
    aboutSectionIcon: { fontSize: 18 },
    aboutSectionTitle: {
        color: '#3a9eff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 3,
    },
    aboutSectionText: {
        color: '#5a7a8a',
        fontSize: 12,
        lineHeight: 21,
        padding: 16,
    },

    specsBlock: {
        borderWidth: 1,
        borderColor: '#0a1a28',
        padding: 16,
        marginBottom: 10,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#060e18',
    },
    specLabel: {
        color: '#2a4a5a',
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: '700',
    },
    specValue: {
        color: '#c0d8e8',
        fontSize: 11,
        fontWeight: '900',
    },
});

export default CreditsScreen;
