import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, MapPin, ChevronRight, BookOpen, Filter, Video, Play, X, ArrowRight } from 'lucide-react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

const documents = [
  // 새마을운동 10년사 (history10)
  { id: 'h10_01', filename: '새마을운동10년사_01_발간사_서문.md', source: 'history10', category: '서문', title: '새마을운동 10년사 - 발간사 및 서문', startPage: 5 },
  { id: 'h10_02', filename: '새마을운동10년사_02_제1장_사적배경.md', source: 'history10', category: '제1장 사적배경', title: '제1장 새마을운동의 사적배경', startPage: 13 },
  { id: 'h10_03', filename: '새마을운동10년사_03_제2장_기본정신.md', source: 'history10', category: '제2장 기본정신', title: '제2장 새마을운동의 기본정신', startPage: 73 },
  { id: 'h10_04', filename: '새마을운동10년사_04_제3장_이념체계.md', source: 'history10', category: '제3장 이념체계', title: '제3장 새마을운동의 이념체계', startPage: 161 },
  { id: 'h10_05', filename: '새마을운동10년사_05_제4장_새마을교육.md', source: 'history10', category: '제4장 새마을교육', title: '제4장 새마을교육', startPage: 217 },
  { id: 'h10_06', filename: '새마을운동10년사_05_제5장_실천과성과.md', source: 'history10', category: '제5장 실천과성과', title: '제5장 새마을운동의 실천과 성과', startPage: 351 },
  { id: 'h10_07', filename: '새마을운동10년사_06_제6장_국제적전파.md', source: 'history10', category: '제6장 국제적전파', title: '제6장 새마을운동의 국제적 전파', startPage: 585 },
  { id: 'h10_08', filename: '새마을운동10년사_07_제7장_미래의과제.md', source: 'history10', category: '제7장 미래의과제', title: '제7장 미래의 과제', startPage: 617 }
];

const defaultVideos = [
  {
    id: 'qzMaMHVBOu4',
    title: "새마을 운동의 시초? 박정희 대통령이 한 마을에서 우연히 발견한 '이것'",
    channel: 'KBS 다큐극장',
    category: '역사/기원',
    desc: '새마을운동의 시초가 된 경북 청도군 신도마을의 기적과 박정희 대통령의 시찰 비하인드를 다룬 다큐멘터리입니다.'
  },
  {
    id: 'yVmc52UQnqk',
    title: '찢어지게 가난했던 나라에 한국의 새마을 운동이 시작되자 전세계가 놀랐다｜지구촌에 부는 한류 열풍',
    channel: '골라듄다큐',
    category: '다큐멘터리',
    desc: '절대빈곤 속의 대한민국을 바꾼 새마을운동의 정신과 현재 전 세계 개도국으로 퍼져나가는 글로벌 현장을 소개합니다.'
  },
  {
    id: 'RIpQCIRmnI0',
    title: '에티오피아에 새마을 운동을! ｜포항MBC 특집다큐 "새마을 운동"',
    channel: '포항MBC',
    category: '해외전파',
    desc: '에티오피아 현지에서 직접 실천되는 새마을운동의 생생한 교육 현장과 주민들의 자발적인 변화 과정을 조명한 명품 다큐멘터리입니다.'
  },
  {
    id: 'ScoYG_8cmxg',
    title: '새마을 노래 - 박정희 작사/작곡 (오리지널 음원)',
    channel: '새마을 아카이브',
    category: '문화/기록',
    desc: '새마을운동의 근면, 자조, 협동 정신을 널리 전파하기 위해 보급되었던 역사적인 새마을 노래 음원입니다.'
  },
  {
    id: 'OkGSeDPzXyQ',
    title: '한국의 새마을 운동을 도입해 대박난 르완다 마을 방문기【아프리카6】',
    channel: '빠니보틀 (Pani Bottle)',
    category: '해외전파',
    desc: '한국의 새마을 운동을 성공적으로 정착시켜 마을을 개척하고 발전시키고 있는 르완다 농촌 현장을 직접 찾아간 여행 브이로그입니다.'
  },
  {
    id: '0f9xOhn2iFI',
    title: '문 대통령 "대한민국 밑바탕에 새마을운동…계승·발전시켜야"',
    channel: '연합뉴스',
    category: '대통령 기록',
    desc: '전국새마을지도자대회에 참석하여 오늘의 대한민국 밑바탕이 된 새마을운동의 현대적 의미와 계승 발전을 강조한 문재인 대통령의 메시지입니다.'
  },
  {
    id: '9DybHU0nc78',
    title: '박근혜 대통령 "새마을운동은 정신혁명운동...지속가능한 변화 필요"',
    channel: 'YTN 뉴스',
    category: '대통령 기록',
    desc: '새마을운동을 경제 부흥의 자신감을 심어준 전 국가적 정신혁명 운동으로 재평가하며 글로벌 시대에 맞는 변화를 주창한 연설 기록입니다.'
  },
  {
    id: 'sOFa9lJfo9s',
    title: '윤 대통령 "새마을운동, 자유·연대 기반 개발협력모델"',
    channel: 'MBC 뉴스',
    category: '대통령 기록',
    desc: '새마을지도자대회에서 새마을정신이 인류 보편적 가치인 자유와 연대에 기반한 글로벌 협력 모델로서 진화하고 있음을 밝힌 내용입니다.'
  },
  {
    id: 'KgCl3knIaZY',
    title: '지구촌까지 함께하는 새마을 운동! 문재인 대통령 축사 (풀버전)',
    channel: '청와대 / KTV국민방송',
    category: '역사/연설',
    desc: '2019 전국새마을지도자대회 현장에서 울려퍼진, 생명·평화·공경의 뉴 패러다임과 연대감을 담아낸 기념사 전체 실황 영상입니다.'
  },
  {
    id: 'qTBol7qXaFA',
    title: '문 대통령 "경제강국 된 건 새마을운동 덕분"',
    channel: '연합뉴스TV',
    category: '대통령 기록',
    desc: '대한민국이 눈부신 경제 대국으로 부상할 수 있었던 근간이 농촌에서 범사회적으로 확산된 국민운동에 있었음을 격려한 연설 보도입니다.'
  },
  {
    id: 'PWKtCmg5exk',
    title: '윤대통령 "함께 잘사는 나라 위해 새마을운동 다시 일어날 때"',
    channel: '연합뉴스TV',
    category: '대통령 기록',
    desc: '세계적인 경제 도전 극복을 주도했던 새마을운동의 지혜를 이어받아 선도국가 건설을 위한 국민 통합의 힘을 재점화하자는 연설입니다.'
  },
  {
    id: 'w4CbA7YkzHU',
    title: '2003 전국 새마을지도자대회 노무현 전 대통령 연설',
    channel: '대통령기록관',
    category: '역사/연설',
    desc: '2003년 전국의 새마을지도자들이 한자리에 모인 자리에서 민간 주도의 지역 사회 발전에 헌신한 성과와 격려를 담은 귀중한 연설 자료입니다.'
  }
];

const extractYoutubeId = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.') && !trimmed.includes('?')) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const KnowledgeHub = () => {
  const [activeTab, setActiveTab] = useState('document'); // 'document' | 'video'
  const [activeDocSource, setActiveDocSource] = useState('history10'); // 'history10' | 'footsteps'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Firestore & Auth states
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [videoForm, setVideoForm] = useState({
    url: '',
    title: '',
    channel: '',
    category: '문화/기록',
    desc: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    let seedingStarted = false;

    const unsubscribeVideos = onSnapshot(collection(db, "videos"), async (snapshot) => {
      let videoList = [];
      snapshot.forEach((doc) => {
        videoList.push({ docId: doc.id, ...doc.data() });
      });

      if (snapshot.metadata.hasPendingWrites || seedingStarted) {
        setVideos(videoList);
        return;
      }

      if (videoList.length === 0 && !snapshot.metadata.fromCache) {
        seedingStarted = true;
        try {
          for (const vid of defaultVideos) {
            await addDoc(collection(db, "videos"), vid);
          }
        } catch (err) {
          console.error("Error seeding default videos:", err);
        }
      } else {
        setVideos(videoList);
      }
    }, (error) => {
      console.error("Error subscribing to videos collection:", error);
      setVideos(defaultVideos);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeVideos();
    };
  }, []);

  const isAdmin = user && user.email === import.meta.env.VITE_ADMIN_EMAIL;

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.url || !videoForm.desc) {
      alert('유튜브 링크와 설명을 모두 입력해주세요.');
      return;
    }
    const videoId = extractYoutubeId(videoForm.url);
    if (!videoId) {
      alert('올바른 유튜브 링크 형식이 아닙니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newVideo = {
        id: videoId,
        title: videoForm.title.trim() || '새로운 아카이브 영상',
        channel: videoForm.channel.trim() || '새마을 아카이브',
        category: videoForm.category.trim() || '문화/기록',
        desc: videoForm.desc.trim()
      };
      await addDoc(collection(db, "videos"), newVideo);
      setVideoForm({
        url: '',
        title: '',
        channel: '',
        category: '문화/기록',
        desc: ''
      });
      alert('영상이 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error("Error adding video: ", error);
      alert('영상 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (docId) => {
    if (!window.confirm('정말 이 영상을 아카이브에서 삭제하시겠습니까?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, "videos", docId));
      alert('영상이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error("Error deleting video: ", error);
      alert('영상 삭제 중 오류가 발생했습니다.');
    }
  };

  const docCategories = []; // 카테고리 필터 미사용

  const filteredDocs = documents.filter(doc => {
    const matchesSource = doc.source === activeDocSource;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === '전체' || doc.category === activeCategory;
    return matchesSource && matchesSearch && matchesCategory;
  });

  const filteredVideos = videos.filter(vid => {
    return vid.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vid.channel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vid.category?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm(''); // Clear search when switching tabs
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 relative">
      <div className="container mx-auto px-6">
        {/* Header Area */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-4 border border-indigo-100">
            <BookOpen size={16} />
            새마을 디지털 아카이브
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            지식 허브 (Knowledge Hub)
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-3xl mx-auto leading-relaxed">
            새마을운동 역사 도서의 국가기록원 PDF 원본 스캔 화면과 정제된 현대어 번역 아카이브를 1:1 비교화면으로 제공합니다. 독자들의 집단지성을 바탕으로 오탈자를 교정하고 다듬는 실시간 오타 정정 대시보드(0p)를 함께 체험해보세요.
          </p>
        </div>

        {/* Tab Switch Component */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/40">
            <button
              onClick={() => handleTabChange('document')}
              className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                activeTab === 'document'
                  ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200 translate-y-[-1px]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <FileText size={18} />
              문서 아카이브 (OCR)
            </button>
            <button
              onClick={() => handleTabChange('video')}
              className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                activeTab === 'video'
                  ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200 translate-y-[-1px]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Video size={18} />
              영상 아카이브
            </button>
          </div>
        </div>

        {/* Controls Section (Only shown when not (document & history10)) */}
        {!(activeTab === 'document' && activeDocSource === 'history10') && (
          <div className="max-w-5xl mx-auto mb-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder={activeTab === 'document' ? "문서 제목 또는 지역명 검색..." : "영상 제목 또는 제작처 검색..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"
                />
              </div>
              
              {/* Document Specific Filters (Only footsteps has filters) */}
              {activeTab === 'document' && activeDocSource === 'footsteps' && (
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider px-2">
                    <Filter size={14} /> 필터
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                    {docCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                          activeCategory === cat 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'document' ? (
            <div className="animate-fadeIn">
              {/* e-Book Viewer Section */}

              {/* 10년사 e-Book 배너 */}
              <div className="mb-8 p-10 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 shadow-xl relative overflow-hidden group animate-fadeIn text-left min-h-[200px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-1000 group-hover:scale-150" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full w-full">
                  <div className="max-w-2xl flex-grow">
                    <span className="inline-block text-xs font-black text-indigo-400 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4 uppercase tracking-wider">
                      e-Book Viewer
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tight leading-snug">
                      새마을운동 10년사 e-Book 뷰어 📖
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {['한국어', 'English', 'Español', '中文', 'Français', 'Tiếng Việt'].map(lang => (
                        <span key={lang} className="text-[11px] font-bold px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/20">{lang}</span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to="/reader/10years?page=1"
                    className="px-8 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 group-hover:translate-x-1.5 duration-300 whitespace-nowrap self-start md:self-center cursor-pointer border border-indigo-500/30"
                  >
                    e-Book 리더 열기 <ArrowRight size={20} />
                  </Link>
                </div>
              </div>

              {/* 영광의 발자취 e-Book 배너 */}
              <div className="mb-8 p-10 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 border border-amber-500/20 shadow-xl relative overflow-hidden group animate-fadeIn text-left min-h-[200px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-1000 group-hover:scale-150" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full w-full">
                  <div className="max-w-2xl flex-grow">
                    <span className="inline-block text-xs font-black text-amber-400 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4 uppercase tracking-wider">
                      e-Book Viewer
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tight leading-snug">
                      영광의 발자취 e-Book 뷰어 📖
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {['한국어', 'English', 'Español', '中文', 'Français', 'Tiếng Việt'].map(lang => (
                        <span key={lang} className="text-[11px] font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/20">{lang}</span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to="/reader/glory?page=1"
                    className="px-8 py-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-600/30 group-hover:translate-x-1.5 duration-300 whitespace-nowrap self-start md:self-center cursor-pointer border border-amber-500/30"
                  >
                    e-Book 리더 열기 <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Video Grid & Manage View */
            <div className="animate-fadeIn">
              {/* Admin Panel (Only visible to admin) */}
              {isAdmin && (
                <div className="mb-10 p-6 bg-white border border-indigo-100 rounded-3xl shadow-sm animate-fadeIn text-left">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Video size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">영상 아카이브 관리 (관리자 권한)</h3>
                      <p className="text-xs text-slate-500 font-medium">유튜브 링크와 설명을 입력하여 새로운 영상을 아카이브에 추가하세요.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-600">유튜브 링크 *</label>
                      <input 
                        type="text" 
                        placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                        value={videoForm.url}
                        onChange={(e) => setVideoForm({...videoForm, url: e.target.value})}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-700 font-medium"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">영상 제목 (선택)</label>
                      <input 
                        type="text" 
                        placeholder="미입력 시 기본 제목 적용"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-700 font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">채널/출처 (선택)</label>
                      <input 
                        type="text" 
                        placeholder="예: KBS 다큐극장, 포항MBC"
                        value={videoForm.channel}
                        onChange={(e) => setVideoForm({...videoForm, channel: e.target.value})}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-700 font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-600">카테고리</label>
                      <select
                        value={videoForm.category}
                        onChange={(e) => setVideoForm({...videoForm, category: e.target.value})}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-700 font-medium"
                      >
                        <option value="문화/기록">문화/기록</option>
                        <option value="역사/기원">역사/기원</option>
                        <option value="다큐멘터리">다큐멘터리</option>
                        <option value="해외전파">해외전파</option>
                        <option value="대통령 기록">대통령 기록</option>
                        <option value="역사/연설">역사/연설</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-600">설명 *</label>
                      <textarea 
                        placeholder="영상의 배경이나 주요 설명글을 입력하세요."
                        value={videoForm.desc}
                        onChange={(e) => setVideoForm({...videoForm, desc: e.target.value})}
                        rows="3"
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-700 resize-none font-medium"
                        required
                      />
                    </div>

                    <div className="col-span-2 flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? '등록 중...' : '영상 등록하기'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredVideos.map((vid) => (
                    <div 
                      key={vid.docId || vid.id} 
                      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col relative text-left"
                    >
                      {/* Video Thumbnail Wrapper */}
                      <div 
                        onClick={() => setSelectedVideo(vid)}
                        className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden group"
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${vid.id}/maxresdefault.jpg`}
                          alt={vid.title}
                          onError={(e) => { e.target.src = `https://img.youtube.com/vi/${vid.id}/0.jpg` }}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                            <Play size={28} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                        <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md bg-slate-900/80 text-white font-bold text-[11px] backdrop-blur-sm">
                          {vid.category}
                        </span>

                        {/* Admin Delete Action Button */}
                        {isAdmin && vid.docId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVideo(vid.docId);
                            }}
                            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                            title="아카이브에서 삭제"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {/* Video Info Details */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-extrabold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full uppercase tracking-wide">
                              {vid.channel}
                            </span>
                          </div>
                          <h3 className="text-lg font-extrabold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {vid.title}
                          </h3>
                          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                            {vid.desc}
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <button 
                            onClick={() => setSelectedVideo(vid)}
                            className="text-indigo-600 font-bold text-sm inline-flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            영상 재생하기 <Play size={12} fill="currentColor" />
                          </button>
                          <a 
                            href={`https://www.youtube.com/watch?v=${vid.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 font-bold text-sm inline-flex items-center gap-1 hover:text-slate-600"
                          >
                            YouTube에서 보기
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Search size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-slate-500">다른 영상 검색어를 시도해보세요.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal Overlay */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Video size={20} />
                </div>
                <div className="overflow-hidden text-left">
                  <h4 className="font-bold text-slate-900 truncate">{selectedVideo.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{selectedVideo.channel} • {selectedVideo.category}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 ml-4 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Iframe Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Modal Footer Desc */}
            <div className="p-6 bg-slate-50 text-sm font-medium text-slate-600 border-t border-slate-100 leading-relaxed text-left">
              {selectedVideo.desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;


