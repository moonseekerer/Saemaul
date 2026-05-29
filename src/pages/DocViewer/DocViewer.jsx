import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#f0fdf4',
    primaryTextColor: '#166534',
    primaryBorderColor: '#4ade80',
    lineColor: '#22c55e',
    secondaryColor: '#ecfdf5',
    tertiaryColor: '#ffffff',
    edgeLabelBackground: '#ffffff',
    clusterBkg: '#f8fafc'
  }
});

const MermaidRenderer = ({ chart }) => {
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (chartRef.current) {
      // Generate unique ID for render
      const uniqueId = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(uniqueId, chart).then(({ svg }) => {
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;
          // Find the generated SVG element and force full width scaling
          const svgEl = chartRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.maxWidth = '800px'; // Prevent excessive pixelation
            svgEl.style.height = 'auto';
          }
        }
      }).catch(err => {
        console.error('Failed to render mermaid', err);
      });
    }
  }, [chart]);

  return (
    <div className="flex justify-center my-10 p-8 bg-white border border-slate-200 rounded-2xl shadow-md group">
      <div ref={chartRef} className="w-full flex justify-center transition-all duration-300 group-hover:scale-[1.01]" />
    </div>
  );
};

const FILE_LABELS = {
  '00_서론_발간사및성과_현대어.md': '서론 — 발간사 및 7년의 성과',
  '01_대규모사업_전남화순군_한천면_돗재도로_현대어.md': '전남 화순군 한천면 — 돗재도로 개설',
  '02_대규모사업_경북안동군_풍천면_구담교_현대어.md': '경북 안동군 풍천면 — 구담교 가설',
  '06_강원도_01_영월군_수주면_도원1리_현대어.md': '강원 영월군 수주면 — 도원1리',
};

const DocViewer = () => {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    fetch(`${import.meta.env.BASE_URL}docs/${filename}`)
      .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
      .then(buf => {
        let text = new TextDecoder('utf-8').decode(buf);
        
        // 1) 마크다운 헤더 전후에 공백 라인을 확실하게 강제하여 단락 뭉침 방지
        text = text.replace(/^(#{1,6}\s+.*)$/gm, '\n\n$1\n\n');
        
        // 2) 한국어 조사 접합 시 볼드(**) 처리 버그 방지 -> 닫기 볼드 뒤에 보이지 않는 제로 너비 공간(\u200B) 삽입 (한글/영문/숫자 등의 조사가 바로 붙는 경우에만 한함)
        text = text.replace(/\*\*([^\*]+?)\*\*(?=[가-힣a-zA-Z0-9])/g, '**$1**\u200B');
        
        // 3) 불필요하게 반복된 3회 이상의 줄바꿈 정리
        text = text.replace(/\n{3,}/g, '\n\n');

        setContent(text);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [filename]);

  const label = FILE_LABELS[filename] || (filename || '').replace(/_/g, ' ').replace('.md', '');

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green font-bold transition-colors">
            <ArrowLeft size={20} /> 돌아가기
          </button>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <BookOpen size={16} />
            <span className="font-medium">영광의 발자취</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-amber-800 font-black text-sm">📚 영광의 발자취 — 마을 단위 새마을운동 추진사</p>
            <p className="text-amber-600 text-xs mt-1">{label}</p>
          </div>
          <span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">현대어 번역본</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 size={40} className="text-saemaul-green animate-spin" />
              <p className="text-slate-400 font-medium">문서를 불러오는 중...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <p className="text-slate-400 font-bold text-lg">문서를 찾을 수 없습니다.</p>
              <button onClick={() => navigate(-1)} className="text-saemaul-green font-bold underline">돌아가기</button>
            </div>
          )}
          {!loading && !error && (
            <div className="p-8 md:p-14 max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-10 leading-tight tracking-tight">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl md:text-3xl font-black text-emerald-800 mt-16 mb-8 border-b-2 border-emerald-200 pb-4">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-12 mb-6 pl-4 border-l-4 border-emerald-500">{children}</h3>,
                  p: ({children}) => <p className="text-slate-700 leading-8 mb-6 break-keep text-base md:text-[17px] font-medium">{children}</p>,
                  strong: ({children}) => <strong className="text-slate-900 font-black bg-amber-100/40 px-1 rounded">{children}</strong>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/60 px-6 py-5 rounded-r-2xl not-italic my-8 text-slate-700 font-medium italic">{children}</blockquote>,
                  ul: ({children}) => <ul className="list-disc pl-6 space-y-3 mb-8 text-slate-700">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-6 space-y-3 mb-8 text-slate-700">{children}</ol>,
                  li: ({children}) => <li className="text-slate-700 leading-7 pl-1">{children}</li>,
                  code(props) {
                    const {children, className, node, ...rest} = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match && match[1] === 'mermaid' ? (
                      <MermaidRenderer chart={String(children).replace(/\n$/, '')} />
                    ) : (
                      <code {...rest} className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">
                        {children}
                      </code>
                    )
                  },
                  table: ({children}) => (
                    <div className="overflow-x-auto my-8 w-full border border-slate-200 rounded-2xl shadow-sm">
                      <table className="min-w-full border-collapse divide-y divide-slate-200">{children}</table>
                    </div>
                  ),
                  thead: ({children}) => <thead className="bg-slate-50 font-bold text-slate-800">{children}</thead>,
                  th: ({children}) => <th className="px-6 py-4 border-b border-slate-200 text-left text-sm font-bold tracking-wide">{children}</th>,
                  td: ({children}) => <td className="px-6 py-4 border-b border-slate-100 text-slate-700 text-sm bg-white transition-colors hover:bg-slate-50">{children}</td>
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-saemaul-green font-bold transition-colors">
            <ArrowLeft size={16} /> 결과 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocViewer;
