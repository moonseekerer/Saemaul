import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      nav: {
        home: "홈",
        test: "새마을 테스트",
        chatbot: "챗봇",
        community: "마을회관",
        hub: "지식 허브",
        join: "커뮤니티 가입"
      },
      hero: {
        badge: "1970년대 역사 실화부터 인터랙티브 테스트까지",
        title1: "더 안전하고 행복한 세상을 향하여,",
        title2: "디지털로 꽃피우다",
        subtitle: "역사 아카이브 속 '진짜' 성공 실화들을 탐색하고, 나만의 새마을 리더십과 6대 정신 유형을 분석해 보세요. 똑똑한 AI 마스코트 새댕이, 그리고 디지털 마을회관 이웃들과 함께 더 나은 공동체의 내일을 만들어갑니다.",
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
        subtitle: "역사적 발자취에서 지혜를 얻고, 스마트한 기술로 공동체의 미래를 연결합니다.",
        learn_more: "자세히 보기",
        card1: {
          title: "나의 새마을 성향 진단",
          desc: "\"내가 만약 70년대 마을 리더였다면?\" 역사 속 딜레마 시나리오를 풀며 나의 리더십 유형과 6대 가치관을 분석해보세요."
        },
        card2: {
          title: "디지털 소통 '마을회관'",
          desc: "전 세계 친구들과 소중한 지혜와 활동을 나누고 소통하며, 끈끈하고 따뜻한 온라인 마을 공동체를 만들어갑니다."
        },
        card3: {
          title: "AI 어드바이저 '새댕이'",
          desc: "방대한 실제 수기 기록을 학습한 귀여운 AI 마스코트 '새댕이'가 역사적 사실부터 미래 스마트 전략까지 명쾌하게 답변해 드립니다."
        },
        card4: {
          title: "새마을 지식 허브",
          desc: "OCR과 AI 기술로 정밀하게 풀어낸 방대한 실화 현대어 번역본을 자유롭게 탐색하고 그날의 가치를 생생히 마주해보세요."
        }
      },
      footer: {
        desc: "대한민국의 발전 유산과 현대의 기술을 결합하여 전 세계를 위한 지속 가능한 내일을 건설합니다.",
        links: "사이트 맵",
        p_policy: "개인정보 처리방침",
        terms: "이용약관",
        contact: "문의하기",
        connect: "소셜 미디어",
        rights: "All rights reserved"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        test: "Saemaul Test",
        chatbot: "Chatbot",
        community: "Village Hall",
        hub: "Knowledge Hub",
        join: "Join Community"
      },
      hero: {
        badge: "From 1970s historical facts to interactive tests",
        title1: "Towards a Safer and Happier World,",
        title2: "Blooming in digital era",
        subtitle: "Explore real success stories in historical archives and analyze your Saemaul leadership archetype and 6 core values. Join AI mascot Saedaeng-i and neighbors in the digital village hall to build a brighter community.",
        cta_start: "Start Platform",
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
        title: "Explore Our Core Features",
        subtitle: "Gaining wisdom from footprints of glory, connecting the community future via smart technology.",
        learn_more: "Learn More",
        card1: {
          title: "Saemaul Archetype Diagnosis",
          desc: "\"What if I were a 70s village leader?\" Solve real historical dilemma scenarios to analyze your leadership style and 6 core values."
        },
        card2: {
          title: "Digital Space 'Village Hall'",
          desc: "Share valuable wisdom and activities with global friends, fostering a warmer, tighter online village community bond."
        },
        card3: {
          title: "AI Advisor 'Saedaeng-i'",
          desc: "Trained on real handwritten record books, our cute AI mascot answers everything from historical facts to future smart strategies."
        },
        card4: {
          title: "Saemaul Knowledge Hub",
          desc: "Explore modern translations of massive real-life stories, precisely restored and decoded via OCR and AI."
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
