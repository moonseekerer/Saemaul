import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
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
  Home
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
                <li><a href="#!" className="hover:text-saemaul-green transition-colors">{t('footer.p_policy')}</a></li>
                <li><a href="#!" className="hover:text-saemaul-green transition-colors">{t('footer.terms')}</a></li>
                <li><a href="#!" className="hover:text-saemaul-green transition-colors">{t('footer.contact')}</a></li>
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
