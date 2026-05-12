import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import LeadershipTest from './pages/LeadershipTest/LeadershipTest';
import SaemaulTest from './pages/SaemaulTest/SaemaulTest';
import DocViewer from './pages/DocViewer/DocViewer';
import KnowledgeHub from './pages/KnowledgeHub/KnowledgeHub';
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

const NavItem = ({ label, to }) => (
  <Link to={to || '#!'} className="nav-link flex flex-col items-start group">
    <span className="text-sm font-semibold">{label}</span>
  </Link>
);

const FeatureCard = ({ icon: Icon, title, description, color, learnMoreText, to }) => {
  const navigate = useNavigate();

  // Pre-define color classes for Tailwind static analysis
  const colorMap = {
    blue: "bg-blue-500/10",
    amber: "bg-amber-500/10",
    emerald: "bg-emerald-500/10",
    indigo: "bg-indigo-500/10"
  };

  return (
    <div 
      onClick={() => to && navigate(to)}
      className="glass-card p-8 rounded-3xl cursor-pointer group relative overflow-hidden h-full flex flex-col transition-transform hover:-translate-y-2"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${colorMap[color] || 'bg-slate-500/10'} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500`} />
      <div className={`w-14 h-14 ${colorMap[color] || 'bg-slate-500/10'} rounded-2xl flex items-center justify-center mb-6 group-hover:bg-saemaul-green group-hover:text-white transition-all duration-300`}>
        {Icon && <Icon size={28} className="transition-colors" />}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      <div className="flex items-center text-saemaul-green font-bold text-sm gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {learnMoreText} <ChevronRight size={16} />
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
    <section className="py-16 bg-white border-y border-slate-100 overflow-hidden relative z-10">
      <div className="container mx-auto px-6 mb-10 text-center">
        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Partnerships & Cooperation</h4>
        <div className="w-12 h-1 bg-saemaul-green mx-auto rounded-full opacity-20" />
      </div>
      <div className="relative flex overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap gap-24 items-center py-6">
          {doublePartners.map((partner, idx) => (
            <a 
              key={idx} 
              href={partner.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 group transition-all duration-300"
            >
              <div className="w-2 h-2 rounded-full bg-saemaul-green opacity-40 group-hover:scale-150 group-hover:opacity-100 transition-all" />
              <span className="text-slate-500 font-extrabold text-lg tracking-tight group-hover:text-saemaul-green transition-colors">
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
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white" style={{ height: '80vh' }}>
          <iframe 
            src={`${import.meta.env.BASE_URL}chatbot.html`}
            className="w-full h-full border-none"
            title="AI Chatbot"
          />
        </div>
      </div>
    </div>
  );
};

const CommunityPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-bold mb-4 border border-amber-200">
            <Home size={16} />
            {t('features.card2.title')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">{t('nav.community')}</h1>
          <p className="text-slate-500">{t('features.card2.desc')}</p>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white" style={{ height: '85vh' }}>
          <iframe 
            src={`${import.meta.env.BASE_URL}community.html`}
            className="w-full h-full border-none"
            title="Community Hub"
          />
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
    studentId: '22321562',
    tel: '010-3365-0480',
    email: 'rnjsehrud08@naver.com',
    activities: [
      { period: '2025 ~ 2026', desc: '포스코비욘드 18기 (인도네시아 현지 사회문제 해결 프로젝트)' },
      { period: '2024 ~ 2025', desc: '굿네이버스 한빛 7-8기 유아 성폭력예방인형극단 (우수활동팀)' },
      { period: '2025', desc: '대구국제개발협력센터 베트남 해외 교육봉사 프로그램 기획/활동' },
      { period: '2025', desc: '대꾸오다 4기 ODA 홍보 콘텐츠 기획 및 전문가 교육 캠페인' },
      { period: '2025', desc: 'YU&EYE 학생 모니터링단 교육혁신 제안 활동 (장려상 수상)' },
      { period: '2024', desc: '산격종합사회복지관 온마을어울림축제 대학생 기획단 운영' },
      { period: '2025', desc: '2026대구세계마스터즈육상경기대회 대학생 홍보단 (대회 및 SDGs 홍보)' },
      { period: '2025', desc: '제16기 사회리더 대학생 멘토링 멘티' }
    ]
  },
  yoon: {
    id: 'yoon',
    name: '윤서윤',
    role: '팀원',
    dept: '국제개발새마을학과',
    year: '2학년',
    studentId: '22521411',
    tel: '010-5723-3567',
    email: 'ysy79999@naver.com',
    activities: []
  },
  park: {
    id: 'park',
    name: '박문식',
    role: '팀원 / 연구위원',
    dept: '새마을국제개발학과',
    year: '박사1기',
    studentId: '22650117',
    tel: '010-4286-3104',
    email: 'plbm521@ynu.ac.kr',
    activities: [
      { period: '2023.07 ~ 현재', desc: '경북테크노파크 글로벌협력실 전임연구원 (국제개발협력 사업 기획/실무)' },
      { period: '2019', desc: '영국 사회적기업(Social Enterprise) 현지 조사 연구' },
      { period: '2018', desc: 'LG전자 CSR Field Study (미얀마 현지 필드 스터디)' },
      { period: '2018', desc: '현대자동차 해피무브 글로벌 청년봉사단 18기 (라오스 지역 봉사)' },
      { period: '2017', desc: '인도네시아 국제개발협력 실무 인턴십 활동' },
      { period: '2017', desc: '베트남국립농업대학(VNUA) 대학교류 및 해외새마을운동 현장 견학' },
      { period: '2017', desc: '경상북도 대학생 새마을 해외봉사단 (키르기즈스탄)' },
      { period: '2016 ~ 2018', desc: '필리핀 Enderun Colleges 등 주요 대학 교류 및 대외 활동' }
    ]
  }
};

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = TEAM_DATA[id];

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
          <div className="ml-auto flex items-center gap-2">
            <button className="px-5 py-2 bg-[#4b2e2e] text-white text-xs font-bold rounded hover:brightness-110 transition-all flex items-center gap-2 shadow-sm">
              <Download size={14} /> vCard 다운로드
            </button>
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
              <p className="text-lg leading-relaxed text-slate-700 font-medium">
                {member.name} {member.role}은 영남대학교 {member.dept}의 우수 인재로서, 다양한 글로벌 개발협력 및 사회혁신 프로젝트를 통해 지속 가능한 발전 목표(SDGs) 실현에 앞장서고 있습니다.
              </p>
            </section>

            {/* Activities Timeline Section */}
            {member.activities.length > 0 && (
              <section id="activities" className="mb-16">
                <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b-2 border-slate-900 tracking-tight">경력 및 주요 활동</h2>
                <div className="space-y-0 border-t border-slate-100">
                  {member.activities.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-start border-b border-slate-100 py-6 group hover:bg-slate-50 px-4 transition-colors duration-200">
                      <div className="sm:w-1/4 text-sm font-bold text-slate-500 tracking-tight mb-2 sm:mb-0 group-hover:text-saemaul-green transition-colors">
                        {item.period}
                      </div>
                      <div className="sm:w-3/4 text-[15px] leading-relaxed text-slate-800 font-medium group-hover:font-semibold transition-all">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education Placeholder Section */}
            <section id="education" className="mb-16">
              <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b-2 border-slate-900 tracking-tight">학력 사항</h2>
              <div className="flex border-b border-slate-100 py-6 px-4">
                <div className="w-1/4 text-sm font-bold text-slate-500">재학 중</div>
                <div className="w-3/4 text-[15px] font-medium text-slate-800">
                  영남대학교 {member.dept} ({member.year})
                </div>
              </div>
            </section>
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
                  {member.activities.length > 0 && (
                    <a href="#activities" className="flex items-center group -ml-[9px]">
                      <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-saemaul-green transition-colors z-10"></div>
                      <span className="ml-4 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">경력 및 주요 활동</span>
                    </a>
                  )}
                  <a href="#education" className="flex items-center group -ml-[9px]">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-saemaul-green transition-colors z-10"></div>
                    <span className="ml-4 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">학력 사항</span>
                  </a>
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

        <div className="grid gap-8 lg:grid-cols-3">
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
    <div className="container mx-auto px-6 max-w-3xl bg-white p-10 rounded-3xl shadow-sm border">
      <h1 className="text-3xl font-black mb-8">개인정보 처리방침</h1>
      <div className="prose prose-slate max-w-none">
        <p>Global Saemaul-SDGs 플랫폼은 사용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 등 관련 법령을 준수합니다.</p>
        <h3 className="font-bold mt-6">1. 수집하는 개인정보 항목</h3>
        <p>플랫폼은 원활한 서비스 제공을 위해 구글 소셜 로그인 연동 시 사용자의 프로필 사진, 닉네임, 이메일 주소를 활용하며, 이 정보는 로컬 서비스 환경 제공 이외의 목적으로 사용되지 않습니다.</p>
        <h3 className="font-bold mt-6">2. 개인정보의 보유 및 이용기간</h3>
        <p>수집된 정보는 사용자가 로그아웃하거나 서비스를 탈퇴할 때까지 보유하며, 법적 사유가 없는 한 즉시 파기됩니다.</p>
      </div>
    </div>
  </div>
);

const TermsPage = () => (
  <div className="min-h-screen bg-slate-50 pt-32 pb-20">
    <div className="container mx-auto px-6 max-w-3xl bg-white p-10 rounded-3xl shadow-sm border">
      <h1 className="text-3xl font-black mb-8">이용약관</h1>
      <div className="prose prose-slate max-w-none">
        <p>이 약관은 Global Saemaul-SDGs 플랫폼이 제공하는 모든 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
        <h3 className="font-bold mt-6">1. 서비스의 제공</h3>
        <p>플랫폼은 새마을 리더십 테스트, 마을회관 커뮤니티, AI 챗봇 등의 교육적 및 연구 목적의 콘텐츠를 무료로 제공합니다.</p>
        <h3 className="font-bold mt-6">2. 이용자의 의무</h3>
        <p>이용자는 본 플랫폼에서 제공하는 콘텐츠를 무단 복제, 변형, 배포하여서는 안 되며, 커뮤니티 내에서 타인의 권리를 침해하는 행위를 금지합니다.</p>
      </div>
    </div>
  </div>
);


function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
          title: 'Global Saemaul-SDGs Platform',
          description: '전통의 가치를 디지털로 완성하다 - 글로벌 새마을-SDGs 통합 플랫폼\n궁금하면 어서 구경오세요~',
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 overflow-hidden rounded-xl shadow-lg shadow-saemaul-green/20 flex items-center justify-center bg-white border border-slate-100 group-hover:scale-105 transition-transform">
              <img src="https://www.saemaul.or.kr/images/sub/company/ci_2img2.png" alt="Saemaul Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 group-hover:text-saemaul-green transition-colors">
              Saemaul<span className="text-saemaul-green">-SDGs</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavItem label={t('nav.home')} to="/" />
            <NavItem label={t('nav.test')} to="/saemaul-test" />
            <NavItem label={t('nav.chatbot')} to="/chatbot" />
            <NavItem label={t('nav.community')} to="/community" />
            <NavItem label={t('nav.hub')} to="/hub" />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors uppercase"
            >
              <Languages size={14} className="text-saemaul-green" />
              {i18n.language === 'ko' ? 'English' : '한국어'}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-saemaul-green" 
                />
                <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                  {i18n.language === 'ko' ? '로그아웃' : 'Logout'}
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="btn-primary py-2 px-5 text-sm">
                {t('nav.join')}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="/assets/national-sm-map.png" 
                alt="Global Connection Map" 
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saemaul-light text-saemaul-green text-sm font-bold mb-6 border border-saemaul-green/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saemaul-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-saemaul-green"></span>
                    </span>
                    {t('hero.badge')}
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
                    {t('hero.title1')} <br />
                    <span className="text-saemaul-green">{t('hero.title2')}</span>
                  </h1>
                  <p className="text-slate-600 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
                    {t('hero.subtitle')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/saemaul-test" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                      {t('hero.cta_start')} <ArrowRight size={20} />
                    </Link>
                    <button className="px-8 py-4 rounded-full font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                      {t('hero.cta_demo')}
                    </button>
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="card-3d-wrap">
                    <div className="card-3d glass-card p-10 rounded-[40px] shadow-2xl relative overflow-hidden border-2 border-white/50">
                      <div className="absolute top-0 right-0 p-8">
                         <div className="w-16 h-16 bg-saemaul-green text-white rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                            <Trophy size={32} />
                         </div>
                      </div>
                      <div className="mb-10">
                        <h4 className="text-saemaul-green font-bold text-sm tracking-widest uppercase mb-2">{t('live.status')}</h4>
                        <div className="flex items-center gap-4">
                          <div className="text-4xl font-black">124+</div>
                          <div className="text-slate-500 font-medium leading-tight">{t('live.villages')}</div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="bg-slate-50/50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <UserCheck size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{t('live.role_unlock')}</p>
                            <p className="text-xs text-slate-400">{t('live.leader')}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Globe size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{t('live.milestone')}</p>
                            <p className="text-xs text-slate-400">{t('live.partnership')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex -space-x-2">
                           {[1,2,3,4].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                           ))}
                           <div className="w-8 h-8 rounded-full bg-saemaul-green text-white text-[10px] flex items-center justify-center border-2 border-white">+12k</div>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{t('live.engaging')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-saemaul-green/20 rounded-full blur-3xl" />
                  <div className="absolute -z-10 -top-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
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

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard 
                  icon={UserCheck}
                  title={t('features.card1.title')}
                  description={t('features.card1.desc')}
                  color="blue"
                  learnMoreText={t('features.learn_more')}
                  to="/saemaul-test"
                />
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

              {/* Partner Marquee */}
              <PartnerBanner />
            </>
          } />
          <Route path="/saemaul-test" element={<SaemaulTest />} />
          <Route path="/test" element={<LeadershipTest />} />
          <Route path="/docs/:filename" element={<DocViewer />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/hub" element={<KnowledgeHub />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
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
            <div>
              <h5 className="font-bold mb-6">{t('footer.links')}</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link to="/privacy" className="hover:text-saemaul-green transition-colors">{t('footer.p_policy')}</Link></li>
                <li><Link to="/terms" className="hover:text-saemaul-green transition-colors">{t('footer.terms')}</Link></li>
                <li><Link to="/contact" className="hover:text-saemaul-green transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>
            <div>
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
    </div>
  );
}

export default App;
