import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO_MAP = {
  '/': {
    title: '새마을운동 및 SDGs 글로벌 지속가능발전 플랫폼',
    description: '새마을운동 정신을 바탕으로 글로벌 지속가능발전목표(SDGs) 달성을 위한 AI 데이터 아카이브 및 협력 플랫폼입니다.',
    keywords: '새마을운동, SDGs, 지속가능발전목표, ODA, 글로벌 협력, 새마을 아카이브, 새댕이, 역사'
  },
  '/saemaul-test': {
    title: '새마을운동 모의고사 및 정신 진단 | 새마을-SDGs',
    description: '나에게 어울리는 새마을 칭호를 획득하고, 나의 새마을운동 역사 지식과 리더십 지수를 진단해보세요.',
    keywords: '새마을 테스트, 새마을 퀴즈, 리더십 자가진단, 새마을 칭호, 3대정신'
  },
  '/test': {
    title: '새마을 리더십 진단 테스트 | 새마을-SDGs',
    description: '역사 속 새마을 지도자의 결정을 통해 알아보는 나의 현대식 새마을 리더십 성향 진단 도구입니다.',
    keywords: '새마을 리더십, 성향 테스트, 지도자 진단'
  },
  '/spirit-test': {
    title: '새마을 3대 정신 자가진단 | 새마을-SDGs',
    description: '근면, 자조, 협동 정신의 균형도를 측정하고 나만의 새마을 정신 헥사곤 그래프를 확인해보세요.',
    keywords: '3대정신, 근면, 자조, 협동, 정신 진단'
  },
  '/chatbot': {
    title: '새마을AI 챗봇 새댕이 | 새마을-SDGs',
    description: '새댕이 AI 챗봇에게 새마을운동 10년사와 영광의 발자취 성공 사례를 물어보고 정확한 답변과 이북 링크를 제공받으세요.',
    keywords: '새마을 챗봇, AI 새댕이, Llama3, 돗재도로, 구담교, RAG, 팩트체크'
  },
  '/community': {
    title: '새마을 주민 소통 게시판 | 새마을-SDGs',
    description: '플랫폼 사용자들과 새마을운동의 발전 전략 및 SDGs 실천 노하우를 자유롭게 공유하고 소통하는 공간입니다.',
    keywords: '새마을 자유게시판, 주민소통방, 기여활동, 지식공유'
  },
  '/hub': {
    title: '새마을운동 및 SDGs 지식 허브 아카이브 | 새마을-SDGs',
    description: '새마을운동 10년사와 영광의 발자취 원본 e-Book 및 현대어 정제본, 영상 아카이브 자료를 모아둔 전문 지식 아카이브입니다.',
    keywords: '지식허브, 새마을 10년사, 영광의발자취, e북 리더, 영상 아카이브, 국가기록원'
  },
  '/feedback': {
    title: '주민 의견 피드백 및 제안방 | 새마을-SDGs',
    description: '더 나은 새마을-SDGs 플랫폼 구축을 위한 기능 제안, 오타 교정 건의 및 주민 피드백을 수렴하는 열린 게시판입니다.',
    keywords: '주민 제안, 피드백, 오타 정정, 플랫폼 건의'
  },
  '/reader/10years': {
    title: '새마을운동 10년사 e-Book 리더 | 새마을-SDGs',
    description: '새마을운동 10년사의 원본 스캔본과 정밀 텍스트를 1:1 대조하며 다국어(영,중,베 등) 번역본으로 열람할 수 있는 뷰어입니다.',
    keywords: '10년사 이북, 대조 뷰어, 다국어 번역'
  },
  '/reader/glory': {
    title: '영광의 발자취 e-Book 리더 | 새마을-SDGs',
    description: '전국 마을 단위 새마을운동 성공 수기와 추진사가 기록된 영광의 발자취 e-Book 리더 및 대조 뷰어입니다.',
    keywords: '영광의 발자취, 성공수기, 마을 역사, 이북 뷰어'
  }
};

export const useSEO = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. 단순 경로 일치 확인
    let seo = SEO_MAP[location.pathname];

    // 2. 동적 경로 패턴 매칭 (예: /reader/10years, /reader/glory 등)
    if (!seo) {
      if (location.pathname.startsWith('/reader/10years')) {
        seo = SEO_MAP['/reader/10years'];
      } else if (location.pathname.startsWith('/reader/glory')) {
        seo = SEO_MAP['/reader/glory'];
      }
    }

    // 3. Fallback 기본값 설정
    const title = seo?.title || '새마을운동 및 SDGs 글로벌 지속가능발전 플랫폼';
    const description = seo?.description || '새마을운동 정신을 바탕으로 글로벌 지속가능발전목표(SDGs) 달성을 위한 AI 데이터 아카이브 및 협력 플랫폼입니다.';
    const keywords = seo?.keywords || '새마을운동, SDGs, 지속가능발전목표, ODA, 글로벌 협력, 새마을 아카이브';

    // 4. document.title 변경
    document.title = title;

    // 5. meta 태그 동적 변경
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateOgMetaTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph 업데이트
    updateOgMetaTag('og:title', title);
    updateOgMetaTag('og:description', description);
    updateOgMetaTag('og:url', window.location.href);

    // Twitter 업데이트
    updateOgMetaTag('twitter:title', title);
    updateOgMetaTag('twitter:description', description);
  }, [location]);
};
