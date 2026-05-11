import { Users, Flag, Building, Lightbulb } from 'lucide-react';


const questions = [
  {
    id: 1,
    background: "마을 안길 확장을 위해 주민 땅 일부가 편입되어야 하는데, 지주들이 강력히 반대합니다.",
    question: "당신이 이 사업을 이끌고 있다면 어떻게 하겠습니까?",
    options: [
      { text: "내 땅을 먼저 조건 없이 내어놓고, 주민들이 보고 느끼도록 기다린다.", type: "LEADER",
        historicalNote: { figure: "새마을지도자 최원규", context: "강원 도원1리", sourceFile: "06_강원도_01_영월군_수주면_도원1리_현대어.md", quote: "대지 100평을 먼저 기증하자, 반대하던 이창노 씨가 스스로 150평을 내놓았습니다." } },
      { text: "이웃들을 한 명씩 찾아다니며 마을 전체가 얻을 이익을 설명한다.", type: "VILLAGER",
        historicalNote: { figure: "의성군 주민 149명", context: "경북 구담교", sourceFile: "02_대규모사업_경북안동군_풍천면_구담교_현대어.md", quote: "12km나 떨어진 타군 주민들이 '보고만 있을 수 없다'며 삽을 들고 달려왔습니다." } },
      { text: "토지 보상 규정을 검토하고 공정한 절차로 협의에 나선다.", type: "OFFICIAL",
        historicalNote: { figure: "면장 금중진", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "행정 조율을 통해 IBRD 차관 농로개설 사업 유치에 성공했습니다." } },
      { text: "편입 면적을 최소화하는 대안 노선을 기술적으로 검토해 제안한다.", type: "EXPERT",
        historicalNote: { figure: "신진토건·CAC 사령부", context: "경북 구담교", sourceFile: "02_대규모사업_경북안동군_풍천면_구담교_현대어.md", quote: "전문 기술 입찰과 군부대 지원으로 3억 공사를 9천만 원에 완성했습니다." } },
    ]
  },
  {
    id: 2,
    background: "400m 강에 다리를 놓으려면 3억 원이 필요한데, 예산은 3,600만 원뿐입니다.",
    question: "주민들이 포기하려 합니다. 당신의 첫 번째 행동은?",
    options: [
      { text: "\"할 수 있는 것부터 시작하자!\"며 노동봉사로 강변 골재를 직접 채취하기 시작한다.", type: "LEADER",
        historicalNote: { figure: "대의원 이찬규", context: "경북 구담교", sourceFile: "02_대규모사업_경북안동군_풍천면_구담교_현대어.md", quote: "사재 300만 원을 쾌척하여 구담교 기공의 불씨를 지폈습니다." } },
      { text: "이웃 마을, 다른 군 주민들까지 찾아다니며 십시일반 협력을 구한다.", type: "VILLAGER",
        historicalNote: { figure: "부녀노인회 유필규 회장 외 14명", context: "경북 구담교", sourceFile: "02_대규모사업_경북안동군_풍천면_구담교_현대어.md", quote: "평생 모은 관광 적금 15만 원 전액을 기부했습니다. '죽기 전에 다리 놓는 데 보태야 한다'며." } },
      { text: "상급 기관에 차관 사업 유치를 건의하고, 조달청 자재 공급 루트를 탐색한다.", type: "OFFICIAL",
        historicalNote: { figure: "군수 문병우", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "\"폭 2m부터 우리 힘으로 뚫어보자\"며 면민 대회를 주재해 주민 동참을 이끌었습니다." } },
      { text: "주민 봉사로 할 부분과 전문 기술 부분을 분리해 공개 입찰 설계를 짠다.", type: "EXPERT",
        historicalNote: { figure: "도급업자 권태영", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "손실 위기에서도 주민들의 단결에 감동받아 공사 대금 2,500만 원을 조건 없이 기부했습니다." } },
    ]
  },
  {
    id: 3,
    background: "외부에서 마을 소득을 크게 높일 수 있는 새로운 영농 기술을 제안받았습니다.",
    question: "이 기술 도입에서 당신의 역할은?",
    options: [
      { text: "먼저 내 밭에 시범 도입해 위험을 감수하고, 성공하면 이웃들에게 알린다.", type: "LEADER",
        historicalNote: { figure: "새마을지도자 최원규", context: "강원 도원1리", sourceFile: "06_강원도_01_영월군_수주면_도원1리_현대어.md", quote: "기계화 영농을 직접 도입해 가구당 소득을 30만 원에서 170만 원으로 끌어올렸습니다." } },
      { text: "교육에 적극 참여해 기술을 익히고, 배운 것을 이웃들과 나눈다.", type: "VILLAGER",
        historicalNote: { figure: "도원1리 주민들", context: "강원 도원1리", sourceFile: "06_강원도_01_영월군_수주면_도원1리_현대어.md", quote: "지게를 영원히 퇴역시키고 경운기 시대를 열어 마을 전체가 함께 풍요로워졌습니다." } },
      { text: "기술 도입에 필요한 교육 프로그램을 기획하고 외부 강사를 섭외한다.", type: "OFFICIAL",
        historicalNote: { figure: "부녀지도자 엄화자", context: "강원 도원1리", sourceFile: "06_강원도_01_영월군_수주면_도원1리_현대어.md", quote: "절미 저축 운동을 조직해 복지회관을 건립하고 부녀 교육의 거점으로 만들었습니다." } },
      { text: "기술의 장단점과 예상 수익성을 데이터로 분석해 마을에 브리핑한다.", type: "EXPERT",
        historicalNote: { figure: "구담교 기술진", context: "경북 구담교", sourceFile: "02_대규모사업_경북안동군_풍천면_구담교_현대어.md", quote: "전문 분야 입찰 설계로 토지 가치 18억 8천만 원 상승 효과를 만들어냈습니다." } },
    ]
  },
  {
    id: 4,
    background: "마을 총회에서 의견이 충돌하여 분위기가 험악해졌습니다.",
    question: "당신은 어떻게 대처합니까?",
    options: [
      { text: "마을 전체의 발전을 위한 절충안을 강력하게 제시한다.", type: "LEADER",
        historicalNote: { figure: "추진위원장 문학구", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "사기가 바닥에 떨어진 주민들 앞에서 즉석 연설로 불씨를 다시 살렸습니다." } },
      { text: "이웃 간의 공동체 의식을 강조하며 분위기를 부드럽게 풀어낸다.", type: "VILLAGER",
        historicalNote: { figure: "구담 2동 부녀회", context: "경북 구담교", sourceFile: "02_대규모사업_경북안동군_풍천면_구담교_현대어.md", quote: "품앗이와 상부상조 정신으로 분열된 마을을 하나로 묶어냈습니다." } },
      { text: "객관적 중재자로서 회의 규칙을 상기시키고 공정한 발언 기회를 준다.", type: "OFFICIAL",
        historicalNote: { figure: "면장 구재우", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "1,021명의 서명을 조직화해 공식 진정으로 사업을 채택시켰습니다." } },
      { text: "갈등 원인이 된 문제의 정확한 사실과 대안을 냉철하게 제시한다.", type: "EXPERT",
        historicalNote: { figure: "돗재도로 효과 분석", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "42km 우회로가 6km로 단축된 수치 하나가 모든 반대 여론을 잠재웠습니다." } },
    ]
  },
  {
    id: 5,
    background: "새마을 프로젝트가 성공적으로 마무리되었습니다.",
    question: "당신이 가장 뿌듯함을 느끼는 순간은?",
    options: [
      { text: "사람들이 내 비전을 믿고, 끝까지 함께 땀 흘려준 것을 볼 때.", type: "LEADER",
        historicalNote: { figure: "추진위원장 문학구", context: "전남 한천면 돗재도로", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "연인원 45,000명이 234일간 함께 땀 흘려 해발 350m 준령을 뚫었습니다." } },
      { text: "마을이 살기 좋아지고 이웃들의 얼굴에 웃음꽃이 필 때.", type: "VILLAGER",
        historicalNote: { figure: "한천면민 일동", context: "전남 한천면 돗재도로", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "\"피땀 흘려 쌓아 올린 이 영광의 금자탑을 자손만대에 전합니다.\" — 돗재 기념비문" } },
      { text: "행정 지원과 조율이 제 역할을 해 프로젝트가 무사히 완료되었을 때.", type: "OFFICIAL",
        historicalNote: { figure: "화순군수 문병우", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "행정·재정·기술을 총동원한 결과, IBRD 차관 사업으로 정식 전천후 도로가 완성되었습니다." } },
      { text: "내가 기획한 전략대로 오차 없이 완벽한 결과물이 도출되었을 때.", type: "EXPERT",
        historicalNote: { figure: "도급업자 권태영", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "설계·시공·마무리 모두 완벽하게 마감되어 면민들로부터 감사패를 받았습니다." } },
    ]
  },
  {
    id: 6,
    background: "6개월의 공사 끝에 집중호우로 절개지 10,000㎡가 무너졌습니다. 주민들이 주저앉아 울고 있습니다.",
    question: "당신이라면 어떻게 하겠습니까?",
    options: [
      { text: "산봉우리에 천막을 치고 밤새 현장을 지키며, 횃불 야간 재건 작업을 이끈다.", type: "LEADER",
        historicalNote: { figure: "문학구 위원장·금중진 면장", context: "전남 한천면 돗재도로", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "산봉우리 천막에서 밤이슬을 맞으며 현장을 지키고, 수백 개 횃불로 야간 재건을 이끌었습니다." } },
      { text: "주저앉은 주민들 곁에 앉아 함께 울어주고, 손을 잡으며 내일부터 다시 시작하자고 한다.", type: "VILLAGER",
        historicalNote: { figure: "한천면 주민들", context: "전남 한천면 돗재도로", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "기상특보마다 한밤중에도 횃불을 들고 달려나와 장비와 자갈을 함께 지켜냈습니다." } },
      { text: "피해 현황을 집계하여 복구 지원금을 신청하고 긴급 지원을 요청한다.", type: "OFFICIAL",
        historicalNote: { figure: "군수 문병우", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "공사 위기마다 행정 루트를 총동원해 군부대 중장비 지원과 IBRD 차관을 이끌어냈습니다." } },
      { text: "붕괴 원인을 분석하고, 반복되지 않도록 개선된 설계와 공법을 제안한다.", type: "EXPERT",
        historicalNote: { figure: "CAC 사령부", context: "전남 한천면 돗재도로", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "페이로더·에어 콤프레셔·불도저를 투입해 22일간 천운산 암벽 발파를 완수했습니다." } },
    ]
  },
  {
    id: 7,
    background: "마을 개발에 결사반대하는 강경파 주민을 만났습니다.",
    question: "당신의 설득 방식은?",
    options: [
      { text: "말보다는 행동으로 먼저 희생하여 상대방 양심에 호소한다.", type: "LEADER",
        historicalNote: { figure: "새마을지도자 최원규", context: "강원 도원1리", sourceFile: "06_강원도_01_영월군_수주면_도원1리_현대어.md", quote: "대지 100평 선제 기증 → 이창노(150평)·이운세(190평) 연쇄 동참. 희생이 반대를 녹였습니다." } },
      { text: "반대하는 이유를 진심으로 들어주고 공감하며 천천히 관계를 쌓는다.", type: "VILLAGER",
        historicalNote: { figure: "부녀지도자 엄화자", context: "강원 도원1리", sourceFile: "06_강원도_01_영월군_수주면_도원1리_현대어.md", quote: "절미 저축 운동으로 주민 신뢰를 쌓아, 폭력적이던 마을 풍습을 온전히 바꿔냈습니다." } },
      { text: "이해관계를 분석하여 공정한 조건과 절차로 공식 합의를 이끈다.", type: "OFFICIAL",
        historicalNote: { figure: "면장 구재우", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "수백 명의 서명을 정식 진정으로 조직화해 불가능하다던 사업을 정부가 채택하게 만들었습니다." } },
      { text: "반대 근거를 반박할 객관적 데이터와 성공 사례를 체계적으로 제시한다.", type: "EXPERT",
        historicalNote: { figure: "돗재도로 성과 수치", context: "전남 한천면", sourceFile: "01_대규모사업_전남화순군_한천면_돗재도로_현대어.md", quote: "42km→6km 단축, 소득 5.6배 증가. 숫자는 그 어떤 말보다 강력했습니다." } },
    ]
  },
];
const resultsData = {
  LEADER: {
    title: "열정의 불꽃, 솔선수범의 아이콘",
    role: "새마을지도자 (Saemaul Leader)",
    icon: Flag,
    color: "bg-orange-500", lightColor: "bg-orange-50", textColor: "text-orange-600", borderColor: "border-orange-200",
    description: "당신은 아무도 가지 않은 길을 가장 먼저 걷는 개척자입니다. 말보다는 행동으로, 지시보다는 솔선수범으로 사람들의 마음을 움직입니다.",
    traits: ["강력한 추진력", "자기 희생", "비전 제시", "설득의 달인"],
    quote: "뜻이 있는 곳에 반드시 길이 있습니다. 내가 먼저 움직이면 세상이 따라옵니다.",
    representativeFigure: "문학구 추진위원장 · 최원규 새마을지도자",
    representativeContext: "전남 한천면 돗재도로 · 강원 도원1리",
  },
  VILLAGER: {
    title: "함께 걷는 동반자, 공동체의 심장",
    role: "마을주민 (Villager)",
    icon: Users,
    color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-600", borderColor: "border-emerald-200",
    description: "당신은 새마을운동의 가장 강력한 원동력입니다. 이웃과 협력하고 땀 흘려 일하며 기적을 현실로 만드는 진정한 실천가입니다.",
    traits: ["강한 협동심", "성실한 실천", "공동체 의식", "포용력"],
    quote: "백지장도 맞들면 낫습니다. 우리가 조금씩 보태면 못 할 것이 없습니다.",
    representativeFigure: "부녀노인회 유필규 회장 · 의성군 최청웅 동장",
    representativeContext: "경북 구담교 건설",
  },
  OFFICIAL: {
    title: "든든한 지원군, 공정한 중재자",
    role: "공무원 (Public Official)",
    icon: Building,
    color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600", borderColor: "border-blue-200",
    description: "당신은 보이지 않는 곳에서 무대를 세우는 든든한 기둥입니다. 자원을 배분하고 제도를 정비하여 사람들의 열정이 성과로 이어지게 돕습니다.",
    traits: ["체계적 지원", "자원 관리", "공정함", "행정적 조율"],
    quote: "여러분의 열정을 행정으로 든든하게 뒷받침하겠습니다.",
    representativeFigure: "면장 금중진 · 군수 문병우",
    representativeContext: "전남 한천면 돗재도로 개설",
  },
  EXPERT: {
    title: "냉철한 전략가, 지식의 등대",
    role: "전문가 (Expert)",
    icon: Lightbulb,
    color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600", borderColor: "border-purple-200",
    description: "당신은 직관보다는 데이터와 분석을 믿는 지식인입니다. 한정된 자원으로 최고의 효율을 낼 수 있도록 과학적인 해결책을 제시합니다.",
    traits: ["데이터 분석", "효율성 추구", "객관적 시각", "기술적 조언"],
    quote: "정확한 분석과 효율적인 설계가 불가능을 가능으로 바꿉니다.",
    representativeFigure: "도급업자 권태영 · CAC 사령부",
    representativeContext: "전남 한천면 돗재도로 · 경북 구담교",
  },
};

export { questions, resultsData };

