import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  gameConfig, 
  CARD_TYPES, 
  Statement, 
  RARITY_CONFIG, 
  FILLER_OPTIONS, 
  PlayableCard, 
  CardType,
  Rarity,
  INITIAL_DECK
} from "@/lib/gameData";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Zap, Dices, AlertTriangle, RefreshCw, User, Sparkles, Ghost, Eye, EyeOff } from "lucide-react";

// --- 统一角色图标组件 ---
const CharacterIcon = ({ size = 48, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M678.811913 298.624026c0-92.002399-74.809514-166.811913-166.811913-166.811913s-166.811913 74.809514-166.811913 166.811913 74.809514 166.811913 166.811913 166.811913S678.811913 390.626424 678.811913 298.624026z" fill="currentColor"></path>
    <path d="M512 510.464921c-192.703578 0-350.612033 151.563462-360.743554 341.708575 31.827304 8.391765 109.297621 26.505697 213.785329 36.841895 80.94983 7.982411 162.206676 9.619828 241.314411 5.014591 92.002399-5.321607 181.548671-19.341995 266.387368-41.447132C862.81671 662.23306 704.805916 510.464921 512 510.464921z" fill="currentColor"></path>
    <path d="M918.284229 871.720168c0-54.853488-10.745553-108.069558-31.929642-158.113132-20.467719-48.406156-49.736558-91.797721-87.090146-129.151309-37.353588-37.353588-80.745153-66.622427-129.151309-87.090146-16.06716-6.754347-32.441335-12.485309-49.122526-17.192884C682.598441 443.126124 723.840895 375.684989 723.840895 298.624026c0-116.768339-95.072556-211.840895-211.840895-211.840895s-211.840895 95.072556-211.840895 211.840895c0 76.958625 41.242455 144.502099 102.85029 181.548671-16.681191 4.605237-33.055367 10.336198-49.122526 17.192884-48.406156 20.467719-91.797721 49.736558-129.151309 87.090146-37.353588 37.353588-66.622427 80.745153-87.090146 129.151309-21.18409 50.145912-31.929642 103.361983-31.929642 158.113132 0 11.6666 8.903458 21.286428 20.263042 22.412153 71.534679 4.40056 678.402558 9.005797 777.773336-1.125725l0-0.204677C912.246252 889.629422 918.284229 881.442335 918.284229 871.720168z" fill="currentColor"></path>
  </svg>
);

// --- 工具函数：洗牌 ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getCardCharacter = (characterId: "purple_fox" | "green_face" | "red_man") => {
  switch (characterId) {
    case "purple_fox":
      return { 
        name: "紫狐狸", 
        color: "from-purple-600 to-purple-900", 
        icon: <CharacterIcon size={48} className="text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" /> 
      };
    case "green_face":
      return { 
        name: "绿双面人", 
        color: "from-emerald-600 to-emerald-900", 
        icon: <CharacterIcon size={48} className="text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> 
      };
    case "red_man":
      return { 
        name: "红发男", 
        color: "from-red-600 to-red-900", 
        icon: <CharacterIcon size={48} className="text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" /> 
      };
  }
};

interface Option {
  id: string;
  text: string;
  isEffective: boolean;
  type: CardType;
}

// 辅助函数：随机获取一个废话选项（完全随机类型）
const getRandomFillerOption = (): { text: string; type: CardType } => {
  const allTypes = Object.keys(FILLER_OPTIONS) as CardType[];
  const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
  const texts = FILLER_OPTIONS[randomType];
  const randomText = texts[Math.floor(Math.random() * texts.length)];
  return { text: randomText, type: randomType };
};

const generateOptionsForCard = (card: PlayableCard, statement: Statement): Option[] => {
  const options: Option[] = [];
  const usedTexts = new Set<string>();
  
  // 遍历卡牌的 types 数组，为每个 type 获取一条台词
  for (const cardType of card.types) {
    const validInteractions = statement.interactions?.[cardType] || [];
    
    if (validInteractions.length > 0) {
      // 关键过滤：从可用台词中剔除已使用的台词
      const availableInteractions = validInteractions.filter(
        interaction => !usedTexts.has(interaction.player)
      );
      
      if (availableInteractions.length > 0) {
        // 从剩余的台词中随机选取一条
        const randomInteraction = availableInteractions[
          Math.floor(Math.random() * availableInteractions.length)
        ];
        options.push({ 
          id: Math.random().toString(), 
          text: randomInteraction.player, 
          isEffective: true, 
          type: cardType 
        });
        usedTexts.add(randomInteraction.player);
      } else {
        // 兜底策略：如果没有可用台词了，从所有类型中随机选取废话
        const filler = getRandomFillerOption();
        options.push({ 
          id: Math.random().toString(), 
          text: filler.text, 
          isEffective: false, 
          type: filler.type 
        });
      }
    } else {
      // 如果该类型没有任何台词，从所有类型中随机选取废话
      const filler = getRandomFillerOption();
      options.push({ 
        id: Math.random().toString(), 
        text: filler.text, 
        isEffective: false, 
        type: filler.type 
      });
    }
  }
  
  // 如果有效选项不足 3 个，用完全随机的废话填充
  while (options.length < 3) {
    const filler = getRandomFillerOption();
    options.push({ 
      id: Math.random().toString(), 
      text: filler.text, 
      isEffective: false, 
      type: filler.type 
    });
  }
  
  // 打乱顺序
  return shuffleArray(options);
};

export default function Game() {
  // 计算总血量上限
  const totalMaxHP = gameConfig.phases.reduce((total, phase) => {
    return total + phase.statements.reduce((phaseTotal, stmt) => phaseTotal + stmt.maxHp, 0);
  }, 0);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [activeStatementIndex, setActiveStatementIndex] = useState(0);
  const [bossCurrentHP, setBossCurrentHP] = useState(totalMaxHP);
  const [ap, setAp] = useState(30);
  const [isWeaknessHidden, setIsWeaknessHidden] = useState(false);

  const [currentCard, setCurrentCard] = useState<PlayableCard | null>(null);
  const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
  
  const [isActing, setIsActing] = useState(false);
  const [diceRolls, setDiceRolls] = useState<number[]>([]);
  const [showDice, setShowDice] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; visible: boolean }>({ text: "", visible: false });
  const [bossReply, setBossReply] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  
  // --- 新增：增强版飘字状态 (包含 label 和 size) ---
  const [floatingText, setFloatingText] = useState<{
    id:string, 
    text:string, 
    label: string, 
    x:number, 
    y:number, 
    color:string, 
    sizeClass: string
  }[]>([]);

  const currentPhase = gameConfig.phases[currentPhaseIndex];
  const activeStatement = statements[activeStatementIndex];

  useEffect(() => {
    if (currentPhase) {
      setStatements(JSON.parse(JSON.stringify(currentPhase.statements)));
      setActiveStatementIndex(0);
    }
  }, [currentPhaseIndex]);

  const drawNewCard = () => {
    // 无限随机抽取：直接从 INITIAL_DECK 中随机选一张
    const randomIndex = Math.floor(Math.random() * INITIAL_DECK.length);
    const drawnCard = INITIAL_DECK[randomIndex];
    
    setCurrentCard(drawnCard);
    if (activeStatement) {
      setCurrentOptions(generateOptionsForCard(drawnCard, activeStatement));
    }
    setBossReply(null);
  };

  useEffect(() => {
    if (activeStatement && !currentCard) {
      drawNewCard();
    } else if (activeStatement && currentCard) {
      setCurrentOptions(generateOptionsForCard(currentCard, activeStatement));
    }
  }, [activeStatement?.id]);

  // --- 增强版飘字函数 ---
  const addFloatingText = (label: string, text: string, x: number, y: number, color: string, sizeClass: string = "text-4xl") => {
    const id = Math.random().toString();
    setFloatingText(p => [...p, { id, label, text, x, y, color, sizeClass }]);
    setTimeout(() => setFloatingText(p => p.filter(t => t.id !== id)), 2500);
  };

  const handleOptionSelect = (option: Option, e: React.MouseEvent) => {
    if (isActing || !currentCard || ap <= 0) return;
    
    setIsActing(true);
    setAp(p => p - 1);

    // 1. 掷骰子
    const rollCount = currentCard.diceCount;
    const rolls = Array.from({ length: rollCount }, () => Math.floor(Math.random() * 6) + 1);
    setDiceRolls(rolls);
    setShowDice(true);

    const weakness = activeStatement.weakness;
    let baseDamage = 0;
    let critDamage = 0;
    let isBreak = false;
    let damageLabel = "MISS";
    
    // A. 基础伤害（话术匹配度）
    if (!option.isEffective) {
      // BAD/MISS
      baseDamage = 0;
      damageLabel = "MISS";
    } else if (option.type === weakness.type) {
      // PERFECT（完美回击）
      baseDamage = 20;
      damageLabel = "PERFECT";
    } else {
      // GOOD（普通回击）
      baseDamage = 10;
      damageLabel = "GOOD";
    }
    
    // B. 爆发伤害（骰子运气）
    let critCount = 0;
    if (option.type === weakness.type) {
      // 只有属性匹配时才检查骰子
      critCount = rolls.filter(roll => roll === weakness.targetPoint).length;
      critDamage = critCount * 40;
      
      if (critCount > 0) {
        damageLabel = "CRIT!";
        isBreak = true;
      }
    }
    
    const totalDamage = baseDamage + critDamage;

    // 3. 结算延迟 (等待骰子动画)
    setTimeout(() => {
      setShowDice(false);
      
      const newStmts = [...statements];
      const stmt = newStmts[activeStatementIndex];
      
      // 关键修正：计算实际能扣除的血量（防止溢出伤害）
      const actualDamage = Math.min(totalDamage, stmt.hp);
      
      // 更新当前问题血量 (允许减到负数逻辑上归零)
      stmt.hp = Math.max(0, stmt.hp - totalDamage);
      setStatements(newStmts);
      
      // 更新 Boss 总血量 (只减去实际有效伤害)
      setBossCurrentHP(prev => Math.max(0, prev - actualDamage));
      
      // 获取点击位置作为飘字起点
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top;

      // 根据结果生成飘字
      let color = "#aaaaaa";
      let sizeClass = "text-3xl";
      let damageText = "0";

      if (totalDamage === 0) {
        // MISS
        color = "#aaaaaa";
        sizeClass = "text-3xl";
        damageText = "0";
      } else if (critCount > 0) {
        // CRIT（有骰子命中）
        color = "#ff0055"; // 霓虹红
        sizeClass = "text-6xl";
        damageText = `-${totalDamage}`;
        damageLabel = `CRIT! +${critDamage}`;
      } else if (baseDamage === 20) {
        // PERFECT
        color = "#39ff14"; // 霓虹绿
        sizeClass = "text-5xl";
        damageText = `-${totalDamage}`;
      } else if (baseDamage === 10) {
        // GOOD
        color = "#00ffff"; // 霓虹蓝
        sizeClass = "text-4xl";
        damageText = `-${totalDamage}`;
      }

      // 触发飘字
      addFloatingText(damageLabel, damageText, centerX, centerY, color, sizeClass);

      if (isBreak) {
        setShake(true);
        setFlash(true);
        setTimeout(() => { setShake(false); setFlash(false); }, 500);
      }

      // 根据选项的 type 获取对应的交互
      if (option.isEffective) {
        const cardInteractions = activeStatement.interactions?.[option.type];
        if (cardInteractions) {
          const interaction = cardInteractions.find(i => i.player === option.text);
          if (interaction) setBossReply(interaction.boss);
        }
      } else {
         setBossReply("……");
      }

      // 4. 判断胜负或下一轮
      if (stmt.hp <= 0) {
        setTimeout(() => {
          setFeedback({ text: activeStatement.breakFeedback, visible: true });
          
          setTimeout(() => {
            setFeedback({ text: "", visible: false });
            if (activeStatementIndex < statements.length - 1) {
              setActiveStatementIndex(p => p + 1);
            } else if (currentPhaseIndex < gameConfig.phases.length - 1) {
              setCurrentPhaseIndex(p => p + 1);
            } else {
              toast.success("BOSS 已击败！");
            }
            setIsActing(false);
            drawNewCard();
          }, 2000);
        }, 1000);
      } else {
        setTimeout(() => {
          setIsActing(false);
          drawNewCard();
        }, 3000);
      }

    }, 1000);
  };

  if (!activeStatement || !currentCard) return <div className="bg-black min-h-screen text-white flex items-center justify-center font-mono">LOADING...</div>;

  const cardCharacter = getCardCharacter(currentCard.characterId);

  return (
    <div className="flex items-center justify-center h-screen bg-[#050505] font-sans select-none overflow-hidden">
      
      <div className={`relative w-[95vw] h-[95vh] max-w-none bg-black border-2 border-[#333] shadow-2xl overflow-hidden rounded-lg flex flex-col ${shake ? "animate-shake" : ""}`}
        style={{ aspectRatio: '16/9', maxHeight: 'calc(95vw * 9 / 16)', maxWidth: 'calc(95vh * 16 / 9)' }}
      >
        
        {/* Flash 红色闪光层 */}
        {flash && <div className="animate-flash" />}
        
        {/* 背景图片 */}
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/background.png')` }} />
        
        {/* CRT 扫描线 */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%)] z-10 bg-[length:100%_2px]" />
        
        {/* 飘字层 - 固定在屏幕中央偏右，只淡入淡出 */}
        {floatingText.map(ft => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute pointer-events-none z-[100] font-mono drop-shadow-[0_6px_0_#000] flex flex-col items-center ${ft.sizeClass}`}
            style={{ 
              color: ft.color, 
              left: "60%", 
              top: "32%", 
              transform: "translate(-50%, -50%)" 
            }}
          >
            {/* 上方评价标签 */}
            <span className="text-lg opacity-90 mb-2">{ft.label}</span>
            {/* 下方伤害数字 */}
            <span className="font-bold">{ft.text}</span>
          </motion.div>
        ))}

      {/* --- 顶部 HUD --- */}
      <div className="relative z-20 flex justify-between items-start p-6 flex-shrink-0">
        <div className="flex-1 max-w-2xl">
          <div className="flex justify-between text-lg text-[#b026ff] mb-2 font-mono font-bold">
            <span>BOSS</span>
            <span>{Math.floor((bossCurrentHP / totalMaxHP) * 100)}%</span>
          </div>
          
          {/* 血条容器 */}
          <div className="relative">
            <Progress 
              value={(bossCurrentHP / totalMaxHP) * 100} 
              className="h-4 bg-gray-900 border border-[#b026ff]/50 [&>div]:bg-[#b026ff]" 
            />
            
            {/* 阶段分割标记 (恶魔 Emoji) */}
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <span 
                className="absolute text-3xl z-10 transform -translate-x-1/2" 
                style={{ left: '33.33%' }}
                title="阶段 1 → 2"
              >
                😈
              </span>
              <span 
                className="absolute text-3xl z-10 transform -translate-x-1/2" 
                style={{ left: '66.66%' }}
                title="阶段 2 → 3"
              >
                😈
              </span>
            </div>
          </div>
          
          {/* 阶段目标显示 */}
          <div className="mt-2 text-[#39ff14] text-2xl font-mono font-bold">
            {currentPhase?.title.replace(/^目标[：:]/, "阶段目标：")}
          </div>
        </div>
        
        <div className="flex gap-3 ml-6">
          <button
            onClick={() => setIsWeaknessHidden(!isWeaknessHidden)}
            className={`
              flex items-center gap-2 px-4 py-2 border-2 font-mono font-bold text-lg transition-all cursor-pointer
              ${isWeaknessHidden ? "border-[#ff0055] text-[#ff0055]" : "border-[#00ffff] text-[#00ffff]"}
              hover:opacity-80
            `}
          >
            {isWeaknessHidden ? <EyeOff size={20} /> : <Eye size={20} />}
            模拟隐藏弱点属性
          </button>
          <div className={`
            flex items-center gap-2 px-4 py-2 border-2 font-mono font-bold text-xl transition-all
            ${ap <= 5 ? "border-red-500 text-red-500 animate-pulse" : "border-[#00ffff] text-[#00ffff]"}
          `}>
            <Zap size={24} fill={ap <= 5 ? "currentColor" : "none"} />
            {ap} AP
          </div>
        </div>
      </div>

      {/* --- 中央交互区：Boss 问题 & 回复 --- */}
      <div className="relative z-20 flex-1 flex items-center justify-between px-10 min-h-[250px]">
        
        {/* 左侧：Boss 问题 */}
        <AnimatePresence mode="wait">
          {activeStatement && (
            <div className="relative w-[45%]">
              {/* 弱点锁定 HUD - 置于气泡上方 */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-16 left-0 flex items-center gap-3 px-4 py-3 bg-black/90 backdrop-blur border border-[#00ffff]/50 rounded-lg shadow-lg"
              >
                <div className="text-[#00ffff] font-mono text-xl font-bold">弱点:</div>
                {/* 属性锁 */}
                {(() => {
                  const typeConfig = CARD_TYPES.find(t => t.type === activeStatement.weakness.type);
                  return (
                    <div 
                      className={`flex items-center justify-center w-10 h-10 rounded border-2 ${typeConfig?.borderColor} ${typeConfig?.color} transition-all ${isWeaknessHidden ? 'blur-xl grayscale opacity-40 scale-110' : ''}`}
                      title={typeConfig?.label}
                    >
                      <span className="text-2xl">{typeConfig?.icon}</span>
                    </div>
                  );
                })()}
                
                {/* 点数锁 */}
                <div className="flex items-center justify-center w-10 h-10 rounded border-2 border-[#ff0055] bg-black">
                  <span className="text-[#ff0055] font-black text-2xl">{activeStatement.weakness.targetPoint}</span>
                </div>
              </motion.div>
              
              {/* Boss 问题气泡 */}
              <motion.div
                key={activeStatement.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="relative p-8 bg-black/80 backdrop-blur border-l-4 border-[#00ffff] transition-all duration-200"
              >
                <p className="text-white font-mono text-3xl md:text-4xl leading-tight mb-4">
                  "{activeStatement.text}"
                </p>
                
                {/* HP 条 */}
                <div className="h-2 w-full bg-gray-800">
                  <div 
                    className="h-full transition-all duration-300 bg-[#00ffff]" 
                    style={{ width: `${(activeStatement.hp / activeStatement.maxHp) * 100}%` }} 
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 右侧：Boss 回复 */}
        <div className="w-[45%] flex justify-end">
          <AnimatePresence>
            {bossReply && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="relative p-8 bg-black/90 border-r-4 border-[#ff0055] shadow-[0_0_50px_rgba(255,0,85,0.2)] animate-pop-in"
              >
                <div className="flex items-center justify-end gap-2 mb-3">
                  <span className="text-[#ff0055] font-mono text-xl font-bold">BOSS</span>
                  <AlertTriangle size={28} className="text-[#ff0055]" />
                </div>
                <div className="text-white font-mono text-3xl leading-tight text-right">
                  "{bossReply}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- 底部操作区 (卡牌 + 选项) --- */}
      <div className="relative z-20 p-6 flex-shrink-0">
        <div className="flex justify-center items-center gap-8">
          
          {/* 左侧：当前卡牌 */}
          {currentCard && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id}
                initial={{ x: -100, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -100, opacity: 0, scale: 0.8 }}
                className={`
                  relative w-52 h-72 rounded-xl border-4 ${currentCard.borderColor} 
                  bg-gradient-to-br ${currentCard.color} shadow-2xl
                  flex flex-col items-center justify-between p-4
                `}
              >
                {/* 稀有度标签 */}
                <div className="absolute -top-3 -right-3 bg-black border-2 border-white rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-black text-sm">{currentCard.rarity}</span>
                </div>
                
                {/* 角色立绘 */}
                <div className="mt-4">
                  {cardCharacter.icon}
                </div>
                
                {/* 多属性图标（合并同类项） */}
                <div className="flex gap-3 flex-wrap justify-center items-center">
                  {(() => {
                    // 统计每个类型的数量
                    const typeCounts = new Map<CardType, number>();
                    currentCard.types.forEach(type => {
                      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
                    });
                    
                    // 渲染统计结果
                    return Array.from(typeCounts.entries()).map(([type, count]) => {
                      const typeConfig = CARD_TYPES.find(t => t.type === type);
                      return (
                        <div key={type} className="flex items-center gap-1" title={typeConfig?.label}>
                          <span className="text-3xl">{typeConfig?.icon}</span>
                          <span className="text-white font-bold text-xl">x{count}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
                
                {/* 骰子数量 */}
                <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
                  <Dices size={20} className="text-white" />
                  <span className="text-white font-bold text-lg">x{currentCard.diceCount}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
          
          {/* 右侧：选项气泡 */}
          <div className="flex flex-col gap-3">
            {[currentOptions[0], currentOptions[1], currentOptions[2]].map((opt, idx) => (
              opt && (
                <OptionBubble 
                  key={opt.id}
                  option={opt} 
                  onClick={(e) => handleOptionSelect(opt, e)}
                  disabled={isActing}
                  index={idx}
                />
              )
            ))}
          </div>
          
        </div>
      </div>

      {/* --- 骰子动画层 --- */}
      <AnimatePresence>
        {showDice && activeStatement && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="flex gap-4">
              {diceRolls.map((roll, i) => {
                // 检查这个骰子是否命中目标点数
                const isHit = roll === activeStatement.weakness.targetPoint;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ y: -50, rotateX: 180 }}
                    animate={{ y: 0, rotateX: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`
                      w-28 h-28 rounded-lg flex items-center justify-center text-6xl font-black shadow-lg
                      ${isHit 
                        ? 'bg-[#ff0055] border-4 border-[#39ff14] text-white shadow-[0_0_40px_rgba(57,255,20,0.8)] animate-pulse' 
                        : 'bg-black border-2 border-[#ff0055] text-[#ff0055] shadow-[0_0_30px_rgba(255,0,85,0.6)]'
                      }
                    `}
                  >
                    {roll}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 全屏 Break 反馈 --- */}
      <AnimatePresence>
        {feedback.visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-8 text-center"
          >
            <div className="border-y-4 border-[#39ff14] py-12 w-full bg-black">
              <h3 className="text-[#39ff14] font-mono text-5xl mb-6 glitch-text" data-text="BREAK!">BREAK!</h3>
              <p className="text-white font-mono text-3xl font-bold leading-relaxed">{feedback.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}

// 子组件：选项气泡
function OptionBubble({ option, onClick, disabled, index }: { option: Option, onClick: (e:React.MouseEvent)=>void, disabled: boolean, index: number }) {
  // 获取属性图标
  const getTypeIcon = (type: CardType): string => {
    const typeConfig = CARD_TYPES.find(t => t.type === type);
    return typeConfig?.icon || "💬";
  };

  return (
    <motion.button
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, x: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative max-w-md px-6 py-4 cursor-pointer
        bg-black/90 border-2 border-gray-700 rounded-2xl
        hover:border-[#00ffff] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]
        transition-all group disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <div className="text-white text-lg font-mono text-left leading-relaxed flex items-start gap-2">
        <span className="text-2xl flex-shrink-0">{getTypeIcon(option.type)}</span>
        <span className="flex-1">{option.text}</span>
      </div>
      
      {/* 气泡尖角 */}
      <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 
        border-t-8 border-t-transparent 
        border-r-8 border-r-gray-700 
        border-b-8 border-b-transparent
        group-hover:border-r-[#00ffff]
        transition-colors
      "></div>
    </motion.button>
  )
}