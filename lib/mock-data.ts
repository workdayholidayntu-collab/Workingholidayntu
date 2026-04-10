import type { Country, Discussion, Post, Profile, VisaInfo } from "@/types"

const now = "2026-03-31T09:00:00.000Z"

function visaTemplate(country: string): VisaInfo {
  return {
    overview: `${country} 打工度假申請以「先理解資格、再排時間線」最穩。棲地無界建議你把簽證、保險、財力證明與住宿搜尋拆成四個週期同步推進。`,
    ageRange: "18-30 歲",
    quota: "依雙邊年度名額公告為準",
    stayDuration: "通常 12 個月，可依國別規範延長",
    estimatedBudget: "建議先準備新台幣 12-18 萬元",
    processingTime: "約 2-8 週，依各國旺季有所浮動",
    steps: [
      "確認該國年齡、護照效期、財力與保險條件",
      "建立申請時程表，包含體檢、良民證、英文文件翻譯",
      "遞交申請後同步安排機票、前兩週住宿與在地聯絡管道",
    ],
    checklist: ["效期 12 個月以上護照", "英文財力證明", "海外醫療與意外保險", "履歷與聯絡方式"],
  }
}

export const countries: Country[] = [
  ["australia", "澳洲", "Australia", "🇦🇺"],
  ["new-zealand", "紐西蘭", "New Zealand", "🇳🇿"],
  ["japan", "日本", "Japan", "🇯🇵"],
  ["korea", "韓國", "South Korea", "🇰🇷"],
  ["canada", "加拿大", "Canada", "🇨🇦"],
  ["uk", "英國", "United Kingdom", "🇬🇧"],
  ["ireland", "愛爾蘭", "Ireland", "🇮🇪"],
  ["france", "法國", "France", "🇫🇷"],
  ["germany", "德國", "Germany", "🇩🇪"],
  ["belgium", "比利時", "Belgium", "🇧🇪"],
  ["netherlands", "荷蘭", "Netherlands", "🇳🇱"],
  ["luxembourg", "盧森堡", "Luxembourg", "🇱🇺"],
  ["austria", "奧地利", "Austria", "🇦🇹"],
  ["czechia", "捷克", "Czechia", "🇨🇿"],
  ["slovakia", "斯洛伐克", "Slovakia", "🇸🇰"],
  ["hungary", "匈牙利", "Hungary", "🇭🇺"],
  ["poland", "波蘭", "Poland", "🇵🇱"],
  ["usa", "美國", "United States", "🇺🇸"],
].map(([slug, name_zh, name_en, flag], index) => ({
  id: `country-${index + 1}`,
  slug,
  name_zh,
  name_en,
  flag_emoji: flag,
  visa_info: visaTemplate(name_zh),
  created_at: now,
}))

export const profiles: Profile[] = [
  {
    id: "user-demo",
    nickname: "晴安",
    avatar_url: null,
    countries_visited: ["australia", "japan"],
    bio: "回國後在棲地無界整理自己的打工度假筆記，想幫更多人少走彎路。",
    can_help: "澳洲農場履歷、雪場面試、行前預算拆解",
    is_verified: true,
    created_at: now,
  },
  {
    id: "user-maya",
    nickname: "Maya",
    avatar_url: null,
    countries_visited: ["new-zealand"],
    bio: "喜歡把繁雜流程拆成清楚清單，適合陪你排第一版時程。",
    can_help: "紐西蘭簽證時間線、住宿落地第一週安排",
    is_verified: false,
    created_at: now,
  },
  {
    id: "user-ken",
    nickname: "Ken",
    avatar_url: null,
    countries_visited: ["canada", "uk"],
    bio: "有客服與餐飲經驗，專長是履歷與面試脈絡整理。",
    can_help: "加拿大履歷優化、英國城市選擇、打工心態調整",
    is_verified: true,
    created_at: now,
  },
  {
    id: "user-tingying",
    nickname: "亭穎",
    avatar_url: null,
    countries_visited: ["usa"],
    bio: "2024 年夏天前往阿拉斯加 Anchorage，透過 CIEE 代辦取得 J-1 簽證，做過餐廳備料、青年旅館櫃檯與泰式餐廳外場。",
    can_help: "美國 J-1 代辦流程、阿拉斯加選城與安全須知、餐飲求職",
    is_verified: true,
    created_at: now,
  },
]

export const posts: Post[] = [
  {
    id: "post-aus-farm",
    country_slug: "australia",
    title: "澳洲農場求職時間線：從零到拿到第一份工作",
    slug: "australia-first-farm-job-timeline",
    content:
      "我把澳洲農場求職拆成四段：出發前、落地第一週、履歷投遞、現場試工。最重要的是不要把希望押在單一城市，而是提早準備可移動的節奏。\n\n在棲地無界這篇整理裡，我把住宿、交通、履歷、英文自介與詐騙辨識一起收進來。",
    html_content:
      "<h2>四段式節奏</h2><p>我把澳洲農場求職拆成四段：出發前、落地第一週、履歷投遞、現場試工。</p><ul><li>先備好英文履歷與可聯絡電話</li><li>不要把希望押在單一城市</li><li>試工前先確認工時計算方式與住宿條件</li></ul>",
    excerpt: "把澳洲農場求職拆成四段節奏，讓你不會落地後才開始慌。",
    author_id: "user-demo",
    status: "approved",
    tags: ["澳洲", "農場", "求職"],
    views: 381,
    created_at: "2026-03-18T09:00:00.000Z",
    updated_at: "2026-03-20T09:00:00.000Z",
  },
  {
    id: "post-nz-budget",
    country_slug: "new-zealand",
    title: "紐西蘭打工度假 30 天落地預算表",
    slug: "new-zealand-first-30-days-budget",
    content: "第一個月不要只算住宿與伙食，還要把交通卡、手機門號、押金、工具採購都算進去。",
    html_content:
      "<h2>預算分層</h2><p>先拆成不可避免成本與可彈性成本，再決定你要在哪裡保留緩衝。</p>",
    excerpt: "把落地第一個月的必要花費拆開來，才知道真正該準備多少。",
    author_id: "user-maya",
    status: "approved",
    tags: ["紐西蘭", "預算", "新手"],
    views: 214,
    created_at: "2026-03-12T09:00:00.000Z",
    updated_at: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "post-usa-alaska-j1",
    country_slug: "usa",
    title: "阿拉斯加打工度假三個月：從代辦申請到 Anchorage 生存實錄",
    slug: "usa-alaska-j1-anchorage-experience",
    content:
      "2024 年 6 月到 9 月，我透過 CIEE 代辦拿到 J-1 簽證，在阿拉斯加 Anchorage 待了三個月。做過餐廳 Prep Cook、青年旅館櫃檯、泰式餐廳 Server 三份工作。這篇把申請時程、選工作的考量、住宿踩雷、當地安全與真實花費一次整理出來。",
    html_content: [
      "<h2>為什麼選阿拉斯加</h2>",
      "<p>我平常很喜歡爬山，想到一個充滿大自然的地方長期生活。阿拉斯加被叫做「Last Frontier」，出發前就知道這件事，覺得可以去看看這片最後一塊淨土到底有多遼闊。除了自然環境，我也想培養在異地獨立生活的能力。</p>",

      "<h2>申請時程與代辦流程</h2>",
      "<p>我是 8 月看到這個活動、12 月決定要去、隔年 2 月面試、4 月拿到簽證、6 月出發。第一次去美國打工度假通常都需要透過代辦，因為中間需要 sponsor，自己申請通常要去過一次之後才有辦法做到。</p>",
      "<p>一般來說如果要隔年出發，前一年的 8 到 10 月就要開始申請，10 月會有第一波面試。我算比較晚，但流程沒有遇到太大問題。</p>",

      "<h2>工作怎麼選</h2>",
      "<p>美國打工度假的工作主要分三種：渡假村、度假營、國家公園。每種又細分很多類型，需要花時間比較。平台上顯示的工作是歷年資料，不代表當年一定會出現，所以有時候會有點白忙一場。選州也是一個課題，美國 52 州，要在其中釐清自己的需求、找到合適的州、度過一個充實有趣的夏天，需要花不少心思。</p>",

      "<h2>薪資與花費</h2>",
      "<p>阿拉斯加時薪大約 15 美元，比其他州高，但物價也相對高，所以差距沒有想像中大。能存多少主要看你有沒有去花錢、額外開銷多不多。如果以賺錢為目標、好好控制開銷，阿拉斯加算是不錯的選擇。我自己是到第二個月當上 Server 之後，因為班次多、有小費，比較有餘裕去安排休閒，前面基本上都以賺錢為主。</p>",

      "<h2>住宿踩雷與建議</h2>",
      "<p>4 月拿到工作 offer，結果 5 月公司突然通知說原本合約裡承諾的住宿因為維修無法提供，要我們自己找。那時正式還有兩週就要出發，我們同一梯大概 6 個台灣學生在同一個工作崗位，大家全部傻眼，馬上聯絡代辦，但代辦提供的住宿位置很遠，算下來費用根本划不來，最後只能自己額外找租屋。</p>",
      "<p>我主要是透過 Facebook 社團找短期租屋，剛好在 Anchorage 的社團上找到台灣人可以幫忙，算是比較幸運的案例。<strong>建議出發前先搜評價好、台灣人常去且常有回饋的公司，這樣比較有保障。</strong></p>",

      "<h2>安全須知（重要）</h2>",
      "<p>兩件事一定要知道：</p>",
      "<ul>",
      "<li><strong>晚上九點以後不要一個人在外面走。</strong>Anchorage 因為政策改變，治安比想像中差很多。我自己有一次下班回家的路上就遇過有人在後面追著我跑、大聲叫囂，當下馬上打電話給朋友讓他在線上，比較安心。去之前一定要查清楚哪些是安全區、哪些街道要避開。</li>",
      "<li><strong>搭便車要非常謹慎。</strong>我在 Anchorage 第二天早上沒電、公車等不到、又不知道怎麼走回家，最後上了一個中年男子的車。對方中途問我有沒有男朋友，說順道也可以交一個，後來把車開到加油站後面停在偏僻處。我藉口說要下車之後才以脫身，他還不高興罵我說如果不是他早就出事了。後來有搭便車的機會都選擇看起來比較安全的對象，比如老奶奶或老夫婦。</li>",
      "</ul>",
      "<p>另外跟台灣朋友互相定位也非常重要，那麼大的地方，別天天不見、別到處不通訊，一定要讓人知道你在哪裡。</p>",

      "<h2>給後輩的一句話</h2>",
      "<p>「刺激，然後也是蠻多的成長。」中間有工作挫折的壓力很大，幸好在阿拉斯加有很多朋友可以一直鼓勵我，大家一起並肩度過那些東西，對我來說真的是很珍貴的羈絆，到現在都還繼續聯絡。</p>",
      "<p>如果你只是缺一個人鼓勵的話，作為一個過來人，我超級推薦你去。在異地可以被賦予很多不同的身份，可以建立一個完全獨立的生活圈和人際網。在台灣很多東西可能是被綁住的，到異地去實踐、去碰撞，真的是一個很有趣的經驗。大家都是帶著不同的故事回來的，要經歷過才知道。</p>",
    ].join("\n"),
    excerpt: "透過 CIEE 代辦拿 J-1 簽證，在 Anchorage 做過三份餐飲工作。住宿踩雷、治安警告、搭便車驚魂與真實花費，過來人一次說完。",
    author_id: "user-tingying",
    status: "approved",
    tags: ["美國", "阿拉斯加", "J-1", "過來人"],
    views: 0,
    created_at: "2026-04-10T09:00:00.000Z",
    updated_at: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "post-japan-sharehouse",
    country_slug: "japan",
    title: "日本 Share House 怎麼選：通勤、押金、社群感一次看",
    slug: "japan-sharehouse-guide",
    content: "先決定自己重視的是通勤、語言練習還是社群感，這三種需求會直接影響你該選哪種房型。",
    html_content:
      "<h2>先選需求，不是先選房</h2><p>通勤、押金與社群感是日本 share house 最常拉扯的三件事。</p>",
    excerpt: "先搞懂自己要的是節省交通時間、低押金，還是能快速認識人的空間。",
    author_id: "user-demo",
    status: "approved",
    tags: ["日本", "住宿", "Share House"],
    views: 146,
    created_at: "2026-03-08T09:00:00.000Z",
    updated_at: "2026-03-10T09:00:00.000Z",
  },
]

export const discussions: Discussion[] = [
  {
    id: "discussion-1",
    post_id: "post-aus-farm",
    user_id: "user-maya",
    content: "這篇把時間線拆得很清楚，我補充一下：旺季找住宿真的要比工作再早半步。",
    created_at: "2026-03-21T04:30:00.000Z",
    profile: { nickname: "Maya", avatar_url: null, is_verified: false },
  },
  {
    id: "discussion-2",
    post_id: "post-aus-farm",
    user_id: "user-ken",
    content: "第一次出國工作，履歷先找朋友幫你做一輪英文口語化調整，回覆率差很多。",
    created_at: "2026-03-21T05:10:00.000Z",
    profile: { nickname: "Ken", avatar_url: null, is_verified: true },
  },
]

export const mockViewer = {
  userId: "user-demo",
  email: "demo@whv.tw",
  profile: profiles[0],
}
