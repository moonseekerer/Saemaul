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
  BarChart2,
  BookOpen,
  Sword,
  Sparkle,
  User,
  Activity
} from 'lucide-react';

// ── 6대 정신 메타 정보 (전용하 박사 학위논문 및 주민참여 분석 고증 기반) ──
const SPIRIT_META = {
  DILIGENCE: {
    label: '근면',
    role: '성실한 실행가',
    title: '성실함으로 today를 일구는 계획적 끈기',
    color: 'from-orange-400 to-red-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: Flame,
    keywords: ['부지런함', '계획성', '알뜰함', '생산적결실'],
    matchingSDG: 'SDG 8 (양질의 일자리와 경제성장)',
    description: '당신은 자신에게 주어진 맡은 일을 뒤로 미루지 않고 성실하게 계획성 있게 추진하는 탁월한 근면 가치를 실천하는 분입니다! 남보다 더 땀 흘려 부지런히 일하고 성실함을 생활화하며, 노력을 통해 풍성하고 생산적인 결실을 맺는 것 자체를 최고의 미덕으로 삼는 믿음직한 기둥입니다.',
    action: '시간 관리 효율화 및 계획 중심의 프로젝트 설계 또는 장기 자아실현 챌린지에 도전해 보세요!'
  },
  SELF_HELP: {
    label: '자조',
    role: '자립적 개척자',
    title: '내 운명을 스스로 여는 의지와 주인정신',
    color: 'from-sky-400 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    icon: UserCheck,
    keywords: ['자립정신', '주인정신', '자발적훈련', '자기계발'],
    matchingSDG: 'SDG 1 (빈곤 퇴치)',
    description: '당신은 남에게 의존하거나 책임을 전가하지 않으며, 자신의 발전과 기술 향상을 위해 끊임없이 피드백을 수용하는 철저한 자조 정신의 수호자입니다! 당면한 일에 필요한 지식을 습득하기 위해 자발적으로 훈련 및 교육을 받고, 자신감과 주인 의식으로 한계를 돌파하는 적극성을 갖췄습니다.',
    action: '전문성 강화를 위한 자발적 교육 세미나 수강 및 독립 창업 연구 프로젝트를 주도해 보세요!'
  },
  COOPERATION: {
    label: '협동',
    role: '상생의 조율사',
    title: '배려와 연대로 새로운 시너지를 창조하는 단결',
    color: 'from-emerald-400 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    icon: Users,
    keywords: ['상생배려', '공동목표', '분업능률', '단결시너지'],
    matchingSDG: 'SDG 17 (목표 달성을 위한 파트너십)',
    description: '당신은 자신의 개인적인 이익이나 단기적인 편의에 앞서, 공동의 일을 더 잘 수행하고자 우선적으로 노력하는 뛰어난 협동 공동체 정신의 소유자입니다! 뜻을 같이하는 이웃들과 배려하며 단결하고, 철저한 분업 시스템을 통해 일의 생산성과 능률을 창조적으로 높일 줄 아는 지혜로운 화합의 조력자입니다.',
    action: '팀 기반의 지역 문제 해결 워크숍, 해커톤 및 공동체 협동조합 모델 수립에 동참해 보세요!'
  },
  SHARING: {
    label: '나눔',
    role: '상생의 온정가',
    title: '시간과 지식의 온기를 전파하는 희생적 베풂',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-rose-600',
    borderColor: 'border-pink-200',
    icon: HeartHandshake,
    keywords: ['경험공유', '물질정신베풂', '상생배려', '자발적희생'],
    matchingSDG: 'SDG 10 (불평등 완화)',
    description: '당신은 마을과 동료 모두가 함께 풍요롭게 살아가기 위해 자신의 소중한 시간, 물질, 그리고 귀중한 노동력을 아낌없이 기꺼이 내어주는 숭고한 나눔 가치의 주인공입니다! 자원을 양보할 뿐 아니라 자신이 축적한 특수한 지식과 노하우까지 적극적으로 타인과 베풀고 수용하는 상생 포용력이 일품입니다.',
    action: '지역 내 재능 기부 멘토링 활동 또는 서민 금융 지원을 위한 자발적 저축/재정 나눔에 동참해 보세요!'
  },
  SERVICE: {
    label: '봉사',
    role: '이타적 헌신 수호자',
    title: '사랑과 희생으로 세상을 따뜻하게 지탱하는 서비스',
    color: 'from-purple-400 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    icon: Gift,
    keywords: ['이타심', '무보수헌신', '사랑과희생', '지속적돌봄'],
    matchingSDG: 'SDG 3 (건강과 웰빙)',
    description: '당신은 도움이 절실한 이웃을 보살피고 돕는 이타적 실천을 도덕이 아닌 스스로의 고귀한 의무로 여기는 헌신적인 봉사자입니다! 자신의 이해득실이나 이익 추구보다 지속적으로 상대방의 처지에서 배려하고 어려움을 해소할 방법을 성찰하며, 조건 없이 물질적·정신적 서비스를 제공하는 희생정신을 품었습니다.',
    action: '장기 소외 계층 지원 상설 연대 봉사단 활동이나 공익 중심 비영리 캠페인 기획에 주도적으로 참여해 보세요!'
  },
  CREATION: {
    label: '창조',
    role: '융합적 혁신 설계자',
    title: '독창적 아이디어와 지식 수용으로 여는 혁신',
    color: 'from-amber-400 to-yellow-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    icon: Lightbulb,
    keywords: ['새가치융합', '독창적도전', '지식응용', '실정맞춤'],
    matchingSDG: 'SDG 9 (산업, 혁신 및 인프라)',
    description: '당신은 낡고 비효율적인 구태에 머무르지 않고, 주민들의 실질적인 삶의 질 향상을 이끌어내기 위해 새로운 가치를 지속적으로 모색하는 창조의 혁신가입니다! 지역의 실제 실정에 가장 잘 어울리는 새로운 실천 대안을 기획하고, 여러 창의적인 지식과 수단을 포용·수용하여 유연하게 응용하는 안목을 지녔습니다.',
    action: '소셜 벤처 설립, 스마트 농촌 아이디어 마켓플레이스 참여 또는 전통 인프라의 스마트 융합 전환을 리드해 보세요!'
  },
};

const SPIRIT_ANALYZING_FACTS = {
  DILIGENCE: "전용하 박사의 학위논문에 따르면, 개도국 주민참여를 강화하는 첫 단추는 성실성과 알뜰함을 토대로 노력에 따른 정직한 '생산적인 결실'을 주민들이 직접 체득하고 신뢰하게 만드는 근면함의 축적에 있습니다!",
  SELF_HELP: "주민참여 결정 요인 분석 결과, 외부 원조에의 수동적 의존은 주민의 자립 자신감을 해칩니다. 자발적으로 교육을 이수하고 피드백을 수용하여 책임을 다하려는 자조와 주인정신이야말로 빈곤 탈출의 핵심 자산입니다!",
  COOPERATION: "농촌 경제의 효율성을 최고조로 향상시키는 힘은 단결에 있습니다. 개인의 사리사욕을 양보하고 공동 목표에 우선 참여하여, 철저한 분업 시스템과 상생 배려로 단결할 때 가장 지속 가능한 시너지가 창출됩니다.",
  SHARING: "성장의 과실을 독점하지 않고 시간, 물질, 그리고 자신의 귀한 '지식과 경험'까지 이웃과 나누는 자발적 희생인 나눔정신이야말로 공동체 격차를 완화하고 지속 가능한 도약을 완수하는 강력한 원천이 됩니다.",
  SERVICE: "개발도상국 개발을 이끌어 낸 위대한 지도자들은 대가나 보상을 좇지 않고, 타인의 어려움을 덜어주는 일을 고귀한 의무로 여겨 사랑과 사랑에 기반한 무보수 헌신적인 서비스를 기꺼이 실천하는 봉사정신을 갖췄습니다.",
  CREATION: "단순 모방을 넘어 외국의 신기술과 자국 실정을 창의적으로 융합·응용해 내는 창조적(Creation) 자세는, 주민 개개인의 잠재력을 깨우고 장벽에 갇혔던 공동체 삶에 영구한 가치 혁신을 폭발시키는 원동력입니다!"
};

// ── 6대 정신 질문 데이터 (학술 고증 및 일러스트 연동 RPG 시나리오 하이브리드) ──
const questions = [
  {
    image: "/assets/quest_diligence_1.png",
    background: "마을 앞 버려진 공터를 마을 발전을 위해 새로 가꾸기로 했습니다. 주민들의 힘과 노력이 가장 처음 모여야 하는 순간입니다.",
    question: "당신은 이 공터를 어떤 방식으로 가꾸는 것이 가장 바람직하다고 생각하나요?",
    options: [
      { text: "매일 계획을 세워 뒤로 미루지 않고 솔선수범하여 직접 잡초를 뽑고 돌을 고르며 생산적인 결실을 성실하게 일군다.", type: "DILIGENCE" },
      { text: "관공서의 외부 보조에 기대기보다, 필요한 원예 피드백을 주체적으로 학습하고 자발적인 훈련을 거쳐 내 손으로 자립한다.", type: "SELF_HELP" },
      { text: "개인의 이익이나 일보다 마을 공동 목표를 우선하고 주민들과 뜻을 모으는 분업을 통해 능률을 극대화한다.", type: "COOPERATION" },
      { text: "공터 가꾸기에 필요한 노동력과 함께 나만의 유용한 농업 지식과 소중한 경험을 어려운 이웃들과 적극적으로 베풀고 공유한다.", type: "SHARING" },
      { text: "처지가 곤란한 소외 주민을 돕는 것을 나의 의무로 새기고, 대가 없는 희생을 바탕으로 지속적인 자원 봉사를 실천한다.", type: "SERVICE" },
      { text: "마을 실정에 맞는 새로운 아이디어를 도입하고 독창적인 고부가가치 융합 기술을 활용해 스마트 힐링파크를 개척한다.", type: "CREATION" }
    ]
  },
  {
    image: "/assets/quest_self_help_1.png",
    background: "마을의 오랜 고질병인 쓰레기 무단 투기 문제를 해결해야 하는 상황입니다. 남에게 미루기만 해서는 결코 깨끗해질 수 없습니다.",
    question: "당신이라면 어떤 접근 방식이 문제 해결의 근본책이라고 보시나요?",
    options: [
      { text: "매일 아침 일을 미루지 않고 성실하게 마을 주변을 쓸고 닦는 등 계획성 있는 알뜰한 미화를 직접 실천한다.", type: "DILIGENCE" },
      { text: "단순 타인의 시선이나 처벌에 연연하기보다 스스로 책임을 지며 필요한 분리수거 교육을 수용하고 자발적으로 자기 극복을 성취한다.", type: "SELF_HELP" },
      { text: "상생과 배려의 팀워크로 주민 총회를 소집하고 분업 당번 조를 형성해 마을 전체가 공동으로 단결해 나간다.", type: "COOPERATION" },
      { text: "분리수거로 창출된 마을 기금을 단순 보관에 그치지 않고 자발적으로 베풀어 소외 이웃들의 복지 자금으로 공유 환원한다.", type: "SHARING" },
      { text: "도움이 절실한 지역 환경을 지키는 일을 고귀한 의무로 여기고 대가나 개인 이익 없이 야간 순찰과 미화를 도맡아 헌신한다.", type: "SERVICE" },
      { text: "지역 실정에 완벽하게 들어맞는 친환경 AI 분리수거 수거함 등 독창적인 기술과 수단을 창조적으로 도입해 실행한다.", type: "CREATION" }
    ]
  },
  {
    image: "/assets/quest_cooperation_1.png",
    background: "개발도상국에 파견되어 그곳의 주민들이 자립할 수 있도록 도와야 하는 임무를 맡았습니다. 원조만으로는 마을이 바뀌지 않습니다.",
    question: "현지 주민들에게 전파하고 싶은 새마을 정신의 가장 본질적인 첫 씨앗은 무엇인가요?",
    options: [
      { text: "계획성 있게 부지런히 일하며 남보다 땀을 더 흘려 성실한 생산적 결실을 증명하는 '근면성' 교육", type: "DILIGENCE" },
      { text: "원조에 마냥 의존하지 않고 주체적 자신감을 고취해 필요한 기술 훈련을 자발적으로 수용하고 일어서는 '자조와 주인정신'", type: "SELF_HELP" },
      { text: "개인의 사익을 양보하고 단결된 공동의 이익을 추구하며 분업 능률을 최고조로 창조하는 '상생 협동 정신'", type: "COOPERATION" },
      { text: "자원 배분을 독점하지 않고 물질, 시간 및 자신의 지식과 노하우까지 자발적으로 이웃과 희생적으로 베푸는 '나눔의 미덕'", type: "SHARING" },
      { text: "사회와 이웃을 도우려는 애틋한 이타심 and 사랑을 토대로 어떠한 대가 없이 헌신적인 돌봄 서비스를 제공하는 '봉사정신'", type: "SERVICE" },
      { text: "기존의 낙후된 인프라에 갇히지 않고 새로운 융합 기술과 현지 맞춤형 지식 수용을 과감하게 응용·실행하는 '창조적 사고'", type: "CREATION" }
    ]
  },
  {
    image: "/assets/quest_sharing_1.png",
    background: "마을 브랜드 가치를 높일 새로운 고부가가치 특산품을 개발하려고 합니다. 공동체 전체가 번영하기 위해선 상생이 핵심입니다.",
    question: "성공적인 개발을 유도하는 데 가장 결정적인 자세와 태도는 무엇입니까?",
    options: [
      { text: "성실함과 끈기를 바탕으로 뒤로 미루지 않고 계획적인 실험을 끊임없이 반복하여 생산적인 결실을 맺는 것", type: "DILIGENCE" },
      { text: "타지역 카피에 의존하지 않고 자력으로 시장의 한계를 돌파하기 위해 전문 훈련을 자발적으로 찾아가 배우며 자생력을 확보하는 것", type: "SELF_HELP" },
      { text: "공동의 이익을 최우선시하여 생산, 보관, 가공 유통의 전 과정에서 주민들과 마음을 모으는 분업 단결심을 발휘하는 것", type: "COOPERATION" },
      { text: "특산물 판매 수익으로 조성된 자본금과 경험적 노하우를 마을의 취약 가구 생계 안정 및 영농 교육용으로 흔쾌히 공유하는 것", type: "SHARING" },
      { text: "자신이 취득한 독점 특허 지식을 대가 없이 흔쾌히 공공 브랜드를 위해 무료로 기부 봉사하며 지역 발전을 지탱하는 것", type: "SERVICE" },
      { text: "새로운 온라인 마케팅 패러다임과 포장 융합 기술을 독창적으로 결합하여 세상에 없던 고부가가치 브랜드를 응용·도전하는 것", type: "CREATION" }
    ]
  },
  {
    image: "/assets/quest_service_1.png",
    background: "예기치 못한 기습 폭우로 인해 마을 안길과 배수로가 망가져 침수되었습니다. 당장의 복구가 절실한 위기 순간입니다.",
    question: "이 응급 복구 상황에서 당신이 보여줄 즉각적인 반응은 무엇일까요?",
    options: [
      { text: "비옷을 입고 당장 할 수 있는 수로 정비를 계획에 맞춰 신속하게 착수해 한 땀 한 땀 일을 해내며 피해를 최소화하는 성실함", type: "DILIGENCE" },
      { text: "재난 긴급 원조나 행정 당국이 복구해주길 막연하게 기대하기 전, 주민 스스로 자신감을 갖고 극복할 대안을 직접 자발적으로 찾는 것", type: "SELF_HELP" },
      { text: "서로를 배려하며 긴밀하게 뭉쳐 가구별 복구 역할을 철저하게 분업화하고 마을 공동체의 힘을 모아 새로운 재건 동력을 창조하는 것", type: "COOPERATION" },
      { text: "나보다 더 극심한 침수 피해를 입어 고통받는 이웃들에게 개인의 물질, 따뜻한 쉼터, 수해 복구 노하우를 자발적으로 나누고 베푸는 것", type: "SHARING" },
      { text: "수재민 구호를 숭고한 이타적 의무로 자각하고 사랑과 희생을 발휘해 가장 위험하고 지저분한 토사 제거 구역을 자원 봉사하는 것", type: "SERVICE" },
      { text: "마을의 고유 지형과 물길의 흐름을 빠르게 분석해 기존보다 폭우에 3배 이상 안전한 배수로 설계를 창조적으로 고안해 실행하는 것", type: "CREATION" }
    ]
  },
  {
    image: "/assets/quest_creativity_1.png",
    background: "다가오는 디지털 스마트 공동체 시대를 이끌어갈 리더에게 가장 요구되는 소양은 무엇일까요? 관행을 깨는 혁신이 필요합니다.",
    question: "다음 인격적 가치 중 가장 당신에게 매력적으로 느껴지는 리더십을 고르세요.",
    options: [
      { text: "부지런함과 성실함으로 기본 계획을 변함없이 알뜰하게 추진하는 정성과 계획적인 끈기", type: "DILIGENCE" },
      { text: "남에게 휘둘리지 않고 주인정신을 가지며 기술 수용을 위해 끊임없이 자발적 자기 계발을 이어가는 주체성", type: "SELF_HELP" },
      { text: "개인의 독단을 넘어 상생과 배려로 다수 주민들과 뜻을 함께하고 분업 단결을 모으는 공동체 단결 조율력", type: "COOPERATION" },
      { text: "성공을 독차지하지 않고 자신이 가진 물질, 시간뿐 아니라 지식과 가치 있는 경험을 이웃에 자발적으로 기여하고 베푸는 포용력", type: "SHARING" },
      { text: "자신의 이해득실이나 이익 추구에 무관하게 상대방과 공공을 도우려는 애틋한 사랑과 희생으로 서비스를 기여하는 헌신", type: "SERVICE" },
      { text: "낙후된 구태에 머물지 않고 지역 실정에 완벽히 어울리는 새로운 실천 아이디어와 기술 융합을 도전해 실행하는 혁신성", type: "CREATION" }
    ]
  }
];

// ── 중립적인 알파벳 카드 배지 ──
const CARD_LABELS = ['Card A', 'Card B', 'Card C', 'Card D', 'Card E', 'Card F'];

// ── [NEW] 순수 SVG 육각형 방사형 차트 (Radar Chart) 컴포넌트 ──
const RadarChart = ({ scores, isInteractive = false, onLabelHover = () => {} }) => {
  const cx = 150;
  const cy = 150;
  const r = 90;

  const keys = ['DILIGENCE', 'SELF_HELP', 'COOPERATION', 'SHARING', 'SERVICE', 'CREATION'];
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
    const score = scores[key] || 8;
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
    <div className="w-full max-w-[270px] mx-auto animate-fade-in">
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
            className={`text-[13px] font-black cursor-pointer transition-colors duration-200
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
  const [playerClass, setPlayerClass] = useState('Pioneer'); // 기본 클래스
  
  // 질문의 셔플된 보기 저장용 전용 배열 상태
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  
  const [step, setStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  
  // 질문 진행 간 선택 리스트 누적용
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [scores, setScores] = useState({ DILIGENCE: 0, SELF_HELP: 0, COOPERATION: 0, SHARING: 0, SERVICE: 0, CREATION: 0 });

  // 호버 툴팁 상태
  const [hoveredKey, setHoveredKey] = useState(null);
  
  // 최종 결과 상태
  const [resultData, setResultData] = useState(null);

  // ── 진단 시작 전 정보 입력 화면으로 전환 ──
  const startCharacterCreation = () => {
    setCurrentMode('CREATE');
  };

  const startQuestAdventure = () => {
    if (!playerName.trim()) {
      alert("이름 또는 닉네임을 입력해 주세요!");
      return;
    }
    
    // 6개 질문 각각의 options 보기를 무작위로 섞어서 셔플 질문 생성
    const list = questions.map((q) => {
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      return {
        ...q,
        shuffledOptions: shuffled
      };
    });

    setShuffledQuestions(list);
    setSelectedAnswers([]);
    setScores({ DILIGENCE: 0, SELF_HELP: 0, COOPERATION: 0, SHARING: 0, SERVICE: 0, CREATION: 0 });
    setStep(0);
    setCurrentMode('QUEST');
  };

  const handleOptionClick = (option, idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);

    setTimeout(() => {
      const newScores = { ...scores, [option.type]: scores[option.type] + 1 };
      const newAnswers = [...selectedAnswers, { type: option.type, text: option.text }];

      setSelectedIdx(null);
      setScores(newScores);
      setSelectedAnswers(newAnswers);

      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        // 마지막 질문 완료 -> 분석 화면 가동!
        const maxType = Object.keys(newScores).reduce((a, b) => (newScores[a] > newScores[b] ? a : b));
        setPendingResult(maxType);
        setCurrentMode('ANALYZING');
        setIsAnalyzing(true);
        
        // 4초 후 최종 결과 도출
        setTimeout(() => {
          calculateFinalResult(newScores, newAnswers);
          setIsAnalyzing(false);
          setCurrentMode('RESULT');
        }, 4000);
      }
    }, 400);
  };

  const handlePrevStep = () => {
    if (step > 0 && selectedIdx === null) {
      const prevStep = step - 1;
      const lastAns = selectedAnswers[selectedAnswers.length - 1];
      const newScores = { ...scores, [lastAns.type]: scores[lastAns.type] - 1 };
      const newAnswers = selectedAnswers.slice(0, -1);

      setStep(prevStep);
      setScores(newScores);
      setSelectedAnswers(newAnswers);
    }
  };

  // 결과 계산 알고리즘 (6문항 기반으로 하이브리드 고도화)
  const calculateFinalResult = (finalScores, finalAnswers) => {
    const maxKey = Object.keys(finalScores).reduce((a, b) => (finalScores[a] > finalScores[b] ? a : b));
    const maxSpirit = SPIRIT_META[maxKey];

    // 방사형 차트용 10점 만점 스탯 스케일링 보정
    // 0점 -> 2점, 1점 -> 5점, 2점 -> 8점, 3점 이상 -> 10점
    const chartScores = {};
    Object.keys(finalScores).forEach((k) => {
      const s = finalScores[k];
      if (s === 0) chartScores[k] = 2;
      else if (s === 1) chartScores[k] = 5;
      else if (s === 2) chartScores[k] = 8;
      else chartScores[k] = 10;
    });

    const sm1Score = finalScores.DILIGENCE + finalScores.SELF_HELP + finalScores.COOPERATION;
    const sm2Score = finalScores.SHARING + finalScores.SERVICE + finalScores.CREATION;

    // 세대별 밸런스 퍼센트 변환 (최대 6문항이므로 비율 환산)
    const sm1Pct = Math.round((sm1Score / 6) * 100);
    const sm2Pct = Math.round((sm2Score / 6) * 100);

    const archetype = {
      title: maxSpirit.role, // 예: "성실한 실행가"
      sub: maxSpirit.title, // 예: "성실함으로 today를 일구는 계획적 끈기"
      badge: `대표 가치: ${maxSpirit.label}`,
      color: maxSpirit.color,
      textColor: maxSpirit.textColor,
      bgLight: maxSpirit.bgLight,
      desc: maxSpirit.description,
      action: maxSpirit.action,
      matchingSDG: maxSpirit.matchingSDG,
      keywords: maxSpirit.keywords
    };

    setResultData({
      scores: finalScores,
      chartScores,
      sm1Score,
      sm2Score,
      sm1Pct,
      sm2Pct,
      archetype,
      maxKey
    });
  };

  const resetTest = () => {
    setStep(0);
    setScores({ DILIGENCE: 0, SELF_HELP: 0, COOPERATION: 0, SHARING: 0, SERVICE: 0, CREATION: 0 });
    setSelectedAnswers([]);
    setSelectedIdx(null);
    setCurrentMode('COVER');
    setResultData(null);
    setPlayerName('');
  };

  const handleShareResult = () => {
    if (resultData) {
      const { archetype } = resultData;
      const shareText = `[글로벌 새마을정신 진단 결과]\n모험가: ${playerName} (${playerClass === 'Pioneer' ? '마을 개척 전사' : playerClass === 'Healer' ? '상생 온정 힐러' : '스마트 아키텍트'})\n나의 대표 유형: [${archetype.badge}: ${archetype.title}]\n진단 요약: "${archetype.sub}"\n학술 분석 정밀 테스트에 도전해 보세요! \nhttps://saemaul-sdgs.web.app/saemaul-test`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          alert("진단 결과가 클립보드에 복사되었습니다! 친구들에게 공유해보세요. 😊");
        }).catch(() => {
          alert("클립보드 복사에 실패했습니다. 결과창을 캡처해 공유해 보세요!");
        });
      } else {
        alert("이 환경에서는 클립보드 복사를 지원하지 않습니다. 결과창을 캡처해 공유해보세요!");
      }
    }
  };

  // ── 1. 진단 분석 대기 화면 ──
  if (currentMode === 'ANALYZING' && isAnalyzing) {
    const factText = SPIRIT_ANALYZING_FACTS[pendingResult] || "당신의 소중한 답변을 종합하여 대표 가치를 분석하고 있어요!";
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center text-slate-800">
        <div className="container mx-auto px-6 max-w-lg text-center animate-fade-in">
          <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col items-center">
            
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />

            <div className="relative mb-8 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center relative z-10 shadow-md bg-white">
                <img src="/mascot.png" alt="Saedaeng-i Mascot" className="w-20 h-20 object-contain animate-bounce" onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} />
              </div>
              <div className="absolute inset-0 w-32 h-32 -ml-2 -mt-2 border-4 border-t-emerald-600 border-r-emerald-600/30 border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <span className="animate-bounce">✨</span> 가치 진단 중...
            </h2>
            <p className="text-sm text-slate-500 font-bold mb-8 tracking-tight">전용하 박사 학위논문 연구 모델을 기반으로 주민참여 요인을 진단하고 있습니다!</p>

            <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-6 relative animate-fade-in text-left">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-50 border-t border-l border-emerald-100 rotate-45" />
              <div className="text-center">
                <span className="inline-block bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full mb-3">📚 학위논문 핵심 시사점</span>
              </div>
              <p className="text-slate-800 text-[14.5px] font-bold leading-relaxed break-keep text-justify">
                "{factText}"
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── 2. 진단 결과 레포트 화면 (MBTI / Duolingo 스타일) ──
  if (currentMode === 'RESULT' && resultData) {
    const { chartScores, sm1Score, sm2Score, sm1Pct, sm2Pct, archetype, maxKey, scores: finalScores } = resultData;
    const maxSpirit = SPIRIT_META[maxKey];
    const MaxIcon = maxSpirit.icon;

    const isSm1Deficient = sm1Pct < 50;
    const isSm2Deficient = sm2Pct < 50;

    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 text-slate-800 animate-fade-in">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white rounded-[45px] overflow-hidden shadow-2xl border border-slate-100">
            
            {/* 결과 상단 메인 카드 (MBTI 스타일) */}
            <div className={`bg-gradient-to-br ${archetype.color} p-12 text-center text-white relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover mix-blend-overlay animate-pulse" />
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-5 border border-white/30 shadow-inner">
                  <MaxIcon size={40} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black border border-white/30 mb-4 uppercase">
                  {archetype.badge}
                </div>

                <h1 className="text-3xl md:text-4xl font-black drop-shadow-md mb-2 tracking-tight">
                  {playerName} 님의 유형은
                </h1>
                <p className="text-2xl md:text-3xl font-black text-yellow-300 drop-shadow-md">
                  「{archetype.title}」
                </p>
                <p className="text-sm font-mono font-semibold text-white/80 mt-1 uppercase tracking-widest">
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
                <p className="text-slate-700 font-bold text-[15px] leading-relaxed break-keep text-justify">
                  {archetype.desc}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {archetype.keywords.map((kw, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-black bg-white border ${archetype.textColor} border-emerald-100`}>
                      #{kw}
                    </span>
                  ))}
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
                  <RadarChart scores={chartScores} />
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
                        <span className="text-xs font-black font-mono text-slate-550">{sm1Pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                        <div className="h-full bg-emerald-500 animate-pulse" style={{ width: `${sm1Pct}%` }} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">포괄 덕목 : 근면 · 자조 · 협동</p>
                    </div>
                    <p className="text-[12.5px] font-bold text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold break-keep">
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
                        <span className="text-xs font-black font-mono text-slate-550">{sm2Pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                        <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${sm2Pct}%` }} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">포괄 덕목 : 나눔 · 봉사 · 창조</p>
                    </div>
                    <p className="text-[12.5px] font-bold text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-semibold break-keep">
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
                    <ul className="list-disc pl-5 text-[12.5px] font-bold text-slate-650 leading-relaxed space-y-2 break-keep">
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
                  className="py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 hover:text-slate-800 transition-all text-center border border-slate-200 shadow-sm"
                >
                  테스트 선택 센터
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 hover:text-slate-800 transition-all text-center border border-slate-200 shadow-sm"
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
              <p className="text-slate-500 text-xs font-semibold mt-1">질문 전, 메타버스 속에서 활동할 나만의 모험가 신상을 입력하세요.</p>
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
                        ${isClassSelected ? 'bg-saemaul-green text-white border-transparent' : 'bg-white text-slate-400 border-slate-200'}`}>
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

  // ── 4. 게임 표지 화면 ──
  if (currentMode === 'COVER') {
    const hoveredInfo = hoveredKey ? SPIRIT_META[hoveredKey] : null;

    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-20 flex items-center text-slate-800 animate-fade-in">
        <div className="container mx-auto px-6 max-w-2xl">
          
          <button onClick={() => navigate('/saemaul-test')} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green mb-6 font-bold text-sm transition-colors">
            <ArrowLeft size={16} /> 월드 로비로 돌아가기
          </button>

          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-gradient-to-br from-emerald-500 via-teal-700 to-emerald-800 p-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black border border-white/30 mb-2">
                  <BookOpen size={12} className="text-yellow-300 animate-pulse" /> 학술 고증 기반 정신 진단 (공식 개정판)
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white drop-shadow-md">
                  위기의 디지털 마을을 구하라!<br />
                  <span className="text-yellow-300 text-2xl md:text-4xl block mt-3">글로벌 새마을 RPG 진단</span>
                  <span className="text-yellow-100/70 text-[10px] font-mono block mt-1.5 uppercase tracking-widest">[Global Saemaul Spirit TRPG]</span>
                </h1>
                <p className="text-white/85 text-xs md:text-sm leading-relaxed max-w-md mx-auto mt-4 font-semibold break-keep">
                  전용하 박사 학위논문 주민참여 영향요인 분석 모델과 연동하여,<br />
                  나의 내면에 숨겨진 새마을정신 6대 스탯과 밸런스를 정밀 진단합니다.
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
                      scores={{ DILIGENCE: 8, SELF_HELP: 8, COOPERATION: 8, SHARING: 8, SERVICE: 8, CREATION: 8 }} 
                      isInteractive={true}
                      onLabelHover={setHoveredKey}
                    />
                  </div>

                  {/* 마우스 호버 설명 말풍선 툴팁 */}
                  <div className="flex-1 w-full min-h-[140px] flex items-center justify-center">
                    {hoveredInfo ? (
                      <div className="w-full bg-white p-5 rounded-2xl border-2 border-emerald-500/20 shadow-md animate-fade-in relative text-left">
                        <div className="absolute top-4 right-4 text-emerald-500 animate-pulse">✨</div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${hoveredInfo.textColor} ${hoveredInfo.bgLight} border border-emerald-100`}>
                          {hoveredInfo.label} 스탯비급서
                        </span>
                        <h4 className="text-md font-black text-slate-900 mt-2">
                          {hoveredInfo.role} : <span className={hoveredInfo.textColor}>{hoveredInfo.label}</span>
                        </h4>
                        <p className="text-[12px] text-slate-655 font-semibold leading-relaxed mt-2 break-keep">
                          "{hoveredInfo.title}"
                        </p>
                        <p className="text-[11.5px] text-slate-500 leading-snug mt-1 break-keep">
                          {hoveredInfo.description.substring(0, 75)}...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl w-full flex flex-col items-center justify-center gap-2">
                        <span className="text-xl animate-bounce">💡</span>
                        <p className="text-xs font-black text-slate-500 leading-relaxed break-keep">
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
                <p className="text-center text-slate-450 text-[11px] font-mono">6 STAGE QUESTS • PLAY TIME 2 MINS • ACADEMIC RECORD BASED</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── 5. 게임 진행 중 설문 화면 ──
  const current = shuffledQuestions[step] || questions[step];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center animate-fade-in text-slate-800">
      <div className="container mx-auto px-6 max-w-xl">
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden p-8 md:p-11 relative">
          
          <div className="absolute -top-32 -left-32 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* 진행 상단 바 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-saemaul-green text-[11px] font-black tracking-widest uppercase font-mono">QUESTION {step + 1} / 6</span>
              <span className="text-slate-555 text-xs font-mono font-bold">COMPLETED {Math.round((step / 6) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div 
                className="h-full bg-saemaul-green rounded-full transition-all duration-500" 
                style={{ width: `${((step + 1) / 6) * 100}%` }} 
              />
            </div>
          </div>

          {/* 질문 내용 카드 */}
          <div key={step} className="space-y-6 animate-fade-in">
            {/* 상황 지문 */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-150 flex flex-col gap-2 shadow-inner">
              <span className="inline-block self-start text-[9px] font-black text-emerald-600 bg-emerald-100 border border-emerald-200/20 px-2 py-0.5 rounded uppercase tracking-wider">
                QUEST SITUATION
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
              <p className="text-slate-600 text-[13.5px] leading-relaxed break-keep font-semibold text-justify">
                {current.background}
              </p>
            </div>
            
            <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug break-keep">
              💬 {current.question}
            </h3>

            {/* 선택지 행동 카드 (Shuffle 적용 렌더링) */}
            <div className="space-y-2.5">
              {(current.shuffledOptions || current.options).map((option, index) => {
                const isSelected = selectedIdx === index;
                const cardLabel = CARD_LABELS[index];

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option, index)}
                    disabled={selectedIdx !== null}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-300 group flex items-center justify-between
                      ${isSelected
                        ? 'scale-[1.01] shadow-md border-saemaul-green bg-emerald-500/10 text-saemaul-green font-black' 
                        : 'border-slate-100 bg-slate-50 text-slate-650 hover:border-slate-350 hover:bg-slate-100/50'}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* 선택지 배지 배정 */}
                      <div className={`px-2.5 py-1.5 rounded-xl border shrink-0 flex items-center justify-center font-black text-[11px] font-mono transition-all 
                        ${isSelected 
                          ? 'border-saemaul-green bg-saemaul-green text-white' 
                          : 'border-slate-200 bg-white text-slate-400 group-hover:text-slate-600 group-hover:border-slate-300'}`}>
                        {cardLabel}
                      </div>
                      <span className={`font-bold text-[13px] md:text-[13.5px] leading-relaxed transition-colors ${isSelected ? 'text-saemaul-green font-black' : 'text-slate-700 group-hover:text-slate-900'} break-keep`}>
                        {option.text}
                      </span>
                    </div>
                    
                    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all ${isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
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
                QUESTION {step + 1} / 6
              </div>

              <div className="w-20" /> {/* 우측 간격 맞춤용 */}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return null;
};

export default SpiritTest;
