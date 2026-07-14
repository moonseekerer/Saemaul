import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import Feedback from './pages/Feedback/Feedback';
import LeadershipTest from './pages/LeadershipTest/LeadershipTest';
import SaemaulTest from './pages/SaemaulTest/SaemaulTest';
import SpiritTest from './pages/SaemaulTest/SpiritTest';
import VillageMap from './pages/SaemaulTest/VillageMap';
import DocViewer from './pages/DocViewer/DocViewer';
import KnowledgeHub from './pages/KnowledgeHub/KnowledgeHub';
import Community from './pages/Community/Community';
import Chatbot from './pages/Chatbot/Chatbot';
import BookReader from './pages/BookReader/BookReader';
import { 
  UserCheck, 
  Trophy, 
  MessageSquare, 
  BookOpen, 
  ChevronRight, 
  Globe, 
  Menu, 
  X,
  ExternalLink,
  ArrowRight,
  Languages,
  MessageCircle,
  Bot,
  Play,
  Home,
  Download,
  ArrowRightCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth } from './firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { ensureUserProfile, seedMockUsers } from './utils/points';
import AuthModal from './components/AuthModal';
import { useSEO } from './hooks/useSEO';

const NavItem = ({ label, to }) => (
  <NavLink
    to={to || '#!'}
    className={({ isActive }) =>
      `nav-link flex flex-col items-start group whitespace-nowrap transition-all ${
        isActive ? 'text-saemaul-green' : ''
      }`
    }
  >
    {({ isActive }) => (
      <span className={`text-sm font-semibold relative ${
        isActive
          ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-saemaul-green after:rounded-full'
          : ''
      }`}>{label}</span>
    )}
  </NavLink>
);

const FeatureCard = ({ icon: Icon, title, description, color, learnMoreText, to }) => {
  const navigate = useNavigate();

  const colorMap = {
    blue: "from-blue-500/20 to-indigo-500/10 text-blue-600",
    amber: "from-amber-500/20 to-orange-500/10 text-amber-600",
    emerald: "from-emerald-500/20 to-saemaul-green/10 text-emerald-600",
    indigo: "from-indigo-500/20 to-purple-500/10 text-indigo-600"
  };

  return (
    <div 
      onClick={() => to && navigate(to)}
      className="glass-card p-10 rounded-[32px] cursor-pointer group relative overflow-hidden h-full flex flex-col transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-saemaul-green/10"
    >
      <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${colorMap[color] || 'from-slate-500/10 to-transparent'} rounded-full blur-2xl transition-all group-hover:scale-150 duration-700 opacity-50`} />
      <div className={`w-16 h-16 bg-gradient-to-br ${colorMap[color] || 'from-slate-500/10 to-slate-200/10'} rounded-2xl flex items-center justify-center mb-8 group-hover:bg-saemaul-green group-hover:text-white transition-all duration-500 shadow-sm`}>
        {Icon && <Icon size={32} className="transition-all duration-500 group-hover:scale-110" />}
      </div>
      <h3 className="text-2xl font-black mb-4 text-slate-800 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-base leading-relaxed mb-8 flex-grow font-medium">
        {description}
      </p>
      <div className="flex items-center text-saemaul-green font-black text-sm gap-2 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
        <span className="w-6 h-px bg-saemaul-green/30" /> {learnMoreText} <ChevronRight size={18} />
      </div>
    </div>
  );
};

const PartnerBanner = () => {
  const partners = [
    { name: "영남대학교 국제개발새마을학과", url: "https://intdev.yu.ac.kr/intdev/index.do" },
    { name: "영남대학교 박정희새마을대학원", url: "https://www.yu.ac.kr/pspsk/index.do" },
    { name: "유네스코한국위원회", url: "https://unesco.or.kr/%EC%83%88%EB%A7%88%EC%9D%84%EC%9A%B4%EB%8F%99-%EA%B8%B0%EB%A1%9D%EB%AC%BC/" },
    { name: "새마을재단", url: "https://www.smuf.or.kr/" },
    { name: "새마을운동중앙회", url: "https://www.saemaul.or.kr/home/?mode=main" },
  ];

  const doublePartners = [...partners, ...partners];

  return (
    <section className="py-24 bg-white/50 backdrop-blur-sm border-y border-slate-100 overflow-hidden relative z-10">
      <div className="container mx-auto px-6 mb-12 text-center">
        <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Partnerships & Cooperation</h4>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-saemaul-green to-transparent mx-auto rounded-full opacity-30" />
      </div>
      <div className="relative flex overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap gap-32 items-center py-4">
          {doublePartners.map((partner, idx) => (
            <a 
              key={idx} 
              href={partner.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-4 group transition-all duration-500"
            >
              <div className="w-3 h-3 rounded-full bg-saemaul-green opacity-20 group-hover:scale-125 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(0,146,71,0.5)] transition-all" />
              <span className="text-slate-400 font-bold text-xl tracking-tight group-hover:text-saemaul-green transition-all duration-500 filter grayscale group-hover:grayscale-0">
                {partner.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const ChatbotPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold mb-4 border border-emerald-200">
            <Bot size={16} />
            {t('features.card3.title')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">{t('nav.chatbot')}</h1>
          <p className="text-slate-500">{t('features.card3.desc')}</p>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white" style={{ height: '80vh', position: 'relative' }}>
          <Chatbot />
        </div>
      </div>
    </div>
  );
};

const SpiritMapPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-bold mb-4 border border-amber-200 shadow-sm animate-pulse">
            <Home size={16} />
            마을 RPG 모드
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">마을 탐색 지도</h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">마을을 조작해 직접 탐색하며 수해 복구와 공터 가꾸기 등 12개의 주민 공동 협력 이벤트를 직접 마주하고 해결해보세요!</p>
        </div>

        {/* Game Viewport Container */}
        <div className="rounded-[32px] overflow-hidden shadow-2xl border-4 border-slate-900 bg-black relative mb-8" style={{ height: '70vh', minHeight: '520px' }}>
          <VillageMap />
        </div>

        {/* External Instructions Card */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Movement Controls Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
            <h4 className="text-slate-800 font-black text-base mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              캐릭터 이동 조작법
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-1.5 bg-slate-100 border-2 border-b-4 border-slate-300 rounded-lg text-xs font-black shadow-sm">W A S D</kbd>
                <span className="text-slate-400 text-sm">또는</span>
                <kbd className="px-3 py-1.5 bg-slate-100 border-2 border-b-4 border-slate-300 rounded-lg text-xs font-black shadow-sm">↑ ↓ ← →</kbd>
              </div>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                키보드를 이용해 상하좌우 자유롭게 흙길과 다리를 지나 마을을 돌아다닐 수 있습니다.
              </p>
            </div>
          </div>

          {/* Goal & Interaction Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
            <h4 className="text-slate-800 font-black text-base mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              퀘스트 진행 방식
            </h4>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              마을 곳곳에 반짝이는 황색 <span className="text-amber-500 font-black">❗ 표지판(퀘스트 지점)</span>에 다가가 몸으로 접촉하면 이벤트 팝업이 활성화됩니다. 질문에 답하여 주민의 협동력을 모아주세요!
            </p>
          </div>

          {/* Mobile D-Pad Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
            <h4 className="text-slate-800 font-black text-base mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              모바일 지원
            </h4>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              스마트폰이나 태블릿 등 모바일 기기로 접속 시, 우측 하단에 생성되는 <span className="font-bold text-slate-700">가상 D-Pad 버튼</span>을 통해 손쉬운 화면 터치 조작이 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};



const TEAM_DATA = {
  kwon: {
    id: 'kwon',
    name: '권도경',
    role: '팀장',
    dept: '국제개발새마을학과',
    year: '3학년',
    studentId: import.meta.env.VITE_TEAM_MEMBER_1_STUDENT_ID || '',
    tel: import.meta.env.VITE_TEAM_MEMBER_1_TEL || '',
    email: import.meta.env.VITE_TEAM_MEMBER_1_EMAIL || '',
    activities: [
      { period: '2025 ~ 2026', desc: '포스코비욘드 18기 (인도네시아 현지 사회문제 해결 프로젝트)' },
      { period: '2024 ~ 2025', desc: '굿네이버스 한빛 7-8기 유아 성폭력예방인형극단 (우수활동팀)' },
      { period: '2025', desc: '대구국제개발협력센터 베트남 해외 교육봉사 프로그램 기획/활동' },
      { period: '2025', desc: '대꾸오다 4기 ODA 홍보 콘텐츠 기획 및 전문가 교육 캠페인' },
      { period: '2025', desc: 'YU&EYE 학생 모니터링단 교육혁신 제안 활동 (장려상 수상)' },
      { period: '2024', desc: '산격종합사회복지관 온마을어울림축제 대학생 기획단 운영' },
      { period: '2025', desc: '2026대구세계마스터즈육상경기대회 대학생 홍보단 (대회 및 SDGs 홍보)' },
      { period: '2025', desc: '제16기 사회리더 대학생 멘토링 멘티' }
    ],
    education: [
      { period: '2024.3 ~ 현재', desc: '영남대학교 국제개발새마을학과 재학 (3학년)' }
    ]
  },
  yoon: {
    id: 'yoon',
    name: '윤서윤',
    role: '팀원',
    dept: '국제개발새마을학과',
    year: '2학년',
    studentId: import.meta.env.VITE_TEAM_MEMBER_2_STUDENT_ID || '',
    tel: import.meta.env.VITE_TEAM_MEMBER_2_TEL || '',
    email: import.meta.env.VITE_TEAM_MEMBER_2_EMAIL || '',
    activities: [],
    education: [
      { period: '2025.3 ~ 현재', desc: '영남대학교 국제개발새마을학과 재학 (2학년)' }
    ]
  },
  park: {
    id: 'park',
    name: '박문식',
    role: '팀원',
    dept: '새마을국제개발학과',
    year: '박사1기',
    studentId: import.meta.env.VITE_TEAM_MEMBER_3_STUDENT_ID || '',
    tel: import.meta.env.VITE_TEAM_MEMBER_3_TEL || '',
    email: import.meta.env.VITE_TEAM_MEMBER_3_EMAIL || '',
    intro: '박문식 팀원은 학술적 전문성과 글로벌 현장 실무 경험을 겸비한 국제개발협력 전문가입니다. 에티오피아 섬유 테크노파크 조성 지원사업, 우즈베키스탄 IT Park PMC 사업 등 공적개발원조(ODA) 프로젝트를 성공적으로 이끌며 개발도상국의 산업 경쟁력 강화와 SDGs 달성에 앞장서고 있습니다. 특히 우즈베키스탄 IT Park PMC 사업을 탁월하게 수행하여 2025년 KOICA 이사장 명의 감사패(우수 파트너상)를 수상하며 사업 관리 및 실무 기획 역량을 공식 인정받았습니다. 미얀마, 라오스, 인도네시아 등 다양한 현장에서 쌓아온 깊은 통찰력을 바탕으로 실효성 있는 글로벌 상생 협력을 실천하고 있습니다.',
    activities: [
      { period: '2023.07 ~ 현재', desc: '경북테크노파크 글로벌협력실 전임연구원 (국제개발협력 사업 기획/실무)' },
      { period: '2025', desc: '우즈베키스탄 IT Park PMC 사업 우수 수행 공로 KOICA 이사장 감사패(우수 파트너상) 수상' },
      { period: '2019', desc: '영국 사회적기업(Social Enterprise) 현지 조사 연구' },
      { period: '2018', desc: 'LG전자 CSR Field Study (미얀마 현지 필드 스터디)' },
      { period: '2018', desc: '현대자동차 해피무브 글로벌 청년봉사단 18기 (라오스 지역 봉사)' },
      { period: '2017', desc: '인도네시아 국제개발협력 실무 인턴십 활동' },
      { period: '2017', desc: '베트남국립농업대학(VNUA) 대학교류 및 해외새마을운동 현장 견학' },
      { period: '2017', desc: '경상북도 대학생 새마을 해외봉사단 (키르기즈스탄)' },
      { period: '2016 ~ 2018', desc: '필리핀 Enderun Colleges 등 주요 대학 교류 및 대외 활동' }
    ],
    education: [
      { period: '2026.03 ~ 현재', desc: '영남대학교 대학원 새마을국제개발학과 박사과정 재학' },
      { period: '2020.03 ~ 2026.02', desc: '영남대학교 대학원 새마을국제개발학 석사 졸업' },
      { period: '2016.03 ~ 2020.02', desc: '영남대학교 새마을국제개발학 학사 졸업' }
    ],
    projects: [
      { agency: '산업부(KIAT)', title: '에티오피아 섬유테크노파크 조성 지원사업', period: '18.06.01~23.12.31(23.07.01~23.12.31)' },
      { agency: '산업부(KIAT)', title: '개도국 섬유분야 생산현장 애로기술지도(타지키스탄)', period: '21.05.01~23.12.31(23.07.01~23.12.31)' },
      { agency: '산업부(KIAT)', title: '개도국 섬유분야 생산현장 애로기술지도(캄보디아)', period: '21.05.01~23.12.31(23.07.01~23.12.31)' },
      { agency: '외교통상부(KOICA)', title: '우즈베키스탄 IT Park 지속성장한 성장을 위한 기반조성 및 역량강화', period: '21.10.01~25.12.31(24.03.01~25.12.31)' },
      { agency: '산업부(KIAT)', title: '엘살바도르 디지털전환분야현장 애로기술지도', period: '23.05.01~27.12.31(23.07.01~27.12.31)' },
      { agency: '산업부(KIAT)', title: '과테말라 섬유 TASK센터 조성 지원', period: '24.05.01~27.12.31(24.05.01~27.12.31)' },
      { agency: '경상북도', title: '2024 경상북도 과테말라 기계전 및 판촉전', period: '24.03.01~24.12.31(24.03.01~24.12.31)' }
    ],
    footprint: {
      '아시아': ['한국', '우즈베키스탄', '타지키스탄', '캄보디아', '미얀마', '베트남', '인도네시아', '필리핀', '라오스', '키르기스스탄', '말레이시아', '싱가포르', '일본', '중국', '카자흐스탄', '태국', '튀르키예', '홍콩', '마카오'],
      '유럽': ['영국', '네덜란드', '오스트리아', '러시아', '헝가리', '덴마크', '체코'],
      '아메리카': ['과테말라', '미국', '캐나다'],
      '오세아니아': ['호주', '피지'],
      '아프리카': ['에티오피아']
    }
  }
};

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = TEAM_DATA[id];
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  if (!member) return <div className="min-h-screen flex items-center justify-center">Member not found</div>;

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Corporate Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6 md:px-12 py-3 flex items-center gap-3 text-xs text-slate-500 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-saemaul-green">HOME</button>
          <span>&gt;</span>
          <button onClick={() => navigate('/contact')} className="hover:text-saemaul-green">구성원</button>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold">{member.name}</span>
        </div>
      </div>

      {/* Hero Section inspired by Shin & Kim */}
      <div className="relative bg-slate-900 overflow-hidden group" style={{ height: '360px' }}>
        {/* Abstract background decor */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-30 grayscale z-0 transition-transform duration-[10s] group-hover:scale-110" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000')", backgroundSize: 'cover' }} 
        />
        
        <div className="container mx-auto px-6 md:px-12 h-full flex flex-col justify-center relative z-20 text-white">
          <span className="inline-block text-saemaul-green font-bold tracking-[0.2em] text-sm mb-3">{member.role.toUpperCase()}</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">{member.name}</h1>
          <p className="text-slate-400 text-xl max-w-xl font-medium border-l-4 border-saemaul-green pl-5">
            {member.dept} | {member.year}
          </p>
        </div>
      </div>

      {/* Contact Bar */}
      <div className="bg-[#f8f9fa] border-b border-slate-200 py-5 sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 flex flex-wrap items-center gap-x-12 gap-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-black tracking-wider w-10">TEL</span>
            <a href={`tel:${member.tel}`} className="font-medium text-slate-800 hover:text-saemaul-green hover:underline transition-all">{member.tel}</a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-black tracking-wider w-10">MAIL</span>
            <a href={`mailto:${member.email}`} className="font-medium text-slate-800 hover:text-saemaul-green hover:underline transition-all">{member.email}</a>
          </div>
        </div>
      </div>

      {/* Content Layout: 2-Column */}
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Content (75%) */}
          <div className="lg:w-3/4">
            
            {/* Intro Statement */}
            <section id="intro" className="mb-16">
              <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b-2 border-slate-900 tracking-tight">프로필 소개</h2>
              <p className="text-lg leading-relaxed text-slate-700 font-medium whitespace-pre-line">
                {member.intro || `${member.name} ${member.role}은 영남대학교 ${member.dept}의 우수 인재로서, 다양한 글로벌 개발협력 및 사회혁신 프로젝트를 통해 지속 가능한 발전 목표(SDGs) 실현에 앞장서고 있습니다.`}
              </p>
            </section>

            {/* Education Section */}
            <section id="education" className="mb-16">
              <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b-2 border-slate-900 tracking-tight">학력 사항</h2>
              <div className="space-y-0 border-t border-slate-100">
                {member.education.map((edu, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-start border-b border-slate-100 py-6 group hover:bg-slate-50 px-4 transition-colors duration-200">
                    <div className="sm:w-1/4 text-sm font-bold text-slate-500 tracking-tight mb-2 sm:mb-0 group-hover:text-saemaul-green transition-colors">
                      {edu.period}
                    </div>
                    <div className="sm:w-3/4 text-[15px] font-medium text-slate-800">
                      {edu.desc}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Activities Timeline Section */}
            {member.activities.length > 0 && (
              <section id="activities" className="mb-16">
                <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b-2 border-slate-900 tracking-tight">경력 및 주요 활동</h2>
                <div className="space-y-0 border-t border-slate-100">
                  {member.activities.map((item, idx) => {
                    const isTarget = item.desc.includes('경북테크노파크 글로벌협력실');
                    return (
                      <div 
                        key={idx} 
                        onClick={isTarget ? () => setIsProjectsOpen(!isProjectsOpen) : undefined}
                        className={`flex flex-col sm:flex-row sm:items-start border-b border-slate-100 py-6 group px-4 transition-colors duration-200 ${isTarget ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50'}`}
                      >
                        <div className="sm:w-1/4 text-sm font-bold text-slate-500 tracking-tight mb-2 sm:mb-0 group-hover:text-saemaul-green transition-colors">
                          {item.period}
                        </div>
                        <div className="sm:w-3/4 flex flex-col">
                          <div className="flex items-center justify-between gap-4 text-[15px] leading-relaxed text-slate-800 font-medium group-hover:font-semibold transition-all">
                            <span>{item.desc}</span>
                            {isTarget && (
                              <svg className={`w-5 h-5 text-slate-400 group-hover:text-saemaul-green transition-transform duration-300 shrink-0 ${isProjectsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Collapsible Projects Table */}
                          {isTarget && member.projects && member.projects.length > 0 && (
                            <div 
                              onClick={(e) => e.stopPropagation()} // 테이블 내부 클릭 시 토글 방지
                              className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${isProjectsOpen ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}
                            >
                              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                                <table className="min-w-full divide-y divide-slate-200 text-left">
                                  <thead className="bg-slate-50/50">
                                    <tr>
                                      <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-wider">전담기관</th>
                                      <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-wider">연구개발과제명</th>
                                      <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-wider">연구개발기간(참여한 기간)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                    {member.projects.map((proj, pIdx) => (
                                      <tr key={pIdx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 text-sm font-semibold text-slate-700 whitespace-nowrap leading-relaxed">{proj.agency}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-900 leading-relaxed">{proj.title}</td>
                                        <td className="px-8 py-6 text-sm font-medium text-slate-500 whitespace-nowrap leading-relaxed">{proj.period}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Global Footprint Section */}
            {member.footprint && (
              <section id="footprint" className="mb-16">
                <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b-2 border-slate-900 tracking-tight">Global Footprint</h2>
                <div className="space-y-6 border-t border-slate-100 pt-6">
                  {Object.entries(member.footprint).map(([continent, countries]) => (
                    <div key={continent} className="flex flex-col sm:flex-row sm:items-start border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                      <div className="sm:w-1/4 text-sm font-black text-slate-800 tracking-tight mb-3 sm:mb-0 flex items-center">
                        <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black rounded-lg tracking-wider">
                          {continent}
                        </span>
                      </div>
                      <div className="sm:w-3/4 flex flex-wrap gap-2">
                        {countries.map((country, cIdx) => (
                          <span 
                            key={cIdx} 
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 hover:border-saemaul-green hover:bg-saemaul-light hover:text-saemaul-green rounded-full text-xs font-bold text-slate-600 transition-all duration-200 cursor-default"
                          >
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Floating Index (25%) */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-48">
              <h4 className="text-sm font-black text-slate-900 mb-6 border-b pb-2">TABLE OF CONTENTS</h4>
              <nav className="relative border-l-2 border-slate-200 ml-2">
                <div className="space-y-6">
                  <a href="#intro" className="flex items-center group -ml-[9px]">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-saemaul-green transition-colors z-10"></div>
                    <span className="ml-4 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">프로필 소개</span>
                  </a>
                  <a href="#education" className="flex items-center group -ml-[9px]">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-saemaul-green transition-colors z-10"></div>
                    <span className="ml-4 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">학력 사항</span>
                  </a>
                  {member.activities.length > 0 && (
                    <a href="#activities" className="flex items-center group -ml-[9px]">
                      <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-saemaul-green transition-colors z-10"></div>
                      <span className="ml-4 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">경력 및 주요 활동</span>
                    </a>
                  )}
                  {member.projects && member.projects.length > 0 && (
                    <button 
                      onClick={() => {
                        setIsProjectsOpen(true);
                        const element = document.getElementById('activities');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center group -ml-[9px] text-left bg-transparent border-0 p-0 focus:outline-none w-full cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-saemaul-green transition-colors z-10"></div>
                      <span className="ml-4 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">연구개발과제</span>
                    </button>
                  )}
                  {member.footprint && (
                    <a href="#footprint" className="flex items-center group -ml-[9px]">
                      <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-saemaul-green transition-colors z-10"></div>
                      <span className="ml-4 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Global Footprint</span>
                    </a>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const { t } = useTranslation();
  const members = Object.values(TEAM_DATA);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-500 text-lg">Global Saemaul-SDGs 플랫폼 제작팀을 소개합니다.</p>
          <p className="text-sm text-slate-400 mt-2 font-medium">카드를 클릭하여 상세 프로필과 전문 이력을 확인하실 수 있습니다.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Link 
              key={m.id} 
              to={`/profile/${m.id}`}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 flex flex-col active:scale-95 cursor-pointer"
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${m.role.includes('팀장') ? 'bg-saemaul-green' : 'bg-slate-200'} transition-colors group-hover:bg-saemaul-green`} />
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2">
                <ArrowRightCircle className="text-saemaul-green" size={24} />
              </div>

              <div className="mb-6 pt-2 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 transition-colors group-hover:text-saemaul-green">
                    {m.name}
                    {m.role.includes('팀장') && <span className="text-xs font-bold px-2 py-0.5 rounded bg-saemaul-light text-saemaul-green">팀장</span>}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium mt-1">{m.dept}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-slate-600 font-medium mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-12 shrink-0 text-xs uppercase">학년/번</span>
                  <span>{m.year} / {m.studentId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-12 shrink-0 text-xs uppercase">전화</span>
                  <span>{m.tel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-12 shrink-0 text-xs uppercase">이메일</span>
                  <span className="text-xs truncate">{m.email}</span>
                </div>
              </div>

              {m.activities.length > 0 && (
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">대표 활동</h4>
                  <ul className="space-y-2.5">
                    {m.activities.slice(0, 3).map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-600 truncate">
                        <div className="w-1 h-1 rounded-full bg-saemaul-green mt-1.5 shrink-0" />
                        {act.desc}
                      </li>
                    ))}
                    {m.activities.length > 3 && <li className="text-[10px] text-saemaul-green font-bold mt-1">+ {m.activities.length - 3}개 더보기</li>}
                  </ul>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrivacyPage = () => (
  <div className="min-h-screen bg-slate-50 pt-32 pb-20">
    <div className="container mx-auto px-6 max-w-3xl bg-white p-10 rounded-3xl shadow-sm border text-slate-800 text-sm leading-relaxed">
      <h1 className="text-3xl font-black mb-8 text-slate-900 border-b pb-4">개인정보 처리방침</h1>
      <div className="space-y-6">
        <p>Global Saemaul-SDGs 플랫폼은 이용자의 개인정보 보호를 소중히 다루며, 관련 법령을 준수합니다. 본 방침은 당사가 이용자로부터 수집하는 정보와 그 사용법을 규정합니다.</p>
        
        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">1. 수집하는 개인정보 항목 및 목적</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>이메일 로그인:</strong> 이메일 주소, 비밀번호, 닉네임 (본인 인증 및 계정 관리)</li>
            <li><strong>구글 로그인:</strong> 이메일 주소, 프로필 사진, 닉네임 (간편 회원가입 및 프로필 연동)</li>
            <li><strong>서비스 이용 과정:</strong> 포인트 획득/사용 이력, 출석 기록, 작성 글/댓글, 팔로우 관계 데이터</li>
          </ul>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">2. 개인정보의 안전성 확보 조치 (암호화)</h3>
          <p>플랫폼은 안전한 데이터 관리를 위해 다음과 같은 보안 조치를 시행합니다:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>비밀번호 암호화:</strong> 사용자 비밀번호는 안전한 일방향 해시 알고리즘(scrypt 등)으로 암호화되어 관리자도 복호화할 수 없도록 보존됩니다.</li>
            <li><strong>데이터 전송 암호화:</strong> 웹 브라우저와 서버 간 모든 데이터 전송은 SSL/TLS 보안 프로토콜을 통과합니다.</li>
            <li><strong>저장 장치 암호화:</strong> 데이터베이스(Firestore)에 저장된 모든 데이터는 Google 관리형 암호화 표준(AES-256)에 따라 안전하게 보관됩니다.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">3. 개인정보의 보유 및 파기 절차</h3>
          <p>수집된 개인정보는 회원 탈퇴 시 혹은 목적 달성 후 지체 없이 파기됩니다. 탈퇴 즉시 계정 정보는 식별 불가능한 형태로 즉각 삭제 처리됩니다.</p>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">4. 이용자의 권리</h3>
          <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 혹은 삭제(회원 탈퇴)를 요구할 수 있습니다. 관련 처리는 마이페이지 또는 시스템을 통해 직접 수행할 수 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
);

const TermsPage = () => (
  <div className="min-h-screen bg-slate-50 pt-32 pb-20">
    <div className="container mx-auto px-6 max-w-3xl bg-white p-10 rounded-3xl shadow-sm border text-slate-800 text-sm leading-relaxed">
      <h1 className="text-3xl font-black mb-8 text-slate-900 border-b pb-4">이용약관</h1>
      <div className="space-y-6">
        <p>본 약관은 Global Saemaul-SDGs 플랫폼(이하 "플랫폼")이 제공하는 각종 디지털 아카이브 및 기여 시스템의 이용 조건과 절차를 규정합니다.</p>

        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">1. 서비스 정의 및 제공</h3>
          <p>플랫폼은 새마을 역사 e북 리더, 번역 기여 시스템, 커뮤니티, 챗봇, RPG 등의 학술적 및 교육용 서비스를 제공합니다. 플랫폼의 모든 기여 활동은 자발적 참여를 기반으로 합니다.</p>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">2. 기여 포인트 및 상점 시스템</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>플랫폼 활동(출석, 커뮤니티 작성, e북 오류 제안 등)을 통해 기여 포인트를 적립할 수 있습니다.</li>
            <li>포인트는 플랫폼 내부 서비스(뱃지 획득, 칭호 장착, 아이템 구매 등)에서만 사용 가능하며 현금이나 현실 재화로 환급되지 않습니다.</li>
            <li>비정상적인 방법으로 포인트를 취득하거나 시스템 악용 시 회수 처리 및 계정 정지가 발생할 수 있습니다.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">3. 커뮤니티 및 게시물 이용 수칙</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>타인을 모독하거나 스팸, 불법 광고, 저작권 침해 게시물을 작성해서는 안 됩니다.</li>
            <li>관리자는 불량 글 및 도배성 광고 게시물 발견 시 예고 없이 즉각 삭제하거나 이용자의 서비스 권한을 박탈할 수 있습니다.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-900 mb-2">4. 지적재산권</h3>
          <p>플랫폼이 제공하는 e북 콘텐츠, 디자인 에셋, 기여 시스템 등은 플랫폼의 소유이므로 상업적 목적으로 무단 전재, 배포 및 수정할 수 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
);


function App() {
  const location = useLocation();
  // 동적 SEO 최적화 제어 훅 작동
  useSEO();

  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 모바일 메뉴 토글 상태
  const [isVideoOpen, setIsVideoOpen] = useState(false); // 영상 플레이어 모달 토글 상태
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await ensureUserProfile(currentUser.uid, currentUser.displayName, currentUser.email);
          if (currentUser.email === import.meta.env.VITE_ADMIN_EMAIL && import.meta.env.DEV) {
            await seedMockUsers();
          }
        } catch (e) {
          console.error("Failed to ensure user profile:", e);
        }
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const shareToKakao = () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: 'Saemaul-SDGs Platform',
          description: 'Towards a Safer and Happier World, Saemaul-SDGs Platform',
          imageUrl: 'https://saemaul-sdgs.web.app/assets/og-image.png',
          link: {
            mobileWebUrl: 'https://saemaul-sdgs.web.app',
            webUrl: 'https://saemaul-sdgs.web.app',
          },
        },
        buttons: [
          {
            title: '구경가기 👀',
            link: {
              mobileWebUrl: 'https://saemaul-sdgs.web.app',
              webUrl: 'https://saemaul-sdgs.web.app',
            },
          },
        ],
      });
    } else {
      alert("카카오톡 공유를 위해 설정이 필요합니다.");
    }
  };

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-white py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between relative">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 group z-50">
            <div className="w-10 h-10 overflow-hidden rounded-xl shadow-lg shadow-saemaul-green/20 flex items-center justify-center bg-white border border-slate-100 group-hover:scale-105 transition-transform">
              <img src="https://www.saemaul.or.kr/images/sub/company/ci_2img2.png" alt="Saemaul Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 group-hover:text-saemaul-green transition-colors">
              Saemaul<span className="text-saemaul-green">-SDGs</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <NavItem label={t('nav.home')} to="/" />
            <NavItem label={t('nav.test')} to="/saemaul-test" />
            <NavItem label={t('nav.chatbot')} to="/chatbot" />
            <NavItem label={t('nav.community')} to="/community" />
            <NavItem label={t('nav.hub')} to="/hub" />
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200/50 text-xs font-bold hover:bg-white/50 hover:shadow-sm transition-all uppercase bg-white z-50"
            >
              <Languages size={14} className="text-saemaul-green" />
              <span className="hidden sm:inline">{i18n.language === 'ko' ? 'English' : '한국어'}</span>
              <span className="sm:hidden">{i18n.language === 'ko' ? 'EN' : 'KO'}</span>
            </button>
            
            <div className="hidden sm:block">
              {user ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} 
                    alt="Profile" 
                    className="w-9 h-9 rounded-full border-2 border-saemaul-green shadow-sm" 
                  />
                  <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                    {i18n.language === 'ko' ? '로그아웃' : 'Logout'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className="btn-primary py-2.5 px-6 text-sm">
                  {t('nav.join')}
                </button>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 focus:outline-none z-50"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown Menu Panel */}
          <div className={`absolute top-[100%] left-0 w-full bg-white border-t border-slate-100 shadow-2xl flex-col py-6 px-6 lg:hidden z-40 transition-all duration-300 ${isMenuOpen ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-4'}`}>
            <div className="flex flex-col gap-2 font-bold text-slate-600 mb-6">
              {[
                { label: t('nav.home'), to: "/" },
                { label: t('nav.test'), to: "/saemaul-test" },
                { label: t('nav.chatbot'), to: "/chatbot" },
                { label: t('nav.community'), to: "/community" },
                { label: t('nav.hub'), to: "/hub" }
              ].map((item, idx) => (
                <Link 
                  key={idx} 
                  to={item.to} 
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3.5 px-4 hover:bg-slate-50 hover:text-saemaul-green rounded-xl transition-all flex items-center justify-between group"
                >
                  <span className="text-base">{item.label}</span>
                  <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 text-saemaul-green transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-100">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl">
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} alt="Profile" className="w-10 h-10 rounded-full border-2 border-saemaul-green shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{user.displayName}</p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                    className="w-full py-3.5 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-all"
                  >
                    {i18n.language === 'ko' ? '로그아웃' : 'Logout'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} 
                  className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-saemaul-green/20"
                >
                  {t('nav.join')}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32 overflow-hidden min-h-[80vh] flex items-center">
            <div className="absolute inset-0 z-0">
              <img 
                src="/assets/national-sm-map.png" 
                alt="Global Connection Map" 
                className="w-full h-full object-cover opacity-30 sm:opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center animate-fade-in flex flex-col items-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-slate-900 leading-[1.2] sm:leading-tight mb-6 tracking-tight break-keep">
                  {t('hero.title1')} <br />
                  <span className="text-saemaul-green">{t('hero.title2')}</span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-medium break-keep mx-auto">
                  {t('hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
                  <button 
                    onClick={() => setIsVideoOpen(true)}
                    className="px-8 py-3.5 sm:py-4 rounded-full font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 bg-white/50 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={16} className="fill-slate-600 text-slate-600" />
                    {t('hero.cta_demo')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Grid */}
          <section className="py-24 bg-white relative">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-4xl font-black text-slate-900 mb-4">
                  {t('features.title')}
                </h2>
                <p className="text-slate-500 font-medium">
                  {t('features.subtitle')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <FeatureCard 
                  icon={Bot}
                  title={t('features.card3.title')}
                  description={t('features.card3.desc')}
                  color="emerald"
                  learnMoreText={t('features.learn_more')}
                  to="/chatbot"
                />
                <FeatureCard 
                  icon={Home}
                  title={t('features.card2.title')}
                  description={t('features.card2.desc')}
                  color="amber"
                  learnMoreText={t('features.learn_more')}
                  to="/community"
                />
                <FeatureCard 
                  icon={UserCheck}
                  title={t('features.card1.title')}
                  description={t('features.card1.desc')}
                  color="blue"
                  learnMoreText={t('features.learn_more')}
                  to="/saemaul-test"
                />
                <FeatureCard 
                  icon={BookOpen}
                  title={t('features.card4.title')}
                  description={t('features.card4.desc')}
                  color="indigo"
                  learnMoreText={t('features.learn_more')}
                  to="/hub"
                />
              </div>
            </div>
          </section>

              {/* Feedback Invitation Banner Card */}
              <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-6 max-w-5xl">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 sm:p-12 rounded-[32px] border border-slate-800 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,146,71,0.12),transparent_50%)]" />
                    <div className="text-left relative z-10 max-w-xl">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-saemaul-green/10 text-saemaul-green text-xs font-bold rounded-full border border-saemaul-green/20 mb-4 uppercase tracking-wider">
                        Feedback & Community
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">더 나은 새마을-SDGs 플랫폼을 위해</h3>
                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
                        오타 발견 제안, 신규 기능 건의, 사용 소감 등 어떠한 의견이라도 좋습니다. 비공개 제안 기능도 함께 지원하며, 남겨주신 소중한 건의는 플랫폼 발전의 큰 밑거름이 됩니다.
                      </p>
                    </div>
                    <Link 
                      to="/feedback" 
                      className="btn-primary py-3.5 px-8 text-sm font-bold shadow-lg shadow-saemaul-green/20 relative z-10 hover:-translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <MessageSquare size={16} />
                      주민 의견 남기기
                    </Link>
                  </div>
                </div>
              </section>

              {/* Partner Marquee */}
              <PartnerBanner />
            </>
          } />
          <Route path="/saemaul-test" element={<SaemaulTest />} />
          <Route path="/test" element={<LeadershipTest />} />
          <Route path="/spirit-test" element={<SpiritTest />} />
          <Route path="/spirit-map" element={<SpiritMapPage />} />
          <Route path="/archive/:filename" element={<DocViewer />} />
          <Route path="/reader/:bookId" element={<BookReader />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/hub" element={<KnowledgeHub />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Routes>
      </main>

      {/* Footer */}
      {!location.pathname.startsWith('/reader/') && (
        <footer className="bg-slate-950 text-white py-16 sm:py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="sm:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
                <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity inline-flex">
                  <div className="w-12 h-12 overflow-hidden rounded-2xl shadow-lg flex items-center justify-center bg-white border border-slate-100">
                    <img src="https://www.saemaul.or.kr/images/sub/company/ci_2img2.png" alt="Saemaul Logo" className="w-full h-full object-contain p-1.5" />
                  </div>
                  <span className="text-2xl font-black tracking-tight">Saemaul<span className="text-saemaul-green">-SDGs</span></span>
                </Link>
                <p className="text-slate-400 max-w-sm mb-8">
                  {t('footer.desc')}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <h5 className="font-bold mb-6">{t('footer.links')}</h5>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li><Link to="/privacy" className="hover:text-saemaul-green transition-colors">{t('footer.p_policy')}</Link></li>
                  <li><Link to="/terms" className="hover:text-saemaul-green transition-colors">{t('footer.terms')}</Link></li>
                  <li><Link to="/contact" className="hover:text-saemaul-green transition-colors">{t('footer.contact')}</Link></li>
                  <li><Link to="/feedback" className="hover:text-saemaul-green transition-colors">{i18n.language === 'ko' ? '의견 피드백 제안' : 'Suggest Feedback'}</Link></li>
                </ul>
              </div>
              <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
                <h5 className="font-bold mb-6">{t('footer.connect')}</h5>
                <div className="flex gap-4">
                  <button onClick={shareToKakao} aria-label="Share to Kakao" className="px-5 h-10 rounded-full bg-[#FEE500] flex items-center justify-center hover:bg-[#eacc00] transition-colors cursor-pointer text-slate-900 font-bold text-sm gap-2">
                    <MessageCircle size={18} className="text-slate-900" />
                    카카오 공유
                  </button>
                  {[1,2,3].map(i => (
                    <a href="#!" target="_blank" rel="noopener noreferrer" key={i} aria-label="Social media link" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-saemaul-green transition-colors cursor-pointer text-white">
                      <ExternalLink size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-20 pt-8 border-t border-slate-900 text-center text-slate-500 text-sm">
              © 2026 Global Saemaul-SDGs Platform. {t('footer.rights')}.<br />
              <span className="mt-2 block">Copyright by 권도경, 박문식, 윤서윤, 영남대학교</span>
            </div>
          </div>
        </footer>
      )}

      {/* Video Modal Overlay */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#00843D]/10 text-[#00843D] flex items-center justify-center flex-shrink-0">
                  <Play size={20} className="fill-[#00843D] text-[#00843D]" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-slate-900 truncate">Saemaul-SDGs Platform Strategy 🎥</h4>
                  <p className="text-xs text-slate-500 font-medium">Towards a Safer and Happier World</p>
                </div>
              </div>
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* HTML5 Video Player playing local video_SDGs.mp4 */}
            <div className="relative w-full bg-black flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
              <video
                src={`${import.meta.env.BASE_URL}video_SDGs.mp4`}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            </div>
          </div>
        </div>
      )}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default App;
