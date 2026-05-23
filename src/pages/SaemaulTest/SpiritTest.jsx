import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronLeft, RefreshCw, Flame, UserCheck, Users, HeartHandshake, Gift, Lightbulb, Sparkles, ChevronRight } from 'lucide-react';

// ── 6대 정신 메타 정보 (전용하 박사 학위논문 및 주민참여 분석 고증 기반) ──
const SPIRIT_META = {
  DILIGENCE: {
    label: '근면',
    role: '성실한 실행가',
    title: '성실함으로 오늘을 일구는 계획적 끈기',
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

// ── 6대 정신 질문 데이터 (학술 고증 및 실천적 가치 극대화 버전) ──
const questions = [
  {
    background: "마을 앞 버려진 공터를 마을 발전을 위해 새로 가꾸기로 했습니다.",
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
    background: "마을의 오랜 고질병인 쓰레기 무단 투기 문제를 해결해야 하는 상황입니다.",
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
    background: "개발도상국에 파견되어 그곳의 주민들이 자립할 수 있도록 도와야 하는 임무를 맡았습니다.",
    question: "현지 주민들에게 전파하고 싶은 새마을 정신의 가장 본질적인 첫 씨앗은 무엇인가요?",
    options: [
      { text: "계획성 있게 부지런히 일하며 남보다 땀을 더 흘려 성실한 생산적 결실을 증명하는 '근면성' 교육", type: "DILIGENCE" },
      { text: "원조에 마냥 의존하지 않고 주체적 자신감을 고취해 필요한 기술 훈련을 자발적으로 수용하고 일어서는 '자조와 주인정신'", type: "SELF_HELP" },
      { text: "개인의 사익을 양보하고 단결된 공동의 이익을 추구하며 분업 능률을 최고조로 창조하는 '상생 협동 정신'", type: "COOPERATION" },
      { text: "자원 배분을 독점하지 않고 물질, 시간 및 자신의 지식과 노하우까지 자발적으로 이웃과 희생적으로 베푸는 '나눔의 미덕'", type: "SHARING" },
      { text: "사회와 이웃을 도우려는 애틋한 이타심과 사랑을 토대로 어떠한 대가 없이 헌신적인 돌봄 서비스를 제공하는 '봉사정신'", type: "SERVICE" },
      { text: "기존의 낙후된 인프라에 갇히지 않고 새로운 융합 기술과 현지 맞춤형 지식 수용을 과감하게 응용·실행하는 '창조적 사고'", type: "CREATION" }
    ]
  },
  {
    background: "마을 브랜드 가치를 높일 새로운 고부가가치 특산품을 개발하려고 합니다.",
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
    background: "예기치 못한 기습 폭우로 인해 마을 안길과 배수로가 망가져 침수되었습니다.",
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
    background: "다가오는 디지털 스마트 공동체 시대를 이끌어갈 리더에게 가장 요구되는 소양은 무엇일까요?",
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

const SpiritTest = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ DILIGENCE: 0, SELF_HELP: 0, COOPERATION: 0, SHARING: 0, SERVICE: 0, CREATION: 0 });
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [resultType, setResultType] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showCover, setShowCover] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);

  const handleOptionClick = (option, idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setTimeout(() => {
      const newScores = { ...scores, [option.type]: scores[option.type] + 1 };
      const newAnswers = [...selectedAnswers, { type: option.type, text: option.text }];

      setSelectedIdx(null);

      if (step < questions.length - 1) {
        setScores(newScores);
        setSelectedAnswers(newAnswers);
        setStep(step + 1);
      } else {
        // 마지막 질문 완료 -> 분석 화면 가동!
        const maxType = Object.keys(newScores).reduce((a, b) => (newScores[a] > newScores[b] ? a : b));
        setPendingResult(maxType);
        setIsAnalyzing(true);
        
        // 4초 후 최종 결과 도출
        setTimeout(() => {
          setScores(newScores);
          setSelectedAnswers(newAnswers);
          setResultType(maxType);
          setIsAnalyzing(false);
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

  const handleBackToLastQuestion = () => {
    if (selectedAnswers.length > 0) {
      const lastAns = selectedAnswers[selectedAnswers.length - 1];
      const newScores = { ...scores, [lastAns.type]: scores[lastAns.type] - 1 };
      const newAnswers = selectedAnswers.slice(0, -1);
      
      setScores(newScores);
      setSelectedAnswers(newAnswers);
      setResultType(null);
      setSelectedIdx(null);
    }
  };

  const resetTest = () => {
    setStep(0);
    setScores({ DILIGENCE: 0, SELF_HELP: 0, COOPERATION: 0, SHARING: 0, SERVICE: 0, CREATION: 0 });
    setSelectedAnswers([]);
    setResultType(null);
    setSelectedIdx(null);
    setShowCover(true);
  };

  const handleShareResult = () => {
    const result = SPIRIT_META[resultType];
    const shareText = `나의 대표 새마을정신은 [${result.label}: ${result.role}]입니다! 학위논문 학술 분석 기반 정밀 테스트에서 당신의 가치관을 확인해보세요. \nhttps://saemaul-sdgs.web.app/saemaul-test`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert("결과가 클립보드에 복사되었습니다! 친구들에게 공유해보세요. 😊");
    });
  };

  // ── 분석 대기 화면 ──
  if (isAnalyzing) {
    const factText = SPIRIT_ANALYZING_FACTS[pendingResult] || "당신의 소중한 답변을 종합하여 대표정신을 탐색하고 있어요!";
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-lg text-center">
          <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col items-center">
            
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />

            <div className="relative mb-8 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center relative z-10 shadow-md bg-white">
                <img src="/mascot.png" alt="Saedaeng-i Mascot" className="w-20 h-20 object-contain" onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} />
              </div>
              <div className="absolute inset-0 w-32 h-32 -ml-2 -mt-2 border-4 border-t-emerald-600 border-r-emerald-600/30 border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <span className="animate-bounce">✨</span> 가치 진단 중...
            </h2>
            <p className="text-sm text-slate-500 font-bold mb-8 tracking-tight">전용하 박사 학위논문 연구 모델을 기반으로 주민참여 요인을 진단하고 있습니다!</p>

            <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-6 relative animate-fade-in">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-50 border-t border-l border-emerald-100 rotate-45" />
              <span className="inline-block bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full mb-3">📚 학위논문 핵심 시사점</span>
              <p className="text-slate-800 text-[14.5px] font-bold leading-relaxed break-keep text-justify">
                "{factText}"
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── 결과 화면 ──
  if (resultType) {
    const result = SPIRIT_META[resultType];
    const Icon = result.icon;

    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
            
            <div className={`bg-gradient-to-br ${result.color} p-12 text-center text-white relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover mix-blend-overlay" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/40 shadow-inner">
                  <Icon size={48} />
                </div>
                <span className="text-white/80 text-xs font-black tracking-[0.2em] uppercase mb-2">나의 대표 새마을정신</span>
                <h1 className="text-4xl md:text-5xl font-black drop-shadow-md mb-3">{result.label}</h1>
                <p className="text-xl md:text-2xl font-medium text-white/90">「{result.role}」</p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <div className="text-center mb-10 border-b border-slate-100 pb-8">
                <h2 className={`text-2xl font-black ${result.textColor} mb-4`}>"{result.title}"</h2>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed text-justify mb-6">{result.description}</p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {result.keywords.map((kw, i) => (
                    <span key={i} className={`px-4 py-1.5 rounded-full text-xs font-black bg-white border-2 ${result.borderColor} ${result.textColor}`}>
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                 <div className={`${result.bgLight} p-6 rounded-3xl border ${result.borderColor} flex flex-col gap-2`}>
                    <span className="text-[10px] font-black uppercase text-slate-400">💡 주민참여 활성화 추천</span>
                    <p className={`text-[13.5px] font-bold ${result.textColor} leading-snug`}>{result.action}</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">🎯 개발도상국 연계 SDG 목표</span>
                    <p className="text-[13.5px] font-bold text-slate-700 leading-snug">{result.matchingSDG}</p>
                 </div>
              </div>

              <div className="mb-10 bg-slate-50/50 p-6 md:p-8 rounded-[32px] border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-6 text-center">정밀 가치 분석 레포트 (주민참여 영향요인 모델)</h3>
                <div className="space-y-5">
                  {Object.keys(SPIRIT_META).map((key) => {
                    const m = SPIRIT_META[key];
                    const score = scores[key];
                    const pct = Math.round((score / questions.length) * 100);
                    const isLeader = key === resultType;
                    const RowIcon = m.icon;

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isLeader ? `bg-gradient-to-br ${m.color} text-white shadow-md` : 'bg-white border border-slate-200 text-slate-400'}`}>
                              <RowIcon size={14} />
                            </div>
                            <span className={`text-[13px] font-black ${isLeader ? m.textColor : 'text-slate-600'}`}>{m.label}</span>
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-400">{pct}%</span>
                        </div>
                        <div className="w-full h-3 bg-white border border-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isLeader ? `bg-gradient-to-r ${m.color}` : 'bg-slate-200'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleShareResult}
                  className="w-full flex items-center justify-center gap-2 py-4.5 rounded-2xl font-black text-white bg-slate-900 hover:bg-black shadow-xl transition-all active:scale-[0.98]"
                >
                  <Sparkles size={18} /> 결과 자랑하기
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBackToLastQuestion}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 ${result.borderColor} ${result.textColor} bg-white hover:${result.bgLight} transition-colors shadow-sm active:scale-[0.98]`}
                  >
                    <ArrowLeft size={16} /> 수정
                  </button>
                  <button
                    onClick={resetTest}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white bg-gradient-to-r ${result.color} hover:opacity-90 shadow-lg transition-all active:scale-[0.98]`}
                  >
                    <RefreshCw size={16} /> 재시도
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={() => navigate('/saemaul-test')}
                  className="py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-xs hover:bg-slate-200 transition-all text-center"
                >
                  테스트 센터
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-xs hover:bg-slate-200 transition-all text-center"
                >
                  홈으로
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── 표지 화면 ──
  if (showCover) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-20 flex items-center">
        <div className="container mx-auto px-6 max-w-2xl">
          
          <button onClick={() => navigate('/saemaul-test')} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green mb-6 font-bold text-sm transition-colors">
            <ArrowLeft size={16} /> 테스트 센터로
          </button>

          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 mb-6">
                  <Sparkles size={12} /> 학술 고증 기반 정신 진단 (공식 개정판)
                </div>
                <h1 className="text-3xl md:text-5xl font-black drop-shadow-lg mb-4">내 안에 숨겨진<br /><span className="text-yellow-300 text-2xl md:text-4xl block mt-1">새마을 정신 6대 가치</span><span className="text-yellow-100/80 text-base md:text-xl font-bold block mt-2">(근면·자조·협동·나눔·봉사·창조)</span></h1>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">전용하 박사 학위논문 주민참여 영향요인 분석을 모델로,<br />주민의 자발적 주체성과 내면적 정신 혁신도를 정밀 진단합니다.</p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <h4 className="text-center text-xs font-black text-slate-400 tracking-wider mb-6">측정하는 6대 핵심 학술 가치</h4>
              <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                {Object.keys(SPIRIT_META).map((key) => {
                  const m = SPIRIT_META[key];
                  const Icon = m.icon;
                  return (
                    <div key={key} className={`rounded-2xl p-3 border ${m.borderColor} ${m.bgLight} flex flex-col items-center`}>
                       <Icon size={22} className={`${m.textColor} mb-1.5`} />
                       <span className={`text-sm font-black ${m.textColor}`}>{m.label}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowCover(false)}
                className="w-full py-5 rounded-2xl bg-saemaul-green hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-saemaul-green/20 transition-colors flex items-center justify-center gap-2"
              >
                테스트 진단 시작하기 <ChevronRight size={20} />
              </button>
              <p className="text-center text-slate-400 text-xs mt-4 font-medium">학위 논문 지표 연계 6문항으로 정밀 진단이 진행됩니다.</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── 진행 화면 ──
  const current = questions[step];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden p-8 md:p-12">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">새마을정신 가치관 측정</h2>
            <p className="text-slate-400 text-sm font-medium">나의 내면에는 어떤 가치가 가장 깊게 자리하고 있을까요?</p>
          </div>

          {/* 프로그레스 바 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-white hover:bg-slate-800 transition-all text-xs font-black border border-slate-200 shadow-sm active:scale-95 bg-white px-3 py-2 rounded-xl"
                  >
                    <ChevronLeft size={14} /> 이전 문항
                  </button>
                )}
                <span className="text-saemaul-green text-xs font-black tracking-widest uppercase">Question {step + 1}</span>
              </div>
              <span className="text-slate-400 text-xs font-bold">{step + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-saemaul-green rounded-full transition-all duration-500" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          {/* 질문 */}
          <div key={step} className="animate-fade-in">
            <div className="bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100 mb-5">
              <p className="text-slate-500 text-sm leading-relaxed font-medium">📜 {current.background}</p>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug mb-8 break-keep">{current.question}</h3>

            <div className="space-y-3">
              {current.options.map((option, index) => {
                const isSelected = selectedIdx === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option, index)}
                    disabled={selectedIdx !== null}
                    className={`w-full text-left px-5 py-4.5 rounded-2xl border-2 text-base transition-all duration-300 group flex items-center gap-4
                      ${isSelected 
                        ? 'border-saemaul-green bg-saemaul-green/5 shadow-md scale-[1.01]' 
                        : 'border-slate-100 hover:border-saemaul-green/30 hover:bg-slate-50'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-saemaul-green' : 'border-slate-200'}`}>
                      <CheckCircle size={14} className={isSelected ? 'text-saemaul-green' : 'text-transparent'} />
                    </div>
                    <span className={`font-bold text-sm md:text-base ${isSelected ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'} break-keep`}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpiritTest;
