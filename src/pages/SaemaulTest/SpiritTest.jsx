import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronLeft, RefreshCw, Flame, UserCheck, Users, HeartHandshake, Gift, Lightbulb, Sparkles, ChevronRight } from 'lucide-react';

// ── 6대 정신 메타 정보 ──
const SPIRIT_META = {
  DILIGENCE: {
    label: '근면',
    role: '땀의 철학자',
    title: '성실함으로 오늘을 일구는 끈기',
    color: 'from-orange-400 to-red-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: Flame,
    description: '당신은 그 어떤 지름길보다 묵묵히 흘리는 땀방울의 가치를 깊게 믿는 분이군요! 매일 성실하게 계획을 실천하며 주어지는 역할에 최선을 다하는 실행력이 돋보입니다.',
  },
  SELF_HELP: {
    label: '자조',
    role: '자립의 개척자',
    title: '내 운명을 스스로 여는 의지',
    color: 'from-sky-400 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    icon: UserCheck,
    description: '당신은 남의 도움을 마냥 기다리기보다 본인의 주관을 믿고 스스로의 힘으로 우뚝 서기를 열망하는 자립심이 매우 투철한 분입니다!',
  },
  COOPERATION: {
    label: '협동',
    role: '화합의 지휘자',
    title: '함께하여 불가능을 깨는 연대',
    color: 'from-emerald-400 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    icon: Users,
    description: '당신은 "백지장도 맞들면 낫다"라는 격언처럼, 개개인의 뛰어남보다 여럿이 함께 소통하고 뭉칠 때 터져 나오는 시너지를 가장 소중히 생각합니다.',
  },
  SHARING: {
    label: '나눔',
    role: '상생의 온정가',
    title: '더불어 행복을 만드는 배려',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-rose-600',
    borderColor: 'border-pink-200',
    icon: HeartHandshake,
    description: '당신은 자신이 거둔 성과를 독점하지 않고 소외된 이웃을 돌아보며 기꺼이 혜택을 분배하고 상생을 지향하는 따뜻한 인류애를 지닌 분입니다.',
  },
  SERVICE: {
    label: '봉사',
    role: '헌신의 수호자',
    title: '대가 없이 세상을 밝히는 빛',
    color: 'from-purple-400 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    icon: Gift,
    description: '당신은 어떤 금전적·물질적 보상 없이도 오직 타인을 위하고 공동체를 이롭게 한다는 순수한 헌신만으로 기꺼이 앞장서는 숭고한 이타심의 소유자입니다.',
  },
  CREATION: {
    label: '창조',
    role: '미래의 설계자',
    title: '디지털 혁신으로 여는 스마트 새마을',
    color: 'from-amber-400 to-yellow-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    icon: Lightbulb,
    description: '당신은 과거의 훌륭한 전통을 존중하면서도 이에 머무르지 않고 최첨단 디지털 도구나 창의적 아이디어를 덧입혀 새로운 가치를 설계하는 선구자적 안목을 가졌습니다.',
  },
};

const SPIRIT_ANALYZING_FACTS = {
  DILIGENCE: "아침 6시마다 동네 곳곳에 쩌렁쩌렁하게 울려 퍼진 '새벽종'을 아시나요? 이 종소리는 잠들어 있던 마을을 깨우고 한국인의 가슴 속에 깊은 근면의 싹을 틔워냈답니다!",
  SELF_HELP: "1970년대 초, 정부가 시멘트 335포대씩만 지급하자 주민들은 자발적으로 모금을 보태고 삽을 들며 수십 배의 기적(큰 교량 건설 등)을 빚어냈습니다. 스스로 돕는 힘이 가장 크네요!",
  COOPERATION: "'백지장도 맞들면 낫다'는 말처럼, 황무지를 옥토로 바꾸고 마을 안길을 넓힌 일등 공신은 주민 전체가 합심해 함께 땀 흘린 '울력'과 협동의 시너지였답니다.",
  SHARING: "옛 조상들이 흉년이나 어려운 이웃을 돕던 온정이 1970년대 저축과 절미(쌀 아끼기) 운동으로 계승되었고, 이는 전 세계와 온기를 나누는 현대적 나눔 정신으로 진화했어요!",
  SERVICE: "이권이나 직함도 없이 새벽부터 비질을 시작하며 묵묵히 동네를 청소했던 새마을부녀회의 자발적 헌신이 있었습니다. 대가 없는 이타심이 바로 우리 사회의 가장 아름다운 윤활유죠.",
  CREATION: "단순히 시키는 노동에 그치지 않고, 비닐하우스 재배법이나 보온 절충 못자리 같은 최신 스마트 영농 기법을 창의적으로 연구하고 재빨리 보급하여 4계절 농업 신화를 만들었답니다!"
};

// ── 6대 정신 질문 데이터 ──
const questions = [
  {
    background: "마을 앞 버려진 공터를 마을 발전을 위해 새로 가꾸기로 했습니다.",
    question: "당신은 이 공터를 어떤 방식으로 가꾸는 것이 가장 바람직하다고 생각하나요?",
    options: [
      { text: "매일 아침 일찍 나와 주민들과 함께 잡초를 뽑고 돌을 고르며 직접 땅을 일군다.", type: "DILIGENCE" },
      { text: "외부의 지원을 바라지 말고, 우리끼리 계획을 세워 주체적인 힘으로 기틀을 다진다.", type: "SELF_HELP" },
      { text: "마을 주민 모두의 지혜와 노동력을 한데 모아 화합하며 공동의 쉼터나 텃밭으로 꾸민다.", type: "COOPERATION" },
      { text: "수확물이 생겼을 때 홀몸 어르신 등 생활이 힘든 취약계층 주민들과 공평하게 나눈다.", type: "SHARING" },
      { text: "나의 개인적 손해가 생기더라도 기꺼이 마을의 공공 복리를 위한 봉사를 자처한다.", type: "SERVICE" },
      { text: "최신 재배 기술과 이색 디자인을 입혀 스마트 관광정원 같은 독창적인 명소로 만든다.", type: "CREATION" }
    ]
  },
  {
    background: "마을의 오랜 고질병인 쓰레기 무단 투기 문제를 해결해야 하는 상황입니다.",
    question: "당신이라면 어떤 접근 방식이 문제 해결의 근본책이라고 보시나요?",
    options: [
      { text: "누가 강요하지 않아도 꾸준하게 주변을 쓸고 닦으며 솔선수범 정직을 실천한다.", type: "DILIGENCE" },
      { text: "단순 관공서 민원에 의존하기보단 마을 사람들의 생각과 생활 습관부터 뜯어고쳐 자립한다.", type: "SELF_HELP" },
      { text: "마을 총회를 열어 주민들과 함께 규칙을 제정하고 당번제를 운영해 뭉친다.", type: "COOPERATION" },
      { text: "분리수거된 재활용 자원을 판매해 마을의 소외층을 위한 나눔 복지 자금으로 쓴다.", type: "SHARING" },
      { text: "생업이 바빠도 순찰대를 자원하여 늦은 밤까지 쓰레기 단속과 미화를 기꺼이 봉사한다.", type: "SERVICE" },
      { text: "지능형 폐기물 감지 센서나 스마트 분리수거 보상 앱을 도입하여 창의적으로 풀어낸다.", type: "CREATION" }
    ]
  },
  {
    background: "개도국에 파견되어 그곳의 주민들이 자립할 수 있도록 도와야 하는 임무를 맡았습니다.",
    question: "현지 주민들에게 전파하고 싶은 새마을 정신의 첫 씨앗은 무엇인가요?",
    options: [
      { text: "무슨 일이든 끝까지 노력하면 열매를 맺는다는 '꾸준한 근면함'의 정신", type: "DILIGENCE" },
      { text: "원조에 의지하지 않고 우리도 일어설 수 있다는 자긍심을 고취하는 '자조의 힘'", type: "SELF_HELP" },
      { text: "분열을 극복하고 하나의 목표를 향해 손을 맞잡고 협업하는 '협동의 정신'", type: "COOPERATION" },
      { text: "한정된 혜택을 강자가 독식하지 않고 전체가 온정을 붓는 '상생의 나눔 정신'", type: "SHARING" },
      { text: "마을 리더가 대가와 지위를 좇지 않고 공동체를 진심으로 사랑하는 '봉사 마인드'", type: "SERVICE" },
      { text: "전통 방식을 초월하여 모바일과 디지털 농업을 심는 '스마트 시대의 창조 역량'", type: "CREATION" }
    ]
  },
  {
    background: "마을 브랜드 가치를 높일 새로운 고부가가치 특산품을 발명하려고 합니다.",
    question: "성공적인 발명을 유도하는 데 가장 결정적인 태도는 무엇입니까?",
    options: [
      { text: "실패해도 물러서지 않고 매일 묵묵히 연구하며 정성껏 시험 재배하는 성실함", type: "DILIGENCE" },
      { text: "대기업이나 도매업자의 횡포에 휘둘리지 않고 우리 고유의 자생 유통력을 개척하는 용기", type: "SELF_HELP" },
      { text: "마을 영농조합을 세워 생산, 보관, 판매까지 모든 가구가 일심동체로 연합하는 것", type: "COOPERATION" },
      { text: "특산품에서 발생한 수익의 일정 부분을 의무적으로 지역 장학회나 기금에 환원하는 구조", type: "SHARING" },
      { text: "내 노하우를 독점해 특허를 내는 대신 마을 발전을 위해 무료로 기술을 봉사 기부하는 것", type: "SERVICE" },
      { text: "SNS 마케팅, 라이브 커머스, 독창적 패키징을 접목해 새 시너지를 뽑아내는 혁신적 아이디어", type: "CREATION" }
    ]
  },
  {
    background: "예기치 못한 기습 폭우로 인해 마을 안길과 배수로가 망가져 침수되었습니다.",
    question: "응급 상황에서 당신이 보일 즉각적인 반응은 무엇일까요?",
    options: [
      { text: "비옷을 입고 즉시 삽을 든 채 비가 그칠 때까지 묵묵히 수로를 파내려가는 행동력", type: "DILIGENCE" },
      { text: "복구 지원단이 도착하길 넋놓고 기다리기 전에 주민들과 우리가 해결할 수 있는 것을 찾는다.", type: "SELF_HELP" },
      { text: "너나 할 것 없이 확성기로 주민들을 소집하여 단체 복구 조를 짜 협업한다.", type: "COOPERATION" },
      { text: "더 큰 수해를 입어 당장 의식주가 곤란한 이웃 가정에 구호 물품과 따뜻한 식사를 나눈다.", type: "SHARING" },
      { text: "온갖 험하고 위태로운 현장 최전선에서도 몸을 아끼지 않고 주민들을 위해 구슬땀을 흘린다.", type: "SERVICE" },
      { text: "미래의 홍수 대비를 위해 드론을 띄워 물줄기를 분석하고 스마트 배수로 구상을 고안한다.", type: "CREATION" }
    ]
  },
  {
    background: "다가오는 디지털 스마트 시대를 선도하는 리더에게 가장 요구되는 소양은 무엇일까요?",
    question: "다음 가치 중 가장 매력적으로 느껴지는 현대인의 자세를 고르세요.",
    options: [
      { text: "흔들림 없는 기본, 변하지 않는 지속적 실행과 꾸준한 정성", type: "DILIGENCE" },
      { text: "누구의 눈치도 보지 않고 자신의 정체성을 스스로 지키고 나아가는 독립성", type: "SELF_HELP" },
      { text: "온·오프라인을 막론하고 갈등을 봉합하여 다수를 포용해 나가는 단합력", type: "COOPERATION" },
      { text: "성장 위주의 경쟁 질서보단 격차를 완화하고 상생하려는 따뜻한 분배 의식", type: "SHARING" },
      { text: "나의 특별한 전문 지식과 시간을 비영리로 전수하고 선한 영향력을 주는 삶", type: "SERVICE" },
      { text: "불가능해 보이는 판을 완전히 뒤엎는 창의력과 과감한 디지털 트랜스포메이션", type: "CREATION" }
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
        
        // 4초 후 최종 커밋
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
      // step was already questions.length - 1 when result triggered, so we just clear the state
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

  // ── 분석 대기 화면 ──
  if (isAnalyzing) {
    const factText = SPIRIT_ANALYZING_FACTS[pendingResult] || "당신의 소중한 답변을 종합하여 대표정신을 탐색하고 있어요!";
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-lg text-center">
          <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col items-center">
            
            {/* 백그라운드 글로우 효과 */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />

            {/* 뱅글뱅글 로더 */}
            <div className="relative mb-8 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center relative z-10 shadow-md bg-white">
                <img src="/mascot.png" alt="Saedaeng-i Mascot" className="w-20 h-20 object-contain" />
              </div>
              <div className="absolute inset-0 w-32 h-32 -ml-2 -mt-2 border-4 border-t-emerald-600 border-r-emerald-600/30 border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <span className="animate-bounce">✨</span> 분석 중입니다...
            </h2>
            <p className="text-sm text-slate-500 font-bold mb-8 tracking-tight">새댕이가 당신의 소중한 정신 가치들을 진단하는 중이에요!</p>

            {/* 새댕이 말풍선 */}
            <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-6 relative animate-fade-in">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-50 border-t border-l border-emerald-100 rotate-45" />
              <span className="inline-block bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full mb-3">💡 새댕이의 한마디</span>
              <p className="text-slate-800 text-[15px] font-bold leading-relaxed break-keep">
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
            
            {/* 결과 헤더 */}
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
                <p className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{result.description}</p>
              </div>

              {/* 분석 분포 바 */}
              <div className="mb-10">
                <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 text-center">나의 6대 정신 분석 차트</h3>
                <div className="space-y-4">
                  {Object.keys(SPIRIT_META).map((key) => {
                    const m = SPIRIT_META[key];
                    const score = scores[key];
                    const pct = Math.round((score / questions.length) * 100);
                    const isLeader = key === resultType;
                    const RowIcon = m.icon;

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLeader ? `bg-gradient-to-br ${m.color} text-white` : 'bg-slate-100 text-slate-400'}`}>
                              <RowIcon size={12} />
                            </div>
                            <span className={`text-sm font-black ${isLeader ? m.textColor : 'text-slate-600'}`}>{m.label}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400">{score}점 / {questions.length}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isLeader ? `bg-gradient-to-r ${m.color}` : 'bg-slate-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

               {/* 버튼 그룹 */}
              <div className="space-y-3 mb-4">
                <button
                  onClick={handleBackToLastQuestion}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 ${result.borderColor} ${result.textColor} bg-white hover:${result.bgLight} transition-colors shadow-sm active:scale-[0.98]`}
                >
                  <ArrowLeft size={20} /> 마지막 답변 수정하기
                </button>
                <button
                  onClick={resetTest}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white bg-gradient-to-r ${result.color} hover:opacity-90 shadow-lg transition-all active:scale-[0.98]`}
                >
                  <RefreshCw size={20} /> 처음부터 다시 시작하기
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/saemaul-test')}
                  className="py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all text-center"
                >
                  목록으로
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all text-center"
                >
                  홈으로 이동
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
                  <Sparkles size={12} /> 새마을정신 가치관 측정 (초안)
                </div>
                <h1 className="text-3xl md:text-5xl font-black drop-shadow-lg mb-4">내 안에 숨겨진<br /><span className="text-yellow-300">새마을 정신 6대 가치</span></h1>
                <p className="text-white/80 text-sm md:text-base">근면·자조·협동의 전통적 가치 위에,<br />현대 사회의 나눔·봉사·창조를 더한 나의 성향 파악</p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <h4 className="text-center text-xs font-black text-slate-400 tracking-wider mb-6">측정하는 6대 핵심 가치</h4>
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
                테스트 초안 시작하기 <ChevronRight size={20} />
              </button>
              <p className="text-center text-slate-400 text-xs mt-4 font-medium">6문항으로 구성되며 3분 내외가 소요됩니다.</p>
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
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">새마을정신 가치 측정</h2>
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
