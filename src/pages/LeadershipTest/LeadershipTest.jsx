import React, { useState, useEffect } from 'react';
// Link used via navigate for doc routing
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, MessageCircle, BookOpen, Users, Flag, Building, Lightbulb, ChevronRight, RefreshCw, Link as LinkIcon, Scroll, BarChart2, ChevronDown, ChevronLeft } from 'lucide-react';
import { questions, resultsData } from './_data.js';

const TYPE_META = {
  LEADER:   { label: '새마을지도자', labelEn: 'Saemaul Leader', color: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200' },
  VILLAGER: { label: '마을주민',     labelEn: 'Villager',       color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  OFFICIAL: { label: '공무원',       labelEn: 'Public Official', color: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  EXPERT:   { label: '전문가',       labelEn: 'Expert',          color: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
};

const LEADERSHIP_ANALYZING_FACTS = {
  LEADER: "1970년대 새마을지도자들은 오직 '우리 마을도 잘 살아보세'라는 신념으로 급여 없이 밤낮으로 헌신하며 마을 자립을 최전선에서 일구어냈답니다! 당신도 이런 투철한 솔선수범 정신을 지녔군요.",
  LEADER_EN: "In the 1970s, Saemaul Leaders dedicated themselves day and night without pay, driven solely by the conviction 'Let's build a better village!' and spearheaded village self-reliance! You possess this strong spirit of leading by example.",
  VILLAGER: "당시 주민들이 협동하여 손수 넓힌 진입로 총 길이는 무려 43,000km나 됩니다! 지구 한 바퀴를 돌고도 남는 이 엄청난 기적이 오직 '협동'과 단합의 힘으로 일어났다는 사실이 놀랍지 않나요?",
  VILLAGER_EN: "The total length of access roads widened by the villagers' cooperation was 43,000 km! Isn't it amazing that this great miracle, spanning more than the Earth's circumference, happened solely through 'cooperation' and unity?",
  OFFICIAL: "당시 새마을 담당 공무원들은 권위를 벗어던지고 현장에서 마을 사람들과 부대끼며 밤낮없이 시멘트를 나르고 자재 조달을 도왔답니다. 현장에서 완성되는 꼼꼼한 밀착 지원 정신을 닮았어요!",
  OFFICIAL_EN: "At that time, Saemaul public officials cast off their authority and worked hand-in-hand with villagers on site, carrying cement and helping procure materials day and night. You resemble this spirit of meticulous close support finished on the ground!",
  EXPERT: "새마을운동은 막연한 노동을 넘어 학계 연구진과 전문가들이 대거 결합하여 과학적 주택 설계, 정밀 농업 지도, 수자원 개발을 접목한 고도의 '지식형 농촌 스마트 혁신'이었답니다.",
  EXPERT_EN: "Beyond mere manual labor, the Saemaul Movement was a sophisticated 'knowledge-based rural smart innovation' incorporating scientific housing design, precision agricultural guidance, and water resources development with massive scholar and expert participation."
};

const translateHistoricalNote = (note, isEn) => {
  if (!note) return null;
  if (!isEn) return note;

  const figureMap = {
    "새마을지도자 최원규": "Saemaul Leader Choi Won-gyu",
    "의성군 주민 149명": "149 Residents of Uiseong-gun",
    "면장 금중진": "Town Chief Geum Jung-jin",
    "신진토건·CAC 사령부": "Shinjin Construction & CAC Command",
    "대의원 이찬규": "Delegate Lee Chan-gyu",
    "부녀노인회 유필규 회장 외 14명": "Elder Yu Pil-gyu & 14 others",
    "군수 문병우": "Governor Moon Byung-woo",
    "도급업자 권태영": "Contractor Kwon Tae-young",
    "부녀지도자 엄화자": "Women's Leader Eom Hwa-ja",
    "구담교 기술진": "Gudam Bridge Engineers",
    "추진위원장 문학구": "Chairman Moon Hak-gu",
    "구담 2동 부녀회": "Gudam 2-dong Women's Club",
    "면장 구재우": "Town Chief Gu Jae-u",
    "한천면민 일동": "All Hancheon-myeon Residents",
    "화순군수 문병우": "Hwasun Governor Moon Byung-woo",
    "문학구 위원장·금중진 면장": "Chairman Moon & Chief Geum",
    "한천면 주민들": "Hancheon-myeon Residents",
    "돗재도로 성과 수치": "Dotjae Road Performance Data",
    "돗재도로 효과 분석": "Dotjae Road Benefit Analysis",
    "CAC 사령부": "CAC Command"
  };

  const contextMap = {
    "강원 도원1리": "Dowon 1-ri, Gangwon",
    "경북 구담교": "Gudam Bridge, Gyeongbuk",
    "전남 한천면": "Hancheon-myeon, Jeonnam",
    "전남 한천면 돗재도로": "Dotjae Road, Hancheon-myeon, Jeonnam",
    "경북 구담교 건설": "Gudam Bridge Construction, Gyeongbuk"
  };

  const quoteMap = {
    "대지 100평을 먼저 기증하자, 반대하던 이창노 씨가 스스로 150평을 내놓았습니다.": "When I donated 100 pyeong of land first, the opposing Mr. Lee Chang-no voluntarily donated 150 pyeong.",
    "12km나 떨어진 타군 주민들이 '보고만 있을 수 없다'며 삽을 들고 달려왔습니다.": "Residents of another county 12km away rushed over with shovels, saying 'We cannot just watch.'",
    "행정 조율을 통해 IBRD 차관 농로개설 사업 유치에 성공했습니다.": "Succeeded in attracting the IBRD loan agricultural road construction project through administrative coordination.",
    "전문 기술 입찰과 군부대 지원으로 3억 공사를 9천만 원에 완성했습니다.": "Completed a 300 million KRW project for 90 million KRW through professional technical bidding and military support.",
    "사재 300만 원을 쾌척하여 구담교 기공의 불씨를 지폈습니다.": "Donated 3 million KRW of personal wealth to ignite the Gudam Bridge groundbreaking.",
    "평생 모은 관광 적금 15만 원 전액을 기부했습니다. '죽기 전에 다리 놓는 데 보태야 한다'며.": "Donated all 150,000 KRW of lifetime travel savings, saying 'I must contribute to building the bridge before I die.'",
    "추천 2m부터 우리 힘으로 뚫어보자며 면민 대회를 주재해 주민 동참을 이끌었습니다.": "Hosted a town assembly to lead resident participation, saying 'Let's pave from a width of 2m by ourselves!'",
    "폭 2m부터 우리 힘으로 뚫어보자며 면민 대회를 주재해 주민 동참을 이끌었습니다.": "Hosted a town assembly to lead resident participation, saying 'Let's pave from a width of 2m by ourselves!'",
    "손실 위기에서도 주민들의 단결에 감동받아 공사 대금 2,500만 원을 조건 없이 기부했습니다.": "Moved by the unity of residents even amidst risk of loss, unconditionally donated 25 million KRW of construction fees.",
    "기계화 영농을 직접 도입해 가구당 소득을 30만 원에서 170만 원으로 끌어올렸습니다.": "Directly introduced mechanized farming, raising household income from 300,000 KRW to 1.7 million KRW.",
    "지게를 영원히 퇴역시키고 경운기 시대를 열어 마을 전체가 함께 풍요로워졌습니다.": "Retired the A-frame carrier forever and opened the cultivator era, enriching the entire village together.",
    "절미 저축 운동을 조직해 복지회관을 건립하고 부녀 교육의 거점으로 만들었습니다.": "Organized a rice-saving campaign to build a welfare hall and make it a hub for women's education.",
    "전문 분야 입찰 설계로 토지 가치 18억 8천만 원 상승 효과를 만들어냈습니다.": "Created an 1.88 billion KRW land value appreciation effect through specialized bidding design.",
    "사기가 바닥에 떨어진 주민들 앞에서 즉석 연설로 불씨를 다시 살렸습니다.": "Revived the spark with an impromptu speech in front of residents whose morale had hit rock bottom.",
    "품앗이와 상부상조 정신으로 분열된 마을을 하나로 묶어냈습니다.": "Bound the divided village into one with the spirit of mutual help and cooperation.",
    "1,021명의 서명을 조직화해 공식 진정으로 사업을 채택시켰습니다.": "Organized 1,021 signatures to have the project officially adopted through formal petition.",
    "42km 우회로가 6km로 단축된 수치 하나가 모든 반대 여론을 잠재우는 힘을 갖고 있습니다.": "The single figure of shortening a 42km detour to 6km held the power to silence all opposing public opinion.",
    "연인원 45,000명이 234일간 함께 땀 흘려 해발 350m 준령을 뚫었습니다.": "A cumulative 45,000 workers sweated together for 234 days to pierce a 350m-high mountain pass.",
    "\"피땀 흘려 쌓아 올린 이 영광의 금자탑을 자손만대에 전합니다.\" — 돗재 기념비문": '\"We pass this monument of glory, built with blood and sweat, to future generations.\" — Dotjae Monument Inscription',
    "행정·재정·기술을 총동원한 결과, IBRD 차관 사업으로 정식 전천후 도로가 완성되었습니다.": "With administrative, financial, and technical resources mobilized, a formal all-weather road was completed as an IBRD loan project.",
    "설계·시공·마무리 모두 완벽하게 마감되어 면민들로부터 감사패를 받았습니다.": "Perfectly finished in design, construction, and finishing, receiving a plaque of appreciation from the townspeople.",
    "산봉우리에 천막을 치고 밤새 현장을 지키며, 횃불 야간 재건 작업을 이끈다.": "Set up a tent on the hilltop, watched the site all night, and led reconstruction with torches.",
    "산봉우리 천막에서 밤이슬을 맞으며 현장을 지키고, 수백 개 횃불로 야간 재건을 이끌었습니다.": "Protected the site in a mountaintop tent under the night dew, and led night reconstruction with hundreds of torches.",
    "기상특보마다 한밤중에도 횃불을 들고 달려나와 장비와 자갈을 함께 지켜냈습니다.": "Rushed out with torches even in the middle of the night during weather alerts to protect equipment and gravel.",
    "공사 위기마다 행정 루트를 총동원해 군부대 중장비 지원과 IBRD 차관을 이끌어냈습니다.": "Mobilized administrative routes during every construction crisis to secure military heavy equipment and IBRD loans.",
    "대지 100평 선제 기증 → 이창노(150평)·이운세(190평) 연쇄 동참. 희생이 반대를 녹였습니다.": "First donated 100 pyeong of land → consecutive donations of Lee Chang-no (150 pyeong) & Lee Un-se (190 pyeong). Sacrifice melted opposition.",
    "절미 저축 운동으로 주민 신뢰를 쌓아, 폭력적이던 마을 풍습을 온전히 바꿔냈습니다.": "Built trust with the rice-saving campaign, entirely transforming violent village customs.",
    "수백 명의 서명을 정식 진정으로 조직화해 불가능하다던 사업을 정부가 채택하게 만들었습니다.": "Organized signatures of hundreds into a formal petition, making the government adopt a project deemed impossible.",
    "42km→6km 단축, 소득 5.6배 증가. 숫자는 그 어떤 말보다 강력했습니다.": "Detour shortened from 42km to 6km, income increased by 5.6x. Numbers were more powerful than any words.",
    "페이로더·에어 콤프레셔·불도저를 투입해 22일간 천운산 암벽 발파를 완수했습니다.": "Deployed payloader, air compressor, and bulldozer to complete Cheonunsan rock blasting in 22 days."
  };

  return {
    ...note,
    figure: figureMap[note.figure] || note.figure,
    context: contextMap[note.context] || note.context,
    quote: quoteMap[note.quote] || note.quote
  };
};

// ── 점수 분석 패널 ──
const StatsPanel = ({ scores, selectedAnswers }) => {
  const [open, setOpen] = useState(false);
  const total = questions.length;
  const typeOrder = ['LEADER', 'VILLAGER', 'OFFICIAL', 'EXPERT'];

  return (
    <div className="mb-10 rounded-3xl border border-slate-200 overflow-hidden">
      {/* 헤더 (토글) */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BarChart2 size={20} className="text-slate-600" />
          <span className="font-black text-slate-800 text-base">나의 답변 분석</span>
          <span className="text-xs text-slate-400 font-medium">총 {total}문항 결과</span>
        </div>
        <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="p-6 space-y-8 bg-white">
          {/* 1) 유형별 점수 바 */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">유형별 점수</p>
            <div className="space-y-3">
              {typeOrder.map(type => {
                const m = TYPE_META[type];
                const score = scores[type];
                const pct = Math.round((score / total) * 100);
                const isMax = score === Math.max(...typeOrder.map(t => scores[t]));
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-bold ${isMax ? m.text : 'text-slate-500'}`}>
                        {isMax && '👑 '}{m.label}
                      </span>
                      <span className={`text-sm font-black ${isMax ? m.text : 'text-slate-400'}`}>
                        {score} / {total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isMax ? m.color : 'bg-slate-300'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2) 문항별 선택 내역 */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">문항별 선택 내역</p>
            <div className="space-y-3">
              {selectedAnswers.map((ans, i) => {
                const m = TYPE_META[ans.type];
                return (
                  <div key={i} className={`rounded-2xl border ${m.border} ${m.light} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 shrink-0 rounded-full ${m.color} flex items-center justify-center text-white text-xs font-black`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1 font-medium truncate">{questions[i].question}</p>
                        <p className="text-slate-800 text-sm font-bold leading-snug">{ans.text}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${m.color} text-white`}>
                            +1 {m.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 메인 컴포넌트 ──
const LeadershipTest = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  
  // 1) 로컬/세션 스토리지로부터 초기값 불러오기
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('saemaul_test_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [scores, setScores] = useState(() => {
    const saved = sessionStorage.getItem('saemaul_test_scores');
    return saved ? JSON.parse(saved) : { LEADER: 0, VILLAGER: 0, OFFICIAL: 0, EXPERT: 0 };
  });
  
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const saved = sessionStorage.getItem('saemaul_test_answers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [resultType, setResultType] = useState(() => {
    return sessionStorage.getItem('saemaul_test_result') || null;
  });

  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  
  // showCover: 테스트 시작 전 표지 화면 여부 (세션 저장 안 함)
  // 이미 진행 중인 세션(step>0)이거나 결과가 있으면 표지 skip
  const [showCover, setShowCover] = useState(() => {
    const savedResult = sessionStorage.getItem('saemaul_test_result');
    const savedStep = sessionStorage.getItem('saemaul_test_step');
    // 결과 있거나 테스트 진행 중이면 커버 불필요
    return !savedResult && (!savedStep || savedStep === '0');
  });

  // 2) 상태 변화를 감지하여 자동으로 sessionStorage에 저장
  useEffect(() => {
    sessionStorage.setItem('saemaul_test_step', step.toString());
    sessionStorage.setItem('saemaul_test_scores', JSON.stringify(scores));
    sessionStorage.setItem('saemaul_test_answers', JSON.stringify(selectedAnswers));
    if (resultType) {
      sessionStorage.setItem('saemaul_test_result', resultType);
    } else {
      sessionStorage.removeItem('saemaul_test_result');
    }
  }, [step, scores, selectedAnswers, resultType]);

  const handleOptionClick = (option, idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setTimeout(() => {
      const newScores = { ...scores, [option.type]: scores[option.type] + 1 };
      const newAnswers = [...selectedAnswers, {
        type: option.type,
        text: option.text,
        historicalNote: option.historicalNote,
      }];
      
      setSelectedIdx(null);
      
      if (step < questions.length - 1) {
        setScores(newScores);
        setSelectedAnswers(newAnswers);
        setStep(step + 1);
      } else {
        // 마지막 질문 완료 -> 분석 로딩 가동!
        const maxType = Object.keys(newScores).reduce((a, b) => (newScores[a] > newScores[b] ? a : b));
        setPendingResult(maxType);
        setIsAnalyzing(true);
        
        // 4초 대기 후 결과 세팅 및 분석종료
        setTimeout(() => {
          setScores(newScores);
          setSelectedAnswers(newAnswers);
          setResultType(maxType);
          setStep(questions.length);
          setIsAnalyzing(false);
        }, 4000);
      }
    }, 500);
  };

  const handlePrevStep = () => {
    if (step > 0 && selectedIdx === null) {
      const prevStep = step - 1;
      const lastAnswer = selectedAnswers[selectedAnswers.length - 1];
      if (lastAnswer) {
        const newScores = { ...scores, [lastAnswer.type]: scores[lastAnswer.type] - 1 };
        const newAnswers = selectedAnswers.slice(0, -1);
        setStep(prevStep);
        setScores(newScores);
        setSelectedAnswers(newAnswers);
      }
    }
  };

  const handleBackToLastQuestion = () => {
    if (selectedAnswers.length > 0) {
      const lastAnswer = selectedAnswers[selectedAnswers.length - 1];
      const newScores = { ...scores, [lastAnswer.type]: scores[lastAnswer.type] - 1 };
      const newAnswers = selectedAnswers.slice(0, -1);
      setStep(questions.length - 1);
      setScores(newScores);
      setSelectedAnswers(newAnswers);
      setResultType(null);
      setSelectedIdx(null);
    }
  };

  const resetTest = () => {
    setStep(0);
    setScores({ LEADER: 0, VILLAGER: 0, OFFICIAL: 0, EXPERT: 0 });
    setSelectedAnswers([]);
    setResultType(null);
    setSelectedIdx(null);
    setShowCover(true); // 표지로 돌아가기
    // 로컬 캐시 초기화
    sessionStorage.removeItem('saemaul_test_step');
    sessionStorage.removeItem('saemaul_test_scores');
    sessionStorage.removeItem('saemaul_test_answers');
    sessionStorage.removeItem('saemaul_test_result');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('테스트 링크가 클립보드에 복사되었습니다!');
  };

  const shareToKakao = () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      const result = resultsData[resultType];
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `나의 새마을 리더십 유형은? [${result.role}]`,
          description: `"${result.title}" — 지금 바로 테스트해보세요!`,
          imageUrl: 'https://saemaul-sdgs.web.app/assets/og-image.png',
          link: { mobileWebUrl: 'https://saemaul-sdgs.web.app/test', webUrl: 'https://saemaul-sdgs.web.app/test' },
        },
        buttons: [{ title: '나도 테스트 하러가기 👀', link: { mobileWebUrl: 'https://saemaul-sdgs.web.app/test', webUrl: 'https://saemaul-sdgs.web.app/test' } }],
      });
    } else {
      alert('카카오톡 공유 기능이 초기화되지 않았습니다.');
    }
  };

  // ── 분석 대기 화면 ──
  if (isAnalyzing) {
    const factText = LEADERSHIP_ANALYZING_FACTS[pendingResult] || "당신의 탁월한 선택을 통해 리더십 유형을 분석하고 있어요!";
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-lg text-center">
          <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col items-center">
            
            {/* 백그라운드 글로우 효과 */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-saemaul-green/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />

            {/* 뱅글뱅글 로더 */}
            <div className="relative mb-8 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center relative z-10 shadow-md bg-white">
                <img src="/mascot.png" alt="Saedaeng-i Mascot" className="w-20 h-20 object-contain" />
              </div>
              <div className="absolute inset-0 w-32 h-32 -ml-2 -mt-2 border-4 border-t-saemaul-green border-r-saemaul-green/30 border-b-transparent border-l-transparent rounded-full animate-spin" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <span className="animate-bounce">🌱</span> 분석 중입니다...
            </h2>
            <p className="text-sm text-slate-500 font-bold mb-8 tracking-tight">새댕이가 당신의 선택지를 꼼꼼히 읽어보는 중이에요!</p>

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
    const result = resultsData[resultType];
    const Icon = result.icon;
    const myNotes = selectedAnswers.filter(a => a.type === resultType).map(a => a.historicalNote);

    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">

            {/* 상단 헤더 */}
            <div className={`${result.color} p-12 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover mix-blend-overlay" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/30">
                  <Icon size={48} className="text-white" />
                </div>
                <h2 className="text-white/90 font-bold text-sm tracking-widest uppercase mb-2">나의 새마을 리더십 유형</h2>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-md">{result.role}</h1>
                <p className="text-xl font-medium text-white/90">"{result.title}"</p>
              </div>
            </div>

            <div className="p-8 md:p-12">

              {/* 설명 + 명언 */}
              <div className="text-center mb-8">
                {result.description.split('\n\n').map((para, i) => (
                  <p key={i} className={`text-slate-800 leading-relaxed mb-4 ${
                    i === 0 ? 'text-xl font-medium' : 'text-base text-slate-600'
                  }`}>{para}</p>
                ))}
                <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-lg italic text-slate-600 font-bold">"{result.quote}"</p>
                </div>
              </div>

              {/* 역사적 실화 사례 */}
              {result.historicalCase && (
                <div className={`mb-8 rounded-3xl border-2 ${result.borderColor} ${result.lightColor} p-6`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Scroll size={16} className={result.textColor} />
                    <span className={`text-xs font-black uppercase tracking-widest ${result.textColor}`}>실제 역사 사례</span>
                  </div>
                  <h4 className={`font-black text-base text-slate-800 mb-3`}>{result.historicalCase.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{result.historicalCase.content}</p>
                </div>
              )}

              {/* 특성 태그 */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {result.traits.map((t, i) => (
                  <span key={i} className={`px-4 py-2 rounded-full font-bold text-sm ${result.lightColor} ${result.textColor}`}>#{t}</span>
                ))}
              </div>

              {/* ★ 답변 분석 패널 ★ */}
              <StatsPanel scores={scores} selectedAnswers={selectedAnswers} />

              {/* 역사 인물 카드 */}
              {myNotes.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Scroll size={18} className={result.textColor} />
                    <h3 className={`font-black text-base ${result.textColor}`}>내 선택과 닮은 『영광의 발자취』 실화</h3>
                  </div>
                  <div className="space-y-4">
                    {myNotes.map((note, i) => {
                      const trNote = translateHistoricalNote(note, isEn);
                      return (
                        <div key={i} className={`rounded-2xl border ${result.borderColor} ${result.lightColor} p-5`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 shrink-0 rounded-full ${result.color} flex items-center justify-center text-white font-black text-sm`}>{i + 1}</div>
                            <div className="flex-1">
                              <p className={`font-black text-sm ${result.textColor} mb-1`}>{trNote.figure}</p>
                              <p className="text-xs text-slate-500 mb-2">📍 {trNote.context}</p>
                              <p className="text-slate-700 text-sm leading-relaxed">"{trNote.quote}"</p>
                              {note.sourceFile && (
                                <button
                                  onClick={() => navigate(`/archive/${note.sourceFile}`)}
                                  className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${result.textColor} hover:underline`}
                                >
                                  <BookOpen size={13} /> {isEn ? "Read Full Text →" : "원문 전체 읽기 →"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 대표 인물 배너 */}
              <div className={`rounded-2xl border ${result.borderColor} p-5 mb-10 flex items-center gap-4`}>
                <div className={`w-12 h-12 shrink-0 rounded-full ${result.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{isEn ? "📖 Representative figure of this type" : "📖 이 유형의 대표 인물"}</p>
                  <p className={`font-black text-sm ${result.textColor}`}>{isEn ? result.representativeFigureEn : result.representativeFigure}</p>
                  <p className="text-xs text-slate-500">{isEn ? result.representativeContextEn : result.representativeContext} — {isEn ? "Footsteps of Glory" : "영광의 발자취"}</p>
                </div>
              </div>

              {/* 마지막 문항 수정 / 다시 테스트하기 */}
              <div className="space-y-3 mb-4">
                <button
                  onClick={handleBackToLastQuestion}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 ${result.borderColor} ${result.textColor} bg-white hover:${result.lightColor} transition-colors shadow-sm active:scale-[0.99]`}
                >
                  <ArrowLeft size={20} /> {isEn ? "Edit Last Answer" : "마지막 답변 수정하기"}
                </button>
                <button
                  onClick={resetTest}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white ${result.color} hover:opacity-90 transition-opacity shadow-lg active:scale-[0.99]`}
                >
                  <RefreshCw size={20} /> {isEn ? "Restart Test" : "처음부터 다시 테스트하기"}
                </button>
              </div>

              {/* 공유 버튼 */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <button onClick={copyLink} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  <LinkIcon size={20} /> {isEn ? "Copy Link" : "링크 복사"}
                </button>
                <button onClick={shareToKakao} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-[#FEE500] text-slate-900 hover:bg-[#eacc00] transition-colors">
                  <MessageCircle size={20} /> {isEn ? "Kakao Share" : "카카오 공유"}
                </button>
              </div>

              {/* 학습 허브 CTA */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={100} className="text-emerald-500" /></div>
                <div className="relative z-10">
                  <span className="text-emerald-600 font-bold text-xs tracking-widest uppercase mb-2 block">Learn More</span>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{isEn ? "4 Key Drivers of Saemaul Movement" : "새마을운동의 4대 추진주체"}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-sm">
                    {isEn ? "Learn how residents, leaders, public officials, and experts cooperated to create miracles through real history." : "주민, 지도자, 공무원, 전문가가 어떻게 협력하여 기적을 만들었는지 실제 역사를 통해 학습해 보세요."}
                  </p>
                  <button onClick={() => navigate('/hub')} className="flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/30">
                    {isEn ? "Go to Knowledge Hub" : "학습 허브로 이동하기"} <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* 하단 네비게이션 */}
              <div className="mt-8 flex justify-center gap-6 border-t border-slate-100 pt-8">
                <button onClick={resetTest} className="text-slate-500 hover:text-saemaul-green font-bold text-sm flex items-center gap-2 transition-colors">
                  <RefreshCw size={16} /> {isEn ? "Restart" : "다시하기"}
                </button>
                <button onClick={() => navigate('/')} className="text-slate-500 hover:text-saemaul-green font-bold text-sm flex items-center gap-2 transition-colors">
                  {isEn ? "Go Home" : "홈으로 가기"}
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
    const hasSavedProgress = step > 0;
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-20 flex items-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <button onClick={() => navigate('/saemaul-test')} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green transition-colors mb-8 font-bold">
            <ArrowLeft size={20} /> {isEn ? "To Test List" : "테스트 목록으로"}
          </button>

          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
            {/* 상단 배너 */}
            <div className="bg-gradient-to-br from-saemaul-green to-emerald-700 p-10 md:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold mb-6 backdrop-blur-sm border border-white/30">
                  {isEn ? "📋 Saemaul Leadership Test" : "📋 새마을 리더십 유형 테스트"}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg leading-tight">
                  {isEn ? (
                    <>
                      What Kind of<br />
                      <span className="text-yellow-300">Saemaul Leader</span> Are You?
                    </>
                  ) : (
                    <>
                      나는 어떤<br />
                      <span className="text-yellow-300">새마을 리더</span>일까?
                    </>
                  )}
                </h1>
                <p className="text-white/80 text-base md:text-lg font-medium">
                  {isEn ? "Analyze your leadership style with 7 historical scenarios" : "7가지 역사적 시나리오로 분석하는 나만의 리더십 유형"}
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {/* 4가지 유형 미리보기 */}
              <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{isEn ? "4 Archetypes to Discover" : "발견할 수 있는 4가지 유형"}</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '🚩', title: isEn ? 'Saemaul Leader' : '새마을지도자', desc: isEn ? 'Pioneer who leads by example' : '솔선수범으로 이끄는 개척자', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                  { icon: '🤝', title: isEn ? 'Villager' : '마을주민', desc: isEn ? 'Heart of community in cooperation & devotion' : '협동과 헌신의 공동체 심장', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  { icon: '🏛️', title: isEn ? 'Public Official' : '공무원', desc: isEn ? 'Supporter who completes passion with admin' : '행정으로 열정을 완성하는 지원군', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { icon: '💡', title: isEn ? 'Expert' : '전문가', desc: isEn ? 'Strategist who breaks limits with data' : '데이터와 설계로 불가능을 깨는 전략가', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                ].map(t => (
                  <div key={t.title} className={`rounded-2xl border p-4 ${t.color}`}>
                    <span className="text-2xl block mb-1">{t.icon}</span>
                    <p className="font-black text-sm">{t.title}</p>
                    <p className="text-xs opacity-75 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                ))}
              </div>

              {/* 테스트 정보 */}
              <div className="flex justify-center gap-8 mb-8 text-center">
                <div><p className="text-2xl font-black text-saemaul-green">7</p><p className="text-xs text-slate-500 font-medium">{isEn ? "Ques" : "문항"}</p></div>
                <div className="w-px bg-slate-100" />
                <div><p className="text-2xl font-black text-saemaul-green">{isEn ? "5m" : "5분"}</p><p className="text-xs text-slate-500 font-medium">{isEn ? "Duration" : "소요"}</p></div>
                <div className="w-px bg-slate-100" />
                <div><p className="text-2xl font-black text-saemaul-green">4</p><p className="text-xs text-slate-500 font-medium">{isEn ? "Types" : "유형"}</p></div>
              </div>

              {/* 시작 버튼 */}
              {hasSavedProgress ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCover(false)}
                    className="w-full py-5 rounded-2xl font-black text-lg text-white bg-saemaul-green hover:bg-emerald-700 transition-colors shadow-lg shadow-saemaul-green/30 flex items-center justify-center gap-2"
                  >
                    {isEn ? `Resume (From Q${step + 1}/${questions.length})` : `이어서 하기 (${step + 1}/${questions.length}번 문항부터)`}
                  </button>
                  <button
                    onClick={() => { resetTest(); setShowCover(false); }}
                    className="w-full py-3 rounded-2xl font-bold text-sm text-slate-500 border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {isEn ? "Start Over" : "처음부터 다시 시작"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCover(false)}
                  className="w-full py-5 rounded-2xl font-black text-lg text-white bg-saemaul-green hover:bg-emerald-700 transition-colors shadow-lg shadow-saemaul-green/30 flex items-center justify-center gap-2"
                >
                  {isEn ? "Start Test →" : "테스트 시작하기 →"}
                </button>
              )}

              <p className="text-center text-xs text-slate-400 mt-4">{isEn ? "Conducted anonymously; no personal data collected." : "익명으로 진행되며, 개인 정보는 수집되지 않습니다."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = questions[step];
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center">
      <div className="container mx-auto px-6 max-w-2xl">
        <button onClick={() => navigate('/saemaul-test')} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green transition-colors mb-8 font-bold">
          <ArrowLeft size={20} /> {isEn ? "To Test List" : "테스트 목록으로"}
        </button>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {isEn ? <>Saemaul Leadership <span className="text-saemaul-green">Behavior</span> Test</> : <>새마을 리더십 <span className="text-saemaul-green">행동 유형</span> 테스트</>}
            </h1>
            <p className="text-slate-500 font-medium">{isEn ? "If you were on the Saemaul scene, what role would you play?" : "당신이 새마을운동 현장에 있다면, 어떤 역할을 맡았을까요?"}</p>
          </div>

          {/* 진행 바 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-white hover:bg-slate-800 transition-all text-xs font-black border border-slate-200 shadow-sm active:scale-95 bg-white px-3 py-2 rounded-xl"
                  >
                    <ChevronLeft size={14} /> {isEn ? "Previous" : "이전 문항"}
                  </button>
                )}
                <span className="text-saemaul-green font-black tracking-wider uppercase text-sm">Question {step + 1}</span>
              </div>
              <span className="text-slate-400 font-bold text-xs">{step + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-saemaul-green h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div key={step} className="animate-fade-in">
            {/* 배경 텍스트 */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 mb-5">
              <p className="text-amber-800 text-sm font-medium leading-relaxed">📜 {isEn ? current.backgroundEn : current.background}</p>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-relaxed break-keep">
              {isEn ? current.questionEn : current.question}
            </h2>

            <div className="space-y-4">
              {current.options.map((option, index) => {
                const isSelected = selectedIdx === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option, index)}
                    disabled={selectedIdx !== null}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group shadow-sm
                      ${isSelected
                        ? 'border-saemaul-green bg-saemaul-green/10 shadow-md scale-[1.01]'
                        : 'border-slate-100 hover:border-saemaul-green hover:bg-saemaul-green/5 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors bg-white
                        ${isSelected ? 'border-saemaul-green' : 'border-slate-200 group-hover:border-saemaul-green'}`}>
                        <CheckCircle size={16} className={isSelected ? 'text-saemaul-green' : 'text-transparent group-hover:text-saemaul-green transition-colors'} />
                      </div>
                      <span className="font-bold text-slate-700 group-hover:text-slate-900 text-lg leading-snug break-keep">{isEn ? option.textEn : option.text}</span>
                    </div>
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

export default LeadershipTest;
