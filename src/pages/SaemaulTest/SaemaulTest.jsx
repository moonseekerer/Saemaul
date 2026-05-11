import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Heart, ChevronRight, Lock, Sparkles } from 'lucide-react';

const tests = [
  {
    id: 'leadership',
    available: true,
    icon: Flag,
    color: 'from-orange-400 to-amber-500',
    lightColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
    badge: '지금 시작 가능',
    badgeColor: 'bg-orange-100 text-orange-700',
    title: '새마을 리더십 유형 테스트',
    subtitle: 'Leadership Type Test',
    description: '나는 어떤 리더십 스타일을 가졌을까? 7가지 역사적 시나리오에 답하며 나만의 새마을 유형(지도자·주민·공무원·전문가)을 발견해보세요.',
    duration: '약 5분',
    questionCount: '7문항',
    route: '/test',
    tags: ['자기이해', '리더십', '역사 시나리오'],
  },
  {
    id: 'spirit',
    available: false,
    icon: Heart,
    color: 'from-emerald-400 to-teal-500',
    lightColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
    badge: '준비 중',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    title: '새마을정신 테스트',
    subtitle: 'Saemaul Spirit Test',
    description: '근면·자조·협동·나눔·봉사·창조 6가지 새마을정신 중 나에게 가장 강하게 내재된 가치는 무엇인지 측정합니다.',
    duration: '약 7분',
    questionCount: '12문항 (예정)',
    route: null,
    tags: ['가치관', '정신', '자기성찰'],
  },
];

const SaemaulTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-3xl">

        {/* 헤더 */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saemaul-light text-saemaul-green text-sm font-bold mb-6 border border-saemaul-green/20">
            <Sparkles size={14} />
            새마을 테스트 센터
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            나를 발견하는<br />
            <span className="text-saemaul-green">새마을 테스트</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto">
            새마을운동의 역사적 사례를 바탕으로 설계된 테스트로<br className="hidden md:block" />
            나의 리더십과 가치관을 객관적으로 탐색해보세요.
          </p>
        </div>

        {/* 테스트 카드 목록 */}
        <div className="space-y-6">
          {tests.map((test) => {
            const Icon = test.icon;
            return (
              <div
                key={test.id}
                onClick={() => test.available && navigate(test.route)}
                className={`relative bg-white rounded-[32px] border-2 ${test.borderColor} shadow-lg overflow-hidden transition-all duration-300 ${
                  test.available
                    ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                    : 'opacity-70 cursor-not-allowed'
                }`}
              >
                {/* 배경 그라디언트 액센트 */}
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${test.color}`} />

                <div className="pl-8 pr-6 py-7 flex gap-5 items-start">
                  {/* 아이콘 */}
                  <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${test.color} flex items-center justify-center shadow-lg`}>
                    <Icon size={32} className="text-white" />
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${test.badgeColor}`}>
                        {test.badge}
                      </span>
                      {!test.available && <Lock size={14} className="text-slate-400" />}
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-0.5">{test.title}</h2>
                    <p className="text-xs font-bold text-slate-400 mb-3">{test.subtitle}</p>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{test.description}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span>⏱ {test.duration}</span>
                        <span>📋 {test.questionCount}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {test.tags.map(tag => (
                          <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-bold ${test.lightColor} ${test.textColor}`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 화살표 */}
                  <div className={`shrink-0 self-center ${test.available ? test.textColor : 'text-slate-300'}`}>
                    <ChevronRight size={28} />
                  </div>
                </div>

                {/* 준비중 오버레이 */}
                {!test.available && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] rounded-[32px] flex items-center justify-center">
                    <div className="bg-white/90 rounded-2xl px-6 py-3 shadow-lg border border-slate-100">
                      <p className="text-slate-500 font-black text-sm text-center">🚀 곧 출시 예정입니다</p>
                      <p className="text-slate-400 text-xs text-center mt-1">알림 신청하고 가장 먼저 받아보세요</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-slate-400 text-sm mt-10">
          모든 테스트 결과는 익명으로 처리되며, 개인 식별 정보는 수집되지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default SaemaulTest;
