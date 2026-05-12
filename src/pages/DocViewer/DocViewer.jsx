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
        if (chartRef.current) chartRef.current.innerHTML = svg;
      }).catch(err => {
        console.error('Failed to render mermaid', err);
      });
    }
  }, [chart]);

  return (
    <div className="flex justify-center my-10 p-6 bg-slate-50 border border-slate-100 rounded-2xl overflow-x-auto shadow-inner group">
      <div ref={chartRef} className="max-w-full transition-transform duration-300 group-hover:scale-[1.02]" />
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
        const text = new TextDecoder('utf-8').decode(buf);
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
            <div className="p-8 md:p-14 prose prose-slate max-w-none
              prose-h1:text-3xl prose-h1:font-black prose-h1:text-slate-900
              prose-h2:text-2xl prose-h2:font-black prose-h2:text-slate-800 prose-h2:mt-12 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-3
              prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-700
              prose-p:text-slate-700 prose-p:leading-8
              prose-li:text-slate-700 prose-li:leading-7
              prose-strong:text-slate-900 prose-strong:font-black
              prose-blockquote:border-l-4 prose-blockquote:border-saemaul-green prose-blockquote:bg-emerald-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic
              prose-table:text-sm prose-th:bg-slate-50 prose-th:font-bold
              prose-code:bg-slate-100 prose-code:px-1.5 prose-code:rounded prose-code:text-sm
              prose-hr:border-slate-100">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const {children, className, node, ...rest} = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match && match[1] === 'mermaid' ? (
                      <MermaidRenderer chart={String(children).replace(/\n$/, '')} />
                    ) : (
                      <code {...rest} className={className}>
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
