// 文件路径: src/lib/gameData.ts

export type CardType = "Threat" | "Mockery" | "Questioning" | "Logic" | "Empathy" | "Deceit";
export type Rarity = "R" | "SR" | "SSR";

export interface CardConfig {
  type: CardType;
  label: string;
  color: string; // Tailwind class for background
  icon: string;
  borderColor: string;
}

export interface PlayableCard {
  id: string;
  rarity: Rarity;
  types: CardType[]; // 支持多个属性
  diceCount: number; // 这张卡能扔几个骰子，等于 types.length
  characterId: "purple_fox" | "green_face" | "red_man"; // 角色归属
  label: string;
  icon: string;
  color: string;
  borderColor: string;
}

export interface Interaction {
  player: string;
  boss: string;
}

export interface WeaknessRequirement {
  type: CardType;
  count: number; // 需要几个骰子命中才能BREAK
  targetPoint: number; // 目标点数 (1-6)
}

export interface Statement {
  id: string;
  text: string;
  hp: number;
  maxHp: number;
  weakness: WeaknessRequirement; // 核心改动：弱点现在需要具体的骰子数量
  breakFeedback: string;
  interactions: Partial<Record<CardType, Interaction[]>>; 
}

export interface GamePhase {
  id: number;
  title: string;
  description: string;
  statements: Statement[];
}

// 基础卡牌配置
export const CARD_TYPES: CardConfig[] = [
  { type: "Threat", label: "威胁", icon: "⚔️", color: "bg-red-950", borderColor: "border-red-600" },
  { type: "Mockery", label: "嘲讽", icon: "🤡", color: "bg-purple-950", borderColor: "border-purple-600" },
  { type: "Questioning", label: "质疑", icon: "❓", color: "bg-blue-950", borderColor: "border-blue-600" },
  { type: "Logic", label: "逻辑", icon: "🧠", color: "bg-cyan-950", borderColor: "border-cyan-600" },
  { type: "Empathy", label: "共情", icon: "❤️", color: "bg-pink-950", borderColor: "border-pink-600" },
  { type: "Deceit", label: "追问", icon: "🎭", color: "bg-green-950", borderColor: "border-green-600" },
];

// 稀有度配置：决定骰子数量
export const RARITY_CONFIG: Record<Rarity, { dice: number; validOptionWeight: number; label: string }> = {
  "R": { dice: 1, validOptionWeight: 1, label: "混乱思维" },    // 1个骰子，1个真话，2个废话
  "SR": { dice: 2, validOptionWeight: 2, label: "清晰思维" },   // 2个骰子，2个真话，1个废话
  "SSR": { dice: 3, validOptionWeight: 3, label: "绝对灵感" }   // 3个骰子，3个真话
};

// 按属性分类的干扰项池（废话库）
export const FILLER_OPTIONS: Record<CardType, string[]> = {
  "Threat": [
    "你给我等着...",
    "别逼我发火。",
    "后果自负。",
    "你最好想清楚。",
    "这拳头可不长眼。",
    "我数到三。"
  ],
  "Mockery": [
    "就这？",
    "这就很尴尬了。",
    "别逗我笑了。",
    "演得不错。",
    "真是有趣的笑话。",
    "你是在表演吗？"
  ],
  "Questioning": [
    "是吗？",
    "我不这么认为。",
    "你有证据吗？",
    "这解释不通。",
    "真的如此吗？",
    "这就奇怪了。"
  ],
  "Logic": [
    "从理论上讲...",
    "这不合逻辑。",
    "让我们理性分析。",
    "数据不会说谎。",
    "这里有个矛盾。",
    "根据过往经验..."
  ],
  "Empathy": [
    "我能理解。",
    "也许你是对的。",
    "别太难过。",
    "我感同身受。",
    "慢慢来，别急。",
    "我知道这很难。"
  ],
  "Deceit": [
    "那个...",
    "让我想想。",
    "我忘记了。",
    "换个话题吧。",
    "其实...",
    "也许吧..."
  ]
};

// 固定卡池：12 张卡牌
export const INITIAL_DECK: PlayableCard[] = [
  // === 角色1：紫狐狸 (Purple Fox) - 压迫者风格 ===
  {
    id: "purple_fox_ssr",
    rarity: "SSR",
    types: ["Threat", "Threat", "Threat"],
    diceCount: 3,
    characterId: "purple_fox",
    label: "绝对压制",
    icon: "⚔️",
    color: "bg-purple-950",
    borderColor: "border-purple-600"
  },
  {
    id: "purple_fox_sr",
    rarity: "SR",
    types: ["Questioning", "Questioning"],
    diceCount: 2,
    characterId: "purple_fox",
    label: "灵魂拷问",
    icon: "❓",
    color: "bg-purple-950",
    borderColor: "border-purple-600"
  },
  {
    id: "purple_fox_r1",
    rarity: "R",
    types: ["Threat"],
    diceCount: 1,
    characterId: "purple_fox",
    label: "威胁",
    icon: "⚔️",
    color: "bg-purple-950",
    borderColor: "border-purple-600"
  },
  {
    id: "purple_fox_r2",
    rarity: "R",
    types: ["Questioning"],
    diceCount: 1,
    characterId: "purple_fox",
    label: "质疑",
    icon: "❓",
    color: "bg-purple-950",
    borderColor: "border-purple-600"
  },

  // === 角色2：绿双面 (Green Face) - 破局者风格 ===
  {
    id: "green_face_ssr",
    rarity: "SSR",
    types: ["Logic", "Logic", "Empathy"],
    diceCount: 3,
    characterId: "green_face",
    label: "理性面具",
    icon: "🧠",
    color: "bg-emerald-950",
    borderColor: "border-emerald-600"
  },
  {
    id: "green_face_sr",
    rarity: "SR",
    types: ["Empathy", "Empathy"],
    diceCount: 2,
    characterId: "green_face",
    label: "虚伪共鸣",
    icon: "❤️",
    color: "bg-emerald-950",
    borderColor: "border-emerald-600"
  },
  {
    id: "green_face_r1",
    rarity: "R",
    types: ["Logic"],
    diceCount: 1,
    characterId: "green_face",
    label: "逻辑",
    icon: "🧠",
    color: "bg-emerald-950",
    borderColor: "border-emerald-600"
  },
  {
    id: "green_face_r2",
    rarity: "R",
    types: ["Threat"],
    diceCount: 1,
    characterId: "green_face",
    label: "冷眼",
    icon: "⚔️",
    color: "bg-emerald-950",
    borderColor: "border-emerald-600"
  },

  // === 角色3：红发男 (Red Man) - 搅局者风格 ===
  {
    id: "red_man_ssr",
    rarity: "SSR",
    types: ["Deceit", "Deceit", "Mockery"],
    diceCount: 3,
    characterId: "red_man",
    label: "狂笑之徒",
    icon: "🎭",
    color: "bg-red-950",
    borderColor: "border-red-600"
  },
  {
    id: "red_man_sr",
    rarity: "SR",
    types: ["Mockery", "Mockery"],
    diceCount: 2,
    characterId: "red_man",
    label: "无情嘲弄",
    icon: "🤡",
    color: "bg-red-950",
    borderColor: "border-red-600"
  },
  {
    id: "red_man_r1",
    rarity: "R",
    types: ["Deceit"],
    diceCount: 1,
    characterId: "red_man",
    label: "追问",
    icon: "🎭",
    color: "bg-red-950",
    borderColor: "border-red-600"
  },
  {
    id: "red_man_r2",
    rarity: "R",
    types: ["Logic"],
    diceCount: 1,
    characterId: "red_man",
    label: "诡辩",
    icon: "🧠",
    color: "bg-red-950",
    borderColor: "border-red-600"
  }
];

// 游戏关卡数据（完整 3 阶段 / 11 关）
export const gameConfig = {
  initialBossHP: 100,
  phases: [
    // --- Phase 1 ---
    {
      id: 1,
      title: "目标：让蝉羽回想起当年做了什么",
      description: "Step 1: What", 
      statements: [
        {
          id: "p1_s1",
          text: "太久的事情想不起来了。",
          hp: 40, maxHp: 40,
          // 难度设定：入门 (1个骰子即可Break)
          weakness: { type: "Threat", count: 1, targetPoint: 4 }, 
          breakFeedback: "BOSS：我想起来了... 这个烂地儿大家都这样。",
          interactions: {
            "Threat": [
              { player: "那我请鹰头来审问你一次。", boss: "...." },
              { player: "断翅之痛，也忘了吗？", boss: "闭嘴。" },
              { player: "我有100种办法让你瞬间清醒。", boss: "……哼。" },
              { player: "我最爱揍装傻充愣的人。", boss: "你试试？" }
            ],
            "Questioning": [
              { player: "告发朋友的事情，你忘记了吗？", boss: "我没有朋友" },
              { player: "是忘了，还是不敢想起？", boss: "……" },
              { player: "不会是选择性失忆吧？", boss: "……别胡咧咧。" },
              { player: "那为什么你还握着设计图？", boss: "（手中图纸火焰猛涨）……你！" }
            ],
            "Mockery": [{ player: "鸟的记忆只有3秒吗？", boss: "是的，你刚才问了什么？" }],
            "Logic": [{ player: "怎么可能想不起来？", boss: "因为不重要了" }],
            "Deceit": [{ player: "我知道你做了伤害别人的事", boss: "我从来没做过" }],
            "Empathy": [{ player: "我很想帮助你，因为我知道，那件事也是你的心结", boss: "别自作多情" }]
          }
        },
        {
          id: "p1_s2",
          text: "我当年是告发了他，但那不是小孩经常做的蠢事吗？",
          hp: 40, maxHp: 40,
          // 难度设定：简单 (需要1个骰子)
          weakness: { type: "Logic", count: 1, targetPoint: 3 }, 
          breakFeedback: "BOSS：难道我做错了吗？",
          interactions: {
            "Questioning": [
              { player: "哪家小孩犯蠢，能把朋友坑进大牢十年？", boss: "十年而已，妖命那么长..." },
              { player: "用朋友的自由换自己令牌，这叫蠢？", boss: "你懂什么？！" },
              { player: "哪个孩子会拿朋友祭天？", boss: "……（捏紧特赦令）" },
              { player: "这\"蠢事\"的代价，你可付了一分？", boss: "……（气势一滞）" }
            ],
            "Logic": [
              { player: "你不仅是告发，你还说了谎，栽赃别人", boss: "小孩子不就是老爱说谎吗？" },
              { player: "对别人来说是蠢事，对你来说可是绝顶聪明的买卖。", boss: "……（捏紧特赦令）" },
              { player: "你不光告发，还把自己摘干净，简直是神童啊！", boss: "..." },
              { player: "你这是给人家置于死地啊，不是蠢是坏！", boss: "..." }
            ],
            "Threat": [{ player: "信不信再让鹰头打你一顿？", boss: "你就这一招吗？" }],
            "Mockery": [{ player: "你不就是因为那件事，混成这副德行", boss: "你能让我混的更好？" }],
            "Deceit": [{ player: "展开讲讲有多蠢？", boss: "……以你的智商听不懂。" }],
            "Empathy": [{ player: "当时是不是有什么迫不得已的原因", boss: "你想多了。" }]
          }
        },
        {
          id: "p1_s3",
          text: "我当时就是一个小孩儿，被威胁了还能怎么办？",
          hp: 40, maxHp: 40,
          // 难度设定：普通 (需要2个骰子，R卡无法Break，需要SR)
          weakness: { type: "Questioning", count: 2, targetPoint: 5 }, 
          breakFeedback: "BOSS：我承认没有严刑拷打，但我没栽赃！",
          interactions: {
            "Questioning": [
              { player: "他怎么威胁你的？是上了酷刑还是差点杀了你？", boss: "……我受到了精神折磨。" },
              { player: "被人威胁就要转手把朋友卖了？", boss: "我也是被逼的。" },
              { player: "不会是有人跟你吼两句你就怕了吧？", boss: "站着说话不腰疼。" },
              { player: "你到底是怎么被威胁的？", boss: "过程不想再回忆。" }
            ],
            "Logic": [
              { player: "你到底是被威胁还是主动进行了某些交易？", boss: "我没有！" },
              { player: "也有小孩选择沉默和一起承担。", boss: "（不屑）一起承担一起上路？" },
              { player: "威胁了可以认罪，用不着栽赃朋友！", boss: "我没有！他本来就参与了！" },
              { player: "事到如今还在装小孩儿？小孩儿都替你丢脸！", boss: "随你怎么说。" }
            ],
            "Threat": [{ player: "你这种满嘴谎话的小孩就欠揍", boss: "来来来，打我呀" }],
            "Mockery": [{ player: "你可以像刚才一样装失忆呀，不是很擅长么？", boss: "你要这么说可就没意思了" }],
            "Deceit": [{ player: "有时候说出来也是一种释怀", boss: "我不需要" }],
            "Empathy": [{ player: "我小时候也做过蠢事，现在也无法原谅自己", boss: "少来这套" }]
          }
        },
        {
          id: "p1_s4",
          text: "我只是在大家面前说了事实，谁让他那么想离开……",
          hp: 40, maxHp: 40,
          // 难度设定：普通 (需要2个骰子)
          weakness: { type: "Deceit", count: 2, targetPoint: 6 }, 
          breakFeedback: "BOSS：我的确卖了他，谁让他参与了",
          interactions: {
            "Logic": [
              { player: "那为什么你能全身而退？朋友却被关了10年？", boss: "鹰头看我态度良好……" },
              { player: "你也参与了，那为什么能毫发无伤的离开？", boss: "我运气好一点点吧。" },
              { player: "\"事实\"是你编了一个好剧本，字字诛心。", boss: "狐狸才是最能编故事的吧。" },
              { player: "他想离开？是你怂恿他离开的吧？", boss: "……（捏紧图纸）" }
            ],
            "Deceit": [
              { player: "是你想离开？还是他想离开？", boss: "你到底要干什么？" },
              { player: "你在大家面前说了什么？能再说一遍吗？", boss: "我记不得了。" },
              { player: "你记得你说了所谓的\"事实\"后他的表情吗？", boss: "我记不起来了。" },
              { player: "这些年你就是这么说服自己的吗？", boss: "我不知道你在说什么。" }
            ],
            "Threat": [{ player: "你不怕小狐狸趁你熟睡咬断你的脖子么？", boss: "我皮很糙，咬不动……" }],
            "Mockery": [{ player: "谎话说的这么淡定，在下真是佩服", boss: "别给脸不要脸" }],
            "Questioning": [{ player: "一开始最想飞走的不是你吗？设计图不是你画的吗？", boss: "……" }],
            "Empathy": [{ player: "我是来帮你的，如果你骗我，我就很难做到", boss: "你只是想替他讨回公道" }]
          }
        }
      ]
    },
    // --- Phase 2 ---
    {
      id: 2,
      title: "目标：为什么当年选择背叛、栽赃？",
      description: "Step 2: Why",
      statements: [
        {
          id: "p2_s1",
          text: "这个烂地儿大家都这样，再来一次我也只能这么选。",
          hp: 40, maxHp: 40,
          // 难度设定：普通 (2骰子)
          weakness: { type: "Questioning", count: 2, targetPoint: 4 }, 
          breakFeedback: "BOSS：好吧，我承认，这就是我的选择。",
          interactions: {
            "Questioning": [
              { player: "大家为苟活背叛，也会像你这样被午夜梦回折磨？", boss: "我没有。" },
              { player: "是吗？小狐狸会\"这样\"选？", boss: "他也没机会了。" },
              { player: "\"大家\"是谁？我看只有你吧。", boss: "你懂个屁。" },
              { player: "环境真的是原因吗？为什么大家都叫你背叛者？", boss: "你哪听来的？" }
            ],
            "Logic": [
              { player: "如果换你的朋友先背叛你，你会这么坦然吗？", boss: "……那我会认命。" },
              { player: "\"只能这么选\"，那你现在在痛苦什么？", boss: "我现在过得挺好。" },
              { player: "再来一次，你可捡不到这么好的机会逃走。", boss: "我没有逃。" },
              { player: "若\"都这样\"，岛上为何只剩下你的\"传说\"？", boss: "你都哪儿听来的。" }
            ],
            "Threat": [{ player: "再来一次，小狐狸见到你就给你炖了。", boss: "喝得有点多啊。" }],
            "Mockery": [{ player: "对，下次你跪得更快。", boss: "我不跟你掰扯！" }],
            "Deceit": [{ player: "也许吧，但你还是没有回答我为什么这么选。为什么？", boss: "你真是难缠啊。" }],
            "Empathy": [{ player: "我想，如果让你重新选择，你不会放弃朋友的，对吧？", boss: "我不知道。" }]
          }
        },
        {
          id: "p2_s2",
          text: "一个巴掌拍不响，他脑子里主意可多了。",
          hp: 40, maxHp: 40,
          weakness: { type: "Mockery", count: 2, targetPoint: 5 }, 
          breakFeedback: "BOSS：好吧，我当时确实很害怕",
          interactions: {
            "Mockery": [
              { player: "他真这么聪明的话，当初怎么没看出你怎么虚伪？", boss: "您别跟我抬杠。" },
              { player: "对，他最疯狂的主意就是信了你。", boss: "（恼羞成怒）你！" },
              { player: "对，跟懦夫一起逃跑还是很有勇气的。", boss: "我不是！" },
              { player: "一个巴掌？你递刀的手可真响。", boss: "（恼羞成怒）你！" }
            ],
            "Questioning": [
              { player: "那为什么鳄鱼说他做苦力全是为朋友的痴梦？", boss: "他……真这么说？" },
              { player: "他主意再多，可曾想过你会拿图纸当证物？", boss: "事情发生太快。" },
              { player: "主意多，所以活该替你蹲十年？", boss: "那是他们的规矩。" },
              { player: "那特赦令牌谁接的？", boss: "我走了更好，他也不想看到我。" }
            ],
            "Threat": [{ player: "信不信我现在给你脸上拍几个。", boss: "无能狂怒。" }],
            "Logic": [{ player: "你栽赃设计图是他画的，真新鲜，狐狸比鸟还懂飞行？", boss: "……" }],
            "Deceit": [{ player: "他确实有很多主意，但没有一个是\"背叛你\"，不是么？", boss: "……" }],
            "Empathy": [{ player: "你不需要掩饰，这么多年过去了，没有人在责怪你", boss: "……那他呢" }]
          }
        },
        {
          id: "p2_s3",
          text: "（嘶吼）我如果不答应，我明天就会死在那儿。",
          hp: 40, maxHp: 40,
          weakness: { type: "Empathy", count: 2, targetPoint: 3 }, 
          breakFeedback: "BOSS：好吧，我想出去，我想出去，为了自由，什么都可以牺牲，你满意了吧",
          interactions: {
            "Questioning": [
              { player: "你当时想的并不是如何活下来，而是如何出去！", boss: "能出去是最大的恩赐，谁不想？！" },
              { player: "你不是挺会交易的吗？除了朋友的命就没别的筹码？", boss: "……" },
              { player: "如果换做他告发你，你会原谅他吗？", boss: "……没发生的事儿我不知道。" },
              { player: "这话鹰头真说过？还是你找台阶就下？", boss: "……" }
            ],
            "Empathy": [
              { player: "你愤怒了，你到底在恨谁？", boss: "所有人！包括我自己。" },
              { player: "你很清楚他当时若知你会死，绝对不会袖手旁观。", boss: "……也许吧" },
              { player: "那时的恐惧一定很真实。", boss: "（低声）冰冷彻骨……" },
              { player: "怕死是本能，但用谁换命是选择。", boss: "（麻木）选？我有得选吗…" }
            ],
            "Threat": [{ player: "我明天就去问下鹰头，他是不是这么威胁你的。", boss: "别给我来这套。" }],
            "Mockery": [{ player: "对，但如果你答应了，就能让朋友死在那儿。", boss: "你这是找茬儿呢？" }],
            "Logic": [{ player: "所以朋友就是你能活的筹码？", boss: "他只是被关了十年。" }],
            "Deceit": [{ player: "这句话是谁说的？是你自欺欺人吧？", boss: "……" }]
          }
        }
      ]
    },
    // --- Phase 3 ---
    {
      id: 3,
      title: "目标：让蝉羽面对真正的自己",
      description: "Step 3: Who",
      statements: [
        {
          id: "p3_s1",
          text: "我指认他时太害怕了，大脑一片空白，什么都记不得了",
          hp: 40, maxHp: 40,
          // 难度设定：困难 (开始出现需要3个骰子，必须SSR或运气极好的情况，建议多试几次)
          weakness: { type: "Mockery", count: 2, targetPoint: 6 }, 
          breakFeedback: "BOSS：是！我对不起他，但我也很痛苦！",
          interactions: {
            "Mockery": [
              { player: "你当时证词说得很溜啊，每个人都能听清楚。", boss: "……" },
              { player: "空白到能精准背诵鹰守的台词？", boss: "他让我背了一晚上！" },
              { player: "那设计图，怎就记得要拿出来？即兴发挥？", boss: "（手中图纸燃起）本能…是本能！" },
              { player: "你真是天生的演员！", boss: "……" }
            ],
            "Questioning": [
              { player: "大脑空白，手却能将友谊的图纸举得那么稳？", boss: "（看着自己当年的手）稳…为了活…" },
              { player: "是恐惧让你空白，还是自由的兴奋让你空白？", boss: "你！" },
              { player: "害怕到能完成一场完美指证？", boss: "我也不想的！" },
              { player: "他眼里的光熄灭时，你也空白吗？", boss: "别看我！" }
            ],
            "Threat": [{ player: "快别再掩饰了，留给你的机会不多了。", boss: "你以为你是谁？" }],
            "Logic": [{ player: "你早就想好背叛他了，你只是怕他会上来咬你吧？", boss: "……当时我只是个孩子" }],
            "Deceit": [{ player: "具体是什么样的害怕？", boss: "既怕死，又怕面对其他人，尤其是他..." }],
            "Empathy": [{ player: "你能回忆起指控小狐狸时他的眼神吗？你觉得当时他怎么想？", boss: "我不知道，我没敢看" }]
          }
        },
        {
          id: "p3_s2",
          text: "我离开的时候很痛苦，走得很艰难，我这辈子都步履沉重。",
          hp: 40, maxHp: 40,
          weakness: { type: "Logic", count: 3, targetPoint: 5 },
          breakFeedback: "BOSS：当时我有一丝...暗爽，好吧，我是垃圾",
          interactions: {
            "Mockery": [
              { player: "不该高兴吗，计谋得逞了？", boss: "你什么都不懂。" },
              { player: "步履沉重？有他镣铐声音沉吗？", boss: "（暴怒）那不一样！" },
              { player: "你的\"艰难\"，是拿着船票的艰难。", boss: "（羞愤）你懂什么！" },
              { player: "沉重？是令牌太重，还是良心太重？", boss: "都重、都重……" }
            ],
            "Logic": [
              { player: "沉重是因你每一步，都踩在当年的誓言上。", boss: "（低头看脚）誓言早就碎了。" },
              { player: "当时除了痛苦，还有什么感觉？", boss: "我呼吸很急促，有一种诡异的兴奋感。" },
              { player: "感觉艰难是因为不知道如何展开新生活吧？", boss: "……" },
              { player: "这辈子都很沉重只是因为混的不好导致的吧？", boss: "你说什么就是什么吧" }
            ],
            "Threat": [{ player: "如果你再演戏，我就让你另外一只翅膀折掉！", boss: "别激怒我。" }],
            "Questioning": [{ player: "可是渡口的雾狼说你虽然一步三回头，但一刻没停下。", boss: "那是因为我生来就呆在这里。" }],
            "Deceit": [{ player: "回望悬崖上被关的小狐狸，你什么感觉？", boss: "胸口很痛，但，狐狸不需要飞吧。" }],
            "Empathy": [{ player: "你希望悬崖上的狐狸祝福你吗？", boss: "……我不奢望他祝福，只希望有那么一瞬间他理解我。" }]
          }
        },
        {
          id: "p3_s3",
          text: "我已经混成这样了，人生已经结束了，你为什么还揪住不放？",
          hp: 40, maxHp: 40,
          weakness: { type: "Empathy", count: 3, targetPoint: 4 },
          breakFeedback: "BOSS：凭什么，凭什么他们可以，我不可以，我恨他们，恨所有人。",
          interactions: {
            "Mockery": [
              { player: "你的翅膀都坏了，为什么还要装饰成可以煽动的样子？", boss: "不要再说了...否则我是什么？" },
              { player: "结束可是对你的恩赐啊！", boss: "（被激怒）报应！我活该！" },
              { player: "揪住不放？是当年的你，没放过他。", boss: "（语塞）我……" },
              { player: "你至少还能\"混\"，他在石室里连\"混\"的资格都没有。", boss: "（跪地）别说了…" }
            ],
            "Empathy": [
              { player: "如果看到同类在你面前飞，你什么感受？", boss: "我恨他们……能飞" },
              { player: "我揪住的，是那个曾经给朋友讲什么是飞翔的你，他在哪？", boss: "（指向自己心口，泣不成声）死了…被我杀了……" },
              { player: "你的人生看似结束，他的却真正被偷走了十年。", boss: "（崩溃认罪）我是贼…" },
              { player: "混成这样，因为灵魂一直停在悬崖那夜。", boss: "（流泪）是…我从来没离开过……" }
            ],
            "Threat": [{ player: "你不把话抖落干净我会让你永远夜不能寐！", boss: "爱怎么着怎么着。" }],
            "Questioning": [{ player: "你混成什么样了？", boss: "梦想最终破灭了，你看，我的翅膀已经坏掉了" }],
            "Logic": [{ player: "为什么觉得人生结束了？不是逃脱狗牙岛了吗？", boss: "……对鸟来说，乘船离开很讽刺" }],
            "Deceit": [{ player: "为什么你手里有不断燃烧的羊皮图纸？", boss: "看它燃烧虽然痛苦，但我安心，没人知道我的秘密了。" }]
          }
        },
        {
          id: "p3_s4",
          text: "哈哈哈哈哈哈要听点真心话吗？",
          hp: 40, maxHp: 40,
          weakness: { type: "Deceit", count: 3, targetPoint: 6 },
          breakFeedback: "BOSS：我想对他说对不起，但我要告诉他\"我不后悔出卖你\"",
          interactions: {
            "Deceit": [
              { player: "已经到这儿了，你可以全部释放出来", boss: "我以为我会后悔，但这么多年了，并没有" },
              { player: "若重来，你会松手让令牌落下吗？", boss: "我希望自己没有认识任何一个朋友。" },
              { player: "你的真心话，是恨鹰头，还是恨逼你背叛的自己？", boss: "（彻悟，平静）恨自己…懦弱卑鄙的自己。" },
              { player: "指认他时，你心里到底在喊什么？", boss: "（嘶喊）快认罪！这样我就能活了！" }
            ],
            "Empathy": [
              { player: "我知道这些话你憋在心里太久了，说吧，我会听到最后一秒", boss: "我背叛了他，只有那一刻，我觉得自己真的在活着" },
              { player: "我想听，那个星空下没说完的真心话。", boss: "鸟儿……生来就该飞的。" },
              { player: "你在笑什么？", boss: "我没想到自己真的活成了一个笑话。" },
              { player: "你想跟小狐狸说什么？", boss: "不要再相信任何一只想飞的鸟。" }
            ],
            "Threat": [{ player: "别给我发疯！", boss: "你怕什么哈哈哈哈哈！" }],
            "Mockery": [{ player: "你有哪句话是真的？", boss: "你有逼疯人的本事啊！" }],
            "Questioning": [{ player: "你还有什么没说么？", boss: "跟你说话真没意思" }],
            "Logic": [{ player: "刚才不是真话？", boss: "哈哈哈哈哈当然，都不够真。" }]
          }
        }
      ]
    }
  ]
};