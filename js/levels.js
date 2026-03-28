/**
 * 关卡数据定义
 * 按照循序渐进原则，极大地丰富了关卡梯度。
 */
const Levels = [
    {
        id: 1,
        stage: "基准位启蒙",
        focus: "先稳住食指",
        title: "食指的小家 (F J)",
        description: "先找到 F 和 J 上的小横杠，轻轻按，慢慢来。",
        text: "f j f j ff jj fj jf f j",
        difficulty: 1
    },
    {
        id: 2,
        stage: "基准位启蒙",
        focus: "左手中环指",
        title: "左手邻居 (D S)",
        description: "左手中指按 D，无名指按 S，按完回到原位。",
        text: "d s d s ds sd dd ss d s",
        difficulty: 1
    },
    {
        id: 3,
        stage: "基准位启蒙",
        focus: "右手中环指",
        title: "右手邻居 (K L)",
        description: "右手中指按 K，无名指按 L，感受节奏。",
        text: "k l k l kl lk kk ll k l",
        difficulty: 1
    },
    {
        id: 4,
        stage: "基准位启蒙",
        focus: "双手小指入门",
        title: "小指出场 (A ;)",
        description: "左手小指 A，右手小指 ;，慢一点更准确。",
        text: "a ; a ; a; ;a aa ;; a ;",
        difficulty: 1
    },
    {
        id: 5,
        stage: "基准位启蒙",
        focus: "左手四指联动",
        title: "左手组合 (ASDF)",
        description: "把 A S D F 连起来，打出顺滑节奏。",
        text: "a s d f as df fd sa asdf",
        difficulty: 1
    },
    {
        id: 6,
        stage: "基准位启蒙",
        focus: "右手四指联动",
        title: "右手组合 (JKL;)",
        description: "把 J K L ; 连起来，注意回位动作。",
        text: "j k l ; jk l; ;l kj jkl;",
        difficulty: 1
    },
    {
        id: 7,
        stage: "基准位巩固",
        focus: "双手平衡",
        title: "基准位交替",
        description: "左右手轮流按，练习双手平衡发力。",
        text: "asdf jkl; fdsa ;lkj a s d f j",
        difficulty: 2
    },
    {
        id: 8,
        stage: "食指扩展",
        focus: "左食指伸展",
        title: "左食指探险 (G)",
        description: "从 F 伸到 G，再迅速回位。",
        text: "f g f g fg gf ff gg fgf gfg",
        difficulty: 2
    },
    {
        id: 9,
        stage: "食指扩展",
        focus: "右食指伸展",
        title: "右食指探险 (H)",
        description: "从 J 伸到 H，保持手腕稳定。",
        text: "j h j h jh hj jj hh jhj hjh",
        difficulty: 2
    },
    {
        id: 10,
        stage: "食指扩展",
        focus: "中区连击",
        title: "中区协同 (G H)",
        description: "G 和 H 交替练习，形成中区节奏。",
        text: "f g h j fg hj gf hj gh hg g h",
        difficulty: 2
    },
    {
        id: 11,
        stage: "上排引入",
        focus: "食指上排",
        title: "食指上排 (R U)",
        description: "食指向上按 R 和 U，按完回 F J。",
        text: "f r f r j u j u fr ju rf uj",
        difficulty: 2
    },
    {
        id: 12,
        stage: "上排引入",
        focus: "中指上排",
        title: "中指上排 (E I)",
        description: "中指练习 E 和 I，注意力度轻。",
        text: "d e d e k i k i de ki ed ik",
        difficulty: 2
    },
    {
        id: 13,
        stage: "上排引入",
        focus: "无名指上排",
        title: "无名指上排 (W O)",
        description: "无名指到 W O，按完立刻回位。",
        text: "s w s w l o l o sw lo ws ol",
        difficulty: 2
    },
    {
        id: 14,
        stage: "上排引入",
        focus: "小指上排",
        title: "小指上排 (Q P)",
        description: "边缘键更难，放慢速度更容易对。",
        text: "a q a q ; p ; p aq ;p qa p;",
        difficulty: 3
    },
    {
        id: 15,
        stage: "上排引入",
        focus: "远距食指",
        title: "食指远一点 (T Y)",
        description: "食指触达 T Y，保持手掌不飘。",
        text: "f t f t j y j y ft jy tf yj",
        difficulty: 3
    },
    {
        id: 16,
        stage: "上排巩固",
        focus: "上排整合",
        title: "上排全员集合",
        description: "把上排连成串，节奏要稳定。",
        text: "q w e r t y u i o p qw er ty ui",
        difficulty: 3
    },
    {
        id: 17,
        stage: "下排引入",
        focus: "食指下排",
        title: "食指下排 (V M)",
        description: "向下按 V M，注意手指独立。",
        text: "f v f v j m j m fv jm vf mj",
        difficulty: 3
    },
    {
        id: 18,
        stage: "下排引入",
        focus: "食指下排扩展",
        title: "食指再扩展 (B N)",
        description: "下排 B N 往返，别忘记回位。",
        text: "f b f b j n j n fb jn bf nj",
        difficulty: 3
    },
    {
        id: 19,
        stage: "下排引入",
        focus: "中指下排",
        title: "中指下排 (C ,)",
        description: "中指按 C 和 ,，连击要均匀。",
        text: "d c d c k , k , dc k, cd ,k",
        difficulty: 3
    },
    {
        id: 20,
        stage: "下排引入",
        focus: "边缘下排",
        title: "边缘挑战 (X Z . /)",
        description: "边缘键更考验控制，准确率优先。",
        text: "s x a z l . ; / sx az l. ;/",
        difficulty: 4
    },
    {
        id: 21,
        stage: "下排巩固",
        focus: "下排整合",
        title: "下排全员集合",
        description: "下排键完整串联，打出节奏感。",
        text: "z x c v b n m , . / zx cv bn m,",
        difficulty: 4
    },
    {
        id: 22,
        stage: "词块训练",
        focus: "左手高频词",
        title: "左手短词",
        description: "从有意义的短词开始，记忆更牢。",
        text: "sad dad fad add sass lass fall",
        difficulty: 4
    },
    {
        id: 23,
        stage: "词块训练",
        focus: "右手高频词",
        title: "右手短词",
        description: "右手短词训练，提升控制力。",
        text: "jill kill hill jolly holy lily",
        difficulty: 4
    },
    {
        id: 24,
        stage: "词块训练",
        focus: "双手短词",
        title: "双手词块",
        description: "双手配合输入短词，保持稳定节奏。",
        text: "flag fast ask dish fish milk jump",
        difficulty: 4
    },
    {
        id: 25,
        stage: "词块训练",
        focus: "高频词强化",
        title: "高频词冲刺",
        description: "练习常见高频词，提升实战效率。",
        text: "the and for are with this that you",
        difficulty: 4
    },
    {
        id: 26,
        stage: "句子节奏",
        focus: "空格与节拍",
        title: "短句节奏 1",
        description: "加入空格节奏，像读句子一样打字。",
        text: "we are fast and we are calm today",
        difficulty: 5
    },
    {
        id: 27,
        stage: "句子节奏",
        focus: "准确率优先",
        title: "短句节奏 2",
        description: "先保证准确率，再慢慢提速。",
        text: "i type with ten fingers and stay cool",
        difficulty: 5
    },
    {
        id: 28,
        stage: "句子节奏",
        focus: "连续输入",
        title: "短句节奏 3",
        description: "连续输入不慌张，保持流畅。",
        text: "small steps make typing smooth and fun",
        difficulty: 5
    },
    {
        id: 29,
        stage: "实战挑战",
        focus: "全键综合",
        title: "综合挑战",
        description: "常见字母组合混合，接近真实输入。",
        text: "quick fish jump over lazy cats and dogs",
        difficulty: 5
    },
    {
        id: 30,
        stage: "实战挑战",
        focus: "终极通关",
        title: "全字母终章",
        description: "终极一句，稳准快全都要。",
        text: "the quick brown fox jumps over the lazy dog",
        difficulty: 5
    }
];

const ConfusionLevels = [
    {
        id: 2001,
        stage: "混淆键专项",
        focus: "E / R 辨析",
        title: "混淆键专项 (E R)",
        description: "专练 E 与 R，减少相邻键误触。",
        text: "e r er re eer rre tree rear here",
        difficulty: 3
    },
    {
        id: 2002,
        stage: "混淆键专项",
        focus: "I / O 辨析",
        title: "混淆键专项 (I O)",
        description: "专练 I 与 O，稳定中上排手感。",
        text: "i o io oi ioi oio into icon coin",
        difficulty: 3
    },
    {
        id: 2003,
        stage: "混淆键专项",
        focus: "M / N 辨析",
        title: "混淆键专项 (M N)",
        description: "专练 M 与 N，提升下排准确率。",
        text: "m n mn nm nmn mmn name moon nine",
        difficulty: 4
    },
    {
        id: 2004,
        stage: "混淆键专项",
        focus: "B / V 辨析",
        title: "混淆键专项 (B V)",
        description: "专练 B 与 V，强化左手食指控制。",
        text: "b v bv vb bvb vvb brave vivid above",
        difficulty: 4
    }
];

const FingerWeakLevels = [
    {
        id: 3001,
        stage: "手指薄弱专项",
        focus: "左无名指",
        title: "左无名指专项 (W S X)",
        description: "集中练左无名指键位，先稳后快。",
        text: "w s x sw xs ws wsw sxw wax six",
        difficulty: 3
    },
    {
        id: 3002,
        stage: "手指薄弱专项",
        focus: "左小拇指",
        title: "左小拇指专项 (Q A Z)",
        description: "小拇指容易疲劳，训练控制与回位。",
        text: "q a z qa az za qaz aza aqua quiz",
        difficulty: 4
    },
    {
        id: 3003,
        stage: "手指薄弱专项",
        focus: "右无名指",
        title: "右无名指专项 (O L .)",
        description: "集中练 O L .，降低右侧误触。",
        text: "o l . ol l. .o lolo loop logo",
        difficulty: 4
    },
    {
        id: 3004,
        stage: "手指薄弱专项",
        focus: "右小拇指",
        title: "右小拇指专项 (P ; /)",
        description: "边缘键专项，提升精准按压能力。",
        text: "p ; / p; ;/ /p p;p ;/p papa slip",
        difficulty: 4
    }
];

const ContentPackLevels = [
    {
        id: 4001,
        stage: "词块分龄",
        focus: "低龄高重复",
        title: "分龄词块 (低龄)",
        description: "短词高重复，适合刚起步。",
        text: "cat dog sun run red blue cat run dog sun",
        difficulty: 2
    },
    {
        id: 4002,
        stage: "词块分龄",
        focus: "进阶短句",
        title: "分龄词块 (进阶)",
        description: "高频词串接，过渡到短句。",
        text: "we can type fast and we can type right today",
        difficulty: 4
    },
    {
        id: 4101,
        stage: "主题化关卡",
        focus: "动物主题",
        title: "主题词包 (动物)",
        description: "围绕动物词汇练习，记忆更有趣。",
        text: "cat rabbit panda tiger lion puppy kitten",
        difficulty: 3
    },
    {
        id: 4102,
        stage: "主题化关卡",
        focus: "校园主题",
        title: "主题词包 (校园)",
        description: "贴近日常校园场景，实用更强。",
        text: "class desk book pen teacher student school",
        difficulty: 3
    },
    {
        id: 4201,
        stage: "节奏型关卡",
        focus: "交替节奏",
        title: "节奏训练 (交替)",
        description: "通过交替输入提升节奏稳定性。",
        text: "f j f j fj jf f j f j fj jf",
        difficulty: 3
    },
    {
        id: 4202,
        stage: "节奏型关卡",
        focus: "回位节奏",
        title: "节奏训练 (回位)",
        description: "练习敲击后快速回基准位。",
        text: "asdf jkl; asdf jkl; ffff jjjj asdf",
        difficulty: 4
    },
    {
        id: 4301,
        stage: "真实场景关卡",
        focus: "问候输入",
        title: "真实场景 (问候)",
        description: "常用问候语输入练习。",
        text: "hello friend nice to meet you good morning",
        difficulty: 3
    },
    {
        id: 4302,
        stage: "真实场景关卡",
        focus: "数字标点",
        title: "真实场景 (数字+标点)",
        description: "数字与标点混合输入训练。",
        text: "room 3, desk 5. class 2 starts at 8:30!",
        difficulty: 5
    }
];

// 获取错题专属关卡 (动态生成)
function getErrorReviewLevel() {
    // 获取最多 5 个易错按键，让复习更加全面
    const topErrorObjs = Store.getTopErrorKeys(5);
    
    // 如果没有错题，返回 null
    if (topErrorObjs.length === 0) {
        return null;
    }
    
    // 提取出按键字符数组
    const topErrors = topErrorObjs.map(obj => obj.key);
    
    // 用错题键位随机组合成练习文本，以空格分隔
    let text = "";
    for (let i = 0; i < 12; i++) {
        let word = "";
        const wordLen = Math.floor(Math.random() * 3) + 2; // 2-4个字母的单词
        for (let j = 0; j < wordLen; j++) {
            // 100% 概率使用错键，确保专属复习关卡数据与易错按键数据完全关联
            word += topErrors[Math.floor(Math.random() * topErrors.length)];
        }
        text += word + " ";
    }
    
    return {
        id: 999, // 特殊 ID
        title: "错题专属复习关",
        description: `针对你最容易按错的按键 [${topErrors.join(', ').toUpperCase()}] 量身定制！`,
        text: text.trim(),
        difficulty: 5
    };
}

function getConfusionLevels() {
    return ConfusionLevels;
}

function getFingerWeakLevels() {
    return FingerWeakLevels;
}

function getContentPackLevels() {
    return ContentPackLevels;
}

function getGoalConfigByLevel(level) {
    const difficulty = level?.difficulty || 3;
    const passAcc = Math.min(92, 82 + difficulty * 2);
    const passWpm = 35 + difficulty * 8;
    const perfectAcc = Math.min(99, passAcc + 10);
    const perfectWpm = passWpm + 20;
    return {
        pass: { acc: passAcc, wpm: passWpm },
        perfect: { acc: perfectAcc, wpm: perfectWpm }
    };
}

function buildWeaknessDrivenText(baseText) {
    const topErrorObjs = Store.getTopErrorKeys(5, 'acc', 'asc');
    if (topErrorObjs.length === 0) {
        return baseText;
    }

    const ratio = Math.min(0.4, Math.max(0.2, 0.2 + (topErrorObjs.length * 0.04)));
    const weaknessChars = topErrorObjs.map(item => item.key.toLowerCase());
    const chars = baseText.split('');
    const replaceableIndexes = [];
    for (let i = 0; i < chars.length; i++) {
        if (/[a-z]/i.test(chars[i])) {
            replaceableIndexes.push(i);
        }
    }
    const replacementCount = Math.floor(replaceableIndexes.length * ratio);
    for (let i = replaceableIndexes.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        const temp = replaceableIndexes[i];
        replaceableIndexes[i] = replaceableIndexes[rand];
        replaceableIndexes[rand] = temp;
    }
    for (let i = 0; i < replacementCount; i++) {
        const index = replaceableIndexes[i];
        const source = chars[index];
        const replacement = weaknessChars[Math.floor(Math.random() * weaknessChars.length)];
        chars[index] = source === source.toUpperCase() ? replacement.toUpperCase() : replacement;
    }
    return chars.join('');
}

function simplifyTextForProtection(text) {
    const compact = String(text || '').replace(/\s+/g, ' ').trim();
    if (!compact) {
        return text;
    }
    const tokens = compact.split(' ');
    const limited = tokens.slice(0, Math.max(6, Math.floor(tokens.length * 0.75)));
    return limited.join(' ');
}

function buildAdaptivePracticeText(baseText, options = {}) {
    let text = baseText;
    if (options.enableWeaknessDriven) {
        text = buildWeaknessDrivenText(text);
    }
    if (options.enableProtectionMode) {
        text = simplifyTextForProtection(text);
    }
    return text;
}

// 获取所有关卡
function getAllLevels() {
    return Levels;
}

// 根据 ID 获取关卡详情
function getLevelById(id) {
    if (id === 999) {
        return getErrorReviewLevel();
    }
    const confusionLevel = ConfusionLevels.find(l => l.id === id);
    if (confusionLevel) {
        return confusionLevel;
    }
    const fingerWeakLevel = FingerWeakLevels.find(l => l.id === id);
    if (fingerWeakLevel) {
        return fingerWeakLevel;
    }
    const contentPackLevel = ContentPackLevels.find(l => l.id === id);
    if (contentPackLevel) {
        return contentPackLevel;
    }
    return Levels.find(l => l.id === id);
}
