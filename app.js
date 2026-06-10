/**
 * ==========================================
 * Project ExpressDinner — 核心狀態與智慧邏輯引擎
 * Version 2.0 (Claude Sonnet 全面優化版)
 *
 * ✅ 修正清單：
 *   [BUG-1] Fisher-Yates 無偏洗牌演算法 (修正週菜單隨機偏差)
 *   [BUG-2] 模糊食材語義配對 (「雞肉」可匹配「雞腿」、「雞胸肉」)
 *   [BUG-3] 全面繁體中文統一 (清除混入的簡體字)
 *   [BUG-4] 超市採買功能加入清楚的 Demo 模擬標示
 *
 * ✅ 新增內容：
 *   食譜庫從 5 道擴充至 20 道
 *   (台式、日式、韓式、泰式、越式、印度、墨式、義式、法式、川式)
 *   食材庫新增 15+ 種食材
 *   Service Worker 整合 (離線廚房模式)
 * ==========================================
 */

// ==================== 1. 多國 20 道極速食譜資料庫 ====================
const RECIPES_DB = [

  // ─────────────────────────────────────────────────────────────
  //  食譜 01 │ 日式牛肉壽喜燒滑蛋丼飯
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-sukiyaki",
    title: "日式牛肉壽喜燒滑蛋丼飯",
    cuisine: "日式家庭",
    prepTime: 5, cookTime: 10, totalTime: 15,
    difficulty: "15分極速", servings: 4, calories: 520,
    imageFallback: "🍚",
    tags: ["高蛋白", "滑蛋小童最愛", "一鍋到底"],
    description: "利用電飯鍋覆熱白飯的時間，在平底鍋中快速炒香洋蔥與肥牛，淋上蛋液悶熟，15分鐘端出吉野家等級的澎湃丼飯。",
    ingredients: [
      { name: "牛肉片", qty: "350g", isMain: true, category: "proteins", pxProduct: "美國牛五花肉片 200g/2包", pxPrice: 198, carrefourProduct: "家樂福嚴選冷藏牛五花肉片 350g", carrefourPrice: 220 },
      { name: "洋蔥", qty: "1顆", isMain: true, category: "veggies", pxProduct: "進口黃洋蔥/2顆", pxPrice: 39, carrefourProduct: "有機黃洋蔥 600g", carrefourPrice: 45 },
      { name: "雞蛋", qty: "4顆", isMain: true, category: "proteins", pxProduct: "全聯洗選鮮白蛋 10入", pxPrice: 65, carrefourProduct: "家樂福優質洗選蛋 10入", carrefourPrice: 68 },
      { name: "青蔥", qty: "2支", isMain: false, category: "pantry", pxProduct: "本產青蔥包", pxPrice: 28, carrefourProduct: "本產有機青蔥 150g", carrefourPrice: 32 },
      { name: "白飯", qty: "4碗", isMain: true, category: "staples", pxProduct: "南僑膳纖熟飯 200g/4盒", pxPrice: 150, carrefourProduct: "御用熟白飯微波即食包 3入/2袋", carrefourPrice: 160 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "將洋蔥切絲，青蔥斜切段，雞蛋在大碗中粗略打散（蛋黃蛋白不用完全均勻，口感更好）。", duration: 120, voiceText: "第一步，請將洋蔥切成細絲，青蔥斜切成段。接著將四顆雞蛋打在碗中，輕輕攪拌幾下就好，保留蛋黃與蛋白的層次感。" },
      { order: 2, threadId: 2, threadLabel: "電器等待線", instruction: "將冷凍熟白飯放入電鍋或微波爐加熱。同時在小碗調好壽喜燒醬汁：醬油4大匙、味醂3大匙、糖1大匙、水4大匙。", duration: 300, voiceText: "第二步，將即食白飯放入電鍋，加半杯水按下開關。趁等待加熱的同時，拿小碗調醬汁：醬油四匙、味醂三匙、糖一匙、水四匙，攪拌均勻。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "平底鍋下少許油，中火爆香洋蔥絲至變軟透明（約 2 分鐘）。", duration: 120, voiceText: "第三步，平底鍋倒少許油，中火放入洋蔥絲，拌炒兩分鐘直到洋蔥半透明、散發甜香。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "加入牛肉片炒至 8 分熟，倒入壽喜燒醬汁煮沸，稍微撈去浮沫。", duration: 150, voiceText: "第四步，放入牛肉片翻炒到八分熟，倒入調好的壽喜燒醬汁，大火煮滾後用湯匙撈去表面浮沫。" },
      { order: 5, threadId: 1, threadLabel: "爐火備料線", instruction: "均勻淋入蛋液，蓋鍋蓋轉小火悶 20 秒熄火（蛋液呈半熟最完美）。", duration: 60, voiceText: "第五步，將蛋液轉圈圈均勻淋上，立刻蓋上鍋蓋，轉小火悶二十秒後關火。半熟滑蛋才是最美味的！" },
      { order: 6, threadId: 1, threadLabel: "爐火備料線", instruction: "將牛肉滑蛋鋪在熱白飯上，撒蔥花，極速丼飯完成！", duration: 60, voiceText: "最後，把牛肉滑蛋整片滑落蓋在白飯上，撒上蔥花，熱騰騰的壽喜燒丼飯完成！趁熱享用吧！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 02 │ 經典番茄羅勒一鍋熟義大利麵
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-onepotpasta",
    title: "經典番茄羅勒一鍋熟義大利麵",
    cuisine: "義式風情",
    prepTime: 5, cookTime: 12, totalTime: 17,
    difficulty: "超簡單", servings: 4, calories: 460,
    imageFallback: "🍝",
    tags: ["一鍋到底免洗碗", "低脂健康", "全素可食"],
    description: "傳統義大利麵要分開煮麵與煮醬，本食譜將麵、番茄、洋蔥、蒜頭放入同一鍋直接水煮，澱粉釋放讓醬汁自然濃稠！",
    ingredients: [
      { name: "義大利麵", qty: "320g", isMain: true, category: "staples", pxProduct: "Barilla百味來義大利直麵 500g", pxPrice: 79, carrefourProduct: "家樂福義大利直麵 500g", carrefourPrice: 65 },
      { name: "小番茄", qty: "20顆", isMain: true, category: "veggies", pxProduct: "溫室玉女小番茄 300g/盒", pxPrice: 89, carrefourProduct: "家樂福嚴選履歷紅色小番茄 350g", carrefourPrice: 95 },
      { name: "洋蔥", qty: "0.5顆", isMain: false, category: "veggies", pxProduct: "進口黃洋蔥/2顆", pxPrice: 39, carrefourProduct: "有機黃洋蔥 600g", carrefourPrice: 45 },
      { name: "蒜頭", qty: "4瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 },
      { name: "九層塔", qty: "1小把", isMain: false, category: "veggies", pxProduct: "有機九層塔盒裝", pxPrice: 35, carrefourProduct: "新鮮九層塔包", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "備料線", instruction: "洋蔥切細絲，蒜頭切片，小番茄對半切開，九層塔葉摘下洗淨。", duration: 180, voiceText: "第一步，洗淨備料。請將洋蔥切絲，蒜頭切片，小番茄對半切開，九層塔摘下葉子備用。" },
      { order: 2, threadId: 1, threadLabel: "備料線", instruction: "深平底鍋中央橫放義大利麵，四周鋪上番茄、洋蔥絲、蒜片，淋橄欖油 2 匙與鹽 1 茶匙。", duration: 90, voiceText: "第二步，把義大利乾麵條放在深鍋正中央，四周整齊鋪上番茄、洋蔥絲與蒜片，均勻淋上橄欖油和一小匙鹽巴。" },
      { order: 3, threadId: 2, threadLabel: "加水煮沸線", instruction: "往鍋中倒入約 900ml 熱水（剛好淹沒麵條），大火燒開。", duration: 180, voiceText: "第三步，往鍋子裡倒入九百毫升的熱開水，水量要淹沒麵條。開大火，快速煮沸。" },
      { order: 4, threadId: 1, threadLabel: "備料線", instruction: "水沸後轉中火，持續用夾子攪拌麵條防黏，煮 9-10 分鐘直到湯汁收成濃稠醬汁。", duration: 540, voiceText: "第四步，水滾後轉中火，不要蓋鍋蓋。每隔一兩分鐘用長夾攪動麵條，煮約九到十分鐘，直到湯汁被麵條吸乾形成濃稠番茄醬。" },
      { order: 5, threadId: 1, threadLabel: "備料線", instruction: "熄火投入九層塔葉，撒胡椒拌勻起鍋，可刨帕馬森起司碎。", duration: 60, voiceText: "最後一步，關火把新鮮九層塔葉放入，撒黑胡椒快速拌勻。起鍋裝盤，撒上起司粉更美味！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 03 │ 韓式泡菜海鮮豆腐年糕鍋
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-kimchipot",
    title: "韓式泡菜海鮮豆腐年糕鍋",
    cuisine: "韓式經典",
    prepTime: 5, cookTime: 10, totalTime: 15,
    difficulty: "15分極速", servings: 4, calories: 410,
    imageFallback: "🥘",
    tags: ["暖心開胃", "極低脂高纖", "泡菜抗氧化"],
    description: "利用超市現成韓式泡菜作為湯底，不需熬高湯！加入冷凍海鮮包、年糕片與嫩豆腐，10 分鐘煮出滾燙鮮辣的韓劇場景晚餐。",
    ingredients: [
      { name: "泡菜", qty: "200g", isMain: true, category: "pantry", pxProduct: "正宗韓式切片泡菜 400g/罐", pxPrice: 129, carrefourProduct: "宗家府正宗切片泡菜 300g", carrefourPrice: 119 },
      { name: "嫩豆腐", qty: "1盒", isMain: true, category: "proteins", pxProduct: "中華有機嫩豆腐 300g", pxPrice: 18, carrefourProduct: "義美嫩豆腐 300g", carrefourPrice: 17 },
      { name: "冷凍海鮮包", qty: "1包", isMain: true, category: "proteins", pxProduct: "急凍綜合海鮮仁 250g", pxPrice: 139, carrefourProduct: "家樂福嚴選冷凍綜合海鮮 300g", carrefourPrice: 149 },
      { name: "年糕片", qty: "1小碗", isMain: false, category: "staples", pxProduct: "韓國進口純米年糕片 200g", pxPrice: 59, carrefourProduct: "韓式年糕片 250g", carrefourPrice: 62 },
      { name: "金針菇", qty: "1包", isMain: false, category: "veggies", pxProduct: "有機金針菇包/2包", pxPrice: 24, carrefourProduct: "履歷鮮金針菇", carrefourPrice: 14 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "備料炒香線", instruction: "海鮮包沖水退冰，嫩豆腐切厚片，金針菇去根撕開，青蔥切蔥花。", duration: 150, voiceText: "第一步，海鮮包放在碗裡用流水退冰。豆腐切成大厚片，金針菇切掉根部撕開，切一點蔥花備用。" },
      { order: 2, threadId: 1, threadLabel: "備料炒香線", instruction: "中型湯鍋下1匙油，加入泡菜與蔥白，小火炒出泡菜香氣（約1.5分鐘）。", duration: 90, voiceText: "第二步，湯鍋倒一匙油，放入韓式泡菜和蔥白，小火煸炒一分半鐘，炒出酸辣香氣和漂亮的紅色泡菜油。" },
      { order: 3, threadId: 2, threadLabel: "電熱水壺線", instruction: "用電熱水壺快速燒開 600ml 熱水，省下在爐火上燒冷水的 5 分鐘！", duration: 210, voiceText: "第三步，同時使用電熱水壺燒六百毫升的開水。快煮壺可以省下至少五分鐘！" },
      { order: 4, threadId: 1, threadLabel: "備料炒香線", instruction: "等水燒開的同時，將豆腐片、金針菇、年糕片整齊排入湯鍋中。", duration: 120, voiceText: "第四步，等水燒開時，把嫩豆腐片、金針菇、年糕片整齊排入鍋中的泡菜旁邊。" },
      { order: 5, threadId: 1, threadLabel: "備料炒香線", instruction: "滾水倒入湯鍋淹沒食材，中火煮 5 分鐘，最後 2 分鐘放入退冰海鮮仁，熟透後撒蔥花出鍋！", duration: 300, voiceText: "最後一步，把燒好的開水倒入鍋中淹沒食材，中火煮五分鐘。起鍋前兩分鐘放入退冰的蝦仁花枝，海鮮熟後撒蔥花，整鍋熱騰騰上桌！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 04 │ 泰式打拋豬肉碎與脆嫩黃瓜片
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-grapork",
    title: "泰式打拋豬肉碎與脆嫩黃瓜片",
    cuisine: "東南亞開胃",
    prepTime: 5, cookTime: 8, totalTime: 13,
    difficulty: "13分最快", servings: 4, calories: 480,
    imageFallback: "🥘",
    tags: ["超級下飯", "10分鐘極速", "香辣開胃"],
    description: "採用市售「泰式打拋豬調味醬包」，搭配豬細絞肉，10 分鐘起鍋，配上黃瓜切片解膩，完整呈現泰式料理的酸甜香辣！",
    ingredients: [
      { name: "豬肉碎", qty: "400g", isMain: true, category: "proteins", pxProduct: "冷藏台灣豬細絞肉 200g/2包", pxPrice: 96, carrefourProduct: "家樂福嚴選冷藏豬絞肉 400g", carrefourPrice: 110 },
      { name: "小黃瓜", qty: "2支", isMain: false, category: "veggies", pxProduct: "本產帶刺小黃瓜盒裝", pxPrice: 39, carrefourProduct: "履歷小黃瓜 300g", carrefourPrice: 42 },
      { name: "打拋醬包", qty: "1包", isMain: true, category: "pantry", pxProduct: "泰式打拋豬調味醬包 50g", pxPrice: 32, carrefourProduct: "泰式打拋醬包 60g", carrefourPrice: 35 },
      { name: "九層塔", qty: "1把", isMain: false, category: "veggies", pxProduct: "有機九層塔盒裝", pxPrice: 35, carrefourProduct: "新鮮九層塔包", carrefourPrice: 32 },
      { name: "蒜頭", qty: "4瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "備料煎炒線", instruction: "小黃瓜洗淨斜切薄片排盤，蒜頭切末，九層塔摘嫩葉洗淨。", duration: 150, voiceText: "第一步，洗淨小黃瓜斜切成薄圓片，鋪在盤子周圍作解膩配菜。蒜頭切成碎末，九層塔摘葉子備用。" },
      { order: 2, threadId: 1, threadLabel: "備料煎炒線", instruction: "平底鍋不放油，直接下絞肉大火翻炒，搗散肉末炒至焦香金黃（約 3 分鐘）。", duration: 180, voiceText: "第二步，平底鍋燒熱不放油，直接倒入豬絞肉大火翻炒，用鍋鏟將肉末剁開，炒到水氣蒸發、微微焦黃。" },
      { order: 3, threadId: 1, threadLabel: "備料煎炒線", instruction: "加入蒜末與泰式打拋醬包，中火翻炒 2 分鐘讓肉末充分入味。", duration: 120, voiceText: "第三步，放入蒜末和整包泰式打拋醬，中火繼續翻炒兩分鐘，讓醬汁和肉末完全融合，炒出濃郁東南亞辛香氣。" },
      { order: 4, threadId: 1, threadLabel: "備料煎炒線", instruction: "熄火投入九層塔葉，用餘溫翻炒 15 秒至香氣散發，盛入鋪好黃瓜片的盤中！", duration: 60, voiceText: "最後一步，直接關火，把大把九層塔葉倒入，用餘溫快速拌炒十五秒。九層塔葉一變軟就立刻盛盤，鋪在黃瓜片中央，極速打拋豬完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 05 │ 氣炸懶人紙包香草鱸魚與甜椒
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-lazyfish",
    title: "氣炸懶人紙包香草鱸魚與甜椒",
    cuisine: "法式優雅",
    prepTime: 5, cookTime: 15, totalTime: 20,
    difficulty: "免開火", servings: 4, calories: 380,
    imageFallback: "🐟",
    tags: ["完全免開火無油煙", "烤箱氣炸鍋", "地中海高蛋白"],
    description: "今晚不想洗鍋子？在烘焙紙上鋪彩椒與鱸魚，撒蒜鹽與檸檬片，包好送入氣炸鍋，15分鐘自動出餐，廚房無油無煙！",
    ingredients: [
      { name: "鱸魚", qty: "2片(約400g)", isMain: true, category: "proteins", pxProduct: "嚴選鮮凍金目鱸魚排 200g/2包", pxPrice: 178, carrefourProduct: "特選金目鱸魚排 200g/2片", carrefourPrice: 190 },
      { name: "彩椒", qty: "2顆", isMain: false, category: "veggies", pxProduct: "彩色甜椒袋裝/2入", pxPrice: 69, carrefourProduct: "有機彩色甜椒 300g", carrefourPrice: 75 },
      { name: "檸檬", qty: "1顆", isMain: false, category: "pantry", pxProduct: "無籽綠檸檬/3入袋", pxPrice: 49, carrefourProduct: "履歷綠檸檬 600g", carrefourPrice: 55 },
      { name: "蒜頭", qty: "4瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "紙包備料線", instruction: "彩椒洗淨去籽切細絲，蒜頭切碎，檸檬切薄片。鱸魚排洗淨用廚房紙巾徹底吸乾水分。", duration: 180, voiceText: "第一步，洗淨甜椒並切成細絲，大蒜切碎，檸檬切成圓薄片。魚排用廚房紙巾徹底擦乾，這樣烤出來才不會有腥味。" },
      { order: 2, threadId: 2, threadLabel: "氣炸鍋預熱線", instruction: "氣炸鍋設定 180 度預熱 3 分鐘。", duration: 180, voiceText: "第二步，同時啟動氣炸鍋，設定一百八十度，空機預熱三分鐘。" },
      { order: 3, threadId: 1, threadLabel: "紙包備料線", instruction: "撕兩張大烘焙紙，在紙中央先鋪彩椒絲，放上鱸魚排，淋橄欖油、撒蒜碎與少許鹽，最上面壓兩片檸檬片。", duration: 120, voiceText: "第三步，撕下兩張大烘焙紙。紙中央先鋪甜椒絲，再放鱸魚排，淋一匙橄欖油、撒大蒜與鹽巴，最上面鋪兩片檸檬片。" },
      { order: 4, threadId: 1, threadLabel: "紙包備料線", instruction: "將烘焙紙前後對摺，左右兩端像扭糖果一樣捏緊，做成密封紙包，鎖住蒸氣。", duration: 90, voiceText: "第四步，烘焙紙前後對摺，左右兩側像轉糖果一樣扭緊捏死，做成一個密封紙包，鎖住魚肉的鮮甜多汁。" },
      { order: 5, threadId: 2, threadLabel: "氣炸鍋線", instruction: "將兩個紙包平整放入氣炸籃，設定 180 度烤 15 分鐘。這段時間可以去陪孩子或洗手！", duration: 900, voiceText: "第五步，把兩個魚排紙包平放入氣炸籃，設定一百八十度，烤十五分鐘。這段時間完全不用看火，可以去陪孩子或洗手！" },
      { order: 6, threadId: 1, threadLabel: "紙包備料線", instruction: "氣炸完成後取出紙包，直接放盤上用剪刀劃開，免洗鍋！", duration: 60, voiceText: "最後，氣炸完成後把紙包拿出來放在盤子裡，用剪刀劃開，熱騰騰的香草鱸魚就完成了！連鍋都不用洗，超輕鬆！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 06 │ 台式三杯雞
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-3cupcn",
    title: "台式三杯雞",
    cuisine: "台式快炒",
    prepTime: 5, cookTime: 15, totalTime: 20,
    difficulty: "20分完成", servings: 4, calories: 510,
    imageFallback: "🍗",
    tags: ["台灣家庭必學", "醬香下飯", "九層塔香"],
    description: "三杯雞靈魂是醬油:米酒:麻油 1:1:1 黃金比例。使用超市分切雞腿塊省去剁骨時間，中火煸出金黃雞皮，大火收汁後九層塔香撲鼻！",
    ingredients: [
      { name: "雞腿", qty: "2支(約450g)", isMain: true, category: "proteins", pxProduct: "台灣鮮切仿土雞腿 2支/450g", pxPrice: 138, carrefourProduct: "家樂福國產雞腿 2支/480g", carrefourPrice: 148 },
      { name: "薑", qty: "6片", isMain: false, category: "pantry", pxProduct: "本產老薑塊 300g", pxPrice: 29, carrefourProduct: "家樂福有機老薑 150g", carrefourPrice: 32 },
      { name: "蒜頭", qty: "6瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 },
      { name: "九層塔", qty: "1大把", isMain: false, category: "veggies", pxProduct: "有機九層塔盒裝", pxPrice: 35, carrefourProduct: "新鮮九層塔包", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "雞腿切成一口大小塊狀（可請超市代切），薑切厚片，蒜頭拍破去皮，九層塔摘葉洗淨。", duration: 150, voiceText: "第一步，把雞腿切成一口大小，薑切厚片，蒜頭拍破去皮。九層塔洗淨摘下嫩葉備用。" },
      { order: 2, threadId: 2, threadLabel: "醬汁備料線", instruction: "小碗中調三杯醬汁：醬油3大匙＋米酒3大匙＋麻油1大匙＋冰糖1大匙，攪拌均勻。", duration: 60, voiceText: "第二步，拿一個小碗調三杯醬汁：醬油三匙、米酒三匙、麻油一匙、冰糖一匙，攪拌均勻備用。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "厚底砂鍋不放油，中火將雞皮朝下煸至金黃出油（約 4 分鐘），翻面再煸 2 分鐘。", duration: 360, voiceText: "第三步，砂鍋或厚鍋不放油，中火把雞塊雞皮朝下放入，慢慢煸四分鐘煸出金黃油脂。翻面再煸兩分鐘。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "利用鍋中雞油爆香薑片與蒜頭，倒入三杯醬汁，大火煮滾後轉中火燒 3 分鐘至收汁。", duration: 240, voiceText: "第四步，放入薑片和蒜頭，用鍋中的雞油爆香。倒入三杯醬汁，大火煮滾後轉中火，燒三分鐘讓醬汁收乾變濃稠。" },
      { order: 5, threadId: 1, threadLabel: "爐火備料線", instruction: "確認醬汁濃稠、雞肉熟透後，投入九層塔，大火翻炒 10 秒立刻起鍋！", duration: 30, voiceText: "最後，確認雞肉熟透醬汁濃稠，把大把九層塔葉全部倒入，大火翻炒十秒立刻關火起鍋！九層塔的香氣出來就要馬上盛盤！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 07 │ 家常番茄炒蛋
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-tomatoegg",
    title: "家常番茄炒蛋",
    cuisine: "台式家常",
    prepTime: 3, cookTime: 7, totalTime: 10,
    difficulty: "10分最速", servings: 4, calories: 280,
    imageFallback: "🍳",
    tags: ["入門零失敗", "全家最愛", "高茄紅素"],
    description: "台灣家庭出現率第一名的週間晚餐料理！關鍵是蛋先炒嫩出鍋，再用番茄出的汁水烹炒，最後合炒 10 秒，酸甜鮮美，米飯殺手！",
    ingredients: [
      { name: "番茄", qty: "3顆(約450g)", isMain: true, category: "veggies", pxProduct: "台灣牛番茄 600g/袋", pxPrice: 49, carrefourProduct: "家樂福履歷牛番茄 4入", carrefourPrice: 55 },
      { name: "雞蛋", qty: "4顆", isMain: true, category: "proteins", pxProduct: "全聯洗選鮮白蛋 10入", pxPrice: 65, carrefourProduct: "家樂福優質洗選蛋 10入", carrefourPrice: 68 },
      { name: "青蔥", qty: "2支", isMain: false, category: "pantry", pxProduct: "本產青蔥包", pxPrice: 28, carrefourProduct: "本產有機青蔥 150g", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "番茄洗淨切月牙塊（大番茄切 8 瓣），青蔥切段。雞蛋打入碗中加一小撮鹽，用筷子打散。", duration: 90, voiceText: "第一步，番茄切成大月牙塊，青蔥切段備用。雞蛋打在碗裡加一小撮鹽，用筷子打散均勻。" },
      { order: 2, threadId: 1, threadLabel: "爐火備料線", instruction: "平底鍋下 2 匙油，大火燒熱，倒入蛋液大火翻炒至嫩熟八分（約 30 秒），先起鍋備用。", duration: 60, voiceText: "第二步，鍋中下兩匙油大火燒熱，倒入蛋液大火快炒三十秒，炒到蛋嫩嫩的七八分熟就先盛出來備用，不要炒老了！" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "原鍋補 1 匙油，爆香蔥段，下番茄中火翻炒 2 分鐘至番茄出汁軟化，加糖 1 小匙、鹽適量。", duration: 150, voiceText: "第三步，原鍋補一匙油，爆香蔥段。放入番茄中火翻炒兩分鐘，炒到番茄軟化出汁，加一小匙糖和適量鹽調味。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "將剛才炒好的嫩蛋倒回鍋中，與番茄汁拌炒 10 秒，起鍋裝盤！", duration: 45, voiceText: "最後一步，把剛才炒好的嫩蛋倒回鍋中，和番茄汁一起翻炒十秒入味。起鍋裝盤，酸甜番茄炒蛋完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 08 │ 日式雞肉親子丼
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-oyakodon",
    title: "日式雞肉親子丼",
    cuisine: "日式家庭",
    prepTime: 5, cookTime: 13, totalTime: 18,
    difficulty: "18分完成", servings: 4, calories: 490,
    imageFallback: "🍱",
    tags: ["雞蛋雞肉雙重蛋白", "暖心療癒", "小童超愛"],
    description: "親子丼的「親」是雞肉、「子」是雞蛋，兩者相遇的溫柔滋味。關鍵在於讓蛋液在熱醬汁中悶出半熟狀態，絲滑鮮甜！",
    ingredients: [
      { name: "雞腿", qty: "2支去骨(約300g)", isMain: true, category: "proteins", pxProduct: "台灣去骨雞腿排 2片/300g", pxPrice: 128, carrefourProduct: "家樂福去骨雞腿排 2片/320g", carrefourPrice: 138 },
      { name: "洋蔥", qty: "1顆", isMain: true, category: "veggies", pxProduct: "進口黃洋蔥/2顆", pxPrice: 39, carrefourProduct: "有機黃洋蔥 600g", carrefourPrice: 45 },
      { name: "雞蛋", qty: "4顆", isMain: true, category: "proteins", pxProduct: "全聯洗選鮮白蛋 10入", pxPrice: 65, carrefourProduct: "家樂福優質洗選蛋 10入", carrefourPrice: 68 },
      { name: "白飯", qty: "4碗", isMain: true, category: "staples", pxProduct: "南僑膳纖熟飯 200g/4盒", pxPrice: 150, carrefourProduct: "御用熟白飯微波即食包 3入/2袋", carrefourPrice: 160 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "去骨雞腿肉切成一口大小，洋蔥切粗絲，雞蛋打散備用。調親子丼醬汁：高湯150ml＋醬油3匙＋味醂3匙＋糖1匙。", duration: 120, voiceText: "第一步，去骨雞腿切成一口大小，洋蔥切粗絲，雞蛋打散備用。同時調醬汁：高湯一百五十毫升加醬油三匙、味醂三匙、糖一匙拌勻。" },
      { order: 2, threadId: 2, threadLabel: "電器等待線", instruction: "熟白飯放入電鍋或微波爐加熱。", duration: 360, voiceText: "第二步，將白飯放入電鍋或微波爐加熱備用。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "平底鍋下少許油，中火炒洋蔥絲至半透明（約 2 分鐘）。", duration: 120, voiceText: "第三步，平底鍋下少許油，中火炒洋蔥絲約兩分鐘，炒到洋蔥半透明軟化出甜香。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "加入雞肉塊，倒入醬汁，中小火煮至雞肉熟透（約 5 分鐘），中途翻面一次。", duration: 300, voiceText: "第四步，加入雞肉塊，倒入調好的醬汁，中小火蓋鍋燉煮約五分鐘，中途翻面一次讓雞肉均勻吸收醬汁。" },
      { order: 5, threadId: 1, threadLabel: "爐火備料線", instruction: "均勻淋入 2/3 蛋液，蓋鍋悶 30 秒，再補入剩餘蛋液，悶 10 秒關火（蛋液半熟最完美）。", duration: 60, voiceText: "最後一步，先淋入三分之二的蛋液，蓋鍋悶三十秒，再把剩餘蛋液補入，再悶十秒後關火。半熟的蛋液是親子丼的靈魂！盛飯後鋪上滿滿的親子料！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 09 │ 韓式辣炒豬肉飯
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-spicypork",
    title: "韓式辣炒豬肉飯",
    cuisine: "韓式快炒",
    prepTime: 5, cookTime: 10, totalTime: 15,
    difficulty: "15分極速", servings: 4, calories: 520,
    imageFallback: "🌶️",
    tags: ["辣中帶甜超下飯", "週間壓力釋放", "高蛋白低醣"],
    description: "韓式辣炒豬肉的靈魂是韓式辣椒醬（Gochujang）！只需將豬肉片醃 5 分鐘，大火快炒出來就是一道韓劇男女主角都在吃的熱炒料理！",
    ingredients: [
      { name: "豬肉片", qty: "350g", isMain: true, category: "proteins", pxProduct: "台灣豬梅花薄片 200g/2包", pxPrice: 118, carrefourProduct: "家樂福嚴選冷藏豬梅花肉片 350g", carrefourPrice: 128 },
      { name: "洋蔥", qty: "0.5顆", isMain: false, category: "veggies", pxProduct: "進口黃洋蔥/2顆", pxPrice: 39, carrefourProduct: "有機黃洋蔥 600g", carrefourPrice: 45 },
      { name: "韓式辣椒醬", qty: "2大匙", isMain: true, category: "pantry", pxProduct: "膳府韓式辣椒醬 200g", pxPrice: 89, carrefourProduct: "家樂福韓式辣椒醬 200g", carrefourPrice: 85 },
      { name: "白飯", qty: "4碗", isMain: true, category: "staples", pxProduct: "南僑膳纖熟飯 200g/4盒", pxPrice: 150, carrefourProduct: "御用熟白飯微波即食包 3入/2袋", carrefourPrice: 160 },
      { name: "青蔥", qty: "2支", isMain: false, category: "pantry", pxProduct: "本產青蔥包", pxPrice: 28, carrefourProduct: "本產有機青蔥 150g", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "醃肉備料線", instruction: "豬肉片切成 3cm 段，洋蔥切絲，蔥切蔥花。將豬肉片與韓式辣椒醬2匙＋醬油1匙＋糖1匙＋麻油1匙抓醃5分鐘。", duration: 150, voiceText: "第一步，豬肉片切成三公分小段，洋蔥切絲，蔥切蔥花。把豬肉片和韓式辣椒醬兩匙、醬油一匙、糖一匙、麻油一匙拌勻，醃五分鐘讓肉入味。" },
      { order: 2, threadId: 2, threadLabel: "電器等待線", instruction: "白飯放入電鍋或微波爐加熱備用。", duration: 360, voiceText: "第二步，白飯放入電鍋或微波加熱。" },
      { order: 3, threadId: 1, threadLabel: "爐火翻炒線", instruction: "平底鍋大火燒熱，下1匙油，放入洋蔥絲大火炒30秒，再放入醃好的豬肉片大火翻炒2分鐘至熟。", duration: 180, voiceText: "第三步，平底鍋大火燒熱，下油，先放洋蔥絲大火炒三十秒，再放入醃好的豬肉片，大火快速翻炒兩分鐘到豬肉完全熟透。" },
      { order: 4, threadId: 1, threadLabel: "爐火翻炒線", instruction: "撒上芝麻粒，盛在熱白飯上，撒蔥花，放上一顆荷包蛋（可選），韓式辣炒豬肉飯完成！", duration: 60, voiceText: "最後，撒上芝麻粒增香，把辣炒豬肉盛在熱白飯上，撒蔥花。想更豐盛可以加一顆半熟荷包蛋！韓式辣炒豬肉飯完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 10 │ 越式雞肉米線
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-vnpho",
    title: "越式雞肉米線",
    cuisine: "越式清爽",
    prepTime: 5, cookTime: 15, totalTime: 20,
    difficulty: "20分完成", servings: 4, calories: 380,
    imageFallback: "🍜",
    tags: ["清爽低熱量", "高蛋白", "夏天首選"],
    description: "越式河粉的清湯精髓在薑的焦香！快速版本利用雞高湯塊取代長時間熬湯，搭配白煮雞胸撕絲、燙豆芽菜，清爽又飽足。",
    ingredients: [
      { name: "雞胸肉", qty: "2塊(約400g)", isMain: true, category: "proteins", pxProduct: "本產鮮雞胸肉 300g/2包", pxPrice: 98, carrefourProduct: "家樂福鮮切雞胸肉 400g", carrefourPrice: 108 },
      { name: "米線", qty: "200g", isMain: true, category: "staples", pxProduct: "台灣米線乾貨 200g", pxPrice: 35, carrefourProduct: "家樂福越南風味米線 500g", carrefourPrice: 55 },
      { name: "豆芽菜", qty: "1包(250g)", isMain: false, category: "veggies", pxProduct: "有機黃豆芽包 250g", pxPrice: 19, carrefourProduct: "家樂福鮮豆芽菜 300g", carrefourPrice: 15 },
      { name: "薑", qty: "3片", isMain: false, category: "pantry", pxProduct: "本產老薑塊 300g", pxPrice: 29, carrefourProduct: "家樂福有機老薑 150g", carrefourPrice: 32 },
      { name: "檸檬", qty: "1顆", isMain: false, category: "pantry", pxProduct: "無籽綠檸檬/3入袋", pxPrice: 49, carrefourProduct: "履歷綠檸檬 600g", carrefourPrice: 55 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "湯底備料線", instruction: "薑片用乾鍋中火烤至微焦出香，備好豆芽菜洗淨，檸檬切角，蔥切蔥花，辣椒切圈。", duration: 90, voiceText: "第一步，薑片放入乾鍋中火烤到微焦，會讓湯底更香。同時洗淨豆芽菜，檸檬切成角，蔥切蔥花，辣椒切圈備用。" },
      { order: 2, threadId: 2, threadLabel: "煮雞高湯線", instruction: "湯鍋加水 1200ml，放入雞胸肉與薑片，加高湯塊1顆，中火煮 12 分鐘至雞胸熟透。", duration: 720, voiceText: "第二步，鍋裡加一千兩百毫升的水，放入雞胸肉和薑片，加一顆雞高湯塊，中火煮十二分鐘，把雞胸肉煮熟。" },
      { order: 3, threadId: 2, threadLabel: "煮雞高湯線", instruction: "另一鍋燒水，水滾後燙米線 3-4 分鐘至軟，撈起瀝乾，最後 1 分鐘投入豆芽菜燙熟。", duration: 300, voiceText: "第三步，另外一鍋燒水，水滾後把米線放入燙三到四分鐘到軟，最後一分鐘加入豆芽菜一起燙熟，全部撈起瀝乾。" },
      { order: 4, threadId: 1, threadLabel: "湯底備料線", instruction: "將煮好的雞胸肉撈出，用兩支叉子順紋路撕成細絲。高湯以魚露、鹽調味。", duration: 120, voiceText: "第四步，把煮好的雞胸肉撈起，用兩支叉子順著紋路撕成細絲。鍋裡的高湯用魚露和少許鹽巴調整鹹度。" },
      { order: 5, threadId: 1, threadLabel: "湯底備料線", instruction: "碗中放入米線、豆芽菜、雞絲，注入熱高湯，放上蔥花、辣椒，擠入檸檬汁，清爽開動！", duration: 60, voiceText: "最後，在碗裡放米線、豆芽菜、雞絲，倒入熱湯，放蔥花和辣椒圈，擠一點檸檬汁提味，清爽的越式雞肉米線完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 11 │ 快速印度奶油咖喱雞
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-butterchicken",
    title: "快速印度奶油咖喱雞",
    cuisine: "南亞異國",
    prepTime: 5, cookTime: 20, totalTime: 25,
    difficulty: "週末升級", servings: 4, calories: 560,
    imageFallback: "🍛",
    tags: ["異國療癒感", "一鍋燉煮", "椰奶香濃"],
    description: "利用市售印度咖喱醬包與椰奶罐頭，省去自製香料的複雜程序。雞腿肉比雞胸更多汁，燉煮時釋放油脂讓咖喱醬更濃郁，搭配熱白飯超滿足！",
    ingredients: [
      { name: "雞腿", qty: "2支去骨(約350g)", isMain: true, category: "proteins", pxProduct: "台灣去骨雞腿排 2片/300g", pxPrice: 128, carrefourProduct: "家樂福去骨雞腿排 2片/320g", carrefourPrice: 138 },
      { name: "洋蔥", qty: "1顆", isMain: true, category: "veggies", pxProduct: "進口黃洋蔥/2顆", pxPrice: 39, carrefourProduct: "有機黃洋蔥 600g", carrefourPrice: 45 },
      { name: "咖喱醬", qty: "2大匙", isMain: true, category: "pantry", pxProduct: "S&B印度咖喱醬辣味 100g", pxPrice: 65, carrefourProduct: "家樂福印度香料咖喱醬 100g", carrefourPrice: 59 },
      { name: "椰奶", qty: "400ml", isMain: true, category: "pantry", pxProduct: "媽媽牌椰漿 400ml/罐", pxPrice: 45, carrefourProduct: "家樂福泰式椰漿 400ml", carrefourPrice: 42 },
      { name: "白飯", qty: "4碗", isMain: true, category: "staples", pxProduct: "南僑膳纖熟飯 200g/4盒", pxPrice: 150, carrefourProduct: "御用熟白飯微波即食包 3入/2袋", carrefourPrice: 160 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "去骨雞腿切成大塊（約 4-5cm），洋蔥切絲，準備好咖喱醬與椰奶罐頭。", duration: 120, voiceText: "第一步，去骨雞腿切成四到五公分的大塊，洋蔥切絲，把咖喱醬和椰奶罐頭準備好。" },
      { order: 2, threadId: 2, threadLabel: "電器等待線", instruction: "白飯放入電鍋或微波加熱。", duration: 600, voiceText: "第二步，白飯放入電鍋加熱。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "鍋中下 2 匙油，中大火炒洋蔥絲至金黃軟化（約 3 分鐘）。", duration: 180, voiceText: "第三步，鍋中下兩匙油，中大火炒洋蔥絲，炒三分鐘到洋蔥金黃軟化出甜味。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "加入咖喱醬翻炒 1 分鐘炒出香氣，放入雞肉塊翻炒 2 分鐘讓雞肉表面上色。", duration: 180, voiceText: "第四步，加入咖喱醬翻炒一分鐘炒出香氣，放入雞肉塊翻炒兩分鐘，讓雞肉表面均勻裹上咖喱醬並上色。" },
      { order: 5, threadId: 1, threadLabel: "爐火備料線", instruction: "倒入椰奶，大火煮滾後轉中小火燉煮 10 分鐘至雞肉熟透、醬汁微稠。撒上香菜或蔥花上桌！", duration: 600, voiceText: "第五步，倒入整罐椰奶，大火煮滾後轉中小火燉煮十分鐘，到雞肉熟透醬汁微稠。盛在熱白飯旁，撒香菜或蔥花，印度奶油咖喱雞完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 12 │ 墨西哥辣牛肉飯碗
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-mexbeef",
    title: "墨西哥辣牛肉飯碗",
    cuisine: "墨式風情",
    prepTime: 5, cookTime: 15, totalTime: 20,
    difficulty: "20分完成", servings: 4, calories: 510,
    imageFallback: "🌮",
    tags: ["異國新鮮感", "孜然香料", "超大份量"],
    description: "不需要玉米餅，用白飯就能享受墨式風情！超市牛肉片加洋蔥、番茄，以孜然粉和辣椒粉快速調味，擠入萊姆汁提鮮，讓全家人耳目一新！",
    ingredients: [
      { name: "牛肉片", qty: "350g", isMain: true, category: "proteins", pxProduct: "美國牛五花肉片 200g/2包", pxPrice: 198, carrefourProduct: "家樂福嚴選冷藏牛五花肉片 350g", carrefourPrice: 220 },
      { name: "洋蔥", qty: "1顆", isMain: true, category: "veggies", pxProduct: "進口黃洋蔥/2顆", pxPrice: 39, carrefourProduct: "有機黃洋蔥 600g", carrefourPrice: 45 },
      { name: "番茄", qty: "2顆", isMain: true, category: "veggies", pxProduct: "台灣牛番茄 600g/袋", pxPrice: 49, carrefourProduct: "家樂福履歷牛番茄 4入", carrefourPrice: 55 },
      { name: "白飯", qty: "4碗", isMain: true, category: "staples", pxProduct: "南僑膳纖熟飯 200g/4盒", pxPrice: 150, carrefourProduct: "御用熟白飯微波即食包 3入/2袋", carrefourPrice: 160 },
      { name: "檸檬", qty: "1顆(萊姆)", isMain: false, category: "pantry", pxProduct: "無籽綠檸檬/3入袋", pxPrice: 49, carrefourProduct: "履歷綠檸檬 600g", carrefourPrice: 55 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "備料炒肉線", instruction: "牛肉片切成 3cm 段，洋蔥切丁，番茄切粗丁，萊姆切角備用。", duration: 120, voiceText: "第一步，牛肉片切三公分小段，洋蔥切成小丁，番茄切成粗丁，萊姆（或檸檬）切角備用。" },
      { order: 2, threadId: 2, threadLabel: "電器等待線", instruction: "白飯放入電鍋或微波加熱。", duration: 600, voiceText: "第二步，白飯放入電鍋加熱。" },
      { order: 3, threadId: 1, threadLabel: "備料炒肉線", instruction: "鍋中下 2 匙油，大火炒洋蔥丁 1 分鐘，放入牛肉片大火翻炒 2 分鐘至熟，撒孜然粉1茶匙＋辣椒粉0.5茶匙。", duration: 180, voiceText: "第三步，鍋下兩匙油，大火炒洋蔥丁一分鐘，放入牛肉片大火翻炒兩分鐘，撒上孜然粉一茶匙和辣椒粉半茶匙，翻炒均勻。" },
      { order: 4, threadId: 1, threadLabel: "備料炒肉線", instruction: "加入番茄丁翻炒 2 分鐘至軟化出汁，以鹽巴調味收汁。", duration: 120, voiceText: "第四步，放入番茄丁翻炒兩分鐘到番茄軟化出汁，加少許鹽巴調味，讓醬汁稍微收乾。" },
      { order: 5, threadId: 1, threadLabel: "備料炒肉線", instruction: "盛在白飯旁，擠入萊姆汁，撒上香菜或蔥花，墨式牛肉飯碗上桌！", duration: 60, voiceText: "最後，把墨西哥辣牛肉盛在熱白飯旁，大方地擠入萊姆汁，撒香菜或蔥花，充滿異國感的墨式牛肉碗完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 13 │ 薑蔥電鍋清蒸鱸魚（免開火）
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-steamfish",
    title: "薑蔥電鍋清蒸鱸魚",
    cuisine: "台式清蒸",
    prepTime: 5, cookTime: 15, totalTime: 20,
    difficulty: "免開火", servings: 4, calories: 320,
    imageFallback: "🐟",
    tags: ["完全免開火", "高蛋白低脂", "電鍋超輕鬆"],
    description: "電鍋是台灣媽媽的秘密武器！鱸魚排放入電鍋蒸 12 分鐘，趁機備好薑蔥絲，出鍋後澆上最後一瓢滾燙熱油，清蒸魚就在廚房飄香了！",
    ingredients: [
      { name: "鱸魚", qty: "2片(約400g)", isMain: true, category: "proteins", pxProduct: "嚴選鮮凍金目鱸魚排 200g/2包", pxPrice: 178, carrefourProduct: "特選金目鱸魚排 200g/2片", carrefourPrice: 190 },
      { name: "薑", qty: "5片", isMain: false, category: "pantry", pxProduct: "本產老薑塊 300g", pxPrice: 29, carrefourProduct: "家樂福有機老薑 150g", carrefourPrice: 32 },
      { name: "青蔥", qty: "3支", isMain: false, category: "pantry", pxProduct: "本產青蔥包", pxPrice: 28, carrefourProduct: "本產有機青蔥 150g", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "備料線", instruction: "鱸魚排洗淨用廚房紙巾擦乾，撒少許鹽與米酒醃 3 分鐘去腥。薑 3 片鋪在盤底，魚排放上。", duration: 90, voiceText: "第一步，鱸魚排用廚房紙巾擦乾，撒少許鹽和米酒醃三分鐘去腥。把三片薑鋪在盤底，魚排放上去。" },
      { order: 2, threadId: 2, threadLabel: "電鍋蒸魚線", instruction: "電鍋外鍋加 1 杯水，放入醃好的魚排盤，按下開關蒸 12-14 分鐘至熟透。", duration: 780, voiceText: "第二步，電鍋外鍋加一杯水，把魚排盤放進去，按下開關蒸十二到十四分鐘。" },
      { order: 3, threadId: 1, threadLabel: "備料線", instruction: "利用蒸魚時間：薑2片切細絲，青蔥全切蔥絲，調蒸魚醬汁（醬油2匙＋麻油1匙＋少許糖）。", duration: 120, voiceText: "第三步，趁蒸魚的時間，把剩下的薑切成細絲，青蔥也切成蔥絲。調好蒸魚醬汁：醬油兩匙、麻油一匙、少許糖拌勻。" },
      { order: 4, threadId: 2, threadLabel: "電鍋蒸魚線", instruction: "電鍋開關跳起後，取出魚盤，倒掉多餘蒸出的水分，鋪上薑蔥絲，淋上醬汁。", duration: 60, voiceText: "第四步，電鍋開關跳起，把魚盤取出，倒掉盤底多餘的蒸魚水，鋪上剛才切好的薑蔥絲，淋上醬汁。" },
      { order: 5, threadId: 1, threadLabel: "備料線", instruction: "另起小鍋或微波 2 匙油至冒煙，迅速淋在魚上的薑蔥絲，聽到滋滋作響聲即告完成！", duration: 60, voiceText: "最後一步，用小鍋或微波把兩匙油加熱到冒煙，迅速淋在薑蔥絲上，聽到滋滋的聲響就代表完成了！清蒸鱸魚香氣四溢，開動！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 14 │ 義式白酒蛤蜊細麵
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-clampasta",
    title: "義式白酒蛤蜊細麵",
    cuisine: "義式海鮮",
    prepTime: 5, cookTime: 15, totalTime: 20,
    difficulty: "20分完成", servings: 4, calories: 440,
    imageFallback: "🐚",
    tags: ["海鮮鮮甜", "白酒清爽", "義大利餐廳等級"],
    description: "蛤蜊白酒麵的精髓是蛤蜊開殼瞬間的那鍋鮮甜湯汁！利用白酒蒸開蛤蜊，湯汁直接拌麵，不需要加鹽，鮮味已足！",
    ingredients: [
      { name: "蛤蜊", qty: "500g", isMain: true, category: "proteins", pxProduct: "台灣活蛤蜊吐沙包 600g", pxPrice: 89, carrefourProduct: "家樂福鮮活文蛤 500g", carrefourPrice: 95 },
      { name: "義大利麵", qty: "320g", isMain: true, category: "staples", pxProduct: "Barilla百味來義大利直麵 500g", pxPrice: 79, carrefourProduct: "家樂福義大利直麵 500g", carrefourPrice: 65 },
      { name: "蒜頭", qty: "5瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 },
      { name: "九層塔", qty: "1小把", isMain: false, category: "veggies", pxProduct: "有機九層塔盒裝", pxPrice: 35, carrefourProduct: "新鮮九層塔包", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "蛤蜊洗淨（超市吐沙包可直接用），蒜頭切薄片，九層塔摘葉備用，準備白酒 60ml。", duration: 90, voiceText: "第一步，蛤蜊洗淨，蒜頭切薄片，九層塔摘葉，準備六十毫升的白酒或米酒備用。" },
      { order: 2, threadId: 2, threadLabel: "煮麵線", instruction: "大鍋燒沸水，加少許鹽，放入義大利麵按包裝時間煮（通常 8-10 分鐘），留下 100ml 麵湯！", duration: 600, voiceText: "第二步，大鍋燒開水，加少許鹽，放入義大利麵，按包裝指示時間煮（通常八到十分鐘）。記得保留一百毫升的麵湯！" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "平底深鍋下 3 匙橄欖油，中火爆香蒜片至金黃，加入蛤蜊翻炒 30 秒，淋入白酒。", duration: 90, voiceText: "第三步，平底深鍋下三匙橄欖油，中火把蒜片炒到金黃香酥，加入蛤蜊翻炒三十秒，淋入白酒。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "蓋鍋大火蒸 2-3 分鐘至蛤蜊全部開殼，撈除未開殼的，加入 50ml 麵湯調整醬汁濃度。", duration: 150, voiceText: "第四步，蓋上鍋蓋大火蒸兩三分鐘直到蛤蜊全部打開殼。未開的要撈掉，加五十毫升麵湯調整醬汁濃度。" },
      { order: 5, threadId: 1, threadLabel: "爐火備料線", instruction: "煮好的麵條（預留麵湯）放入蛤蜊鍋中，大火拌炒 30 秒，投入九層塔，起鍋！", duration: 60, voiceText: "最後，把煮好的義大利麵放入蛤蜊鍋，大火翻炒三十秒讓麵條充分吸收蛤蜊鮮湯，放入九層塔，起鍋裝盤！白酒蛤蜊細麵完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 15 │ 台式蔥爆豬里肌
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-scallionpork",
    title: "台式蔥爆豬里肌",
    cuisine: "台式快炒",
    prepTime: 5, cookTime: 7, totalTime: 12,
    difficulty: "12分最速", servings: 4, calories: 420,
    imageFallback: "🥩",
    tags: ["蔥香嗆辣", "下飯神器", "快炒 12 分"],
    description: "台灣傳統小炒的靈魂之作！豬里肌先用太白粉抓醃鎖住肉汁，大火爆香薑片，蔥段在最後下鍋才能保持嗆辣香氣，一口下去超級下飯！",
    ingredients: [
      { name: "豬肉片", qty: "350g", isMain: true, category: "proteins", pxProduct: "台灣豬梅花薄片 200g/2包", pxPrice: 118, carrefourProduct: "家樂福嚴選冷藏豬梅花肉片 350g", carrefourPrice: 128 },
      { name: "青蔥", qty: "4支", isMain: true, category: "pantry", pxProduct: "本產青蔥包", pxPrice: 28, carrefourProduct: "本產有機青蔥 150g", carrefourPrice: 32 },
      { name: "薑", qty: "3片", isMain: false, category: "pantry", pxProduct: "本產老薑塊 300g", pxPrice: 29, carrefourProduct: "家樂福有機老薑 150g", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "豬肉片切 3cm 段，與醬油1匙＋米酒1匙＋太白粉1匙＋糖0.5匙抓醃 3 分鐘。薑切片，蔥切斜段（蔥白與蔥綠分開）。", duration: 120, voiceText: "第一步，豬肉片切成三公分小段，加醬油一匙、米酒一匙、太白粉一匙、糖半匙，用手抓醃三分鐘。薑切片，蔥切成斜段，蔥白和蔥綠要分開放。" },
      { order: 2, threadId: 1, threadLabel: "爐火備料線", instruction: "鍋中下 2 匙油，大火爆香薑片與蔥白段至香氣出來（約 30 秒）。", duration: 60, voiceText: "第二步，鍋下兩匙油燒熱，大火放入薑片和蔥白段爆香三十秒，等嗆辣的蔥薑香氣飄出來。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "下醃好的豬肉片，大火翻炒 2 分鐘至肉片全部熟透變色。", duration: 120, voiceText: "第三步，放入醃好的豬肉片，大火翻炒兩分鐘到豬肉片全部熟透、顏色變白。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "投入蔥綠段，大火翻炒 15 秒即起鍋，蔥段保持嫩綠才是正確的！", duration: 45, voiceText: "最後一步，把蔥綠段全部放入，大火翻炒十五秒就立刻起鍋！蔥綠要保持翠綠嫩香，不要炒過頭。台式蔥爆豬肉完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 16 │ 日式味噌豬肉蔬菜鍋
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-misonabe",
    title: "日式味噌豬肉蔬菜鍋",
    cuisine: "日式暖鍋",
    prepTime: 5, cookTime: 10, totalTime: 15,
    difficulty: "15分極速", servings: 4, calories: 380,
    imageFallback: "🍲",
    tags: ["療癒暖胃", "低熱量高纖", "冬天必備"],
    description: "日式豬肉味噌鍋的關鍵：味噌必須在最後關火前才溶入湯中，避免煮沸後香氣流失！利用電熱水壺縮短燒水時間，15 分鐘端出暖心熱鍋。",
    ingredients: [
      { name: "豬肉片", qty: "200g", isMain: true, category: "proteins", pxProduct: "台灣豬梅花薄片 200g/1包", pxPrice: 59, carrefourProduct: "家樂福嚴選冷藏豬梅花肉片 200g", carrefourPrice: 65 },
      { name: "大白菜", qty: "1/4顆", isMain: true, category: "veggies", pxProduct: "台灣大白菜 1顆", pxPrice: 29, carrefourProduct: "家樂福大白菜 1.2kg", carrefourPrice: 35 },
      { name: "嫩豆腐", qty: "1盒(300g)", isMain: true, category: "proteins", pxProduct: "中華有機嫩豆腐 300g", pxPrice: 18, carrefourProduct: "義美嫩豆腐 300g", carrefourPrice: 17 },
      { name: "金針菇", qty: "1包", isMain: false, category: "veggies", pxProduct: "有機金針菇包/2包", pxPrice: 24, carrefourProduct: "履歷鮮金針菇", carrefourPrice: 14 },
      { name: "味噌", qty: "3大匙", isMain: true, category: "pantry", pxProduct: "丸松白味噌 500g", pxPrice: 85, carrefourProduct: "丸美屋麥味噌 500g", carrefourPrice: 79 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "備料線", instruction: "大白菜切成適口大小，金針菇切除根部撕開，嫩豆腐切厚片，青蔥切蔥花。", duration: 120, voiceText: "第一步，大白菜切成適口大小，金針菇切掉根部並撕開，嫩豆腐切成大厚片，青蔥切蔥花備用。" },
      { order: 2, threadId: 2, threadLabel: "電熱水壺線", instruction: "電熱水壺燒開 800ml 熱水（省去爐火上燒水的時間！）。", duration: 240, voiceText: "第二步，用電熱水壺燒八百毫升的開水。快煮壺比爐火燒水快得多！" },
      { order: 3, threadId: 1, threadLabel: "備料線", instruction: "湯鍋中將大白菜、金針菇、豆腐片整齊排入，豬肉片攤開覆蓋在最上面。", duration: 90, voiceText: "第三步，湯鍋裡先鋪入大白菜，再排上金針菇和豆腐片，最後把豬肉片攤開覆蓋在最上面。" },
      { order: 4, threadId: 1, threadLabel: "備料線", instruction: "倒入燒好的熱水至八分滿，大火煮滾後轉中火蓋鍋煮 5 分鐘至白菜軟化。", duration: 360, voiceText: "第四步，把燒好的熱水倒入鍋中至八分滿，大火煮滾後轉中火蓋鍋煮五分鐘，等大白菜和豬肉完全熟透。" },
      { order: 5, threadId: 1, threadLabel: "備料線", instruction: "關火，用湯匙取 3 大匙味噌加少許湯汁化開，溶入鍋中，撒蔥花，不要再煮沸，立刻開動！", duration: 60, voiceText: "最後一步，先關火！拿湯匙取三大匙味噌，加少許鍋中熱湯化開，再溶入鍋中攪勻，撒上蔥花。味噌不能再煮沸，否則香氣流失。立刻開動！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 17 │ 泰式椰汁南瓜咖喱（全素）
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-pumpkincurry",
    title: "泰式椰汁南瓜咖喱（全素）",
    cuisine: "東南亞全素",
    prepTime: 5, cookTime: 20, totalTime: 25,
    difficulty: "週末升級", servings: 4, calories: 390,
    imageFallback: "🎃",
    tags: ["全素健康", "椰香濃郁", "免肉也好吃"],
    description: "南瓜的自然甜味與泰式紅咖喱醬的辛香完美互補！以椰奶取代鮮奶油，讓這道咖喱更清爽輕盈，全素的人也能享受異國風味晚餐。",
    ingredients: [
      { name: "南瓜", qty: "400g", isMain: true, category: "veggies", pxProduct: "台灣栗子南瓜 1顆/500g", pxPrice: 55, carrefourProduct: "家樂福日本栗子南瓜 600g", carrefourPrice: 65 },
      { name: "椰奶", qty: "400ml", isMain: true, category: "pantry", pxProduct: "媽媽牌椰漿 400ml/罐", pxPrice: 45, carrefourProduct: "家樂福泰式椰漿 400ml", carrefourPrice: 42 },
      { name: "咖喱醬", qty: "2大匙", isMain: true, category: "pantry", pxProduct: "S&B泰式紅咖喱醬 100g", pxPrice: 65, carrefourProduct: "家樂福泰式紅咖喱醬 100g", carrefourPrice: 59 },
      { name: "白飯", qty: "4碗", isMain: true, category: "staples", pxProduct: "南僑膳纖熟飯 200g/4盒", pxPrice: 150, carrefourProduct: "御用熟白飯微波即食包 3入/2袋", carrefourPrice: 160 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "南瓜去籽切成約 3cm 塊狀（不用去皮，皮可以食用），備好椰奶與咖喱醬。", duration: 120, voiceText: "第一步，南瓜去籽切成三公分塊狀，栗子南瓜皮可以直接吃不用去皮。椰奶和咖喱醬先準備好。" },
      { order: 2, threadId: 2, threadLabel: "電器等待線", instruction: "白飯放入電鍋或微波加熱。", duration: 600, voiceText: "第二步，白飯放入電鍋加熱。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "鍋中下 1 匙油，放入泰式咖喱醬，中小火炒 1 分鐘炒出香氣。", duration: 90, voiceText: "第三步，鍋下一匙油，放入泰式紅咖喱醬，中小火炒一分鐘，把咖喱醬的香氣炒出來。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "倒入椰奶，加入南瓜塊，大火煮滾後轉中小火，蓋鍋燉煮 12 分鐘至南瓜熟軟。", duration: 780, voiceText: "第四步，倒入整罐椰奶，加入南瓜塊，大火煮滾後轉中小火，蓋鍋燉煮十二分鐘到南瓜用筷子能戳透。" },
      { order: 5, threadId: 1, threadLabel: "爐火備料線", instruction: "以魚露（或醬油）和糖調整鹹甜，盛在熱白飯旁，撒香菜葉或九層塔！", duration: 60, voiceText: "最後，嚐一下味道，用魚露或醬油調整鹹度，加少許糖平衡。盛在熱白飯旁，撒上香菜葉或九層塔，泰式椰汁南瓜咖喱完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 18 │ 地中海氣炸迷迭香雞腿（免開火）
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-medchicken",
    title: "地中海氣炸迷迭香雞腿",
    cuisine: "地中海・免開火",
    prepTime: 5, cookTime: 20, totalTime: 25,
    difficulty: "免開火・免看火", servings: 4, calories: 490,
    imageFallback: "🍗",
    tags: ["完全免開火", "外酥內嫩", "氣炸鍋"],
    description: "氣炸鍋讓雞腿皮酥肉嫩，完全不輸傳統烤箱！醃好雞腿後送進氣炸鍋，不需要守著爐火，利用等待時間完成其他晚餐準備。",
    ingredients: [
      { name: "雞腿", qty: "2支(約500g)", isMain: true, category: "proteins", pxProduct: "台灣鮮切仿土雞腿 2支/450g", pxPrice: 138, carrefourProduct: "家樂福國產雞腿 2支/480g", carrefourPrice: 148 },
      { name: "彩椒", qty: "2顆", isMain: false, category: "veggies", pxProduct: "彩色甜椒袋裝/2入", pxPrice: 69, carrefourProduct: "有機彩色甜椒 300g", carrefourPrice: 75 },
      { name: "蒜頭", qty: "4瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 },
      { name: "檸檬", qty: "1顆", isMain: false, category: "pantry", pxProduct: "無籽綠檸檬/3入袋", pxPrice: 49, carrefourProduct: "履歷綠檸檬 600g", carrefourPrice: 55 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "醃製備料線", instruction: "雞腿在雞皮上劃幾刀幫助入味，蒜頭切碎，彩椒切大塊，檸檬擠汁。將雞腿與蒜碎、橄欖油2匙、檸檬汁、鹽、黑胡椒、迷迭香抓醃均勻。", duration: 180, voiceText: "第一步，雞腿在雞皮上劃幾刀，幫助醃料入味。蒜頭切碎，彩椒切大塊，檸檬擠汁。把雞腿和蒜碎、橄欖油兩匙、檸檬汁、鹽、黑胡椒、迷迭香混合抓醃均勻。" },
      { order: 2, threadId: 2, threadLabel: "氣炸鍋線", instruction: "氣炸鍋設定 200 度預熱 3 分鐘。預熱後放入雞腿（雞皮朝上）與彩椒塊，設定 200 度烤 18-20 分鐘。", duration: 1380, voiceText: "第二步，氣炸鍋設定兩百度預熱三分鐘。預熱好後把雞腿雞皮朝上放入，彩椒塊排在旁邊，設定兩百度烤十八到二十分鐘。" },
      { order: 3, threadId: 1, threadLabel: "醃製備料線", instruction: "等待氣炸期間，可以準備沙拉或熱飯，讓晚餐更豐盛。", duration: 900, voiceText: "第三步，等氣炸鍋工作的這段時間，您可以去準備沙拉、熱白飯，或者陪孩子完成功課！" },
      { order: 4, threadId: 1, threadLabel: "醃製備料線", instruction: "氣炸完成後取出，雞腿雞皮金黃酥脆！擠上新鮮檸檬汁，撒鹽之花或海鹽，盛盤上桌！", duration: 60, voiceText: "最後，氣炸鍋完成後取出雞腿，雞皮應該是金黃酥脆的！擠上新鮮檸檬汁，撒一點海鹽，盛盤上桌。地中海迷迭香雞腿完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 19 │ 川式宮保雞丁
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-kungpao",
    title: "川式宮保雞丁",
    cuisine: "川式快炒",
    prepTime: 5, cookTime: 10, totalTime: 15,
    difficulty: "15分極速", servings: 4, calories: 450,
    imageFallback: "🌶️",
    tags: ["酸甜辣均衡", "花生香脆", "川菜入門"],
    description: "宮保雞丁的靈魂是「荔枝味型」醬汁：醬油、醋、糖三者完美平衡，搭配花椒辣椒的麻辣底蘊。超市有售宮保醬包，家庭版輕鬆搞定！",
    ingredients: [
      { name: "雞胸肉", qty: "400g", isMain: true, category: "proteins", pxProduct: "本產鮮雞胸肉 300g/2包", pxPrice: 98, carrefourProduct: "家樂福鮮切雞胸肉 400g", carrefourPrice: 108 },
      { name: "青椒", qty: "1顆", isMain: false, category: "veggies", pxProduct: "本產青椒 4入盒裝", pxPrice: 39, carrefourProduct: "有機青椒包 300g", carrefourPrice: 45 },
      { name: "蒜頭", qty: "4瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 },
      { name: "薑", qty: "3片", isMain: false, category: "pantry", pxProduct: "本產老薑塊 300g", pxPrice: 29, carrefourProduct: "家樂福有機老薑 150g", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "雞胸肉切成 1.5cm 正方丁，與醬油1匙＋米酒1匙＋太白粉1匙抓醃 5 分鐘。青椒切丁，薑蒜切末。", duration: 150, voiceText: "第一步，雞胸肉切成一點五公分的正方小丁，加醬油、米酒、太白粉各一匙抓醃五分鐘。青椒切丁，薑蒜切成細末備用。" },
      { order: 2, threadId: 1, threadLabel: "爐火備料線", instruction: "調宮保醬汁：醬油2匙＋陳醋1匙＋糖1.5匙＋太白粉水1匙，拌勻備用。", duration: 60, voiceText: "第二步，小碗調宮保醬汁：醬油兩匙、陳醋一匙、糖一匙半、太白粉水一匙，攪拌均勻備用。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "鍋下 3 匙油燒至冒煙，放入乾辣椒 3-5 支（可省）與薑蒜末爆香 20 秒。", duration: 60, voiceText: "第三步，鍋下三匙油燒至微微冒煙，放入乾辣椒（想辣可以多放）與薑蒜末，爆香二十秒。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "放入雞丁大火翻炒 2 分鐘至表面金黃熟透，加入青椒丁翻炒 30 秒。", duration: 150, voiceText: "第四步，放入雞丁大火翻炒兩分鐘到表面金黃熟透，加入青椒丁繼續翻炒三十秒。" },
      { order: 5, threadId: 1, threadLabel: "爐火備料線", instruction: "淋入宮保醬汁，加入花生 50g（可用無鹽花生米），大火拌炒至醬汁收乾濃稠，起鍋！", duration: 60, voiceText: "最後，淋入調好的宮保醬汁，加入花生米，大火翻炒讓醬汁均勻裹上雞丁和花生，醬汁收乾濃稠即可起鍋！酸甜辣的宮保雞丁完成！" }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  //  食譜 20 │ 台式麻婆豆腐
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-mapotofu",
    title: "台式麻婆豆腐",
    cuisine: "台式豆腐料理",
    prepTime: 3, cookTime: 9, totalTime: 12,
    difficulty: "12分最速", servings: 4, calories: 350,
    imageFallback: "🟫",
    tags: ["麻辣下飯", "豆腐高鈣", "12分鐘完成"],
    description: "台式麻婆豆腐比川式更溫和，微辣帶甜！豬肉碎爆香辣豆瓣醬後，加入嫩豆腐小火燉入味，勾芡後淋麻油，軟嫩滑溜讓全家人搶食！",
    ingredients: [
      { name: "嫩豆腐", qty: "2盒(600g)", isMain: true, category: "proteins", pxProduct: "中華有機嫩豆腐 300g/2盒", pxPrice: 36, carrefourProduct: "義美嫩豆腐 300g/2盒", carrefourPrice: 34 },
      { name: "豬肉碎", qty: "200g", isMain: true, category: "proteins", pxProduct: "冷藏台灣豬細絞肉 200g/1包", pxPrice: 48, carrefourProduct: "家樂福嚴選冷藏豬絞肉 200g", carrefourPrice: 55 },
      { name: "蒜頭", qty: "4瓣", isMain: false, category: "pantry", pxProduct: "本產蒜瓣袋裝", pxPrice: 45, carrefourProduct: "特選履歷蒜頭 300g", carrefourPrice: 49 },
      { name: "青蔥", qty: "3支", isMain: false, category: "pantry", pxProduct: "本產青蔥包", pxPrice: 28, carrefourProduct: "本產有機青蔥 150g", carrefourPrice: 32 }
    ],
    parallelSteps: [
      { order: 1, threadId: 1, threadLabel: "爐火備料線", instruction: "嫩豆腐切成 2cm 小方塊（輕拿輕放），蒜頭切末，蔥切蔥花（蔥白蔥綠分開）。備好辣豆瓣醬 2 大匙。", duration: 90, voiceText: "第一步，嫩豆腐輕輕切成兩公分小方塊要輕拿輕放不要壓碎，蒜頭切末，蔥切蔥花，蔥白和蔥綠分開放。辣豆瓣醬準備好兩大匙。" },
      { order: 2, threadId: 1, threadLabel: "爐火備料線", instruction: "鍋下 2 匙油，放入豬肉碎和蒜末，中火炒至豬肉散開變色，加入辣豆瓣醬翻炒 1 分鐘炒出紅油香氣。", duration: 120, voiceText: "第二步，鍋下兩匙油，放入豬肉碎和蒜末，中火翻炒到豬肉散開變色，加入辣豆瓣醬繼續炒一分鐘，炒出漂亮的紅色辣油香氣。" },
      { order: 3, threadId: 1, threadLabel: "爐火備料線", instruction: "加入 150ml 水，放入豆腐塊，醬油1匙、糖0.5匙調味，輕輕推動讓醬汁均勻，中小火燉 3 分鐘讓豆腐入味。", duration: 180, voiceText: "第三步，加一百五十毫升的水，輕輕放入豆腐塊，加醬油一匙和少許糖，用鍋鏟輕輕推動讓豆腐沾上醬汁，中小火燉三分鐘讓豆腐充分入味。" },
      { order: 4, threadId: 1, threadLabel: "爐火備料線", instruction: "以太白粉水 2 匙勾薄芡，輕推均勻後，關火淋少許麻油，撒上蔥花，台式麻婆豆腐完成！", duration: 60, voiceText: "最後，把兩匙太白粉水分兩次加入，輕推鍋中讓湯汁慢慢變稠。關火後淋少許麻油提香，撒上大量蔥花，台式麻婆豆腐完成！" }
    ]
  },

  // ── 台式 新增 ──
  {
    id:"rec-lu-rou", title:"台式滷肉飯", cuisine:"台式家常",
    prepTime:5, cookTime:20, totalTime:25, difficulty:"25分入味", servings:4, calories:580, imageFallback:"🍖",
    tags:["入口即化","下飯神器","老少皆宜"],
    description:"五花肉丁炒出油脂後以醬油、冰糖、八角慢燉，滷汁澆在白飯上，鹹甜入味，是台灣家庭最思念的味道。",
    ingredients:[
      {name:"五花肉",qty:"400g",isMain:true,category:"proteins",pxProduct:"台灣豬五花肉塊 400g",pxPrice:99,carrefourProduct:"家樂福豬五花肉 400g",carrefourPrice:105},
      {name:"雞蛋",qty:"4顆",isMain:false,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"白飯",qty:"4碗",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/4盒",pxPrice:150,carrefourProduct:"御用熟白飯微波即食 3入",carrefourPrice:160},
      {name:"蒜頭",qty:"5瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"雞蛋放入電鍋，外鍋1杯水，煮成水煮蛋備用。",duration:600,voiceText:"先把雞蛋放入電鍋，外鍋一杯水按下開關，煮成水煮蛋。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"五花肉切1cm小丁，蒜頭切末。鍋不加油，中火炒肉丁逼出豬油，表面微焦後加蒜末炒香。",duration:300,voiceText:"五花肉切小丁，乾鍋中火炒到表面微焦，逼出豬油後加蒜末炒香。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"加醬油4匙、米酒2匙、冰糖1匙、八角2顆、水200ml，大火煮沸後轉小火燜15分鐘。",duration:900,voiceText:"加醬油、米酒、冰糖、八角和水，大火煮沸後轉小火燜十五分鐘讓肉入味。"},
      {order:3,threadId:1,threadLabel:"爐火備料線",instruction:"水煮蛋剝殼放入鍋中一起燜，收至醬汁微黏稠，淋在熱白飯上即完成。",duration:180,voiceText:"水煮蛋剝殼放入一起燜，收汁後淋在白飯上，台式滷肉飯完成！"}
    ]
  },
  {
    id:"rec-pork-chop", title:"台式香煎黑胡椒排骨", cuisine:"台式家常",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分速成", servings:3, calories:510, imageFallback:"🥩",
    tags:["外酥內嫩","黑胡椒香","便當首選"],
    description:"里肌排骨以醬油、蒜末醃入味，香煎至兩面金黃，撒大量黑胡椒，配上白飯就是超人氣便當菜。",
    ingredients:[
      {name:"豬里肌排骨",qty:"400g",isMain:true,category:"proteins",pxProduct:"台灣豬里肌排 400g",pxPrice:88,carrefourProduct:"家樂福里肌豬排 400g",carrefourPrice:95},
      {name:"蒜頭",qty:"4瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49},
      {name:"白飯",qty:"3碗",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/3盒",pxPrice:115,carrefourProduct:"御用熟白飯 3入",carrefourPrice:120}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白飯放電鍋加熱備用。",duration:600,voiceText:"白飯放入電鍋加熱。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"排骨用肉錘或刀背拍鬆，以醬油2匙、蒜末、黑胡椒1匙、米酒1匙醃5分鐘。",duration:300,voiceText:"排骨拍鬆，用醬油、蒜末、黑胡椒和米酒醃五分鐘。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"平底鍋下油，中大火兩面各煎4分鐘，起鍋前再撒黑胡椒提香。",duration:480,voiceText:"平底鍋熱油，中大火兩面各煎四分鐘到金黃熟透，起鍋前補撒黑胡椒。"}
    ]
  },
  {
    id:"rec-sesame-noodle", title:"麻醬涼麵", cuisine:"台式小吃",
    prepTime:8, cookTime:5, totalTime:13, difficulty:"13分免開火", servings:2, calories:420, imageFallback:"🍜",
    tags:["免煮省力","麻香濃郁","夏日首選"],
    description:"細麵煮熟冷卻後，淋上芝麻醬、花生醬、醬油膏調製的醬汁，搭配小黃瓜絲，清爽又飽足。",
    ingredients:[
      {name:"油麵",qty:"2份(240g)",isMain:true,category:"staples",pxProduct:"全聯生油麵 250g",pxPrice:25,carrefourProduct:"家樂福生油麵 250g",carrefourPrice:28},
      {name:"小黃瓜",qty:"1條",isMain:true,category:"veggies",pxProduct:"本產小黃瓜 3條",pxPrice:29,carrefourProduct:"有機小黃瓜 3條",carrefourPrice:35},
      {name:"雞蛋",qty:"2顆",isMain:false,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"煮一鍋滾水，下麵條煮3分鐘撈起，沖冷水瀝乾，拌少許香油防沾。",duration:300,voiceText:"滾水煮麵三分鐘，撈起沖冷水瀝乾，拌少許香油防止沾黏。"},
      {order:1,threadId:2,threadLabel:"備料線",instruction:"小碗調醬汁：芝麻醬3匙、花生醬1匙、醬油膏2匙、糖1匙、冷開水3匙，攪拌均勻。小黃瓜切細絲。",duration:240,voiceText:"調醬汁：芝麻醬、花生醬、醬油膏、糖和冷開水攪拌均勻。小黃瓜切絲備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"雞蛋煎成薄蛋皮切絲。麵條盛盤，鋪上小黃瓜絲、蛋絲，淋上醬汁即完成。",duration:180,voiceText:"雞蛋煎薄切絲，麵條盛盤後擺上小黃瓜絲和蛋絲，大方淋上麻醬，開動！"}
    ]
  },
  {
    id:"rec-radish-egg", title:"菜脯蛋", cuisine:"台式家常",
    prepTime:3, cookTime:8, totalTime:11, difficulty:"11分超快", servings:3, calories:280, imageFallback:"🥚",
    tags:["古早味","下飯","食材簡單"],
    description:"醃漬蘿蔔乾與雞蛋的黃金組合，蛋液包裹菜脯的鹹香，煎成厚實蛋餅，是台灣阿嬤的懷念好味道。",
    ingredients:[
      {name:"雞蛋",qty:"4顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"蘿蔔乾",qty:"50g",isMain:true,category:"pantry",pxProduct:"全聯菜脯 100g",pxPrice:35,carrefourProduct:"美味菜脯 100g",carrefourPrice:38},
      {name:"青蔥",qty:"2支",isMain:false,category:"pantry",pxProduct:"本產青蔥包",pxPrice:28,carrefourProduct:"本產有機青蔥 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蘿蔔乾洗去多餘鹽分，切碎。雞蛋打散，加入蘿蔔乾碎、蔥花攪拌均勻。",duration:180,voiceText:"蘿蔔乾洗去鹽分切碎，雞蛋打散後加入蘿蔔乾和蔥花攪拌均勻。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"平底鍋下油，倒入蛋液中火煎底面定型，翻面再煎2分鐘，兩面金黃即完成。",duration:300,voiceText:"平底鍋熱油，蛋液倒入中火煎到底面定型，翻面煎兩分鐘，兩面金黃上桌！"}
    ]
  },
  {
    id:"rec-leek-pork", title:"韭黃炒豬肉絲", cuisine:"台式快炒",
    prepTime:5, cookTime:7, totalTime:12, difficulty:"12分極速", servings:3, calories:340, imageFallback:"🌿",
    tags:["大火快炒","香氣十足","下飯好菜"],
    description:"韭黃的獨特香氣配上嫩炒豬肉絲，以醬油、米酒炒出鑊氣，是街頭快炒店的人氣家常菜。",
    ingredients:[
      {name:"豬肉絲",qty:"250g",isMain:true,category:"proteins",pxProduct:"台灣豬梅花肉絲 250g",pxPrice:68,carrefourProduct:"家樂福豬肉絲 250g",carrefourPrice:72},
      {name:"韭黃",qty:"1把(100g)",isMain:true,category:"veggies",pxProduct:"本產韭黃 150g",pxPrice:28,carrefourProduct:"有機韭黃 100g",carrefourPrice:32},
      {name:"彩椒",qty:"半顆",isMain:false,category:"veggies",pxProduct:"彩椒 2入",pxPrice:49,carrefourProduct:"有機彩椒 2入",carrefourPrice:55}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"豬肉絲加醬油1匙、太白粉半匙醃2分鐘。韭黃切段，彩椒切絲備用。",duration:150,voiceText:"豬肉絲加醬油和太白粉醃兩分鐘，韭黃切段，彩椒切絲。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋下油，炒豬肉絲至變色，加彩椒炒30秒，放韭黃大火翻炒，加醬油、米酒、鹽調味，起鍋。",duration:270,voiceText:"大火熱油炒豬肉絲到變色，加彩椒再加韭黃大火翻炒，調味後快速起鍋！"}
    ]
  },
  {
    id:"rec-clam-basil", title:"九層塔炒蜆仔", cuisine:"台式快炒",
    prepTime:5, cookTime:6, totalTime:11, difficulty:"11分鮮炒", servings:3, calories:220, imageFallback:"🐚",
    tags:["新鮮海味","九層塔香","下酒良伴"],
    description:"蜆仔大火快炒，佐以薑片、辣椒和大量九層塔，鑊氣十足，鮮甜的蜆肉配上迷人塔香，上桌秒清盤。",
    ingredients:[
      {name:"蜆仔",qty:"500g",isMain:true,category:"proteins",pxProduct:"台灣活蜆仔 500g",pxPrice:79,carrefourProduct:"鮮活蜆仔 500g",carrefourPrice:85},
      {name:"九層塔",qty:"1大把",isMain:true,category:"pantry",pxProduct:"本產九層塔包",pxPrice:18,carrefourProduct:"有機九層塔 50g",carrefourPrice:22},
      {name:"薑",qty:"5片",isMain:false,category:"pantry",pxProduct:"台灣老薑 300g",pxPrice:35,carrefourProduct:"有機老薑 300g",carrefourPrice:39}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蜆仔吐沙洗淨。薑切片，蒜拍碎，辣椒切斜片，九層塔摘葉。",duration:180,voiceText:"蜆仔洗淨，薑切片，蒜拍碎，辣椒切片，九層塔摘好備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋下油，爆香薑蒜辣椒，倒入蜆仔大火翻炒，加醬油1匙、米酒2匙，蓋鍋30秒，開蓋加九層塔翻炒均勻，起鍋。",duration:240,voiceText:"大火爆香薑蒜辣椒，倒入蜆仔翻炒，加醬油米酒蓋鍋三十秒，開蓋撒九層塔炒勻起鍋！"}
    ]
  },
  {
    id:"rec-sate-beef", title:"沙茶牛肉炒空心菜", cuisine:"台式快炒",
    prepTime:5, cookTime:8, totalTime:13, difficulty:"13分大火", servings:3, calories:390, imageFallback:"🌱",
    tags:["沙茶濃香","鑊氣十足","下飯首選"],
    description:"牛肉片用沙茶醬醃製，配上清脆空心菜大火快炒，沙茶的濃郁香氣讓整道菜香氣四溢。",
    ingredients:[
      {name:"牛肉片",qty:"300g",isMain:true,category:"proteins",pxProduct:"美國牛五花肉片 200g/2包",pxPrice:198,carrefourProduct:"家樂福牛五花片 300g",carrefourPrice:220},
      {name:"空心菜",qty:"1把(200g)",isMain:true,category:"veggies",pxProduct:"本產空心菜 200g",pxPrice:22,carrefourProduct:"有機空心菜 200g",carrefourPrice:28},
      {name:"蒜頭",qty:"4瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"牛肉片加沙茶醬2匙、醬油1匙、太白粉半匙醃3分鐘。空心菜切段，蒜拍碎。",duration:200,voiceText:"牛肉加沙茶醬、醬油、太白粉醃三分鐘，空心菜切段，蒜拍碎備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋，先炒牛肉至8分熟起鍋。原鍋爆香蒜，下空心菜大火炒1分鐘，回鍋牛肉，加鹽調味翻炒均勻。",duration:300,voiceText:"大火炒牛肉八分熟先起鍋，爆香蒜後炒空心菜，回入牛肉調味翻炒，完成！"}
    ]
  },
  {
    id:"rec-seafood-congee", title:"廣式海鮮粥", cuisine:"台式粥品",
    prepTime:5, cookTime:20, totalTime:25, difficulty:"25分暖胃", servings:4, calories:320, imageFallback:"🥣",
    tags:["暖胃養生","海鮮鮮甜","老少宜食"],
    description:"白粥熬至濃稠，加入蝦仁、花枝、蛤蜊大火燙熟，撒薑絲、蔥花和白胡椒，鮮美清甜，冬天喝特別幸福。",
    ingredients:[
      {name:"白米",qty:"1杯",isMain:true,category:"staples",pxProduct:"全聯台灣米 2kg",pxPrice:89,carrefourProduct:"家樂福台灣米 2kg",carrefourPrice:92},
      {name:"冷凍海鮮包",qty:"300g",isMain:true,category:"proteins",pxProduct:"全聯冷凍綜合海鮮包 400g",pxPrice:129,carrefourProduct:"家樂福海鮮什錦包 400g",carrefourPrice:145},
      {name:"薑",qty:"5片",isMain:false,category:"pantry",pxProduct:"台灣老薑 300g",pxPrice:35,carrefourProduct:"有機老薑 300g",carrefourPrice:39}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電鍋線",instruction:"白米洗淨加6倍水入電鍋，外鍋2杯水煮成稠粥（可提前準備）。",duration:1200,voiceText:"白米加六倍水放入電鍋，外鍋兩杯水按下開關，煮成稠粥。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"薑切細絲，蔥切蔥花。海鮮解凍洗淨瀝乾備用。",duration:180,voiceText:"薑切細絲，蔥切蔥花，海鮮解凍洗淨。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"粥煮好後移入鍋中，大火燒開，下海鮮燙熟（約2分鐘），加鹽、白胡椒調味，撒薑絲蔥花，完成。",duration:240,voiceText:"粥燒開後放入海鮮煮兩分鐘，加鹽和白胡椒調味，撒薑絲蔥花上桌！"}
    ]
  },
  {
    id:"rec-pork-cabbage", title:"五花肉炒高麗菜", cuisine:"台式家常",
    prepTime:5, cookTime:10, totalTime:15, difficulty:"15分家常", servings:4, calories:360, imageFallback:"🥬",
    tags:["清甜爽口","豬肉增香","一鍋搞定"],
    description:"五花肉片炒出豬油香，配上清甜高麗菜大火翻炒，加蒜頭提味，簡單食材組合出最樸實的家常好滋味。",
    ingredients:[
      {name:"五花肉片",qty:"200g",isMain:true,category:"proteins",pxProduct:"台灣豬五花肉片 200g",pxPrice:68,carrefourProduct:"家樂福豬五花薄片 200g",carrefourPrice:72},
      {name:"高麗菜",qty:"半顆(400g)",isMain:true,category:"veggies",pxProduct:"本產高麗菜半顆",pxPrice:25,carrefourProduct:"有機高麗菜 600g",carrefourPrice:35},
      {name:"蒜頭",qty:"4瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"高麗菜剝大片，蒜拍碎。",duration:120,voiceText:"高麗菜剝成大片，蒜拍碎備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"中火炒五花肉片至微焦出油，加蒜爆香，下高麗菜大火翻炒，加醬油1匙、鹽、糖少許，炒至菜軟出汁，起鍋。",duration:480,voiceText:"五花肉炒到微焦出油，加蒜爆香，放高麗菜大火炒軟，調味起鍋，完成！"}
    ]
  },
  {
    id:"rec-steamed-egg", title:"台式鹹蒸蛋", cuisine:"台式家常",
    prepTime:3, cookTime:12, totalTime:15, difficulty:"15分嫩滑", servings:3, calories:180, imageFallback:"🍳",
    tags:["嫩滑如布丁","老少皆愛","免開火"],
    description:"雞蛋加溫開水與蝦米蒸成嫩滑蒸蛋，淋上醬油膏和香油，口感細膩，是台式家庭餐桌上最溫柔的料理。",
    ingredients:[
      {name:"雞蛋",qty:"3顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"蝦米",qty:"1大匙",isMain:false,category:"pantry",pxProduct:"台灣蝦米 50g",pxPrice:45,carrefourProduct:"乾蝦仁 50g",carrefourPrice:50},
      {name:"青蔥",qty:"1支",isMain:false,category:"pantry",pxProduct:"本產青蔥包",pxPrice:28,carrefourProduct:"本產有機青蔥 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"雞蛋打散過篩，加1.5倍溫開水（約45°C）、鹽少許、蝦米攪勻，撈去浮泡。",duration:180,voiceText:"雞蛋打散過篩，加一點五倍溫開水、少許鹽和蝦米攪勻，撈去表面浮泡。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"電鍋外鍋加1杯水預熱。蛋液倒入碗中蓋上保鮮膜，放入電鍋蒸12分鐘。",duration:720,voiceText:"蛋液倒碗蓋保鮮膜，電鍋外鍋一杯水，蒸十二分鐘到凝固。"},
      {order:3,threadId:1,threadLabel:"備料線",instruction:"取出後淋醬油膏半匙、香油少許、蔥花，完成。",duration:60,voiceText:"蒸好後淋上醬油膏、香油和蔥花，台式鹹蒸蛋完成！"}
    ]
  },
  {
    id:"rec-shrimp-asparagus", title:"蝦仁炒蘆筍", cuisine:"台式快炒",
    prepTime:5, cookTime:7, totalTime:12, difficulty:"12分鮮炒", servings:3, calories:250, imageFallback:"🦐",
    tags:["高蛋白低脂","春季蔬菜","清爽下飯"],
    description:"新鮮蝦仁與鮮嫩蘆筍快炒，僅以鹽、蒜提味，保留食材最原始的清甜，是健康輕食的代表料理。",
    ingredients:[
      {name:"蝦仁",qty:"200g",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"蘆筍",qty:"1把(200g)",isMain:true,category:"veggies",pxProduct:"本產綠蘆筍 200g",pxPrice:49,carrefourProduct:"有機蘆筍 200g",carrefourPrice:58},
      {name:"蒜頭",qty:"3瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蘆筍切斜段，蒜切片。蝦仁加鹽、太白粉少許抓勻。",duration:150,voiceText:"蘆筍切斜段，蒜切片，蝦仁加鹽和太白粉抓勻。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋下油，炒蝦仁至變色起鍋。原鍋爆香蒜，下蘆筍炒1.5分鐘，回入蝦仁，加鹽、白胡椒翻炒均勻，完成。",duration:300,voiceText:"大火炒蝦仁變色先起鍋，爆香蒜後炒蘆筍，回入蝦仁調味翻炒完成！"}
    ]
  },
  {
    id:"rec-ginger-liver", title:"薑絲炒豬肝", cuisine:"台式家常",
    prepTime:8, cookTime:6, totalTime:14, difficulty:"14分補鐵", servings:3, calories:290, imageFallback:"🫀",
    tags:["補鐵補血","薑絲去腥","台灣古早味"],
    description:"豬肝用薑汁去腥後，以大火快炒薑絲、麻油爆香，嫩滑而不腥，是台灣傳統補血家常菜的代表。",
    ingredients:[
      {name:"豬肝",qty:"300g",isMain:true,category:"proteins",pxProduct:"台灣豬肝 300g",pxPrice:55,carrefourProduct:"家樂福豬肝片 300g",carrefourPrice:60},
      {name:"薑",qty:"1大塊",isMain:true,category:"pantry",pxProduct:"台灣老薑 300g",pxPrice:35,carrefourProduct:"有機老薑 300g",carrefourPrice:39},
      {name:"青蔥",qty:"2支",isMain:false,category:"pantry",pxProduct:"本產青蔥包",pxPrice:28,carrefourProduct:"本產有機青蔥 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"豬肝切0.5cm薄片，泡入冷水加米酒去腥5分鐘後洗淨。薑切細絲，蔥切段。",duration:300,voiceText:"豬肝切薄片，泡米酒水去腥五分鐘洗淨，薑切細絲，蔥切段。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋下麻油，爆香薑絲至微焦，下豬肝快炒1分鐘，加醬油2匙、米酒1匙，豬肝變色即起鍋，撒蔥段。",duration:180,voiceText:"大火麻油爆香薑絲，下豬肝快炒一分鐘，加醬油米酒炒至變色立刻起鍋，不能炒老！"}
    ]
  },
  {
    id:"rec-egg-fried-rice", title:"黃金蛋炒飯", cuisine:"台式家常",
    prepTime:3, cookTime:8, totalTime:11, difficulty:"11分極速", servings:2, calories:480, imageFallback:"🍳",
    tags:["剩飯神救星","蛋香四溢","鑊氣十足"],
    description:"隔夜白飯炒出粒粒分明的黃金炒飯，雞蛋包裹每粒米，蔥花提香，是台灣家庭最懂得利用剩食的家常料理。",
    ingredients:[
      {name:"白飯",qty:"2碗(冷飯)",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/2盒",pxPrice:75,carrefourProduct:"御用熟白飯 2入",carrefourPrice:80},
      {name:"雞蛋",qty:"3顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"青蔥",qty:"2支",isMain:false,category:"pantry",pxProduct:"本產青蔥包",pxPrice:28,carrefourProduct:"本產有機青蔥 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"雞蛋打散加少許鹽。蔥切蔥花。冷飯用手捏散。",duration:120,voiceText:"雞蛋打散加鹽，蔥切蔥花，冷飯捏散備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋多下油，先炒蛋液至半熟，下冷飯大火翻炒，讓飯粒均勻受熱，加醬油1匙、鹽調味，撒蔥花翻勻，起鍋。",duration:360,voiceText:"大火熱油炒半熟蛋，下冷飯大火翻炒讓每粒米裹上蛋液，加醬油和鹽，撒蔥花翻勻起鍋！"}
    ]
  },
  {
    id:"rec-oyster-omelette", title:"台式蚵仔煎", cuisine:"台式小吃",
    prepTime:5, cookTime:10, totalTime:15, difficulty:"15分小吃", servings:2, calories:390, imageFallback:"🦪",
    tags:["夜市小吃","Q彈蚵仔","特製甜辣醬"],
    description:"新鮮蚵仔裹太白粉漿煎成Q彈餅底，配上茼蒿菜與半熟蛋，淋上甜辣醬，重現夜市最令人懷念的台灣風味。",
    ingredients:[
      {name:"新鮮蚵仔",qty:"150g",isMain:true,category:"proteins",pxProduct:"台灣活蚵仔 200g",pxPrice:65,carrefourProduct:"鮮活蚵仔 200g",carrefourPrice:72},
      {name:"雞蛋",qty:"2顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"茼蒿",qty:"100g",isMain:true,category:"veggies",pxProduct:"本產茼蒿 150g",pxPrice:28,carrefourProduct:"有機茼蒿 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"調粉漿：太白粉3匙、地瓜粉1匙加水100ml調勻。蚵仔洗淨瀝乾。甜辣醬備好。",duration:180,voiceText:"調太白粉和地瓜粉漿，蚵仔洗淨，甜辣醬備好。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"平底鍋下油，倒入粉漿鋪平，放上蚵仔，中火煎1分鐘，打蛋在上面輕輕鋪開，放茼蒿，翻面再煎2分鐘，淋甜辣醬完成。",duration:360,voiceText:"粉漿倒入煎一分鐘，擺上蚵仔打蛋鋪茼蒿，翻面煎兩分鐘，淋甜辣醬上桌！"}
    ]
  },
  {
    id:"rec-stir-vermicelli", title:"台式炒米粉", cuisine:"台式家常",
    prepTime:8, cookTime:10, totalTime:18, difficulty:"18分入味", servings:4, calories:400, imageFallback:"🍜",
    tags:["辦桌傳統","豐盛配料","老少皆宜"],
    description:"米粉泡軟後以香菇、肉絲、蝦米、高麗菜一同大火炒，加醬油調色，是台灣婚宴辦桌少不了的傳統料理。",
    ingredients:[
      {name:"米粉",qty:"200g",isMain:true,category:"staples",pxProduct:"新竹米粉 200g",pxPrice:35,carrefourProduct:"傳統米粉 200g",carrefourPrice:38},
      {name:"豬肉絲",qty:"150g",isMain:true,category:"proteins",pxProduct:"台灣豬梅花肉絲 250g",pxPrice:68,carrefourProduct:"家樂福豬肉絲 250g",carrefourPrice:72},
      {name:"高麗菜",qty:"200g",isMain:true,category:"veggies",pxProduct:"本產高麗菜半顆",pxPrice:25,carrefourProduct:"有機高麗菜 600g",carrefourPrice:35},
      {name:"香菇",qty:"4朵(乾)",isMain:false,category:"pantry",pxProduct:"台灣乾香菇 50g",pxPrice:55,carrefourProduct:"特選乾香菇 50g",carrefourPrice:60}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"泡發線",instruction:"乾香菇泡溫水20分鐘至軟，切絲，香菇水留用。米粉泡溫水10分鐘軟化。",duration:600,voiceText:"香菇泡溫水二十分鐘切絲，香菇水留著，米粉泡溫水十分鐘。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蝦米、肉絲下鍋翻炒，加香菇絲，炒出香氣。",duration:240,voiceText:"蝦米和肉絲下鍋翻炒，加香菇絲炒出香氣。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"下高麗菜炒軟，加米粉、香菇水150ml，醬油3匙，大火翻炒至米粉吸收湯汁，加鹽調味，起鍋。",duration:360,voiceText:"加高麗菜炒軟，放入米粉和香菇水，大火炒到收汁，調味起鍋！"}
    ]
  },

  // ── 日式 新增 ──
  {
    id:"rec-teriyaki-salmon", title:"照燒鮭魚", cuisine:"日式家庭",
    prepTime:3, cookTime:10, totalTime:13, difficulty:"13分完美", servings:2, calories:480, imageFallback:"🐟",
    tags:["Omega-3豐富","照燒香甜","健康首選"],
    description:"鮭魚排以醬油、味醂、砂糖調製的照燒醬煎至兩面金黃，醬汁收乾後香甜濃稠，配白飯是治癒系料理。",
    ingredients:[
      {name:"鮭魚排",qty:"2片(300g)",isMain:true,category:"proteins",pxProduct:"智利鮭魚排 300g",pxPrice:199,carrefourProduct:"家樂福挪威鮭魚排 300g",carrefourPrice:220},
      {name:"白飯",qty:"2碗",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/2盒",pxPrice:75,carrefourProduct:"御用熟白飯 2入",carrefourPrice:80}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白飯電鍋加熱備用。",duration:600,voiceText:"白飯放入電鍋加熱。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"調照燒醬：醬油2匙、味醂2匙、砂糖1匙混合。鮭魚排擦乾表面。",duration:120,voiceText:"醬油、味醂、砂糖調成照燒醬，鮭魚排用廚房紙擦乾。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"平底鍋下少許油，中大火鮭魚皮面朝下煎3分鐘，翻面再煎2分鐘。倒入照燒醬，搖晃鍋子讓醬汁裹勻，收至濃稠，完成。",duration:360,voiceText:"皮面朝下煎三分鐘翻面煎兩分鐘，倒入照燒醬搖晃鍋子收汁，完成！"}
    ]
  },
  {
    id:"rec-karaage", title:"日式唐揚炸雞", cuisine:"日式居酒屋",
    prepTime:10, cookTime:12, totalTime:22, difficulty:"22分酥脆", servings:3, calories:560, imageFallback:"🍗",
    tags:["外酥內嫩","居酒屋風","小朋友最愛"],
    description:"雞腿肉以醬油、薑汁、蒜泥醃製，裹上太白粉炸至金黃酥脆，是日本居酒屋最受歡迎的下酒菜。",
    ingredients:[
      {name:"去骨雞腿",qty:"2支(400g)",isMain:true,category:"proteins",pxProduct:"台灣去骨雞腿排 2入",pxPrice:128,carrefourProduct:"家樂福去骨雞腿 400g",carrefourPrice:138},
      {name:"薑",qty:"1小塊",isMain:false,category:"pantry",pxProduct:"台灣老薑 300g",pxPrice:35,carrefourProduct:"有機老薑 300g",carrefourPrice:39},
      {name:"蒜頭",qty:"3瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"醃製備料線",instruction:"雞腿肉切3cm塊，用醬油3匙、味醂1匙、薑泥半匙、蒜泥半匙醃10分鐘。",duration:600,voiceText:"雞肉切塊，加醬油、味醂、薑泥、蒜泥醃十分鐘入味。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"雞肉瀝乾，裹上太白粉，靜置1分鐘讓粉回潮。",duration:90,voiceText:"雞肉瀝乾裹太白粉，靜置一分鐘讓粉回潮。"},
      {order:3,threadId:1,threadLabel:"爐火備料線",instruction:"油鍋燒至170°C，下雞塊炸4分鐘，撈起。升溫至190°C，回鍋再炸1分鐘逼出多餘油脂，瀝油完成。",duration:360,voiceText:"油鍋燒熱炸四分鐘撈起，升高油溫回鍋再炸一分鐘逼油，瀝乾上桌！"}
    ]
  },
  {
    id:"rec-shogayaki", title:"薑汁燒豬肉", cuisine:"日式家庭",
    prepTime:5, cookTime:8, totalTime:13, difficulty:"13分甘辛", servings:3, calories:430, imageFallback:"🥩",
    tags:["薑辛醒神","甘辛下飯","日本定食"],
    description:"豬里肌肉片以薑汁、醬油、味醂醃製，煎至焦糖化，甘辛的醬汁配上高麗菜絲，是日本家庭定食的靈魂菜色。",
    ingredients:[
      {name:"豬里肌肉片",qty:"300g",isMain:true,category:"proteins",pxProduct:"台灣豬里肌肉片 300g",pxPrice:79,carrefourProduct:"家樂福豬里肌薄片 300g",carrefourPrice:85},
      {name:"高麗菜",qty:"200g",isMain:false,category:"veggies",pxProduct:"本產高麗菜半顆",pxPrice:25,carrefourProduct:"有機高麗菜 600g",carrefourPrice:35},
      {name:"薑",qty:"1塊",isMain:true,category:"pantry",pxProduct:"台灣老薑 300g",pxPrice:35,carrefourProduct:"有機老薑 300g",carrefourPrice:39}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"薑磨成泥。豬肉片加薑泥2匙、醬油2匙、味醂2匙、砂糖半匙醃5分鐘。高麗菜切細絲。",duration:300,voiceText:"薑磨泥，豬肉加薑泥、醬油、味醂、砂糖醃五分鐘，高麗菜切絲。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"平底鍋下油，中大火煎豬肉至兩面上色，倒入剩餘醃汁炒至收汁焦糖化，配高麗菜絲上桌。",duration:300,voiceText:"煎豬肉兩面上色，倒入醃汁炒到收汁焦糖化，配高麗菜絲完成！"}
    ]
  },
  {
    id:"rec-yakisoba", title:"日式炒麵", cuisine:"日式快食",
    prepTime:5, cookTime:8, totalTime:13, difficulty:"13分炒出鑊氣", servings:2, calories:450, imageFallback:"🍜",
    tags:["醬香濃郁","配料豐富","路邊攤風"],
    description:"蔬菜與豬肉大火快炒，加入特製炒麵醬拌炒，擠上美乃滋、撒柴魚片，是祭典路邊攤的經典香氣。",
    ingredients:[
      {name:"炒麵條",qty:"2份(200g)",isMain:true,category:"staples",pxProduct:"日清蒸炒麵 2入",pxPrice:45,carrefourProduct:"炒麵條 200g",carrefourPrice:40},
      {name:"豬肉片",qty:"150g",isMain:true,category:"proteins",pxProduct:"台灣豬梅花肉片 200g",pxPrice:55,carrefourProduct:"家樂福豬梅花薄片 200g",carrefourPrice:60},
      {name:"高麗菜",qty:"200g",isMain:true,category:"veggies",pxProduct:"本產高麗菜半顆",pxPrice:25,carrefourProduct:"有機高麗菜 600g",carrefourPrice:35}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"高麗菜切大片，洋蔥切絲，胡蘿蔔切絲。調炒麵醬：伍斯特醬2匙、醬油1匙、砂糖半匙。",duration:180,voiceText:"蔬菜切好，伍斯特醬、醬油、砂糖調成炒麵醬備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火炒豬肉至變色，加蔬菜翻炒，下麵條，倒入炒麵醬大火拌炒均勻。擠美乃滋、撒柴魚片，完成。",duration:360,voiceText:"大火炒肉加蔬菜，下麵條倒醬大火炒勻，擠美乃滋撒柴魚片上桌！"}
    ]
  },
  {
    id:"rec-chawanmushi", title:"日式茶碗蒸", cuisine:"日式家庭",
    prepTime:5, cookTime:15, totalTime:20, difficulty:"20分嫩滑", servings:3, calories:160, imageFallback:"🥣",
    tags:["嫩如絲綢","日式精緻","高湯鮮味"],
    description:"雞蛋加昆布高湯蒸至滑嫩，放入蝦仁、蘑菇，表面光滑如鏡面，是日式定食套餐最受喜愛的料理之一。",
    ingredients:[
      {name:"雞蛋",qty:"3顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"蝦仁",qty:"6尾",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"香菇",qty:"3朵",isMain:false,category:"pantry",pxProduct:"台灣乾香菇 50g",pxPrice:55,carrefourProduct:"特選乾香菇 50g",carrefourPrice:60}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"蛋打散，加高湯240ml（或昆布+柴魚水）、醬油少許、鹽少許，過篩去泡，分入碗中，放入蝦仁、香菇。",duration:240,voiceText:"蛋打散加高湯過篩，分入碗中放蝦仁和香菇。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"電鍋外鍋1杯水，蛋液碗蓋保鮮膜放入，開關跳起後再燜5分鐘，表面如鏡面即完成，淋少許醬油點綴。",duration:900,voiceText:"電鍋蒸到跳起再燜五分鐘，表面光滑如鏡面就完成了，淋少許醬油！"}
    ]
  },
  {
    id:"rec-tonjiru", title:"豚汁味噌湯", cuisine:"日式家庭",
    prepTime:8, cookTime:15, totalTime:23, difficulty:"23分暖身", servings:4, calories:280, imageFallback:"🍲",
    tags:["根莖蔬菜","豬肉暖胃","冬天必喝"],
    description:"豬肉片與牛蒡、蘿蔔、馬鈴薯燉煮成的濃郁味噌湯，比一般味噌湯更豐盛有飽足感，日本農家餐桌的溫暖代表。",
    ingredients:[
      {name:"豬肉片",qty:"200g",isMain:true,category:"proteins",pxProduct:"台灣豬梅花肉片 200g",pxPrice:55,carrefourProduct:"家樂福豬梅花薄片 200g",carrefourPrice:60},
      {name:"白蘿蔔",qty:"200g",isMain:true,category:"veggies",pxProduct:"本產白蘿蔔 1條",pxPrice:28,carrefourProduct:"有機白蘿蔔 500g",carrefourPrice:35},
      {name:"馬鈴薯",qty:"2顆",isMain:true,category:"veggies",pxProduct:"台灣馬鈴薯 500g",pxPrice:39,carrefourProduct:"有機馬鈴薯 500g",carrefourPrice:45},
      {name:"味噌",qty:"3大匙",isMain:false,category:"pantry",pxProduct:"龜甲萬白味噌 300g",pxPrice:89,carrefourProduct:"日本信州味噌 400g",carrefourPrice:95}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蘿蔔、馬鈴薯切滾刀塊，牛蒡斜切片泡水去澀。豬肉切段。",duration:300,voiceText:"蘿蔔馬鈴薯切滾刀塊，牛蒡切片泡水，豬肉切段。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋下少許油，炒豬肉至變色，加根莖蔬菜翻炒，注入800ml高湯煮滾，轉中小火燉12分鐘至蔬菜軟透。",duration:720,voiceText:"炒豬肉加蔬菜翻炒，注入高湯煮滾後中小火燉十二分鐘。"},
      {order:3,threadId:1,threadLabel:"爐火備料線",instruction:"轉小火，舀少許湯溶解味噌後倒回鍋中，撒蔥花，完成，勿再滾沸。",duration:90,voiceText:"小火溶入味噌，撒蔥花，不要再滾沸，豚汁完成！"}
    ]
  },
  {
    id:"rec-ebi-mayo", title:"美乃滋蝦", cuisine:"日式居酒屋",
    prepTime:5, cookTime:10, totalTime:15, difficulty:"15分鮮滑", servings:3, calories:400, imageFallback:"🦐",
    tags:["滑嫩鮮蝦","美乃滋香","宴客必備"],
    description:"蝦仁裹蛋白酥炸至金黃，淋上自製美乃滋醬汁，酸甜滑膩，是日式居酒屋和台日料理都深受喜愛的人氣料理。",
    ingredients:[
      {name:"蝦仁",qty:"300g",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"雞蛋",qty:"1顆",isMain:false,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蝦仁去腸泥洗淨擦乾，加鹽胡椒，裹上蛋白和太白粉。調醬汁：美乃滋3匙、煉乳1匙、檸檬汁少許。",duration:240,voiceText:"蝦仁擦乾裹蛋白太白粉，美乃滋加煉乳和檸檬汁調成醬汁。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"油鍋170°C，炸蝦仁3分鐘至金黃，瀝油，趁熱與醬汁翻拌均勻，撒少許紅椒粉點綴，完成。",duration:300,voiceText:"炸蝦仁三分鐘至金黃，瀝油後與醬汁翻拌，撒紅椒粉完成！"}
    ]
  },
  {
    id:"rec-natto-rice", title:"納豆拌飯", cuisine:"日式快食",
    prepTime:2, cookTime:5, totalTime:7, difficulty:"7分超速", servings:1, calories:380, imageFallback:"🫘",
    tags:["最速早餐","腸活益菌","日本健康食"],
    description:"納豆加芥末醬油攪拌出黏絲，打上生蛋黃，鋪在熱白飯上，配上海苔絲和蔥花，是日本最快速的營養早餐。",
    ingredients:[
      {name:"納豆",qty:"1盒(45g)",isMain:true,category:"proteins",pxProduct:"ミツカン小粒納豆 3盒入",pxPrice:65,carrefourProduct:"日本納豆 3入",carrefourPrice:70},
      {name:"白飯",qty:"1碗",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/1盒",pxPrice:38,carrefourProduct:"御用熟白飯 1入",carrefourPrice:40},
      {name:"雞蛋",qty:"1顆",isMain:false,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白飯電鍋加熱備用。",duration:420,voiceText:"白飯放入電鍋加熱。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"納豆加入附帶醬油包和芥末，用筷子攪拌60次以上讓黏絲充分拉出。蔥切蔥花。",duration:90,voiceText:"納豆加醬油包和芥末，用筷子大力攪拌六十下讓黏絲拉出來。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"熱白飯盛碗，鋪上納豆，打上生蛋黃，撒蔥花、海苔絲，淋少許醬油，完成。",duration:60,voiceText:"白飯盛碗，鋪納豆打蛋黃，撒蔥花海苔絲，淋醬油，七分鐘完成！"}
    ]
  },
  {
    id:"rec-gyudon", title:"日式牛丼", cuisine:"日式快食",
    prepTime:3, cookTime:12, totalTime:15, difficulty:"15分吉野家", servings:3, calories:540, imageFallback:"🍚",
    tags:["牛肉甘甜","丼飯滿足","學生最愛"],
    description:"洋蔥炒軟後加牛肉片以日式甜醬油燜煮，連醬汁一起鋪在白飯上，是吉野家同款的日式家庭牛丼。",
    ingredients:[
      {name:"牛肉片",qty:"300g",isMain:true,category:"proteins",pxProduct:"美國牛五花肉片 200g/2包",pxPrice:198,carrefourProduct:"家樂福嚴選牛五花片 300g",carrefourPrice:220},
      {name:"洋蔥",qty:"1顆",isMain:true,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45},
      {name:"白飯",qty:"3碗",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/3盒",pxPrice:115,carrefourProduct:"御用熟白飯 3入",carrefourPrice:120}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白飯電鍋加熱備用。",duration:600,voiceText:"白飯放電鍋加熱。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"洋蔥切薄絲，備好醬汁：高湯150ml、醬油3匙、味醂3匙、砂糖1匙。",duration:180,voiceText:"洋蔥切薄絲，高湯加醬油、味醂、砂糖調成醬汁。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋倒入醬汁煮沸，加洋蔥煮軟（約4分鐘），下牛肉片，煮至8分熟撈去浮沫，鋪在白飯上完成。",duration:420,voiceText:"醬汁煮沸放洋蔥煮四分鐘，下牛肉煮到八分熟撈去浮沫，蓋在白飯上完成！"}
    ]
  },
  {
    id:"rec-ochazuke", title:"日式鮭魚茶泡飯", cuisine:"日式家庭",
    prepTime:3, cookTime:5, totalTime:8, difficulty:"8分夜宵", servings:1, calories:320, imageFallback:"🍵",
    tags:["消夜首選","清爽解膩","利用剩飯"],
    description:"煎香的鮭魚片鋪在白飯上，沖入熱番茶或高湯，放上梅干、海苔、芥末，清爽鮮美，是日本深夜食堂的安慰料理。",
    ingredients:[
      {name:"鮭魚排",qty:"1片",isMain:true,category:"proteins",pxProduct:"智利鮭魚排 300g",pxPrice:199,carrefourProduct:"家樂福挪威鮭魚排 300g",carrefourPrice:220},
      {name:"白飯",qty:"1碗",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/1盒",pxPrice:38,carrefourProduct:"御用熟白飯 1入",carrefourPrice:40}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"燒一壺熱水。白飯加熱備用。",duration:300,voiceText:"燒熱水，白飯加熱備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"鮭魚片煎熟，用筷子撥成大塊，去刺。",duration:180,voiceText:"鮭魚煎熟撥成大塊去刺。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"白飯盛碗，鋪鮭魚、海苔絲，沖入熱高湯200ml，加梅干、少許醬油、芥末，完成。",duration:60,voiceText:"白飯盛碗鋪鮭魚和海苔，沖入熱高湯，加梅干和芥末，八分鐘完成！"}
    ]
  },
  {
    id:"rec-miso-tofu", title:"日式味噌湯", cuisine:"日式家庭",
    prepTime:2, cookTime:8, totalTime:10, difficulty:"10分基本功", servings:4, calories:120, imageFallback:"🟤",
    tags:["日式基本款","暖胃養生","每日必喝"],
    description:"昆布柴魚高湯為底，加入豆腐、豆腐皮、蔥花，溶入味噌，是日本家庭每天早晨少不了的溫暖靈魂湯品。",
    ingredients:[
      {name:"嫩豆腐",qty:"1盒",isMain:true,category:"proteins",pxProduct:"中華有機嫩豆腐 300g",pxPrice:18,carrefourProduct:"義美嫩豆腐 300g",carrefourPrice:17},
      {name:"味噌",qty:"3大匙",isMain:true,category:"pantry",pxProduct:"龜甲萬白味噌 300g",pxPrice:89,carrefourProduct:"日本信州味噌 400g",carrefourPrice:95},
      {name:"青蔥",qty:"2支",isMain:false,category:"pantry",pxProduct:"本產青蔥包",pxPrice:28,carrefourProduct:"本產有機青蔥 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"豆腐切1.5cm丁，蔥切蔥花，備海帶芽少許。",duration:120,voiceText:"豆腐切丁，蔥切蔥花，準備少許海帶芽。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"高湯600ml（或昆布柴魚水）煮滾，下豆腐丁煮2分鐘，轉小火，舀湯溶解味噌後倒回，加海帶芽、蔥花，勿再滾沸，完成。",duration:360,voiceText:"高湯煮滾放豆腐，小火溶入味噌加海帶芽和蔥花，不要再滾沸！"}
    ]
  },


  // ── 韓式 新增 ──
  {
    id:"rec-bibimbap", title:"韓式石鍋拌飯", cuisine:"韓式經典",
    prepTime:10, cookTime:10, totalTime:20, difficulty:"20分彩虹", servings:2, calories:520, imageFallback:"🫕",
    tags:["韓式國民料理","彩虹配色","辣醬拌開"],
    description:"白飯上鋪滿菠菜、豆芽、胡蘿蔔、牛肉末和煎蛋，淋上辣椒醬，大力攪拌讓所有食材融合，是韓國最具代表性的主食。",
    ingredients:[
      {name:"白飯",qty:"2碗",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/2盒",pxPrice:75,carrefourProduct:"御用熟白飯 2入",carrefourPrice:80},
      {name:"牛肉碎",qty:"150g",isMain:true,category:"proteins",pxProduct:"牛絞肉 150g",pxPrice:88,carrefourProduct:"家樂福牛絞肉 150g",carrefourPrice:95},
      {name:"雞蛋",qty:"2顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"豆芽菜",qty:"100g",isMain:false,category:"veggies",pxProduct:"本產豆芽菜 200g",pxPrice:15,carrefourProduct:"有機豆芽菜 150g",carrefourPrice:18}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白飯加熱備用。豆芽燙熟，菠菜燙熟擠乾，各加麻油鹽拌勻。",duration:600,voiceText:"白飯加熱，豆芽菠菜各燙熟加麻油鹽拌勻備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"牛肉碎加醬油1匙、蒜末、芝麻油炒熟。雞蛋煎成太陽蛋。胡蘿蔔切絲炒軟。",duration:360,voiceText:"牛肉加醬油蒜末炒熟，雞蛋煎成太陽蛋，胡蘿蔔絲炒軟。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"白飯盛碗，鋪上各色配料，放太陽蛋，淋韓式辣椒醬（고추장）2匙，拌開即食。",duration:120,voiceText:"白飯盛碗鋪滿配料放上太陽蛋，淋辣椒醬大力拌開，韓式拌飯完成！"}
    ]
  },
  {
    id:"rec-jjigae", title:"韓式大醬湯", cuisine:"韓式家常",
    prepTime:5, cookTime:15, totalTime:20, difficulty:"20分暖腸", servings:4, calories:280, imageFallback:"🍲",
    tags:["韓國味噌湯","蔬菜豐盛","冬天必喝"],
    description:"韓式大醬（된장）為底，加入豆腐、南瓜、蘑菇、蔬菜燉煮，滋味鹹香醇厚，是韓國家庭每餐必備的靈魂湯品。",
    ingredients:[
      {name:"嫩豆腐",qty:"1盒",isMain:true,category:"proteins",pxProduct:"中華有機嫩豆腐 300g",pxPrice:18,carrefourProduct:"義美嫩豆腐 300g",carrefourPrice:17},
      {name:"南瓜",qty:"100g",isMain:true,category:"veggies",pxProduct:"本產南瓜 600g",pxPrice:49,carrefourProduct:"有機南瓜 500g",carrefourPrice:55},
      {name:"豬肉片",qty:"100g",isMain:false,category:"proteins",pxProduct:"台灣豬梅花肉片 200g",pxPrice:55,carrefourProduct:"家樂福豬梅花薄片 200g",carrefourPrice:60}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"南瓜、豆腐切丁，蘑菇切片，蔥切段，蒜拍碎。",duration:180,voiceText:"南瓜豆腐切丁，蘑菇切片，蔥切段，蒜拍碎。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋加水600ml煮沸，下大醬3匙攪融，加豬肉片、南瓜煮8分鐘，放豆腐、蘑菇再煮5分鐘，加蒜末、蔥段，完成。",duration:780,voiceText:"水煮沸下大醬，加豬肉南瓜煮八分鐘，放豆腐蘑菇煮五分鐘，加蒜蔥完成！"}
    ]
  },
  {
    id:"rec-dakgalbi", title:"韓式辣炒雞丁", cuisine:"韓式快炒",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分辣爽", servings:3, calories:480, imageFallback:"🍗",
    tags:["辣醬香嫩","地瓜增甜","大學街美食"],
    description:"雞腿肉以辣椒醬醃製，配上地瓜、高麗菜大火炒至焦香，是韓國大學街夜市最受歡迎的辣炒雞料理。",
    ingredients:[
      {name:"去骨雞腿",qty:"2支(400g)",isMain:true,category:"proteins",pxProduct:"台灣去骨雞腿排 2入",pxPrice:128,carrefourProduct:"家樂福去骨雞腿 400g",carrefourPrice:138},
      {name:"高麗菜",qty:"200g",isMain:true,category:"veggies",pxProduct:"本產高麗菜半顆",pxPrice:25,carrefourProduct:"有機高麗菜 600g",carrefourPrice:35},
      {name:"地瓜",qty:"1條(150g)",isMain:true,category:"veggies",pxProduct:"台灣地瓜 500g",pxPrice:35,carrefourProduct:"有機地瓜 500g",carrefourPrice:42}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"雞肉切2cm塊，加韓式辣椒醬2匙、醬油1匙、麻油、蒜末醃5分鐘。地瓜切薄片，高麗菜切大片。",duration:360,voiceText:"雞肉切塊加辣椒醬、醬油、麻油、蒜末醃五分鐘，地瓜切薄片，高麗菜切大片。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"中大火炒雞肉至半熟，加地瓜翻炒，蓋鍋2分鐘，放高麗菜大火拌炒，加糖1匙，炒至醬香焦糖化，完成。",duration:420,voiceText:"炒雞肉加地瓜蓋鍋兩分鐘，放高麗菜大火炒至醬香焦糖化，完成！"}
    ]
  },
  {
    id:"rec-japchae", title:"韓式雜菜冬粉", cuisine:"韓式家常",
    prepTime:10, cookTime:12, totalTime:22, difficulty:"22分節慶", servings:4, calories:380, imageFallback:"🍝",
    tags:["韓式冬粉","節慶必備","蔬菜豐富"],
    description:"地瓜冬粉泡軟後與牛肉、菠菜、胡蘿蔔、香菇炒在一起，以醬油、麻油、砂糖調味，是韓國節慶宴客必備菜色。",
    ingredients:[
      {name:"韓式冬粉",qty:"150g",isMain:true,category:"staples",pxProduct:"韓國地瓜冬粉 200g",pxPrice:55,carrefourProduct:"韓式冬粉 200g",carrefourPrice:58},
      {name:"牛肉片",qty:"150g",isMain:true,category:"proteins",pxProduct:"美國牛五花肉片 200g",pxPrice:99,carrefourProduct:"家樂福牛五花片 150g",carrefourPrice:110},
      {name:"菠菜",qty:"100g",isMain:true,category:"veggies",pxProduct:"本產菠菜 200g",pxPrice:22,carrefourProduct:"有機菠菜 150g",carrefourPrice:28}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"泡發線",instruction:"冬粉泡溫水15分鐘軟化，瀝乾備用。",duration:900,voiceText:"冬粉泡溫水十五分鐘軟化。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"牛肉加醬油1匙、麻油醃製。菠菜燙熟擠乾切段，胡蘿蔔切絲，香菇切片各自炒熟加鹽麻油。",duration:360,voiceText:"牛肉醃製，菠菜燙熟，胡蘿蔔絲和香菇各自炒熟調味。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"炒牛肉至熟，加冬粉、醬油2匙、砂糖1匙、麻油1匙大火翻炒，加入所有配料炒勻，撒芝麻完成。",duration:300,voiceText:"炒牛肉加冬粉翻炒調味，加入所有配料炒勻，撒芝麻完成！"}
    ]
  },
  {
    id:"rec-egg-roll-kr", title:"韓式玉子燒", cuisine:"韓式家常",
    prepTime:3, cookTime:8, totalTime:11, difficulty:"11分早餐", servings:2, calories:240, imageFallback:"🥚",
    tags:["便當配菜","韓式早餐","軟嫩蛋捲"],
    description:"雞蛋加牛奶、蔥花、胡蘿蔔丁攪勻，以小火在方形鍋中一層層捲起，切片後呈現美麗剖面，是韓式早餐的基本款。",
    ingredients:[
      {name:"雞蛋",qty:"4顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"青蔥",qty:"1支",isMain:false,category:"pantry",pxProduct:"本產青蔥包",pxPrice:28,carrefourProduct:"本產有機青蔥 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"4顆蛋加牛奶2匙、鹽少許、蔥花、胡蘿蔔丁打散均勻。",duration:120,voiceText:"蛋加牛奶、鹽、蔥花、胡蘿蔔丁打散均勻。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"平底鍋或玉子燒鍋刷油，小火倒入1/3蛋液，半凝固時由一端捲起，再倒1/3蛋液，再捲，重複，成型後切片完成。",duration:360,voiceText:"小火分三次倒蛋液，每次半凝固後捲起，疊三層後切片，韓式蛋捲完成！"}
    ]
  },
  {
    id:"rec-dubu-jorim", title:"韓式辣燒豆腐", cuisine:"韓式素食",
    prepTime:3, cookTime:10, totalTime:13, difficulty:"13分下飯", servings:3, calories:280, imageFallback:"⬜",
    tags:["素食可食","辣醬下飯","豆腐入味"],
    description:"板豆腐煎至兩面金黃後，以韓式辣醬、醬油、蒜末、芝麻油燜煮入味，撒芝麻和蔥花，鹹辣下飯，製作超簡單。",
    ingredients:[
      {name:"板豆腐",qty:"1塊(300g)",isMain:true,category:"proteins",pxProduct:"台灣板豆腐 300g",pxPrice:22,carrefourProduct:"有機板豆腐 300g",carrefourPrice:28},
      {name:"蒜頭",qty:"3瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"板豆腐切1cm厚片，廚房紙吸乾水分。調醬汁：韓式辣椒醬1匙、醬油2匙、砂糖1匙、麻油1匙、蒜末1匙、水3匙。",duration:180,voiceText:"豆腐切厚片吸乾水分，辣椒醬、醬油、砂糖、麻油、蒜末調成醬汁。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋下油，豆腐兩面煎至金黃，倒入醬汁，中火燒至醬汁收乾裹上豆腐，撒芝麻和蔥花，完成。",duration:360,voiceText:"豆腐煎金黃，倒醬汁中火燒至收乾裹上豆腐，撒芝麻蔥花完成！"}
    ]
  },
  {
    id:"rec-samgyupsal", title:"韓式三層肉烤肉", cuisine:"韓式燒烤",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分烤香", servings:3, calories:620, imageFallback:"🥓",
    tags:["烤肉派對","生菜包肉","烤盤即可"],
    description:"厚切五花肉在烤盤上煎至兩面焦脆，包在生菜葉中，配上大蒜、辣醬、泡菜，一口一個，是韓式聚餐的必備儀式。",
    ingredients:[
      {name:"五花肉",qty:"400g厚切",isMain:true,category:"proteins",pxProduct:"台灣豬五花肉塊 400g",pxPrice:99,carrefourProduct:"家樂福豬五花肉 400g",carrefourPrice:105},
      {name:"蒜頭",qty:"8瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"五花肉切0.5cm厚。備生菜葉、韓式辣醬（쌈장）、泡菜、蒜片。",duration:180,voiceText:"五花肉切半公分厚，備好生菜、辣醬、泡菜和蒜片。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"烤盤或平底鍋不加油，中大火兩面各煎3分鐘，剪成小塊，用生菜包肉、蒜片、辣醬，一口吃下。",duration:480,voiceText:"烤盤煎五花肉兩面各三分鐘，剪小塊用生菜包肉配辣醬一口吃！"}
    ]
  },
  {
    id:"rec-korean-congee", title:"韓式南瓜粥", cuisine:"韓式家常",
    prepTime:5, cookTime:20, totalTime:25, difficulty:"25分溫補", servings:3, calories:260, imageFallback:"🎃",
    tags:["南瓜甜香","溫補養胃","冬至必吃"],
    description:"南瓜蒸熟打成泥後與白飯一同熬煮，加入糯米糰（새알심）增加Q感，甜糯溫潤，是韓國冬至傳統食品。",
    ingredients:[
      {name:"南瓜",qty:"300g",isMain:true,category:"veggies",pxProduct:"本產南瓜 600g",pxPrice:49,carrefourProduct:"有機南瓜 500g",carrefourPrice:55},
      {name:"白米",qty:"半杯",isMain:true,category:"staples",pxProduct:"全聯台灣米 2kg",pxPrice:89,carrefourProduct:"家樂福台灣米 2kg",carrefourPrice:92}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"南瓜去皮切塊，電鍋蒸15分鐘至軟，取出加少許水打成泥。",duration:900,voiceText:"南瓜電鍋蒸十五分鐘，加水打成泥。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"白米磨成粉加水調成糯米糰，搓成小湯圓備用。",duration:480,voiceText:"白米粉加水搓成小湯圓備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"南瓜泥入鍋加400ml水煮沸，加鹽和糖各少許調味，下湯圓煮至浮起，完成。",duration:300,voiceText:"南瓜泥加水煮沸，加鹽和糖，下湯圓煮至浮起，韓式南瓜粥完成！"}
    ]
  },

  // ── 義式 新增 ──
  {
    id:"rec-carbonara", title:"奶油培根義大利麵", cuisine:"義式經典",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分綿密", servings:2, calories:680, imageFallback:"🍝",
    tags:["奶油蛋黃醬","培根鮮香","羅馬傳統"],
    description:"培根以豬油煎至酥脆，用蛋黃加帕馬森起司調成醬汁，與熱麵條攪拌乳化，不加鮮奶油卻綿密如奶油，是正宗羅馬風格。",
    ingredients:[
      {name:"義大利麵",qty:"200g",isMain:true,category:"staples",pxProduct:"De Cecco 義大利麵 500g",pxPrice:69,carrefourProduct:"Barilla 義大利直麵 500g",carrefourPrice:72},
      {name:"培根",qty:"4片(80g)",isMain:true,category:"proteins",pxProduct:"美式培根片 100g",pxPrice:58,carrefourProduct:"家樂福煙燻培根 100g",carrefourPrice:62},
      {name:"雞蛋",qty:"2顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"煮麵線",instruction:"滾水加大量鹽，下義大利麵依包裝時間煮至al dente，留1杯麵湯。",duration:660,voiceText:"滾水加鹽煮義大利麵至彈牙，留一杯麵湯備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"培根切條，中小火煎至酥脆，不需加油，留底部豬油。調醬汁：2顆蛋黃加帕馬森起司2大匙、黑胡椒大量。",duration:300,voiceText:"培根切條乾鍋煎至酥脆，蛋黃加帕馬森起司和大量黑胡椒調成醬汁。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"關火，熱麵條倒入培根鍋，立刻倒入蛋醬快速攪拌，加麵湯調整濃稠度（溫度勿過高避免蛋炒熟），完成。",duration:120,voiceText:"關火後麵條倒入培根鍋，立刻倒蛋醬快速攪拌乳化，加麵湯調整濃稠，完成！"}
    ]
  },
  {
    id:"rec-pesto-pasta", title:"青醬義大利麵", cuisine:"義式清爽",
    prepTime:8, cookTime:12, totalTime:20, difficulty:"20分香草", servings:2, calories:580, imageFallback:"🌿",
    tags:["羅勒新鮮","松子濃香","夏日清爽"],
    description:"新鮮羅勒葉、松子、帕馬森起司、大蒜和橄欖油打成香濃青醬，拌入熱麵條，是義大利熱那亞最著名的醬汁。",
    ingredients:[
      {name:"義大利麵",qty:"200g",isMain:true,category:"staples",pxProduct:"De Cecco 義大利麵 500g",pxPrice:69,carrefourProduct:"Barilla 義大利直麵 500g",carrefourPrice:72},
      {name:"羅勒",qty:"1把(40g)",isMain:true,category:"veggies",pxProduct:"盆栽羅勒 1盆",pxPrice:59,carrefourProduct:"有機羅勒 30g",carrefourPrice:45},
      {name:"蒜頭",qty:"2瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"煮麵線",instruction:"滾水加鹽煮義大利麵至al dente，留麵湯備用。",duration:660,voiceText:"加鹽滾水煮麵至彈牙，留麵湯備用。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"果汁機或食物調理機：羅勒葉、松子2匙、蒜瓣、帕馬森起司3匙、橄欖油80ml、鹽，打成細膩青醬。",duration:180,voiceText:"羅勒、松子、蒜、帕馬森起司、橄欖油放調理機打成青醬。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"熱麵條加入青醬和少許麵湯快速拌勻，盛盤撒帕馬森起司，完成。",duration:120,voiceText:"熱麵加青醬和麵湯拌勻，撒帕馬森起司上桌！"}
    ]
  },
  {
    id:"rec-arrabbiata", title:"辣番茄義大利麵", cuisine:"義式辣味",
    prepTime:5, cookTime:15, totalTime:20, difficulty:"20分辣香", servings:2, calories:510, imageFallback:"🌶️",
    tags:["辣味開胃","番茄酸香","素食可選"],
    description:"大量蒜末和乾辣椒以橄欖油爆香，加入番茄丁熬成濃郁辣番茄醬，「arrabbiata」在義文意思就是「憤怒的」！",
    ingredients:[
      {name:"義大利麵",qty:"200g",isMain:true,category:"staples",pxProduct:"De Cecco 義大利麵 500g",pxPrice:69,carrefourProduct:"Barilla 義大利直麵 500g",carrefourPrice:72},
      {name:"番茄",qty:"3顆",isMain:true,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58},
      {name:"蒜頭",qty:"5瓣",isMain:true,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"煮麵線",instruction:"滾水加鹽煮義大利麵至al dente，留麵湯備用。",duration:660,voiceText:"加鹽滾水煮麵，留麵湯備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蒜切薄片，番茄切丁。橄欖油中小火爆蒜片和乾辣椒，蒜微黃加番茄丁，熬煮10分鐘，加鹽調味。",duration:660,voiceText:"蒜片和辣椒橄欖油爆香，加番茄丁熬十分鐘成醬汁。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"熱麵條倒入醬汁中拌勻，加麵湯調整濃稠度，撒巴西里碎，完成。",duration:120,voiceText:"麵條倒入番茄辣醬拌勻，加麵湯調整，撒巴西里完成！"}
    ]
  },
  {
    id:"rec-mushroom-risotto", title:"蘑菇起司燉飯", cuisine:"義式燉飯",
    prepTime:5, cookTime:22, totalTime:27, difficulty:"27分滑潤", servings:3, calories:540, imageFallback:"🍄",
    tags:["起司滑潤","蘑菇鮮香","義式精髓"],
    description:"洋蔥炒軟後加義大利燉飯米，以高湯一勺一勺慢慢加入攪拌，最後拌入奶油和帕馬森起司，香濃滑潤，是義式料理技術的試金石。",
    ingredients:[
      {name:"義大利燉飯米",qty:"250g",isMain:true,category:"staples",pxProduct:"Arborio燉飯米 500g",pxPrice:149,carrefourProduct:"家樂福燉飯米 500g",carrefourPrice:155},
      {name:"洋蔥",qty:"半顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45},
      {name:"蘑菇",qty:"200g",isMain:true,category:"veggies",pxProduct:"本產蘑菇 200g",pxPrice:45,carrefourProduct:"有機蘑菇 200g",carrefourPrice:52}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"備料線",instruction:"高湯800ml（雞骨湯或蔬菜湯）加熱保溫備用。蘑菇切片炒熟備用。",duration:300,voiceText:"高湯加熱保溫，蘑菇切片炒熟備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"橄欖油炒洋蔥至透明，加米粒翻炒2分鐘讓米吸收油脂，倒白酒50ml炒至揮發。",duration:300,voiceText:"橄欖油炒洋蔥，加米粒炒兩分鐘，倒白酒炒至揮發。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"每次加1勺高湯攪拌至吸收再加下一勺，重複約15分鐘至米粒al dente，拌入奶油1匙、帕馬森起司、蘑菇，完成。",duration:900,voiceText:"每次加一勺高湯攪拌到吸收，重複十五分鐘，最後拌入奶油和起司完成！"}
    ]
  },
  {
    id:"rec-frittata", title:"義式蔬菜烘蛋", cuisine:"義式家常",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分烤箱", servings:3, calories:320, imageFallback:"🍳",
    tags:["義式烘蛋","冰箱清空","早午餐首選"],
    description:"雞蛋加起司、蔬菜炒熟後先在爐上煎底，再送進烤箱或蓋鍋蓋悶熟，切片享用，是義大利版的「冰箱清空」料理。",
    ingredients:[
      {name:"雞蛋",qty:"5顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"彩椒",qty:"1顆",isMain:true,category:"veggies",pxProduct:"彩椒 2入",pxPrice:49,carrefourProduct:"有機彩椒 2入",carrefourPrice:55},
      {name:"洋蔥",qty:"半顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"洋蔥、彩椒切絲，中火炒軟。5顆蛋加鹽、黑胡椒、帕馬森起司打散。",duration:240,voiceText:"洋蔥彩椒炒軟，雞蛋加鹽、黑胡椒、起司打散。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"蔬菜倒入蛋液中混合，倒回鍋中，小火煎底面定型（約3分鐘），蓋鍋蓋燜5分鐘至熟透，翻面上色，切片完成。",duration:480,voiceText:"蛋液加蔬菜倒回鍋，小火煎底定型，蓋鍋燜五分鐘，翻面上色切片完成！"}
    ]
  },
  {
    id:"rec-pizza-toast", title:"義式馬格麗特披薩吐司", cuisine:"義式快食",
    prepTime:5, cookTime:8, totalTime:13, difficulty:"13分烤箱快", servings:2, calories:420, imageFallback:"🍕",
    tags:["氣炸鍋適用","馬格麗特經典","10分鐘"],
    description:"厚片吐司塗番茄醬，鋪上番茄片和莫札瑞拉起司，烤至起司融化呈現金黃色，點綴羅勒葉，5分鐘重現義大利披薩香氣。",
    ingredients:[
      {name:"吐司",qty:"4片",isMain:true,category:"staples",pxProduct:"山型厚片吐司 6入",pxPrice:49,carrefourProduct:"家樂福厚片吐司",carrefourPrice:45},
      {name:"番茄",qty:"1顆",isMain:true,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"烤箱或氣炸鍋預熱200°C。",duration:300,voiceText:"烤箱或氣炸鍋預熱兩百度。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"吐司塗番茄醬，鋪番茄片、撒大量莫札瑞拉起司絲、黑胡椒、義大利香料。",duration:120,voiceText:"吐司塗番茄醬，鋪番茄片和起司，撒黑胡椒和義大利香料。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"放入烤箱烤7分鐘至起司金黃融化，取出點綴羅勒葉，完成。",duration:420,voiceText:"烤七分鐘到起司金黃，點綴羅勒葉完成！"}
    ]
  },
  {
    id:"rec-seafood-risotto", title:"鮮蝦白酒燉飯", cuisine:"義式海鮮",
    prepTime:5, cookTime:25, totalTime:30, difficulty:"30分宴客", servings:3, calories:560, imageFallback:"🦐",
    tags:["白酒鮮香","海鮮奢華","宴客首選"],
    description:"蝦頭熬成蝦高湯，加入燉飯米慢火燉製，最後鋪上完整蝦仁，白酒與海鮮的香氣融合，是義式海鮮料理的精髓。",
    ingredients:[
      {name:"蝦仁",qty:"200g",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"義大利燉飯米",qty:"200g",isMain:true,category:"staples",pxProduct:"Arborio燉飯米 500g",pxPrice:149,carrefourProduct:"家樂福燉飯米 500g",carrefourPrice:155},
      {name:"洋蔥",qty:"半顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"橄欖油炒蒜末，加蝦仁炒至半熟先起鍋。原鍋炒洋蔥至透明，加米粒翻炒，倒白酒50ml。",duration:300,voiceText:"蒜末炒蝦仁半熟先起鍋，原鍋炒洋蔥加米粒，倒白酒。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"每次加1勺蝦高湯攪拌吸收，重複約18分鐘，至米al dente，鋪上蝦仁，拌入奶油和帕馬森起司，完成。",duration:1080,voiceText:"一勺一勺加高湯攪拌十八分鐘，米心有嚼勁後鋪蝦仁，拌入奶油起司完成！"}
    ]
  },
  {
    id:"rec-bruschetta", title:"義式番茄大蒜麵包", cuisine:"義式前菜",
    prepTime:5, cookTime:5, totalTime:10, difficulty:"10分開胃", servings:4, calories:260, imageFallback:"🥖",
    tags:["前菜開胃","番茄新鮮","麵包香脆"],
    description:"法國棍子麵包烤香後，用蒜瓣抹面，鋪上新鮮番茄丁、羅勒葉、橄欖油，是義大利最受歡迎的開胃前菜，清爽又充滿食慾。",
    ingredients:[
      {name:"法國棍子",qty:"半條",isMain:true,category:"staples",pxProduct:"法國長棍麵包 1條",pxPrice:55,carrefourProduct:"家樂福法國棍 1條",carrefourPrice:49},
      {name:"番茄",qty:"3顆",isMain:true,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58},
      {name:"蒜頭",qty:"2瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"烤箱180°C或烤麵包機，麵包切片烤至表面酥脆。",duration:300,voiceText:"烤箱烤麵包片至表面酥脆。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"番茄去籽切小丁，加羅勒碎、橄欖油2匙、鹽、黑胡椒、白醋少許調成番茄莎莎。",duration:180,voiceText:"番茄去籽切小丁加羅勒、橄欖油、鹽、黑胡椒調成番茄莎莎。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"麵包片趁熱用蒜瓣抹面，鋪上番茄莎莎，淋橄欖油，完成。",duration:60,voiceText:"麵包片趁熱抹蒜，鋪番茄莎莎，淋橄欖油，義式前菜完成！"}
    ]
  },

  // ── 美式 新增 ──
  {
    id:"rec-burger-patty", title:"美式起司漢堡排", cuisine:"美式快食",
    prepTime:5, cookTime:10, totalTime:15, difficulty:"15分juicy", servings:2, calories:680, imageFallback:"🍔",
    tags:["多汁肉排","起司融化","美式經典"],
    description:"牛絞肉加洋蔥末、鹽胡椒捏成厚實肉排，大火煎出美麗焦殼，放上起司片融化，夾入漢堡麵包，配薯條是美式夢幻晚餐。",
    ingredients:[
      {name:"牛絞肉",qty:"300g",isMain:true,category:"proteins",pxProduct:"美國牛絞肉 300g",pxPrice:168,carrefourProduct:"家樂福牛絞肉 300g",carrefourPrice:180},
      {name:"漢堡麵包",qty:"2個",isMain:true,category:"staples",pxProduct:"漢堡包 4入",pxPrice:55,carrefourProduct:"家樂福漢堡包 4入",carrefourPrice:58},
      {name:"洋蔥",qty:"半顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"牛絞肉加洋蔥末2匙、鹽1匙、黑胡椒1匙、蒜粉少許，手捏成2cm厚圓餅，中間按凹防膨脹。",duration:180,voiceText:"牛絞肉加洋蔥末、鹽、黑胡椒、蒜粉，捏成厚圓餅，中間按凹。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鑄鐵鍋或厚底鍋大火燒熱不加油，肉排下鍋兩面各煎3分鐘，最後放起司片蓋鍋融化，夾入烤過的麵包，加生菜番茄醬，完成。",duration:420,voiceText:"大火乾煎肉排兩面各三分鐘，放起司片蓋鍋融化，夾入麵包加配料完成！"}
    ]
  },
  {
    id:"rec-mac-cheese", title:"美式焗烤起司通心粉", cuisine:"美式家常",
    prepTime:5, cookTime:20, totalTime:25, difficulty:"25分療癒", servings:4, calories:620, imageFallback:"🧀",
    tags:["起司滿滿","兒童最愛","療癒系料理"],
    description:"通心粉煮熟後拌入自製白醬起司醬，撒上大量切達起司絲送進烤箱，焗至金黃起泡，是美式家庭最療癒的Comfort Food。",
    ingredients:[
      {name:"通心粉",qty:"250g",isMain:true,category:"staples",pxProduct:"Barilla 彎管麵 500g",pxPrice:65,carrefourProduct:"家樂福通心粉 500g",carrefourPrice:62},
      {name:"牛奶",qty:"300ml",isMain:false,category:"pantry",pxProduct:"統一鮮乳 946ml",pxPrice:75,carrefourProduct:"家樂福鮮乳 946ml",carrefourPrice:72}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"煮麵線",instruction:"滾水加鹽煮通心粉至al dente，瀝乾備用。烤箱預熱180°C。",duration:780,voiceText:"煮通心粉至彈牙瀝乾，烤箱預熱一百八十度。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"奶油2匙融化，加麵粉2匙炒1分鐘，倒牛奶300ml邊攪邊煮成白醬，加鹽、黑胡椒、切達起司100g攪融。",duration:480,voiceText:"奶油加麵粉炒一分鐘，加牛奶攪煮成白醬，加起司融化。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"通心粉拌入起司白醬，倒入烤皿，撒大量起司絲，烤10分鐘至金黃起泡，完成。",duration:600,voiceText:"通心粉拌醬倒入烤皿，撒起司絲烤十分鐘至金黃，完成！"}
    ]
  },
  {
    id:"rec-honey-chicken", title:"蜂蜜芥末烤雞腿", cuisine:"美式烤箱",
    prepTime:5, cookTime:25, totalTime:30, difficulty:"30分烤箱免顧", servings:3, calories:520, imageFallback:"🍯",
    tags:["烤箱免顧","蜂蜜焦糖","外酥內嫩"],
    description:"雞腿排以蜂蜜、第戎芥末醬、蒜末醃製，送入烤箱烤至蜂蜜焦糖化，外皮酥香內肉多汁，是最輕鬆的烤箱雞料理。",
    ingredients:[
      {name:"去骨雞腿",qty:"3支(600g)",isMain:true,category:"proteins",pxProduct:"台灣去骨雞腿排 2入",pxPrice:128,carrefourProduct:"家樂福去骨雞腿 400g",carrefourPrice:138},
      {name:"蒜頭",qty:"3瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"烤箱預熱200°C。",duration:600,voiceText:"烤箱預熱兩百度。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"調醃醬：蜂蜜3匙、第戎芥末醬2匙、醬油1匙、蒜末、橄欖油、鹽胡椒，雞腿排均勻塗抹。",duration:180,voiceText:"蜂蜜、芥末醬、醬油、蒜末、橄欖油調成醃醬，雞腿塗抹均勻。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"雞腿皮面朝上放烤架，烤箱200°C烤25分鐘，最後3分鐘開上火烤至焦糖色，完成。",duration:1500,voiceText:"雞腿皮面朝上烤二十五分鐘，最後三分鐘開上火烤到焦糖色完成！"}
    ]
  },
  {
    id:"rec-clam-chowder", title:"美式蛤蜊巧達濃湯", cuisine:"美式濃湯",
    prepTime:5, cookTime:18, totalTime:23, difficulty:"23分暖心", servings:4, calories:380, imageFallback:"🥣",
    tags:["波士頓風味","起司濃郁","麵包碗搭配"],
    description:"培根炒香後加洋蔥、芹菜、馬鈴薯熬煮，倒入鮮奶油和蛤蜊，濃稠奶白，配上麵包碗是波士頓最著名的海鮮濃湯。",
    ingredients:[
      {name:"蛤蜊",qty:"400g",isMain:true,category:"proteins",pxProduct:"台灣活蜆仔 500g",pxPrice:79,carrefourProduct:"鮮活蛤蜊 500g",carrefourPrice:85},
      {name:"馬鈴薯",qty:"2顆",isMain:true,category:"veggies",pxProduct:"台灣馬鈴薯 500g",pxPrice:39,carrefourProduct:"有機馬鈴薯 500g",carrefourPrice:45},
      {name:"培根",qty:"3片",isMain:false,category:"proteins",pxProduct:"美式培根片 100g",pxPrice:58,carrefourProduct:"家樂福煙燻培根 100g",carrefourPrice:62}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"培根切小丁，乾鍋煎酥，加洋蔥、芹菜炒軟，加麵粉1匙炒勻，加馬鈴薯丁翻炒。",duration:360,voiceText:"培根煎酥，加洋蔥芹菜炒軟，加麵粉炒勻，加馬鈴薯翻炒。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"注入高湯400ml和鮮奶油200ml，中火燉煮10分鐘至馬鈴薯軟透，加入蛤蜊煮至開口，加鹽胡椒，完成。",duration:720,voiceText:"倒入高湯和鮮奶油煮十分鐘，加蛤蜊煮到開口，調味完成！"}
    ]
  },
  {
    id:"rec-buffalo-wings", title:"美式水牛城辣雞翅", cuisine:"美式派對",
    prepTime:5, cookTime:25, totalTime:30, difficulty:"30分派對首選", servings:4, calories:540, imageFallback:"🔥",
    tags:["辣醬香脆","派對必備","啤酒絕配"],
    description:"雞翅醃製後烤箱烤至酥脆，裹上奶油辣醬，酸辣鹹香，是美式Super Bowl派對絕對不能缺少的下酒點心。",
    ingredients:[
      {name:"雞翅",qty:"600g",isMain:true,category:"proteins",pxProduct:"台灣雞二節翅 600g",pxPrice:105,carrefourProduct:"家樂福雞翅 600g",carrefourPrice:112},
      {name:"蒜頭",qty:"3瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"烤箱預熱220°C。",duration:600,voiceText:"烤箱預熱兩百二十度。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"雞翅擦乾，加鹽、黑胡椒、蒜粉、辣椒粉均勻抹遍，烤盤鋪錫箔紙。調辣醬：奶油30g融化加辣椒醬3匙。",duration:240,voiceText:"雞翅擦乾抹鹽黑胡椒蒜粉辣椒粉，奶油加辣椒醬調成辣醬備用。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"雞翅烤箱220°C烤25分鐘翻面一次，取出趁熱裹上辣醬，撒芹菜丁，配藍紋起司醬，完成。",duration:1500,voiceText:"烤二十五分鐘翻面一次，取出裹辣醬，配藍紋起司醬完成！"}
    ]
  },
  {
    id:"rec-tuna-melt", title:"鮪魚融化起司三明治", cuisine:"美式快食",
    prepTime:5, cookTime:8, totalTime:13, difficulty:"13分午餐速成", servings:2, calories:480, imageFallback:"🥪",
    tags:["起司融化","鮪魚美乃滋","午餐首選"],
    description:"鮪魚加美乃滋、洋蔥末調成沙拉，鋪在吐司上放起司片，送入平底鍋煎至兩面金黃起司融化，是美式Diner的經典點心。",
    ingredients:[
      {name:"吐司",qty:"4片",isMain:true,category:"staples",pxProduct:"山型厚片吐司 6入",pxPrice:49,carrefourProduct:"家樂福厚片吐司",carrefourPrice:45},
      {name:"鮪魚罐頭",qty:"1罐(185g)",isMain:true,category:"proteins",pxProduct:"東遠鮪魚水浸 185g",pxPrice:45,carrefourProduct:"家樂福鮪魚罐頭 185g",carrefourPrice:42},
      {name:"洋蔥",qty:"1/4顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"鮪魚瀝乾，加美乃滋2匙、洋蔥末、芹菜末、黑胡椒、檸檬汁調成鮪魚沙拉。",duration:120,voiceText:"鮪魚瀝乾加美乃滋、洋蔥末、芹菜末、黑胡椒和檸檬汁調成鮪魚沙拉。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"吐司鋪鮪魚沙拉，放起司片，蓋上另一片吐司。平底鍋下奶油，中火兩面各煎3分鐘至金黃起司融化，對切上桌。",duration:420,voiceText:"吐司夾鮪魚沙拉和起司，奶油鍋中火煎兩面至金黃起司融化，對切上桌！"}
    ]
  },
  {
    id:"rec-chicken-salad", title:"烤雞凱薩沙拉", cuisine:"美式輕食",
    prepTime:8, cookTime:12, totalTime:20, difficulty:"20分清爽", servings:2, calories:360, imageFallback:"🥗",
    tags:["健康輕食","高蛋白低卡","減脂首選"],
    description:"雞胸肉用香料烤香後切片，搭配羅馬生菜、帕馬森起司、麵包丁，淋上自製凱薩醬，是健身族群和減脂者的最愛。",
    ingredients:[
      {name:"雞胸肉",qty:"2片(300g)",isMain:true,category:"proteins",pxProduct:"台灣雞胸肉 300g",pxPrice:79,carrefourProduct:"家樂福雞胸肉 300g",carrefourPrice:85},
      {name:"吐司",qty:"2片(麵包丁)",isMain:false,category:"staples",pxProduct:"山型厚片吐司 6入",pxPrice:49,carrefourProduct:"家樂福厚片吐司",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"烤箱200°C預熱，吐司丁烤8分鐘至酥脆備用。",duration:480,voiceText:"烤箱預熱，吐司丁烤脆備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"雞胸肉加橄欖油、鹽、黑胡椒、蒜粉、義大利香料，平底鍋中大火兩面各煎5分鐘，靜置切片。",duration:600,voiceText:"雞胸肉加香料煎兩面各五分鐘，靜置兩分鐘切片。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"調凱薩醬：美乃滋3匙、帕馬森起司1匙、檸檬汁1匙、黑胡椒、蒜末。生菜洗淨擺盤，加雞肉、麵包丁、起司，淋醬完成。",duration:180,voiceText:"調凱薩醬，生菜擺盤加雞肉麵包丁，淋醬完成！"}
    ]
  },
  {
    id:"rec-eggs-benedict", title:"美式班尼迪克蛋", cuisine:"美式早午餐",
    prepTime:8, cookTime:10, totalTime:18, difficulty:"18分早午餐", servings:2, calories:520, imageFallback:"🥚",
    tags:["水波蛋","荷蘭醬","Brunch必點"],
    description:"英式馬芬烤香，放上加拿大培根，鋪上完美水波蛋，淋上奶油荷蘭醬，是紐約Brunch餐廳的招牌料理。",
    ingredients:[
      {name:"雞蛋",qty:"4顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"培根",qty:"4片",isMain:true,category:"proteins",pxProduct:"美式培根片 100g",pxPrice:58,carrefourProduct:"家樂福煙燻培根 100g",carrefourPrice:62},
      {name:"吐司",qty:"2片",isMain:false,category:"staples",pxProduct:"山型厚片吐司 6入",pxPrice:49,carrefourProduct:"家樂福厚片吐司",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"吐司烤酥。培根煎熟。調簡易荷蘭醬：蛋黃2個加融化奶油40g、檸檬汁、鹽隔水攪拌至濃稠。",duration:480,voiceText:"烤吐司煎培根，蛋黃加奶油檸檬汁隔水攪拌成荷蘭醬備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"水鍋加白醋1匙煮至微滾（不沸騰），蛋打入小碗，輕輕滑入水中，煮3分鐘成水波蛋撈起。",duration:300,voiceText:"水加白醋微滾，蛋滑入水中煮三分鐘成水波蛋。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"吐司鋪培根，放上水波蛋，淋荷蘭醬，撒黑胡椒和紅椒粉，完成。",duration:60,voiceText:"吐司放培根和水波蛋，淋荷蘭醬撒黑胡椒，班尼迪克蛋完成！"}
    ]
  },


  // ── 泰式 新增 ──
  {
    id:"rec-padthai", title:"泰式炒河粉", cuisine:"泰式經典",
    prepTime:8, cookTime:10, totalTime:18, difficulty:"18分街頭", servings:2, calories:510, imageFallback:"🍜",
    tags:["街頭美食","酸甜鮮香","乾炒技術"],
    description:"河粉大火乾炒，加入蛋、豆芽、蝦仁，以魚露、羅望子醬、棕櫚糖調成的醬汁炒出焦香，是泰國曼谷街頭最標誌性的料理。",
    ingredients:[
      {name:"河粉",qty:"200g",isMain:true,category:"staples",pxProduct:"乾燥河粉 200g",pxPrice:35,carrefourProduct:"泰式河粉 200g",carrefourPrice:38},
      {name:"蝦仁",qty:"150g",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"雞蛋",qty:"2顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"豆芽菜",qty:"100g",isMain:true,category:"veggies",pxProduct:"本產豆芽菜 200g",pxPrice:15,carrefourProduct:"有機豆芽菜 150g",carrefourPrice:18}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"泡發線",instruction:"河粉泡溫水20分鐘至軟化，瀝乾。調醬汁：魚露2匙、醬油1匙、砂糖2匙、羅望子醬2匙。",duration:1200,voiceText:"河粉泡溫水二十分鐘，調好魚露醬油砂糖羅望子醬汁備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋多下油，炒蝦仁至變色起鍋，推鍋炒蛋至半熟，下河粉翻炒，倒醬汁拌炒均勻。",duration:360,voiceText:"大火炒蝦仁起鍋，炒半熟蛋，下河粉倒醬汁大火拌炒。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"加豆芽菜快炒，放回蝦仁，撒花生碎、蔥花、檸檬汁，完成。",duration:120,voiceText:"加豆芽炒勻，放蝦仁撒花生碎蔥花和檸檬汁，泰式炒河粉完成！"}
    ]
  },
  {
    id:"rec-green-curry", title:"泰式綠咖哩雞", cuisine:"泰式咖哩",
    prepTime:5, cookTime:15, totalTime:20, difficulty:"20分香濃", servings:4, calories:460, imageFallback:"🥥",
    tags:["椰奶香濃","綠咖哩辛香","泰國國民料理"],
    description:"綠咖哩醬以椰奶炒出香氣，加入雞肉和茄子燉煮，最後放羅勒葉，清甜椰香中帶著辛辣香草，是泰式咖哩的代表。",
    ingredients:[
      {name:"去骨雞腿",qty:"2支(400g)",isMain:true,category:"proteins",pxProduct:"台灣去骨雞腿排 2入",pxPrice:128,carrefourProduct:"家樂福去骨雞腿 400g",carrefourPrice:138},
      {name:"椰奶",qty:"400ml(1罐)",isMain:true,category:"pantry",pxProduct:"泰國椰奶 400ml",pxPrice:55,carrefourProduct:"家樂福椰奶 400ml",carrefourPrice:58},
      {name:"白飯",qty:"4碗",isMain:false,category:"staples",pxProduct:"南僑膳纖熟飯 200g/4盒",pxPrice:150,carrefourProduct:"御用熟白飯 4入",carrefourPrice:160}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白飯電鍋加熱備用。",duration:600,voiceText:"白飯放入電鍋加熱。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"椰奶100ml入鍋，加綠咖哩醬2匙，中火炒至出香氣和油脂，雞肉切塊下鍋翻炒。",duration:240,voiceText:"椰奶加綠咖哩醬炒出香氣，雞肉切塊下鍋翻炒。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"加剩餘椰奶、水200ml、魚露2匙、砂糖1匙，放茄子塊，燉煮10分鐘，最後放羅勒葉，完成。",duration:600,voiceText:"加椰奶、水、魚露、砂糖和茄子燉十分鐘，放羅勒葉完成！"}
    ]
  },
  {
    id:"rec-tom-kha", title:"泰式椰奶雞湯", cuisine:"泰式清湯",
    prepTime:5, cookTime:15, totalTime:20, difficulty:"20分清甜", servings:3, calories:320, imageFallback:"🥥",
    tags:["椰奶清甜","香茅提香","酸辣平衡"],
    description:"香茅、南薑、卡菲爾萊姆葉熬出香草基底，加入椰奶和雞肉，魚露和萊姆汁調出酸辣甜的完美平衡，是泰式湯品代表。",
    ingredients:[
      {name:"雞胸肉",qty:"300g",isMain:true,category:"proteins",pxProduct:"台灣雞胸肉 300g",pxPrice:79,carrefourProduct:"家樂福雞胸肉 300g",carrefourPrice:85},
      {name:"椰奶",qty:"400ml",isMain:true,category:"pantry",pxProduct:"泰國椰奶 400ml",pxPrice:55,carrefourProduct:"家樂福椰奶 400ml",carrefourPrice:58},
      {name:"蘑菇",qty:"150g",isMain:false,category:"veggies",pxProduct:"本產蘑菇 200g",pxPrice:45,carrefourProduct:"有機蘑菇 200g",carrefourPrice:52}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"香茅拍扁切段，南薑切片，雞肉切薄片，蘑菇切片。",duration:180,voiceText:"香茅拍扁切段，南薑切片，雞肉和蘑菇切片備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋加水400ml，放香茅、南薑、卡菲爾萊姆葉煮5分鐘出香，倒入椰奶煮沸，加雞肉和蘑菇煮5分鐘，加魚露、萊姆汁調味，撒辣椒片，完成。",duration:600,voiceText:"香草熬湯底，加椰奶煮沸，放雞肉蘑菇煮五分鐘，魚露萊姆汁調味完成！"}
    ]
  },
  {
    id:"rec-thai-fried-rice", title:"泰式鳳梨炒飯", cuisine:"泰式快食",
    prepTime:5, cookTime:10, totalTime:15, difficulty:"15分南洋", servings:3, calories:480, imageFallback:"🍍",
    tags:["鳳梨酸甜","異國風情","一鍋完成"],
    description:"以魚露和醬油炒出鑊氣的炒飯，加入鳳梨丁帶來清甜酸味，配腰果和葡萄乾，是泰式餐廳的招牌炒飯。",
    ingredients:[
      {name:"白飯",qty:"3碗(冷飯)",isMain:true,category:"staples",pxProduct:"南僑膳纖熟飯 200g/3盒",pxPrice:115,carrefourProduct:"御用熟白飯 3入",carrefourPrice:120},
      {name:"雞蛋",qty:"2顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"蝦仁",qty:"150g",isMain:false,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蛋打散。蝦仁加鹽備用。鳳梨切丁（新鮮或罐頭）。",duration:120,voiceText:"蛋打散，蝦仁加鹽，鳳梨切丁備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋下油，炒蝦仁至變色起鍋，炒半熟蛋，加冷飯大火翻炒，魚露2匙、醬油1匙調味，加鳳梨、葡萄乾、腰果翻炒，放回蝦仁，完成。",duration:420,voiceText:"炒蝦仁起鍋，炒蛋加飯大火炒，魚露醬油調味加鳳梨腰果，放回蝦仁完成！"}
    ]
  },
  {
    id:"rec-massaman", title:"泰式馬沙曼咖哩牛肉", cuisine:"泰式咖哩",
    prepTime:8, cookTime:25, totalTime:33, difficulty:"33分香料慢燉", servings:4, calories:580, imageFallback:"🍛",
    tags:["伊斯蘭風情","馬鈴薯暖心","香料豐富"],
    description:"馬沙曼咖哩源自伊斯蘭傳統，以肉桂、丁香、八角調香，牛肉與馬鈴薯椰奶慢燉，甘甜不辣，是世界最美味咖哩之一。",
    ingredients:[
      {name:"牛肉片",qty:"400g",isMain:true,category:"proteins",pxProduct:"美國牛五花肉片 400g",pxPrice:198,carrefourProduct:"家樂福嚴選牛五花片 400g",carrefourPrice:220},
      {name:"馬鈴薯",qty:"2顆",isMain:true,category:"veggies",pxProduct:"台灣馬鈴薯 500g",pxPrice:39,carrefourProduct:"有機馬鈴薯 500g",carrefourPrice:45},
      {name:"椰奶",qty:"400ml",isMain:true,category:"pantry",pxProduct:"泰國椰奶 400ml",pxPrice:55,carrefourProduct:"家樂福椰奶 400ml",carrefourPrice:58}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白飯電鍋加熱備用。",duration:600,voiceText:"白飯加熱備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"鍋下油，炒馬沙曼咖哩醬3匙出香，加牛肉翻炒，倒椰奶400ml和水200ml，加馬鈴薯塊。",duration:360,voiceText:"咖哩醬炒出香氣，加牛肉翻炒，倒椰奶和水，加馬鈴薯。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火煮沸後轉中小火燉20分鐘，加魚露2匙、棕櫚糖1匙、花生碎，待馬鈴薯軟透，完成。",duration:1200,voiceText:"沸後轉中小火燉二十分鐘，加魚露砂糖花生碎，馬鈴薯軟透完成！"}
    ]
  },
  {
    id:"rec-thai-basil-shrimp", title:"泰式打拋炒蝦", cuisine:"泰式快炒",
    prepTime:5, cookTime:8, totalTime:13, difficulty:"13分辣香", servings:3, calories:320, imageFallback:"🌿",
    tags:["打拋醬香辣","九層塔爆香","下飯神菜"],
    description:"蝦仁以打拋醬和蒜末大火快炒，最後加入大量九層塔爆香，鮮辣味道讓人食慾大開，比雞肉版更為鮮甜。",
    ingredients:[
      {name:"蝦仁",qty:"300g",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"九層塔",qty:"1大把",isMain:true,category:"pantry",pxProduct:"本產九層塔包",pxPrice:18,carrefourProduct:"有機九層塔 50g",carrefourPrice:22},
      {name:"蒜頭",qty:"5瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蒜切末，辣椒切末，九層塔摘葉。調打拋醬：魚露2匙、醬油1匙、糖1匙、蠔油1匙。",duration:150,voiceText:"蒜末辣椒末九層塔備好，調好打拋醬汁。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋下油，爆香蒜辣椒，下蝦仁大火翻炒至變色，倒入打拋醬炒勻，加九層塔大火爆炒10秒起鍋，配飯完成。",duration:240,voiceText:"大火爆香蒜辣椒，炒蝦仁倒打拋醬，加九層塔爆炒十秒起鍋！"}
    ]
  },
  {
    id:"rec-mango-salad", title:"泰式青木瓜沙拉", cuisine:"泰式開胃",
    prepTime:10, cookTime:0, totalTime:10, difficulty:"10分免開火", servings:3, calories:180, imageFallback:"🥭",
    tags:["免開火","酸辣開胃","低卡清爽"],
    description:"青木瓜刨絲後以魚露、萊姆汁、辣椒、糖、花生捶打入味，酸辣鮮甜，是泰國街頭最清爽的沙拉，夏天吃特別解熱。",
    ingredients:[
      {name:"青木瓜",qty:"半顆(300g)",isMain:true,category:"veggies",pxProduct:"本產青木瓜 1顆",pxPrice:35,carrefourProduct:"有機青木瓜 500g",carrefourPrice:42},
      {name:"番茄",qty:"1顆",isMain:false,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"青木瓜去皮刨成細絲，番茄切片，蒜和辣椒切末。",duration:300,voiceText:"青木瓜刨細絲，番茄切片，蒜辣椒切末。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"大碗放蒜末、辣椒、砂糖2匙，用木杵搗碎，加木瓜絲、番茄、魚露3匙、萊姆汁3匙翻拌，撒花生碎，完成。",duration:300,voiceText:"蒜辣椒砂糖用杵搗碎，加木瓜絲、番茄、魚露、萊姆汁翻拌，撒花生碎完成！"}
    ]
  },

  // ── 中式 新增 ──
  {
    id:"rec-red-braised-fish", title:"紅燒魚", cuisine:"中式家常",
    prepTime:5, cookTime:15, totalTime:20, difficulty:"20分入味", servings:3, calories:340, imageFallback:"🐟",
    tags:["紅燒醬香","魚肉嫩鮮","下飯好菜"],
    description:"鱸魚或鯛魚以醬油、米酒、糖紅燒，加薑蒜去腥，燒至醬汁濃郁入味，魚肉白嫩鮮甜，是中式家庭桌上最常見的魚料理。",
    ingredients:[
      {name:"鱸魚",qty:"1條(500g)",isMain:true,category:"proteins",pxProduct:"台灣鱸魚 500g",pxPrice:159,carrefourProduct:"家樂福鮮鱸魚 500g",carrefourPrice:170},
      {name:"薑",qty:"5片",isMain:false,category:"pantry",pxProduct:"台灣老薑 300g",pxPrice:35,carrefourProduct:"有機老薑 300g",carrefourPrice:39},
      {name:"青蔥",qty:"3支",isMain:false,category:"pantry",pxProduct:"本產青蔥包",pxPrice:28,carrefourProduct:"本產有機青蔥 150g",carrefourPrice:32}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"魚身兩面劃刀，抹少許鹽靜置2分鐘。薑切片，蒜拍碎，蔥切段。",duration:180,voiceText:"魚身劃刀抹鹽靜置，薑切片蒜拍碎蔥切段。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"平底鍋下油，中大火煎魚兩面至金黃，加薑蒜爆香，倒醬油3匙、米酒2匙、糖1匙、水150ml，大火煮沸轉小火燒8分鐘，撒蔥花完成。",duration:600,voiceText:"煎魚兩面金黃，加薑蒜倒醬油米酒糖水，燒八分鐘收汁，撒蔥花完成！"}
    ]
  },
  {
    id:"rec-sweet-sour-pork", title:"糖醋里脊", cuisine:"中式家常",
    prepTime:8, cookTime:12, totalTime:20, difficulty:"20分酸甜", servings:3, calories:480, imageFallback:"🍖",
    tags:["酸甜開胃","外酥內嫩","中餐館人氣"],
    description:"豬里脊裹蛋液麵衣炸至酥脆，淋上醋、糖、番茄醬調成的糖醋醬，酸甜可口，是中式餐廳必點的經典菜色。",
    ingredients:[
      {name:"豬里肌肉",qty:"300g",isMain:true,category:"proteins",pxProduct:"台灣豬里肌肉 300g",pxPrice:79,carrefourProduct:"家樂福豬里肌肉 300g",carrefourPrice:85},
      {name:"彩椒",qty:"1顆",isMain:false,category:"veggies",pxProduct:"彩椒 2入",pxPrice:49,carrefourProduct:"有機彩椒 2入",carrefourPrice:55},
      {name:"洋蔥",qty:"半顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"豬肉切條，加鹽胡椒醃5分鐘，裹上蛋液和麵粉（或太白粉）。調糖醋醬：番茄醬3匙、白醋2匙、糖2匙、水3匙。",duration:360,voiceText:"豬肉切條醃製裹粉，番茄醬白醋糖調成糖醋醬備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"油鍋170°C炸豬肉至金黃撈起。原鍋少油炒彩椒洋蔥，倒入糖醋醬煮沸，回鍋豬肉翻勻，完成。",duration:420,voiceText:"炸豬肉至金黃，炒蔬菜倒糖醋醬，回鍋豬肉翻勻完成！"}
    ]
  },
  {
    id:"rec-fish-fragrant-eggplant", title:"魚香茄子", cuisine:"川式家常",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分川辣", servings:3, calories:300, imageFallback:"🍆",
    tags:["川式下飯","茄子吸味","豬肉末增香"],
    description:"茄子切條過油炸軟，以豆瓣醬、薑蒜、豬肉末翻炒，勾薄芡後酸辣鹹甜俱備，雖無魚卻有魚香，是川菜最獨特的味型。",
    ingredients:[
      {name:"茄子",qty:"2條(400g)",isMain:true,category:"veggies",pxProduct:"本產長茄子 400g",pxPrice:28,carrefourProduct:"有機茄子 400g",carrefourPrice:35},
      {name:"豬肉碎",qty:"100g",isMain:false,category:"proteins",pxProduct:"冷藏台灣豬細絞肉 200g",pxPrice:48,carrefourProduct:"家樂福豬絞肉 200g",carrefourPrice:55},
      {name:"蒜頭",qty:"4瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"茄子切滾刀塊，下油鍋大火煎至軟化出油，撈起備用。蒜薑切末，青蔥切蔥花。",duration:240,voiceText:"茄子下油鍋煎軟撈起，蒜薑切末，蔥切蔥花。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"原鍋少油，炒豬肉碎至變色，加蒜末薑末和豆瓣醬2匙翻炒出紅油，放茄子翻炒，加醬油2匙、白醋1匙、糖1匙、水3匙，太白粉水勾薄芡，撒蔥花完成。",duration:360,voiceText:"炒豬肉加豆瓣醬炒紅油，放茄子加醬油白醋糖和水，勾芡撒蔥花完成！"}
    ]
  },
  {
    id:"rec-suan-cai-fish", title:"酸菜魚片湯", cuisine:"川式清湯",
    prepTime:8, cookTime:12, totalTime:20, difficulty:"20分酸辣鮮", servings:4, calories:290, imageFallback:"🐟",
    tags:["酸辣鮮香","魚片嫩滑","重慶風味"],
    description:"魚片以鹽和太白粉上漿，倒入酸菜、辣椒熬煮的酸辣湯底中滾熟，鮮嫩不腥，是重慶最受歡迎的川式魚湯。",
    ingredients:[
      {name:"鱸魚",qty:"1條(400g切片)",isMain:true,category:"proteins",pxProduct:"台灣鱸魚 500g",pxPrice:159,carrefourProduct:"家樂福鮮鱸魚 500g",carrefourPrice:170},
      {name:"酸白菜",qty:"200g",isMain:true,category:"pantry",pxProduct:"台灣酸菜 200g",pxPrice:28,carrefourProduct:"酸白菜 200g",carrefourPrice:32},
      {name:"豆芽菜",qty:"100g",isMain:false,category:"veggies",pxProduct:"本產豆芽菜 200g",pxPrice:15,carrefourProduct:"有機豆芽菜 150g",carrefourPrice:18}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"魚去骨切片，加鹽、白胡椒、太白粉、蛋白上漿。酸菜擠水切段。薑切絲，蒜拍碎，乾辣椒備用。",duration:300,voiceText:"魚片上漿，酸菜切段，薑絲蒜末乾辣椒備好。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋下油炒香薑蒜辣椒和酸菜，加水600ml煮沸，轉小火，逐片放入魚片輕輕推散，2分鐘後撈起，淋熱油激香蒜末，完成。",duration:420,voiceText:"炒香酸菜加水煮沸，逐片放魚片煮兩分鐘，淋熱油激香蒜末完成！"}
    ]
  },
  {
    id:"rec-steamed-pork-rice", title:"粉蒸肉", cuisine:"中式家常",
    prepTime:8, cookTime:20, totalTime:28, difficulty:"28分電鍋輕鬆", servings:4, calories:560, imageFallback:"🥣",
    tags:["電鍋料理","米香豬肉","傳統滋味"],
    description:"五花肉裹上炒香的蒸肉粉，鋪在芋頭片或南瓜上，放入電鍋蒸熟，米粉吸收豬油香氣後Q彈鬆軟，是傳統中式蒸菜代表。",
    ingredients:[
      {name:"五花肉",qty:"400g",isMain:true,category:"proteins",pxProduct:"台灣豬五花肉塊 400g",pxPrice:99,carrefourProduct:"家樂福豬五花肉 400g",carrefourPrice:105},
      {name:"芋頭",qty:"200g",isMain:false,category:"veggies",pxProduct:"台灣芋頭 600g",pxPrice:49,carrefourProduct:"有機芋頭 500g",carrefourPrice:55}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"五花肉切0.3cm薄片，加醬油2匙、豆瓣醬1匙、薑末、蒜末、砂糖1匙醃10分鐘。裹上蒸肉粉均勻。",duration:600,voiceText:"五花肉切薄片醃十分鐘，裹上蒸肉粉均勻備用。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"芋頭切片鋪在碗底，肉片鋪上，電鍋外鍋2杯水蒸20分鐘，取出撒蔥花，完成。",duration:1200,voiceText:"芋頭鋪碗底放肉片，電鍋蒸二十分鐘，撒蔥花完成！"}
    ]
  },

  // ── 東南亞 新增 ──
  {
    id:"rec-nasi-lemak", title:"馬來椰漿飯", cuisine:"馬來風情",
    prepTime:5, cookTime:20, totalTime:25, difficulty:"25分香濃", servings:3, calories:580, imageFallback:"🥥",
    tags:["椰漿米飯","馬來國民食","配料豐盛"],
    description:"白米加椰奶和班蘭葉蒸成芬芳椰漿飯，搭配參巴辣醬、炸花生、半熟蛋和小魚乾，是馬來西亞的國民早餐與靈魂料理。",
    ingredients:[
      {name:"白米",qty:"2杯",isMain:true,category:"staples",pxProduct:"全聯台灣米 2kg",pxPrice:89,carrefourProduct:"家樂福台灣米 2kg",carrefourPrice:92},
      {name:"椰奶",qty:"200ml",isMain:true,category:"pantry",pxProduct:"泰國椰奶 400ml",pxPrice:55,carrefourProduct:"家樂福椰奶 400ml",carrefourPrice:58},
      {name:"雞蛋",qty:"3顆",isMain:false,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"白米加椰奶200ml、水200ml、鹽少許、班蘭葉1片，電鍋按一般煮飯模式。",duration:900,voiceText:"白米加椰奶水鹽和班蘭葉，電鍋正常煮飯。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"雞蛋煮成半熟蛋（沸水7分鐘），花生乾鍋炒香，小魚乾炸至酥脆，準備參巴辣醬。",duration:420,voiceText:"煮半熟蛋，花生炒香，小魚乾炸酥，參巴辣醬備好。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"椰漿飯盛入盤，蛋切半，配花生、小魚乾、小黃瓜片，淋或配參巴辣醬，完成。",duration:120,voiceText:"椰漿飯盛盤配半熟蛋花生小魚乾，淋參巴辣醬完成！"}
    ]
  },
  {
    id:"rec-char-kway-teow", title:"星洲炒粿條", cuisine:"星洲風情",
    prepTime:8, cookTime:10, totalTime:18, difficulty:"18分鑊氣", servings:2, calories:520, imageFallback:"🍜",
    tags:["鑊氣大火","蛋香醬香","新加坡風味"],
    description:"粿條大火快炒，加入蝦仁、臘腸、豆芽、韭黃和雞蛋，以黑醬油和魚露調味，強烈的鑊氣是這道新加坡名菜的靈魂。",
    ingredients:[
      {name:"河粉",qty:"250g",isMain:true,category:"staples",pxProduct:"乾燥河粉 200g",pxPrice:35,carrefourProduct:"泰式河粉 200g",carrefourPrice:38},
      {name:"蝦仁",qty:"150g",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"雞蛋",qty:"2顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"豆芽菜",qty:"100g",isMain:false,category:"veggies",pxProduct:"本產豆芽菜 200g",pxPrice:15,carrefourProduct:"有機豆芽菜 150g",carrefourPrice:18}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"泡發線",instruction:"河粉泡溫水15分鐘，瀝乾。",duration:900,voiceText:"河粉泡溫水十五分鐘瀝乾備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蝦仁加鹽備用。臘腸切片。韭黃切段，豆芽洗淨。",duration:180,voiceText:"蝦仁加鹽，臘腸切片，韭黃切段，豆芽洗淨。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋多下油，炒蝦仁至變色起鍋，炒臘腸，推鍋炒蛋半熟，下粿條大火翻炒，加黑醬油2匙、魚露1匙、蠔油1匙，放豆芽韭黃，放回蝦仁，完成。",duration:360,voiceText:"依序炒蝦仁臘腸炒蛋，下粿條大火炒，加黑醬油魚露，放豆芽韭黃和蝦仁完成！"}
    ]
  },
  {
    id:"rec-lemongrass-chicken-se", title:"香茅烤雞腿", cuisine:"東南亞香料",
    prepTime:5, cookTime:25, totalTime:30, difficulty:"30分烤箱", servings:3, calories:490, imageFallback:"🍋",
    tags:["香茅清新","烤箱輕鬆","東南亞香料"],
    description:"雞腿排以香茅、南薑、魚露、糖醃製，送入烤箱烤至外皮酥香，搭配甜辣醬，清新的香茅氣息讓人想起南洋假期。",
    ingredients:[
      {name:"去骨雞腿",qty:"3支",isMain:true,category:"proteins",pxProduct:"台灣去骨雞腿排 2入",pxPrice:128,carrefourProduct:"家樂福去骨雞腿 400g",carrefourPrice:138},
      {name:"蒜頭",qty:"4瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"烤箱預熱200°C。",duration:600,voiceText:"烤箱預熱兩百度。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"調醃醬：香茅末2匙、魚露3匙、砂糖2匙、蒜末、南薑末、橄欖油，雞腿塗抹醃製至少10分鐘。",duration:600,voiceText:"香茅末、魚露、砂糖、蒜末、南薑調成醃醬，雞腿塗抹醃製。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"雞腿皮面朝上烤200°C 25分鐘，最後3分鐘開上火，配甜辣醬，完成。",duration:1500,voiceText:"烤二十五分鐘最後三分鐘開上火，配甜辣醬完成！"}
    ]
  },
  {
    id:"rec-sambal-tofu", title:"參巴豆腐", cuisine:"峇里島素食",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分東南亞辣", servings:3, calories:280, imageFallback:"🌶️",
    tags:["素食可食","參巴辣醬","東南亞風味"],
    description:"板豆腐煎至酥脆，裹上用辣椒、蝦醬調製的參巴醬翻炒，辣鹹香甜，是印尼和馬來西亞最受歡迎的豆腐料理。",
    ingredients:[
      {name:"板豆腐",qty:"1塊(300g)",isMain:true,category:"proteins",pxProduct:"台灣板豆腐 300g",pxPrice:22,carrefourProduct:"有機板豆腐 300g",carrefourPrice:28},
      {name:"蒜頭",qty:"4瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"豆腐切厚片擦乾。調參巴醬：辣椒末2匙、蒜末1匙、蝦醬少許（或魚露）、糖1匙、醬油1匙。",duration:180,voiceText:"豆腐切厚片擦乾，辣椒末蒜末蝦醬糖醬油調成參巴醬。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋下油煎豆腐兩面金黃，加入參巴醬翻炒均勻，加少許水拌開，撒蔥花完成。",duration:420,voiceText:"豆腐煎金黃加參巴醬翻炒，加水拌開撒蔥花完成！"}
    ]
  },
  {
    id:"rec-rendang", title:"印尼仁當牛肉", cuisine:"印尼香料",
    prepTime:8, cookTime:30, totalTime:38, difficulty:"38分慢燉香料", servings:4, calories:620, imageFallback:"🥩",
    tags:["椰奶香料慢燉","乾式咖哩","世界最美食"],
    description:"牛肉以椰奶和豐富香料（香茅、南薑、薑黃、辣椒）慢燉至椰奶收乾，每塊牛肉都裹滿濃郁香料，被稱為世界最美食之一。",
    ingredients:[
      {name:"牛肉片",qty:"500g",isMain:true,category:"proteins",pxProduct:"美國牛五花肉片 400g",pxPrice:198,carrefourProduct:"家樂福嚴選牛五花片 400g",carrefourPrice:220},
      {name:"椰奶",qty:"400ml",isMain:true,category:"pantry",pxProduct:"泰國椰奶 400ml",pxPrice:55,carrefourProduct:"家樂福椰奶 400ml",carrefourPrice:58}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"調香料醬：辣椒、蒜、薑黃、南薑、香茅、洋蔥放食物調理機打成香料泥。",duration:300,voiceText:"辣椒蒜薑黃南薑香茅洋蔥打成香料泥備用。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"鍋下油炒香料泥5分鐘出香，加牛肉翻炒，倒椰奶、水200ml，加鹽和棕櫚糖，中火燉25分鐘，轉大火收汁至乾香，完成。",duration:1800,voiceText:"炒香料泥加牛肉椰奶水燉二十五分鐘，轉大火收乾至香料裹住牛肉完成！"}
    ]
  },

  // ── 越式 新增 ──
  {
    id:"rec-banh-mi", title:"越式法棍三明治", cuisine:"越式快食",
    prepTime:8, cookTime:5, totalTime:13, difficulty:"13分街頭", servings:2, calories:440, imageFallback:"🥖",
    tags:["法越融合","配料豐盛","清爽酸辣"],
    description:"法國麵包塗抹奶油和越式醬料，夾入豬肉片、醃蘿蔔胡蘿蔔、香菜、辣椒，是河內街頭早餐的靈魂，美食界最完美的三明治之一。",
    ingredients:[
      {name:"法國棍子",qty:"1條",isMain:true,category:"staples",pxProduct:"法國長棍麵包 1條",pxPrice:55,carrefourProduct:"家樂福法國棍 1條",carrefourPrice:49},
      {name:"豬肉片",qty:"150g",isMain:true,category:"proteins",pxProduct:"台灣豬梅花肉片 200g",pxPrice:55,carrefourProduct:"家樂福豬梅花薄片 200g",carrefourPrice:60}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"醃漬線",instruction:"白蘿蔔和胡蘿蔔切細絲，加白醋、糖、鹽醃10分鐘備用（越式快速醃漬）。",duration:600,voiceText:"白蘿蔔胡蘿蔔切絲加白醋糖鹽醃十分鐘。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"豬肉片加魚露、砂糖、蒜末醃5分鐘，平底鍋煎至兩面上色熟透。",duration:300,voiceText:"豬肉加魚露砂糖蒜末醃五分鐘，煎至兩面上色。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"法棍縱切，塗奶油和美乃滋，夾豬肉、醃蘿蔔絲、香菜、辣椒片，完成。",duration:120,voiceText:"法棍塗奶油美乃滋，夾豬肉醃蘿蔔絲香菜辣椒，越式三明治完成！"}
    ]
  },
  {
    id:"rec-spring-roll-vn", title:"越式鮮蝦生春捲", cuisine:"越式清爽",
    prepTime:15, cookTime:5, totalTime:20, difficulty:"20分清涼", servings:2, calories:280, imageFallback:"🌯",
    tags:["免開火","清爽低卡","米皮包裹"],
    description:"越南米皮泡軟後包入鮮蝦、粉絲、生菜、薄荷葉，蘸花生醬或海鮮醬，清涼透明，是越式料理最清爽的代表。",
    ingredients:[
      {name:"蝦仁",qty:"12尾",isMain:true,category:"proteins",pxProduct:"台灣白蝦仁 200g",pxPrice:98,carrefourProduct:"家樂福鮮蝦仁 200g",carrefourPrice:110},
      {name:"米線",qty:"100g",isMain:true,category:"staples",pxProduct:"越南米線 200g",pxPrice:38,carrefourProduct:"越式米線 200g",carrefourPrice:40}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"泡發線",instruction:"米線泡溫水10分鐘煮熟，沖冷水瀝乾。",duration:600,voiceText:"米線泡溫水煮熟，沖冷水瀝乾備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"蝦仁水煮熟，橫向對半切。備生菜、薄荷葉、胡蘿蔔絲。調花生醬：花生醬2匙、魚露1匙、糖1匙、水調稀。",duration:300,voiceText:"蝦仁煮熟對切，備好蔬菜，調好花生沾醬。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"米皮快速泡溫水5秒，鋪平，放蝦仁（切面朝上）、米線、生菜、薄荷，由下往上捲緊，配沾醬，完成。",duration:480,voiceText:"米皮泡五秒，鋪蝦仁米線蔬菜薄荷，捲起來配沾醬完成！"}
    ]
  },
  {
    id:"rec-lemongrass-beef-vn", title:"越式香茅炒牛肉", cuisine:"越式快炒",
    prepTime:5, cookTime:8, totalTime:13, difficulty:"13分香辣", servings:3, calories:390, imageFallback:"🥩",
    tags:["香茅辛香","牛肉嫩炒","越式家常"],
    description:"牛肉片以香茅、魚露、辣椒醃製，大火快炒至嫩熟，香茅和辣椒的香氣撲鼻，是越式家庭最常見的下飯肉菜。",
    ingredients:[
      {name:"牛肉片",qty:"300g",isMain:true,category:"proteins",pxProduct:"美國牛五花肉片 200g/2包",pxPrice:198,carrefourProduct:"家樂福牛五花片 300g",carrefourPrice:220},
      {name:"洋蔥",qty:"1顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"牛肉加魚露2匙、香茅末2匙、蒜末、辣椒末、砂糖1匙醃5分鐘。洋蔥切絲。",duration:300,voiceText:"牛肉加魚露香茅末蒜末辣椒砂糖醃五分鐘，洋蔥切絲。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"大火熱鍋下油，先炒洋蔥至半透明，下牛肉大火快炒至變色，撒香菜、薄荷葉，完成。",duration:300,voiceText:"大火炒洋蔥，下牛肉快炒至變色，撒香菜薄荷完成！"}
    ]
  },
  {
    id:"rec-bun-bo-hue", title:"越式辣牛肉米線", cuisine:"越式清爽",
    prepTime:5, cookTime:15, totalTime:20, difficulty:"20分辣湯", servings:3, calories:420, imageFallback:"🍜",
    tags:["順化風味","辣湯底","米線爽滑"],
    description:"以蝦醬和辣椒熬出辛辣湯底，加入牛肉片和豬肉球，搭配米線，附上新鮮生菜和香茅，是越南順化最著名的辣味米線湯。",
    ingredients:[
      {name:"牛肉片",qty:"200g",isMain:true,category:"proteins",pxProduct:"美國牛五花肉片 200g",pxPrice:99,carrefourProduct:"家樂福牛五花片 200g",carrefourPrice:110},
      {name:"米線",qty:"200g",isMain:true,category:"staples",pxProduct:"越南米線 200g",pxPrice:38,carrefourProduct:"越式米線 200g",carrefourPrice:40}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"煮麵線",instruction:"米線依包裝煮熟，沖冷水瀝乾。",duration:600,voiceText:"米線煮熟沖冷水瀝乾備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"下油炒蝦醬1匙和辣椒粉出香，加水600ml、高湯塊，魚露2匙，香茅1根煮沸，熬5分鐘出香。",duration:480,voiceText:"炒蝦醬辣椒粉出香，加水高湯魚露香茅煮沸熬五分鐘。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"牛肉片在湯底中涮熟，米線盛碗，鋪牛肉，淋辣湯，附豆芽、辣椒、萊姆，完成。",duration:180,voiceText:"牛肉在湯底涮熟，米線盛碗淋湯，附豆芽辣椒萊姆完成！"}
    ]
  },

  // ── 印度 新增 ──
  {
    id:"rec-dal", title:"印度紅扁豆湯", cuisine:"印度素食",
    prepTime:5, cookTime:20, totalTime:25, difficulty:"25分溫補", servings:4, calories:280, imageFallback:"🫘",
    tags:["蛋白質豐富","素食暖胃","印度家常"],
    description:"紅扁豆煮軟後以薑黃、孜然、芫荽籽熬成濃稠豆湯，最後淋上以奶油炒香的香料油（tempering），是印度家庭每日的蛋白質主食。",
    ingredients:[
      {name:"紅扁豆",qty:"200g",isMain:true,category:"staples",pxProduct:"紅扁豆 500g",pxPrice:89,carrefourProduct:"有機紅扁豆 500g",carrefourPrice:95},
      {name:"番茄",qty:"2顆",isMain:true,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58},
      {name:"洋蔥",qty:"1顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"煮豆線",instruction:"紅扁豆洗淨，加水500ml、薑黃粉1匙煮沸，轉小火燉15分鐘至軟糊。",duration:900,voiceText:"紅扁豆加水薑黃粉煮沸，轉小火燉十五分鐘至軟糊。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"鍋下油炒洋蔥至焦糖色，加番茄、蒜末、薑末、孜然粉、芫荽粉炒成香料醬，加入豆湯燉5分鐘，加鹽調味，完成。",duration:600,voiceText:"炒洋蔥至焦糖色，加番茄蒜薑香料粉炒成醬，加入豆湯燉五分鐘調味完成！"}
    ]
  },
  {
    id:"rec-palak-paneer", title:"菠菜起司咖哩", cuisine:"印度素食",
    prepTime:8, cookTime:15, totalTime:23, difficulty:"23分翠綠", servings:3, calories:380, imageFallback:"🌿",
    tags:["鐵質豐富","素食高蛋白","翠綠療癒"],
    description:"菠菜燙軟打成泥，配上自製印度起司塊（paneer），以薑黃、孜然、蒜末炒製，顏色翠綠，鮮香濃郁，是北印度最受歡迎的素食咖哩。",
    ingredients:[
      {name:"菠菜",qty:"300g",isMain:true,category:"veggies",pxProduct:"本產菠菜 200g",pxPrice:22,carrefourProduct:"有機菠菜 150g",carrefourPrice:28},
      {name:"嫩豆腐",qty:"1盒(替代paneer)",isMain:true,category:"proteins",pxProduct:"中華有機嫩豆腐 300g",pxPrice:18,carrefourProduct:"義美嫩豆腐 300g",carrefourPrice:17},
      {name:"洋蔥",qty:"1顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"菠菜燙30秒，沖冷水，加薑末蒜末少許打成菠菜泥備用。",duration:300,voiceText:"菠菜燙三十秒沖冷水，加薑蒜打成菠菜泥備用。"},
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"豆腐切丁煎至兩面金黃備用。鍋下油炒洋蔥至焦糖，加番茄丁、薑黃、孜然、芫荽粉炒出香料味。",duration:360,voiceText:"豆腐煎金黃備用，炒洋蔥至焦糖，加番茄香料粉炒香。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"倒入菠菜泥，加水100ml燉5分鐘，放入豆腐塊，加鹽和奶油少許，完成。",duration:360,voiceText:"倒入菠菜泥加水燉五分鐘，放豆腐加鹽和奶油完成！"}
    ]
  },
  {
    id:"rec-chicken-tikka", title:"坦都里烤雞腿", cuisine:"印度烤箱",
    prepTime:10, cookTime:25, totalTime:35, difficulty:"35分香料烤", servings:3, calories:480, imageFallback:"🍗",
    tags:["坦都里香料","烤箱免顧","印度最愛"],
    description:"雞腿以優格和印度香料（薑黃、孜然、芫荽、辣椒粉、葛拉姆馬薩拉）醃製，烤箱高溫烤出焦香外皮，配薄荷優格醬，是印度烤雞代表作。",
    ingredients:[
      {name:"去骨雞腿",qty:"3支",isMain:true,category:"proteins",pxProduct:"台灣去骨雞腿排 2入",pxPrice:128,carrefourProduct:"家樂福去骨雞腿 400g",carrefourPrice:138},
      {name:"蒜頭",qty:"4瓣",isMain:false,category:"pantry",pxProduct:"本產蒜瓣袋裝",pxPrice:45,carrefourProduct:"特選蒜頭 300g",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:2,threadLabel:"電器等待線",instruction:"烤箱預熱220°C。",duration:600,voiceText:"烤箱預熱兩百二十度。"},
      {order:1,threadId:1,threadLabel:"備料線",instruction:"優格4匙加薑黃粉半匙、孜然粉1匙、辣椒粉1匙、芫荽粉1匙、蒜末、薑末、鹽、檸檬汁，雞腿劃刀充分醃製10分鐘。",duration:600,voiceText:"優格加薑黃孜然辣椒粉芫荽粉蒜末薑末鹽檸檬汁調成醃醬，雞腿劃刀醃十分鐘。"},
      {order:2,threadId:2,threadLabel:"電器等待線",instruction:"雞腿皮面朝上烤220°C 25分鐘，最後3分鐘開上火烤至焦香，配薄荷優格醬完成。",duration:1500,voiceText:"烤二十五分鐘開上火三分鐘到焦香，配薄荷優格醬完成！"}
    ]
  },

  // ── 墨式 新增 ──
  {
    id:"rec-tacos", title:"墨西哥肉末塔可", cuisine:"墨式快食",
    prepTime:5, cookTime:10, totalTime:15, difficulty:"15分辣爽", servings:3, calories:480, imageFallback:"🌮",
    tags:["手持小吃","辣肉末","墨西哥夜市"],
    description:"牛肉末以孜然、辣椒粉、蒜末炒香，夾入玉米薄餅，配上酪梨醬、莎莎醬、生菜、起司，一口下去多層次風味，是墨西哥最具代表性的街頭食物。",
    ingredients:[
      {name:"牛絞肉",qty:"300g",isMain:true,category:"proteins",pxProduct:"美國牛絞肉 300g",pxPrice:168,carrefourProduct:"家樂福牛絞肉 300g",carrefourPrice:180},
      {name:"番茄",qty:"2顆",isMain:false,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"牛絞肉加孜然粉2匙、辣椒粉1匙、蒜粉、鹽，鍋下油大火炒熟，加水3匙讓肉汁豐富。",duration:360,voiceText:"牛絞肉加孜然辣椒粉蒜粉鹽大火炒熟，加水讓肉汁豐富。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"調莎莎醬：番茄丁、洋蔥末、香菜、萊姆汁、鹽混合。玉米薄餅乾鍋加熱。夾入肉末、莎莎醬、生菜、酪梨片、起司，完成。",duration:300,voiceText:"番茄丁洋蔥香菜萊姆汁調莎莎醬，薄餅加熱夾肉末莎莎醬生菜酪梨起司完成！"}
    ]
  },
  {
    id:"rec-quesadilla", title:"墨式起司薄餅", cuisine:"墨式快食",
    prepTime:3, cookTime:8, totalTime:11, difficulty:"11分速成", servings:2, calories:420, imageFallback:"🧀",
    tags:["起司拉絲","5分鐘","早餐下午茶"],
    description:"玉米薄餅夾入大量起司和雞肉或蔬菜，乾鍋煎至兩面金黃起司融化，切片享用，是墨西哥最快速的日常零食或輕食。",
    ingredients:[
      {name:"玉米薄餅",qty:"4片",isMain:true,category:"staples",pxProduct:"墨西哥玉米薄餅 8入",pxPrice:65,carrefourProduct:"家樂福墨西哥餅 8入",carrefourPrice:62},
      {name:"雞胸肉",qty:"150g",isMain:true,category:"proteins",pxProduct:"台灣雞胸肉 300g",pxPrice:79,carrefourProduct:"家樂福雞胸肉 300g",carrefourPrice:85}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"雞胸肉加鹽、孜然粉煎熟，切條。備起司絲、青椒絲。",duration:360,voiceText:"雞胸肉加鹽孜然粉煎熟切條，備起司絲青椒絲。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"薄餅放平底鍋，半面鋪起司絲、雞肉、青椒，對折壓緊，中火兩面各煎2分鐘至金黃起司融化，切三角片，配酸奶和莎莎醬，完成。",duration:300,voiceText:"薄餅鋪料對折，兩面煎至金黃起司融化，切三角配酸奶完成！"}
    ]
  },

  // ── 法式 新增 ──
  {
    id:"rec-ratatouille", title:"法式普羅旺斯燉菜", cuisine:"法式家常",
    prepTime:10, cookTime:25, totalTime:35, difficulty:"35分燉菜", servings:4, calories:280, imageFallback:"🍅",
    tags:["法國南部","蔬菜豐盛","素食健康"],
    description:"茄子、南瓜、番茄、洋蔥以橄欖油慢燉，加入迷迭香和百里香，滿滿的地中海蔬菜香氣，是法國普羅旺斯的靈魂家常菜。",
    ingredients:[
      {name:"茄子",qty:"1條",isMain:true,category:"veggies",pxProduct:"本產長茄子 400g",pxPrice:28,carrefourProduct:"有機茄子 400g",carrefourPrice:35},
      {name:"番茄",qty:"3顆",isMain:true,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58},
      {name:"洋蔥",qty:"1顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45},
      {name:"彩椒",qty:"1顆",isMain:false,category:"veggies",pxProduct:"彩椒 2入",pxPrice:49,carrefourProduct:"有機彩椒 2入",carrefourPrice:55}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"所有蔬菜切1.5cm丁。橄欖油中火炒洋蔥至透明，加蒜末炒香。",duration:300,voiceText:"蔬菜全切丁，橄欖油炒洋蔥至透明加蒜末炒香。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"加茄子、彩椒翻炒5分鐘，加番茄丁、迷迭香、百里香，倒水200ml，加鹽，中小火燉20分鐘至所有蔬菜軟爛，完成。",duration:1500,voiceText:"加茄子彩椒炒五分鐘，加番茄香草水，中小火燉二十分鐘，完成！"}
    ]
  },
  {
    id:"rec-crepe", title:"法式可麗餅", cuisine:"法式快食",
    prepTime:5, cookTime:12, totalTime:17, difficulty:"17分優雅", servings:3, calories:360, imageFallback:"🥞",
    tags:["法式早餐","甜鹹均可","巴黎街頭"],
    description:"薄如蟬翼的可麗餅皮，可甜可鹹，甜版填入奶油糖和檸檬汁，鹹版夾煙燻鮭魚和奶油起司，是巴黎街頭最浪漫的早午餐。",
    ingredients:[
      {name:"雞蛋",qty:"2顆",isMain:true,category:"proteins",pxProduct:"洗選鮮蛋 10入",pxPrice:65,carrefourProduct:"優質洗選蛋 10入",carrefourPrice:68},
      {name:"牛奶",qty:"200ml",isMain:true,category:"pantry",pxProduct:"統一鮮乳 946ml",pxPrice:75,carrefourProduct:"家樂福鮮乳 946ml",carrefourPrice:72}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"調麵糊：低筋麵粉100g加蛋2顆、牛奶200ml、融化奶油10g、鹽少許，攪拌至光滑無顆粒，靜置5分鐘。",duration:300,voiceText:"麵粉加蛋牛奶奶油鹽攪拌至光滑，靜置五分鐘。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"不沾鍋下少許奶油，倒入麵糊搖晃鋪平，薄薄一層，小火煎1分鐘翻面再煎30秒，填入甜餡（奶油糖檸檬）或鹹餡（鮭魚起司），完成。",duration:420,voiceText:"不沾鍋薄薄煎一分鐘翻面三十秒，填入喜歡的餡料完成！"}
    ]
  },

  // ── 法式 補充 ──
  {
    id:"rec-french-onion-soup", title:"法式洋蔥湯", cuisine:"法式家常",
    prepTime:5, cookTime:25, totalTime:30, difficulty:"30分焦糖洋蔥", servings:3, calories:320, imageFallback:"🧅",
    tags:["焦糖洋蔥","起司麵包","巴黎小酒館"],
    description:"洋蔥以奶油慢炒至焦糖色，加入牛骨高湯燉煮，倒入烤皿鋪上法國麵包和大量起司，烤至金黃起泡，是巴黎小酒館最溫暖的靈魂湯品。",
    ingredients:[
      {name:"洋蔥",qty:"3顆",isMain:true,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45},
      {name:"法國棍子",qty:"半條",isMain:false,category:"staples",pxProduct:"法國長棍麵包 1條",pxPrice:55,carrefourProduct:"家樂福法國棍 1條",carrefourPrice:49}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"爐火備料線",instruction:"洋蔥切薄絲，鍋下奶油20g，中小火慢炒20分鐘至焦糖色，偶爾攪拌。",duration:1200,voiceText:"洋蔥切薄絲，奶油中小火慢炒二十分鐘至焦糖色。"},
      {order:2,threadId:1,threadLabel:"爐火備料線",instruction:"倒入牛骨高湯500ml、白酒50ml、百里香，煮沸後燉5分鐘，加鹽胡椒。",duration:360,voiceText:"加高湯白酒百里香煮沸燉五分鐘調味。"},
      {order:3,threadId:2,threadLabel:"電器等待線",instruction:"湯倒入烤皿，鋪法棍片，撒大量格呂耶爾或莫札瑞拉起司，烤箱200°C烤5分鐘至金黃起泡，完成。",duration:300,voiceText:"湯倒烤皿鋪麵包撒大量起司，烤箱烤五分鐘至金黃起泡完成！"}
    ]
  },

  // ── 地中海 新增 ──
  {
    id:"rec-greek-salad", title:"希臘沙拉", cuisine:"地中海清食",
    prepTime:8, cookTime:0, totalTime:8, difficulty:"8分免開火", servings:3, calories:260, imageFallback:"🥗",
    tags:["免開火","菲達起司","地中海健康"],
    description:"番茄、小黃瓜、橄欖、紅洋蔥和大塊菲達起司，以橄欖油和奧勒岡香料調味，是希臘家庭每日必備的清爽沙拉，也是地中海飲食的精髓。",
    ingredients:[
      {name:"番茄",qty:"3顆",isMain:true,category:"veggies",pxProduct:"牛番茄 4入",pxPrice:49,carrefourProduct:"有機牛番茄 4入",carrefourPrice:58},
      {name:"小黃瓜",qty:"1條",isMain:true,category:"veggies",pxProduct:"本產小黃瓜 3條",pxPrice:29,carrefourProduct:"有機小黃瓜 3條",carrefourPrice:35},
      {name:"洋蔥",qty:"半顆",isMain:false,category:"veggies",pxProduct:"進口黃洋蔥/2顆",pxPrice:39,carrefourProduct:"有機黃洋蔥 600g",carrefourPrice:45}
    ],
    parallelSteps:[
      {order:1,threadId:1,threadLabel:"備料線",instruction:"番茄切大塊，小黃瓜切片，紅洋蔥切薄圈，橄欖備好。",duration:240,voiceText:"番茄切大塊，小黃瓜切片，紅洋蔥切薄圈，橄欖備好。"},
      {order:2,threadId:1,threadLabel:"備料線",instruction:"所有蔬菜放大碗，淋橄欖油3匙、紅酒醋1匙、鹽、黑胡椒、奧勒岡香料，放上大塊菲達起司，不要攪碎，完成。",duration:120,voiceText:"蔬菜放碗淋橄欖油紅酒醋鹽黑胡椒奧勒岡，放大塊菲達起司完成！"}
    ]
  },

]; // end RECIPES_DB

// ==================== 2. 食材分類庫（含新增 15+ 種） ====================
const INGREDIENTS_CATEGORIES = {
  veggies: [
    { id: "ing-cabbage",  name: "高麗菜",  icon: "🥬" },
    { id: "ing-tomato",   name: "番茄",    icon: "🍅" },
    { id: "ing-cherry-tomato", name: "小番茄", icon: "🍅" },
    { id: "ing-onion",    name: "洋蔥",    icon: "🧅" },
    { id: "ing-cucumber", name: "小黃瓜",  icon: "🥒" },
    { id: "ing-pepper",   name: "彩椒",    icon: "🫑" },
    { id: "ing-green-pepper", name: "青椒", icon: "🫑" },
    { id: "ing-mushroom", name: "金針菇",  icon: "🍄" },
    { id: "ing-basil",    name: "九層塔",  icon: "🌿" },
    { id: "ing-cabbage-white", name: "大白菜", icon: "🥬" },
    { id: "ing-pumpkin",  name: "南瓜",    icon: "🎃" },
    { id: "ing-sprout",   name: "豆芽菜",  icon: "🌱" }
  ],
  proteins: [
    { id: "ing-pork",      name: "豬肉片",   icon: "🥩" },
    { id: "ing-pork-minced", name: "豬肉碎",  icon: "🥩" },
    { id: "ing-beef",      name: "牛肉片",   icon: "🥩" },
    { id: "ing-chicken",   name: "雞腿",     icon: "🍗" },
    { id: "ing-chicken-breast", name: "雞胸肉", icon: "🍗" },
    { id: "ing-egg",       name: "雞蛋",     icon: "🥚" },
    { id: "ing-seafood",   name: "冷凍海鮮包", icon: "🦐" },
    { id: "ing-fish",      name: "鱸魚",     icon: "🐟" },
    { id: "ing-clam",      name: "蛤蜊",     icon: "🐚" },
    { id: "ing-tofu",      name: "嫩豆腐",   icon: "⬜" }
  ],
  staples: [
    { id: "ing-rice",     name: "白飯",     icon: "🍚" },
    { id: "ing-pasta",    name: "義大利麵", icon: "🍝" },
    { id: "ing-ricecake", name: "年糕片",   icon: "🍢" },
    { id: "ing-noodle",   name: "拉麵",     icon: "🍜" },
    { id: "ing-vermicelli", name: "米線",   icon: "🍜" }
  ],
  pantry: [
    { id: "ing-garlic",    name: "蒜頭",     icon: "🧄" },
    { id: "ing-scallion",  name: "青蔥",     icon: "🌱" },
    { id: "ing-ginger",    name: "薑",       icon: "🟡" },
    { id: "ing-kimchi",    name: "泡菜",     icon: "🌶️" },
    { id: "ing-lemon",     name: "檸檬",     icon: "🍋" },
    { id: "ing-sauce",     name: "打拋醬包", icon: "🥫" },
    { id: "ing-miso",      name: "味噌",     icon: "🟤" },
    { id: "ing-coconut",   name: "椰奶",     icon: "🥥" },
    { id: "ing-curry",     name: "咖喱醬",   icon: "🟡" },
    { id: "ing-gochujang", name: "韓式辣椒醬", icon: "🌶️" }
  ]
};

// ==================== 3. 語義食材配對群組（模糊配對核心）====================
// [BUG-2 修正] 升級食材配對算法，支援語義模糊匹配
// 例：使用者選「雞腿」可匹配食譜中使用「雞胸肉」、「雞肉」的食譜
const INGREDIENT_SEMANTIC_GROUPS = [
  { keywords: ["豬肉", "豬肉片", "豬肉碎", "豬絞肉", "豬里肌", "豬梅花", "五花肉"] },
  { keywords: ["牛肉", "牛肉片", "牛五花", "牛絞肉"] },
  { keywords: ["雞肉", "雞腿", "雞胸肉", "雞翅", "去骨雞腿", "仿土雞"] },
  { keywords: ["雞蛋", "蛋", "鴨蛋", "鹹蛋"] },
  { keywords: ["鱸魚", "鯛魚", "鮭魚", "魚排", "魚片", "金目鱸", "鯖魚"] },
  { keywords: ["蝦仁", "白蝦", "草蝦", "花枝", "魷魚", "蛤蜊", "海鮮", "冷凍海鮮包"] },
  { keywords: ["豆腐", "嫩豆腐", "板豆腐", "豆腐丁"] },
  { keywords: ["番茄", "小番茄", "牛番茄", "聖女番茄"] },
  { keywords: ["洋蔥", "紫洋蔥", "黃洋蔥"] },
  { keywords: ["青蔥", "蔥花", "蔥段", "蔥"] },
  { keywords: ["薑", "老薑", "嫩薑", "薑片", "薑絲"] },
  { keywords: ["大蒜", "蒜頭", "蒜末", "蒜片", "蒜"] },
  { keywords: ["青椒", "彩椒", "甜椒", "紅椒"] },
  { keywords: ["高麗菜", "包心菜", "圓白菜"] },
  { keywords: ["米", "白飯", "米飯", "蓬萊米"] }
];

/**
 * 模糊食材匹配函式
 * @param {string} selectedName 使用者選取的食材名稱
 * @param {string} recipeIngName 食譜材料名稱
 * @returns {boolean}
 */
function fuzzyIngredientMatch(selectedName, recipeIngName) {
  // Level 1: 直接字串包含
  if (recipeIngName.includes(selectedName) || selectedName.includes(recipeIngName)) {
    return true;
  }
  // Level 2: 語義群組匹配
  for (const group of INGREDIENT_SEMANTIC_GROUPS) {
    const selInGroup = group.keywords.some(k => selectedName.includes(k) || k.includes(selectedName));
    const recInGroup = group.keywords.some(k => recipeIngName.includes(k) || k.includes(recipeIngName));
    if (selInGroup && recInGroup) return true;
  }
  return false;
}

// ==================== 4. 全域 App 狀態 ====================
let appState = {
  currentView: "home",
  selectedCuisine: "全部",
  selectedIngredients: new Set(),
  weeklyPlannerRecipes: [],
  activeCookingRecipe: null,
  cookingTimerInterval: null,
  cookingTimeElapsed: 0,
  cookingTimeTotal: 0,
  isCookingTimerPaused: true,
  currentCookingStepIndex: 0,
  voiceAssistantEnabled: true,
  selectedSupermarket: "px",
  currentSupermarketContext: "weekly",
  activeSingleRecipeId: null,
  isOffline: !navigator.onLine,
  // 通勤補貨快線
  commuteMinutes: 35,
  commuteSelectedRecipe: null,
  commuteOwnedItems: new Set(),
  // 登入會員
  currentUser: null,
  userFavorites: new Set(),
  weeklyGroceryItems: []
};

// ==================== 5. 初始化 ====================
document.addEventListener("DOMContentLoaded", () => {
  initPantryChips();
  regenerateWeeklyPlanner();
  renderFeaturedRecipes();
  initSupabase();
  setTimeout(animateHero, 80);
  setTimeout(initParallax, 120);
  setTimeout(initHeroCarousel, 150);
  initHeaderScroll();

  window.addEventListener("hashchange", handleHashRoute);
  handleHashRoute();

  // 語音支援檢查
  if ('speechSynthesis' in window) {
    appState.voiceAssistantEnabled = true;
  } else {
    appState.voiceAssistantEnabled = false;
    const vSwitch = document.getElementById("voice-toggle-checkbox");
    if (vSwitch) vSwitch.disabled = true;
  }

  // 離線狀態監聽
  window.addEventListener("online",  () => { appState.isOffline = false; updateOfflineIndicator(); });
  window.addEventListener("offline", () => { appState.isOffline = true;  updateOfflineIndicator(); });
  updateOfflineIndicator();
});

function updateOfflineIndicator() {
  const indicator = document.getElementById("offline-indicator");
  if (indicator) {
    indicator.style.display = appState.isOffline ? "flex" : "none";
  }
}

// ==================== 6. SPA 路由管理 ====================
function handleHashRoute() {
  const hash = window.location.hash.replace("#", "") || "home";
  switchView(hash, false);
}

function switchView(viewName, updateHash = true) {
  if (viewName === "cooking" && !appState.activeCookingRecipe) {
    showToast("⚠️ 請先選擇食譜並點選「啟動並行烹飪模式」！");
    window.location.hash = "home";
    return;
  }

  const views = document.querySelectorAll(".app-view");
  views.forEach(v => v.classList.remove("active"));

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add("active");
    appState.currentView = viewName;
    if (typeof gsap !== "undefined") {
      gsap.fromTo(targetView,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "all" }
      );
    }
  }

  const desktopNavItems = document.querySelectorAll(".desktop-nav .nav-item");
  const mobileNavItems  = document.querySelectorAll(".mobile-nav .mobile-nav-item");
  desktopNavItems.forEach(item => item.classList.toggle("active", item.id === `nav-d-${viewName}`));
  mobileNavItems.forEach(item  => item.classList.toggle("active", item.id === `nav-m-${viewName}`));

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (updateHash) window.location.hash = viewName;

  if (viewName === "commute") initCommuteView();
  if (viewName === "home")    animateHero();
}

// ==================== 7. 首頁：精選食譜渲染（限 8 道）====================
const CUISINE_FILTER_MAP = {
  "台式":  c => c.includes("台式"),
  "日式":  c => c.includes("日式"),
  "韓式":  c => c.includes("韓式"),
  "義式":  c => c.includes("義式"),
  "美式":  c => c.includes("美式"),
  "泰式":  c => c.includes("泰式"),
  "中式":  c => c.includes("川式") || c.includes("中式"),
  "東南亞": c => c.includes("東南亞") || c.includes("馬來") || c.includes("印尼") || c.includes("星洲") || c.includes("峇里"),
  "越式":  c => c.includes("越式"),
  "印度":  c => c.includes("南亞") || c.includes("印度"),
  "墨式":  c => c.includes("墨式"),
  "法式":  c => c.includes("法式") || c.includes("地中海"),
};

function setCuisineFilter(label) {
  appState.selectedCuisine = label;
  document.querySelectorAll(".cuisine-tab").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.cuisine === label)
  );

  if (typeof Flip !== "undefined" && typeof gsap !== "undefined") {
    const container = document.getElementById("featured-recipes-container");
    const oldCards  = container ? gsap.utils.toArray(".recipe-card", container) : [];
    const state     = oldCards.length ? Flip.getState(oldCards) : null;

    renderFeaturedRecipes();

    if (state) {
      Flip.from(state, {
        duration: 0.45,
        ease: "power2.inOut",
        stagger: 0.03,
        absolute: true,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" }),
        onLeave: els => gsap.to(els,      { opacity: 0, scale: 0.85, duration: 0.25 })
      });
    }
  } else {
    renderFeaturedRecipes();
  }
}

function renderFeaturedRecipes() {
  const container = document.getElementById("featured-recipes-container");
  if (!container) return;

  const filterFn = appState.selectedCuisine === "全部"
    ? () => true
    : (CUISINE_FILTER_MAP[appState.selectedCuisine] || (() => false));

  const list = RECIPES_DB.filter(r => filterFn(r.cuisine));

  container.innerHTML = list.length === 0
    ? `<div class="empty-state"><div class="empty-icon">🍽️</div><h4>此分類暫無食譜</h4></div>`
    : list.map(recipe => `
    <div class="recipe-card" data-flip-id="${recipe.id}">
      <div class="recipe-img-holder">
        <img
          src="${getRecipeImageUrl(recipe)}"
          alt="${recipe.title}"
          loading="lazy"
          data-fallback="${getRecipeImageFallbackUrl(recipe)}"
          data-emoji="${recipe.imageFallback}"
          onload="this.classList.add('img-loaded')"
          onerror="
            if(this.dataset.fallback && this.src !== this.dataset.fallback){
              this.src = this.dataset.fallback;
            } else {
              this.style.display='none';
              this.nextElementSibling.style.display='flex';
            }"
        >
        <span class="recipe-img-fallback" style="display:none">${recipe.imageFallback}</span>
        <span class="recipe-time-tag">⏱ ${recipe.totalTime} 分鐘</span>
        <button class="fav-btn${appState.userFavorites.has(recipe.id) ? ' is-faved' : ''}"
                onclick="toggleFavorite('${recipe.id}', event)"
                title="${appState.userFavorites.has(recipe.id) ? '取消收藏' : '加入收藏'}">
          ${appState.userFavorites.has(recipe.id) ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="recipe-info">
        <div class="recipe-tags">
          ${recipe.tags.map(t => `<span class="badge badge-gold">${t}</span>`).join('')}
        </div>
        <h4>${recipe.title}</h4>
        <p>${recipe.description}</p>
        <div class="recipe-card-meta">
          <span class="badge badge-green">${recipe.cuisine}</span>
          <button class="btn-cook" onclick="initiateCooking('${recipe.id}', this)">極速烹飪 &rarr;</button>
        </div>
      </div>
    </div>
  `).join('');

  // 卡片依序飛入
  if (typeof gsap !== "undefined") {
    gsap.from(container.querySelectorAll(".recipe-card"), {
      duration: 0.5,
      y: 40,
      opacity: 0,
      stagger: 0.07,
      ease: "power2.out",
      clearProps: "all"
    });
  }
}

function triggerLazyFilter() {
  switchView("pantry");
  appState.selectedIngredients.clear();
  appState.selectedIngredients.add("ing-fish");
  appState.selectedIngredients.add("ing-pepper");
  const chips = document.querySelectorAll(".chip");
  chips.forEach(c => c.classList.toggle("selected", appState.selectedIngredients.has(c.dataset.id)));
  runPantryMatching();
  showToast("🔍 已為您自動篩選「免開火」紙包魚相關食材配對！");
}

// ==================== 8. 智慧冰箱配對（含模糊配對）====================
function initPantryChips() {
  for (const [category, list] of Object.entries(INGREDIENTS_CATEGORIES)) {
    const container = document.getElementById(`chips-${category}`);
    if (!container) continue;
    container.innerHTML = list.map(ing => `
      <button class="chip" data-id="${ing.id}" onclick="toggleIngredient('${ing.id}')">
        <span>${ing.icon}</span>
        <span>${ing.name}</span>
        <span class="chip-check">&check;</span>
      </button>
    `).join('');
  }
}

function toggleIngredient(ingId) {
  const chipBtn = document.querySelector(`.chip[data-id="${ingId}"]`);
  if (!chipBtn) return;
  if (appState.selectedIngredients.has(ingId)) {
    appState.selectedIngredients.delete(ingId);
    chipBtn.classList.remove("selected");
  } else {
    appState.selectedIngredients.add(ingId);
    chipBtn.classList.add("selected");
  }
  runPantryMatching();
}

function addManualIngredient() {
  const inputEl = document.getElementById("manual-ingredient-input");
  const value = inputEl.value.trim();
  if (!value) return;

  const customId = `ing-custom-${Date.now()}`;
  const section  = document.getElementById("custom-ingredient-section");
  const container = document.getElementById("chips-custom");

  if (section)  section.style.display = "";
  container.insertAdjacentHTML("beforeend", `
    <span class="chip-custom-wrap">
      <button class="chip selected" data-id="${customId}" onclick="toggleIngredient('${customId}')">
        <span>✏️</span>
        <span>${value}</span>
        <span class="chip-check">&check;</span>
      </button>
      <button class="chip-remove-btn" onclick="removeCustomIngredient('${customId}')" title="刪除">✕</button>
    </span>
  `);
  appState.selectedIngredients.add(customId);
  inputEl.value = "";
  runPantryMatching();
  showToast(`✏️ 已新增自選食材：${value}`);
}

function removeCustomIngredient(customId) {
  const wrap = document.querySelector(`.chip-custom-wrap:has([data-id="${customId}"])`);
  if (wrap) wrap.remove();
  appState.selectedIngredients.delete(customId);
  const section = document.getElementById("custom-ingredient-section");
  const container = document.getElementById("chips-custom");
  if (section && container && container.children.length === 0) section.style.display = "none";
  runPantryMatching();
}

// 允許 Enter 鍵新增食材
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("manual-ingredient-input");
  if (input) {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") addManualIngredient();
    });
  }
});

function clearSelectedIngredients() {
  appState.selectedIngredients.clear();
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
  runPantryMatching();
  showToast("🧹 已清除所有選取食材");
}

function runPantryMatching() {
  const resultsContainer = document.getElementById("pantry-results-container");
  const matchCountBadge  = document.getElementById("match-count");
  if (!resultsContainer) return;

  if (appState.selectedIngredients.size === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🥦</div>
        <h4>尚未選取食材</h4>
        <p>請在左側點選 1-3 種冰箱剩餘食材，系統將即時為您推薦最適合的食譜。</p>
      </div>`;
    matchCountBadge.innerText = "0 首選";
    return;
  }

  // 取得所選食材中文名稱
  const selectedNames = Array.from(appState.selectedIngredients).map(id => {
    for (const list of Object.values(INGREDIENTS_CATEGORIES)) {
      const match = list.find(item => item.id === id);
      if (match) return match.name;
    }
    const customChip = document.querySelector(`.chip[data-id="${id}"] span:nth-child(2)`);
    return customChip ? customChip.innerText : "";
  }).filter(name => name !== "");

  // 計算每道食譜的模糊匹配度（[BUG-2 修正] 使用語義配對）
  let matchedRecipes = RECIPES_DB.map(recipe => {
    const recipeIngNames = recipe.ingredients.map(ing => ing.name);
    const intersection = selectedNames.filter(selName =>
      recipeIngNames.some(recName => fuzzyIngredientMatch(selName, recName))
    );
    const rate = selectedNames.length > 0
      ? Math.round((intersection.length / selectedNames.length) * 100)
      : 0;
    return { recipe, intersectNames: intersection, rate };
  });

  matchedRecipes = matchedRecipes
    .filter(mr => mr.rate > 0)
    .sort((a, b) => b.rate - a.rate || a.recipe.totalTime - b.recipe.totalTime);

  matchCountBadge.innerText = `${matchedRecipes.length} 首選`;

  if (matchedRecipes.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h4>找不到符合的食譜</h4>
        <p>試著減少勾選食材，或更換其他主食材試試看！</p>
      </div>`;
    return;
  }

  resultsContainer.innerHTML = matchedRecipes.map(mr => {
    const rec = mr.recipe;
    const matchedText = mr.intersectNames.map(name => `<span class="highlight">${name}</span>`).join('、');
    return `
      <div class="match-item" onclick="initiateCooking('${rec.id}', this)">
        <div class="match-img"><span>${rec.imageFallback}</span></div>
        <div class="match-content">
          <div class="match-title-wrap">
            <span class="match-title">${rec.title}</span>
            <span class="match-percent">${mr.rate}% 食材吻合</span>
          </div>
          <p class="match-desc">${rec.description}</p>
          <div class="match-footer">
            <div class="match-ingredients-match">冰箱已含：${matchedText}</div>
            <button class="btn-cook" onclick="event.stopPropagation(); initiateCooking('${rec.id}', this)">出餐 &rarr;</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ==================== 9. 一鍵週菜單（Fisher-Yates 修正）====================

/**
 * [BUG-1 修正] Fisher-Yates 無偏隨機取樣
 * 從陣列中取 count 個元素，每個元素被選中的概率完全均等
 */
function sampleRecipes(array, count) {
  const arr = [...array];
  const n = Math.min(count, arr.length);
  for (let i = 0; i < n; i++) {
    // 從 [i, arr.length-1] 隨機選一個位置
    const j = Math.floor(Math.random() * (arr.length - i)) + i;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

function regenerateWeeklyPlanner() {
  appState.weeklyPlannerRecipes = sampleRecipes(RECIPES_DB, 5);
  renderWeeklyCalendar();
  compileWeeklyGroceryList();
}

function renderWeeklyCalendar() {
  const container = document.getElementById("calendar-list-container");
  if (!container) return;

  const daysOfWeek = [
    { key: "Mon", cn: "週一", desc: "暖心啟航" },
    { key: "Tue", cn: "週二", desc: "省時首選" },
    { key: "Wed", cn: "週三", desc: "小童最愛" },
    { key: "Thu", cn: "週四", desc: "香辣舒壓" },
    { key: "Fri", cn: "週五", desc: "無煙週末" }
  ];

  container.innerHTML = daysOfWeek.map((day, idx) => {
    const rec = appState.weeklyPlannerRecipes[idx] || RECIPES_DB[0];
    return `
      <div class="calendar-day-card">
        <div class="day-badge">
          <span>${day.cn}</span>
          <span class="en-day">${day.key}</span>
        </div>
        <div class="day-recipe-content">
          <div class="day-recipe-info">
            <h4>${rec.title}</h4>
            <p>
              <span>⏱️ ${rec.totalTime} 分鐘</span>
              <span>🔥 ${rec.calories} kcal</span>
              <span class="badge badge-gold">${rec.cuisine}</span>
            </p>
          </div>
          <div class="day-recipe-action">
            <button class="btn-icon" title="更換食譜" onclick="openRecipePicker(${idx})">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon" title="極速烹飪此道" onclick="initiateCooking('${rec.id}', this)">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button class="btn-icon" title="單道一鍵採買" onclick="openSupermarketModal('single', '${rec.id}')">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ==================== 週菜單食譜選擇器 ====================
let _pickerDayIdx = null;

function openRecipePicker(dayIdx) {
  _pickerDayIdx = dayIdx;
  const dayNames = ["週一", "週二", "週三", "週四", "週五"];
  const label = document.getElementById("picker-day-label");
  const searchInput = document.getElementById("picker-search");
  const modal = document.getElementById("recipe-picker-modal");
  if (!modal) return;
  if (label) label.textContent = `為 ${dayNames[dayIdx]} 選擇食譜`;
  if (searchInput) searchInput.value = "";
  filterPickerRecipes("");
  modal.classList.add("active");
}

function closeRecipePicker() {
  const modal = document.getElementById("recipe-picker-modal");
  if (modal) modal.classList.remove("active");
  _pickerDayIdx = null;
}

function handlePickerOverlayClick(e) {
  if (e.target.id === "recipe-picker-modal") closeRecipePicker();
}

function filterPickerRecipes(query) {
  const list = document.getElementById("picker-recipe-list");
  if (!list) return;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? RECIPES_DB.filter(r => r.title.includes(query) || r.cuisine.toLowerCase().includes(q) || r.tags.some(t => t.includes(query)))
    : RECIPES_DB;

  list.innerHTML = filtered.map(r => `
    <div class="picker-item" onclick="selectRecipeForDay('${r.id}')">
      <div class="picker-item-emoji">${r.imageFallback}</div>
      <div class="picker-item-info">
        <strong>${r.title}</strong>
        <span>⏱ ${r.totalTime} 分鐘 · ${r.cuisine}</span>
      </div>
      <div class="picker-item-tags">${r.tags.slice(0,2).map(t=>`<span class="badge badge-gold">${t}</span>`).join('')}</div>
    </div>`).join('');
}

function selectRecipeForDay(recipeId) {
  if (_pickerDayIdx === null) return;
  const recipe = RECIPES_DB.find(r => r.id === recipeId);
  if (!recipe) return;
  appState.weeklyPlannerRecipes[_pickerDayIdx] = recipe;
  renderWeeklyCalendar();
  compileWeeklyGroceryList();
  closeRecipePicker();
  const dayNames = ["週一", "週二", "週三", "週四", "週五"];
  showToast(`✅ ${dayNames[_pickerDayIdx]} 已更換為「${recipe.title}」`);
}

function compileWeeklyGroceryList() {
  const container   = document.getElementById("grocery-list-container");
  const countBadge  = document.getElementById("grocery-item-count");
  const totalPriceEl = document.getElementById("cart-total-price");
  if (!container) return;

  let combined = {};
  appState.weeklyPlannerRecipes.forEach(rec => {
    rec.ingredients.forEach(ing => {
      if (combined[ing.name]) {
        combined[ing.name].recipes.push(rec.title);
      } else {
        combined[ing.name] = {
          name: ing.name, category: ing.category, qty: ing.qty,
          recipes: [rec.title], pxPrice: ing.pxPrice, carrefourPrice: ing.carrefourPrice
        };
      }
    });
  });

  const list = Object.values(combined);
  appState.weeklyGroceryItems = list;
  countBadge.innerText = `${list.length} 項食材`;

  const total = list.reduce((sum, item) => sum + (appState.selectedSupermarket === "px" ? item.pxPrice : item.carrefourPrice), 0);
  totalPriceEl.innerText = `NT$ ${total}`;

  container.innerHTML = list.map((item, idx) => {
    const shortcuts = {
      "洋蔥": "💡 有機切好蔬菜包",
      "高麗菜": "💡 免切免洗蔬菜包",
      "雞蛋": "💡 高品質洗選蛋",
      "冷凍海鮮包": "💡 急凍免去腥配",
      "大白菜": "💡 超市已清洗分切",
      "豆芽菜": "💡 即開即用新鮮包"
    };
    const shortcutTag = shortcuts[item.name]
      ? `<span class="grocery-tag-shortcut">${shortcuts[item.name]}</span>` : "";

    return `
      <div class="grocery-item">
        <div class="grocery-left">
          <label class="checkbox-container" id="g-label-${idx}">
            <input type="checkbox" id="g-check-${idx}" onchange="toggleGroceryCheck(${idx})">
            <span class="checkmark"></span>
            <span class="item-text">${item.name}</span>
          </label>
          ${shortcutTag}
        </div>
        <div class="grocery-meta">
          <span class="grocery-qty">${item.qty}</span>
        </div>
      </div>`;
  }).join('');
}

function toggleGroceryCheck(idx) {
  const checkbox = document.getElementById(`g-check-${idx}`);
  const label    = document.getElementById(`g-label-${idx}`);
  if (checkbox && label) label.classList.toggle("checked-text", checkbox.checked);

  // 重新計算未勾選項目的總價
  const totalPriceEl = document.getElementById("cart-total-price");
  const items = appState.weeklyGroceryItems || [];
  if (!totalPriceEl || !items.length) return;

  let total = 0;
  items.forEach((item, i) => {
    const cb = document.getElementById(`g-check-${i}`);
    if (!cb || !cb.checked) {
      total += appState.selectedSupermarket === "px" ? item.pxPrice : item.carrefourPrice;
    }
  });
  totalPriceEl.innerText = `NT$ ${total}`;
}

// ==================== 10. 一鍵採買超市購物車（含 Demo 標示）====================
function openSupermarketModal(context, recipeId = null) {
  appState.currentSupermarketContext = context;
  appState.activeSingleRecipeId = recipeId;
  const modal = document.getElementById("supermarket-modal");
  if (modal) modal.classList.add("active");
  renderSupermarketItems();
}

function closeSupermarketModal() {
  const modal = document.getElementById("supermarket-modal");
  if (modal) modal.classList.remove("active");
}

function selectSupermarket(brand) {
  appState.selectedSupermarket = brand;
  document.getElementById("sm-option-px").classList.toggle("active", brand === "px");
  document.getElementById("sm-option-carrefour").classList.toggle("active", brand === "carrefour");
  renderSupermarketItems();
  // 重新計算週菜單總價
  if (document.getElementById("cart-total-price")) compileWeeklyGroceryList();
}

function renderSupermarketItems() {
  const container  = document.getElementById("modal-items-container");
  const countBadge = document.getElementById("modal-item-count");
  const subtotalEl = document.getElementById("modal-subtotal");
  const totalEl    = document.getElementById("modal-total");
  if (!container) return;

  let ingredients = [];
  if (appState.currentSupermarketContext === "weekly") {
    let unique = {};
    appState.weeklyPlannerRecipes.forEach(rec => rec.ingredients.forEach(ing => { unique[ing.name] = ing; }));
    ingredients = Object.values(unique);
  } else {
    const targetRec = RECIPES_DB.find(r => r.id === appState.activeSingleRecipeId);
    ingredients = targetRec ? targetRec.ingredients : [];
  }

  countBadge.innerText = ingredients.length;

  let subtotal = 0;
  container.innerHTML = ingredients.map(ing => {
    const isPx        = appState.selectedSupermarket === "px";
    const productName = isPx ? ing.pxProduct : ing.carrefourProduct;
    const price       = isPx ? ing.pxPrice    : ing.carrefourPrice;
    subtotal += price;

    const foodIcons = { veggies: "🥦", proteins: "🥩", staples: "🍚", pantry: "🧂" };
    const foodIcon = foodIcons[ing.category] || "📦";

    return `
      <div class="matched-item-row">
        <div class="matched-item-img">${foodIcon}</div>
        <div class="matched-item-details">
          <div class="matched-item-name">${productName}</div>
          <div class="matched-item-sub"><span>食譜配對：${ing.name} (${ing.qty})</span></div>
        </div>
        <div class="matched-item-price">NT$ ${price}</div>
      </div>`;
  }).join('');

  const shipping = subtotal > 500 ? 0 : 60;
  subtotalEl.innerText = `NT$ ${subtotal}`;
  totalEl.innerText    = `NT$ ${subtotal + shipping}`;
}

// [BUG-4 修正] 超市同步加入 Demo 標示
function executeSupermarketCheckout() {
  closeSupermarketModal();
  const brandName = appState.selectedSupermarket === "px" ? "全聯線上購 PXGo!" : "家樂福線上購物";
  showToast(`🎉 [Demo 模擬] 已模擬將清單同步至 ${brandName} 購物車。正式版需與超市 API 合作整合。`);
}

// ==================== 11. 並行烹飪助手引擎 ====================
function initiateCooking(recipeId, triggerEl) {
  const recipe = RECIPES_DB.find(r => r.id === recipeId);
  if (!recipe) return;

  const _launch = () => {
    clearInterval(appState.cookingTimerInterval);
    appState.activeCookingRecipe = recipe;
    appState.cookingTimeElapsed  = 0;
    const t1 = recipe.parallelSteps.filter(s => s.threadId === 1).reduce((s, p) => s + p.duration, 0);
    const t2 = recipe.parallelSteps.filter(s => s.threadId === 2).reduce((s, p) => s + p.duration, 0);
    appState.cookingTimeTotal = Math.max(t1, t2, 900);
    appState.isCookingTimerPaused    = true;
    appState.currentCookingStepIndex = 0;
    document.getElementById("nav-d-cooking").style.display = "block";
    document.getElementById("nav-m-cooking").style.display = "flex";
    switchView("cooking");
    renderCookingInterface();
  };

  if (triggerEl && typeof gsap !== "undefined") {
    const card = triggerEl.closest(".recipe-card") || triggerEl.closest(".match-item") || triggerEl.closest(".day-plan-item");
    const img  = card ? card.querySelector(".recipe-img-holder img.img-loaded, .recipe-img-holder img") : null;

    if (img) {
      const rect   = img.getBoundingClientRect();
      const clone  = img.cloneNode(true);
      Object.assign(clone.style, {
        position:     "fixed",
        top:          rect.top  + "px",
        left:         rect.left + "px",
        width:        rect.width  + "px",
        height:       rect.height + "px",
        objectFit:    "cover",
        borderRadius: "12px",
        zIndex:       "9998",
        pointerEvents:"none",
        margin:       "0",
        opacity:      "1"
      });
      document.body.appendChild(clone);

      gsap.to(clone, {
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        borderRadius: "0px",
        duration: 0.55,
        ease: "power3.inOut",
        onComplete: () => {
          _launch();
          gsap.to(clone, { opacity: 0, duration: 0.35, delay: 0.05, onComplete: () => clone.remove() });
        }
      });
      return;
    }
  }

  _launch();
}

function renderCookingInterface() {
  const container = document.getElementById("cooking-active-container");
  if (!container || !appState.activeCookingRecipe) return;

  const rec = appState.activeCookingRecipe;
  const thread1Steps = rec.parallelSteps.filter(s => s.threadId === 1);
  const thread2Steps = rec.parallelSteps.filter(s => s.threadId === 2);
  const totalSec = appState.cookingTimeTotal;

  const calculateBarPosition = (step, index, array) => {
    const widthPercent = (step.duration / totalSec) * 100;
    let leftPercent = 0;
    for (let i = 0; i < index; i++) leftPercent += (array[i].duration / totalSec) * 100;
    return { left: leftPercent, width: widthPercent };
  };

  const generateGanttBarsHtml = (steps) => steps.map((step, idx) => {
    const pos = calculateBarPosition(step, idx, steps);
    const activeClass = (idx === appState.currentCookingStepIndex && step.threadId === 1) ? "active" : "";
    return `
      <div class="gantt-bar bar-thread-${step.threadId} ${activeClass}"
           style="left: calc(120px + ${pos.left}%); width: ${pos.width}%;"
           title="${step.instruction}"
           onclick="jumpToStepByParallelOrder(${step.order})">
        ${step.instruction}
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="cooking-main-panel">
      <div class="cooking-header">
        <span class="badge badge-green">${rec.cuisine}</span>
        <h2>並行烹飪引導中：${rec.title}</h2>
        <p>
          <span>⏱️ 平均出餐：${rec.totalTime} 分鐘</span>
          <span>👨‍👩‍👧‍👦 份量：${rec.servings} 人份</span>
          <span>🔥 ${rec.calories} kcal/份</span>
        </p>
      </div>

      <div class="timeline-section">
        <div class="timeline-title-wrap">
          <h3>並行烹飪時程甘特圖</h3>
          <span class="timeline-duration" id="timeline-time-display">00:00 / 15:00</span>
        </div>
        <div class="gantt-chart-container">
          <div class="gantt-grid-bg">
            <div class="grid-line"><span class="grid-label">3分</span></div>
            <div class="grid-line"><span class="grid-label">6分</span></div>
            <div class="grid-line"><span class="grid-label">9分</span></div>
            <div class="grid-line"><span class="grid-label">12分</span></div>
            <div class="grid-line"><span class="grid-label">開飯!</span></div>
          </div>
          <div class="gantt-cursor" id="gantt-time-cursor" style="left: calc(120px + 0%);"></div>
          <div class="gantt-rows">
            <div class="gantt-row">
              <div class="row-label">🔥 爐火備料線</div>
              <div class="row-bar-area">${generateGanttBarsHtml(thread1Steps)}</div>
            </div>
            <div class="gantt-row">
              <div class="row-label">🔌 電器/等待線</div>
              <div class="row-bar-area">${generateGanttBarsHtml(thread2Steps)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="steps-navigation-panel">
        <div class="current-step-display">
          <span class="step-indicator" id="step-indicator-title">步驟 1 / ${rec.parallelSteps.length}</span>
          <h3 class="step-instruction" id="step-instruction-text">${rec.parallelSteps[0].instruction}</h3>
          <div class="step-time-remaining">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span id="step-time-remaining-text">本步驟預計耗時：${Math.floor(rec.parallelSteps[0].duration / 60)} 分鐘</span>
          </div>
        </div>
        <div class="step-nav-buttons">
          <button class="btn btn-secondary" onclick="prevCookingStep()">&larr; 上一步</button>
          <button class="btn btn-primary" onclick="nextCookingStep()">
            <span>下一步</span>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="cooking-sidebar-panel">
      <div class="timer-circle-wrap">
        <svg class="timer-svg" viewBox="0 0 180 180">
          <circle class="timer-bg-circle" cx="90" cy="90" r="80"/>
          <circle class="timer-progress-circle" id="timer-progress-ring" cx="90" cy="90" r="80"/>
        </svg>
        <div class="timer-text-display">
          <div class="time-numbers" id="timer-time-numbers">15:00</div>
          <div class="time-label">倒數開飯</div>
        </div>
      </div>
      <div class="timer-controls">
        <button class="btn-timer-main" id="btn-play-pause" onclick="toggleCookingTimer()" title="開始/暫停">
          <svg viewBox="0 0 24 24" id="play-pause-svg" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <button class="btn-timer-reset" onclick="resetCookingTimer()" title="重新計時">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        </button>
      </div>
      <div class="voice-assistant-panel">
        <div class="voice-status-wrap">
          <span class="voice-status-title" id="voice-status-title-wrap">
            <span class="voice-indicator-dot"></span>
            <span>擬真語音智慧導引</span>
          </span>
          <label class="switch-container">
            <input type="checkbox" id="voice-toggle-checkbox" checked onchange="toggleVoiceAssistant()">
            <span class="slider-switch"></span>
          </label>
        </div>
        <p>💡 點選下方按鈕，AI 烹飪助手將朗讀當前步驟，雙手沾食材也不用碰螢幕！</p>
        <button class="voice-simulate-speak-btn" onclick="speakCurrentStep()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          <span>語音導引現播一步</span>
        </button>
      </div>
      <div class="cooking-actions-footer">
        <button class="btn btn-secondary btn-full" onclick="finishCookingAndExit()">結束烹飪並離開</button>
      </div>
    </div>
  `;

  updateCookingStepUI();
}

// ==================== 12. 計時器控制 ====================
function toggleCookingTimer() {
  const playPauseSvg = document.getElementById("play-pause-svg");
  if (!playPauseSvg) return;

  if (appState.isCookingTimerPaused) {
    appState.isCookingTimerPaused = false;
    playPauseSvg.outerHTML = `<svg viewBox="0 0 24 24" id="play-pause-svg" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    appState.cookingTimerInterval = setInterval(() => {
      if (appState.cookingTimeElapsed < appState.cookingTimeTotal) {
        appState.cookingTimeElapsed++;
        updateCookingTimerUI();
      } else {
        finishCookingSuccessfully();
      }
    }, 1000);
    showToast("⏱️ 計時已啟動，開始您的極速出餐之旅！");
    speakCurrentStep();
  } else {
    appState.isCookingTimerPaused = true;
    playPauseSvg.outerHTML = `<svg viewBox="0 0 24 24" id="play-pause-svg" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    clearInterval(appState.cookingTimerInterval);
    showToast("⏱️ 計時器已暫停");
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

function resetCookingTimer() {
  appState.cookingTimeElapsed  = 0;
  appState.isCookingTimerPaused = true;
  clearInterval(appState.cookingTimerInterval);
  const btn = document.getElementById("btn-play-pause");
  if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" id="play-pause-svg" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  updateCookingTimerUI();
  showToast("⏱️ 計時器已重置");
}

function updateCookingTimerUI() {
  const timeNumbers    = document.getElementById("timer-time-numbers");
  const progressRing   = document.getElementById("timer-progress-ring");
  const timelineDisplay= document.getElementById("timeline-time-display");
  const cursor         = document.getElementById("gantt-time-cursor");
  if (!timeNumbers) return;

  const secondsRemaining = appState.cookingTimeTotal - appState.cookingTimeElapsed;
  const formatTime = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const newTime = formatTime(secondsRemaining);
  if (timeNumbers.innerText !== newTime) {
    if (typeof gsap !== "undefined") {
      gsap.timeline()
        .to(timeNumbers,  { y: 6, opacity: 0, duration: 0.12, ease: "power1.in" })
        .call(() => { timeNumbers.innerText = newTime; })
        .fromTo(timeNumbers, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.15, ease: "power1.out" });
    } else {
      timeNumbers.innerText = newTime;
    }
  }
  if (timelineDisplay) timelineDisplay.innerText = `${formatTime(appState.cookingTimeElapsed)} / ${formatTime(appState.cookingTimeTotal)}`;

  if (progressRing) {
    const totalDash = 502;
    progressRing.style.strokeDashoffset = totalDash - (appState.cookingTimeElapsed / appState.cookingTimeTotal) * totalDash;
  }

  if (cursor) {
    const percent = (appState.cookingTimeElapsed / appState.cookingTimeTotal) * 100;
    cursor.style.left = `calc(120px + ${percent}%)`;
  }
}

// ==================== 13. 步驟導引 ====================
function prevCookingStep() {
  if (appState.currentCookingStepIndex > 0) {
    appState.currentCookingStepIndex--;
    updateCookingStepUI();
    speakCurrentStep();
  } else {
    // [BUG-3 修正] 繁體中文統一（原為簡體「已经」）
    showToast("已到第一步了！請繼續加油！");
  }
}

function nextCookingStep() {
  const stepsCount = appState.activeCookingRecipe.parallelSteps.length;
  if (appState.currentCookingStepIndex < stepsCount - 1) {
    appState.currentCookingStepIndex++;
    updateCookingStepUI();
    speakCurrentStep();
  } else {
    finishCookingSuccessfully();
  }
}

function jumpToStepByParallelOrder(orderValue) {
  const idx = appState.activeCookingRecipe.parallelSteps.findIndex(s => s.order === orderValue);
  if (idx !== -1) {
    appState.currentCookingStepIndex = idx;
    updateCookingStepUI();
    speakCurrentStep();
    showToast(`🎯 已跳轉至步驟 ${orderValue}`);
  }
}

function updateCookingStepUI() {
  const indicator    = document.getElementById("step-indicator-title");
  const instruction  = document.getElementById("step-instruction-text");
  const timeRemaining= document.getElementById("step-time-remaining-text");
  if (!indicator || !instruction) return;

  const rec = appState.activeCookingRecipe;
  const currentStep = rec.parallelSteps[appState.currentCookingStepIndex];

  indicator.innerText = `步驟 ${appState.currentCookingStepIndex + 1} / ${rec.parallelSteps.length} （${currentStep.threadLabel}）`;
  instruction.innerText = currentStep.instruction;

  const minText = Math.floor(currentStep.duration / 60);
  const secText = currentStep.duration % 60;
  timeRemaining.innerText = `本步驟預計耗時：${minText > 0 ? minText + ' 分' : ''}${secText > 0 ? secText + ' 秒' : ''}`;

  document.querySelectorAll(".gantt-bar").forEach(b => b.classList.remove("active"));
  const activeBar = document.querySelectorAll(".gantt-bar")[appState.currentCookingStepIndex];
  if (activeBar) activeBar.classList.add("active");
}

// ==================== 14. 語音 TTS ====================
function speakCurrentStep() {
  if (!appState.voiceAssistantEnabled || !appState.activeCookingRecipe) return;
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const step = appState.activeCookingRecipe.parallelSteps[appState.currentCookingStepIndex];
  const utterance = new SpeechSynthesisUtterance(step.voiceText);
  utterance.lang   = "zh-TW";
  utterance.rate   = 0.95;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

function toggleVoiceAssistant() {
  const checkbox    = document.getElementById("voice-toggle-checkbox");
  const statusTitle = document.getElementById("voice-status-title-wrap");
  if (!checkbox) return;

  appState.voiceAssistantEnabled = checkbox.checked;
  if (statusTitle) statusTitle.classList.toggle("disabled", !checkbox.checked);

  if (checkbox.checked) {
    showToast("🔊 語音智慧導引已啟動");
    speakCurrentStep();
  } else {
    showToast("🔇 語音智慧導引已關閉");
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

// ==================== 15. 烹飪結束流程 ====================
function finishCookingSuccessfully() {
  clearInterval(appState.cookingTimerInterval);
  appState.isCookingTimerPaused = true;
  showToast("🎉 恭喜！美味極速晚餐順利出餐，全家開動！");
  finishCookingAndExit();
}

function finishCookingAndExit() {
  clearInterval(appState.cookingTimerInterval);
  appState.isCookingTimerPaused = true;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  document.getElementById("nav-d-cooking").style.display = "none";
  document.getElementById("nav-m-cooking").style.display = "none";
  appState.activeCookingRecipe = null;
  switchView("home");
}

// ==================== 16. 食譜圖片對應表（Unsplash） ====================

// 依料理類別分組的 Unsplash 圖片 ID（每類 3 張，依 recipe.id 雜湊選一張以增加多樣性）
const CUISINE_PHOTO_POOLS = {
  "日式": [
    "1547592180-85f173990554", // ramen bowl
    "1569050467447-ce54b3bbc37d", // donburi
    "1617196034183-421b4040d20c"  // Japanese set meal
  ],
  "台式": [
    "1603133872878-684f208fb84b", // fried rice
    "1504674900247-0877df9cc836", // stir-fry
    "1455619452474-d2be8b1e70cd"  // Asian dish
  ],
  "韓式": [
    "1590301157890-4810ed352733", // Korean rice bowl
    "1498654896293-37aacf113fd9", // Korean stew
    "1563379091054-d58e4a0d63e2"  // Korean BBQ
  ],
  "義式": [
    "1551183053-bf91798d047f",    // tomato pasta
    "1473093295043-cdd812d0e601", // carbonara
    "1565299624946-b28f40a0ae38"  // pizza/Italian
  ],
  "美式": [
    "1568901346375-23c9450c58cd", // burger
    "1484723091739-30990658011e", // sandwich
    "1546069901-ba9599a7e63c"     // healthy American
  ],
  "泰式": [
    "1562802378-063ec186a863",    // Thai stir-fry
    "1455619452474-d2be8b1e70cd", // Thai dish
    "1585937421612-70a008356fbe"  // curry
  ],
  "川式": [
    "1504674900247-0877df9cc836", // Chinese stir-fry
    "1540189549336-e6e99eb4b935", // hot pot
    "1455619452474-d2be8b1e70cd"  // Asian dish
  ],
  "中式": [
    "1504674900247-0877df9cc836",
    "1540189549336-e6e99eb4b935",
    "1603133872878-684f208fb84b"
  ],
  "越式": [
    "1569718212165-3a8278d5f624", // Vietnamese pho
    "1455619452474-d2be8b1e70cd",
    "1562802378-063ec186a863"
  ],
  "印度": [
    "1585937421612-70a008356fbe", // Indian curry
    "1455619452474-d2be8b1e70cd",
    "1546069901-ba9599a7e63c"
  ],
  "墨式": [
    "1504674900247-0877df9cc836",
    "1546069901-ba9599a7e63c",
    "1484723091739-30990658011e"
  ],
  "法式": [
    "1490645935967-10de6ba17061", // French dish
    "1565299624946-b28f40a0ae38",
    "1512621776951-a57141f2eefd"
  ],
  "地中海": [
    "1490645935967-10de6ba17061",
    "1512621776951-a57141f2eefd",
    "1546069901-ba9599a7e63c"
  ],
  "東南亞": [
    "1562802378-063ec186a863",
    "1569718212165-3a8278d5f624",
    "1455619452474-d2be8b1e70cd"
  ],
  "default": [
    "1547592180-85f173990554",
    "1551183053-bf91798d047f",
    "1504674900247-0877df9cc836"
  ]
};

// 特定食譜 ID 直接對應圖片（更精準，優先級高於 cuisine 分組）
const RECIPE_PHOTO_OVERRIDES = {
  "rec-sukiyaki":     "1569050467447-ce54b3bbc37d", // 壽喜燒丼
  "rec-onepotpasta":  "1551183053-bf91798d047f",    // 番茄義大利麵
  "rec-kimchipot":    "1498654896293-37aacf113fd9", // 韓式鍋
  "rec-grapork":      "1562802378-063ec186a863",    // 打拋豬
  "rec-lazyfish":     "1519708227418-c8fd9a32b7a2", // 香草魚
  "rec-3cupcn":       "1604908176997-125f25cc6f3d", // 三杯雞
  "rec-tomatoegg":    "1525351484163-7529414344d8", // 番茄炒蛋
  "rec-oyakodon":     "1547592180-85f173990554",    // 親子丼
  "rec-spicypork":    "1590301157890-4810ed352733", // 辣炒豬
  "rec-vnpho":        "1569718212165-3a8278d5f624", // 越式米線
  "rec-butterchicken":"1585937421612-70a008356fbe", // 奶油咖哩
  "rec-mexbeef":      "1504674900247-0877df9cc836", // 墨式牛肉
  "rec-steamfish":    "1519708227418-c8fd9a32b7a2", // 清蒸魚
  "rec-clampasta":    "1563379926898-05f4575a45d8", // 蛤蜊麵
  "rec-scallionpork": "1555126634-323283e090fa",    // 蔥爆豬
  "rec-misonabe":     "1540189549336-e6e99eb4b935", // 味噌鍋
  "rec-pumpkincurry": "1476224203421-74177e022103", // 南瓜咖哩
  "rec-medchicken":   "1532550884653-71e7c14c8f19", // 迷迭香雞
  "rec-carbonara":    "1473093295043-cdd812d0e601", // 培根義麵
  "rec-bibimbap":     "1590301157890-4810ed352733", // 石鍋拌飯
  "rec-padthai":      "1562802378-063ec186a863",    // 炒河粉
  "rec-teriyaki-salmon": "1467003909585-2f8a72700288", // 照燒鮭魚
  "rec-karaage":      "1604908176997-125f25cc6f3d", // 唐揚炸雞
  "rec-burger-patty": "1568901346375-23c9450c58cd", // 漢堡排
  "rec-egg-fried-rice":"1603133872878-684f208fb84b",// 蛋炒飯
  "rec-green-curry":  "1585937421612-70a008356fbe", // 綠咖哩
  "rec-dal":          "1546069901-ba9599a7e63c",    // 印度扁豆
  "rec-tacos":        "1504674900247-0877df9cc836", // 塔可
  "rec-greek-salad":  "1512621776951-a57141f2eefd", // 希臘沙拉
};

function getRecipeImageUrl(recipe) {
  // 優先使用本地 Imagen 生成圖（generate-images.ps1 產出）
  return `./images/${recipe.id}.jpg`;
}

function getRecipeImageFallbackUrl(recipe) {
  // Imagen 圖片載入失敗時的備援：Unsplash 依料理分類
  const overrideId = RECIPE_PHOTO_OVERRIDES[recipe.id];
  if (overrideId) {
    return `https://images.unsplash.com/photo-${overrideId}?w=600&h=360&fit=crop&auto=format&q=80`;
  }
  const cuisine = recipe.cuisine || "";
  let poolKey = "default";
  for (const key of Object.keys(CUISINE_PHOTO_POOLS)) {
    if (cuisine.includes(key)) { poolKey = key; break; }
  }
  const pool = CUISINE_PHOTO_POOLS[poolKey];
  const hash = recipe.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return `https://images.unsplash.com/photo-${pool[hash % pool.length]}?w=600&h=360&fit=crop&auto=format&q=80`;
}

// ==================== 17. 通勤補貨快線 ====================

const GROCERY_PLATFORMS = [
  {
    id: "foodpanda",
    name: "foodpanda mart",
    emoji: "🐼",
    bgColor: "#FFF0F7",
    deliveryMin: 30,
    deliveryMax: 45,
    deliveryLabel: "30–45 分鐘",
    speedClass: "pg-fast",
    coverage: "雙北・桃竹・台中・高雄",
    feature: "即時快送，市區最速首選",
    url: "https://www.foodpanda.com.tw/mall/"
  },
  {
    id: "pxmart",
    name: "全聯小時達",
    emoji: "🏪",
    bgColor: "#FFF0F2",
    deliveryMin: 45,
    deliveryMax: 60,
    deliveryLabel: "45–60 分鐘",
    speedClass: "pg-medium",
    coverage: "全台 1,000+ 門市",
    feature: "覆蓋最廣，生鮮蔬菜最豐富",
    url: "https://m.pxmart.com.tw/"
  },
  {
    id: "momo",
    name: "momo 超市",
    emoji: "🛍️",
    bgColor: "#F5F0FF",
    deliveryMin: 60,
    deliveryMax: 120,
    deliveryLabel: "60 分鐘～次日",
    speedClass: "pg-slow",
    coverage: "全台",
    feature: "品項最齊全，適合一次大量採買",
    url: "https://www.momomall.com.tw/"
  },
  {
    id: "carrefour",
    name: "家樂福快購",
    emoji: "🔵",
    bgColor: "#EEF3FF",
    deliveryMin: 60,
    deliveryMax: 90,
    deliveryLabel: "60–90 分鐘",
    speedClass: "pg-slow",
    coverage: "大台北・台中・高雄",
    feature: "進口食材最齊全",
    url: "https://online.carrefour.com.tw/"
  }
];

function initCommuteView() {
  // 更新時鐘
  const now = new Date();
  const clockEl = document.getElementById("commute-clock");
  if (clockEl) {
    clockEl.textContent =
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0");
  }

  // 預設選今週第一道菜，否則取第一道極速食譜
  if (!appState.commuteSelectedRecipe) {
    if (appState.weeklyPlannerRecipes && appState.weeklyPlannerRecipes.length > 0) {
      appState.commuteSelectedRecipe = appState.weeklyPlannerRecipes[0];
    } else {
      appState.commuteSelectedRecipe = RECIPES_DB.find(r => r.totalTime <= 15) || RECIPES_DB[0];
    }
  }

  updateArrivalTime();
  renderCommuteRecipeCard();
  renderMissingIngredients();
  renderPlatformCards();
}

function updateArrivalTime() {
  const slider = document.getElementById("commute-slider");
  if (!slider) return;
  const minutes = parseInt(slider.value, 10);
  appState.commuteMinutes = minutes;

  document.getElementById("commute-minutes").textContent = minutes;

  const arrival = new Date();
  arrival.setMinutes(arrival.getMinutes() + minutes);
  document.getElementById("arrival-time").textContent =
    String(arrival.getHours()).padStart(2, "0") + ":" +
    String(arrival.getMinutes()).padStart(2, "0");

  const badge = document.getElementById("arrival-badge");
  if (minutes <= 20) {
    badge.textContent = "⚡ 到家即開煮";
    badge.style.cssText = "background:#E8F5E9;color:#388E3C";
  } else if (minutes <= 50) {
    badge.textContent = "🛵 外送可趕上";
    badge.style.cssText = "background:var(--accent-gold-light);color:var(--accent-gold)";
  } else {
    badge.textContent = "📦 充裕下單時間";
    badge.style.cssText = "background:var(--primary-peach-light);color:var(--primary-peach)";
  }

  renderPlatformCards();
}

function renderCommuteRecipeCard() {
  const container = document.getElementById("commute-recipe-card");
  if (!container) return;
  const recipe = appState.commuteSelectedRecipe;
  if (!recipe) {
    container.innerHTML = `<p style="color:var(--text-muted);padding:16px;text-align:center">請先至「週規劃」排定菜單</p>`;
    return;
  }
  container.innerHTML = `
    <div class="commute-recipe-mini-card">
      <div class="commute-recipe-emoji">${recipe.imageFallback}</div>
      <div class="commute-recipe-info">
        <div class="commute-recipe-title">${recipe.title}</div>
        <div class="commute-recipe-meta">
          <span class="cr-badge cr-badge-time">⏱ ${recipe.totalTime} 分鐘</span>
          <span class="cr-badge cr-badge-cuisine">${recipe.cuisine}</span>
          <span class="cr-badge cr-badge-servings">${recipe.servings} 人份</span>
        </div>
      </div>
    </div>`;
}

function changeCommuteRecipe() {
  const pool = RECIPES_DB.filter(r => r.totalTime <= 25);
  const curIdx = pool.findIndex(r => r.id === (appState.commuteSelectedRecipe && appState.commuteSelectedRecipe.id));
  appState.commuteSelectedRecipe = pool[(curIdx + 1) % pool.length];
  appState.commuteOwnedItems = new Set();
  renderCommuteRecipeCard();
  renderMissingIngredients();
}

function renderMissingIngredients() {
  const container = document.getElementById("missing-ingredients-list");
  const countEl   = document.getElementById("missing-count");
  if (!container) return;
  const recipe = appState.commuteSelectedRecipe;
  if (!recipe) { container.innerHTML = ""; return; }

  let missingCount = 0;
  const rows = recipe.ingredients.map(ing => {
    const owned = appState.commuteOwnedItems.has(ing.name);
    if (!owned) missingCount++;
    return `
      <div class="missing-ingredient-item${owned ? " have-it" : ""}" id="ing-row-${ing.name.replace(/\s/g,'')}">
        <input type="checkbox" class="missing-check" ${owned ? "checked" : ""}
               onchange="toggleCommuteItem(this, '${ing.name.replace(/'/g, "\\'")}')">
        ${ing.isMain ? '<span class="ingredient-main-dot"></span>' : ""}
        <span class="ingredient-name">${ing.name}</span>
        <span class="ingredient-qty">${ing.qty}</span>
      </div>`;
  }).join("");

  container.innerHTML = rows;
  if (countEl) countEl.textContent = missingCount;
}

function toggleCommuteItem(checkbox, name) {
  const row = checkbox.closest(".missing-ingredient-item");
  if (checkbox.checked) {
    appState.commuteOwnedItems.add(name);
    row.classList.add("have-it");
  } else {
    appState.commuteOwnedItems.delete(name);
    row.classList.remove("have-it");
  }
  // Update missing count
  const total = appState.commuteSelectedRecipe ? appState.commuteSelectedRecipe.ingredients.length : 0;
  const countEl = document.getElementById("missing-count");
  if (countEl) countEl.textContent = total - appState.commuteOwnedItems.size;
}

function renderPlatformCards() {
  const minutes = appState.commuteMinutes || 35;
  let recommendedId;
  if (minutes <= 30) recommendedId = "foodpanda";
  else if (minutes <= 55) recommendedId = "pxmart";
  else recommendedId = "momo";

  // 推薦平台大橫幅
  const bannerEl = document.getElementById("recommended-platform-card");
  if (bannerEl) {
    const rec = GROCERY_PLATFORMS.find(p => p.id === recommendedId);
    bannerEl.innerHTML = `
      <div class="recommended-platform-banner">
        <span class="recommended-badge">✨ 推薦</span>
        <div class="platform-banner-content">
          <div class="platform-logo-box" style="background:${rec.bgColor}">${rec.emoji}</div>
          <div class="platform-banner-info">
            <div class="platform-name">${rec.name}</div>
            <div class="platform-delivery-time">約 ${rec.deliveryLabel} 送達</div>
            <div class="platform-coverage-text">${rec.coverage}</div>
          </div>
          <button class="platform-order-btn" onclick="openPlatformLink('${rec.id}')">立即下單</button>
        </div>
      </div>`;
  }

  // 2×2 格
  const gridEl = document.getElementById("platforms-grid");
  if (gridEl) {
    gridEl.innerHTML = GROCERY_PLATFORMS.map(p => {
      const isRec = p.id === recommendedId;
      return `
        <div class="platform-grid-card${isRec ? " is-recommended" : ""}" onclick="openPlatformLink('${p.id}')">
          <div class="pg-header">
            <span class="pg-emoji">${p.emoji}</span>
            <span class="pg-name">${p.name}</span>
          </div>
          <span class="pg-delivery-badge ${p.speedClass}">${p.deliveryLabel}</span>
          <div class="pg-feature">${p.feature}</div>
          <button class="pg-btn">${isRec ? "✨ 推薦下單" : "前往下單"}</button>
        </div>`;
    }).join("");
  }
}

function openPlatformLink(platformId) {
  const platform = GROCERY_PLATFORMS.find(p => p.id === platformId);
  if (!platform) return;
  showToast(`正在跳轉至 ${platform.name}…`);
  setTimeout(() => window.open(platform.url, "_blank"), 400);
}

function copyShoppingListToClipboard() {
  const recipe = appState.commuteSelectedRecipe;
  if (!recipe) { showToast("請先選擇今晚食譜"); return; }

  const lines = [
    `📋 採買清單 ─ ${recipe.title}`,
    `⏱ 烹飪時間：${recipe.totalTime} 分鐘`,
    ""
  ];
  recipe.ingredients.forEach(ing => {
    const mark = appState.commuteOwnedItems.has(ing.name) ? "✅" : "□";
    lines.push(`${mark} ${ing.name}　${ing.qty}`);
  });
  lines.push("", "📱 由極速食光 App 產生");

  const text = lines.join("\n");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast("採買清單已複製！貼至超市 App 即可搜尋"));
  } else {
    showToast("瀏覽器不支援自動複製，請手動複製");
  }
}

// ==================== 17. 全域輔助工具 ====================
function showToast(message) {
  const toast = document.getElementById("app-toast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("active");
  setTimeout(() => toast.classList.remove("active"), 4500);
}

// ==================== 18. GSAP Hero 動畫 ====================
function animateHero() {
  if (typeof gsap === "undefined") return;
  if (typeof TextPlugin !== "undefined") gsap.registerPlugin(TextPlugin);
  if (typeof Flip       !== "undefined") gsap.registerPlugin(Flip);
  if (typeof Draggable  !== "undefined") gsap.registerPlugin(Draggable);

  // 先重設狀態
  const line1 = document.getElementById("hero-title-line1");
  const line2 = document.getElementById("hero-title-line2");
  if (line1) line1.textContent = "";
  if (line2) gsap.set(line2, { opacity: 0, y: 12 });

  gsap.set([".hero-tag", ".hero-content > p", ".hero-actions", ".hero-badge-card"], { clearProps: "all" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-tag", { duration: 0.5, y: 20, opacity: 0 });

  // A. TextPlugin 打字機效果
  if (line1 && typeof TextPlugin !== "undefined") {
    tl.to(line1, { duration: 0.9, text: { value: "下班後 15 分鐘", delimiter: "" }, ease: "none" }, "-=0.1")
      .to(line2, { duration: 0.5, opacity: 1, y: 0 }, "-=0.1");
  } else {
    tl.from(".hero-content h1", { duration: 0.7, y: 32, opacity: 0 }, "-=0.2");
  }

  tl.from(".hero-content > p", { duration: 0.6, y: 20, opacity: 0 }, "-=0.3")
    .from(".hero-actions",       { duration: 0.5, y: 16, opacity: 0 }, "-=0.35")
    .from(".hero-badge-card",    { duration: 0.7, x: 48, opacity: 0, ease: "power2.out", clearProps: "all" }, "-=0.5");
}

// ==================== 18b. Hero 食譜輪播 ====================
let _carouselTimer = null;
let _carouselIdx   = 0;
let _carouselTotal = 0;

function initHeroCarousel() {
  const track     = document.getElementById("hero-carousel");
  const dotsWrap  = document.getElementById("carousel-dots");
  if (!track || typeof RECIPES_DB === "undefined") return;

  // 挑 6 道有圖片的食譜
  const picks = RECIPES_DB.slice(0, 6);
  _carouselTotal = picks.length;

  picks.forEach((recipe, i) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    slide.dataset.index = i;

    const imgUrl = getRecipeImageUrl(recipe);
    slide.innerHTML = `
      <div class="carousel-slide-emoji">${recipe.imageFallback}</div>
      <img src="${imgUrl}" alt="${recipe.title}"
           onload="this.style.opacity=1; this.previousElementSibling.style.display='none'"
           onerror="this.style.display='none'"
           style="opacity:0;transition:opacity 0.4s">
      <div class="carousel-slide-info">
        <h4>${recipe.title}</h4>
        <span>⏱ ${recipe.totalTime} 分鐘</span>
      </div>`;
    slide.addEventListener("click", () => initiateCooking(recipe.id, slide));
    track.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "carousel-dot";
    dot.addEventListener("click", () => _carouselGoTo(i));
    dotsWrap.appendChild(dot);
  });

  _carouselGoTo(0);

  // C. Draggable 手勢左右滑動
  if (typeof Draggable !== "undefined") {
    Draggable.create(track, {
      type: "x",
      edgeResistance: 0.85,
      throwProps: false,
      onDragEnd: function () {
        const dx = this.endX - this.startX;
        if (dx < -40)      _carouselGoTo((_carouselIdx + 1) % _carouselTotal);
        else if (dx > 40)  _carouselGoTo((_carouselIdx - 1 + _carouselTotal) % _carouselTotal);
        gsap.to(track, { x: 0, duration: 0.3, ease: "power2.out" });
      }
    });
  }
}

function _carouselGoTo(idx) {
  if (typeof gsap === "undefined") return;
  const slides = document.querySelectorAll(".carousel-slide");
  const dots   = document.querySelectorAll(".carousel-dot");
  if (!slides.length) return;

  slides.forEach((s, i) => {
    const depth = (i - idx + _carouselTotal) % _carouselTotal;
    if (depth === 0) {
      gsap.to(s, { scale: 1,    y: 0,  opacity: 1,   zIndex: 3, duration: 0.55, ease: "power2.out" });
    } else if (depth === 1) {
      gsap.to(s, { scale: 0.93, y: 10, opacity: 0.65, zIndex: 2, duration: 0.55, ease: "power2.out" });
    } else if (depth === 2) {
      gsap.to(s, { scale: 0.86, y: 20, opacity: 0.35, zIndex: 1, duration: 0.55, ease: "power2.out" });
    } else {
      gsap.set(s, { scale: 0.8, y: 28, opacity: 0, zIndex: 0 });
    }
  });

  dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  _carouselIdx = idx;

  clearInterval(_carouselTimer);
  _carouselTimer = setInterval(() => {
    _carouselGoTo((_carouselIdx + 1) % _carouselTotal);
  }, 2500);
}

// ==================== 19. ScrollTrigger & 微互動 ====================

function initParallax() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // ── 1. Hero 多層視差（核心 Apple 效果）───────────────────
  // hero 文字往上飄，比滾動慢（製造深度感）
  gsap.to(".hero-content", {
    y: -80,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero-section",
      start: "top top",
      end: "bottom top",
      scrub: 1.5
    }
  });

  // badge card 移動更少 → 兩層不同速度 = 立體感
  gsap.to(".hero-badge-card", {
    y: -35,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero-section",
      start: "top top",
      end: "bottom top",
      scrub: 1.5
    }
  });

  // ── 2. Section title 文字縮放淡入（Apple 招牌）───────────
  document.querySelectorAll(".section-title-wrap").forEach(el => {
    gsap.fromTo(el.querySelector("h2") || el,
      { scale: 0.88, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          end: "top 55%",
          scrub: 1
        }
      }
    );
  });

  // ── 3. 功能卡片深度交錯滾入 ──────────────────────────────
  ScrollTrigger.create({
    trigger: ".features-grid",
    start: "top 92%",
    once: true,
    onEnter: () => {
      gsap.from(".feature-card", {
        duration: 0.6,
        y: 50,
        opacity: 0,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "all"
      });
    }
  });

  // ── 3b. 四步驟絲滑時間軸 ────────────────────────────────────
  const tlFill = document.getElementById("timeline-fill");
  const tlContainer = document.querySelector(".timeline-container");
  if (tlFill && tlContainer) {
    // 垂直線隨滾動生長
    gsap.to(tlFill, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: tlContainer,
        start: "top 75%",
        end: "bottom 60%",
        scrub: 1.5
      }
    });

    // 每個步驟卡片依序飛入
    document.querySelectorAll(".timeline-step").forEach((step, i) => {
      const isLeft = step.classList.contains("tl-left");
      ScrollTrigger.create({
        trigger: step,
        start: "top 82%",
        once: true,
        onEnter: () => gsap.to(step, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power3.out",
          delay: 0.05
        })
      });
      // 初始偏移方向
      gsap.set(step, { opacity: 0, x: isLeft ? -50 : 50 });
    });
  }

  // ── 4. 食譜卡片圖片微視差（圖片比卡片移動慢）─────────────
  // 在 renderFeaturedRecipes 後才有卡片，用 MutationObserver 監聽
  const container = document.getElementById("featured-recipes-container");
  if (container) {
    const applyCardParallax = () => {
      container.querySelectorAll(".recipe-img-holder img").forEach(img => {
        // 避免重複設定
        if (img.dataset.parallaxSet) return;
        img.dataset.parallaxSet = "1";
        gsap.to(img, {
          y: -28,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".recipe-card"),
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
    };
    applyCardParallax();
    const obs = new MutationObserver(applyCardParallax);
    obs.observe(container, { childList: true });
  }
}

// Header 滾動陰影
function initHeaderScroll() {
  const header = document.querySelector(".app-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("header-scrolled", window.scrollY > 24);
  }, { passive: true });
}

// ==================== 20. Auth & 收藏同步（透過後端 API，無前端 key）====================

function initSupabase() {
  // 啟動時檢查是否已有登入 session（httpOnly cookie 由瀏覽器自動帶上）
  checkAuthSession();
}

async function checkAuthSession() {
  try {
    const resp = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
    const { user } = await resp.json();
    if (user) {
      appState.currentUser = user;
      await syncFavoritesFromServer();
      updateHeaderUser(user);
      renderFeaturedRecipes();
    }
  } catch (_) {}
}

function updateHeaderUser(user) {
  const avatarEl   = document.getElementById("header-avatar");
  const usernameEl = document.getElementById("header-username");
  if (!avatarEl || !usernameEl) return;
  if (user) {
    const name = user.name || user.email?.split("@")[0] || "我";
    avatarEl.textContent   = name.charAt(0).toUpperCase();
    usernameEl.textContent = name;
  } else {
    avatarEl.textContent   = "?";
    usernameEl.textContent = "登入";
  }
}

async function syncFavoritesFromServer() {
  if (!appState.currentUser) return;
  try {
    const resp = await fetch(`${API_BASE}/api/favorites`, { credentials: "include" });
    if (!resp.ok) return;
    const { favorites } = await resp.json();
    appState.userFavorites = new Set(favorites.map(f => f.recipe_id));
    const el = document.getElementById("fav-count");
    if (el) el.textContent = appState.userFavorites.size;
  } catch (_) {}
}

async function toggleFavorite(recipeId, event) {
  event.stopPropagation();
  if (!appState.currentUser) {
    openAuthModal();
    showToast("請先登入以收藏食譜 ❤️");
    return;
  }
  const isFav = appState.userFavorites.has(recipeId);
  const btn   = event.currentTarget;
  btn.style.opacity = "0.5";
  try {
    const resp = await fetch(`${API_BASE}/api/favorites`, {
      method:      isFav ? "DELETE" : "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify({ recipeId })
    });
    if (resp.ok) {
      if (isFav) { appState.userFavorites.delete(recipeId); showToast("已取消收藏"); }
      else       { appState.userFavorites.add(recipeId);    showToast("已加入收藏 ❤️"); }
      const el = document.getElementById("fav-count");
      if (el) el.textContent = appState.userFavorites.size;
    }
  } catch (_) { showToast("網路錯誤，請稍後再試"); }
  btn.style.opacity = "";
  renderFeaturedRecipes();
}

// ── Auth Modal ───────────────────────────────────────────────

function openAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.add("open");
  if (appState.currentUser) _showAuthLoggedIn(appState.currentUser);
  else _showAuthForms();
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.remove("open");
}

function handleAuthOverlayClick(e) {
  if (e.target === e.currentTarget) closeAuthModal();
}

function switchAuthTab(tab) {
  document.getElementById("tab-login")?.classList.toggle("active",    tab === "login");
  document.getElementById("tab-register")?.classList.toggle("active", tab === "register");
  document.getElementById("auth-form-login").style.display    = tab === "login"    ? "" : "none";
  document.getElementById("auth-form-register").style.display = tab === "register" ? "" : "none";
  document.getElementById("auth-hint").textContent = "";
}

function _showAuthForms() {
  document.getElementById("auth-tabs").style.display          = "";
  document.getElementById("auth-form-login").style.display    = "";
  document.getElementById("auth-form-register").style.display = "none";
  document.getElementById("auth-logged-in").style.display     = "none";
}

function _showAuthLoggedIn(user) {
  document.getElementById("auth-tabs").style.display          = "none";
  document.getElementById("auth-form-login").style.display    = "none";
  document.getElementById("auth-form-register").style.display = "none";
  document.getElementById("auth-logged-in").style.display     = "";
  const name    = user.name || user.email?.split("@")[0] || "我";
  const avatarEl = document.getElementById("auth-user-avatar");
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  const nameEl  = document.getElementById("auth-user-name");
  if (nameEl)   nameEl.textContent   = name;
  const emailEl = document.getElementById("auth-user-email");
  if (emailEl)  emailEl.textContent  = user.email;
  const favEl   = document.getElementById("fav-count");
  if (favEl)    favEl.textContent    = appState.userFavorites.size;
}

async function handleLogin() {
  const email    = document.getElementById("auth-email")?.value.trim();
  const password = document.getElementById("auth-password")?.value;
  const hint     = document.getElementById("auth-hint");
  if (!email || !password) { if (hint) hint.textContent = "請填寫信箱與密碼"; return; }
  if (hint) hint.textContent = "登入中…";
  try {
    const resp = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) {
      if (hint) hint.textContent = "登入失敗：" + (data.error?.includes("Invalid") ? "帳號或密碼錯誤" : data.error);
    } else {
      appState.currentUser = data.user;
      await syncFavoritesFromServer();
      updateHeaderUser(data.user);
      renderFeaturedRecipes();
      if (hint) hint.textContent = "";
      showToast("歡迎回來！✨");
      closeAuthModal();
    }
  } catch (_) { if (hint) hint.textContent = "網路錯誤，請稍後再試"; }
}

async function handleRegister() {
  const email    = document.getElementById("reg-email")?.value.trim();
  const password = document.getElementById("reg-password")?.value;
  const name     = document.getElementById("reg-name")?.value.trim();
  const hint     = document.getElementById("auth-hint");
  if (!email || !password) { if (hint) hint.textContent = "請填寫信箱與密碼"; return; }
  if (password.length < 6)  { if (hint) hint.textContent = "密碼至少 6 個字元"; return; }
  if (hint) hint.textContent = "建立帳號中…";
  try {
    const resp = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name })
    });
    const data = await resp.json();
    if (!resp.ok) {
      if (hint) hint.textContent = "註冊失敗：" + data.error;
    } else {
      if (hint) hint.textContent = "✅ 帳號已建立！請查看信箱點擊確認連結後即可登入。";
      showToast("帳號建立成功！請確認信箱 📧");
    }
  } catch (_) { if (hint) hint.textContent = "網路錯誤，請稍後再試"; }
}

async function handleSignOut() {
  await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
  appState.currentUser = null;
  appState.userFavorites.clear();
  updateHeaderUser(null);
  renderFeaturedRecipes();
  closeAuthModal();
  showToast("已登出，下次見 👋");
}

// ==================== 21. 背景音樂播放器 ====================
let _musicOn = false;

function toggleMusic() {
  const audio     = document.getElementById("bg-music");
  const btn       = document.getElementById("music-btn");
  const iconPlay  = document.querySelector(".music-icon-play");
  const iconPause = document.querySelector(".music-icon-pause");
  if (!audio) return;

  _musicOn = !_musicOn;

  if (_musicOn) {
    audio.play().catch(() => {
      _musicOn = false;
      iconPlay.style.display  = "";
      iconPause.style.display = "none";
      btn.classList.remove("music-playing");
      showToast("⚠️ 請先點擊頁面再開啟音樂");
    });
    iconPlay.style.display  = "none";
    iconPause.style.display = "";
    btn.classList.add("music-playing");
    showToast("🎵 背景音樂已開啟");
  } else {
    audio.pause();
    iconPlay.style.display  = "";
    iconPause.style.display = "none";
    btn.classList.remove("music-playing");
    showToast("🔇 背景音樂已關閉");
  }
}
