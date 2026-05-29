import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw, 
  Flame, 
  UserCheck, 
  Users, 
  HeartHandshake, 
  Gift, 
  Lightbulb, 
  Sparkles, 
  Award,
  TrendingUp,
  Zap,
  BarChart2,
  BookOpen,
  Sword,
  Shield,
  Layers,
  Sparkle,
  User,
  Activity
} from 'lucide-react';

// ── 6대 정신 스탯 메타 정보 (전통 명칭 고수 및 디테일 보강) ──
const SPIRIT_META = {
  DILIGENCE: {
    label: '근면',
    subLabel: '성실한 실행력 (Diligence)',
    role: '성실한 실행자',
    title: '목표 달성을 위한 꾸준함',
    color: 'from-orange-400 to-red-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: Flame,
    keywords: ['우직한 실행', '정직한 노력', '계획 준수', '성실한 습관'],
    matchingSDG: 'SDG 8 (양질의 일자리와 경제성장)',
    description: '당신은 단기적인 요행을 바라기보다는 매일 묵묵하게 정성스러운 땀방울을 축적하여 성과를 이끌어내는 성실함의 실행자입니다. 어려운 상황 속에서도 약속된 목표에 따라 할 일을 미루지 않고 끈기 있게 수행하는 실천력이 가장 빛나는 최고의 강점입니다.',
    action: '목표를 잘게 나누어 계획을 세우고, 매일 조금씩 꾸준히 실행하는 루틴을 만들어 보세요!'
  },
  SELF_HELP: {
    label: '자조',
    subLabel: '자기주도적 해결력 (Self-Help)',
    role: '주도적 자립가',
    title: '문제를 스스로 해결하는 자조 정신',
    color: 'from-sky-400 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    icon: UserCheck,
    keywords: ['주인의식 각성', '자기주도 해결', '자생적 혁신', '주관적 독립성'],
    matchingSDG: 'SDG 1 (빈곤 퇴치)',
    description: '당신은 다른 사람의 도움을 수동적으로 기다리기 전에, 스스로 문제의 본질을 파악하고 해결책을 주도적으로 모색하는 강인한 개척가입니다. 스스로를 주체적으로 성장시키는 내재적인 동기가 마르지 않는 영혼입니다.',
    action: '스스로의 한계를 넘어서는 30일 자기개발 학습 계획을 선언하고 실행해 보세요!'
  },
  COOPERATION: {
    label: '협동',
    subLabel: '협력과 시너지 (Cooperation)',
    role: '상생의 조율자',
    title: '공동의 성장을 도모하는 연대 의식',
    color: 'from-emerald-400 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    icon: Users,
    keywords: ['공동체 단합', '상생 시너지', '화합의 구심점', '팀워크 극대화'],
    matchingSDG: 'SDG 17 (목표 달성을 위한 파트너십)',
    description: '당신은 개인의 독주나 짧은 성취보다, 전체 구성원의 의견을 조화롭게 연결하여 더 거대한 시너지를 만들어내는 조율자입니다. 이웃과 팀원의 강점을 융합하여 공동체 전체의 연대와 협력을 이끌어내는 힘을 가지고 있습니다.',
    action: '여러 의견이 대립하는 갈등 상황에서 서로 조율하여 최적의 대안을 도출하는 토론의 리더가 되어 보세요!'
  },
  SHARING: {
    label: '나눔',
    subLabel: '가치 공유와 나눔 (Sharing)',
    role: '온정적 나눔가',
    title: '경험과 자원을 기꺼이 공유하는 태도',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-rose-600',
    borderColor: 'border-pink-200',
    icon: HeartHandshake,
    keywords: ['지식 공유', '가치 분배', '동반 성장', '격차 해소'],
    matchingSDG: 'SDG 10 (불평등 완화)',
    description: '당신은 자신이 거둔 성취나 지식의 비법을 독점하여 나만 이득을 챙기기보단, 이웃들과 기꺼이 공유하고 나누어 전체적인 성장 격차를 해소하고자 하는 따뜻한 전파자입니다. 타인과 함께 성장하고자 하는 동반성장 마인드가 투철하군요.',
    action: '내가 쌓은 핵심 노하우나 가이드라인을 동료들과 자유롭게 나눌 수 있도록 아카이브를 구성해 보세요!'
  },
  SERVICE: {
    label: '봉사',
    subLabel: '이타적 봉사 (Service)',
    role: '이타적 헌신가',
    title: '타인을 배려하고 헌신하는 따뜻함',
    color: 'from-purple-400 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    icon: Gift,
    keywords: ['이타적 헌신', '사명감 발휘', '솔선수범', '사회적 기여'],
    matchingSDG: 'SDG 3 (건강과 웰빙)',
    description: '당신은 눈앞에 주어지는 보상이나 대가가 없을지라도, 도움이 필요한 이웃이나 취약한 공동체 구성원들을 돕기 위해 기꺼이 솔선수범하는 이타적인 리더입니다. 당신의 헌신은 우리 공동체를 따뜻하게 연결하는 훌륭한 윤활유입니다.',
    action: '이웃 돌봄과 사회적 배려 대상을 돕기 위한 지속적인 사회 공헌 활동이나 서포터즈에 참여해 보세요!'
  },
  CREATIVITY: {
    label: '창조',
    subLabel: '창의적 문제해결 (Creativity)',
    role: '창의적 혁신가',
    title: '새로운 변화를 시도하는 창조 정신',
    color: 'from-amber-400 to-yellow-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    icon: Lightbulb,
    keywords: ['창의적 대안', '프로세스 혁신', '스마트 자동화', '도전 정신'],
    matchingSDG: 'SDG 9 (산업, 혁신 및 인프라)',
    description: '당신은 기존의 불필요한 관행이나 비효율적인 수작업을 그냥 참아내기보다는, 반짝이는 창의력과 스마트 도구들을 활용하여 혁신적인 대안을 찾아내는 창조적인 해결사입니다. 기성의 가치에 새로운 가능성을 결합해내는 능력이 탁월합니다.',
    action: '비효율적인 반복 업무나 수작업 루틴을 스마트 도구를 활용해 단번에 개선하는 혁신적 프로젝트를 직접 기획해 보세요!'
  },
};

const SPIRIT_ANALYZING_FACTS = [
  "제출하신 선택지와 행동 패턴 데이터를 신중하게 분석하고 있습니다...",
  "글로벌 새마을정신 6대 핵심 덕목에 대한 가치관 성향을 점검하고 있습니다.",
  "전통적 가치와 현대적 혁신 가치의 융합 밸런스를 측정하는 중입니다.",
  "당신의 성향에 가장 잘 부합하는 행동 유형 리포트를 생성하고 있습니다..."
];

// ── TRPG 게이미피케이션 12개 퀘스트 데이터 ──
const questions = [
  {
    id: 1,
    category: "DILIGENCE",
    image: "/assets/quest_diligence_1.png",
    background: "아침 6시, 당신이 살고 있는 마을의 입구에 어젯밤 폭풍우가 쓸고 간 흔적이 가득합니다. 거대한 잡초 더미와 진흙 덩어리가 좁은 골목길을 완전히 봉쇄했고, 출퇴근해야 하는 주민들과 아이들이 발만 동동 구르고 있습니다. 혼자서는 감당하기 어렵고, 누군가의 첫 삽이 필요한 바로 그 순간입니다.",
    question: "신참 체인지메이커로서 당신이 장착할 첫 행동 카드는 무엇인가요?",
    options: [
      { value: 5, label: "즉시 마을 단톡방에 '지금 당장 같이 치웁시다!'를 외치고, 구역을 나눠 정밀하게 계획한 뒤 삽을 들고 맨 앞줄에서 흙더미를 공략한다." },
      { value: 4, label: "지치지 않도록 적당히 페이스를 유지하며, 오전 안으로 자기 구역을 깨끗하게 정리하는 성실한 청소 플랜을 묵묵히 수행한다." },
      { value: 3, label: "이웃 주민들이 먼저 나와 빗자루를 들기 시작하면 자연스럽게 동참하며 평균 수준의 기여도를 유지한다." },
      { value: 2, label: "기력이 센 이웃이 먼저 해결해 주겠지 싶어, 다치지 않는 선에서 현장을 살짝 관망하며 타이밍을 재고 있다." },
      { value: 1, label: "내일 낮에 해도 늦지 않다고 스스로를 설득하며, 따뜻한 이불 속에서 오늘의 모험을 조용히 뒤로 미룬다." }
    ]
  },
  {
    id: 2,
    category: "DILIGENCE",
    image: "/assets/quest_diligence_2.png",
    background: "당신은 3개월 전, 지역 소상공인들의 매출을 높여주겠다는 꿈을 품고 '동네 가게 살리기 앱'을 개발하기 시작했습니다. 그런데 지금, 앱은 완성되었지만 사용자가 좀처럼 늘지 않고 유료 전환도 감감무소식입니다. 주변 지인들은 슬슬 '그냥 접어'라고 속삭이기 시작하고, 당신 자신도 그 말이 점점 솔깃하게 들립니다.",
    question: "포기하고 싶은 유혹이 한계에 달한 이 순간, 당신이 꺼내들 카드는?",
    options: [
      { value: 5, label: "성과 없는 날이 100일을 넘어도 흔들리지 않는다. 처음 세운 로드맵 위의 핵심 태스크를 매일 착실히 완수하며 장기전을 선언한다." },
      { value: 4, label: "처음 스스로와 약속한 일일 개발 루틴을 끝까지 지켜가며, 한 줄의 코드와 한 번의 홍보를 성실하게 이어간다." },
      { value: 3, label: "앱이 완전히 멈추지 않도록 최소한의 유지만 걸어두고, 새로운 트렌드 아이템을 살짝 기웃거려 본다." },
      { value: 2, label: "이 프로젝트에 쏟아부은 에너지가 아깝다고 느끼며, 더 쉬운 기회가 없을까 조심스럽게 탐색하기 시작한다." },
      { value: 1, label: "정신 건강을 지키는 게 우선이라고 합리화하며 프로젝트를 전면 중단하고, 유튜브 추천 알고리즘에 몸을 맡긴다." }
    ]
  },
  {
    id: 3,
    category: "SELF_HELP",
    image: "/assets/quest_self_help_1.png",
    background: "마을 주민 200가구의 유일한 식수원인 공동 모터 우물이 오늘 새벽 갑작스러운 과부하로 완전히 망가졌습니다. 전문 수리 업체는 최소 3일 후에나 올 수 있다고 합니다. 더운 여름날 아이와 노인들이 물 한 방울 없이 버텨야 하는 긴박한 상황, 마을 주민들이 이장 댁 앞에 모여 웅성거리고 있습니다.",
    question: "누군가의 첫 움직임이 절실한 이 위기의 순간, 당신의 행동은?",
    options: [
      { value: 5, label: "탓할 대상을 찾는 건 나중 일! 내 공구함을 들고 우물 배관실로 뛰어들어가 직접 고장 원인부터 파악하고 수리를 시도한다." },
      { value: 4, label: "모터 수리 매뉴얼과 영상을 검색해 스스로 응급처치법을 찾아내고, 주민들을 이끌어 자체적으로 임시 복구를 주도한다." },
      { value: 3, label: "마을에서 기계를 잘 다루는 이웃이 나타나 해결해 주길 내심 기다리며, 필요하면 심부름이라도 돕겠다고 생각한다." },
      { value: 2, label: "애초에 우물 관리를 소홀히 한 이장을 탓하는 주민들과 함께 온라인에 불만 글을 올리며 목소리를 높인다." },
      { value: 1, label: "누군가 결국 고쳐주겠지 싶어, 소란스러운 현장을 피해 가까운 편의점으로 생수를 사러 혼자 빠져나간다." }
    ]
  },
  {
    id: 4,
    category: "SELF_HELP",
    image: "/assets/quest_self_help_2.png",
    background: "마을 커뮤니티 게시판에 흥미로운 공지가 올라왔습니다. 'AI와 스마트 농업을 결합한 차세대 농촌 혁신 기술 세미나'가 이번 주말 단 하루, 두 시간 거리 혁신센터에서 열린다는 소식입니다. 참가비가 만만치 않고, 왕복 4시간에 주말까지 반납해야 하지만 이 분야 최고 전문가들이 강의한다고 합니다.",
    question: "시간과 비용이라는 장벽 앞에서 당신이 선택할 행동은?",
    options: [
      { value: 5, label: "이런 기회는 다시 오지 않는다! 주말 휴식을 미련 없이 포기하고 참가비를 흔쾌히 지불한 뒤 맨 앞자리에 앉겠다고 다짐하며 등록 버튼을 누른다." },
      { value: 4, label: "내 역량에 투자하는 것이 곧 미래를 위한 저축이라고 생각하며, 주말 일정을 조율해 세미나에 참석하고 꼼꼼하게 내용을 기록한다." },
      { value: 3, label: "길드나 마을 협의회에서 비용을 지원하거나 의무 교육으로 지정해 준다면 기꺼이 참석하겠다고 마음먹는다." },
      { value: 2, label: "참석한 다른 주민에게 나중에 핵심 요약 자료를 받아보면 될 것 같아, 피로한 몸을 쉬게 하는 것이 우선이라 여긴다." },
      { value: 1, label: "내 경험과 직관만으로도 충분하다고 자부하며, 새로운 지식에 굳이 시간과 돈을 쏟을 필요가 없다고 판단한다." }
    ]
  },
  {
    id: 5,
    category: "COOPERATION",
    image: "/assets/quest_cooperation_1.png",
    background: "오늘은 마을 연간 계획에서 가장 중요한 날입니다. 오전에는 '개인 사업 계획 발표회'가 열려 우수 발표자에게 후원금이 주어지고, 오후에는 온 마을이 함께 묵은 수로를 청소하는 '공동 환경 정비의 날'이 잡혀있습니다. 공교롭게도 두 일정이 시간이 겹쳐버렸고, 인력이 부족한 공동 작업은 당신의 참여 여부에 따라 진행 여부가 갈립니다.",
    question: "두 가지 중 하나를 선택해야 할 때, 당신의 판단은?",
    options: [
      { value: 5, label: "개인 후원금의 달콤함을 내려놓고, 마을 전체의 생활 환경을 위해 공동 작업의 선봉에 서기로 결단한다." },
      { value: 4, label: "발표회 참석은 최소화하고, 공동 정비에 성실히 합류하여 마을 사람들과 어깨를 나란히 한다." },
      { value: 3, label: "발표회를 마치고 남은 시간에 공동 작업 현장에 잠깐 들러 최소한의 참여 흔적만 남긴다." },
      { value: 2, label: "내 사업 발전이 우선이라고 판단하여 발표회에 전념하고, 공동 작업은 다른 사람들이 해줄 거라 믿는다." },
      { value: 1, label: "마을 수로 따위는 내 관심사가 아니라며, 개인 이익 극대화에만 집중하고 공동 작업을 아예 외면한다." }
    ]
  },
  {
    id: 6,
    category: "COOPERATION",
    image: "/assets/quest_cooperation_2.png",
    background: "당신은 몇 달간의 치열한 연구 끝에 마을 행정 업무의 효율을 10배 높일 수 있는 자동화 툴을 개발했습니다. 마을 전체에 보급하면 모두가 혜택을 보겠지만, 이 노하우를 독점하면 당신만이 마을에서 유일무이한 '디지털 전문가'로 자리매김할 수 있습니다. 바로 그 순간, 옆자리 동료가 밤새 같은 작업을 수작업으로 반복하다가 지쳐 쓰러질 지경이 된 것을 목격했습니다.",
    question: "독점의 유혹과 협동의 가치 사이에서 당신의 선택은?",
    options: [
      { value: 5, label: "개인의 독점적 지위보다 공동체 전체의 성장이 더 값지다! 툴 사용법을 투명하게 공유하고, 직접 동료에게 1:1로 밀착 교육한다." },
      { value: 4, label: "마을 공동 성장을 위해 내가 만든 가이드 문서를 커뮤니티에 공개하고, 누구나 활용할 수 있도록 위키에 올린다." },
      { value: 3, label: "동료가 먼저 도움을 청해오면, 내 경쟁 우위를 크게 해치지 않는 선에서 기본적인 팁 정도만 알려준다." },
      { value: 2, label: "오랜 노력의 결실인 이 툴은 나만의 무기다. 동료가 내 화면을 볼 수 없도록 자리를 옮기고 비밀을 철저히 지킨다." },
      { value: 1, label: "동료에게 일부러 비효율적인 방법을 알려주어 내 독보적인 위치가 흔들리지 않도록 교묘하게 견제한다." }
    ]
  },
  {
    id: 7,
    category: "SHARING",
    image: "/assets/quest_sharing_1.png",
    background: "마을 발전 위원회가 우리 마을의 전통 문화와 농산물을 전 세계에 알리는 '글로벌 새마을 페스티벌'을 처음으로 기획했습니다. 해외 바이어와 외국 방문객들이 100명 넘게 오는 대형 행사인데, 자원봉사자가 턱없이 부족합니다. 문제는 이 행사가 당신이 한 달 전부터 손꼽아 기다리던 가족 여행 날짜와 정확히 겹쳐버렸다는 것입니다.",
    question: "오랫동안 기다려온 개인 약속과 마을 공동 행사 사이에서 당신의 마인드셋은?",
    options: [
      { value: 5, label: "우리 마을의 이름을 세계에 알릴 단 한 번뿐인 기회다! 가족에게 양해를 구하고, 내 기획 역량과 에너지를 행사 운영에 아낌없이 쏟아붓는다." },
      { value: 4, label: "여행 일정을 부분 조정하여, 번역 통역 지원이나 안내 부스 운영 등 도움이 되는 역할로 행사에 기여한다." },
      { value: 3, label: "행사 당일 가족과 함께 관람객으로 방문하여 분위기를 즐기면서, 필요한 곳에 가벼운 도움을 건넨다." },
      { value: 2, label: "내 소중한 가족 시간은 양보할 수 없다고 판단하며, 마을 행사는 자원봉사를 신청한 다른 사람들이 잘 해줄 거라 믿는다." },
      { value: 1, label: "행사 준비 소음과 인파가 우리 가족 여행에 방해된다며 행사 취소를 요청하는 민원 글을 올린다." }
    ]
  },
  {
    id: 8,
    category: "SHARING",
    image: "/assets/quest_sharing_2.png",
    background: "당신이 수년간 직접 개발한 친환경 스마트 수경재배 기술이 마침내 특허 등록에 성공했습니다. 이 기술을 독점하면 라이선스 수익만으로도 평생을 살 수 있을 것입니다. 하지만 마을 한쪽에는 고령화로 기력이 쇠한 어르신 농부들이 고품질 농산물 재배에 어려움을 겪고 있고, 인근 청년 농업인들은 초기 기술 비용 부담 때문에 시작도 못하고 있습니다.",
    question: "독점적 부의 기회와 이웃의 필요 사이에서 당신이 선택할 카드는?",
    options: [
      { value: 5, label: "기술이 진정한 가치를 발하는 것은 더 많은 사람이 쓸 때다! 어르신 농부와 청년 농업인들이 무료로 쓸 수 있도록 기술을 전면 개방한다." },
      { value: 4, label: "함께 잘사는 마을을 꿈꾸며, 주변 동료와 청년 스타트업에게 저렴한 가격 혹은 조건부로 기술을 분배하여 상생을 추구한다." },
      { value: 3, label: "초기 투자금 회수를 충분히 한 뒤, 기술이 어느 정도 보편화될 시점에 맞춰 일부 공개를 슬쩍 검토한다." },
      { value: 2, label: "오직 나만이 이 기술의 수혜자여야 한다고 생각하며, 외부 유출을 막기 위해 특허 보호를 철저히 유지한다." },
      { value: 1, label: "유사 기술을 개발하려는 시도조차 원천 봉쇄하기 위해 소송을 불사하고, 지식 독점 전략을 전면화한다." }
    ]
  },
  {
    id: 9,
    category: "SERVICE",
    image: "/assets/quest_service_1.png",
    background: "밤 10시, 거센 집중호우가 아랫동네를 강타했습니다. 하수구가 막혀 물이 역류하면서 골목 저지대의 집들이 침수 위기에 처했습니다. 마을 재난 대응 단톡방에 '긴급 자원봉사자 구합니다 — 하수구 뚫는 분'이라는 메시지가 울렸습니다. 수당은 당연히 0원, 비는 계속 쏟아지고 있고, 당신은 지금 막 따뜻한 온돌방에서 쉬려던 참이었습니다.",
    question: "편안한 휴식과 이웃의 위기 사이에서 당신이 선택할 카드는?",
    options: [
      { value: 5, label: "지금 내가 움직이지 않으면 아랫동네 이웃들의 집이 물에 잠긴다! 우비와 장화를 챙겨 망설임 없이 빗속으로 뛰어나간다." },
      { value: 4, label: "공동체 안전을 지키는 것이 내 책임이기도 하다고 느끼며, 야간 수해 대응 자원봉사 조에 이름을 올리고 합류한다." },
      { value: 3, label: "동사무소에서 공식적으로 장비와 인력 지원이 이루어진다면, 안전한 구역에 한해 도움을 보태겠다고 생각한다." },
      { value: 2, label: "내 몸이 먼저라는 생각에, 재난 방송을 틀어놓은 채 이불 속에서 상황을 지켜보기로 한다." },
      { value: 1, label: "밤중에 재난 경보 소리가 너무 시끄럽다며 볼륨을 줄여달라는 불만 글을 단톡방에 올린다." }
    ]
  },
  {
    id: 10,
    category: "SERVICE",
    image: "/assets/quest_service_2.png",
    background: "마을 복지 센터에서 충격적인 현황 보고가 나왔습니다. 마을 어르신 주민 중 37%가 스마트폰 사용이 어려워 공공 행정 서비스, 건강 정보 앱, 긴급 연락 시스템에서 완전히 소외되어 있다는 것입니다. 더 나아가 이 분들 중 상당수가 집 안에만 머물며 사회적 고립감을 심각하게 느끼고 있다는 사실도 드러났습니다.",
    question: "이 숨겨진 디지털 소외의 현실을 마주한 당신의 대응 전략은?",
    options: [
      { value: 5, label: "이것이야말로 진짜 체인지메이커의 퀘스트! 어르신 전담 '1:1 디지털 동행 서포터즈'를 즉시 제안하고, 직접 첫 번째 자원봉사자로 나선다." },
      { value: 4, label: "소외된 어르신들을 위한 주 1회 디지털 문해 교육 프로그램에 강사로 자원하여 정기적으로 찾아간다." },
      { value: 3, label: "복지센터의 어르신 지원 모금 계좌에 소액을 정기 후원하여 내가 할 수 있는 최소한의 도움을 실천한다." },
      { value: 2, label: "세상의 모든 불평등을 내가 다 해결할 수는 없다며, 내 일상과 개인 역량 개발에만 집중하기로 한다." },
      { value: 1, label: "어르신 지원 예산이 늘어나면 청년 창업 지원이 줄어든다며, 세대 간 자원 배분 방식에 불만 글을 올린다." }
    ]
  },
  {
    id: 11,
    category: "CREATIVITY",
    image: "/assets/quest_creativity_1.png",
    background: "마을 행정처에 인턴으로 들어온 첫날, 담당자가 두꺼운 서류 더미를 쌓으며 말합니다. '이 엑셀 파일 5만 행짜리 데이터를 양식에 맞게 수작업으로 입력해야 해요. 일주일 드릴게요.' 옆자리 선배들은 이미 수년째 같은 방식으로 이 작업을 반복하고 있고, 아무도 의심하지 않습니다. 하지만 당신의 눈에는 이것이 단순 반복 작업으로만 보입니다.",
    question: "수십 년 이어진 낡은 관행 앞에서 당신이 발휘할 창조적 해법은?",
    options: [
      { value: 5, label: "이 비효율은 반드시 개선되어야 한다! 파이썬 자동화 스크립트를 독학하고 AI 도구를 활용하여, 단 몇 분 만에 작업을 완료하는 시스템을 만들어 제안한다." },
      { value: 4, label: "클라우드 협업 툴과 데이터 자동 변환 기능을 도입해 팀 전체의 업무 방식을 스마트하게 재설계하는 계획서를 작성한다." },
      { value: 3, label: "다른 부서에서 비슷한 작업에 쓰는 보조 도구가 있다고 들어, 그것을 빌려 활용하며 작업 속도를 약간 높인다." },
      { value: 2, label: "새로운 기술을 배우는 데 시간이 너무 걸린다고 생각하며, 관행대로 마우스 클릭과 복사 붙여넣기를 묵묵히 반복한다." },
      { value: 1, label: "수작업이야말로 오류 없는 가장 정직한 방법이라고 믿으며, 자동화 도입 자체를 강하게 반대한다." }
    ]
  },
  {
    id: 12,
    category: "CREATIVITY",
    image: "/assets/quest_creativity_2.png",
    background: "오늘 새벽 4시, 마을 스마트 통합 플랫폼에 전례 없는 사이버 공격이 발생했습니다. 주민 등록 정보, 농업 데이터, 공동 자산 현황이 모두 암호화되어 접근 불가 상태가 됐고, 행정 서비스가 전면 마비되었습니다. 이사회는 긴급 소집 중이고, 현장에 있는 IT 인력은 사실상 당신 혼자입니다.",
    question: "전례 없는 디지털 위기 상황에서 당신이 꺼내들 무기는?",
    options: [
      { value: 5, label: "지금 이 위기가 바로 우리 시스템을 근본적으로 혁신할 기회다! 즉각 대응 TF를 꾸리고, 재발 방지를 위한 분산형 클라우드 아키텍처 전환 계획을 수립하여 이사회에 제안한다." },
      { value: 4, label: "당황하지 않고 침착하게 공격 로그를 역추적하며 피해를 최소화하는 복구 절차를 주도하고, 이번 기회에 재난 대응 프로토콜을 체계화한다." },
      { value: 3, label: "긴급 복구 회의가 소집되면 참석하여, 내가 가진 임시 백업 파일 정도를 공유하며 회의 분위기에 맞춰 협력한다." },
      { value: 2, label: "상황이 너무 복잡하고 두려워 아무것도 손댈 수 없으며, 당직 담당자에게 책임을 돌리며 스트레스를 발산한다." },
      { value: 1, label: "이 혼란 속에서 어차피 내가 할 수 있는 일은 없다며, 아무도 모르게 자리를 피해 버린다." }
    ]
  }
];

// ── 중립적인 알파벳 카드 배지 ──
const CARD_LABELS = ['Card A', 'Card B', 'Card C', 'Card D', 'Card E'];

// ── [NEW] 순수 SVG 육각형 방사형 차트 (Radar Chart) 컴포넌트 (표지 및 결과 공용) ──
const RadarChart = ({ scores, isInteractive = false, onLabelHover = () => {} }) => {
  const cx = 150;
  const cy = 150;
  const r = 90;

  const keys = ['DILIGENCE', 'SELF_HELP', 'COOPERATION', 'SHARING', 'SERVICE', 'CREATIVITY'];
  const labels = ['근면', '자조', '협동', '나눔', '봉사', '창조'];

  const getCoordinates = (index, valueRatio) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    const x = cx + r * valueRatio * Math.cos(angle);
    const y = cy + r * valueRatio * Math.sin(angle);
    return { x, y };
  };

  const guideLevels = [3.3, 6.6, 10];
  const guides = guideLevels.map((lvl) => {
    const points = keys.map((_, i) => {
      const { x, y } = getCoordinates(i, lvl / 10);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  const userPoints = keys.map((key, i) => {
    const score = scores[key] || 8; // 기본 호스팅 시 8점 균형으로 렌더링
    const { x, y } = getCoordinates(i, score / 10);
    return `${x},${y}`;
  }).join(' ');

  const axisLines = keys.map((_, i) => {
    const outer = getCoordinates(i, 1.0);
    return { x1: cx, y1: cy, x2: outer.x, y2: outer.y };
  });

  const axisTexts = labels.map((label, i) => {
    const outer = getCoordinates(i, 1.18);
    let textAnchor = 'middle';
    let dy = '0.35em';

    const angleGrad = i * 60;
    if (angleGrad === 0) {
      dy = '-0.5em';
    } else if (angleGrad === 180) {
      dy = '1em';
    } else if (angleGrad > 0 && angleGrad < 180) {
      textAnchor = 'start';
    } else {
      textAnchor = 'end';
    }

    return { label, key: keys[i], x: outer.x, y: outer.y, textAnchor, dy };
  });

  return (
    <div className="w-full max-w-[270px] mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-auto overflow-visible select-none">
        {/* 가이드 라인 육각형 */}
        {guides.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.2"
            strokeDasharray={idx === 2 ? "0" : "3,3"}
          />
        ))}

        {/* 6대 축선 */}
        {axisLines.map((line, idx) => (
          <line
            key={idx}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />
        ))}

        {/* 유저 스탯 영역 */}
        <polygon
          points={userPoints}
          fill="rgba(16, 185, 129, 0.16)"
          stroke="#10b981"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* 꼭짓점 점 단추 */}
        {keys.map((key, i) => {
          const score = scores[key] || 8;
          const { x, y } = getCoordinates(i, score / 10);
          return (
            <circle
              key={key}
              cx={x}
              cy={y}
              r="5.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer"
              onMouseEnter={() => isInteractive && onLabelHover(key)}
              onMouseLeave={() => isInteractive && onLabelHover(null)}
            />
          );
        })}

        {/* 6대 축 텍스트 (호버 인터랙션 바인딩) */}
        {axisTexts.map((text, idx) => (
          <text
            key={idx}
            x={text.x}
            y={text.y}
            textAnchor={text.textAnchor}
            dy={text.dy}
            className={`text-[13.5px] font-black cursor-pointer transition-colors duration-200
              ${isInteractive ? 'hover:fill-saemaul-green hover:scale-105' : ''} fill-slate-800`}
            onMouseEnter={() => isInteractive && onLabelHover(text.key)}
            onMouseLeave={() => isInteractive && onLabelHover(null)}
          >
            {text.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const SpiritTest = () => {
  const navigate = useNavigate();

  // 진단 상태 모드: 'COVER' | 'CREATE' | 'QUEST' | 'ANALYZING' | 'RESULT'
  const [currentMode, setCurrentMode] = useState('COVER');
  
  // 참여자 정보
  const [playerName, setPlayerName] = useState('');

  // 12개 질문의 셔플된 보기 저장용 전용 배열 상태
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState(Array(12).fill(0));
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingIndex, setAnalyzingIndex] = useState(0);
  
  // 호버 툴팁 상태
  const [hoveredKey, setHoveredKey] = useState(null);
  
  // 최종 결과 상태
  const [resultData, setResultData] = useState(null);

  // 4초 채점 대기 동안 흘러가는 텍스트 연출
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalyzingIndex((prev) => (prev + 1) % SPIRIT_ANALYZING_FACTS.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // ── 진단 시작 전 정보 입력 화면으로 전환 ──
  const startCharacterCreation = () => {
    setCurrentMode('CREATE');
  };

  const startQuestAdventure = () => {
    if (!playerName.trim()) {
      alert("이름 또는 닉네임을 입력해 주세요!");
      return;
    }
    
    // 12개 질문 각각의 options 보기를 무작위로 섞어서 셔플 질문 생성
    const list = questions.map((q) => {
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      return {
        ...q,
        shuffledOptions: shuffled
      };
    });

    setShuffledQuestions(list);
    setResponses(Array(12).fill(0));
    setStep(0);
    setCurrentMode('QUEST');
  };

  const handleLikertSelect = (val, idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);

    setTimeout(() => {
      const nextResponses = [...responses];
      nextResponses[step] = val;
      setResponses(nextResponses);
      setSelectedIdx(null);

      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        // 모든 퀘스트 완료 -> 분석 모드
        setCurrentMode('ANALYZING');
        setIsAnalyzing(true);
        setAnalyzingIndex(0);
        
        setTimeout(() => {
          calculateFinalResult(nextResponses);
          setIsAnalyzing(false);
          setCurrentMode('RESULT');
        }, 4000);
      }
    }, 320);
  };

  const handlePrevStep = () => {
    if (step > 0 && selectedIdx === null) {
      setStep(step - 1);
    }
  };

  const handleNextStep = () => {
    if (step < questions.length - 1 && responses[step] > 0 && selectedIdx === null) {
      setStep(step + 1);
    }
  };

  // 결과 계산 알고리즘
  const calculateFinalResult = (finalResponses) => {
    const spiritScores = {
      DILIGENCE: finalResponses[0] + finalResponses[1],
      SELF_HELP: finalResponses[2] + finalResponses[3],
      COOPERATION: finalResponses[4] + finalResponses[5],
      SHARING: finalResponses[6] + finalResponses[7],
      SERVICE: finalResponses[8] + finalResponses[9],
      CREATIVITY: finalResponses[10] + finalResponses[11],
    };

    const totalScore = Object.values(spiritScores).reduce((acc, curr) => acc + curr, 0);

    const sm1Score = spiritScores.DILIGENCE + spiritScores.SELF_HELP + spiritScores.COOPERATION;
    const sm2Score = spiritScores.SHARING + spiritScores.SERVICE + spiritScores.CREATIVITY;

    let archetype = {
      grade: "",
      title: "",
      sub: "",
      badge: "",
      color: "",
      textColor: "",
      bgLight: "",
      desc: ""
    };

    if (totalScore >= 51) {
      archetype = {
        grade: "Balanced",
        title: "균형 잡힌 올라운더형",
        sub: "Integrated Solution Maker",
        badge: "통합적 체인지메이커 (51~60점)",
        color: "from-amber-500 via-emerald-500 to-teal-600",
        textColor: "text-emerald-700",
        bgLight: "bg-gradient-to-br from-emerald-50 to-teal-50/30 border-emerald-100",
        desc: "당신은 전통적인 공동체 실행력(근면·자조·협동)과 현대적인 상생 혁신(나눔·봉사·창조) 가치를 고루 조화시키며, 주인의식을 발휘해 공동체의 지속 가능한 성장을 스마트하게 이끄는 훌륭한 균형형 리더입니다."
      };
    } else if (totalScore >= 39) {
      archetype = {
        grade: "Active",
        title: "실천형 행동파 개척자",
        sub: "Active Pioneer",
        badge: "주도적 실행자 (39~50점)",
        color: "from-sky-500 to-indigo-600",
        textColor: "text-indigo-700",
        bgLight: "bg-indigo-50/40 border-indigo-100",
        desc: "당신은 강한 주인의식(자조)과 지치지 않는 끈기(근면)를 바탕으로, 공동체의 목표와 당면 과제를 향해 앞장서 돌파하고 실질적인 성과를 일구어내는 훌륭한 실천주의 개척자입니다."
      };
    } else if (totalScore >= 27) {
      archetype = {
        grade: "Collaborative",
        title: "상생형 협력적 조력자",
        sub: "Collaborative Supporter",
        badge: "따뜻한 조율자 (27~38점)",
        color: "from-purple-500 to-pink-500",
        textColor: "text-purple-700",
        bgLight: "bg-purple-50/40 border-purple-100",
        desc: "당신은 이웃에 대한 나눔과 봉사, 협력을 가장 소중한 가치로 여기며 동료들을 돕고 서로 상생하여 공동체의 평화와 화합을 만들어 나가는 따뜻한 공감 조력자입니다."
      };
    } else {
      archetype = {
        grade: "Reflective",
        title: "신중한 사색적 성찰가",
        sub: "Reflective Explorer",
        badge: "신중한 사색가 (12~26점)",
        color: "from-slate-400 to-slate-600",
        textColor: "text-slate-700",
        bgLight: "bg-slate-50 border-slate-200",
        desc: "당신은 성급하게 앞장서기보단 신중하고 차분하게 주어진 상황을 성찰하고, 내실 있는 자기개발과 조용한 지지를 아끼지 않는 깊이 있고 내면이 단단한 탐구자입니다."
      };
    }

    const maxKey = Object.keys(spiritScores).reduce((a, b) => (spiritScores[a] > spiritScores[b] ? a : b));

    setResultData({
      scores: spiritScores,
      totalScore,
      sm1Score,
      sm2Score,
      archetype,
      maxKey
    });
  };

  const resetTest = () => {
    setStep(0);
    setResponses(Array(12).fill(0));
    setSelectedIdx(null);
    setCurrentMode('COVER');
    setResultData(null);
    setPlayerName('');
  };

  const handleShareResult = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `[GSST 글로벌 새마을정신 진단 결과]\n이름: ${playerName}\n진단 유형: ${resultData?.archetype?.title}\n진단 요약: ${resultData?.archetype?.desc}\n테스트 해보기: ${window.location.href}`
      ).then(() => {
        alert("진단 결과가 클립보드에 복사되었습니다! 친구들에게 공유해 보세요.");
      }).catch(err => {
        console.error("복사 실패:", err);
        alert("복사에 실패했습니다. 결과창을 캡처해 공유해 보세요!");
      });
    } else {
      alert("클립보드 복사를 지원하지 않는 환경입니다. 결과창을 캡처해 공유해 보세요!");
    }
  };

  // ── 1. 진단 분석 대기 화면 ──
  if (currentMode === 'ANALYZING' && isAnalyzing) {
    const factText = SPIRIT_ANALYZING_FACTS[analyzingIndex];

    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center text-slate-850">
        <div className="container mx-auto px-6 max-w-lg text-center animate-fade-in">
          <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col items-center">
            
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />

            <div className="relative mb-10 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center relative z-10 shadow-lg bg-white">
                <img src="/mascot.png" alt="Saedaeng-i Mascot" className="w-20 h-20 object-contain" />
              </div>
              <div className="absolute inset-0 w-32 h-32 -ml-2 -mt-2 border-4 border-t-emerald-500 border-r-emerald-500/20 border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-emerald-600 flex items-center justify-center gap-2">
                성향 진단 결과 분석 중...
              </h2>
              <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">참여자 : {playerName}</p>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden border border-slate-200/50">
                <div className="h-full bg-emerald-500 rounded-full animate-progress" />
              </div>
            </div>

            <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 mt-8 text-left font-mono shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ANALYSIS STATUS</span>
              </div>
              <p className="text-emerald-400/95 text-[13px] font-bold leading-relaxed break-all font-mono">
                &gt; {factText}
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── 2. 진단 결과 레포트 화면 (MBTI / Duolingo 스타일) ──
  if (currentMode === 'RESULT' && resultData) {
    const { scores: spiritScores, totalScore, sm1Score, sm2Score, archetype, maxKey } = resultData;
    const maxSpirit = SPIRIT_META[maxKey];
    const MaxIcon = maxSpirit.icon;

    const isSm1Deficient = sm1Score < 18;
    const isSm2Deficient = sm2Score < 18;

    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 text-slate-800">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="bg-white rounded-[45px] overflow-hidden shadow-2xl border border-slate-100">
            
            {/* 결과 상단 메인 카드 (MBTI / Duolingo 스타일의 밝고 격려하는 디자인) */}
            <div className={`bg-gradient-to-br ${archetype.color} p-12 text-center text-white relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover mix-blend-overlay animate-pulse" />
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black border border-white/30 mb-4 uppercase">
                  {archetype.badge}
                </div>

                <h1 className="text-3xl md:text-4xl font-black drop-shadow-md mb-2 tracking-tight">
                  {playerName} 님의 유형은
                </h1>
                <p className="text-2xl md:text-3xl font-black text-yellow-300 drop-shadow-md">
                  「{archetype.title}」
                </p>
                <p className="text-xs font-mono font-bold text-white/80 mt-1 uppercase tracking-widest">
                  {archetype.sub}
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-10">

              {/* 성향 분석 리포트 카드 */}
              <div className={`${archetype.bgLight} rounded-[35px] border p-8 md:p-10 space-y-4 relative overflow-hidden shadow-sm`}>
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl" />
                <h3 className={`text-base font-black ${archetype.textColor} flex items-center gap-2`}>
                  <Sparkle size={18} className="animate-spin text-emerald-600" /> 나의 행동 가치 성향
                </h3>
                <p className="text-slate-700 font-bold text-[15.5px] leading-relaxed break-keep">
                  {archetype.desc}
                </p>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-500 font-mono">
                  <span>종합 성향 점수 (TOTAL SCORE)</span>
                  <span className="text-xl font-black text-slate-800">{totalScore} <span className="text-xs font-medium text-slate-450 font-mono">/ 60점</span></span>
                </div>
              </div>

              {/* 최고의 주도적 핵심 가치 (스탯 특화 뷰) */}
              <div className="bg-slate-50 border border-slate-200/75 rounded-[36px] p-8 md:p-10 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${maxSpirit.color} flex items-center justify-center text-white shadow-lg`}>
                    <MaxIcon size={26} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 tracking-wider block uppercase">나의 시그니처 대표 가치</span>
                    <h3 className={`text-xl font-black text-slate-800`}>
                      {maxSpirit.label} : {maxSpirit.role}
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">클래스 시그니처 슬로건</h4>
                    <p className="text-slate-850 text-[15.5px] font-black">"{maxSpirit.title}"</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">상세 시뮬레이터 리포트</h4>
                    <p className="text-slate-650 text-[14px] leading-relaxed break-keep font-semibold">{maxSpirit.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-1 shadow-sm">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">🎯 연계 글로벌 SDG 마일스톤</span>
                      <span className="text-xs font-black text-slate-700">{maxSpirit.matchingSDG}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-1 shadow-sm">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">💡 권장하는 리더 행동 카드</span>
                      <span className="text-xs font-bold text-slate-600 leading-snug">{maxSpirit.action}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 육각형 방사형 차트 도입 */}
              <div className="bg-white border border-slate-200 rounded-[36px] p-8 md:p-10 shadow-lg space-y-6">
                <div className="text-center pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 flex items-center justify-center gap-2">
                    <BarChart2 size={20} className="text-saemaul-green" /> 6대 덕목 방사형 스탯 차트
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    획득한 스탯의 육각형 성장 밸런스 차트입니다.
                  </p>
                </div>

                <div className="flex items-center justify-center py-2 relative">
                  <RadarChart scores={spiritScores} />
                </div>
              </div>

              {/* 새마을정신 1.0 vs 2.0 세대 밸런스 */}
              <div className="bg-slate-50 border border-slate-200 rounded-[36px] p-8 md:p-10 space-y-6">
                <div className="text-center pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-black text-slate-900 flex items-center justify-center gap-2">
                    <TrendingUp size={20} className="text-saemaul-green" /> 가치 균형 분석 (전통 vs 현대)
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    공동체 실행 가치(1.0)와 현대적 상생 혁신 가치(2.0)의 융합 밸런스 분석입니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 새마을 1.0 */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          공동체 실행 가치 [새마을 1.0]
                        </span>
                        <span className="text-xs font-black font-mono text-slate-500">{sm1Score} / 30</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                        <div className="h-full bg-emerald-500" style={{ width: `${(sm1Score / 30) * 100}%` }} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">포괄 덕목 : 근면 · 자조 · 협동</p>
                    </div>
                    <p className="text-[12.5px] font-bold text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold">
                      문제를 스스로 개척하려는 **주도적 의지(자조)**와 꾸준하게 계획을 실행하는 **성실한 실천력(근면·협동)**을 수치화한 가치 영역입니다.
                    </p>
                  </div>

                  {/* 새마을 2.0 */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse" />
                          현대 상생 혁신 가치 [새마을 2.0]
                        </span>
                        <span className="text-xs font-black font-mono text-slate-500">{sm2Score} / 30</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                        <div className="h-full bg-blue-500" style={{ width: `${(sm2Score / 30) * 100}%` }} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">포괄 덕목 : 나눔 · 봉사 · 창조</p>
                    </div>
                    <p className="text-[12.5px] font-bold text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold">
                      변화하는 현대 사회가 갈구하는 스마트한 **문제해결력(창조)**과 불평등 해소를 위한 **사회적 온정(나눔·봉사)**을 포괄하는 혁신 가치 영역입니다.
                    </p>
                  </div>
                </div>

                {/* 성장 피드백 제안 */}
                {(isSm1Deficient || isSm2Deficient) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      성장을 위한 밸런스 제안
                    </span>
                    <ul className="list-disc pl-5 text-[12.5px] font-bold text-slate-755 leading-relaxed space-y-2">
                      {isSm1Deficient && (
                        <li><strong className="text-amber-800">[공동체 실행 가치 보완 권장] :</strong> 스스로 목표를 세워 실천하는 주체적 역량을 보다 활성화할 수 있습니다. 일상의 사소한 목표부터 주도적으로 계획하고 실행하는 성취 습관을 길러보세요.</li>
                      )}
                      {isSm2Deficient && (
                        <li><strong className="text-amber-800">[현대 상생 혁신 가치 보완 권장] :</strong> 문제의 본질을 더 넓은 시야에서 보고, 스마트한 디지털 도구나 지식 공유를 활용하여 이웃을 이롭게 하고 혁신을 도모하는 방안을 고려해보세요.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* 버튼 그룹 */}
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <button
                  onClick={handleShareResult}
                  className="w-full flex items-center justify-center gap-2 py-4.5 rounded-2xl font-black text-white bg-slate-900 hover:bg-black shadow-xl transition-all active:scale-[0.98]"
                >
                  나의 진단 결과 공유하기
                </button>
                <button
                  onClick={resetTest}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 shadow-lg transition-all active:scale-[0.98]"
                >
                  <RefreshCw size={16} /> 진단 다시 시작하기
                </button>
              </div>

              {/* 하단 단축 내비게이션 */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => navigate('/saemaul-test')}
                  className="py-3.5 rounded-xl bg-slate-100 text-slate-605 font-bold text-xs hover:bg-slate-200 hover:text-slate-800 transition-all text-center border border-slate-250 shadow-sm"
                >
                  테스트 선택 센터
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="py-3.5 rounded-xl bg-slate-100 text-slate-605 font-bold text-xs hover:bg-slate-200 hover:text-slate-800 transition-all text-center border border-slate-250 shadow-sm"
                >
                  메인 월드 로비 (홈)
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── 3. [NEW] 나만의 체인지메이커 캐릭터 생성 스크린 ──
  if (currentMode === 'CREATE') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-20 flex items-center text-slate-800">
        <div className="container mx-auto px-6 max-w-xl animate-fade-in">
          
          <button onClick={() => setCurrentMode('COVER')} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green mb-6 font-bold text-sm transition-colors">
            <ArrowLeft size={16} /> 타이틀 화면으로
          </button>

          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 p-8 md:p-12 space-y-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200/20 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                CHANGE-MAKER BUILDER
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">나만의 아바타 캐릭터 생성</h2>
              <p className="text-slate-550 text-xs font-semibold mt-1">질문 전, 메타버스 속에서 활동할 나만의 모험가 신상을 입력하세요.</p>
            </div>

            {/* 닉네임 입력 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <User size={13} className="text-slate-400" /> 모험가 닉네임 입력
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="예) 홍길동, 에이스개발자"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 font-extrabold focus:border-saemaul-green focus:bg-white transition-all text-[15px] outline-none"
              />
            </div>

            {/* 시그니처 클래스 유형 선택 */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={13} className="text-slate-400" /> 모험가 시그니처 클래스 선택
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Pioneer', name: '마을 개척 전사 (Pioneer)', icon: Sword, desc: '거침없이 흙더미를 치우고 전장을 개척하는 프론트 라이너!' },
                  { id: 'Healer', name: '상생 온정 힐러 (Healer)', icon: HeartHandshake, desc: '아픔을 치유하고 비법 지식을 투명하게 나누는 숲의 수호신!' },
                  { id: 'Architect', name: '스마트 아키텍트 (Architect)', icon: Lightbulb, desc: 'AI와 데이터망으로 비효율적 관행을 파괴하는 디지털 혁신 설계사!' }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isClassSelected = playerClass === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPlayerClass(item.id)}
                      className={`w-full text-left p-4.5 rounded-2xl border-2 transition-all flex items-start gap-4 active:scale-[0.99]
                        ${isClassSelected 
                          ? 'border-saemaul-green bg-emerald-500/10 shadow-md' 
                          : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all
                        ${isClassSelected ? 'bg-saemaul-green text-white border-transparent' : 'bg-white text-slate-450 border-slate-200'}`}>
                        <IconComp size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black transition-colors ${isClassSelected ? 'text-saemaul-green font-black' : 'text-slate-800'}`}>
                          {item.name}
                        </h4>
                        <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed mt-1 tracking-tight">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 시작 버튼 */}
            <button
              onClick={startQuestAdventure}
              className="w-full py-4.5 rounded-2xl bg-saemaul-green hover:bg-emerald-700 text-white font-black text-md shadow-lg shadow-saemaul-green/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              모험의 세계로 포탈 진입 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 4. 게임 표지 화면 (6대 스탯 가이드 방사형 차트 + 호버 툴팁 장착) ──
  if (currentMode === 'COVER') {
    // 호버 키 설명 데이터
    const hoveredInfo = hoveredKey ? SPIRIT_META[hoveredKey] : null;

    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-20 flex items-center text-slate-800">
        <div className="container mx-auto px-6 max-w-2xl animate-fade-in">
          
          <button onClick={() => navigate('/saemaul-test')} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green mb-6 font-bold text-sm transition-colors">
            <ArrowLeft size={16} /> 월드 로비로 돌아가기
          </button>

          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-700 to-emerald-800 p-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black border border-white/30 mb-2">
                  <BookOpen size={12} className="text-yellow-300 animate-pulse" /> RPG 시뮬레이션 스탯 테스트
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white drop-shadow-md">
                  위기의 디지털 마을을 구하라!<br />
                  <span className="text-yellow-300 text-2xl md:text-4xl block mt-3">글로벌 새마을 RPG 진단</span>
                  <span className="text-yellow-100/70 text-[10px] font-mono block mt-1.5 uppercase tracking-widest">[Global Saemaul Spirit TRPG]</span>
                </h1>
                <p className="text-white/85 text-xs md:text-sm leading-relaxed max-w-md mx-auto mt-4 font-semibold">
                  12가지 극적인 시뮬레이션 퀘스트 상황을 내 본연의 의지대로 격파하고,<br />
                  나만의 SS급 전설 칭호와 전리품 무기를 장착해 보세요.
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              {/* 1) 스탯 방사형 차트 영역 */}
              <div className="space-y-4">
                <h4 className="text-center text-xs font-black text-slate-400 tracking-wider uppercase">측정 대상 글로벌 캐릭터 6대 스탯</h4>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-50/60 p-6 rounded-[32px] border border-slate-100 relative">
                  {/* 동적 툴팁 RadarChart */}
                  <div className="shrink-0">
                    <RadarChart 
                      scores={{ DILIGENCE: 8, SELF_HELP: 8, COOPERATION: 8, SHARING: 8, SERVICE: 8, CREATIVITY: 8 }} 
                      isInteractive={true}
                      onLabelHover={setHoveredKey}
                    />
                  </div>

                  {/* 마우스 호버 설명 말풍선 툴팁 */}
                  <div className="flex-1 w-full min-h-[140px] flex items-center justify-center">
                    {hoveredInfo ? (
                      <div className="w-full bg-white p-5 rounded-2xl border-2 border-emerald-500/20 shadow-md animate-fade-in relative">
                        <div className="absolute top-4 right-4 text-emerald-500 animate-pulse">✨</div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${hoveredInfo.textColor} ${hoveredInfo.bgLight} border border-emerald-100`}>
                          {hoveredInfo.label} 스탯비급서
                        </span>
                        <h4 className="text-md font-black text-slate-900 mt-2">
                          {hoveredInfo.role} : <span className={hoveredInfo.textColor}>{hoveredInfo.label}</span>
                        </h4>
                        <p className="text-[12px] text-slate-550 font-semibold leading-relaxed mt-2 break-keep">
                          "{hoveredInfo.title}"
                        </p>
                        <p className="text-[11.5px] text-slate-500 leading-snug mt-1 break-keep">
                          {hoveredInfo.description.substring(0, 75)}...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl w-full flex flex-col items-center justify-center gap-2">
                        <span className="text-xl">💡</span>
                        <p className="text-xs font-black text-slate-450 leading-relaxed">
                          차트 꼭짓점이나 한글 라벨 위에<br />
                          <strong>마우스를 갖다 대면(Hover)</strong> 디테일 설명서가 팝업됩니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 시작 버튼 */}
              <div className="space-y-4">
                <button
                  onClick={startCharacterCreation}
                  className="w-full py-5 rounded-2xl bg-saemaul-green hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-saemaul-green/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  🎮 내 캐릭터 생성하고 시작하기 <ChevronRight size={20} />
                </button>
                <p className="text-center text-slate-450 text-[11px] font-mono">12 STAGE QUESTS • PLAY TIME OVER 3 MINS • AUTO-SAVE ACTIVE</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── 5. 게임 진행 중 설문 화면 ──
  const current = shuffledQuestions[step] || questions[step];
  const hasPreviousResponse = responses[step] > 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center animate-fade-in text-slate-800">
      <div className="container mx-auto px-6 max-w-xl">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden p-8 md:p-11 relative">
          
          <div className="absolute -top-32 -left-32 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* 진행 상단 바 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-saemaul-green text-[11px] font-black tracking-widest uppercase font-mono">QUESTION {step + 1} / 12</span>
              <span className="text-slate-555 text-xs font-mono font-bold">COMPLETED {Math.round((step / 12) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div 
                className="h-full bg-saemaul-green rounded-full transition-all duration-500" 
                style={{ width: `${((step + 1) / 12) * 100}%` }} 
              />
            </div>
          </div>

          {/* 질문 내용 카드 */}
          <div key={step} className="space-y-6 animate-fade-in">
            {/* 상황 지문 */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-150 flex flex-col gap-2 shadow-inner">
              <span className="inline-block self-start text-[9px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200/20 px-2 py-0.5 rounded uppercase tracking-wider">
                SITUATION
              </span>
              {current.image && (
                <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden my-2 border border-slate-200 shadow-sm relative group shrink-0">
                  <img 
                    src={current.image} 
                    alt={`Question ${step + 1} Illustration`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
              <p className="text-slate-600 text-[13.5px] leading-relaxed break-keep font-bold">
                {current.background}
              </p>
            </div>
            
            <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug break-keep">
              💬 {current.question}
            </h3>

            {/* 선택지 행동 카드 (Shuffle 적용 렌더링) */}
            <div className="space-y-2.5">
              {(current.shuffledOptions || current.options).map((scale, index) => {
                const isSelected = selectedIdx === index;
                // 이전 응답 하이라이트 체크 (사용자가 골랐던 실제 value값과 대조)
                const isPreviouslySelected = responses[step] === scale.value; 
                const optionWeight = scale.value;

                // 숫자가 보이지 않게 알파벳 카드 인덱스 매핑 (Card A ~ E)
                const cardLabel = CARD_LABELS[index];

                return (
                  <button
                    key={index}
                    onClick={() => handleLikertSelect(optionWeight, index)}
                    disabled={selectedIdx !== null}
                    className={`w-full text-left px-5 py-4.5 rounded-2xl border-2 transition-all duration-300 group flex items-center justify-between
                      ${isSelected || isPreviouslySelected
                        ? 'scale-[1.01] shadow-md border-saemaul-green bg-emerald-500/10 text-saemaul-green font-black' 
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* 선택지 배지 배정 */}
                      <div className={`px-2.5 py-1.5 rounded-xl border-2 shrink-0 flex items-center justify-center font-black text-[11px] font-mono transition-all 
                        ${isSelected || isPreviouslySelected 
                          ? 'border-saemaul-green bg-saemaul-green text-white' 
                          : 'border-slate-200 bg-white text-slate-400 group-hover:text-slate-600 group-hover:border-slate-300'}`}>
                        {cardLabel}
                      </div>
                      <span className={`font-bold text-[13.5px] leading-relaxed transition-colors ${isSelected || isPreviouslySelected ? 'text-saemaul-green font-black' : 'text-slate-700 group-hover:text-slate-900'} break-keep`}>
                        {scale.label}
                      </span>
                    </div>
                    
                    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all ${isSelected || isPreviouslySelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                      <CheckCircle size={18} className="text-saemaul-green" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 내비게이션 바 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={handlePrevStep}
                disabled={step === 0 || selectedIdx !== null}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all active:scale-95
                  ${step === 0 
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' 
                    : 'border-slate-250 text-slate-600 hover:bg-slate-100 bg-white hover:text-slate-800'}`}
              >
                <ChevronLeft size={15} /> 이전 문항
              </button>
              
              <div className="text-xs font-mono font-bold text-slate-400">
                QUESTION {step + 1} / 12
              </div>

              <button
                onClick={handleNextStep}
                disabled={step === questions.length - 1 || !hasPreviousResponse || selectedIdx !== null}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all active:scale-95
                  ${step === questions.length - 1 || !hasPreviousResponse
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50' 
                    : 'border-saemaul-green text-saemaul-green hover:bg-emerald-50 bg-white'}`}
              >
                다음 문항 <ChevronRight size={15} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SpiritTest;
