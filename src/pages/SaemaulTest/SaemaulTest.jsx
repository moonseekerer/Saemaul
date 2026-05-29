import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Heart, ChevronRight, Lock, Sparkles, Users, Brain, Zap, Shield, Gift, Lightbulb, Info, BookOpen, Target, CheckCircle } from 'lucide-react';

// 6대 덕목 데이터
const virtues = [
  {
    key: 'DILIGENCE',
    icon: Zap,
    label: '근면 (勤勉)',
    english: 'Diligence',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    desc: '맡은 일을 미루지 않고 계획적으로 추진하며, 땀 흘려 노력하는 성실성과 끈기'
  },
  {
    key: 'SELF_HELP',
    icon: Shield,
    label: '자조 (自助)',
    english: 'Self-Help',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    desc: '남에게 의존하지 않고 스스로 문제를 해결하며, 자발적 학습과 역량 강화를 추구하는 주인의식'
  },
  {
    key: 'COOPERATION',
    icon: Users,
    label: '협동 (協同)',
    english: 'Cooperation',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    desc: '개인 이익보다 공동의 목표를 우선시하고, 서로의 강점을 모아 시너지를 창출하는 연대 정신'
  },
  {
    key: 'SHARING',
    icon: Gift,
    label: '나눔 (分享)',
    english: 'Sharing',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    desc: '자신의 자원·지식·시간을 이웃과 공동체를 위해 기꺼이 나누는 개방성과 관대함'
  },
  {
    key: 'SERVICE',
    icon: Heart,
    label: '봉사 (奉仕)',
    english: 'Service',
    color: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    desc: '보상을 기대하지 않고 타인의 필요를 먼저 살피며, 공동체의 안녕을 위해 헌신하는 이타성'
  },
  {
    key: 'CREATIVITY',
    icon: Lightbulb,
    label: '창조 (創造)',
    english: 'Creativity',
    color: 'from-cyan-400 to-sky-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    desc: '기존 관행에 안주하지 않고 혁신적 방법으로 문제를 해결하며, 새로운 가치를 창출하는 도전 정신'
  }
];

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
    subtitle: 'Saemaul Leadership Type Test',
    description: '1970년대 실제 새마을운동 현장에서 발생했던 7가지 역사적 딜레마 시나리오를 통해 나만의 리더십 스타일을 발견합니다. 지도자형, 주민형, 공무원형, 전문가형 중 나는 어떤 유형일까요?',
    longDesc: '새마을운동의 성공 배경에는 다양한 유형의 리더들이 있었습니다. 마을 이장과 같은 현장 지도자, 자발적으로 참여한 일반 주민, 행정을 지원한 공무원, 기술을 제공한 전문가까지 — 각자의 역할이 어우러져 기적을 만들었습니다. 이 테스트는 당신이 어떤 상황에서 어떤 방식으로 변화를 이끄는지 진단합니다.',
    measures: ['위기 대응 방식', '의사결정 스타일', '공동체 내 역할', '리더십 발휘 조건'],
    duration: '약 5분',
    questionCount: '7문항',
    route: '/test',
    tags: ['자기이해', '리더십', '역사 시나리오'],
  },
  {
    id: 'spirit',
    available: true,
    icon: Heart,
    color: 'from-emerald-400 to-teal-500',
    lightColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
    badge: '글로벌 새마을정신 진단',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    title: '글로벌 새마을정신 테스트 (GSST)',
    subtitle: 'Global Saemaul Spirit Test',
    description: '근면·자조·협동·나눔·봉사·창조 — 6가지 새마을정신 덕목을 현대 사회의 실제 상황에 적용한 12개의 RPG 퀘스트를 통해 나의 글로벌 정신 스탯을 측정합니다.',
    longDesc: '현대판 글로벌 새마을정신 진단 테스트(GSST)는 단순한 자기 인식을 넘어 실제 행동 패턴을 측정합니다. 12개의 생생한 시나리오를 통해 당신이 공동체 안에서 어떻게 행동하고, 어떤 가치를 우선시하는지 6가지 스탯으로 시각화합니다. 결과는 SS부터 B까지 RPG 캐릭터 등급으로 제공됩니다.',
    measures: ['근면 스탯 (성실성·계획성)', '자조 스탯 (주인의식·자기계발)', '협동 스탯 (연대·공동체 기여)', '나눔 스탯 (개방성·관대함)', '봉사 스탯 (이타성·헌신도)', '창조 스탯 (혁신성·문제해결력)'],
    duration: '약 10~15분',
    questionCount: '12문항',
    route: '/spirit-test',
    tags: ['가치관', '정신', '6대 덕목', '방사형 차트'],
  },
];

const howToSteps = [
  {
    step: '01',
    Icon: Target,
    title: '목적 선택',
    desc: '자기 이해, 팀 역량 진단, 교육 프로그램 활용 등 목적에 맞는 테스트를 선택하세요.'
  },
  {
    step: '02',
    Icon: Brain,
    title: '솔직하게 응답',
    desc: '정답은 없습니다. 상황을 읽고 평소 자신의 행동 패턴과 가장 가까운 선택지를 고르세요.'
  },
  {
    step: '03',
    Icon: CheckCircle,
    title: '결과 활용',
    desc: '개인 성찰, 강점 파악, 팀 내 역할 조율 등 다양한 방식으로 결과를 활용하세요.'
  }
];

const HowToUseSection = () => (
  <div className="mt-12 bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-saemaul-light flex items-center justify-center">
        <BookOpen size={20} className="text-saemaul-green" />
      </div>
      <h2 className="text-xl font-black text-slate-900">테스트 활용 안내</h2>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      {howToSteps.map((item) => {
        const StepIcon = item.Icon;
        return (
          <div key={item.step} className="flex gap-4">
            <div className="shrink-0">
              <span className="text-4xl font-black text-slate-100">{item.step}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StepIcon size={16} className="text-saemaul-green" />
                <h3 className="text-sm font-black text-slate-800">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
    <div className="mt-6 p-4 bg-saemaul-light rounded-2xl border border-saemaul-green/20">
      <div className="flex items-start gap-3">
        <Info size={16} className="text-saemaul-green shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-saemaul-green">개인정보 보호:</strong> 모든 테스트 결과는 익명으로 처리되며, 개인을 식별할 수 있는 어떠한 정보도 수집하거나 저장하지 않습니다. 결과는 브라우저 화면에서만 확인 가능합니다.
        </p>
      </div>
    </div>
  </div>
);

const SaemaulTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">

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
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto">
            새마을운동의 역사적 사례와 현대적 가치를 바탕으로 설계된 테스트로<br className="hidden md:block" />
            나의 리더십 유형과 글로벌 새마을정신 스탯을 객관적으로 탐색해보세요.
          </p>
        </div>

        {/* 6대 덕목 인포그래픽 */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-6 bg-saemaul-green rounded-full" />
            <h2 className="text-lg font-black text-slate-900">글로벌 새마을정신 6대 핵심 덕목</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {virtues.map((v) => {
              const VirtueIcon = v.icon;
              return (
                <div
                  key={v.key}
                  className={`${v.bg} ${v.border} border rounded-2xl p-4 flex items-start gap-3 hover:shadow-md transition-all duration-300`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center shadow-sm`}>
                    <VirtueIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className={`text-sm font-black ${v.text} mb-0.5`}>{v.label}</div>
                    <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 테스트 카드 목록 */}
        <div className="space-y-6">
          {tests.map((test) => {
            const TestIcon = test.icon;
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

                <div className="pl-8 pr-6 py-8">
                  {/* 상단 헤더 */}
                  <div className="flex gap-5 items-start mb-6">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${test.color} flex items-center justify-center shadow-lg`}>
                      <TestIcon size={32} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${test.badgeColor}`}>
                          {test.badge}
                        </span>
                        {!test.available && <Lock size={14} className="text-slate-400" />}
                      </div>
                      <h2 className="text-xl font-black text-slate-900 mb-0.5">{test.title}</h2>
                      <p className="text-xs font-bold text-slate-400 mb-3">{test.subtitle}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{test.description}</p>
                    </div>

                    <div className={`shrink-0 self-center ${test.available ? test.textColor : 'text-slate-300'}`}>
                      <ChevronRight size={28} />
                    </div>
                  </div>

                  {/* 상세 설명 */}
                  <div className={`${test.lightColor} rounded-2xl p-5 mb-5`}>
                    <p className="text-slate-700 text-sm leading-relaxed">{test.longDesc}</p>
                  </div>

                  {/* 측정 항목 */}
                  <div className="mb-5">
                    <h4 className={`text-xs font-black ${test.textColor} uppercase tracking-wider mb-3`}>
                      📊 측정 항목
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {test.measures.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${test.color}`} />
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 메타 정보 & 태그 */}
                  <div className="flex items-center gap-4 flex-wrap border-t border-slate-100 pt-4">
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

        {/* 활용 안내 섹션 */}
        <HowToUseSection />

      </div>
    </div>
  );
};

export default SaemaulTest;
