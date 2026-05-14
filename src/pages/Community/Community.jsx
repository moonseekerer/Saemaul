import React, { useState, useEffect, useRef } from 'react';
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
  Search
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

const ADMIN_EMAIL = 'anstlr6665@gmail.com';

// Mock Avatars with Original Colored backgrounds and Text Initial
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
  
  // Fallback letter avatar
  const initial = displayName ? displayName.substring(0, 2) : '주민';
  return <div className="w-10 h-10 rounded-full bg-[#00843D]/10 text-[#00843D] flex items-center justify-center font-extrabold text-xs border-2 border-[#00843D]/20 shadow-sm shrink-0">{initial}</div>;
};

const fallbackPosts = [
  {
    id: 'mock1',
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
    displayName: '희망지역 부녀회원',
    content: "COP28 이후 탄소중립 이행 속도에 대한 논의가 뜨겁습니다. 새마을 정신인 '자조'와 '협동'이 개발도상국 에너지 전환 격차를 줄이는 실질적인 대안이 될 수 있을까요? 🌍💬 여러분의 생각을 댓글로 나눠주세요!",
    timestamp: { seconds: Date.now()/1000 - 7200 },
    likes: 156,
    category: '글로벌 이슈',
    location: '글로벌 이슈 토론',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
  }
];

const travelDestinations = [
  {
    id: 1,
    title: '청도 새마을운동 발상지 기념공원',
    region: '경북 청도',
    tag: '발상지 기념관',
    desc: '1969년 박정희 대통령이 수해 복구 현장을 보며 새마을운동의 영감을 얻은 신도마을. 역사적인 레트로 재현 공간과 테마광장이 마련되어 있습니다.',
    likes: 892,
    image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    title: '구미 새마을운동 테마공원',
    region: '경북 구미',
    tag: '테마전시관',
    desc: '과거, 현재, 미래를 한 눈에 볼 수 있는 대규모 복합 문화공간. 글로벌관을 통한 해외 전파 성공 사례가 상세히 전시되어 있어 학술 연구 가치도 큽니다.',
    likes: 1204,
    image: 'https://images.unsplash.com/photo-1506466010722-395ee2bef877?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: '포항 새마을운동 발상지 기념관',
    region: '경북 포항',
    tag: '기념전시관',
    desc: '문충리 새마을운동 기록물 및 당시 사용하던 농기구들이 전시되어 있으며, 사방 기념공원과 인접해 풍성한 볼거리를 선사합니다.',
    likes: 543,
    image: 'https://images.unsplash.com/photo-1578330761614-77f6b0f513f5?auto=format&fit=crop&w=800&q=80'
  }
];

const Community = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  
  // Writing State
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('일반');
  const [locationInput, setLocationInput] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  
  // Image Selection States
  const [attachedImage, setAttachedImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);
  
  // Share state
  const [copiedId, setCopiedId] = useState(null);

  // Static list matching original design
  const defaultTrends = [
    '1. 탄소중립 실천',
    '2. 스마트 팜 교육',
    '3. ODA 사업 공모',
    '4. 플라스틱 제로',
    '5. 에너지 자립마을'
  ];

  const boardCategories = [
    '빈곤퇴치 (SDG 1)',
    '기아해방 (SDG 2)',
    '기후행동 (SDG 13)',
    '양질의 교육 (SDG 4)'
  ];

  // Direct Font injection dynamically to match original static page font exactly
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-9Black.woff2';
    link.rel = 'stylesheet';
    
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

  // Firestore & Auth hooks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) checkTodayAttendance(currentUser);
      else setHasCheckedIn(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    }, (error) => console.error("Post read error", error));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttendances(attendanceData);
    }, (error) => console.error("Attendance error", error));
    return unsubscribe;
  }, []);

  const checkTodayAttendance = async (currentUser) => {
    try {
      const todayStr = new Date().toLocaleDateString('ko-KR');
      const q = query(collection(db, 'attendance'), where('uid', '==', currentUser.uid), where('dateString', '==', todayStr));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) setHasCheckedIn(true);
    } catch (e) { console.error(e); }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) { alert("로그인 실패"); }
  };

  const handleMarkAttendance = async () => {
    if (!user) {
      alert("출석체크를 하려면 로그인이 필요합니다.");
      handleGoogleLogin();
      return;
    }
    if (hasCheckedIn) return;
    try {
      const todayStr = new Date().toLocaleDateString('ko-KR');
      await addDoc(collection(db, 'attendance'), {
        uid: user.uid,
        displayName: user.displayName || '마을 주민',
        photoURL: user.photoURL || '',
        timestamp: serverTimestamp(),
        dateString: todayStr
      });
      setHasCheckedIn(true);
    } catch (e) { alert("출석등록 중 에러"); }
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
        const MAX_SIZE = 800;
        if (width > height) {
          if (width > MAX_SIZE) { height = Math.round(height * (MAX_SIZE / width)); width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width = Math.round(width * (MAX_SIZE / height)); height = MAX_SIZE; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        setAttachedImage(compressed);
        setIsCompressing(false);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!user || !postText.trim()) return;
    try {
      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email || '',
        content: postText,
        timestamp: serverTimestamp(),
        likes: 0,
        category: selectedCategory,
        location: locationInput || '새마을 스마트빌리지',
        image: attachedImage || null
      });
      setPostText(''); setLocationInput(''); setAttachedImage(null); setIsWriting(false);
    } catch (e) { alert("등록 실패"); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("이 게시물을 정말 삭제하시겠습니까?")) return;
    try { await deleteDoc(doc(db, 'posts', postId)); } 
    catch (e) { alert("에러발생"); }
  };

  const handleLikePost = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likes: increment(1) });
    } catch (e) {}
  };

  const handleShare = (id) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '방금 전';
    let date = (timestamp instanceof Timestamp) ? timestamp.toDate() : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const displayedPosts = [...posts, ...fallbackPosts];

  return (
    <div className="min-h-screen bg-[#f0f2f5] pt-24 pb-20 saemaul-font antialiased">
      {/* High-fidelity Layout Wrapper */}
      <div className="container mx-auto px-4 max-w-[1100px]">
        
        {/* Fixed/Sticky Search Sub-bar like Original */}
        <div className="mb-6 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-black/5 shadow-sm">
          <div className="flex items-center gap-2 text-[#00843D] font-black text-lg tracking-tight cursor-pointer">
             <div className="w-8 h-8 rounded-full bg-[#00843D] text-[#FFCD00] flex items-center justify-center shadow font-bold">🌱</div>
             <span>새마을 마을회관</span>
          </div>
          <div className="hidden md:flex items-center bg-[#e4e6eb] px-3.5 py-1.5 rounded-full gap-2 w-72">
             <Search size={15} className="text-[#65676b]" />
             <input type="text" placeholder="SDGs 및 글로벌 이슈 검색" className="bg-transparent border-none outline-none text-xs font-medium text-[#1c1e21] w-full placeholder:text-[#65676b]" />
          </div>
        </div>

        {/* Main Content Three-Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
          
          {/* 1. Left Sidebar - Everytime / Portal Navigation */}
          <aside className="flex flex-col gap-5">
            
            {/* Sidebar Nav: Scrollable horizontally on mobile, vertical on desktop */}
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible py-2 lg:py-0 gap-2 lg:gap-1.5 scrollbar-none sticky top-24 z-10 bg-[#f0f2f5] lg:bg-transparent">
              {[
                { id: 'feed', label: '홈', icon: '🏠' },
                { id: 'sdgs', label: 'SDGs 현황판', icon: '📈' },
                { id: 'travel', label: '새마을 여행지', icon: '🗺️' },
                { id: 'talk', label: '협동 토론방', icon: '💬' }
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

            {/* Trending Widget: Replicated Exactly */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5">
              <h3 className="font-bold text-[15px] text-[#1c1e21] mb-4 border-b border-[#f0f2f5] pb-2 flex items-center gap-2">
                 <TrendingUp size={16} className="text-[#00843D]" />
                 실시간 검색어
              </h3>
              <div className="space-y-2">
                {defaultTrends.map((trend, i) => (
                  <div key={i} className="text-[13.5px] font-bold text-[#1c1e21] py-1 cursor-pointer hover:text-[#00843D] transition-colors border-b border-[#f0f2f5]/50 last:border-none pb-1.5">
                    {trend}
                  </div>
                ))}
              </div>
            </div>

            {/* Board List Widget: Replicated Exactly */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5">
              <h4 className="font-bold text-[12px] text-[#65676b] uppercase tracking-wider mb-3 pb-1 border-b border-[#f0f2f5]">
                 프로젝트 게시판
              </h4>
              <div className="flex flex-col gap-1">
                {boardCategories.map((cat, idx) => (
                  <button key={idx} onClick={() => setActiveTab('feed')} className="text-left text-[13px] font-bold text-[#1c1e21] py-2 px-2 hover:bg-[#f0f2f5] rounded-lg transition-colors flex items-center justify-between group">
                    <span>{cat}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-[#00843D] transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 2. Center Feed Section */}
          <main className="flex flex-col gap-5">
            
            {activeTab === 'feed' && (
              <>
                {/* TOP Attendance Card: Moved here for Mobile visibility like static code */}
                <div className="bg-white border border-[#00843d]/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4">
                  <h3 className="font-bold text-[15px] text-[#00843D] flex items-center gap-2 pb-2 border-b border-[#00843d]/5">
                    <span>📝</span> 오늘의 마을 출석부
                  </h3>
                  
                  <button
                    disabled={hasCheckedIn}
                    onClick={handleMarkAttendance}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      hasCheckedIn 
                        ? 'bg-[#e4e6eb] text-[#65676b] cursor-default shadow-inner' 
                        : 'bg-[#00843D] text-white font-extrabold shadow-md hover:bg-[#006b31] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {hasCheckedIn ? (
                      <>
                        <CheckCircle2 size={16} className="text-[#00843D]" />
                        오늘의 출석 완료!
                      </>
                    ) : (
                      "오늘의 출석체크 하기"
                    )}
                  </button>

                  {/* Real-time dynamic list */}
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {attendances.length > 0 ? (
                      attendances.map((att) => (
                        <div key={att.id} className="flex items-center gap-2.5 bg-[#f8f9fa] border border-black/5 rounded-lg p-2 text-[12px]">
                          <img 
                            src={att.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(att.displayName || 'User')}&background=e2e8f0&color=475569`} 
                            className="w-6 h-6 rounded-full object-cover shadow-inner" alt="" 
                          />
                          <span className="font-bold text-[#1c1e21] truncate flex-1 pr-1">{att.displayName}님이 출석했습니다.</span>
                          <span className="text-[10px] font-bold text-[#65676b] whitespace-nowrap">{formatTime(att.timestamp)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2.5 bg-[#f8f9fa] rounded-lg p-3 text-center">
                        <span className="text-[12px] font-bold text-[#65676b] w-full">첫 출석체크를 기다리고 있습니다.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Write Post Widget */}
                <div className="bg-white rounded-2xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-5">
                  {!user ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#f0f2f5] rounded-xl border border-[#e4e6eb]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5">
                          <Lock size={16} className="text-[#65676b]" />
                        </div>
                        <div>
                          <h5 className="font-bold text-[#1c1e21] text-[13.5px]">마을 주민 로그인이 필요합니다.</h5>
                          <p className="text-[#65676b] text-[11px] font-bold">실시간으로 소식을 쓰고 사람들과 소통해 보세요!</p>
                        </div>
                      </div>
                      <button onClick={handleGoogleLogin} className="bg-[#00843D] hover:bg-[#006b31] text-white font-extrabold text-xs py-2.5 px-5 rounded-full shadow-sm flex items-center gap-1.5 active:scale-95 transition-all">
                        Google 로그인
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <img 
                        src={user.photoURL || 'https://ui-avatars.com/api/?name=User'} 
                        alt="" 
                        className="w-10 h-10 rounded-full border-2 border-[#00843D] object-cover shadow-sm" 
                      />
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
                            className="w-full bg-[#f0f2f5] border border-[#e4e6eb] focus:border-[#00843D] outline-none rounded-xl p-4 text-[13.5px] font-bold resize-none h-28 transition-all text-[#1c1e21] placeholder-[#65676b]"
                          />

                          {isCompressing && (
                            <div className="flex items-center justify-center py-3 bg-[#f8f9fa] border border-[#e4e6eb] rounded-xl text-[#00843D] gap-2 font-extrabold text-[11px] animate-pulse">
                              <Loader2 className="animate-spin" size={14} />
                              <span>사진 압축 중...</span>
                            </div>
                          )}

                          {attachedImage && !isCompressing && (
                            <div className="relative max-h-48 rounded-xl overflow-hidden border border-[#e4e6eb] bg-black/5">
                              <img src={attachedImage} alt="Preview" className="w-full h-full object-contain" />
                              <button type="button" onClick={() => setAttachedImage(null)} className="absolute top-2 right-2 text-white bg-black/50 hover:bg-red-500 rounded-full p-1 shadow-md transition-colors">
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f9fa] p-2.5 rounded-xl border border-[#e4e6eb]">
                            <div className="flex flex-wrap items-center gap-2">
                              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelection} />
                              <button type="button" onClick={() => fileInputRef.current?.click()} title="사진 첨부" className="bg-white border border-[#e4e6eb] rounded-lg p-2 text-[#65676b] hover:text-[#00843D] hover:border-[#00843D]/30 transition-all shadow-sm">
                                <Camera size={15} />
                              </button>

                              <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-white border border-[#e4e6eb] text-[11px] font-black rounded-lg py-1.5 px-2 outline-none text-[#65676b] cursor-pointer h-[33px]"
                              >
                                <option value="일반">일반</option>
                                <option value="SDG 1">SDG 1</option>
                                <option value="SDG 2">SDG 2</option>
                                <option value="SDG 4">SDG 4</option>
                                <option value="SDG 13">SDG 13</option>
                                <option value="관광">관광</option>
                              </select>

                              <div className="flex items-center bg-white border border-[#e4e6eb] rounded-lg px-2 text-[#65676b] h-[33px]">
                                <MapPin size={12} />
                                <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="위치" className="outline-none border-none text-[10px] font-bold w-16 pl-1 bg-transparent" />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                              <button type="button" onClick={() => { setIsWriting(false); setPostText(''); setAttachedImage(null); }} className="text-[#65676b] hover:text-[#1c1e21] font-extrabold text-[11px] px-3 py-1.5">취소</button>
                              <button type="submit" disabled={!postText.trim() || isCompressing} className="bg-[#00843D] disabled:bg-[#e4e6eb] disabled:text-[#65676b] text-white text-[11px] font-black px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all h-[31px]">
                                <Send size={10} />
                                발행하기
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Feed Main Posts Container */}
                <div className="flex flex-col gap-5">
                  {displayedPosts.map((post) => {
                    const canDelete = user && !post.id.startsWith('mock') && (user.uid === post.uid || user.email === ADMIN_EMAIL);
                    
                    return (
                      <article 
                        key={post.id} 
                        className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-black/5 overflow-hidden post-hover-effect transform transition-all ease-out group/post"
                      >
                        {/* Header */}
                        <div className="p-4 pb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {getAvatarMarkup(post.displayName, post.photoURL)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-[13.5px] text-[#1c1e21] leading-tight flex items-center gap-1 truncate">
                                  {post.displayName}
                                  {post.email === ADMIN_EMAIL && (
                                    <span className="text-[8px] bg-red-50 text-red-600 px-1 rounded border border-red-100 font-black">관리자</span>
                                  )}
                                </h4>
                              </div>
                              <div className="text-[11px] text-[#65676b] font-bold mt-0.5 flex items-center gap-1.5 truncate">
                                <span>{formatTime(post.timestamp)}</span>
                                <span>·</span>
                                <span>{post.location || '공동체 지구'}</span>
                                {post.category && post.category !== '일반' && (
                                  <>
                                    <span>·</span>
                                    <span className="text-[#00843D]">{post.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {canDelete && (
                            <button onClick={() => handleDeletePost(post.id)} className="text-[#65676b]/50 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Content Text */}
                        <div className="px-4 pb-3 text-[13.5px] font-medium leading-relaxed text-[#1c1e21] whitespace-pre-wrap break-words select-text">
                          {post.content}
                        </div>

                        {/* Image Block - Exactly matched height/width structure of original */}
                        {post.image && (
                          <div className="w-full border-y border-[#f0f2f5] bg-[#f8f9fa] overflow-hidden flex justify-center max-h-[480px]">
                            <img src={post.image} alt="Post media" className="w-full h-auto object-cover block" />
                          </div>
                        )}

                        {/* Action Footer - Styled like original mock */}
                        <div className="px-4 py-3 flex items-center gap-5 border-t border-[#f0f2f5] text-[12.5px] font-bold text-[#65676b]">
                          <button 
                            onClick={() => !post.id.startsWith('mock') && handleLikePost(post.id)} 
                            className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${post.id.startsWith('mock') ? 'cursor-default opacity-80' : ''}`}
                          >
                            <Heart size={14} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                            <span>{post.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5 opacity-60 hover:text-[#00843D] transition-colors cursor-not-allowed">
                            <MessageCircle size={14} />
                            <span>45</span>
                          </button>
                          <button className="flex items-center gap-1.5 opacity-60 hover:text-[#00843D] transition-colors cursor-not-allowed">
                            <Repeat size={14} />
                            <span>12</span>
                          </button>
                          <button onClick={() => handleShare(post.id)} className="ml-auto flex items-center gap-1 hover:text-[#00843D] transition-colors">
                            <Share2 size={13} />
                            <span className="text-[11px]">{copiedId === post.id ? '복사됨!' : '공유'}</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'sdgs' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1 pb-1 border-b border-[#e4e6eb]">
                  <h2 className="text-2xl font-black text-[#1c1e21] tracking-tight flex items-center gap-2">
                    📊 SDGs 현황판
                  </h2>
                  <p className="text-[#65676b] text-[12px] font-bold">글로벌 새마을 연계 지속가능발전 지표 달성 통계.</p>
                </div>
                
                <div className="bg-white border border-black/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-6 flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: '스마트 농업 보급률', val: '85%', color: 'text-[#00843D]', sub: '동남아 시범마을' },
                      { label: '누적 ODA 사업국', val: '42개국', color: 'text-[#ff9800]', sub: '전 세계 권역 총계' },
                      { label: '글로벌 인재 양성', val: '1,280명', color: 'text-[#2196f3]', sub: '새마을대학원 배출' },
                      { label: '주요 연동 핵심 지표', val: '2, 13번', color: 'text-[#e91e63]', sub: 'SDG 핵심목표' }
                    ].map((stat, idx) => (
                      <div key={idx} className="p-5 rounded-xl border border-[#f0f2f5] bg-[#f8f9fa] hover:bg-white transition-all shadow-sm">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#65676b] block mb-1">{stat.sub}</span>
                        <h5 className="text-[13px] font-bold text-[#1c1e21] mb-3">{stat.label}</h5>
                        <span className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'travel' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1 pb-1 border-b border-[#e4e6eb]">
                  <h2 className="text-2xl font-black text-[#1c1e21] tracking-tight flex items-center gap-2">
                    🗺️ 새마을 여행지
                  </h2>
                  <p className="text-[#65676b] text-[12px] font-bold">역사적인 의미가 가득한 명소 및 레트로 성지 리스트.</p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {travelDestinations.map(dest => (
                    <div key={dest.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-black/5 hover:translate-y-[-4px] transition-all group">
                      <div className="h-44 overflow-hidden relative bg-[#eee]">
                        <img src={dest.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                        <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-sm">
                          {dest.region} · {dest.tag}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col gap-2">
                        <h3 className="text-base font-bold text-[#1c1e21]">{dest.title}</h3>
                        <p className="text-[12.5px] text-[#65676b] leading-relaxed font-medium">{dest.desc}</p>
                        <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#f0f2f5]">
                          <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#65676b]">
                            <Heart size={13} className="text-red-400 fill-red-400" />
                            <span>{dest.likes}명이 방문</span>
                          </div>
                          <button className="flex items-center gap-1 text-xs font-bold text-[#00843D]">
                            <span>자세히 보기</span> <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'talk' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1 pb-1 border-b border-[#e4e6eb]">
                  <h2 className="text-2xl font-black text-[#1c1e21] tracking-tight flex items-center gap-2">
                    💬 협동 토론방
                  </h2>
                  <p className="text-[#65676b] text-[12px] font-bold">공동체의 문제를 함께 제안하고 논의하는 소통창구입니다.</p>
                </div>
                <div className="bg-white rounded-2xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-8 text-center flex flex-col items-center gap-3">
                  <MessageCircle size={30} className="text-[#00843D]/30" />
                  <h4 className="font-bold text-[#1c1e21] text-[14px]">아직 활성화된 토론방이 없습니다.</h4>
                  <p className="text-[#65676b] text-[12px] max-w-sm font-medium leading-relaxed">
                    피드에 자유로운 아이디어를 개진하여 사람들과 활발한 의견 교환의 초석을 다져보세요!
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* 3. Right Sidebar - Summary & Branding (Hidden on small screens) */}
          <aside className="hidden lg:flex flex-col gap-5">
            {/* Replicated "Global Smart Community Branding Card" */}
            <div className="bg-gradient-to-br from-[#00843D] to-[#006b31] text-white rounded-2xl p-6 relative overflow-hidden shadow-lg group">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#FFCD00]/20 rounded-full blur-xl transition-transform duration-700 group-hover:scale-150" />
              <h4 className="text-base font-black tracking-tight leading-snug mb-2">스마트 새마을<br />클라우드 커뮤니티</h4>
              <p className="text-[12px] text-white/80 font-bold leading-relaxed mb-5">근면·자조·협동의 근간 위에 디지털 협동 문화를 결합한 글로벌 새마을 종합 광장입니다.</p>
              <div className="flex items-center gap-1.5 text-[#FFCD00] font-black text-[11px]">
                <span>정보공개 및 성과 보고</span>
                <ArrowRight size={12} />
              </div>
            </div>

            {/* Secondary Information Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 text-[#1c1e21] mb-3 pb-2 border-b border-[#f0f2f5]">
                 <Sparkles size={14} className="text-[#00843D]" />
                 <span className="text-[12px] font-extrabold tracking-tight">마을 수칙</span>
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
    </div>
  );
};

export default Community;
