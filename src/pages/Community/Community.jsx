import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, 
  BarChart3, 
  MapPin, 
  Heart, 
  Share2, 
  Repeat, 
  CheckCircle2, 
  Send, 
  Globe, 
  User, 
  Lock, 
  Sparkles,
  Award,
  TrendingUp,
  CalendarCheck,
  MessageSquare,
  MessageCircle,
  Camera,
  Tag,
  ArrowRight,
  Trash2,
  XCircle,
  Loader2,
  Search,
  Briefcase,
  Calendar,
  UserPlus,
  PlusCircle,
  Languages,
  Bookmark,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  increment,
  getDocs,
  where,
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { addPointWithLimit, adjustUserPointsByAdmin, checkAndProcessAttendance, updateUserReceivedLikes } from '../../utils/points';
import UserListModal from '../../components/UserListModal';
import UserProfileModal from '../../components/UserProfileModal';
import GupanjangModal from '../../components/GupanjangModal';
import AuthModal from '../../components/AuthModal';

const ADMIN_EMAIL = 'anstlr6665@gmail.com';

// KST 기준 오늘 날짜 문자열 (YYYY-MM-DD)
function getKstTodayString() {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (3600000 * 9));
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Groq API setup matching chatbot
const apiKeys = [
  import.meta.env.VITE_GROQ_API_KEY_1 || '',
  import.meta.env.VITE_GROQ_API_KEY_2 || '',
  import.meta.env.VITE_GROQ_API_KEY_3 || ''
].filter(Boolean);
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// UN 6 official languages map (+ Korean)
const SUPPORTED_LANGUAGES = [
  { code: 'device', name: '💻 기기 기본 언어' },
  { code: 'ko', name: '🇰🇷 한국어 (Korean)' },
  { code: 'en', name: '🇺🇸 영어 (English)' },
  { code: 'zh', name: '🇨🇳 중국어 (Chinese)' },
  { code: 'es', name: '🇪🇸 스페인어 (Spanish)' },
  { code: 'fr', name: '🇫🇷 프랑스어 (French)' },
  { code: 'ar', name: '🇸🇦 아랍어 (Arabic)' },
  { code: 'ru', name: '🇷🇺 러시아어 (Russian)' }
];

const getAvatarMarkup = (displayName, photoURL) => {
  if (displayName === '해외지역 청년지도자') {
    return <div className="w-10 h-10 rounded-full bg-[#2196f3] text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0">해외</div>;
  }
  if (displayName === '구미지역 청년지도자') {
    return <div className="w-10 h-10 rounded-full bg-[#ff9800] text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0">구미</div>;
  }
  if (displayName === '희망지역 부녀회원') {
    return <div className="w-10 h-10 rounded-full bg-[#4caf50] text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0">희망</div>;
  }
  if (photoURL) {
    return <img src={photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-100 p-0.5 shadow-sm shrink-0" />;
  }
  const initial = displayName ? displayName.substring(0, 2) : '주민';
  return <div className="w-10 h-10 rounded-full bg-[#00843D]/10 text-[#00843D] flex items-center justify-center font-extrabold text-xs border-2 border-[#00843D]/20 shadow-sm shrink-0">{initial}</div>;
};

const fallbackPosts = [
  {
    id: 'mock1',
    uid: 'mock_laos_leader',
    displayName: '해외지역 청년지도자',
    content: '[현장보고] 라오스 농촌개발 새마을 프로젝트 현황입니다. 스마트 관개 시스템 덕분에 첫 수확을 마쳤습니다! 🌾🚜 #SDGs #Saemaul',
    timestamp: { seconds: Date.now()/1000 - 600 },
    likes: 342,
    category: 'SDG 2',
    location: '라오스 사업장',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'mock2',
    uid: 'mock_gumi_leader',
    displayName: '구미지역 청년지도자',
    content: '구미 새마을운동 테마공원에 다녀왔습니다. 글로벌관에서 아프리카·동남아 ODA 성과 전시를 보며 우리 운동이 세계에 미치는 영향을 실감했어요. 세미나실과 도서관도 잘 갖춰져 있어 연구 방문하기에도 좋습니다 📚🌏 #새마을테마공원 #구미',
    timestamp: { seconds: Date.now()/1000 - 10800 },
    likes: 211,
    category: '역사관광',
    location: '구미 새마을 테마공원',
    image: 'https://images.unsplash.com/photo-1473215161041-e946a48a49c6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'mock3',
    uid: 'mock_hope_member',
    displayName: '희망지역 부녀회원',
    content: "COP28 이후 탄소중립 이행 속도에 대한 논의가 뜨겁습니다. 새마을 정신인 '자조'와 '협동'이 개발도상국 에너지 전환 격차를 줄이는 실질적인 대안이 될 수 있을까요? 🌍💬 여러분의 생각을 댓글로 나눠주세요!",
    timestamp: { seconds: Date.now()/1000 - 7200 },
    likes: 156,
    category: '글로벌 이슈',
    location: '글로벌 이슈 토론',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
  }
];

const discussionTopics = [
  {
    id: 1,
    title: '스마트 팜 기술 도입을 통한 마을 소득 증대 방안',
    author: '김마을 이장',
    date: '2026-05-15',
    participants: 24,
    status: '진행중',
    category: '기술혁신'
  },
  {
    id: 2,
    title: '탄소 중립 실천을 위한 마을 쓰레기 분리수거함 현대화',
    author: '이협동 부녀회장',
    date: '2026-05-14',
    participants: 18,
    status: '투표중',
    category: '환경보호'
  },
  {
    id: 3,
    title: '청년 세대의 새마을운동 참여 확대를 위한 디지털 소통 전략',
    author: '박청년 청년회장',
    date: '2026-05-13',
    participants: 32,
    status: '진행중',
    category: '세대통합'
  },
  {
    id: 4,
    title: '마을 회관 유휴 공간을 활용한 실버 정보화 교육 센터 구축',
    author: '최자조 노인회장',
    date: '2026-05-12',
    participants: 15,
    status: '검토완료',
    category: '교육복지'
  }
];

const sdgGoals = [
  { num: 1, emoji: '🚫', nameKo: '빈곤퇴치', nameEn: 'No Poverty', color: '#E5243B', desc: '모든 국가에서 모든 형태의 빈곤 퇴치', targets: ['2030년까지 절대빈곤 퇴치 ($1.25/일 미만)', '빈곤 인구 비율 50% 감소', '사회보호 시스템 구축', '경제적 자원에 대한 동등한 접근 보장'] },
  { num: 2, emoji: '🌾', nameKo: '기아종식', nameEn: 'Zero Hunger', color: '#DDA63A', desc: '기아 종식, 식량안보 확보, 영양개선, 지속가능농업 증진', targets: ['안전하고 영양가 있는 식량 접근 보장', '모든 형태의 영양실조 종식', '소규모 식량생산자 농업 생산성 2배 향상', '지속 가능한 식량 생산 시스템 구축'] },
  { num: 3, emoji: '💊', nameKo: '건강과 웰빙', nameEn: 'Good Health & Well-being', color: '#4C9F38', desc: '건강한 삶 보장과 모든 연령대의 웰빙 증진', targets: ['모성사망비 10만 당 70 미만으로 감소', '신생아·5세 이하 예방 가능한 사망 종식', 'AIDS·결핵·말라리아 등 전염병 퇴치', '보편적 건강보험 달성'] },
  { num: 4, emoji: '📚', nameKo: '양질의 교육', nameEn: 'Quality Education', color: '#C5192D', desc: '포용적이고 공평한 양질의 교육 보장 및 평생학습 기회 증진', targets: ['무상 초·중등 교육 보장', '양질의 영유아 교육 접근성 확보', '기술·직업 교육 동등한 접근', '지속가능발전 교육 학습'] },
  { num: 5, emoji: '⚧️', nameKo: '양성평등', nameEn: 'Gender Equality', color: '#FF3A21', desc: '양성평등 달성 및 여성·여아의 역량 강화', targets: ['여성 차별 종식', '여성 폭력 근절', '유해한 관행 철폐', '여성의 경제적 자원 동등 접근'] },
  { num: 6, emoji: '💧', nameKo: '깨끗한 물과 위생', nameEn: 'Clean Water & Sanitation', color: '#26BDE2', desc: '식수와 위생시설 접근성 및 지속 가능한 관리 확립', targets: ['안전한 식수 보편적 접근', '위생시설 접근 및 위생 인식 개선', '수질 개선 및 폐수 처리 강화', '물 사용 효율성 향상'] },
  { num: 7, emoji: '⚡', nameKo: '저렴하고 깨끗한 에너지', nameEn: 'Affordable & Clean Energy', color: '#FCC30B', desc: '적정 가격의 신뢰할 수 있고 지속 가능한 현대식 에너지에 대한 접근 보장', targets: ['에너지 서비스 보편적 접근', '신재생에너지 비율 대폭 확대', '에너지 효율 개선율 2배 달성', '청정에너지 기술 연구 협력'] },
  { num: 8, emoji: '📈', nameKo: '양질의 일자리와 경제성장', nameEn: 'Decent Work & Growth', color: '#A21942', desc: '지속가능하고 포용적인 경제성장, 생산적인 완전고용과 양질의 일자리 증진', targets: ['1인당 경제성장률 유지', '기술혁신 및 고부가가치 산업 육성', '청년 일자리 및 양질의 고용 증진', '강제노동 종식 및 근로 권리 보장'] },
  { num: 9, emoji: '🏗️', nameKo: '산업, 혁신 및 인프라', nameEn: 'Industry, Innovation & Infra', color: '#FD6925', desc: '회복력 있는 인프라 구축, 포용적이고 지속가능한 산업화 증진 및 혁신 촉진', targets: ['지속가능한 고품질 인프라 구축', '포용적 산업화 및 제조업 비중 확대', '금융 서비스 접근성 제고', '친환경 산업 기술 도입'] },
  { num: 10, emoji: '⚖️', nameKo: '불평등 완화', nameEn: 'Reduced Inequalities', color: '#DD1367', desc: '국가 내 및 국가 간 불평등 완화', targets: ['하위 40% 소득 성장률 향상', '사회·경제·정치적 포용성 증진', '차별적 법률 및 정책 개혁', '이주민 정책의 체계화'] },
  { num: 11, emoji: '🏙️', nameKo: '지속 가능한 도시와 공동체', nameEn: 'Sustainable Cities', color: '#FD9D24', desc: '포용적이고 안전하며 회복력 있고 지속가능한 도시와 주거지 조성', targets: ['적절하고 저렴한 주거 확보', '대중교통 시스템 확대', '지속가능한 도시 계획 수립', '세계 문화 및 자연유산 보호'] },
  { num: 12, emoji: '♻️', nameKo: '지속 가능한 소비와 생산', nameEn: 'Responsible Consumption', color: '#C9992D', desc: '지속가능한 소비 및 생산 패턴 보장', targets: ['지속가능한 10개년 계획 이행', '천연자원의 효율적 관리', '음식물 쓰레기 50% 감축', '폐기물 발생 대폭 감소 및 재활용'] },
  { num: 13, emoji: '🌍', nameKo: '기후행동', nameEn: 'Climate Action', color: '#3F7E44', desc: '기후변화와 그 영향을 방지하기 위한 긴급한 행동 실시', targets: ['기후 재난에 대한 회복력 강화', '국가 정책에 기후대책 통합', '기후변화 교육 및 의식 향상', '녹색기후기금 재원 확보'] },
  { num: 14, emoji: '🐟', nameKo: '해양생태계 보전', nameEn: 'Life Below Water', color: '#0A97D9', desc: '지속가능발전을 위한 해양·바다·해양자원의 보전 및 지속가능한 이용', targets: ['해양 오염의 획기적 저감', '해양 생태계 보호 및 회복', '해양 산성화 영향 최소화', '어획량 규제 및 과잉어획 방지'] },
  { num: 15, emoji: '🌳', nameKo: '육상생태계 보전', nameEn: 'Life on Land', color: '#56C02B', desc: '육상생태계 보호·복원 및 지속가능한 관리, 삼림 관리, 황폐화 방지, 생물다양성 손실 중단', targets: ['육상 생태계 보전 및 복원', '지속 가능한 산림 경영 실천', '사막화 방지 및 훼손지 복원', '멸종위기종 보호 및 생물다양성 보전'] },
  { num: 16, emoji: '🕊️', nameKo: '평화, 정의 및 제도 구축', nameEn: 'Peace, Justice & Institutions', color: '#00689D', desc: '지속가능발전을 위한 평화롭고 포용적인 사회 증진, 사법 접근성 제공, 책임 있고 포용적인 제도 구축', targets: ['모든 형태의 폭력 및 사망률 감소', '아동 학대 및 폭력 근절', '법치주의 증진 및 사법 접근 보장', '부패와 뇌물 수수 감축'] },
  { num: 17, emoji: '🤝', nameKo: '목표 달성을 위한 파트너십', nameEn: 'Partnerships for the Goals', color: '#19486A', desc: '이행수단 강화 및 지속가능발전을 위한 글로벌 파트너십 재활성화', targets: ['국내 재원 조달 능력 강화', 'ODA 원조 증대', '친환경 기술 이전 및 보급', '다자적 무역 시스템 증진'] }
];

const travelDestinations = [
  {
    id: 1,
    title: '청도 새마을운동 발상지 기념공원',
    region: '경북 청도',
    tag: '발상지 기념관',
    desc: '1969년 박정희 대통령이 수해 복구 현장을 보며 새마을운동의 영감을 얻은 태동지 신도마을. 조국 근대화의 발상지로서의 유산과 테마공원이 마련되어 있습니다.',
    likes: 892,
    image: 'https://cheongdo.grandculture.net/Image?localCode=cheongdo&imageNum=GC055P02422&size=w600',
    officialUrl: 'https://xn--hz2bq6b65fza514fdzd.kr/main.html'
  },
  {
    id: 2,
    title: '구미 새마을운동 테마공원',
    region: '경북 구미',
    tag: '새마을전시관',
    desc: '과거, 현재, 미래를 한눈에 볼 수 있는 대규모 복합 문화공간. 글로벌관을 통한 해외 전파 성공 사례가 상세히 전시되어 있어 학술 연구 가치도 지닙니다.',
    likes: 1204,
    image: 'https://gumi.grandculture.net/Image?localCode=gumi&imageNum=GC082P01799&size=w600',
    officialUrl: 'https://www.gb.go.kr/Main/saemaul/index.html'
  },
  {
    id: 3,
    title: '포항 새마을운동 발상지 기념관',
    region: '경북 포항',
    tag: '기념전시관',
    desc: '문충리 새마을운동 기록물과 전시 사용되던 농기구들이 전시되어 있으며, 사방 기념공원과 인접해 풍성한 볼거리를 제공합니다.',
    likes: 543,
    image: 'https://pohang.grandculture.net/Image?localCode=pohang&imageNum=GC057P02553&size=w600',
    officialUrl: 'https://www.pohang.go.kr/saemaul/main.do'
  }
];

const Community = ({ onSelectUser }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Modals for Registry, Profile and Gupanjang
  const [selectedUserUid, setSelectedUserUid] = useState(null);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [isGupanjangOpen, setIsGupanjangOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);

  // My Page States
  const [myPosts, setMyPosts] = useState([]);
  const [myAttendances, setMyAttendances] = useState([]);

  // SDGs & Bookmark & Search States
  const [selectedSDGGoal, setSelectedSDGGoal] = useState(null);
  const [feedFilter, setFeedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDestination, setActiveDestination] = useState(null);
  const [bookmarkedDestinations, setBookmarkedDestinations] = useState(() => {
    const saved = localStorage.getItem('saemaul_bookmarks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleBookmark = (destId) => {
    const next = new Set(bookmarkedDestinations);
    if (next.has(destId)) {
      next.delete(destId);
    } else {
      next.add(destId);
    }
    setBookmarkedDestinations(next);
    localStorage.setItem('saemaul_bookmarks', JSON.stringify([...next]));
  };

  const filteredDestinations = travelDestinations.filter(dest => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dest.title.toLowerCase().includes(query) ||
      dest.region.toLowerCase().includes(query) ||
      dest.desc.toLowerCase().includes(query) ||
      (dest.tag && dest.tag.toLowerCase().includes(query))
    );
  });

  // Admin Actions States
  const [adminManualName, setAdminManualName] = useState('');
  const [isAdminAdding, setIsAdminAdding] = useState(false);

  // Post Writing
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('일반');
  const [locationInput, setLocationInput] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  
  // Image Compression
  const [attachedImage, setAttachedImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);
  
  // Groq Smart AI Translation States
  const [translatedTexts, setTranslatedTexts] = useState({}); // { [postId]: "translated content" }
  const [isTranslatingMap, setIsTranslatingMap] = useState({}); // { [postId]: boolean }
  const [postTargetLang, setPostTargetLang] = useState({}); // { [postId]: "lang_code" }
  const [lastTranslateTime, setLastTranslateTime] = useState(0);
  const [userLikedPosts, setUserLikedPosts] = useState(new Set()); // 유저가 좋아요 누른 포스트 ID 셋

  // Clipboard
  const [copiedId, setCopiedId] = useState(null);

  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Talk States
  const [discussions, setDiscussions] = useState([]);
  const [showTalkModal, setShowTalkModal] = useState(false);
  const [newTalkTitle, setNewTalkTitle] = useState('');
  const [newTalkCategory, setNewTalkCategory] = useState('기술혁신');
  const [isSubmittingTalk, setIsSubmittingTalk] = useState(false);

  // LiveChat States
  const [liveChatMessages, setLiveChatMessages] = useState([]);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef(null);

  // Chat Archive States
  const [chatArchives, setChatArchives] = useState([]);
  const [expandedArchives, setExpandedArchives] = useState({});
  const [isArchiving, setIsArchiving] = useState(false);

  // Missing States for Comments and UI
  const [commentsMap, setCommentsMap] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (currentUserData) {
      setNickname(currentUserData.displayName || currentUserData.email || '익명의 주민');
    } else if (user) {
      setNickname(user.displayName || user.email || '익명의 주민');
    } else {
      setNickname('');
    }
  }, [currentUserData, user]);


  const defaultTrends = [
    '1. 탄소중립 실천',
    '2. 스마트 팜 교육',
    '3. ODA 사업 공모',
    '4. 플라스틱 제로',
    '5. 에너지 자립마을'
  ];

  const boardCategories = sdgGoals.slice(0, 6).map(g => `${g.emoji} ${g.nameKo} (SDG ${g.num})`);

  // LiveChat Firestore subscription (today only)
  useEffect(() => {
    if (activeTab !== 'talk') return;
    const q = query(
      collection(db, 'livechat'),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLiveChatMessages(msgs);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return () => unsub();
  }, [activeTab]);

  // LiveChat Archives subscription
  useEffect(() => {
    if (activeTab !== 'talk') return;
    const q = query(collection(db, 'livechat_archives'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setChatArchives(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [activeTab]);

  // Auto-archive old messages when talk tab opens
  useEffect(() => {
    if (activeTab !== 'talk' || isArchiving) return;
    const archiveOld = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const q = query(collection(db, 'livechat'), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      const oldDocs = snap.docs.filter(d => {
        const ts = d.data().createdAt;
        if (!ts?.toDate) return false;
        return ts.toDate().toISOString().split('T')[0] < todayStr;
      });
      if (oldDocs.length === 0) return;
      setIsArchiving(true);
      // Group by date
      const byDate = {};
      oldDocs.forEach(d => {
        const dateStr = d.data().createdAt.toDate().toISOString().split('T')[0];
        if (!byDate[dateStr]) byDate[dateStr] = [];
        byDate[dateStr].push({ id: d.id, ...d.data() });
      });
      for (const [dateStr, msgs] of Object.entries(byDate)) {
        // Check if archive already exists
        const archiveRef = doc(db, 'livechat_archives', dateStr);
        const existing = await getDocs(query(collection(db, 'livechat_archives'), where('date', '==', dateStr), limit(1)));
        if (!existing.empty) {
          // Delete originals only
          for (const m of msgs) await deleteDoc(doc(db, 'livechat', m.id));
          continue;
        }
        // Build archive messages array
        const archiveMsgs = msgs.map(m => ({
          text: m.text,
          displayName: m.displayName,
          uid: m.uid,
          photoURL: m.photoURL || null,
          time: m.createdAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
        // Call Groq for summary
        let summary = '요약을 생성하는 중...';
        let success = false;
        const chatText = archiveMsgs.map(m => `${m.displayName}: ${m.text}`).join('\n');
        
        for (let i = 0; i < apiKeys.length; i++) {
          const key = apiKeys[i];
          if (!key) continue;
          try {
            const res = await fetch(GROQ_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
              body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                  { role: 'system', content: '당신은 새마을운동 커뮤니티 채팅 요약 AI입니다. 아래 하루치 채팅 내용을 읽고, 주요 화제와 논의 흐름을 한국어 3~5문장으로 간결하게 요약해주세요. 이모지를 2~3개 사용하여 생동감 있게 작성하세요.' },
                  { role: 'user', content: chatText }
                ],
                max_tokens: 300,
                temperature: 0.7
              })
            });
            if (res.ok) {
              const data = await res.json();
              summary = data.choices?.[0]?.message?.content?.trim() || '요약을 생성할 수 없었습니다.';
              success = true;
              break;
            }
          } catch (e) {
            console.error(`Groq archive summary API Key ${i} error:`, e);
          }
        }
        if (!success) {
          summary = '요약 생성 중 오류가 발생했습니다.';
        }
        // Save archive
        const [y, m2, d2] = dateStr.split('-');
        await addDoc(collection(db, 'livechat_archives'), {
          date: dateStr,
          label: `${y}년 ${parseInt(m2)}월 ${parseInt(d2)}일 토론`,
          messages: archiveMsgs,
          summary,
          messageCount: archiveMsgs.length,
          archivedAt: serverTimestamp()
        });
        // Delete originals
        for (const msg of msgs) await deleteDoc(doc(db, 'livechat', msg.id));
      }
      setIsArchiving(false);
    };
    archiveOld();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSendLiveChat = useCallback(async () => {
    if (!liveChatInput.trim() || !user || isSendingChat) return;
    setIsSendingChat(true);
    try {
      await addDoc(collection(db, 'livechat'), {
        text: liveChatInput.trim(),
        uid: user.uid,
        displayName: user.displayName || nickname || '익명',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setLiveChatInput('');
    } catch (e) {
      console.error('livechat send error:', e);
    }
    setIsSendingChat(false);
  }, [liveChatInput, user, isSendingChat, nickname]);

  const handleDeleteLiveChat = useCallback(async (msgId) => {
    try {
      await deleteDoc(doc(db, 'livechat', msgId));
    } catch (e) {
      console.error('livechat delete error:', e);
    }
  }, []);

  const handleDeleteArchivedMessage = useCallback(async (archiveId, msgIdx) => {
    if (!window.confirm("이 아카이브 메시지를 삭제하시겠습니까?")) return;
    try {
      const archiveRef = doc(db, 'livechat_archives', archiveId);
      const archiveDoc = chatArchives.find(a => a.id === archiveId);
      if (!archiveDoc) return;
      const updatedMessages = (archiveDoc.messages || []).filter((_, idx) => idx !== msgIdx);
      await updateDoc(archiveRef, {
        messages: updatedMessages,
        messageCount: updatedMessages.length
      });
    } catch (e) {
      console.error("Failed to delete archived message:", e);
      alert("아카이브 메시지 삭제 중 오류가 발생했습니다.");
    }
  }, [chatArchives]);

  const handleDeleteArchive = useCallback(async (archiveId) => {
    if (!window.confirm("이 날짜의 모든 아카이브 데이터를 완전히 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)")) return;
    try {
      await deleteDoc(doc(db, 'livechat_archives', archiveId));
    } catch (e) {
      console.error("Failed to delete archive:", e);
      alert("아카이브 삭제 중 오류가 발생했습니다.");
    }
  }, []);

  // 1. CSS and Font Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
      @font-face {
          font-family: 'Presentation';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-4Regular.woff2') format('woff2');
          font-weight: 400;
          font-display: swap;
      }
      @font-face {
          font-family: 'Presentation';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-7Bold.woff2') format('woff2');
          font-weight: 700;
          font-display: swap;
      }
      @font-face {
          font-family: 'Presentation';
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-9Black.woff2') format('woff2');
          font-weight: 900;
          font-display: swap;
      }
      .saemaul-font {
         font-family: 'Presentation', 'Inter', 'Noto Sans KR', sans-serif !important;
      }
      .post-hover-effect {
         transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      }
      .post-hover-effect:hover {
         transform: translateY(-8px) scale(1.01) !important;
         box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // 2. Auth Setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) checkTodayAttendance(currentUser);
      else setHasCheckedIn(false);
    });
    return unsubscribe;
  }, []);

  // 2.5. Subscribe to Current User Data in users collection
  useEffect(() => {
    if (!user) {
      setCurrentUserData(null);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentUserData(docSnap.data());
      }
    }, (err) => {
      console.error("Error loading user profile in Community:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Dynamic Fetch for Current User (My Page stats)
  useEffect(() => {
    if (!user) {
      setMyPosts([]);
      setMyAttendances([]);
      return;
    }
    // 색인(Index) 없이도 즉시 반영되도록 orderBy 제거 후 클라이언트에서 정렬
    const myPostsQ = query(collection(db, 'posts'), where('uid', '==', user.uid));
    const unsubMyPosts = onSnapshot(myPostsQ, (snap) => {
      const sortedPosts = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const t1 = a.timestamp?.seconds || Date.now() / 1000;
          const t2 = b.timestamp?.seconds || Date.now() / 1000;
          return t2 - t1;
        });
      setMyPosts(sortedPosts);
    });

    const myAttQ = query(collection(db, 'attendance'), where('uid', '==', user.uid));
    const unsubMyAtt = onSnapshot(myAttQ, (snap) => {
      const sortedAtt = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const t1 = a.timestamp?.seconds || Date.now() / 1000;
          const t2 = b.timestamp?.seconds || Date.now() / 1000;
          return t2 - t1;
        });
      setMyAttendances(sortedAtt);
    });
    return () => {
      unsubMyPosts();
      unsubMyAtt();
    };
  }, [user]);

  // 토론 주제 추적
  useEffect(() => {
    const q = query(collection(db, 'discussions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbTalks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // 예시 데이터와 합침 (데모용)
      setDiscussions([...dbTalks, ...discussionTopics]);
    });
    return unsubscribe;
  }, []);

  // 4. Read Global Streams (Posts and Attendance)
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    }, (error) => console.error(error));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttendances(attendanceData);
    }, (error) => console.error(error));
    return unsubscribe;
  }, []);

  // 5. Read Comments Stream
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const grouped = allComments.reduce((acc, comment) => {
        if (!acc[comment.postId]) acc[comment.postId] = [];
        acc[comment.postId].push(comment);
        return acc;
      }, {});
      setCommentsMap(grouped);
    }, (error) => console.error("Comments fetch error:", error));
    return unsubscribe;
  }, []);

  // 좋아요 상태 추적
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'post_likes'), where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const likedIds = new Set(snapshot.docs.map(doc => doc.data().postId));
        setUserLikedPosts(likedIds);
      }, (error) => console.error("Likes fetch error:", error));
      return unsubscribe;
    } else {
      const saved = JSON.parse(localStorage.getItem('saemaul_guest_likes') || '[]');
      setUserLikedPosts(new Set(saved));
    }
  }, [user]);

  const handleSelectUser = (uid) => {
    if (onSelectUser) {
      onSelectUser(uid);
    } else {
      setSelectedUserUid(uid);
    }
  };

  const handleSelectUserFromList = (uid) => {
    setIsUserListOpen(false);
    setSelectedUserUid(uid);
  };

  const checkTodayAttendance = async (currentUser) => {
    try {
      const todayStr = getKstTodayString();
      const q = query(collection(db, 'attendance'), where('uid', '==', currentUser.uid), where('dateString', '==', todayStr));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setHasCheckedIn(true);
      } else {
        // Automatically check in on first load of Community page
        // 1. Initialize user doc and award attendance points
        const res = await checkAndProcessAttendance(currentUser.uid, currentUser.displayName, currentUser.email);
        
        // 2. Add to attendance stream
        await addDoc(collection(db, 'attendance'), {
          uid: currentUser.uid,
          displayName: currentUser.displayName || '마을 주민',
          photoURL: currentUser.photoURL || '',
          timestamp: serverTimestamp(),
          dateString: todayStr
        });
        setHasCheckedIn(true);
        if (res && res.attendanceAwarded) {
          setAttendanceResult(res);
          setShowAttendanceModal(true);
        }
      }
    } catch (e) {
      console.error("Auto attendance check/init failed:", e);
    }
  };

  const handleGoogleLogin = () => {
    setIsAuthOpen(true);
  };

  const handleMarkAttendance = async () => {
    if (!user) {
      alert("출석체크를 하려면 로그인이 필요합니다.");
      handleGoogleLogin();
      return;
    }
    if (hasCheckedIn) return;
    try {
      const todayStr = getKstTodayString();
      const res = await checkAndProcessAttendance(user.uid, user.displayName, user.email);
      await addDoc(collection(db, 'attendance'), {
        uid: user.uid,
        displayName: user.displayName || '마을 주민',
        photoURL: user.photoURL || '',
        timestamp: serverTimestamp(),
        dateString: todayStr
      });
      setHasCheckedIn(true);
      if (res && res.attendanceAwarded) {
        setAttendanceResult(res);
        setShowAttendanceModal(true);
      }
    } catch (e) {
      console.error("Manual attendance check-in failed:", e);
    }
  };

  // ADMIN: Manual Attendance add
  const handleAdminAddAttendance = async (e) => {
    e.preventDefault();
    if (!adminManualName.trim()) return;
    try {
      setIsAdminAdding(true);
      const todayStr = getKstTodayString();
      await addDoc(collection(db, 'attendance'), {
        uid: `admin_manual_${Date.now()}`,
        displayName: adminManualName,
        photoURL: '',
        timestamp: serverTimestamp(),
        dateString: todayStr,
        addedByAdmin: true
      });
      setAdminManualName('');
      setIsAdminAdding(false);
    } catch (err) {
      alert("추가 실패");
      setIsAdminAdding(false);
    }
  };

  // ADMIN: Attendance delete
  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm("이 출석 기록을 강제 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, 'attendance', attendanceId));
    } catch (err) {
      alert("삭제 에러");
    }
  };

  // Groq AI-powered Smart Translation Action
  const handleTranslatePost = async (postId, content, userSelectedCode) => {
    if (isTranslatingMap[postId]) return;

    // 단시간 내 반복 요청 제한 (로그인하지 않은 게스트만 10초 쿨타임 적용)
    const now = Date.now();
    if (!user && (now - lastTranslateTime < 10000)) {
      alert("게스트는 AI 번역을 10초에 한 번만 요청할 수 있습니다. 로그인을 하시면 제한 없이 이용 가능합니다! 😊");
      return;
    }
    setLastTranslateTime(now);

    // Determine exact target language
    let finalLangCode = userSelectedCode || postTargetLang[postId] || 'device';
    
    if (finalLangCode === 'device') {
      // Get browser default primary language (e.g. 'ko', 'en', 'ja')
      finalLangCode = typeof navigator !== 'undefined' ? (navigator.language || 'ko').split('-')[0] : 'ko';
    }

    const langNameMap = {
      ko: 'Korean',
      en: 'English',
      zh: 'Chinese',
      es: 'Spanish',
      fr: 'French',
      ar: 'Arabic',
      ru: 'Russian'
    };

    const targetLanguageName = langNameMap[finalLangCode] || 'English';

    setIsTranslatingMap(prev => ({ ...prev, [postId]: true }));

    let success = false;
    let lastError = null;

    const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

    for (const model of modelsToTry) {
      if (success) break;

      // Iterate through API Keys to avoid rate limits
      for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        if (!key) continue;

        try {
          const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'system',
                  content: `You are a professional translator for the Saemaul-SDGs Global Platform.
Your task is to accurately translate the user's community post into ${targetLanguageName}.
Keep the original tone and context. Do NOT output any explanations, prefaces, or notes. ONLY output the direct translation.

[Terminology Guidelines]
1. Traditional 3 Spirits of Saemaul: Always use 'Diligence, Self-help, Cooperation'.
2. Saemaul Spirit 2.0 (Modern): Use 'Sharing, Service, Creativity'. Always translate '창조' as 'Creativity'.
3. '새마을운동': Translate as 'Saemaul Undong'.`
                },
                {
                  role: 'user',
                  content: content
                }
              ],
              temperature: 0.2
            })
          });

          const data = await response.json();
          if (response.ok) {
            const resultText = data.choices?.[0]?.message?.content || "번역 파싱에 실패했습니다.";
            setTranslatedTexts(prev => ({ ...prev, [postId]: resultText }));
            success = true;
            break;
          } else {
            lastError = data.error?.message || "API Error";
          }
        } catch (err) {
          lastError = err.message;
        }
      }
    }

    if (!success) {
      setTranslatedTexts(prev => ({ ...prev, [postId]: `🚫 무료 번역 AI의 토큰 한도가 소진되었습니다.\n(잠시 후 다시 시도하시거나, 할당량이 초기화될 때까지 기다려주세요.)` }));
    }
    setIsTranslatingMap(prev => ({ ...prev, [postId]: false }));
  };

  // Change inline state for selection dropdown
  const handleTargetLanguageChange = (postId, code) => {
    setPostTargetLang(prev => ({ ...prev, [postId]: code }));
  };

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        const MAX = 800;
        if (width > height) {
          if (width > MAX) { height = Math.round(height * (MAX / width)); width = MAX; }
        } else {
          if (height > MAX) { width = Math.round(width * (MAX / height)); height = MAX; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setAttachedImage(canvas.toDataURL('image/jpeg', 0.6));
        setIsCompressing(false);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!user || !postText.trim()) return;
    
    // 자동 SDG 라벨 분류 로직
    let finalCategory = selectedCategory;
    if (finalCategory === '일반') {
      for (const goal of sdgGoals) {
        const regex1 = new RegExp(`SDG\\s*${goal.num}\\b`, 'i');
        const regex2 = new RegExp(`#SDG\\s*${goal.num}\\b`, 'i');
        const regex3 = new RegExp(goal.nameKo, 'g');
        if (regex1.test(postText) || regex2.test(postText) || regex3.test(postText)) {
          finalCategory = `SDG ${goal.num}`;
          break;
        }
      }
    }

    try {
      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email || '',
        content: postText,
        timestamp: serverTimestamp(),
        likes: 0,
        category: finalCategory,
        location: locationInput || '새마을 스마트빌리지',
        image: attachedImage || null
      });
      setPostText(''); setLocationInput(''); setAttachedImage(null); setIsWriting(false);
      setSelectedCategory('일반'); // 카테고리 초기화

      // 글 작성 포인트 적립 (+15 P, 1일 3회 제한)
      try {
        const res = await addPointWithLimit(user.uid, 'post');
        if (res.pointsEarned > 0) {
          alert(`📝 새마을 글 작성 포인트 +${res.pointsEarned} P가 지급되었습니다!`);
        }
        if (res.unlockedTitles && res.unlockedTitles.length > 0) {
          alert(`🎉 축하합니다! 신규 칭호가 해금되었습니다: ${res.unlockedTitles.join(', ')}`);
        }
      } catch (pointErr) {
        console.error("Failed to add post point:", pointErr);
      }
    } catch (e) { alert("작성 에러"); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("이 게시물을 정말 삭제하시겠습니까?")) return;
    try { await deleteDoc(doc(db, 'posts', postId)); } catch (e) {}
  };

  const handleLikePost = async (postId) => {
    const targetPost = posts.find(p => p.id === postId);
    const authorUid = targetPost ? targetPost.uid : null;

    // 게스트 처리
    if (!user) {
      const currentLikes = new Set(userLikedPosts);
      const postRef = doc(db, 'posts', postId);
      try {
        if (currentLikes.has(postId)) {
          currentLikes.delete(postId);
          await updateDoc(postRef, { likes: increment(-1) });
          if (authorUid) await updateUserReceivedLikes(authorUid, -1);
        } else {
          currentLikes.add(postId);
          await updateDoc(postRef, { likes: increment(1) });
          if (authorUid) await updateUserReceivedLikes(authorUid, 1);
        }
        setUserLikedPosts(currentLikes);
        localStorage.setItem('saemaul_guest_likes', JSON.stringify([...currentLikes]));
      } catch (e) { console.error("Guest like error:", e); }
      return;
    }

    // 로그인 유저 처리 (토글)
    try {
      const postRef = doc(db, 'posts', postId);
      const likeQuery = query(collection(db, 'post_likes'), where('postId', '==', postId), where('uid', '==', user.uid));
      const likeSnap = await getDocs(likeQuery);

      if (!likeSnap.empty) {
        // 이미 좋아요를 누름 -> 취소
        await deleteDoc(doc(db, 'post_likes', likeSnap.docs[0].id));
        await updateDoc(postRef, { likes: increment(-1) });
        if (authorUid) await updateUserReceivedLikes(authorUid, -1);
      } else {
        // 안 눌렀음 -> 추가
        await addDoc(collection(db, 'post_likes'), {
          postId,
          uid: user.uid,
          timestamp: serverTimestamp()
        });
        await updateDoc(postRef, { likes: increment(1) });
        if (authorUid) await updateUserReceivedLikes(authorUid, 1);
      }
    } catch (e) {
      console.error("Auth user like error:", e);
    }
  };

  const handleShare = (id) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSubmitComment = async (e, postId) => {
    e.preventDefault();
    if (!user || !commentTexts[postId]?.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const commentData = {
        postId: postId,
        uid: user.uid,
        displayName: user.displayName || nickname || '익명 주민',
        photoURL: user.photoURL || '',
        content: commentTexts[postId],
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'comments'), commentData);
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));

      // 댓글 작성 포인트 적립 (+5 P, 1일 10회 제한)
      try {
        const res = await addPointWithLimit(user.uid, 'comment');
        if (res.pointsEarned > 0) {
          console.log(`💬 댓글 작성 포인트 +${res.pointsEarned} P가 지급되었습니다.`);
        }
        if (res.unlockedTitles && res.unlockedTitles.length > 0) {
          alert(`🎉 축하합니다! 신규 칭호가 해금되었습니다: ${res.unlockedTitles.join(', ')}`);
        }
      } catch (pointErr) {
        console.error("Failed to add comment point:", pointErr);
      }
    } catch (e) {
      console.error("Comment submit error:", e);
      alert(`댓글 작성 중 오류가 발생했습니다: ${e.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (e) {
      alert("댓글 삭제 실패");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '방금 전';
    let date = (timestamp instanceof Timestamp) ? timestamp.toDate() : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    if (isNaN(date.getTime())) return '일정 확인 중'; // 날짜 형식이 잘못된 경우 대비
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleSubmitTalk = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("토론 제안을 위해 로그인이 필요합니다.");
      handleGoogleLogin();
      return;
    }
    if (!newTalkTitle.trim()) return;

    setIsSubmittingTalk(true);
    try {
      await addDoc(collection(db, 'discussions'), {
        title: newTalkTitle,
        category: newTalkCategory,
        author: user.displayName || '익명 주민',
        uid: user.uid,
        date: new Date().toISOString().split('T')[0],
        participants: 1,
        status: '진행중',
        timestamp: serverTimestamp()
      });
      setNewTalkTitle('');
      setShowTalkModal(false);
      alert("새로운 토론 주제가 제안되었습니다! 마을 사람들의 참여를 기다려보세요.");
    } catch (e) {
      alert("토론 제안 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingTalk(false);
    }
  };

  const getPostCountForSDG = (goalNum) => {
    return [...posts, ...fallbackPosts].filter(p => 
      p.category === `SDG ${goalNum}` || 
      (p.content && (
        p.content.toLowerCase().includes(`sdg ${goalNum}`) || 
        p.content.toLowerCase().includes(`sdg${goalNum}`) ||
        (sdgGoals[goalNum-1] && p.content.includes(sdgGoals[goalNum-1].nameKo))
      ))
    ).length;
  };

  const rawPosts = [...posts, ...fallbackPosts];
  const displayedPosts = feedFilter 
    ? rawPosts.filter(p => p.category === feedFilter || (p.content && p.content.includes(feedFilter)))
    : rawPosts;
  const isAdmin = user && user.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-[#f0f2f5] pt-24 pb-20 saemaul-font antialiased">
      <div className="container mx-auto px-4 max-w-[1300px]">
        
        {/* Sticky style Sub-Header */}
        <div className="mb-6 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-black/5 shadow-sm">
          <div className="flex items-center gap-2 text-[#00843D] font-black text-lg tracking-tight cursor-pointer">
             <div className="w-8 h-8 rounded-full bg-[#00843D] text-[#FFCD00] flex items-center justify-center shadow font-bold">🌱</div>
             <span>새마을 마을회관</span>
          </div>
          <div className="hidden md:flex items-center bg-[#e4e6eb] px-3.5 py-1.5 rounded-full gap-2 w-72">
             <Search size={15} className="text-[#65676b]" />
             <input 
               type="text" 
               placeholder="SDGs 및 글로벌 이슈 검색" 
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 if (e.target.value && activeTab !== 'travel') {
                   setActiveTab('travel');
                 }
               }}
               className="bg-transparent border-none outline-none text-xs font-medium text-[#1c1e21] w-full placeholder:text-[#65676b]" 
             />
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
          
          {/* 1. LEFT SIDEBAR */}
          <aside className="flex flex-col gap-5">
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible py-2 lg:py-0 gap-2 lg:gap-1.5 scrollbar-none sticky top-24 z-10 bg-[#f0f2f5] lg:bg-transparent">
              {[
                { id: 'feed', label: '홈', icon: '🏠' },
                { id: 'board', label: '프로젝트 게시판', icon: '📋' },
                { id: 'travel', label: '새마을 여행지', icon: '🗺️' },
                { id: 'talk', label: '협동 토론방', icon: '💬' },
                { id: 'mypage', label: '나의 활동', icon: '👤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap flex-shrink-0 lg:flex-shrink ${
                    activeTab === tab.id 
                      ? 'bg-[#00843d]/10 text-[#00843D] shadow-sm border border-[#00843d]/5' 
                      : 'bg-white lg:bg-transparent hover:bg-black/5 text-[#1c1e21]'
                  }`}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* 주민 명부 & 구판장 버튼 */}
            <div className="flex flex-col gap-2 mt-1 bg-white rounded-2xl border border-black/5 p-4 shadow-sm">
              <button 
                onClick={() => setIsUserListOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-[#00843D]/5 border border-slate-100 text-[#1c1e21] hover:text-[#00843D] transition-all font-black text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>새마을 주민 명부</span>
                </div>
                <ArrowRight size={12} />
              </button>
              <button 
                onClick={() => setIsGupanjangOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-[#00843D]/5 border border-slate-100 text-[#1c1e21] hover:text-[#00843D] transition-all font-black text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🏪</span>
                  <span>새마을 구판장</span>
                </div>
                <ArrowRight size={12} />
              </button>
            </div>


          </aside>

          {/* 2. MAIN CENTER SECTION */}
          <main className="flex flex-col gap-5">
            
            {activeTab === 'feed' && (
              <>
                {/* SDG Feed Filter Chip */}
                {feedFilter && (
                  <div className="bg-white border border-[#00843d]/10 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fadeIn">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1c1e21]">
                      <span className="text-[#00843D]">🔍 SDG 필터 적용중:</span>
                      <span className="bg-[#00843d]/10 text-[#00843D] px-3 py-1 rounded-full text-xs font-black">
                        {feedFilter} {sdgGoals.find(g => `SDG ${g.num}` === feedFilter)?.nameKo}
                      </span>
                    </div>
                    <button 
                      onClick={() => setFeedFilter(null)} 
                      className="text-xs font-black text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-lg px-2.5 py-1 transition-colors"
                    >
                      필터 해제 ✖
                    </button>
                  </div>
                )}

                {/* TOP Attendance Card with Admin Options */}
                <div className="bg-white border border-[#00843d]/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4">
                  <h3 className="font-bold text-[15px] text-[#00843D] flex items-center justify-between pb-2 border-b border-[#00843d]/5">
                    <span className="flex items-center gap-2">📝 오늘의 마을 출석부</span>
                    {isAdmin && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-black border border-red-100">관리자 모드</span>
                    )}
                  </h3>

                  {/* 출석 상태 표시 (버튼 대신) */}
                  <div className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                    hasCheckedIn 
                      ? 'bg-emerald-50 text-[#00843D] border border-emerald-100' 
                      : 'bg-[#f8f9fa] text-[#65676b] border border-[#e4e6eb]'
                  }`}>
                    <CheckCircle2 size={16} className={hasCheckedIn ? 'text-[#00843D]' : 'text-slate-300'} />
                    {hasCheckedIn ? '오늘 출석 완료! 오늘도 활기찬 마을 생활 하세요 🌱' : (user ? '오늘 출석이 자동으로 기록됩니다.' : '로그인하면 자동으로 출석이 기록됩니다.')}
                  </div>

                  {/* 관리자 전용: 주민 출석 대리 추가 폼 */}
                  {isAdmin && (
                    <form onSubmit={handleAdminAddAttendance} className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-red-700 shrink-0">
                         <UserPlus size={14} />
                         <span className="text-[11px] font-black">대리추가:</span>
                      </div>
                      <input 
                        type="text"
                        placeholder="이름 입력 (예: 홍길동)"
                        value={adminManualName}
                        onChange={(e) => setAdminManualName(e.target.value)}
                        className="flex-1 border border-red-200 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-red-400"
                      />
                      <button 
                        type="submit"
                        disabled={!adminManualName.trim() || isAdminAdding}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg px-3 py-1.5 text-[10px] font-black flex items-center gap-1 transition-all shadow-sm"
                      >
                        {isAdminAdding ? <Loader2 size={10} className="animate-spin" /> : <PlusCircle size={10} />}
                        등록
                      </button>
                    </form>
                  )}

                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {attendances.length > 0 ? (
                      attendances.map((att) => (
                        <div key={att.id} className="flex items-center gap-2.5 bg-[#f8f9fa] border border-black/5 rounded-lg p-2 text-[12px] group">
                          <img 
                            src={att.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(att.displayName || 'User')}&background=e2e8f0&color=475569`} 
                            className="w-6 h-6 rounded-full object-cover shadow-inner" alt="" 
                          />
                          <div className="flex-1 min-w-0 flex items-center justify-between pr-1">
                             <span className="font-bold text-[#1c1e21] truncate flex items-center gap-1">
                                {att.displayName}님이 출석했습니다.
                                {att.addedByAdmin && <span className="text-[8px] text-red-500 font-black border border-red-200 bg-white rounded px-1">Admin</span>}
                             </span>
                             <span className="text-[10px] font-bold text-[#65676b] whitespace-nowrap">{formatTime(att.timestamp)}</span>
                          </div>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteAttendance(att.id)} 
                              className="text-slate-300 hover:text-red-500 p-1 rounded-full transition-colors ml-1"
                              title="출석 기록 삭제"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2.5 bg-[#f8f9fa] rounded-lg p-3 text-center">
                        <span className="text-[12px] font-bold text-[#65676b] w-full">오늘 출석한 주민이 없습니다.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Write Widget */}
                <div className="bg-white rounded-2xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5">
                  {!user ? (
                    <div className="flex flex-col gap-3">
                      {/* 비로그인: 클릭 가능한 가짜 입력창 */}
                      <div
                        onClick={handleGoogleLogin}
                        className="flex items-center gap-3 p-3 bg-[#f0f2f5] hover:bg-[#e4e6eb] rounded-2xl border border-[#e4e6eb] hover:border-[#00843d]/30 cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5 shrink-0">
                          <Lock size={15} className="text-[#65676b] group-hover:text-[#00843D] transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-bold text-[#65676b] group-hover:text-[#1c1e21] transition-colors">
                            오늘의 글로벌 이슈나 사업 현황을 공유해주세요.
                          </p>
                          <p className="text-[11px] text-[#00843D] font-bold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            🔒 Google 로그인 후 글쓰기 가능 — 클릭하여 로그인
                          </p>
                        </div>
                        <span className="text-[11px] font-black text-white bg-[#00843D] px-3 py-1.5 rounded-full shadow-sm shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          로그인
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <img src={user.photoURL || 'https://ui-avatars.com/api/?name=User'} alt="" className="w-10 h-10 rounded-full border-2 border-[#00843D] object-cover shadow-sm" />
                      {!isWriting ? (
                        <button 
                          onClick={() => setIsWriting(true)}
                          className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6eb] rounded-full px-5 text-left text-[13.5px] text-[#65676b] font-bold transition-colors h-10 border border-black/5 shadow-inner"
                        >
                          오늘의 글로벌 이슈나 사업 현황을 공유해주세요.
                        </button>
                      ) : (
                        <form onSubmit={handleSubmitPost} className="flex-1 flex flex-col gap-3 animate-fadeIn">
                          <textarea
                            autoFocus
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="지금 일어나는 마을의 혁신적인 변화나 SDGs 소식을 적어주세요..."
                            className="w-full bg-[#f0f2f5] border border-[#e4e6eb] focus:border-[#00843D] outline-none rounded-xl p-4 text-[13.5px] font-bold resize-none h-28 transition-all text-[#1c1e21]"
                          />
                          {isCompressing && (
                            <div className="flex items-center justify-center py-3 bg-[#f8f9fa] border border-[#e4e6eb] rounded-xl text-[#00843D] gap-2 font-extrabold text-[11px] animate-pulse">
                              <Loader2 className="animate-spin" size={14} /><span>사진 압축 중...</span>
                            </div>
                          )}
                          {attachedImage && !isCompressing && (
                            <div className="relative max-h-48 rounded-xl overflow-hidden border border-[#e4e6eb] bg-black/5">
                              <img src={attachedImage} alt="Preview" className="w-full h-full object-contain" />
                              <button type="button" onClick={() => setAttachedImage(null)} className="absolute top-2 right-2 text-white bg-black/50 hover:bg-red-500 rounded-full p-1 shadow-md transition-colors"><XCircle size={16} /></button>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f9fa] p-2.5 rounded-xl border border-[#e4e6eb]">
                            <div className="flex flex-wrap items-center gap-2">
                              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelection} />
                              <button type="button" onClick={() => fileInputRef.current?.click()} title="사진 첨부" className="bg-white border border-[#e4e6eb] rounded-lg p-2 text-[#65676b] hover:text-[#00843D] hover:border-[#00843D]/30 transition-all shadow-sm"><Camera size={15} /></button>
                              <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-white border border-[#e4e6eb] text-[11px] font-black rounded-lg py-1.5 px-2 outline-none text-[#65676b] cursor-pointer h-[33px] max-w-[120px]"
                              >
                                <option value="일반">일반</option>
                                {sdgGoals.map(g => (
                                  <option key={g.num} value={`SDG ${g.num}`}>{`SDG ${g.num} (${g.nameKo})`}</option>
                                ))}
                                <option value="관광">관광</option>
                              </select>
                              <div className="flex items-center bg-white border border-[#e4e6eb] rounded-lg px-2 text-[#65676b] h-[33px]">
                                <MapPin size={12} /><input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="위치" className="outline-none border-none text-[10px] font-bold w-16 pl-1 bg-transparent" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <button type="button" onClick={() => { setIsWriting(false); setPostText(''); setAttachedImage(null); }} className="text-[#65676b] hover:text-[#1c1e21] font-extrabold text-[11px] px-3 py-1.5">취소</button>
                              <button type="submit" disabled={!postText.trim() || isCompressing} className="bg-[#00843D] disabled:bg-[#e4e6eb] disabled:text-[#65676b] text-white text-[11px] font-black px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all h-[31px]"><Send size={10} />발행하기</button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* FEEDS CONTAINER */}
                <div className="flex flex-col gap-5">
                  {displayedPosts.map((post) => {
                    const canDelete = user && !post.id.startsWith('mock') && (user.uid === post.uid || isAdmin);
                    const isCurrentlyTranslating = !!isTranslatingMap[post.id];
                    const selectedLang = postTargetLang[post.id] || 'device';
                    
                    return (
                      <article key={post.id} className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-black/5 overflow-hidden post-hover-effect transform transition-all ease-out group/post">
                        <div className="p-4 pb-3 flex items-center justify-between">
                          <div 
                            className={`flex items-center gap-3.5 flex-1 min-w-0 ${
                              post.uid && !post.id.startsWith('mock') ? 'cursor-pointer hover:opacity-85' : ''
                            }`}
                            onClick={() => {
                              if (post.uid && !post.id.startsWith('mock')) {
                                handleSelectUser(post.uid);
                              }
                            }}
                          >
                            {getAvatarMarkup(post.displayName, post.photoURL)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-[13.5px] text-[#1c1e21] leading-tight flex items-center gap-1 truncate">
                                  {post.displayName}
                                  {post.email === ADMIN_EMAIL && <span className="text-[8px] bg-red-50 text-red-600 px-1 rounded border border-red-100 font-black">관리자</span>}
                                </h4>
                              </div>
                              <div className="text-[11px] text-[#65676b] font-bold mt-0.5 flex items-center gap-1.5 truncate">
                                <span>{formatTime(post.timestamp)}</span><span>·</span><span>{post.location || '공동체 지구'}</span>{post.category && post.category !== '일반' && (<><span>·</span><span className="text-[#00843D]">{post.category}</span></>)}
                              </div>
                            </div>
                          </div>
                          {canDelete && (<button onClick={() => handleDeletePost(post.id)} className="text-[#65676b]/50 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-colors"><Trash2 size={14} /></button>)}
                        </div>

                        {/* Text Block */}
                        <div className="px-4 pb-3 text-[13.5px] font-medium leading-relaxed text-[#1c1e21] whitespace-pre-wrap break-words select-text">
                          {post.content}
                          
                          {/* AI SMART TRANSLATION BOX: Dynamic Insertion below content */}
                          {translatedTexts[post.id] && (
                            <div className="mt-3 p-3.5 bg-emerald-50/40 border-l-4 border-[#00843D] rounded-r-xl text-[12.5px] font-semibold text-slate-800 shadow-sm border border-black/5 animate-fadeIn">
                               <div className="text-[10px] text-[#00843D] font-black tracking-tight mb-1.5 flex items-center gap-1">
                                  <Sparkles size={11} className="animate-pulse" />
                                  AI 스마트 번역 결과:
                               </div>
                               <div className="whitespace-pre-wrap leading-relaxed">{translatedTexts[post.id]}</div>
                            </div>
                          )}
                        </div>

                        {/* Image Attachment */}
                        {post.image && (<div className="w-full border-y border-[#f0f2f5] bg-[#f8f9fa] overflow-hidden flex justify-center max-h-[480px]"><img src={post.image} alt="Post media" className="w-full h-auto object-cover block" /></div>)}
                        
                        <div className="px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#f0f2f5] text-[12.5px] font-bold text-[#65676b]">
                          <div className="flex items-center gap-5 shrink-0">
                            <button 
                              onClick={() => !post.id.startsWith('mock') && handleLikePost(post.id)} 
                              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${post.id.startsWith('mock') ? 'cursor-default opacity-80' : ''} ${userLikedPosts.has(post.id) ? 'text-red-500' : ''}`}
                            >
                              <Heart size={14} className={userLikedPosts.has(post.id) ? "fill-red-500 text-red-500" : ""} />
                              <span>{post.likes || 0}</span>
                            </button>
                            <button 
                              onClick={() => handleToggleComments(post.id)}
                              className={`flex items-center gap-1.5 hover:text-[#00843D] transition-colors ${expandedComments[post.id] ? 'text-[#00843D]' : ''}`}
                            >
                              <MessageCircle size={14} className={expandedComments[post.id] ? "fill-[#00843D]/10" : ""} />
                              <span>{commentsMap[post.id]?.length || 0}</span>
                            </button>
                            <button onClick={() => handleShare(post.id)} className="flex items-center gap-1 hover:text-[#00843D] transition-colors"><Share2 size={13} /><span className="text-[11px]">{copiedId === post.id ? '복사됨!' : '공유'}</span></button>
                          </div>

                          {/* 🔥 SMART TRANSLATION UI (Bottom Right Alignment) */}
                          <div className="ml-auto flex items-center gap-1.5 bg-[#f8f9fa] border border-[#e4e6eb] rounded-xl px-2 py-1 shrink-0 group-hover/post:border-[#00843D]/30 transition-colors">
                             <Languages size={13} className={`${isCurrentlyTranslating ? 'animate-spin text-[#00843D]' : 'text-[#65676b]'}`} />
                             
                             <select
                               value={selectedLang}
                               onChange={(e) => handleTargetLanguageChange(post.id, e.target.value)}
                               className="bg-transparent border-none outline-none text-[10.5px] font-extrabold text-[#65676b] cursor-pointer max-w-[110px] text-ellipsis overflow-hidden focus:text-[#00843D]"
                             >
                               {SUPPORTED_LANGUAGES.map((l) => (
                                 <option key={l.code} value={l.code}>{l.name}</option>
                               ))}
                             </select>

                             <button
                               disabled={isCurrentlyTranslating}
                               onClick={() => handleTranslatePost(post.id, post.content)}
                               className="bg-white hover:bg-[#00843D] hover:text-white disabled:bg-slate-100 text-[#00843D] text-[10px] font-black px-2 py-1 rounded-lg shadow-sm border border-slate-200 hover:border-[#00843D] active:scale-95 transition-all flex items-center gap-1 shrink-0"
                             >
                               {isCurrentlyTranslating ? (
                                  <>
                                    <Loader2 size={10} className="animate-spin" /> 번역중..
                                  </>
                               ) : (
                                  <>번역하기</>
                               )}
                             </button>
                          </div>
                        </div>

                        {/* Comments Section */}
                        {expandedComments[post.id] && (
                          <div className="px-4 pb-4 border-t border-[#f0f2f5] bg-[#f8f9fa]/50 animate-fadeIn">
                            <div className="flex flex-col gap-3 pt-3">
                              {/* Comment List */}
                              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                                {commentsMap[post.id]?.map((comment) => (
                                  <div key={comment.id} className="flex gap-2.5 group/comment">
                                    <img 
                                      src={comment.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.displayName || 'User')}`} 
                                      className={`w-7 h-7 rounded-full object-cover shrink-0 shadow-sm border border-black/5 ${
                                        comment.uid ? 'cursor-pointer hover:opacity-80' : ''
                                      }`} 
                                      alt="" 
                                      onClick={() => {
                                        if (comment.uid) {
                                          handleSelectUser(comment.uid);
                                        }
                                      }}
                                    />
                                    <div className="flex-1">
                                      <div className="bg-white border border-black/5 rounded-2xl px-3 py-2 shadow-sm relative">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                          <span 
                                            className={`font-bold text-[11.5px] text-[#1c1e21] ${
                                              comment.uid ? 'cursor-pointer hover:underline hover:text-saemaul-green' : ''
                                            }`}
                                            onClick={() => {
                                              if (comment.uid) {
                                                handleSelectUser(comment.uid);
                                              }
                                            }}
                                          >
                                            {comment.displayName}
                                          </span>
                                          <span className="text-[9px] font-bold text-[#65676b]">{formatTime(comment.timestamp)}</span>
                                        </div>
                                        <p className="text-[12px] font-medium text-[#1c1e21] leading-relaxed break-words">{comment.content}</p>
                                        
                                        {(user && (user.uid === comment.uid || isAdmin)) && (
                                          <button 
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="absolute -right-2 -top-2 opacity-0 group-hover/comment:opacity-100 bg-white border border-black/5 rounded-full p-1 text-[#65676b] hover:text-red-500 transition-all shadow-sm"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {(!commentsMap[post.id] || commentsMap[post.id].length === 0) && (
                                  <p className="text-center py-4 text-[11.5px] font-bold text-[#65676b]">첫 번째 댓글을 남겨보세요!</p>
                                )}
                              </div>

                              {/* Comment Input */}
                              {user ? (
                                <form onSubmit={(e) => handleSubmitComment(e, post.id)} className="flex items-center gap-2 mt-1">
                                  <img src={user.photoURL || 'https://ui-avatars.com/api/?name=User'} alt="" className="w-7 h-7 rounded-full border border-[#00843D]/20" />
                                  <div className="flex-1 relative">
                                    <input 
                                      type="text"
                                      value={commentTexts[post.id] || ''}
                                      onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      placeholder="댓글을 입력하세요..."
                                      className="w-full bg-white border border-[#e4e6eb] focus:border-[#00843D] outline-none rounded-full px-4 py-1.5 text-[12px] font-bold pr-10 transition-all"
                                    />
                                    <button 
                                      type="submit"
                                      disabled={!commentTexts[post.id]?.trim() || isSubmittingComment}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00843D] disabled:text-[#65676b] transition-colors"
                                    >
                                      {isSubmittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="text-center py-2 bg-white border border-dashed border-[#e4e6eb] rounded-xl">
                                  <button onClick={handleGoogleLogin} className="text-[11px] font-black text-[#00843D] hover:underline">로그인하고 댓글을 남겨보세요!</button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {/* MY PAGE TAB VIEW */}
            {activeTab === 'mypage' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1 pb-1 border-b border-[#e4e6eb]">
                  <h2 className="text-2xl font-black text-[#1c1e21] tracking-tight flex items-center gap-2">👤 나의 활동 기록 (My Page)</h2>
                  <p className="text-[#65676b] text-[12px] font-bold">내가 마을 공동체에서 쌓아온 출석 현황과 발행한 글 목록을 모아봅니다.</p>
                </div>
                {!user ? (
                  <div className="bg-white border border-black/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-10 text-center flex flex-col items-center justify-center gap-4">
                     <div className="w-14 h-14 rounded-full bg-slate-50 border border-dashed flex items-center justify-center text-slate-400 shadow-inner"><Lock size={24} /></div>
                     <h3 className="font-bold text-slate-800 text-base">로그인이 필요합니다.</h3>
                     <button onClick={handleGoogleLogin} className="bg-[#00843D] text-white font-black text-xs py-2.5 px-6 rounded-full hover:bg-[#006b31] transition-all">로그인 / 회원가입</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                       <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00843D]/30 rounded-full blur-2xl" />
                       <img src={user.photoURL || 'https://ui-avatars.com/api/?name=User'} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-white/10 object-cover shrink-0 z-10 shadow-md" />
                       <div className="flex-1 text-center md:text-left z-10">
                          <div className="flex flex-col md:flex-row items-center gap-2">
                             <h3 className="text-xl font-black tracking-tight">{user.displayName}님</h3>
                             {isAdmin && <span className="text-[9px] font-black uppercase bg-red-500 px-2 py-0.5 rounded border border-red-400">총관리자</span>}
                          </div>
                          <p className="text-[12px] text-slate-400 font-bold mt-1 truncate">{user.email}</p>
                           <button 
                             onClick={() => setIsGupanjangOpen(true)} 
                             className="mt-3 px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-md inline-flex border border-emerald-500/20"
                           >
                             🏪 새마을 구판장 가기
                           </button>
                       </div>
                       <div className="flex items-center gap-4 z-10 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0">
                          <div className="text-center"><div className="text-2xl font-black text-[#FFCD00]">{myAttendances.length}회</div><div className="text-[10px] font-black text-slate-400 uppercase">총 출석</div></div>
                          <div className="w-px h-8 bg-white/10 mx-2" />
                          <div className="text-center"><div className="text-2xl font-black text-[#FFCD00]">{myPosts.length}건</div><div className="text-[10px] font-black text-slate-400 uppercase">작성 글</div></div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-white rounded-2xl border border-black/5 shadow-md p-5 flex flex-col gap-4">
                          <h4 className="font-bold text-[14px] text-[#1c1e21] pb-2 border-b border-[#f0f2f5] flex items-center gap-2"><Calendar size={16} className="text-[#00843D]" />나의 출석 타임라인</h4>
                          <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-1">
                             {myAttendances.length > 0 ? (myAttendances.map((att) => (
                                   <div key={att.id} className="flex items-center justify-between bg-[#f8f9fa] border border-black/5 rounded-xl p-3.5 text-[12.5px] hover:bg-[#f0f2f5]/50 transition-colors">
                                      <div className="flex items-center gap-2.5">
                                         <div className="w-7 h-7 rounded-full bg-[#00843D]/10 flex items-center justify-center text-[#00843D] shadow-inner"><CheckCircle2 size={14} /></div>
                                         <div><span className="font-bold text-[#1c1e21] block leading-none mb-1">마을 출석체크</span><span className="text-[10px] text-[#65676b] font-bold">{att.dateString}</span></div>
                                      </div>
                                      <span className="text-[11px] font-extrabold text-[#00843D] bg-[#00843D]/5 px-2 py-1 rounded-lg">{formatTime(att.timestamp)}</span>
                                   </div>
                                ))) : (<div className="py-8 text-center text-slate-400 font-bold text-[12px] border border-dashed rounded-xl">기록 없음</div>)}
                          </div>
                       </div>
                       <div className="bg-white rounded-2xl border border-black/5 shadow-md p-5 flex flex-col gap-4">
                          <h4 className="font-bold text-[14px] text-[#1c1e21] pb-2 border-b border-[#f0f2f5] flex items-center gap-2"><Briefcase size={16} className="text-[#00843D]" />내가 작성한 소식</h4>
                          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[360px] pr-1">
                             {myPosts.length > 0 ? (myPosts.map((post) => (
                                   <div key={post.id} className="bg-[#f8f9fa] border border-black/5 rounded-xl p-3.5 hover:bg-[#f0f2f5]/50 transition-all flex flex-col gap-2 relative group">
                                      <div className="flex items-center justify-between"><span className="text-[10px] bg-[#00843D]/10 text-[#00843D] px-2 py-0.5 rounded-full font-extrabold">{post.category || '일반'}</span><span className="text-[10px] font-bold text-[#65676b]">{formatTime(post.timestamp)}</span></div>
                                      <p className="text-[12.5px] font-medium text-[#1c1e21] leading-relaxed line-clamp-2 whitespace-pre-wrap">{post.content}</p>
                                      <div className="flex items-center justify-between border-t border-[#e4e6eb]/50 pt-2 mt-1"><span className="text-[10px] font-bold text-[#65676b] flex items-center gap-1"><Heart size={10} /> {post.likes || 0}개</span><button onClick={() => handleDeletePost(post.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button></div>
                                   </div>
                                ))) : (<div className="py-8 text-center text-slate-400 font-bold text-[12px] border border-dashed rounded-xl">소식 없음</div>)}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BOARD TAB — SDG 1~17 프로젝트 게시판 */}
            {activeTab === 'board' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1 pb-1 border-b border-[#e4e6eb]">
                  <h2 className="text-2xl font-black text-[#1c1e21] tracking-tight flex items-center gap-2">📋 프로젝트 게시판</h2>
                  <p className="text-[#65676b] text-[12px] font-bold">SDG 1~17 목표별 새마을 연계 프로젝트와 활동을 확인하세요.</p>
                </div>
                <div className="flex flex-col gap-2">
                  {sdgGoals.map((goal) => (
                    <div key={goal.num} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setSelectedSDGGoal(selectedSDGGoal?.num === goal.num ? null : goal)}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#f7f8fa] transition-colors"
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0"
                          style={{ backgroundColor: goal.color }}
                        >
                          {goal.num}
                        </span>
                        <span className="text-base">{goal.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-black text-[14px] text-[#1c1e21] block leading-tight">{goal.nameKo}</span>
                          <span className="text-[10px] text-[#65676b] font-bold truncate block">{goal.nameEn}</span>
                        </div>
                        <span className={`text-[10px] font-black transition-transform duration-200 ${selectedSDGGoal?.num === goal.num ? 'rotate-90' : ''}`} style={{ color: goal.color }}>▶</span>
                      </button>
                      {selectedSDGGoal?.num === goal.num && (
                        <div className="px-5 pb-5 flex flex-col gap-3 border-t border-[#f0f2f5]" style={{ borderLeftColor: goal.color, borderLeftWidth: '4px' }}>
                          <p className="text-[12.5px] text-[#65676b] font-semibold leading-relaxed pt-3">{goal.desc}</p>
                          <div className="flex flex-col gap-1.5">
                            {goal.targets.map((target, ti) => (
                              <div key={ti} className="flex items-start gap-2 text-[12px] font-bold text-[#1c1e21]">
                                <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0" style={{ backgroundColor: goal.color }}>{ti + 1}</span>
                                <span className="leading-snug">{target}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => { setFeedFilter(goal.num); setActiveTab('feed'); }}
                            className="mt-1 self-start flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: goal.color }}
                          >
                            <MessageSquare size={11} /> 관련 게시물 보기
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRAVEL TAB */}
            {activeTab === 'travel' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1 pb-1 border-b border-[#e4e6eb] relative">
                  <div>
                    <h2 className="text-2xl font-black text-[#1c1e21] tracking-tight flex items-center gap-2">🗺️ 새마을 여행지</h2>
                    <p className="text-[#65676b] text-[12px] font-bold">역사적인 의미가 가득한 명소 및 레트로 성지 리스트.</p>
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-0 bottom-1 text-xs font-black text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      검색 초기화 ✖
                    </button>
                  )}
                </div>

                {searchQuery && (
                  <div className="text-[12.5px] font-bold text-[#1c1e21] bg-white border border-[#e4e6eb] p-3 rounded-xl shadow-sm">
                    🔍 &quot;<span className="text-[#00843D]">{searchQuery}</span>&quot; 검색 결과입니다. (총 {filteredDestinations.length}건)
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredDestinations.map(dest => {
                    const isBookmarked = bookmarkedDestinations.has(dest.id);
                    return (
                      <div key={dest.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-black/5 hover:translate-y-[-4px] transition-all flex flex-col group h-full">
                        <div className="h-44 overflow-hidden relative bg-[#eee] shrink-0">
                          <img src={dest.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                          <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-black px-3 py-1 rounded-full">{dest.region} · {dest.tag}</span>
                          <button 
                            onClick={() => toggleBookmark(dest.id)}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-black/5 p-2 rounded-full shadow hover:bg-white text-[#65676b] hover:text-[#00843D] transition-colors"
                            title={isBookmarked ? "저장 취소" : "여행지 저장"}
                          >
                            <Bookmark size={14} className={isBookmarked ? "fill-[#00843D] text-[#00843D]" : ""} />
                          </button>
                        </div>
                        <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                          <div>
                            <h3 className="text-base font-bold text-[#1c1e21] group-hover:text-[#00843D] transition-colors">{dest.title}</h3>
                            <p className="text-[12px] text-[#65676b] leading-relaxed font-semibold mt-1 line-clamp-3">{dest.desc}</p>
                          </div>
                          <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#f0f2f5]">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#65676b]">
                              <Heart size={12} className="text-red-400 fill-red-400" />
                              <span>{dest.likes}명</span>
                            </div>
                            <button 
                              onClick={() => {
                                if (dest.officialUrl) {
                                  window.open(dest.officialUrl, '_blank');
                                } else {
                                  alert("공식 홈페이지가 제공되지 않는 명소입니다.");
                                }
                              }}
                              className="flex items-center gap-1 text-xs font-black text-[#00843D] hover:underline"
                            >
                              <span>공식 홈페이지</span> <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredDestinations.length === 0 && (
                    <div className="col-span-full py-16 bg-white border border-dashed rounded-2xl text-center flex flex-col items-center gap-2">
                      <span className="text-2xl">🔍</span>
                      <p className="font-bold text-[#1c1e21] text-sm">&quot;{searchQuery}&quot;에 매칭되는 여행지가 없습니다.</p>
                      <button onClick={() => setSearchQuery('')} className="text-xs font-black text-[#00843D] hover:underline mt-2">전체 명소 보기</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TALK TAB */}
            {activeTab === 'talk' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1 pb-1 border-b border-[#e4e6eb]">
                  <h2 className="text-2xl font-black text-[#1c1e21] tracking-tight flex items-center gap-2">💬 협동 토론방</h2>
                  <p className="text-[#65676b] text-[12px] font-bold">마을 주민들과 실시간으로 소통하며 공동체 문제를 함께 논의하세요.</p>
                </div>

                {/* ── 과거 날짜 아카이브 ── */}
                {isArchiving && (
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#65676b] bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <Loader2 size={14} className="animate-spin text-amber-500" />
                    어제 대화를 아카이브하고 AI 요약을 생성하는 중...
                  </div>
                )}

                {chatArchives.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-black text-[#65676b] uppercase tracking-wider px-1">📁 지난 토론 기록</div>
                    {chatArchives.map((archive) => {
                      const isOpen = expandedArchives[archive.id];
                      return (
                        <div key={archive.id} className="bg-white rounded-2xl border border-[#e4e6eb] shadow-sm overflow-hidden">
                          <button
                            onClick={() => setExpandedArchives(prev => ({ ...prev, [archive.id]: !prev[archive.id] }))}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#f7f8fa] transition-colors"
                          >
                            <span className="text-base">📅</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-black text-[13px] text-[#1c1e21]">{archive.label}</span>
                              <span className="text-[10px] text-[#65676b] font-bold block">{archive.messageCount}개 메시지</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteArchive(archive.id);
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 flex items-center justify-center"
                                  title="아카이브 삭제"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                              <span className={`text-[10px] font-black text-[#00843D] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                            </div>
                          </button>
                          {isOpen && (
                            <div className="border-t border-[#f0f2f5]">
                              {/* AI 요약 */}
                              <div className="mx-4 mt-4 mb-3 bg-gradient-to-r from-[#00843D]/5 to-emerald-50 border border-[#00843D]/15 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm">🤖</span>
                                  <span className="text-[10px] font-black text-[#00843D] uppercase tracking-wider">AI 토론 요약</span>
                                </div>
                                <p className="text-[12.5px] text-[#1c1e21] font-semibold leading-relaxed">{archive.summary}</p>
                              </div>
                              {/* 메시지 목록 */}
                              <div className="flex flex-col gap-2 bg-[#f7f8fa] mx-4 mb-4 rounded-xl p-3 max-h-[240px] overflow-y-auto">
                                {(archive.messages || []).map((msg, idx) => (
                                  <div key={idx} className="flex gap-2 items-start group relative">
                                    <div className="w-6 h-6 rounded-full bg-[#00843D]/10 flex items-center justify-center text-[10px] font-black text-[#00843D] shrink-0">
                                      {msg.photoURL ? <img src={msg.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : (msg.displayName?.[0] || '?')}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="text-[10px] font-black text-[#65676b]">{msg.displayName}</span>
                                        <span className="text-[9px] text-[#bcc0c4]">{msg.time}</span>
                                      </div>
                                      <p className="text-[12px] font-medium text-[#1c1e21] break-words leading-snug">{msg.text}</p>
                                    </div>
                                    {isAdmin && (
                                      <button
                                        onClick={() => handleDeleteArchivedMessage(archive.id, idx)}
                                        className="absolute right-1 top-1 hidden group-hover:flex w-4 h-4 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full items-center justify-center text-[8px] transition-colors shadow-sm"
                                        title="메시지 삭제"
                                      >✕</button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── 오늘의 실시간 채팅방 ── */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#e4e6eb]">
                    <span className="text-base">🟢</span>
                    <h3 className="text-base font-black text-[#1c1e21]">오늘의 실시간 채팅</h3>
                    <span className="text-[10px] bg-emerald-100 text-[#00843D] px-2 py-0.5 rounded-full font-black ml-auto">LIVE</span>
                  </div>
                  <div
                    className="flex flex-col gap-2 bg-[#f7f8fa] rounded-2xl border border-[#e4e6eb] p-4 overflow-y-auto"
                    style={{ height: '340px' }}
                  >
                    {liveChatMessages.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-[#65676b] text-[12px] font-bold gap-2 py-10">
                        <span className="text-3xl">💬</span>
                        <p>첫 번째 메시지를 남겨보세요!</p>
                      </div>
                    )}
                    {liveChatMessages.map((msg) => {
                      const isMe = user && msg.uid === user.uid;
                      return (
                        <div key={msg.id} className={`flex gap-2 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-[#00843D]/10 flex items-center justify-center text-[11px] font-black text-[#00843D]">
                              {msg.photoURL ? <img src={msg.photoURL} alt="" className="w-full h-full object-cover" /> : (msg.displayName?.[0] || '?')}
                            </div>
                          )}
                          <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && <span className="text-[10px] font-black text-[#65676b] px-1">{msg.displayName}</span>}
                            <div className={`relative group px-3 py-2 rounded-2xl text-[13px] font-medium leading-snug break-words shadow-sm ${
                              isMe ? 'bg-[#00843D] text-white rounded-tr-sm' : 'bg-white text-[#1c1e21] border border-[#e4e6eb] rounded-tl-sm'
                            }`}>
                              {msg.text}
                              {(isMe || isAdmin) && (
                                <button
                                  onClick={() => handleDeleteLiveChat(msg.id)}
                                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center text-[9px] shadow"
                                  title="삭제"
                                >✕</button>
                              )}
                            </div>
                            <span className="text-[9px] text-[#bcc0c4] px-1">
                              {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>
                  {user ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={liveChatInput}
                        onChange={(e) => setLiveChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendLiveChat(); } }}
                        placeholder="마을 주민들과 실시간으로 이야기하세요..."
                        maxLength={300}
                        className="flex-1 border border-[#e4e6eb] rounded-xl px-4 py-2.5 text-[13px] font-medium bg-white focus:outline-none focus:border-[#00843D] transition-colors"
                      />
                      <button
                        onClick={handleSendLiveChat}
                        disabled={!liveChatInput.trim() || isSendingChat}
                        className="bg-[#00843D] disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-black text-[12px] transition-all hover:bg-[#006b31] flex items-center gap-1.5 shrink-0"
                      >
                        <Send size={14} /> 전송
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full py-3 rounded-xl bg-[#00843D]/10 text-[#00843D] font-black text-[13px] hover:bg-[#00843D]/20 transition-colors border border-[#00843D]/20"
                    >
                      🔒 로그인하고 채팅 참여하기
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* 3. RIGHT SIDEBAR */}
          <aside className="hidden lg:flex flex-col gap-5">


            <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 text-[#1c1e21] mb-3 pb-2 border-b border-[#f0f2f5]">
                 <Sparkles size={14} className="text-[#00843D]" /><span className="text-[12px] font-extrabold tracking-tight">마을 수칙</span>
              </div>
              <ul className="space-y-2 text-[11.5px] font-bold text-[#65676b] leading-relaxed">
                <li className="flex gap-1.5"><span className="text-[#00843D]">•</span> 상호 비방과 혐오 표현 금지</li>
                <li className="flex gap-1.5"><span className="text-[#00843D]">•</span> 거짓 정보 전파 방지 및 출처 표기</li>
                <li className="flex gap-1.5"><span className="text-[#00843D]">•</span> 스마트 빌리지와 SDGs 발전을 위한 상호협동</li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* SDGs DETAIL MODAL */}
      {selectedSDGGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
            <div className="px-6 py-5 flex items-center justify-between text-white" style={{ backgroundColor: selectedSDGGoal.color }}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedSDGGoal.emoji}</span>
                <div>
                  <h3 className="font-black text-[16px] leading-tight">SDG {selectedSDGGoal.num} - {selectedSDGGoal.nameKo}</h3>
                  <span className="text-[10px] opacity-90 font-extrabold">{selectedSDGGoal.nameEn}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSDGGoal(null)} 
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-wider mb-1.5">목표 설명</h4>
                <p className="text-[13.5px] font-bold text-slate-800 leading-relaxed">{selectedSDGGoal.desc}</p>
              </div>

              <div>
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-wider mb-2">세부 타겟 (Targets)</h4>
                <div className="flex flex-col gap-2.5 bg-slate-50 border border-black/5 rounded-2xl p-4 max-h-[220px] overflow-y-auto pr-1">
                  {selectedSDGGoal.targets.map((target, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[12.5px] font-bold text-slate-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: selectedSDGGoal.color }}>
                        {idx + 1}
                      </span>
                      <span>{target}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2 border-t border-[#f0f2f5] pt-4">
                <button
                  onClick={() => {
                    setFeedFilter(`SDG ${selectedSDGGoal.num}`);
                    setActiveTab('feed');
                    setSelectedSDGGoal(null);
                  }}
                  className="flex-1 text-white font-black text-[12px] py-3 rounded-xl transition-all shadow text-center hover:brightness-95 active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: selectedSDGGoal.color }}
                >
                  💬 관련 게시글 모아보기 ({getPostCountForSDG(selectedSDGGoal.num)}건)
                </button>
                <button
                  onClick={() => setSelectedSDGGoal(null)}
                  className="bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#65676b] font-black text-[12px] px-6 py-3 rounded-xl transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW TALK MODAL */}
      {showTalkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            <div className="bg-[#00843D] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-black text-lg">새 토론 주제 제안</h3>
              <button onClick={() => setShowTalkModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleSubmitTalk} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[#65676b] uppercase">토론 카테고리</label>
                <select 
                  value={newTalkCategory}
                  onChange={(e) => setNewTalkCategory(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e4e6eb] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00843D] transition-all"
                >
                  <option value="기술혁신">기술혁신 (스마트 팜 등)</option>
                  <option value="환경보호">환경보호 (기후행동)</option>
                  <option value="세대통합">세대통합 (청년 참여)</option>
                  <option value="교육복지">교육복지 (마을 인프라)</option>
                  <option value="기타">기타 공동체 안건</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[#65676b] uppercase">토론 제목</label>
                <input 
                  type="text"
                  placeholder="예: 우리 마을 쓰레기 처리장 개선 방안"
                  value={newTalkTitle}
                  onChange={(e) => setNewTalkTitle(e.target.value)}
                  className="bg-[#f8f9fa] border border-[#e4e6eb] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00843D] transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-[#65676b] font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-black/5">
                제안하신 주제는 마을 주민 전체가 볼 수 있으며, <br />
                함께 댓글로 의견을 나누고 투표를 진행할 수 있습니다.
              </p>
              <button 
                type="submit" 
                disabled={isSubmittingTalk || !newTalkTitle.trim()}
                className="w-full bg-[#00843D] text-white font-black py-4 rounded-2xl shadow-lg hover:bg-[#006b31] transition-all active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-2"
              >
                {isSubmittingTalk ? <Loader2 size={18} className="animate-spin" /> : "토론 제안하기"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODALS FOR COMMUNITY FEATURES */}
      <UserListModal 
        isOpen={isUserListOpen} 
        onClose={() => setIsUserListOpen(false)} 
        currentUser={user} 
        onSelectUser={handleSelectUserFromList} 
      />
      <UserProfileModal 
        isOpen={!!selectedUserUid} 
        onClose={() => setSelectedUserUid(null)} 
        targetUid={selectedUserUid} 
        currentUser={user} 
        currentUserData={currentUserData} 
        onChangeUser={setSelectedUserUid}
      />
      <GupanjangModal 
        isOpen={isGupanjangOpen} 
        onClose={() => setIsGupanjangOpen(false)} 
        currentUser={user} 
        currentUserData={currentUserData} 
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      {/* Attendance Success Celebration Modal */}
      {showAttendanceModal && attendanceResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-8 text-center animate-scaleUp">
            <div className="w-20 h-20 mx-auto bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
              <span className="text-4xl">☀️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">
              오늘도 부지런히! 출석 완료!
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
              근면, 자조, 협동의 정신으로 하루를 시작합니다.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">기본 출석 포인트</span>
                <span className="text-[#00843D] font-black font-mono">+{attendanceResult.pointsEarned} P</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2">
                <span className="text-slate-400 font-bold">연속 출석 기록</span>
                <span className="text-slate-700 font-black font-mono">{attendanceResult.consecutiveDays} 일 연속</span>
              </div>
            </div>
            {attendanceResult.unlockedTitles && attendanceResult.unlockedTitles.length > 0 && (
              <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-left flex items-start gap-2.5 animate-bounce">
                <span className="text-lg">🎉</span>
                <div>
                  <p className="text-indigo-600 font-black text-xs">신규 칭호 획득!</p>
                  <p className="text-indigo-700 font-bold text-xs mt-0.5">{attendanceResult.unlockedTitles.join(', ')}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowAttendanceModal(false)}
              className="w-full bg-[#00843D] hover:bg-[#006b31] text-white font-black py-3.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer text-sm"
            >
              마을로 입장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
