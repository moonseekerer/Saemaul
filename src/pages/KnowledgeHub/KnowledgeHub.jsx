import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, MapPin, ChevronRight, BookOpen, Filter } from 'lucide-react';

const documents = [
  { id: '00', filename: '00_서론_발간사및성과_현대어.md', category: '개요', title: '서론: 발간사 및 7년의 성과' },
  { id: '01', filename: '01_대규모사업_전남화순군_한천면_돗재도로_현대어.md', category: '대규모 사업', title: '전남 화순군 한천면 - 돗재도로 개설' },
  { id: '02', filename: '02_대규모사업_경북안동군_풍천면_구담교_현대어.md', category: '대규모 사업', title: '경북 안동군 풍천면 - 구담교 가설' },
  { id: '03_0', filename: '03_경기도_00_경기도_부천시_소사동_탁박골마을_현대어.md', category: '경기도', title: '부천시 소사동 - 탁박골마을' },
  { id: '03_1', filename: '03_경기도_01_경기_여주군_가남면은봉2리_현대어.md', category: '경기도', title: '여주군 가남면 은봉2리' },
  { id: '04', filename: '04_경기도_02_경기_용인군_남사면_통삼리_동막마을_현대어.md', category: '경기도', title: '용인군 남사면 통삼리 - 동막마을' },
  { id: '05', filename: '05_경기도_03_안성군_일죽면_금산리_율동마을_현대어.md', category: '경기도', title: '안성군 일죽면 금산리 - 율동마을' },
  { id: '06', filename: '06_강원도_01_영월군_수주면_도원1리_현대어.md', category: '강원도', title: '영월군 수주면 - 도원1리' },
  { id: '07', filename: '07_강원도_02_강원정선군_북면_남평리_현대어.md', category: '강원도', title: '정선군 북면 - 남평리' },
  { id: '08', filename: '08_강원도_03_양구군_양구면_도사리마을_현대어.md', category: '강원도', title: '양구군 양구면 - 도사리마을' },
  { id: '09', filename: '09_강원도_04_명주군_성산면_금산2리_현대어.md', category: '강원도', title: '명주군 성산면 - 금산2리' },
  { id: '10', filename: '10_강원도_05_삼척군_노곡면_여삼마을_현대어.md', category: '강원도', title: '삼척군 노곡면 - 여삼마을' },
  { id: '11_1', filename: '11_충청북도_01_청주시_율양동_상리_현대어.md', category: '충청북도', title: '청주시 율양동 - 상리' },
  { id: '11_2', filename: '11_충청북도_02_보은군_내북면_산성2리_잣미마을_현대어.md', category: '충청북도', title: '보은군 내북면 산성2리 - 잣미마을' },
  { id: '12', filename: '12_충청북도_02_옥천군_청산면_상례곡리_현대어.md', category: '충청북도', title: '옥천군 청산면 - 상례곡리' },
  { id: '13', filename: '13_충청북도_03_괴산군_문광면_방성리_현대어.md', category: '충청북도', title: '괴산군 문광면 - 방성리' },
  { id: '14', filename: '14_충청남도_01_연기군_전동면_양곡리_현대어.md', category: '충청남도', title: '연기군 전동면 - 양곡리' },
  { id: '15', filename: '15_충청남도_02_논산군_연무읍_동산1동_현대어.md', category: '충청남도', title: '논산군 연무읍 - 동산1동' },
  { id: '16', filename: '16_충청남도_03_서천군_판교면_복대2리_현대어.md', category: '충청남도', title: '서천군 판교면 - 복대2리' }
];

const categories = ['전체', '개요', '대규모 사업', '경기도', '강원도', '충청북도', '충청남도'];

const KnowledgeHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === '전체' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
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
            OCR 기술로 디지털화된 방대한 역사적 기록과 성공 사례를 직접 탐색해보세요.
          </p>
        </div>

        {/* Controls: Search & Filter */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="문서 제목 또는 지역명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider px-2">
                <Filter size={14} /> 필터
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                {categories.map(cat => (
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
          </div>
        </div>

        {/* Document Grid */}
        <div className="max-w-5xl mx-auto">
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDocs.map((doc) => (
                <Link 
                  key={doc.id}
                  to={`/archive/${doc.filename}`}
                  className="group relative flex items-start gap-5 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                  
                  <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <FileText size={24} />
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        doc.category === '개요' ? 'bg-slate-100 text-slate-600' : 
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
      </div>
    </div>
  );
};

export default KnowledgeHub;
