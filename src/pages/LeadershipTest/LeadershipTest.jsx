import React, { useState, useEffect } from 'react';
// Link used via navigate for doc routing
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MessageCircle, BookOpen, Users, Flag, Building, Lightbulb, ChevronRight, RefreshCw, Link as LinkIcon, Scroll, BarChart2, ChevronDown } from 'lucide-react';
import { questions, resultsData } from './_data.js';

const TYPE_META = {
  LEADER:   { label: '새마을지도자', color: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200' },
  VILLAGER: { label: '마을주민',     color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  OFFICIAL: { label: '공무원',       color: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  EXPERT:   { label: '전문가',       color: 'bg-purple-500',  light: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
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
      setScores(newScores);
      setSelectedAnswers(newAnswers);
      setSelectedIdx(null);
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        const maxType = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
        setResultType(maxType);
        setStep(questions.length);
      }
    }, 500);
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
                    {myNotes.map((note, i) => (
                      <div key={i} className={`rounded-2xl border ${result.borderColor} ${result.lightColor} p-5`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 shrink-0 rounded-full ${result.color} flex items-center justify-center text-white font-black text-sm`}>{i + 1}</div>
                          <div className="flex-1">
                            <p className={`font-black text-sm ${result.textColor} mb-1`}>{note.figure}</p>
                            <p className="text-xs text-slate-500 mb-2">📍 {note.context}</p>
                            <p className="text-slate-700 text-sm leading-relaxed">"{note.quote}"</p>
                            {note.sourceFile && (
                              <button
                                onClick={() => navigate(`/docs/${note.sourceFile}`)}
                                className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${result.textColor} hover:underline`}
                              >
                                <BookOpen size={13} /> 원문 전체 읽기 →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* 대표 인물 배너 */}
              <div className={`rounded-2xl border ${result.borderColor} p-5 mb-10 flex items-center gap-4`}>
                <div className={`w-12 h-12 shrink-0 rounded-full ${result.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">📖 이 유형의 대표 인물</p>
                  <p className={`font-black text-sm ${result.textColor}`}>{result.representativeFigure}</p>
                  <p className="text-xs text-slate-500">{result.representativeContext} — 영광의 발자취 제1집</p>
                </div>
              </div>

              {/* 다시 테스트하기 */}
              <button
                onClick={resetTest}
                className={`w-full mb-4 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white ${result.color} hover:opacity-90 transition-opacity shadow-lg`}
              >
                <RefreshCw size={20} /> 다시 테스트하기
              </button>

              {/* 공유 버튼 */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <button onClick={copyLink} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  <LinkIcon size={20} /> 링크 복사
                </button>
                <button onClick={shareToKakao} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-[#FEE500] text-slate-900 hover:bg-[#eacc00] transition-colors">
                  <MessageCircle size={20} /> 카카오 공유
                </button>
              </div>

              {/* 학습 허브 CTA */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={100} className="text-emerald-500" /></div>
                <div className="relative z-10">
                  <span className="text-emerald-600 font-bold text-xs tracking-widest uppercase mb-2 block">Learn More</span>
                  <h3 className="text-xl font-black text-slate-900 mb-3">새마을운동의 4대 추진주체</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-sm">
                    주민, 지도자, 공무원, 전문가가 어떻게 협력하여 기적을 만들었는지 실제 역사를 통해 학습해 보세요.
                  </p>
                  <button onClick={() => navigate('/hub')} className="flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-emerald-500/30">
                    학습 허브로 이동하기 <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* 하단 네비게이션 */}
              <div className="mt-8 flex justify-center gap-6 border-t border-slate-100 pt-8">
                <button onClick={resetTest} className="text-slate-500 hover:text-saemaul-green font-bold text-sm flex items-center gap-2 transition-colors">
                  <RefreshCw size={16} /> 다시하기
                </button>
                <button onClick={() => navigate('/')} className="text-slate-500 hover:text-saemaul-green font-bold text-sm flex items-center gap-2 transition-colors">
                  홈으로 가기
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
            <ArrowLeft size={20} /> 테스트 목록으로
          </button>

          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
            {/* 상단 배너 */}
            <div className="bg-gradient-to-br from-saemaul-green to-emerald-700 p-10 md:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('/assets/national-sm-map.png')] bg-cover" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold mb-6 backdrop-blur-sm border border-white/30">
                  📋 새마을 리더십 유형 테스트
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg leading-tight">
                  나는 어떤<br />
                  <span className="text-yellow-300">새마을 리더</span>일까?
                </h1>
                <p className="text-white/80 text-base md:text-lg font-medium">
                  7가지 역사적 시나리오로 분석하는<br />나만의 리더십 유형
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {/* 4가지 유형 미리보기 */}
              <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-6">발견할 수 있는 4가지 유형</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: '🚩', title: '새마을지도자', desc: '솔선수범으로 이끄는 개척자', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                  { icon: '🤝', title: '마을주민', desc: '협동과 헌신의 공동체 심장', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  { icon: '🏛️', title: '공무원', desc: '행정으로 열정을 완성하는 지원군', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { icon: '💡', title: '전문가', desc: '데이터와 설계로 불가능을 깨는 전략가', color: 'bg-purple-50 border-purple-200 text-purple-700' },
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
                <div><p className="text-2xl font-black text-saemaul-green">7</p><p className="text-xs text-slate-500 font-medium">문항</p></div>
                <div className="w-px bg-slate-100" />
                <div><p className="text-2xl font-black text-saemaul-green">5분</p><p className="text-xs text-slate-500 font-medium">소요</p></div>
                <div className="w-px bg-slate-100" />
                <div><p className="text-2xl font-black text-saemaul-green">4종</p><p className="text-xs text-slate-500 font-medium">유형</p></div>
              </div>

              {/* 시작 버튼 */}
              {hasSavedProgress ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCover(false)}
                    className="w-full py-5 rounded-2xl font-black text-lg text-white bg-saemaul-green hover:bg-emerald-700 transition-colors shadow-lg shadow-saemaul-green/30 flex items-center justify-center gap-2"
                  >
                    이어서 하기 ({step + 1}/{questions.length}번 문항부터)
                  </button>
                  <button
                    onClick={() => { resetTest(); setShowCover(false); }}
                    className="w-full py-3 rounded-2xl font-bold text-sm text-slate-500 border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    처음부터 다시 시작
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCover(false)}
                  className="w-full py-5 rounded-2xl font-black text-lg text-white bg-saemaul-green hover:bg-emerald-700 transition-colors shadow-lg shadow-saemaul-green/30 flex items-center justify-center gap-2"
                >
                  테스트 시작하기 →
                </button>
              )}

              <p className="text-center text-xs text-slate-400 mt-4">익명으로 진행되며, 개인 정보는 수집되지 않습니다.</p>
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
          <ArrowLeft size={20} /> 테스트 목록으로
        </button>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              새마을 리더십 <span className="text-saemaul-green">행동 유형</span> 테스트
            </h1>
            <p className="text-slate-500 font-medium">당신이 새마을운동 현장에 있다면, 어떤 역할을 맡았을까요?</p>
          </div>

          {/* 진행 바 */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-saemaul-green font-black tracking-wider uppercase text-sm">Question {step + 1}</span>
              <span className="text-slate-400 font-bold text-xs">{step + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-saemaul-green h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div key={step} className="animate-fade-in">
            {/* 배경 텍스트 */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 mb-5">
              <p className="text-amber-800 text-sm font-medium leading-relaxed">📜 {current.background}</p>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-relaxed break-keep">
              {current.question}
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
                      <span className="font-bold text-slate-700 group-hover:text-slate-900 text-lg leading-snug break-keep">{option.text}</span>
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
