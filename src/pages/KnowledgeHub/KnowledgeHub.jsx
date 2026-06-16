import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, MapPin, ChevronRight, BookOpen, Filter, Video, Play, X, ArrowRight } from 'lucide-react';

const documents = [
  // 새마을운동 영광의 발자취 (footsteps)
  { id: '00', filename: '00_서론_발간사및성과_현대어.md', source: 'footsteps', category: '개요', title: '서론: 발간사 및 7년의 성과' },
  { id: '01', filename: '01_대규모사업_전남화순군_한천면_돗재도로_현대어.md', source: 'footsteps', category: '대규모 사업', title: '전남 화순군 한천면 - 돗재도로 개설' },
  { id: '02', filename: '02_대규모사업_경북안동군_풍천면_구담교_현대어.md', source: 'footsteps', category: '대규모 사업', title: '경북 안동군 풍천면 - 구담교 가설' },
  { id: '03_0', filename: '03_경기도_00_경기도_부천시_소사동_탁박골마을_현대어.md', source: 'footsteps', category: '경기도', title: '부천시 소사동 - 탁박골마을' },
  { id: '03_1', filename: '03_경기도_01_경기_여주군_가남면은봉2리_현대어.md', source: 'footsteps', category: '경기도', title: '여주군 가남면 은봉2리' },
  { id: '04', filename: '04_경기도_02_경기_용인군_남사면_통삼리_동막마을_현대어.md', source: 'footsteps', category: '경기도', title: '용인군 남사면 통삼리 - 동막마을' },
  { id: '05', filename: '05_경기도_03_안성군_일죽면_금산리_율동마을_현대어.md', source: 'footsteps', category: '경기도', title: '안성군 일죽면 금산리 - 율동마을' },
  { id: '06', filename: '06_강원도_01_영월군_수주면_도원1리_현대어.md', source: 'footsteps', category: '강원도', title: '영월군 수주면 - 도원1리' },
  { id: '07', filename: '07_강원도_02_강원정선군_북면_남평리_현대어.md', source: 'footsteps', category: '강원도', title: '정선군 북면 - 남평리' },
  { id: '08', filename: '08_강원도_03_양구군_양구면_도사리마을_현대어.md', source: 'footsteps', category: '강원도', title: '양구군 양구면 - 도사리마을' },
  { id: '09', filename: '09_강원도_04_명주군_성산면_금산2리_현대어.md', source: 'footsteps', category: '강원도', title: '명주군 성산면 - 금산2리' },
  { id: '10', filename: '10_강원도_05_삼척군_노곡면_여삼마을_현대어.md', source: 'footsteps', category: '강원도', title: '삼척군 노곡면 - 여삼마을' },
  { id: '11_1', filename: '11_충청북도_01_청주시_율양동_상리_현대어.md', source: 'footsteps', category: '충청북도', title: '청주시 율양동 - 상리' },
  { id: '11_2', filename: '11_충청북도_02_보은군_내북면_산성2리_잣미마을_현대어.md', source: 'footsteps', category: '충청북도', title: '보은군 내북면 산성2리 - 잣미마을' },
  { id: '12', filename: '12_충청북도_02_옥천군_청산면_상례곡리_현대어.md', source: 'footsteps', category: '충청북도', title: '옥천군 청산면 - 상례곡리' },
  { id: '13', filename: '13_충청북도_03_괴산군_문광면_방성리_현대어.md', source: 'footsteps', category: '충청북도', title: '괴산군 문광면 - 방성리' },
  { id: '14', filename: '14_충청남도_01_연기군_전동면_양곡리_현대어.md', source: 'footsteps', category: '충청남도', title: '연기군 전동면 - 양곡리' },
  { id: '15', filename: '15_충청남도_02_논산군_연무읍_동산1동_현대어.md', source: 'footsteps', category: '충청남도', title: '논산군 연무읍 - 동산1동' },
  { id: '16', filename: '16_충청남도_03_서천군_판교면_복대2리_현대어.md', source: 'footsteps', category: '충청남도', title: '서천군 판교면 - 복대2리' },

  // 새마을운동 10년사 (history10)
  { id: 'h10_01', filename: '새마을운동10년사_01_발간사_서문.md', source: 'history10', category: '서문', title: '새마을운동 10년사 - 발간사 및 서문', startPage: 5 },
  { id: 'h10_02', filename: '새마을운동10년사_02_제1장_사적배경.md', source: 'history10', category: '제1장 사적배경', title: '제1장 새마을운동의 사적배경', startPage: 13 },
  { id: 'h10_03', filename: '새마을운동10년사_03_제2장_기본정신.md', source: 'history10', category: '제2장 기본정신', title: '제2장 새마을운동의 기본정신', startPage: 73 },
  { id: 'h10_04', filename: '새마을운동10년사_04_제3장_이념체계.md', source: 'history10', category: '제3장 이념체계', title: '제3장 새마을운동의 이념체계', startPage: 161 },
  { id: 'h10_05', filename: '새마을운동10년사_05_제4장_새마을교육.md', source: 'history10', category: '제4장 새마을교육', title: '제4장 새마을교육', startPage: 217 },
  { id: 'h10_06', filename: '새마을운동10년사_06_제5장_실천과성과.md', source: 'history10', category: '제5장 실천과성과', title: '제5장 새마을운동의 실천과 성과', startPage: 351 },
  { id: 'h10_07', filename: '새마을운동10년사_07_제6장_국제적전파.md', source: 'history10', category: '제6장 국제적전파', title: '제6장 새마을운동의 국제적 전파', startPage: 585 },
  { id: 'h10_08', filename: '새마을운동10년사_08_제7장_미래의과제.md', source: 'history10', category: '제7장 미래의과제', title: '제7장 미래의 과제', startPage: 617 }
];

const videos = [
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

const KnowledgeHub = () => {
  const [activeTab, setActiveTab] = useState('document'); // 'document' | 'video'
  const [activeDocSource, setActiveDocSource] = useState('footsteps'); // 'footsteps' | 'history10'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const docCategories = activeDocSource === 'footsteps'
    ? ['전체', '개요', '대규모 사업', '경기도', '강원도', '충청북도', '충청남도']
    : ['전체', '서문', '제1장 사적배경', '제2장 기본정신', '제3장 이념체계', '제4장 새마을교육', '제5장 실천과성과', '제6장 국제적전파', '제7장 미래의과제'];

  const filteredDocs = documents.filter(doc => {
    const matchesSource = doc.source === activeDocSource;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === '전체' || doc.category === activeCategory;
    return matchesSource && matchesSearch && matchesCategory;
  });

  const filteredVideos = videos.filter(vid => {
    return vid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vid.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vid.category.toLowerCase().includes(searchTerm.toLowerCase());
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
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            OCR 기술로 디지털화된 역사적 기록과 시각 자료를 통해 생생한 역사의 현장을 탐색해보세요.
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

        {/* Controls Section (Reused layout, variations per tab) */}
        <div className="max-w-5xl mx-auto mb-10">
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
            
            {/* Document Specific Filters */}
            {activeTab === 'document' && (
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

        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'document' ? (
            <div className="animate-fadeIn">
              {/* Document Sub-Tab Switcher */}
              <div className="flex gap-6 mb-8 border-b border-slate-200/80">
                <button
                  onClick={() => { setActiveDocSource('footsteps'); setActiveCategory('전체'); }}
                  className={`pb-3 text-base font-extrabold transition-all border-b-2 ${
                    activeDocSource === 'footsteps'
                      ? 'border-indigo-600 text-indigo-600 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  새마을운동 영광의 발자취
                </button>
                <button
                  onClick={() => { setActiveDocSource('history10'); setActiveCategory('전체'); }}
                  className={`pb-3 text-base font-extrabold transition-all border-b-2 ${
                    activeDocSource === 'history10'
                      ? 'border-indigo-600 text-indigo-600 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  새마을운동 10년사
                </button>
              </div>

              {activeDocSource === 'history10' && (
                <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 shadow-xl relative overflow-hidden group animate-fadeIn text-left">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-1000 group-hover:scale-150" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                      <span className="inline-block text-xs font-black text-indigo-400 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-3 uppercase tracking-wider">
                        신규 기능
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
                        새마을운동 10년사 e-Book 뷰어 서비스 📖
                      </h2>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                        좌측의 국가기록원 PDF 원본 스캔 화면과 우측의 현대어 번역 아카이브를 1:1로 비교하며 읽어보세요. 독자들과 함께 오탈자를 교정하고 다듬는 <strong>실시간 오타 정정 대시보드(0페이지)</strong>도 제공됩니다.
                      </p>
                    </div>
                    <Link
                      to="/reader/10years?page=1"
                      className="px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 group-hover:translate-x-1 duration-300 whitespace-nowrap self-start md:self-center cursor-pointer"
                    >
                      e-Book 리더 열기 <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}

              {filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredDocs.map((doc) => (
                    <Link 
                      key={doc.id}
                      to={doc.source === 'history10' ? `/reader/10years?page=${doc.startPage}` : `/archive/${doc.filename}`}
                      className="group relative flex items-start gap-5 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                      
                      <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                        <FileText size={24} />
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            doc.category === '개요' || doc.category === '서문' ? 'bg-slate-100 text-slate-600' : 
                            doc.category === '대규모 사업' ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-indigo-50 text-indigo-600'
                          }`}>
                            {doc.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            <MapPin size={10} />
                            현대어 번역
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                          {doc.title}
                        </h3>
                        <div className="mt-4 flex items-center text-sm font-bold text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                          읽어보기 <ChevronRight size={16} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Search size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-slate-500">다른 검색어나 카테고리를 시도해보세요.</p>
                </div>
              )}
            </div>
          ) : (
            /* Video Grid View */
            filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                {filteredVideos.map((vid) => (
                  <div 
                    key={vid.id} 
                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col"
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
                          className="text-indigo-600 font-bold text-sm inline-flex items-center gap-1 hover:underline"
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
            )
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
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 truncate">{selectedVideo.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{selectedVideo.channel} • {selectedVideo.category}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 ml-4"
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
            <div className="p-6 bg-slate-50 text-sm font-medium text-slate-600 border-t border-slate-100 leading-relaxed">
              {selectedVideo.desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;


