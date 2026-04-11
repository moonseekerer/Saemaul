import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      nav: {
        home: "홈",
        test: "리더십 테스트",
        ranking: "리더보드",
        hub: "지식 허브",
        join: "커뮤니티 가입"
      },
      hero: {
        badge: "글로벌 디지털 마을 혁신 이니셔티브",
        title1: "전통의 가치,",
        title2: "디지털로 완성하다",
        subtitle: "새마을 정신의 정수를 이어받아 지속가능발전목표(SDGs)를 실현합니다. 디지털 기술로 변화하는 글로벌 마을 공동체의 여정에 함께하세요.",
        cta_start: "플랫폼 시작하기",
        cta_demo: "체험 영상 보기"
      },
      live: {
        status: "실시간 현황",
        villages: "참여 중인 글로벌 마을",
        role_unlock: "새로운 등급 달성",
        leader: "디지털 새마을 리더",
        milestone: "SDG 17 목표 달성",
        partnership: "글로벌 파트너십 강화 완료",
        engaging: "현재 활발히 활동 중"
      },
      features: {
        title: "핵심 서비스 둘러보기",
        subtitle: "전통적 지혜와 디지털 기술의 융합을 통해 글로벌 번영을 이끕니다.",
        learn_more: "자세히 보기",
        card1: {
          title: "새마을 리더십 유형 테스트",
          desc: "데이터 기반의 문항을 통해 당신의 잠재된 리더십 스타일을 분석해 드립니다."
        },
        card2: {
          title: "Global Village 랭킹",
          desc: "전 세계 협력 마을의 발전 지표를 실시간으로 확인하고 비교해 보세요."
        },
        card3: {
          title: "AI 새마을 지식 전문가",
          desc: "지역 개발 전략부터 운영 노하우까지, 지능형 챗봇이 즉각적인 해답을 드립니다."
        },
        card4: {
          title: "새마을 디지털 아카이브",
          desc: "OCR 기술로 복원된 방대한 역사적 기록과 성공 사례를 자유롭게 탐색하세요."
        }
      },
      footer: {
        desc: "대한민국의 발전 유산과 현대의 기술을 결합하여 전 세계를 위한 지속 가능한 내일을 건설합니다.",
        links: "사이트 맵",
        p_policy: "개인정보 처리방침",
        terms: "이용약관",
        contact: "문의하기",
        connect: "소셜 미디어",
        rights: "모든 권리 보유"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        test: "Type Test",
        ranking: "Ranking",
        hub: "Knowledge Hub",
        join: "Join Community"
      },
      hero: {
        badge: "Global Village Initiative",
        title1: "Ancient Spirit,",
        title2: "Modern Tools",
        subtitle: "Empowering SDGs 4 & 17 through Saemaul Principles. Join a global movement of digital transformation and local development.",
        cta_start: "Start Your Journey",
        cta_demo: "Watch Demo"
      },
      live: {
        status: "Live Status",
        villages: "Global Villages",
        role_unlock: "New Role Unlocked",
        leader: "Digital Saemaul Leader",
        milestone: "SDG 17 Milestone",
        partnership: "Global Partnership Boosted",
        engaging: "Engaging Now"
      },
      features: {
        title: "Explore Our Platform",
        subtitle: "Transforming traditional wisdom into digital solutions for global prosperity.",
        learn_more: "Learn More",
        card1: {
          title: "Saemaul Archetype Test",
          desc: "Identify your leadership style based on Saemaul principles."
        },
        card2: {
          title: "Global Village Ranking",
          desc: "Track progress and compare development metrics worldwide."
        },
        card3: {
          title: "AI Saemaul Chatbot",
          desc: "Real-time expert guidance on local development strategies."
        },
        card4: {
          title: "OCR Knowledge Archive",
          desc: "Access digitized historical records with advanced OCR search."
        }
      },
      footer: {
        desc: "Building a sustainable future by integrating Korea's development heritage with modern digital technology.",
        links: "Quick Links",
        p_policy: "Privacy Policy",
        terms: "Terms of Service",
        contact: "Contact Us",
        connect: "Connect",
        rights: "All rights reserved"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko", // 기본 언어
    fallbackLng: "en", // 실패할 경우 대체 언어
    interpolation: {
      escapeValue: false // React 자체가 XSS 취약점을 막아주므로 false로 설정
    }
  });

export default i18n;
