var Lifebook = (function() {
  var quotes = [
    { text: '你必须成为你希望看到的改变。', author: '甘地' },
    { text: '世界上只有一种真正的英雄主义，那就是在认清生活真相之后依然热爱生活。', author: '罗曼·罗兰' },
    { text: '生活不是等待暴风雨过去，而是学会在雨中翩翩起舞。', author: '薇薇安·格林' },
    { text: '一个人知道自己为什么而活，就可以忍受任何一种生活。', author: '尼采' },
    { text: '万物皆有裂痕，那是光照进来的地方。', author: '莱昂纳德·科恩' },
    { text: '且视他人之疑目如盏盏鬼火，大胆地去走你的夜路。', author: '史铁生' },
    { text: '当你真心渴望某样东西时，整个宇宙都会联合起来帮助你。', author: '保罗·柯艾略' },
    { text: '做你自己，因为别人都有人做了。', author: '奥斯卡·王尔德' },
    { text: '不要问你的国家能为你做什么，问问你能为自己的生活做什么。', author: '改编 · 肯尼迪' },
    { text: '真正的旅行不在于寻找新的风景，而在于拥有新的眼睛。', author: '马塞尔·普鲁斯特' },
    { text: '不要等待。时机永远不会恰到好处。', author: '拿破仑·希尔' },
    { text: '行动是绝望的唯一解药。', author: '琼·贝兹' },
    { text: '心之所向，素履以往；生如逆旅，一苇以航。', author: '木心' },
    { text: '我们读过的书，走过的路，最后都会变成我们的一部分。', author: '三毛' },
    { text: '如果你因失去了太阳而流泪，那么你也将失去群星了。', author: '泰戈尔' },
    { text: '重要的不是治愈，而是带着病痛活下去。', author: '阿尔贝·加缪' },
    { text: '一个人至少拥有一个梦想，有一个理由去坚强。', author: '张爱玲' },
    { text: '你只需要专注于非你不可的事物，然后迫不及待地、耐心地，将自己塑造成天地万物中那个不可取代的人。', author: '安德烈·纪德' },
    { text: '人生最遗憾的，莫过于轻易地放弃了不该放弃的，固执地坚持了不该坚持的。', author: '柏拉图' },
    { text: '在这个世界，你只有两条路：要么你掌控生活，要么你被生活掌控。', author: '吉姆·罗恩' },
    { text: '你拥有青春的时候，就要感受它。不要虚掷你的黄金时代。', author: '王尔德' },
    { text: '天下有大勇者，卒然临之而不惊，无故加之而不怒。', author: '苏轼' },
    { text: '世上最重要的事，不在于我们在何处，而在于我们朝着什么方向走。', author: '奥利弗·温德尔·霍姆斯' },
    { text: '爱是恒久忍耐，又有恩慈。', author: '《圣经》' },
    { text: '人可以被毁灭，但不可以被打败。', author: '海明威' },
    { text: '活着就意味着必须要做点什么，请好好努力。', author: '村上春树' },
    { text: '如果你觉得人生无聊，那是因为你自己无聊。', author: '罗素' },
    { text: '人类的一切智慧是包含在这四个字里面的：「等待」和「希望」。', author: '大仲马' },
    { text: '你的时间有限，所以不要为别人而活。', author: '史蒂夫·乔布斯' },
    { text: '世界上最快的速度不是光，不是电，而是我们的「念」。一念起，万水千山；一念灭，沧海桑田。', author: '白落梅' },
    { text: '知人者智，自知者明。胜人者有力，自胜者强。', author: '老子' },
    { text: '人生如逆旅，我亦是行人。', author: '苏轼' },
    { text: '每个人都会死去，但不是每个人都真正活过。', author: '威廉·华莱士（勇敢的心）' },
    { text: '越努力，越幸运。', author: '佚名' },
    { text: '如果命运是世界上最烂的编剧，你就要争取做你自己人生最好的演员。', author: '撒贝宁' },
    { text: '人生不过是午后到黄昏的距离，茶凉言尽，月上柳梢。', author: '白落梅' },
    { text: '成功就是从失败到失败，也依然不改热情。', author: '丘吉尔' },
    { text: '所有的限制都是从自己内心开始的。', author: '佚名' },
    { text: '宁在一思进，莫在一思停。', author: '《一代宗师》' },
    { text: '你还很年轻，将来你会遇到很多人，经历很多事，得到很多，也会失去很多，但无论如何，有两样东西，你绝不能丢弃。一个叫良心，一个叫理想。', author: '《明朝那些事儿》' },
    { text: '有时候，我们必须放下骄傲，承认自己错了。这不是认输，而是成长。', author: '佚名' },
    { text: '一个人的性格决定他的际遇。如果你喜欢保持你的性格，那么你就无权拒绝你的际遇。', author: '罗曼·罗兰' },
    { text: '最好的报复是巨大的成功。', author: '弗兰克·辛纳屈' },
    { text: '优于别人，并不高贵，真正的高贵是优于过去的自己。', author: '海明威' },
    { text: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。', author: '马尔克斯' },
    { text: '永远年轻，永远热泪盈眶。', author: '杰克·凯鲁亚克' },
    { text: '我们总要走一条路，无论它是曲折的还是笔直的，无论它有多少路口和拐弯，你害怕也好，孤独也好，都要坚持走下去。', author: '独木舟' },
    { text: '今天不想跑，所以才去跑。这才是真正的跑者。', author: '村上春树' },
    { text: '你的负担将变成礼物，你受的苦将照亮你的路。', author: '泰戈尔' },
    { text: '人生只有走出来的美丽，没有等出来的辉煌。', author: '佚名' },
    { text: '怕什么真理无穷，进一寸有一寸的欢喜。', author: '胡适' },
    { text: '你必须不断奔跑，才能留在原地。', author: '《爱丽丝梦游仙境》' },
    { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
    { text: '有航道的人，再渺小也不会迷途。', author: '顾城' },
    { text: '黑夜给了我黑色的眼睛，我却用它寻找光明。', author: '顾城' },
    { text: '要有最朴素的生活，与最遥远的梦想。即使明日天寒地冻，路远马亡。', author: '七堇年' },
    { text: '我们一路奋战，不是为了改变世界，而是为了不让世界改变我们。', author: '《熔炉》' },
    { text: '所谓无底深渊，下去，也是前程万里。', author: '木心' },
    { text: '活着，就是要活得比昨天更好。', author: '佚名' },
    { text: '来路无可眷恋，值得期待的只有前方。', author: '《马男波杰克》' },
    { text: '昨日种种，皆成今我。从今往后，怎么收获怎么栽。', author: '胡适' },
    { text: '世界上最大的谎言就是你不行。', author: '《垫底辣妹》' },
    { text: '不要努力去做一个成功的人，而要努力去做一个有价值的人。', author: '爱因斯坦' },
    { text: '上善若水。水善利万物而不争。', author: '老子' },
    { text: '君子之交淡如水，小人之交甘若醴。', author: '庄子' },
    { text: '己所不欲，勿施于人。', author: '孔子' },
    { text: '知之为知之，不知为不知，是知也。', author: '孔子' },
    { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
    { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游' },
    { text: '沉舟侧畔千帆过，病树前头万木春。', author: '刘禹锡' },
    { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
    { text: '天生我材必有用，千金散尽还复来。', author: '李白' },
    { text: '人生得意须尽欢，莫使金樽空对月。', author: '李白' },
    { text: '会当凌绝顶，一览众山小。', author: '杜甫' },
    { text: '愿你出走半生，归来仍是少年。', author: '佚名' },
    { text: '人的一切痛苦，本质上都是对自己无能的愤怒。', author: '王小波' },
    { text: '不管我本人多么平庸，我总觉得对你的爱很美。', author: '王小波' },
    { text: '一个人只有用心去看，才能看到真实。事情的真相只用眼睛是看不见的。', author: '圣埃克苏佩里' },
    { text: '我爱你不是因为你是谁，而是我在你面前可以是谁。', author: '《剪刀手爱德华》' },
    { text: '对于那些伤害你的人，最好的报复是幸福。', author: '佚名' },
    { text: '要温柔，但不是妥协。我们要在安静中，不慌不忙地坚强。', author: '林徽因' },
    { text: '你站在桥上看风景，看风景的人在楼上看你。', author: '卞之琳' },
    { text: '一定要爱着点什么，恰似草木对光阴的钟情。', author: '汪曾祺' },
    { text: '草在结它的种子，风在摇它的叶子。我们站着，不说话，就十分美好。', author: '顾城' },
    { text: '你来人间一趟，你要看看太阳。', author: '海子' },
    { text: '从今天起，做一个幸福的人。喂马，劈柴，周游世界。', author: '海子' },
    { text: '我感到难过，不是因为你欺骗了我，而是因为我再也不能相信你了。', author: '尼采' },
    { text: '刻意去找的东西，往往是找不到的。天下万物的来和去，都有他的时间。', author: '三毛' },
    { text: '如果有来生，要做一棵树，站成永恒，没有悲欢的姿势。', author: '三毛' },
    { text: '每一次告别，最好用力一点。多说一句，可能是最后一句。多看一眼，可能是最后一眼。', author: '《后会无期》' },
    { text: '你来时冬至，但眉上风止，开口是“我来得稍稍迟”。', author: '溱桑' },
    { text: '说是人生无常，却也是人生之常。', author: '余光中' },
    { text: '月光还是少年的月光，九州一色还是李白的霜。', author: '余光中' },
    { text: '少年与爱永不老去，即便披荆斩棘，丢失怒马鲜衣。', author: '莫峻' },
    { text: '所有的相遇都是久别重逢。', author: '王家卫' },
    { text: '念念不忘，必有回响。', author: '《一代宗师》' },
    { text: '我年华虚度，空有一身疲倦。', author: '海子' },
    { text: '从前的日色变得慢，车、马、邮件都慢，一生只够爱一个人。', author: '木心' },
    { text: '一生努力，一生被爱。想要的都拥有，得不到的都释怀。', author: '八月长安' },
    { text: '这世上所有的久处不厌，都是因为用心。', author: '佚名' },
    { text: '你是我的半截的诗，不允许别人更改一个字。', author: '海子' },
    { text: '我可以等你一个夏天，秋天也是。但冬天你一定要来。', author: '佚名' },
    { text: '如果你还在，这世界还算不错。', author: '佚名' },
    { text: '我们都生活在阴沟里，但仍有人仰望星空。', author: '王尔德' },
    { text: '一个人的孤独不是孤独，一个人找另一个人，一句话找另一句话，才是真正的孤独。', author: '刘震云' },
    { text: '世事如书，我偏爱你这一句。', author: '张嘉佳' },
    { text: '我有一壶酒，足以慰风尘。尽倾江海里，赠饮天下人。', author: '佚名' },
    { text: '此去经年，应是良辰好景虚设。', author: '柳永' },
    { text: '落霞与孤鹜齐飞，秋水共长天一色。', author: '王勃' },
    { text: '醉后不知天在水，满船清梦压星河。', author: '唐温如' },
    { text: '满堂花醉三千客，一剑霜寒十四州。', author: '贯休' },
    { text: '我见青山多妩媚，料青山见我应如是。', author: '辛弃疾' },
    { text: '衣带渐宽终不悔，为伊消得人憔悴。', author: '柳永' },
    { text: '曾经沧海难为水，除却巫山不是云。', author: '元稹' },
    { text: '人生若只如初见，何事秋风悲画扇。', author: '纳兰性德' },
    { text: '此情可待成追忆，只是当时已惘然。', author: '李商隐' },
    { text: '春风得意马蹄疾，一日看尽长安花。', author: '孟郊' },
    { text: '愿我如星君如月，夜夜流光相皎洁。', author: '范成大' },
    { text: '桃李春风一杯酒，江湖夜雨十年灯。', author: '黄庭坚' },
    { text: '世间安得双全法，不负如来不负卿。', author: '仓央嘉措' },
    { text: '宠辱不惊，看庭前花开花落；去留无意，望天上云卷云舒。', author: '《菜根谭》' },
    { text: '菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。', author: '慧能' },
    { text: '一花一世界，一叶一菩提。', author: '《华严经》' },
    { text: '诸行无常，是生灭法。生灭灭已，寂灭为乐。', author: '《涅槃经》' },
    { text: '一切有为法，如梦幻泡影，如露亦如电，应作如是观。', author: '《金刚经》' },
    { text: '你的善良必须带点锋芒。', author: '爱默生' },
    { text: '读书不是为了雄辩和驳斥，而是为了思考和权衡。', author: '培根' },
    { text: '一个人有两个生日。一个是肉体出生的那天，一个是找到人生目标的那天。', author: '佚名' },
    { text: '不要因为走得太远，而忘了为什么出发。', author: '纪伯伦' },
    { text: '工作是看得见的爱。', author: '纪伯伦' },
    { text: '真正的自由不是想做什么就做什么，而是不想做什么就可以不做什么。', author: '康德' },
    { text: '有两样东西，我对它们的思考越是深沉和持久，它们在我心中唤起的惊奇和敬畏就越是与日俱增：头顶的星空和心中的道德律。', author: '康德' },
    { text: '人是万物的尺度。', author: '普罗泰戈拉' },
    { text: '幸福是把灵魂安放在最适当的位置。', author: '亚里士多德' },
    { text: '吾爱吾师，吾更爱真理。', author: '亚里士多德' },
    { text: '认识你自己。', author: '苏格拉底' },
    { text: '未经审视的人生不值得过。', author: '苏格拉底' },
    { text: '我一直害怕的是，当我自己都不想活的时候，别人还让我活着。', author: '太宰治' },
    { text: '胆小鬼连幸福都会害怕，碰到棉花都会受伤。', author: '太宰治' },
    { text: '我慢慢地、慢慢地了解到，所谓父女母子一场，只不过意味着，你和他的缘分就是今生今世不断地在目送他的背影渐行渐远。', author: '龙应台' },
    { text: '有些路只能一个人走，有些关只能一个人过。', author: '龙应台' },
    { text: '心若没有栖息的地方，到哪里都是在流浪。', author: '三毛' },
    { text: '岁月极美，在于它必然的流逝。', author: '三毛' },
    { text: '要有遥不可及的梦想，也要有脚踏实地的能力。', author: '佚名' },
    { text: '我们可以卑微如尘土，不可扭曲如蛆虫。', author: '曼德拉' },
    { text: '自由从来不是别人给的，而是自己争取的。', author: '佚名' },
    { text: '如果一艘船不知道驶向哪个港口，那么任何方向吹来的风都不会是顺风。', author: '塞内卡' },
    { text: '任何不能杀死我的，都会使我更强大。', author: '尼采' },
    { text: '有些人能感受雨，而其他人则只是被雨淋湿。', author: '鲍勃·迪伦' },
    { text: '答案在风中飘荡。', author: '鲍勃·迪伦' },
    { text: '不要温和地走进那个良夜。', author: '迪伦·托马斯' },
    { text: '生如夏花之绚烂，死如秋叶之静美。', author: '泰戈尔' },
    { text: '我们热爱这个世界时，才真正活在这个世界上。', author: '泰戈尔' },
    { text: '当你为错过太阳而哭泣的时候，你也要再错过群星了。', author: '泰戈尔' },
    { text: '世界以痛吻我，我要报之以歌。', author: '泰戈尔' },
    { text: '青春不是年华，而是心境。', author: '塞缪尔·厄尔曼' },
    { text: '教育就是当一个人把在学校所学全部忘光之后剩下的东西。', author: '爱因斯坦' },
    { text: '想象力比知识更重要。', author: '爱因斯坦' },
    { text: '逻辑会把你从 A 带到 B，想象力能带你去任何地方。', author: '爱因斯坦' },
    { text: '在天才和勤奋之间，我毫不犹豫地选择勤奋。它几乎是世界上一切成就的催生婆。', author: '爱因斯坦' },
    { text: 'Stay hungry, stay foolish.', author: '乔布斯' },
    { text: '那些疯狂到以为自己能改变世界的人，才能真正改变世界。', author: '乔布斯' },
    { text: '生命中最大的风险是什么？是从来没有冒过险。', author: '马克·扎克伯格' },
    { text: '如果事情听起来不可能，那才是值得去做的事。', author: '伊隆·马斯克' },
    { text: '不要只满足于活着，要生活。', author: '佚名' },
    { text: '你花的每一分钟，都是在为你想要的生活投票。', author: '佚名' },
    { text: '有光明的地方就必然有阴影。', author: '《银魂》' },
    { text: '人类最大的武器，是豁出去的决心。', author: '《legal high》' },
    { text: '放弃不难，但坚持一定很酷。', author: '《解忧杂货店》' },
    { text: '即使明天是世界末日，我也要种下我的苹果树。', author: '马丁·路德' },
    { text: '当你想放弃的时候，想想是什么让你坚持到现在。', author: '佚名' },
    { text: '人生最大的遗憾，是一个人无法同时拥有青春和对青春的感受。', author: '佚名' },
    { text: '不知道明天会发生什么，这才是人生最迷人的地方。', author: '佚名' },
    { text: '世界很大，大到可以四处漂泊；世界很小，小到只有自己。', author: '佚名' },
    { text: '你并不是在拖延，你只是在等一个让自己心安的时机。', author: '改编 · 佚名' },
    { text: '不要让别人告诉你，你成不了才。如果你有梦想，就要去捍卫它。', author: '《当幸福来敲门》' },
    { text: '你得丢开以往的事，才能不断继续前进。', author: '《阿甘正传》' },
    { text: '人生就像一盒巧克力，你永远不知道下一颗是什么味道。', author: '《阿甘正传》' },
    { text: '死亡不是生命的终点，遗忘才是。', author: '《寻梦环游记》' },
    { text: '如果你的人生倒着过，你一定会选择现在开始。', author: '佚名' },
    { text: '爱是想触碰却又收回的手。', author: '塞林格' },
    { text: '这个世界只有一种成功，就是用自己喜欢的方式过一生。', author: '佚名' },
    { text: '种一棵树最好的时间是十年前，其次是现在。', author: '佚名' },
    { text: '你可以在一瞬间改变你的整个人生。你只需要决定去改变。', author: '佚名' },
    { text: '一个人的气质里藏着他读过的书、走过的路和爱过的人。', author: '佚名' },
    { text: '慢下来，才能快起来。', author: '佚名' },
    { text: '没有一朵花，从一开始就是花。', author: '佚名' },
    { text: '凡是过往，皆为序章。', author: '莎士比亚' },
    { text: '黑夜无论怎样悠长，白昼总会到来。', author: '莎士比亚' },
    { text: '把脸一直向着阳光，这样就不会见到阴影。', author: '海伦·凯勒' },
    { text: '世界上最美好的东西，看不见也摸不着，要靠心灵去感受。', author: '海伦·凯勒' },
    { text: '三十功名尘与土，八千里路云和月。', author: '岳飞' },
    { text: '人生自古谁无死，留取丹心照汗青。', author: '文天祥' },
    { text: '天地不仁，以万物为刍狗。', author: '老子' },
    { text: '大鹏一日同风起，扶摇直上九万里。', author: '李白' },
    { text: '问君能有几多愁，恰似一江春水向东流。', author: '李煜' },
    { text: '无可奈何花落去，似曾相识燕归来。', author: '晏殊' },
    { text: '天行健，君子以自强不息。', author: '《周易》' },
    { text: '地势坤，君子以厚德载物。', author: '《周易》' },
    { text: '海纳百川，有容乃大。', author: '林则徐' },
    { text: '为天地立心，为生民立命，为往圣继绝学，为万世开太平。', author: '张载' },
    { text: '志当存高远。', author: '诸葛亮' },
    { text: '非淡泊无以明志，非宁静无以致远。', author: '诸葛亮' },
    { text: '博观而约取，厚积而薄发。', author: '苏轼' },
    { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
    { text: '业精于勤，荒于嬉。', author: '韩愈' },
    { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '佚名' },
    { text: '少壮不努力，老大徒伤悲。', author: '《长歌行》' },
    { text: '盛年不重来，一日难再晨。', author: '陶渊明' },
    { text: '采菊东篱下，悠然见南山。', author: '陶渊明' },
    { text: '真正的高贵不是优于别人，而是优于过去的自己。', author: '海明威' },
    { text: '我有我的绽放，不需要别人的欣赏。', author: '佚名' },
    { text: '阳光越是强烈的地方，阴影就越是深邃。', author: '歌德' },
    { text: '你若要喜爱你自己的价值，你就得给世界创造价值。', author: '歌德' },
    { text: '只有经历过地狱般的磨砺，才能练就创造天堂的力量。', author: '泰戈尔' },
    { text: '不要着急，最好的总会在最不经意的时候出现。', author: '泰戈尔' },
    { text: '有时候你把什么放下了，不是因为突然就舍得了，而是因为期限到了，任性够了，成熟多了，也就知道这一页该翻过去了。', author: '佚名' },
    { text: '我没有勇气做自己，怕让别人失望。', author: '佚名' },
    { text: '所谓成长，就是实现独立生存、完成独立思考的自我奋斗。', author: '佚名' },
    { text: '今天做不成的，明天也不会做好。一天也不能虚度。', author: '歌德' },
    { text: '如果你想走到高处，就要使用自己的两条腿。', author: '尼采' },
    { text: '恐惧是思维杀手。', author: '《沙丘》' },
    { text: '不能杀死我的，会使我更强大。', author: '尼采' },
    { text: '许多人浪费了整整一生去等待符合他们心愿的机会。', author: '尼采' },
    { text: '我宽恕了你，但我不会忘记。', author: '佚名' },
    { text: '永远不要把你今天可以做的事留到明天做。', author: '狄更斯' },
    { text: '这是最好的时代，也是最坏的时代。', author: '狄更斯' },
    { text: '凡是不能杀死我的，都将使我更强大。', author: '尼采' },
    { text: '所谓成熟，就是习惯任何人的忽冷忽热，看淡任何人的渐行渐远。', author: '佚名' },
    { text: '人在无端微笑时，不是百无聊赖，就是痛苦难当。', author: '王小波' },
    { text: '你想成为什么样的人，就能成为什么样的人。', author: '佚名' },
    { text: '在黑暗的时刻，与其诅咒黑暗，不如点燃蜡烛。', author: '佚名' },
    { text: '向前走，别回头。', author: '《千与千寻》' },
    { text: '不论你在什么时候开始，重要的是开始之后就不要停止。', author: '佚名' },
    { text: '人生有两大悲剧：一是万念俱灰，二是踌躇满志。', author: '萧伯纳' },
    { text: '明天又是崭新的一天。', author: '《乱世佳人》' },
    { text: '星星发亮是为了让每一个人有一天都能找到属于自己的星星。', author: '《小王子》' },
    { text: '如果你驯养了我，我们就彼此需要了。', author: '《小王子》' },
    { text: '每一个大人曾经都是小孩，但是只有少数人记得。', author: '《小王子》' },
    { text: '我想，在这个世界上，虽然没有最美好的相遇，但却应该有为了相遇或者重逢，所做的最美好的努力。', author: '佚名' },
    { text: '时间不语，却回答了所有问题。', author: '季羡林' },
    { text: '简单，而有丰沛的爱。平常，而有深刻的心。', author: '林清玄' },
    { text: '以清净心看世界，以欢喜心过生活。', author: '林清玄' },
    { text: '我也愿学习蝴蝶，一再的蜕变，一再的祝愿。既不思虑，也不彷徨；既不回顾，也不忧伤。', author: '林清玄' },
    { text: '人间有味是清欢。', author: '苏轼' },
    { text: '人生天地之间，若白驹之过隙，忽然而已。', author: '庄子' },
    { text: '相濡以沫，不如相忘于江湖。', author: '庄子' },
    { text: '君子之交淡如水。', author: '庄子' },
    { text: '子非鱼，安知鱼之乐。', author: '庄子' },
    { text: '井蛙不可以语于海者，拘于虚也。', author: '庄子' },
    { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
    { text: '三人行，必有我师焉。', author: '孔子' },
    { text: '逝者如斯夫，不舍昼夜。', author: '孔子' },
    { text: '言必信，行必果。', author: '孔子' },
    { text: '欲速则不达。', author: '孔子' },
    { text: '君子坦荡荡，小人长戚戚。', author: '孔子' },
    { text: '工欲善其事，必先利其器。', author: '孔子' },
    { text: '祸兮福之所倚，福兮祸之所伏。', author: '老子' },
    { text: '千里之行，始于足下。', author: '老子' },
    { text: '大器晚成。', author: '老子' },
    { text: '合抱之木，生于毫末。', author: '老子' },
    { text: '天将降大任于是人也，必先苦其心志，劳其筋骨。', author: '孟子' },
    { text: '穷则独善其身，达则兼济天下。', author: '孟子' },
    { text: '人之相识，贵在相知；人之相知，贵在知心。', author: '孟子' },
    { text: '尽信书，则不如无书。', author: '孟子' },
    { text: '青，取之于蓝而青于蓝。', author: '荀子' },
    { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
    { text: '锲而不舍，金石可镂。', author: '荀子' },
    { text: '人生如戏，全靠演技。', author: '网络梗' },
    { text: '这世上没有毫无道理的横空出世。', author: '韩寒' },
    { text: '听过很多道理，却依然过不好这一生。', author: '《后会无期》' },
    { text: '小孩子才分对错，成年人只看利弊。', author: '《后会无期》' },
    { text: '每一次告别，最好用力一点。', author: '韩寒' },
    { text: '只要不是我觉到、悟到的，你给不了我，给了我也拿不住。', author: '《天道》' },
    { text: '昨天是历史，明天是谜团，而今天是礼物。', author: '《功夫熊猫》' },
    { text: '你的人生是你自己的。', author: '佚名' },
    { text: '不如意事常八九，可与人言无二三。', author: '方岳' },
    { text: '我们听过无数的道理，却仍旧过不好这一生。', author: '韩寒' },
    { text: '如果生活踹了你一脚，别忘了给它一个回旋踢。', author: '网络梗' },
    { text: '成年人的崩溃，是从借钱开始的。', author: '网络梗' },
    { text: '你不是真正的快乐。', author: '五月天' },
    { text: '就算大雨让整座城市颠倒，我会给你怀抱。', author: '苏打绿' },
    { text: '春风十里不如你。', author: '冯唐' },
    { text: '如果再见不能红着眼，是否还能红着脸。', author: '王菲《匆匆那年》' },
    { text: '于千万人之中，遇见你要遇见的人。', author: '张爱玲' },
    { text: '人生很短，一转身就是一辈子。', author: '佚名' },
    { text: '所有的合适，都是两个人的相互迁就和改变。', author: '佚名' },
    { text: '这年头，谁还没有点故事呢？', author: '网络梗' },
    { text: '你永远不知道明天和意外哪个先来。', author: '佚名' },
    { text: '人生已经如此的艰难，有些事情就不要拆穿。', author: '林宥嘉《说谎》' },
    { text: '哪有什么岁月静好，不过是有人替你负重前行。', author: '网络梗' },
    { text: '不要假装很努力，结果不会陪你看戏。', author: '网络梗' },
    { text: '乾坤未定，你我皆是黑马。', author: '网络梗' },
    { text: '前路漫漫亦灿灿。', author: '网络梗' },
    { text: '关关难过关关过，前路漫漫且灿灿。', author: '网络梗' },
    { text: '别想太多，好好生活。', author: '网络梗' },
    { text: '人这一辈子，要爱，要吃，要快乐。', author: '佚名' },
    { text: '只要有想见的人，就不再是孤身一人。', author: '《夏目友人帐》' },
    { text: '我独处时最轻松，因为我不觉得自己乏味。', author: '佚名' },
    { text: '先变成自己喜欢的样子，然后再去遇见无需取悦的人。', author: '佚名' },
    { text: '你知道故事的结局并不重要，重要的是你知道自己在故事里没有遗憾。', author: '佚名' },
    { text: '我的不幸，恰恰在于我缺乏拒绝的能力。', author: '太宰治' },
    { text: '世上每个人本来就有自己的发展时区。', author: '佚名' },
    { text: '你所浪费的今天，是昨天死去的人奢望的明天。', author: '哈佛校训' },
    { text: '你要做一个不动声色的大人了。', author: '村上春树' },
    { text: '不必太纠结于当下，也不必太忧虑未来。', author: '村上春树' },
    { text: '总之岁月漫长，然而值得等待。', author: '村上春树' },
    { text: '对相爱的人来说，对方的心才是最好的房子。', author: '村上春树' },
    { text: '孤独一人也没关系，只要能发自内心地爱着一个人，人生就会有救。', author: '村上春树' },
    { text: '我渐渐能意会到，深刻并不等于接近事实。', author: '村上春树' },
    { text: '年龄从来不是界限，除非你自己拿来为难自己。', author: '佚名' },
    { text: '有些笑容背后是咬紧牙关的灵魂。', author: '柴静' },
    { text: '人们声称的最美好的岁月其实都是最痛苦的，只是事后回忆起来的时候才那么幸福。', author: '白岩松' },
    { text: '没有在深夜痛哭过的人，不足以谈人生。', author: '托马斯·卡莱尔' },
    { text: '有人说，时间能治愈一切。但我不这么觉得。你得自己来。', author: '《梅尔罗斯》' },
    { text: '我已经过了餐桌上有只鸡就一定能吃到鸡腿的年纪了。', author: '网络梗' },
    { text: '如果不快乐，那就去创造快乐。', author: '佚名' },
    { text: '愿你在被打击时，记起你的珍贵，抵抗恶意。', author: '《无问西东》' },
    { text: '爱你所爱，行你所行，听从你心，无问西东。', author: '《无问西东》' },
    { text: '每个人心中都有一团火，而路过的人只看到烟。', author: '梵高' },
    { text: '我梦想着绘画，我画着我的梦想。', author: '梵高' },
    { text: '没有什么不朽的，包括艺术本身。唯一不朽的，是艺术所传递出来的对人和世界的理解。', author: '梵高' },
    { text: '正常状态好比一条铺好的路，走起来舒服，但长不出花。', author: '梵高' },
    { text: '只要活着的人还活着，死去的人就不会死去。', author: '梵高' },
    { text: '宁可在尝试中失败，也不在保守中成功。', author: '佚名' },
    { text: '不是因为某件事很难，你才不想做，而是因为你不想做，让这件事变得很难。', author: '塞内卡' },
    { text: '我们都有光明和黑暗的一面。重要的是我们选择哪一面。', author: '《哈利波特》' },
    { text: '决定我们成为什么样的人的，不是我们的能力，而是我们的选择。', author: 'J.K.罗琳' },
    { text: '幸福可以在任何地方找到，即使是最黑暗的时刻，只要记得开灯。', author: 'J.K.罗琳' },
    { text: '如果你想了解一个人，不要看他怎么说，要看他怎么做。', author: '佚名' },
    { text: '没有什么比习惯的力量更强大。', author: '奥维德' },
    { text: '今天是你剩余生命的第一天。', author: '佚名' },
    { text: '活着本身就是一种勇气。', author: '佚名' },
    { text: '只要你还愿意努力，世界就会给你惊喜。', author: '佚名' },
    { text: '不论你做什么，都要做到极致。', author: '佚名' },
    { text: '努力不一定成功，但不努力一定很轻松。', author: '网络梗 · 毒鸡汤' },
    { text: '不努力的女生，会有买不完的地摊货，逛不完的菜市场。', author: '网络梗' },
    { text: '条条大路通罗马，但有些人就生在罗马。', author: '网络梗' },
    { text: '你以为你感动了世界，其实你只感动了你自己。', author: '网络梗' },
    { text: '人生的出场顺序真的很重要。', author: '网络梗' },
    { text: '你没有如期归来，而这正是离别的意义。', author: '北岛' },
    { text: '卑鄙是卑鄙者的通行证，高尚是高尚者的墓志铭。', author: '北岛' },
    { text: '走吧，路啊路，飘满了红罂粟。', author: '北岛' },
    { text: '只要春天还在，我就不会悲哀。', author: '汪国真' },
    { text: '既然选择了远方，便只顾风雨兼程。', author: '汪国真' },
    { text: '没有比脚更长的路，没有比人更高的山。', author: '汪国真' },
    { text: '生命的多少用时间计算，生命的价值用贡献计算。', author: '裴多菲' },
    { text: '一个只顾低头赶路的人，永远领略不到沿途的风光。', author: '佚名' },
    { text: '时间是一切财富中最宝贵的财富。', author: '佚名' },
    { text: '你总是这样，会把所有的不开心都留给自己。', author: '网络梗' },
    { text: '保持可爱是天才行为。', author: '网络梗' },
    { text: '你不必生来勇敢，天赋过人，只需投入勤奋，诚诚恳恳。', author: '网络梗' },
    { text: '成功的路上并不拥挤，因为坚持的人不多。', author: '佚名' },
    { text: '所有的胜利，与征服自己的胜利比起来，都是微不足道的。', author: '佚名' },
    { text: '你若盛开，蝴蝶自来。', author: '佚名' },
    { text: '愿你被这世界温柔以待。', author: '网络梗' },
    { text: '保持热爱，奔赴山海。', author: '网络梗' },
    { text: '我们都要把自己照顾好，好到遗憾无法打扰。', author: '五月天' },
    { text: '我不怕千万人阻挡，只怕自己投降。', author: '五月天' },
    { text: '逆风的方向，更适合飞翔。', author: '五月天' },
    { text: '就算失望，不能绝望。', author: '五月天' },
    { text: '也许会有一天，世界真的有终点，也要和你举起回忆酿的甜。', author: '五月天' },
    { text: '人生有限公司，没有一天能请假。', author: '五月天' },
    { text: '还记得你说家是唯一的城堡，随着稻香河流继续奔跑。', author: '周杰伦' },
    { text: '笑一个吧，功成名就不是目的，让自己快乐快乐这才叫做意义。', author: '周杰伦' },
    { text: '从前从前，有个人爱你很久。', author: '周杰伦' },
    { text: '最美的不是下雨天，是曾与你躲过雨的屋檐。', author: '周杰伦' },
    { text: '听妈妈的话，别让她受伤。', author: '周杰伦' }
  ];

  var baseLimit = 3;
  var usedToday = 0;
  var bonusUsed = 0;
  var hasUnlockedBonus = false;

  function getCounts() {
    var s = Storage.getSettings();
    if (!s.lifebookDate || s.lifebookDate !== Storage.realToday()) {
      s.lifebookDate = Storage.realToday();
      s.lifebookUsed = 0;
      s.lifebookBonus = 0;
      Storage.saveSettings(s);
    }
    return { used: s.lifebookUsed || 0, bonus: s.lifebookBonus || 0 };
  }

  function addBonus() {
    var s = Storage.getSettings();
    if (!s.lifebookDate || s.lifebookDate !== Storage.realToday()) {
      s.lifebookDate = Storage.realToday();
      s.lifebookUsed = 0;
      s.lifebookBonus = 2;
    } else {
      s.lifebookBonus = (s.lifebookBonus || 0) + 2;
    }
    Storage.saveSettings(s);
  }

  function getRemaining() {
    var cnt = getCounts();
    return Math.max(0, baseLimit + cnt.bonus - cnt.used);
  }

  function useOne() {
    var s = Storage.getSettings();
    s.lifebookUsed = (s.lifebookUsed || 0) + 1;
    Storage.saveSettings(s);
  }

  function show() {
    var remaining = getRemaining();
    if (remaining <= 0) {
      showNoMore();
      return;
    }
    showWaitingScreen(remaining);
  }

  function showWaitingScreen(remaining) {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="lifebook-back">← 返回</button>' +
      '<div class="modal-title">📖 人生之书</div>' +
      '<div class="modal-text">在心中默念你的问题</div>' +
      '<div style="text-align:center;padding:20px">' +
      '<div style="font-size:48px;margin:20px 0" id="lifebook-countdown">3</div>' +
      '<div style="font-size:13px;color:var(--text-secondary)">稍后轻触屏幕获取答案</div>' +
      '<div style="font-size:12px;color:var(--text-tertiary);margin-top:8px">今日剩余 ' + remaining + ' 次</div>' +
      '</div></div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('lifebook-back').onclick = Inquiry.close;

    var count = 3;
    var el = document.getElementById('lifebook-countdown');
    var timer = setInterval(function() {
      count--;
      if (count <= 0) {
        clearInterval(timer);
        el.textContent = '✦';
        el.style.fontSize = '36px';
        el.style.color = 'var(--accent)';
        el.style.cursor = 'pointer';
        el.onclick = function() { showAnswer(remaining); };
      } else {
        el.textContent = count;
      }
    }, 1000);
  }

  function showAnswer(remaining) {
    useOne();
    var q = quotes[Math.floor(Math.random() * quotes.length)];
    var remainingNew = remaining - 1;
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="lifebook-back">← 返回</button>' +
      '<div class="modal-title">📖 人生之书</div>' +
      '<div style="padding:20px 14px;text-align:center">' +
      '<div style="font-size:18px;line-height:1.8;color:var(--text-primary);margin:16px 0;min-height:80px;font-weight:500">『' + escapeHtml(q.text) + '』</div>' +
      '<div style="text-align:right;font-size:11px;color:var(--text-tertiary);margin-top:8px;padding-right:8px">—— ' + escapeHtml(q.author) + '</div>' +
      '<div style="margin-top:20px">' +
      '<div style="font-size:12px;color:var(--text-tertiary);margin-bottom:10px">今日剩余 ' + remainingNew + ' 次</div>' +
      (remainingNew > 0 ?
        '<button class="btn-primary" id="lifebook-again">再问一个问题</button>' :
        '<button class="btn-primary" id="lifebook-close" style="background:var(--text-tertiary)">今天的提问次数用完了</button>'
      ) +
      '</div></div></div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('lifebook-back').onclick = Inquiry.close;
    var againBtn = document.getElementById('lifebook-again');
    if (againBtn) {
      againBtn.onclick = function() { show(); };
    }
    var closeBtn = document.getElementById('lifebook-close');
    if (closeBtn) {
      closeBtn.onclick = Inquiry.close;
    }
  }

  function showNoMore() {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="lifebook-back">← 返回</button>' +
      '<div class="modal-title">📖 人生之书</div>' +
      '<div style="text-align:center;padding:30px">' +
      '<div style="font-size:48px;margin:20px 0">📖</div>' +
      '<div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px">今天的提问次数已用完</div>' +
      '<div style="font-size:12px;color:var(--text-tertiary)">明天再来，或者点亮成就获取额外次数</div>' +
      '</div></div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('lifebook-back').onclick = Inquiry.close;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  return { show: show, addBonus: addBonus };
})();
