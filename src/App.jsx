import React, { useState, useEffect } from 'react';
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
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NavItem = ({ label }) => (
  <a href="#!" className="nav-link flex flex-col items-start group">
    <span className="text-sm font-semibold">{label}</span>
  </a>
);

const FeatureCard = ({ icon: Icon, title, description, color, learnMoreText }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass-card p-8 rounded-3xl cursor-pointer group relative overflow-hidden h-full flex flex-col"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500`} />
    <div className={`w-14 h-14 bg-${color}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-saemaul-green group-hover:text-white transition-all duration-300`}>
      <Icon size={28} className="transition-colors" />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
      {description}
    </p>
    <div className="flex items-center text-saemaul-green font-bold text-sm gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {learnMoreText} <ChevronRight size={16} />
    </div>
  </motion.div>
);

const PartnerBanner = () => {
  const partners = [
    { name: "영남대학교 국제개발새마을학과", url: "https://intdev.yu.ac.kr/intdev/index.do", logo: "https://intdev.yu.ac.kr/images/common/logo.png" },
    { name: "영남대학교 박정희새마을대학원", url: "https://www.yu.ac.kr/pspsk/index.do", logo: "https://www.yu.ac.kr/pspsk/images/common/logo.png" },
    { name: "유네스코한국위원회", url: "https://unesco.or.kr/%EC%83%88%EB%A7%88%EC%9D%84%EC%9A%B4%EB%8F%99-%EA%B8%B0%EB%A1%9D%EB%AC%BC/", logo: "https://unesco.or.kr/typetest/unesco-logo.png" },
    { name: "새마을재단", url: "https://www.smuf.or.kr/", logo: "https://www.smuf.or.kr/img/common/logo.png" },
    { name: "새마을운동중앙회", url: "https://www.saemaul.or.kr/home/?mode=main", logo: "https://www.saemaul.or.kr/images/common/logo.png" },
  ];

  const doublePartners = [...partners, ...partners]; // Match translateX(-50%) animation

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

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 overflow-hidden rounded-xl shadow-lg shadow-saemaul-green/20 flex items-center justify-center bg-white border border-slate-100">
              <img src="https://www.saemaul.or.kr/images/sub/company/ci_2img2.png" alt="Saemaul Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Saemaul<span className="text-saemaul-green">-SDGs</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavItem label={t('nav.home')} />
            <NavItem label={t('nav.test')} />
            <NavItem label={t('nav.ranking')} />
            <NavItem label={t('nav.hub')} />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors uppercase"
            >
              <Languages size={14} className="text-saemaul-green" />
              {i18n.language === 'ko' ? 'English' : '한국어'}
            </button>
            <button className="btn-primary py-2 px-5 text-sm">
              {t('nav.join')}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.main
          key={i18n.language}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
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
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
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
                    <button className="btn-primary text-lg px-8 py-4">
                      {t('hero.cta_start')} <ArrowRight size={20} />
                    </button>
                    <button className="px-8 py-4 rounded-full font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2">
                      {t('hero.cta_demo')}
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="relative hidden lg:block"
                >
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
                  <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-saemaul-green/20 rounded-full blur-3xl animate-float" />
                  <div className="absolute -z-10 -top-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
                </motion.div>
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
                />
                <FeatureCard 
                  icon={Trophy}
                  title={t('features.card2.title')}
                  description={t('features.card2.desc')}
                  color="amber"
                  learnMoreText={t('features.learn_more')}
                />
                <FeatureCard 
                  icon={MessageSquare}
                  title={t('features.card3.title')}
                  description={t('features.card3.desc')}
                  color="emerald"
                  learnMoreText={t('features.learn_more')}
                />
                <FeatureCard 
                  icon={BookOpen}
                  title={t('features.card4.title')}
                  description={t('features.card4.desc')}
                  color="indigo"
                  learnMoreText={t('features.learn_more')}
                />
              </div>
            </div>
          </section>

          {/* Partner Marquee */}
          <PartnerBanner />
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 overflow-hidden rounded-2xl shadow-lg flex items-center justify-center bg-white border border-slate-100">
                  <img src="https://www.saemaul.or.kr/images/sub/company/ci_2img2.png" alt="Saemaul Logo" className="w-full h-full object-contain p-1.5" />
                </div>
                <span className="text-2xl font-black tracking-tight">Saemaul<span className="text-saemaul-green">-SDGs</span></span>
              </div>
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
                {[1,2,3,4].map(i => (
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
