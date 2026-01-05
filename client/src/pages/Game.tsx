import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gameConfig, CARD_TYPES, Statement, GENERAL_RESPONSES, CardConfig } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RefreshCw, Zap, Dices, AlertTriangle, Target } from "lucide-react";

// --- Types ---
interface PlayableCard extends CardConfig {
  id: string;
  text: string;
  isWeakness: boolean;
  isFiller: boolean;
  damageTier: "PERFECT" | "NORMAL" | "BAD"; 
}

// Fixed Dice Faces
const DICE_FACES = [1, 2, 3, 4, 5, 6];

// --- Deck Logic ---
const buildDeckForStatement = (statement: Statement): PlayableCard[] => {
  const deck: PlayableCard[] = [];
  const usedTexts = new Set<string>();

  const addCard = (config: CardConfig, text: string, tier: "PERFECT" | "NORMAL" | "BAD", isWeakness: boolean, isFiller: boolean) => {
    if (!usedTexts.has(text)) {
      deck.push({
        ...config,
        id: Math.random().toString(36).substr(2, 9),
        text,
        isWeakness,
        isFiller,
        damageTier: tier
      });
      usedTexts.add(text);
    }
  };

  statement.weaknessTypes.forEach(type => {
    const variants = statement.interactions?.[type];
    const config = CARD_TYPES.find(c => c.type === type);
    if (config && Array.isArray(variants)) {
      variants.forEach(v => addCard(config, v.player, "PERFECT", true, false));
    }
  });

  const allInteractionTypes = Object.keys(statement.interactions || {}) as any[];
  const normalTypes = allInteractionTypes.filter(t => !statement.weaknessTypes.includes(t));
  normalTypes.forEach(type => {
    const variants = statement.interactions?.[type as keyof typeof statement.interactions];
    const config = CARD_TYPES.find(c => c.type === type);
    if (config && Array.isArray(variants)) {
      variants.forEach(v => addCard(config, v.player, "NORMAL", false, false));
    }
  });

  let safety = 0;
  while (deck.length < 16 && safety < 100) {
    safety++;
    const randomTypeConfig = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
    const pool = GENERAL_RESPONSES[randomTypeConfig.type];
    const randomText = pool[Math.floor(Math.random() * pool.length)];
    addCard(randomTypeConfig, randomText, "BAD", false, true);
  }

  return deck.sort(() => 0.5 - Math.random());
};

export default function Game() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [bossHP, setBossHP] = useState(gameConfig.initialBossHP);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [activeStatementIndex, setActiveStatementIndex] = useState(0);
  
  // FIX: Increased Initial AP to 30
  const [ap, setAp] = useState(30);
  const [refreshCount, setRefreshCount] = useState(3);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");

  const [targetDice, setTargetDice] = useState<number>(1);
  const [drawPile, setDrawPile] = useState<PlayableCard[]>([]);
  const [hand, setHand] = useState<PlayableCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [playerRollVisual, setPlayerRollVisual] = useState(1);
  
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  
  const [feedback, setFeedback] = useState<{ text: string; visible: boolean }>({ text: "", visible: false });
  const [floatingText, setFloatingText] = useState<{ id: string; text: string; x: number; y: number; color: string; sizeClass: string; label: string }[]>([]);
  const [dialogue, setDialogue] = useState<{ boss: string; visible: boolean } | null>(null);

  const currentPhase = gameConfig.phases[currentPhaseIndex];
  const activeStatement = statements[activeStatementIndex];

  useEffect(() => {
    if (currentPhase) {
      setStatements(JSON.parse(JSON.stringify(currentPhase.statements)));
      setActiveStatementIndex(0); 
    }
  }, [currentPhaseIndex]);

  useEffect(() => {
    if (activeStatement) {
      const newDeck = buildDeckForStatement(activeStatement);
      setHand(newDeck.slice(0, 4));
      setDrawPile(newDeck.slice(4));
      setTargetDice(Math.floor(Math.random() * 6) + 1);
      setSelectedCard(null);
    }
  }, [activeStatement?.id]); 

  const handleManualRefresh = () => {
    if (gameState !== "playing" || refreshCount <= 0 || ap <= 0 || isRolling || showResult) return;
    setAp(p => p - 1);
    setRefreshCount(p => p - 1);
    const combined = [...drawPile, ...hand].sort(() => 0.5 - Math.random());
    setHand(combined.slice(0, 4));
    setDrawPile(combined.slice(4));
    setSelectedCard(null);
    toast.info("手牌已重置");
  };

  const handleCardSelect = (cardId: string) => {
    if (gameState !== "playing" || isRolling || showResult) return;
    setSelectedCard(prev => prev === cardId ? null : cardId);
  };

  const handleAttackTarget = (e: React.MouseEvent) => {
    if (gameState !== "playing" || !selectedCard || ap <= 0 || isRolling || showResult) return;

    setIsRolling(true);
    const interval = setInterval(() => {
      setPlayerRollVisual(Math.floor(Math.random() * 6) + 1);
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      const finalRoll = Math.floor(Math.random() * 6) + 1;
      setPlayerRollVisual(finalRoll);
      
      setIsRolling(false);
      setShowResult(true);

      setTimeout(() => {
        setShowResult(false);
        // 延迟一点让骰子完全消失后再显示伤害值
        setTimeout(() => {
          // 使用屏幕中央位置显示伤害值
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          resolveAttack(selectedCard, centerX, centerY, finalRoll);
        }, 300);
      }, 800); 

    }, 600);
  };

  const resolveAttack = (cardId: string, x: number, y: number, finalRoll: number) => {
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    setAp(p => p - 1);

    let damage = 5; 
    let damageType = "BAD";
    if (card.damageTier === "NORMAL") { damage = 15; damageType = "NORMAL"; }
    if (card.damageTier === "PERFECT") { damage = 30; damageType = "PERFECT"; }

    const isCrit = finalRoll === targetDice;
    if (isCrit) {
      damage = Math.floor(damage * 1.5);
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }

    // FIX: Shake ONLY on Crit
    if (isCrit) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    const newStatements = [...statements];
    const stmt = newStatements[activeStatementIndex];
    stmt.hp = Math.max(0, stmt.hp - damage);
    setStatements(newStatements);

    // Text Styling - 放大所有尺寸
    let color = "#aaaaaa"; 
    let sizeClass = "text-3xl";
    let label = "MISS";

    if (damageType === "NORMAL") { 
      color = "#00ffff"; 
      sizeClass = "text-5xl"; 
      label = "HIT";
    }
    if (damageType === "PERFECT") { 
      color = "#39ff14"; 
      sizeClass = "text-6xl"; 
      label = "PERFECT";
    }
    if (isCrit) { 
      color = "#ff0055"; 
      sizeClass = "text-8xl"; // 超大
      label = "CRIT x1.5";
    }

    addFloatingText(label, `-${damage}`, x, y, color, sizeClass);

    // Boss Reply
    let bossReply = "...";
    const interactions = activeStatement.interactions?.[card.type as keyof typeof activeStatement.interactions];
    if (Array.isArray(interactions)) {
      const match = interactions.find(i => i.player === card.text);
      bossReply = match ? match.boss : interactions[0].boss;
    }
    setDialogue({ boss: bossReply, visible: true });

    // Cycle Deck
    const remainingHand = hand.filter(c => c.id !== cardId);
    const newPool = [...drawPile, ...remainingHand].sort(() => 0.5 - Math.random());
    setHand(newPool.slice(0, 4));
    setDrawPile(newPool.slice(4));
    setSelectedCard(null);

    setTimeout(() => setDialogue(null), 3000);

    if (stmt.hp <= 0) {
      setTimeout(() => {
        setFeedback({ text: activeStatement.breakFeedback, visible: true });
        setBossHP(Math.max(0, bossHP - 8)); 
        setTimeout(() => {
          setFeedback({ text: "", visible: false });
          if (activeStatementIndex < statements.length - 1) setActiveStatementIndex(p => p + 1);
          else if (currentPhaseIndex < gameConfig.phases.length - 1) setCurrentPhaseIndex(p => p + 1);
          else setGameState("won");
        }, 2500);
      }, 1000);
    } else if (ap - 1 <= 0) {
       setTimeout(() => setGameState("lost"), 1000);
    }
  };

  const addFloatingText = (label: string, text: string, x: number, y: number, color: string, sizeClass: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setFloatingText((prev) => [...prev, { id, text, x, y, color, sizeClass, label }]);
    // 延长显示时间到2.5秒
    setTimeout(() => setFloatingText((prev) => prev.filter((ft) => ft.id !== id)), 2500);
  };

  if (gameState === "lost") return <div className="min-h-screen bg-black text-red-600 font-press-start flex items-center justify-center text-4xl">FAIL</div>;
  if (gameState === "won") return <div className="min-h-screen bg-black text-[#39ff14] font-press-start flex items-center justify-center text-4xl">VICTORY</div>;

  return (
    <div className={`flex items-center justify-center min-h-screen bg-[#050505] p-4 font-sans select-none overflow-hidden ${flash ? "animate-flash" : ""}`}>
      
      <div className={`relative w-full max-w-[900px] aspect-video bg-black border-2 border-[#333] shadow-2xl overflow-hidden rounded-lg ${shake ? "animate-shake" : ""}`}>
        
        {/* 伤害值显示在中间靠右位置（两个气泡之间），不移动，只淡入淡出 */}
        {floatingText.map((ft) => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute pointer-events-none z-[100] font-press-start drop-shadow-[0_6px_0_#000] flex flex-col items-center ${ft.sizeClass}`}
            style={{ color: ft.color, left: "60%", top: "32%", transform: "translate(-50%, -50%)" }}
          >
            <span className="text-lg opacity-90 mb-2">{ft.label}</span>
            <span className="font-bold">{ft.text}</span>
          </motion.div>
        ))}
        
        {/* BG Layers */}
        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/images/background.png')" }} />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%)] z-10 bg-[length:100%_2px]" />

        {/* --- Top HUD --- */}
        <div className="relative z-20 flex justify-between items-start p-4">
          <div className="w-1/3">
             <div className="flex justify-between text-[10px] text-[#b026ff] mb-1 font-press-start">
               <span>BOSS</span>
               <span>{bossHP}%</span>
             </div>
             <Progress value={bossHP} className="h-2 bg-gray-900 border border-[#b026ff]/50 [&>div]:bg-[#b026ff]" />
          </div>
          <div className="flex-1 text-center px-2">
             <h2 className="text-[#39ff14] text-[10px] md:text-xs font-press-start truncate">{currentPhase?.title}</h2>
             {/* 论题进度条 */}
             <div className="flex justify-center items-center gap-1 mt-2">
               {statements.map((_, index) => (
                 <div
                   key={index}
                   className={`h-1.5 flex-1 max-w-[40px] rounded-sm transition-all duration-300 ${
                     index <= activeStatementIndex
                       ? "bg-[#00ffff] animate-pulse-subtle"
                       : "bg-gray-800 border border-gray-700"
                   }`}
                   style={
                     index <= activeStatementIndex
                       ? { boxShadow: "0 0 6px rgba(0, 255, 255, 0.4)" }
                       : undefined
                   }
                 />
               ))}
             </div>
          </div>
          <div className="w-1/4 flex justify-end">
            <div className={`
              flex items-center gap-2 px-3 py-1 border-2 font-mono font-bold text-lg transition-all
              ${ap <= 5 ? "border-red-500 text-red-500 animate-pulse" : "border-[#00ffff] text-[#00ffff]"}
            `}>
              <Zap size={16} fill={ap <= 5 ? "currentColor" : "none"} />
              {ap} AP
            </div>
          </div>
        </div>

        {/* --- Middle: Split Layout --- */}
        <div className="relative z-20 flex-1 flex items-center justify-between px-8 min-h-[200px]">
          
          {/* Left: Active Statement (Target) */}
          <AnimatePresence mode="wait">
            {activeStatement && (
              <motion.div
                key={activeStatement.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                onClick={handleAttackTarget}
                className={`
                  relative w-[45%] p-6 bg-black/80 backdrop-blur border-l-4 cursor-pointer
                  transition-all duration-200 group hover:bg-black/90
                  ${selectedCard ? "ring-2 ring-[#ff0055] shadow-[0_0_30px_rgba(255,0,85,0.3)]" : "opacity-80"}
                `}
                style={{ borderLeftColor: activeStatement.hp < 20 ? "#ff0055" : "#00ffff" }}
              >
                {/* Target Icon Hint */}
                {selectedCard && !isRolling && !showResult && (
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[#ff0055] animate-pulse">
                    <Target size={32} />
                  </div>
                )}

                <p className="text-white font-mono text-sm md:text-base leading-relaxed">
                  "{activeStatement.text}"
                </p>
                <div className="mt-3 h-1 w-full bg-gray-800">
                  <div className="h-full transition-all duration-300 bg-[#00ffff]" style={{ width: `${(activeStatement.hp / activeStatement.maxHp) * 100}%` }} />
                </div>
                
                <div className="absolute -top-6 left-0 flex items-center gap-1 text-[#ff0055] font-press-start text-xs animate-pulse">
                  <Dices size={14} />
                  <span>WEAK: {targetDice}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: Boss Response */}
          <div className="w-[45%] flex justify-end">
            <AnimatePresence>
              {dialogue && dialogue.visible && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  className="relative p-6 bg-black/90 border-r-4 border-[#ff0055] shadow-[0_0_50px_rgba(255,0,85,0.2)] animate-pop-in"
                >
                   <div className="flex items-center justify-end gap-2 mb-2">
                     <span className="text-[#ff0055] font-press-start text-xs">BOSS</span>
                     <AlertTriangle size={16} className="text-[#ff0055]" />
                   </div>
                   <div className="text-white font-mono text-lg leading-relaxed text-right">
                     "{dialogue.boss}"
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* --- Dice Rolling Overlay (Center) - 缩小尺寸 --- */}
        <AnimatePresence>
          {(isRolling || showResult) && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className={`
                w-20 h-20 bg-black border-3 border-[#ff0055] rounded-lg flex items-center justify-center
                text-4xl text-[#ff0055] font-press-start shadow-[0_0_30px_rgba(255,0,85,0.6)]
                ${isRolling ? "dice-rolling" : "scale-110"}
              `}>
                {playerRollVisual}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Bottom: Hand --- */}
        <div className="relative z-20 p-4">
          <div className="flex justify-center items-end gap-2 h-[140px]">
            
            <div className="mr-4 flex flex-col justify-end pb-2">
               <Button 
                 onClick={handleManualRefresh} 
                 disabled={refreshCount <= 0 || ap <= 0 || isRolling || showResult}
                 variant="outline" 
                 className="h-12 w-12 rounded-full border-2 border-white bg-black hover:bg-white hover:text-black transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-30"
               >
                 <RefreshCw size={16} />
               </Button>
               <span className="text-[9px] text-center text-gray-500 mt-1 font-mono">{refreshCount} LEFT</span>
            </div>

            <AnimatePresence>
              {hand.map((card, index) => {
                 return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ 
                      y: selectedCard === card.id ? -40 : 0, 
                      scale: selectedCard === card.id ? 1.1 : 1,
                      opacity: 1, 
                      rotate: (index - (hand.length/2)) * 3 
                    }}
                    exit={{ y: 50, opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -20, scale: 1.05, zIndex: 50 }}
                    onClick={() => handleCardSelect(card.id)}
                    className={`
                      w-24 h-36 flex-shrink-0 cursor-pointer rounded-lg border-2 
                      flex flex-col items-center justify-between p-2 shadow-lg transition-all duration-200 bg-black
                      ${selectedCard === card.id ? "border-[#ff0055] shadow-[0_0_20px_#ff0055] z-50" : "border-gray-800 opacity-90"}
                      ${card.color.replace('bg-', 'hover:bg-').replace('border-', 'hover:border-')}
                    `}
                  >
                    <div className="text-2xl mt-1">{card.icon}</div>
                    <div className="text-[9px] text-white text-center font-mono leading-tight line-clamp-3 h-12 flex items-center justify-center opacity-80">
                      {card.text}
                    </div>
                    <div className="text-[8px] text-white/40 text-center font-press-start uppercase tracking-wider">
                      {card.label}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Overlays --- */}
        
        <AnimatePresence>
          {feedback.visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-8 text-center"
            >
              <div className="border-y-4 border-[#39ff14] py-8 w-full bg-black">
                <h3 className="text-[#39ff14] font-press-start text-2xl mb-4 glitch-text" data-text="BREAK!">BREAK!</h3>
                <p className="text-white font-mono text-xl">{feedback.text}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
