export type CardType = "Threat" | "Mockery" | "Questioning" | "Logic" | "Empathy" | "Deceit";

export interface CardConfig {
  type: CardType;
  label: string;
  color: string;
  icon: string;
}

export interface Interaction {
  player: string;
  boss: string;
}

export interface Statement {
  id: string;
  text: string;
  hp: number;
  maxHp: number;
  weaknessTypes: CardType[]; 
  breakFeedback: string;
  // Interaction supports array for variety (4 variants for weaknesses)
  interactions: Partial<Record<CardType, Interaction[]>>; 
}

export interface GamePhase {
  id: number;
  title: string;
  description: string;
  statements: Statement[];
}

// UI Config: Text Labels Only, No Emojis
export const CARD_TYPES: CardConfig[] = [
  { type: "Threat", label: "威胁", icon: "⚔️", color: "bg-red-900 border-red-500" },
  { type: "Mockery", label: "嘲讽", icon: "🤡", color: "bg-purple-900 border-purple-500" },
  { type: "Questioning", label: "质疑", icon: "❓", color: "bg-blue-900 border-blue-500" },
  { type: "Logic", label: "逻辑", icon: "🧠", color: "bg-cyan-900 border-cyan-500" },
  { type: "Empathy", label: "共情", icon: "❤️", color: "bg-pink-900 border-pink-500" },
  { type: "Deceit", label: "追问", icon: "🎭", color: "bg-green-900 border-green-500" },
];

// Group C: General Fillers (Low Damage)
export const GENERAL_RESPONSES: Record<CardType, string[]> = {
  Threat: ["别逼我动用手段。", "你清楚后果的。", "我的忍耐是有限度的。", "这种态度救不了你。"],
  Mockery: ["真是可笑的逻辑。", "你就在这自我感动吧。", "这种话连你自己都不信吧？", "拙劣的表演。"],
  Questioning: ["这就是你的理由？", "真的只是这样吗？", "你在隐瞒什么？", "这解释不通。"],
  Logic: ["你的话前后矛盾。", "这不符合常理。", "没有任何证据支持你。", "逻辑漏洞百出。"],
  Deceit: ["看着我的眼睛再说一遍。", "还有别的吗？", "别想转移话题。", "再多说一点细节。"],
  Empathy: ["我理解你的感受。", "放松点，慢慢说。", "我们不是敌人。", "没关系的，我在听。"]
};

// Full Game Script (4-3-4 Structure)
export const gameConfig = {
  initialBossHP: 100, // Visual only, real progress tracks statements
  phases: [
    {
      id: 1,
      title: "目标：让蝉羽回想起当年做了什么",
      description: "Step 1: What", 
      statements: [
        {
          id: "p1_s1",
          text: "太久的事情想不起来了。",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Threat", "Logic"], 
          breakFeedback: "BOSS：我想起来了... 这个烂地儿大家都这样。",
          interactions: {
            "Threat": [
              { player: "那我请鹰头来审问你一次。", boss: "...." },
              { player: "这种健忘症，鹰头最会治了。", boss: "...." },
              { player: "你想在牢里慢慢想吗？", boss: "...." },
              { player: "再想不起来，我就把你交给那些受害者。", boss: "...." }
            ],
            "Logic": [
              { player: "怎么可能想不起来？", boss: "因为不重要了" },
              { player: "重要的事情大脑会优先存储，你在撒谎。", boss: "..." },
              { player: "你的微表情出卖了你，你记得很清楚。", boss: "..." },
              { player: "时间不长，且印象深刻，不可能遗忘。", boss: "..." }
            ],
            "Mockery": [{ player: "鸟的记忆只有3秒吗？", boss: "是的，你刚才问了什么？" }],
            "Questioning": [{ player: "告发朋友的事情，你忘记了吗？", boss: "我没有朋友" }],
            "Deceit": [{ player: "我知道你做了伤害别人的事", boss: "我从来没做过" }],
            "Empathy": [{ player: "那件事也是你的心结吧。", boss: "别自作多情" }]
          }
        },
        {
          id: "p1_s2",
          text: "我当年是告发了他，但那不是小孩经常做的蠢事吗？",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Mockery", "Questioning"], 
          breakFeedback: "BOSS：难道我做错了吗？",
          interactions: {
            "Mockery": [
              { player: "你不就是因为那件事，混成这副德行？", boss: "你能让我混的更好？" },
              { player: "蠢事？你这可是坏事做尽。", boss: "..." },
              { player: "把背叛说得这么清新脱俗，佩服。", boss: "..." },
              { player: "你这‘小孩’的心思可比大人还毒。", boss: "..." }
            ],
            "Questioning": [
              { player: "哪家小孩犯蠢，能把朋友坑进大牢十年？", boss: "十年而已，妖命那么长..." },
              { player: "只是犯蠢？那是蓄意谋害！", boss: "..." },
              { player: "你管这叫蠢事？", boss: "..." },
              { player: "别拿年龄当挡箭牌，你很清楚后果。", boss: "..." }
            ],
            "Threat": [{ player: "信不信再让鹰头打你一顿？", boss: "你就这一招吗？" }],
            "Logic": [{ player: "你不仅是告发，你还说了谎，栽赃别人", boss: "小孩子不就是老爱说谎吗？" }],
            "Deceit": [{ player: "展开讲讲有多蠢？", boss: "……以你的智商听不懂。" }],
            "Empathy": [{ player: "当时是不是有什么迫不得已的原因", boss: "对嘛" }]
          }
        },
        {
          id: "p1_s3",
          text: "我当时就是一个小孩儿，被威胁了还能怎么办？",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Threat", "Questioning"], 
          breakFeedback: "BOSS：我承认没有严刑拷打，但我没栽赃！",
          interactions: {
            "Threat": [
              { player: "你这种满嘴谎话的小孩就欠揍。", boss: "来来来，打我呀" },
              { player: "看来你是想尝尝真正的威胁。", boss: "..." },
              { player: "再撒谎，我就让你见识下大人的手段。", boss: "..." },
              { player: "没人打你？那我来做第一个。", boss: "..." }
            ],
            "Questioning": [
              { player: "他怎么威胁你的？是上了酷刑还是差点杀了你？", boss: "……我受到了精神折磨。" },
              { player: "具体的威胁内容是什么？说不出来吧。", boss: "..." },
              { player: "那个距离，他根本威胁不到你。", boss: "..." },
              { player: "你在撒谎，根本没有人威胁你。", boss: "..." }
            ],
            "Mockery": [{ player: "你可以像刚才一样装失忆呀，不是很擅长么？", boss: "你要这么说可就没意思了" }],
            "Logic": [{ player: "威胁了可以认罪，用不着栽赃朋友！", boss: "我没有！他本来就参与了！" }],
            "Deceit": [{ player: "有时候说出来也是一种释怀", boss: "我不需要" }],
            "Empathy": [{ player: "我小时候也做过蠢事，现在也无法原谅自己", boss: "少来这套" }]
          }
        },
        {
          id: "p1_s4",
          text: "我只是在大家面前说了事实，谁让他那么想离开……",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Logic", "Deceit"], 
          breakFeedback: "BOSS：我的确卖了他，谁让他参与了。",
          interactions: {
            "Logic": [
              { player: "那为什么你能全身而退？朋友却被关了10年？", boss: "鹰头看我态度良好……" },
              { player: "既然是事实，为什么你要逃避？", boss: "..." },
              { player: "事实是设计图是你画的。", boss: "..." },
              { player: "你的供词和现场证据完全对不上。", boss: "..." }
            ],
            "Deceit": [
              { player: "是你想离开？还是他想离开？", boss: "你到底是干什么的" },
              { player: "所谓的‘事实’到底是谁告诉你的？", boss: "..." },
              { player: "为什么那个时间点说？", boss: "..." },
              { player: "你到底想掩盖什么？", boss: "..." }
            ],
            "Threat": [{ player: "你不怕小狐狸趁你熟睡咬断你的脖子么？", boss: "我皮很糙，咬不动……" }],
            "Mockery": [{ player: "谎话说的这么淡定，在下真是佩服", boss: "别给脸不要脸" }],
            "Questioning": [{ player: "一开始最想飞走的不是你吗？设计图不是你画的吗？", boss: "……" }],
            "Empathy": [{ player: "我是来帮你的，如果你骗我，我就很难做到", boss: "你只是想替他讨回公道" }]
          }
        }
      ]
    },
    {
      id: 2,
      title: "目标：为什么当年选择背叛、栽赃？",
      description: "Step 2: Why",
      statements: [
        {
          id: "p2_s1",
          text: "这个烂地儿大家都这样，再来一次我也只能这么选。",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Threat", "Logic"], 
          breakFeedback: "BOSS：好吧，我承认，这就是我的选择。",
          interactions: {
            "Threat": [
              { player: "再来一次，小狐狸见到你就给你炖了。", boss: "喝得有点多啊。" },
              { player: "你这种想法会让你死得很惨。", boss: "..." },
              { player: "这种选择会让你众叛亲离。", boss: "..." },
              { player: "你以为你能一直这么侥幸吗？", boss: "..." }
            ],
            "Logic": [
              { player: "如果换你的朋友先背叛你，你会这么坦然吗？", boss: "……那我会认命。" },
              { player: "环境不是你作恶的借口。", boss: "..." },
              { player: "大家都这样，不代表这是对的。", boss: "..." },
              { player: "你的选择是基于私利，而非环境。", boss: "..." }
            ],
            "Mockery": [{ player: "对，下次你跪得更快。", boss: "我不跟你掰扯！" }],
            "Questioning": [{ player: "环境真的是原因吗？为什么大家都叫你背叛者？", boss: "你哪听来的？" }],
            "Deceit": [{ player: "也许吧，但你还是没有回答我为什么这么选。为什么？", boss: "你真是难缠啊。" }],
            "Empathy": [{ player: "我想，如果让你重新选择，你不会放弃朋友的，对吧？", boss: "我不知道。" }]
          }
        },
        {
          id: "p2_s2",
          text: "一个巴掌拍不响，他脑子里主意可多了。",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Questioning", "Logic"], 
          breakFeedback: "BOSS：好吧，我当时确实很害怕",
          interactions: {
            "Questioning": [
              { player: "那为什么鳄鱼说他做苦力全是为朋友的痴梦？", boss: "他……真这么说？" },
              { player: "你在把责任推给受害者。", boss: "..." },
              { player: "他的主意多，难道就是你背叛的理由？", boss: "..." },
              { player: "你真的了解他脑子里的想法吗？", boss: "..." }
            ],
            "Logic": [
              { player: "你栽赃设计图是他画的，真新鲜，狐狸比鸟还懂飞行？", boss: "……" },
              { player: "巴掌拍不响？你可是狠狠打了他一巴掌。", boss: "..." },
              { player: "他的主意都是为了带你飞。", boss: "..." },
              { player: "这因果关系完全颠倒了。", boss: "..." }
            ],
            "Threat": [{ player: "信不信我现在给你脸上拍几个。", boss: "无能狂怒。" }],
            "Mockery": [{ player: "他真这么聪明的话，当初怎么没看出你怎么虚伪？", boss: "您别跟我抬杠。" }],
            "Deceit": [{ player: "他确实有很多主意，但没有一个是“背叛你”，不是么？", boss: "……" }],
            "Empathy": [{ player: "你不需要掩饰，这么多年过去了，没有人在责怪你", boss: "……那他呢" }]
          }
        },
        {
          id: "p2_s3",
          text: "我如果不答应，我明天就会死在那儿。",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Logic", "Deceit"], 
          breakFeedback: "BOSS：好吧，我想出去，为了自由，什么都可以牺牲",
          interactions: {
            "Logic": [
              { player: "所以朋友就是你能活的筹码？", boss: "他只是被关了10年。" },
              { player: "用别人的命换你的命，这很公平？", boss: "..." },
              { player: "你活下来了，带着一身的罪孽。", boss: "..." },
              { player: "这不是生存游戏，这是谋杀。", boss: "..." }
            ],
            "Deceit": [
              { player: "这句话是谁说的？是你自欺欺人吧？", boss: "……" },
              { player: "你真的相信这句话吗？", boss: "..." },
              { player: "死在那儿？还是活在愧疚里？", boss: "..." },
              { player: "你在逃避真正的责任。", boss: "..." }
            ],
            "Threat": [{ player: "你现在活着，但你已经死了。", boss: "……" }],
            "Mockery": [{ player: "好一个贪生怕死的借口。", boss: "……" }],
            "Questioning": [{ player: "谁告诉你明天就会死？", boss: "……" }],
            "Empathy": [{ player: "恐惧让你做出了错误的选择，但现在可以弥补。", boss: "……" }]
          }
        }
      ]
    },
    {
      id: 3,
      title: "目标：让蝉羽面对真正的自己",
      description: "Step 3: Who",
      statements: [
        {
          id: "p3_s1",
          text: "我没错！为了自由，牺牲一点又怎么了？",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Mockery", "Questioning"], 
          breakFeedback: "BOSS：我……我只是想飞……",
          interactions: {
            "Mockery": [
              { player: "自由？你现在像个囚犯一样被困在过去。", boss: "……" },
              { player: "牺牲朋友换来的自由，真是高尚啊。", boss: "..." },
              { player: "你所谓的自由，就是背叛的代名词。", boss: "..." },
              { player: "看看你现在的样子，哪里自由了？", boss: "..." }
            ],
            "Questioning": [
              { player: "那为什么你现在不敢看天空？", boss: "……" },
              { player: "牺牲一点？那是别人的一生！", boss: "..." },
              { player: "你真的得到了自由吗？", boss: "..." },
              { player: "这种自由，你享受得了吗？", boss: "..." }
            ],
            "Threat": [{ player: "你的自由到头了。", boss: "……" }],
            "Logic": [{ player: "牺牲别人换取自由，这本身就是一种奴役。", boss: "……" }],
            "Deceit": [{ player: "你心里很清楚，你错了。", boss: "……" }],
            "Empathy": [{ player: "自由不是靠牺牲别人得来的，是靠承担责任。", boss: "……" }]
          }
        },
        {
          id: "p3_s2",
          text: "我只是想飞……我只是想飞出去……",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Empathy", "Logic"], 
          breakFeedback: "BOSS：我……对不起……",
          interactions: {
            "Empathy": [
              { player: "想飞没有错，但不能踩着朋友的翅膀飞。", boss: "……呜呜……" },
              { player: "我知道你渴望自由，但方式错了。", boss: "..." },
              { player: "现在回头还来得及，去面对他吧。", boss: "..." },
              { player: "飞翔需要的是勇气，而不是背叛。", boss: "..." }
            ],
            "Logic": [
              { player: "你飞出去了，心却永远留在了牢笼里。", boss: "……" },
              { player: "真正的飞翔是心灵的自由，你没有。", boss: "..." },
              { player: "你用谎言编织的翅膀，飞不远的。", boss: "..." },
              { player: "面对现实吧，你从未真正飞翔过。", boss: "..." }
            ],
            "Threat": [{ player: "飞？你只会坠落。", boss: "……" }],
            "Mockery": [{ player: "飞出去？你现在只是在逃避。", boss: "……" }],
            "Questioning": [{ player: "飞出去之后呢？你快乐吗？", boss: "……" }],
            "Deceit": [{ player: "你骗了所有人，包括你自己。", boss: "……" }]
          }
        },
        {
          id: "p3_s3",
          text: "我……我该怎么办？",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Empathy", "Logic"], 
          breakFeedback: "BOSS：我会去自首的。",
          interactions: {
            "Empathy": [
              { player: "去道歉，去承担你该承担的。", boss: "……好。" },
              { player: "面对他，说出真相。", boss: "..." },
              { player: "只要你肯回头，一切都不晚。", boss: "..." },
              { player: "我们会陪着你，去面对这一切。", boss: "..." }
            ],
            "Logic": [
              { player: "只有真相能让你解脱。", boss: "……" },
              { player: "逃避解决不了问题，面对才是出路。", boss: "..." },
              { player: "去把欠他的十年还给他。", boss: "..." },
              { player: "这是你唯一能做的事。", boss: "..." }
            ],
            "Threat": [{ player: "别再让我看到你逃避。", boss: "……" }],
            "Mockery": [{ player: "现在知道问怎么办了？早干嘛去了。", boss: "……" }],
            "Questioning": [{ player: "你自己心里清楚该怎么做。", boss: "……" }],
            "Deceit": [{ player: "别再骗自己了，去行动吧。", boss: "……" }]
          }
        },
        {
          id: "p3_s4",
          text: "（沉默）",
          hp: 40, maxHp: 40,
          weaknessTypes: ["Empathy"], 
          breakFeedback: "BOSS：谢谢你……",
          interactions: {
            "Empathy": [
              { player: "去吧，他在等你。", boss: "（点头）" },
              { player: "祝你好运。", boss: "..." },
              { player: "你终于自由了。", boss: "..." },
              { player: "再见，蝉羽。", boss: "..." }
            ],
            "Logic": [{ player: "沉默代表你已经想通了。", boss: "..." }],
            "Threat": [{ player: "别让我失望。", boss: "..." }],
            "Mockery": [{ player: "终于像个样了。", boss: "..." }],
            "Questioning": [{ player: "准备好了吗？", boss: "..." }],
            "Deceit": [{ player: "去面对你的命运吧。", boss: "..." }]
          }
        }
      ]
    }
  ]
};
