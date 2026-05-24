import { CharityTab } from '@prisma/client'

type CharityInput = {
  id: string
  title: string
  description: string
  tab: CharityTab
  categoryCode: string
  logoUrl: string | null
  amountRaised: number
  amountGoal: number | null
  createdAt: Date
}

function addDays(isoBase: string, days: number): Date {
  const d = new Date(isoBase)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function org(
  seq: number,
  categoryCode: string,
  title: string,
  description: string,
): CharityInput {
  return {
    id: `seed-org-${String(seq).padStart(3, '0')}`,
    title,
    description,
    tab: CharityTab.ORG,
    categoryCode,
    logoUrl: null,
    amountRaised: 50000 + (seq - 1) * 5000,
    amountGoal: null,
    createdAt: addDays('2026-01-01', seq - 1),
  }
}

function campaign(
  seq: number,
  categoryCode: string,
  title: string,
  description: string,
): CharityInput {
  return {
    id: `seed-cam-${String(seq).padStart(3, '0')}`,
    title,
    description,
    tab: CharityTab.CAMPAIGN,
    categoryCode,
    logoUrl: null,
    amountRaised: 10000 + (seq - 1) * 3000,
    amountGoal: 100000 + (seq - 1) * 5000,
    createdAt: addDays('2026-02-01', seq - 1),
  }
}

function merch(
  seq: number,
  categoryCode: string,
  title: string,
  description: string,
): CharityInput {
  return {
    id: `seed-mer-${String(seq).padStart(3, '0')}`,
    title,
    description,
    tab: CharityTab.MERCHANDISE,
    categoryCode,
    logoUrl: null,
    amountRaised: 2000 + (seq - 1) * 500,
    amountGoal: 20000 + (seq - 1) * 1000,
    createdAt: addDays('2026-03-03', seq - 1),
  }
}

export const SEED_CHARITIES: CharityInput[] = [
  // ORG — 公益團體 (30)
  org(1,  'CHILD_CARE',         '台灣兒童保育協會',       '每個孩子都值得被愛與守護'),
  org(2,  'ELDER_CARE',         '中華耆幼關懷協會',       '你身上有光，能照亮不確定的黑暗'),
  org(3,  'ANIMAL_PROTECTION',  '台灣動物保護協會',       '善待動物，也是善待人類自己'),
  org(4,  'SPECIAL_MEDICAL',    '財團法人罕見疾病基金會', '讓每個罕見的生命都被世界看見'),
  org(5,  'DISABILITY_SERVICE', '伊甸社會福利基金會',     '打開一扇門，為身障朋友創造無限可能'),
  org(6,  'WOMEN_CARE',         '勵馨社會福利事業基金會', '陪伴每位女性走過最艱難的時刻'),
  org(7,  'SPORTS_DEV',         '中華民國體育協進會',     '運動讓生命更有活力與意義'),
  org(8,  'EDUCATION_ADVOCACY', '台灣教育改革協會',       '教育是改變命運最強大的力量'),
  org(9,  'ENV_PROTECTION',     '台灣環境資訊協會',       '守護這片土地，為下一代留下生機'),
  org(10, 'MULTI_ETHNIC',       '原住民族文化事業基金會', '每一個族群都有值得被珍惜的故事'),
  org(11, 'MEDIA',              '公民媒體協會',           '讓真實的聲音被更多人聽見'),
  org(12, 'PUBLIC_ISSUE',       '台灣人權促進會',         '每個人的尊嚴都不該被忽視'),
  org(13, 'CULTURE_ARTS',       '台灣表演藝術聯盟',       '藝術讓心靈找到回家的路'),
  org(14, 'COMMUNITY_DEV',      '全國社區發展協會',       '社區的溫暖是城市的靈魂'),
  org(15, 'POVERTY_RELIEF',     '中華扶輪公益基金會',     '服務最需要幫助的每一個人'),
  org(16, 'INTL_RESCUE',        '國際特赦組織台灣分會',   '為世界每個角落的受難者發聲'),
  org(17, 'ELDER_CARE',         '創世社會福利基金會',     '每一位植物人背後都有家人的守候'),
  org(18, 'CHILD_CARE',         '台灣基督教兒童基金會',   '陪著每一個孩子走過成長的道路'),
  org(19, 'SPECIAL_MEDICAL',    '陽光社會福利基金會',     '傷痕可以是重生的起點'),
  org(20, 'POVERTY_RELIEF',     '世界展望會台灣辦事處',   '跨越距離的愛，讓遠方的孩子不再孤單'),
  org(21, 'ENV_PROTECTION',     '台灣環境保護聯盟',       '大地的美好需要我們共同守護'),
  org(22, 'MULTI_ETHNIC',       '新移民文化關懷協會',     '每個人都有資格在這塊土地上生根'),
  org(23, 'EDUCATION_ADVOCACY', '台灣開放教育協進會',     '知識不應該有城鄉的距離'),
  org(24, 'CULTURE_ARTS',       '台北市立藝術推廣協會',   '把美帶進每個人的日常生活'),
  org(25, 'ANIMAL_PROTECTION',  '台灣野生動物保育協會',   '與萬物共存才是最完整的生命'),
  org(26, 'COMMUNITY_DEV',      '社區互助網絡協會',       '在地連結創造最真實的溫暖'),
  org(27, 'ENV_PROTECTION',     '台灣永續能源研究基金會', '今日的選擇決定明日的地球'),
  org(28, 'CHILD_CARE',         '希望之芽公益基金會',     '孩子的笑容是最珍貴的希望'),
  org(29, 'POVERTY_RELIEF',     '台灣弱勢家庭服務協會',   '每個困頓的家庭都值得被托住'),
  org(30, 'INTL_RESCUE',        '紅十字會台灣分會',       '無論何處，人道的溫暖永不熄滅'),

  // CAMPAIGN — 捐款專案 (30)
  campaign(1,  'CHILD_CARE',         '偏鄉兒童閱讀計畫',         '讓每一個孩子都能擁有打開世界的鑰匙'),
  campaign(2,  'ELDER_CARE',         '獨居老人居家照護計畫',     '讓長輩的晚年充滿安心與尊嚴'),
  campaign(3,  'ANIMAL_PROTECTION',  '流浪動物結紮援助計畫',     '以愛替代傷害，讓每隻毛孩安心'),
  campaign(4,  'SPECIAL_MEDICAL',    '罕病兒童醫療補助計畫',     '讓罕見不再等於被遺忘'),
  campaign(5,  'DISABILITY_SERVICE', '身障者數位就業訓練計畫',   '打破限制，讓每份能力都被看見'),
  campaign(6,  'WOMEN_CARE',         '婦女庇護所重建計畫',       '安全的地方是重新出發的起點'),
  campaign(7,  'SPORTS_DEV',         '原住民青年體育培訓計畫',   '透過運動找回屬於自己的驕傲'),
  campaign(8,  'EDUCATION_ADVOCACY', '偏鄉學童課後輔導計畫',     '夢想不該因為距離而遠去'),
  campaign(9,  'ENV_PROTECTION',     '海洋廢棄物清除行動',       '乾淨的海洋是子孫最美的禮物'),
  campaign(10, 'MULTI_ETHNIC',       '原住民語言保存計畫',       '語言消失了，我們也就失去了一部分自己'),
  campaign(11, 'MEDIA',              '社區媒體識讀推廣計畫',     '讓每個人都有能力辨別真實與謊言'),
  campaign(12, 'PUBLIC_ISSUE',       '移工法律援助計畫',         '每個在異鄉打拚的人都值得被公平對待'),
  campaign(13, 'CULTURE_ARTS',       '傳統工藝傳承計畫',         '讓祖先的智慧在我們手中延續'),
  campaign(14, 'COMMUNITY_DEV',      '社區菜園建置計畫',         '土地連結人心，菜園孕育希望'),
  campaign(15, 'POVERTY_RELIEF',     '急難救助糧食供給計畫',     '任何人都不應該在台灣餓著睡覺'),
  campaign(16, 'INTL_RESCUE',        '土耳其地震援助計畫',       '災難之後，人類的愛最強大'),
  campaign(17, 'SPECIAL_MEDICAL',    '先天性心臟病手術補助計畫', '每一顆跳動的心都有資格被修復'),
  campaign(18, 'ELDER_CARE',         '山地部落長照服務計畫',     '陪伴無法下山的長輩安享晚年'),
  campaign(19, 'CHILD_CARE',         '兒童性別平等教育計畫',     '從小學習尊重，才能建立更美好的社會'),
  campaign(20, 'WOMEN_CARE',         '女性創業培力計畫',         '每個女性都有改寫自己故事的力量'),
  campaign(21, 'SPECIAL_MEDICAL',    '燒燙傷患者重建手術補助',   '傷痕不應定義一個人的未來'),
  campaign(22, 'POVERTY_RELIEF',     '食物銀行食材募集計畫',     '沒有人應該因為貧窮而受苦'),
  campaign(23, 'ENV_PROTECTION',     '高山生態復育計畫',         '讓消失的物種有機會重返故土'),
  campaign(24, 'MULTI_ETHNIC',       '新住民子女文化學習計畫',   '多一種語言多一個看世界的窗口'),
  campaign(25, 'EDUCATION_ADVOCACY', '偏鄉數位設備捐贈計畫',     '網路不通暢，夢想也會受阻'),
  campaign(26, 'CULTURE_ARTS',       '青年藝術家駐村計畫',       '讓創作的種子在各地開花'),
  campaign(27, 'ENV_PROTECTION',     '海岸濕地保護行動計畫',     '濕地是地球的腎，我們要守住它'),
  campaign(28, 'ANIMAL_PROTECTION',  '街頭犬貓醫療救援計畫',     '每一條生命都值得被好好對待'),
  campaign(29, 'MULTI_ETHNIC',       '原鄉部落文化記錄計畫',     '記錄就是最深情的守護'),
  campaign(30, 'COMMUNITY_DEV',      '社區防災互助訓練計畫',     '一個社區一個心，防災讓家更安全'),

  // MERCHANDISE — 義賣商品 (30)
  merch(1,  'CHILD_CARE',         '兒童繪本義賣套書',     '每本書都是送給孩子最好的禮物'),
  merch(2,  'ELDER_CARE',         '銀髮族手編圍巾組',     '每一針都包含了對長輩的深深祝福'),
  merch(3,  'ANIMAL_PROTECTION',  '毛孩紀念馬克杯組',     '喝一杯咖啡，同時為毛孩盡一份心意'),
  merch(4,  'SPECIAL_MEDICAL',    '希望燈籠義賣組',       '點亮一盞燈，照亮罕病孩子的前路'),
  merch(5,  'DISABILITY_SERVICE', '光影手工蠟燭禮盒',     '每一道光都是身障朋友用心製作的溫暖'),
  merch(6,  'WOMEN_CARE',         '女力手工編織籃',       '以手藝傳遞力量，以行動支持改變'),
  merch(7,  'SPORTS_DEV',         '運動義賣環保水壺',     '喝水的同時，也為運動夢想加油'),
  merch(8,  'EDUCATION_ADVOCACY', '學習力桌遊禮盒組',     '玩樂中學習，是給孩子最珍貴的禮物'),
  merch(9,  'ENV_PROTECTION',     '綠色生活環保提袋',     '每一次購物都是為地球做一件好事'),
  merch(10, 'MULTI_ETHNIC',       '原民文化陶藝品',       '每件作品都承載著族人的記憶與驕傲'),
  merch(11, 'MEDIA',              '紀錄片義賣套組',       '讓重要的故事繼續被看見'),
  merch(12, 'PUBLIC_ISSUE',       '公平貿易咖啡禮盒',     '每一杯都讓遠方農民的生活更有尊嚴'),
  merch(13, 'CULTURE_ARTS',       '傳統刺繡手帕組',       '古老的工藝在每一針線間找到新生命'),
  merch(14, 'COMMUNITY_DEV',      '社區有機蔬菜箱',       '新鮮的蔬果源自愛心，送達需要的家庭'),
  merch(15, 'POVERTY_RELIEF',     '農村米食禮盒',         '每一粒米都是農人與愛心的結晶'),
  merch(16, 'INTL_RESCUE',        '援助明信片禮盒組',     '一張明信片，連結世界兩端的善意'),
  merch(17, 'ELDER_CARE',         '銀髮族手作皮革小物',   '歲月沉澱出的工藝，值得被細細品味'),
  merch(18, 'ANIMAL_PROTECTION',  '愛護動物填充玩偶組',   '抱著這隻玩偶，也抱著對動物的愛'),
  merch(19, 'CHILD_CARE',         '兒童美術塗鴉套組',     '給孩子一支畫筆，他們能畫出整個世界'),
  merch(20, 'WOMEN_CARE',         '手工皂女性香氛組',     '每塊手工皂都讓女性更愛自己'),
  merch(21, 'SPECIAL_MEDICAL',    '罕病議題繪本套書',     '讓孩子從小學習接納不同的生命樣貌'),
  merch(22, 'POVERTY_RELIEF',     '社企烘焙義賣禮盒',     '甜點帶來幸福，也帶來改變的力量'),
  merch(23, 'ENV_PROTECTION',     '生態保育紀念徽章組',   '帶上它，讓世界知道你愛這片土地'),
  merch(24, 'MULTI_ETHNIC',       '多元文化風味果醬組',   '每一口都是不同文化的相遇與融合'),
  merch(25, 'EDUCATION_ADVOCACY', 'STEAM 教具益智組合',   '動手做是最好的學習方式'),
  merch(26, 'CULTURE_ARTS',       '藝術家聯名帆布包',     '藝術可以隨身攜帶，美好就在日常中'),
  merch(27, 'COMMUNITY_DEV',      '社區農場採摘體驗券',   '親手採下的蔬果，每一口都是感恩'),
  merch(28, 'DISABILITY_SERVICE', '身障朋友手工陶器組',   '每件作品背後都有一段克服困難的故事'),
  merch(29, 'POVERTY_RELIEF',     '暖心保溫馬克杯',       '暖一杯，暖一人，暖一個世界'),
  merch(30, 'INTL_RESCUE',        '愛的禮物公益包',       '一份禮物，連結給予與受助的美麗循環'),
]
