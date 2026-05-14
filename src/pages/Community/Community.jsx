import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  BarChart3, 
  MapPin, 
  MessageSquare, 
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
  MessageCircle,
  Camera,
  Tag,
  ArrowRight,
  Trash2,
  XCircle,
  Loader2
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

// Admin check variable
const ADMIN_EMAIL = 'anstlr6665@gmail.com';

// Pre-defined Mock Posts to show at the bottom of the feed
const fallbackPosts = [
  {
    id: 'mock1',
    displayName: '해외지역 청년지도자',
    photoURL: 'https://ui-avatars.com/api/?name=OS&background=2196f3&color=fff',
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
    photoURL: 'https://ui-avatars.com/api/?name=GM&background=ff9800&color=fff',
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
    photoURL: 'https://ui-avatars.com/api/?name=HM&background=4caf50&color=fff',
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
  
  // Writing Post State
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('일반');
  const [locationInput, setLocationInput] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  
  // Image Upload States (Base64 inline direct method)
  const [attachedImage, setAttachedImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);
  
  // UI State
  const [copiedId, setCopiedId] = useState(null);
  const [trendIndex, setTrendIndex] = useState(0);

  // Dynamic search keywords rotating
  const trends = [
    ['1. 탄소중립 실천', '2. 스마트 팜 교육', '3. ODA 사업 공모', '4. 플라스틱 제로', '5. 에너지 자립마을'],
    ['1. 청도 발상지', '2. 구미 테마공원', '3. 영남대 PSPS', '4. 협동 정신', '5. 글로벌 SDGs']
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTrendIndex((prev) => (prev + 1) % trends.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkTodayAttendance(currentUser);
      } else {
        setHasCheckedIn(false);
      }
    });
    return unsubscribe;
  }, []);

  // 2. Read Posts Realtime from Firestore
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setPosts(postsData);
    }, (error) => {
      console.error("Firestore Post Read Error:", error);
    });
    return unsubscribe;
  }, []);

  // 3. Read Attendance Realtime from Firestore
  useEffect(() => {
    const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendanceData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setAttendances(attendanceData);
    }, (error) => {
      console.error("Firestore Attendance Read Error:", error);
    });
    return unsubscribe;
  }, []);

  // Check if Checked in Today
  const checkTodayAttendance = async (currentUser) => {
    try {
      const todayStr = new Date().toLocaleDateString('ko-KR');
      const q = query(
        collection(db, 'attendance'), 
        where('uid', '==', currentUser.uid),
        where('dateString', '==', todayStr)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setHasCheckedIn(true);
      }
    } catch (e) {
      console.error("Error checking attendance:", e);
    }
  };

  // Auth Action
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  // Attendance Submit Action
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
    } catch (e) {
      console.error("Error marking attendance:", e);
      alert("출석 등록 중 문제가 발생했습니다.");
    }
  };

  // Image Compression & Loader Handler (Converts to compact Base64 Data URL)
  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsCompressing(true);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Bound to max 800px dimension for fast cloud saves & reads
        const MAX_SIZE = 800;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Standard JPEG 0.6 quality usually outputs perfect-looking web ~60-150kb images
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setAttachedImage(compressedDataUrl);
        setIsCompressing(false);
      };
      img.onerror = () => {
        setIsCompressing(false);
        alert("이미지 처리 중 에러가 발생했습니다.");
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Post Submit Action
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("글을 작성하려면 로그인이 필요합니다.");
      return;
    }
    if (!postText.trim()) return;

    try {
      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email || '',
        content: postText,
        timestamp: serverTimestamp(),
        likes: 0,
        likedUsers: [],
        category: selectedCategory,
        location: locationInput || '새마을 스마트빌리지',
        image: attachedImage || null // Store the base64 string
      });
      setPostText('');
      setLocationInput('');
      setAttachedImage(null);
      setIsWriting(false);
    } catch (e) {
      console.error("Error submitting post:", e);
      alert("글 등록 중 오류가 발생했습니다.");
    }
  };

  // Post Delete Action (Handles both creator & Admin deletion)
  const handleDeletePost = async (postId) => {
    if (!window.confirm("이 게시물을 정말 삭제하시겠습니까?")) return;
    
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (e) {
      console.error("Error deleting post:", e);
      alert("삭제 권한이 없거나 서버 에러가 발생했습니다.");
    }
  };

  // Like Action
  const handleLikePost = async (postId, currentLikes) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (e) {
      console.warn("Couldn't increment like on Cloud Firestore.", e);
    }
  };

  // Copy Share Link Action
  const handleShare = (id) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper function to parse timestamps
  const formatTime = (timestamp) => {
    if (!timestamp) return '방금 전';
    
    let date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    const diff = (Date.now() - date.getTime()) / 1000; // seconds
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // Combines Live database posts on top with Pre-defined mock examples below
  const displayedPosts = [...posts, ...fallbackPosts];

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Sidebar Menu (4 Columns) */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            {/* Navigation Cards */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 sticky top-24 z-20">
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: 'feed', icon: Home, label: '마을 광장 (피드)', color: 'text-emerald-600 bg-emerald-50' },
                  { id: 'sdgs', icon: BarChart3, label: 'SDGs 종합현황판', color: 'text-amber-600 bg-amber-50' },
                  { id: 'travel', icon: MapPin, label: '새마을 성지순례', color: 'text-blue-600 bg-blue-50' },
                  { id: 'talk', icon: MessageSquare, label: '실시간 주민 토론방', color: 'text-purple-600 bg-purple-50' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group ${
                      activeTab === tab.id 
                        ? `${tab.color} border border-current/10 shadow-sm shadow-slate-100` 
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <tab.icon size={18} className={activeTab === tab.id ? '' : 'text-slate-400 group-hover:text-slate-600 transition-colors'} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Trending Sidebar */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 text-slate-800 mb-5">
                <TrendingUp size={18} className="text-emerald-500" />
                <h3 className="font-black text-sm tracking-tight uppercase">실시간 주민 검색어</h3>
              </div>
              <div className="space-y-3.5">
                {trends[trendIndex].map((trend, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer py-1 hover:translate-x-1 transition-all duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-40 group-hover:opacity-100" />
                    <span className="text-[13px] font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{trend}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Board Info */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[24px] border border-slate-800 shadow-xl p-6 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-emerald-400" />
                <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">Smart Community</span>
              </div>
              <h4 className="text-base font-black leading-snug mb-3">새마을 클라우드<br />마을회관에 오신것을 환영합니다</h4>
              <p className="text-[12px] text-slate-400 font-medium leading-relaxed mb-5">근면·자조·협동 정신을 현대의 디지털 협동 방식으로 계승하여 전세계 이웃과 경험을 공유합니다.</p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs">
                <span>자세히 알아보기</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </aside>

          {/* Center Feed - Content Container (6 Columns) */}
          <main className="lg:col-span-6 flex flex-col gap-6">
            
            {/* CONDITIONAL TAB RENDERING */}
            {activeTab === 'feed' && (
              <>
                {/* Header Welcome */}
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <Home className="text-emerald-600" size={24} />
                    마을 광장 소식
                  </h2>
                  <p className="text-slate-500 text-xs font-medium">글로벌 새마을 운동원들과 함께 혁신과 실천 사례를 실시간으로 나눠요.</p>
                </div>

                {/* Post Creation Box */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 transition-all duration-300">
                  {!user ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center sm:text-left">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                          <Lock size={16} className="text-slate-400" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">마을 주민으로 로그인해보세요!</h5>
                          <p className="text-slate-400 text-xs font-medium">로그인 후 즉시 내 소식을 전하고 소통할 수 있습니다.</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleGoogleLogin} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-5 rounded-full shadow-sm transition-all shrink-0 flex items-center gap-1.5"
                      >
                        <Globe size={13} />
                        Google 로그인
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Input Switcher */}
                      <div className="flex gap-3.5">
                        <img 
                          src={user.photoURL || 'https://ui-avatars.com/api/?name=User'} 
                          alt="Me" 
                          className="w-10 h-10 rounded-full border-2 border-emerald-100 p-0.5 shadow-sm shrink-0 object-cover" 
                        />
                        {!isWriting ? (
                          <button 
                            onClick={() => setIsWriting(true)}
                            className="flex-1 bg-slate-50 hover:bg-slate-100 rounded-2xl px-4 text-left text-[13px] text-slate-400 font-semibold transition-all border border-slate-100 h-10 select-none"
                          >
                            오늘의 글로벌 이슈나 사업 현황을 자유롭게 공유해주세요.
                          </button>
                        ) : (
                          <form onSubmit={handleSubmitPost} className="flex-1 flex flex-col gap-3 animate-fadeIn">
                            <textarea
                              autoFocus
                              value={postText}
                              onChange={(e) => setPostText(e.target.value)}
                              placeholder="지금 일어나는 마을의 혁신적인 변화나 SDGs 소식을 적어주세요..."
                              className="w-full bg-slate-50 focus:bg-white border border-slate-100 focus:border-emerald-500 outline-none rounded-2xl p-4 text-sm font-medium resize-none h-28 transition-all text-slate-700"
                            />

                            {/* Embedded Picture Preview Area */}
                            {isCompressing && (
                              <div className="flex items-center justify-center py-4 bg-slate-50 border border-slate-100 rounded-xl text-emerald-600 gap-2 font-bold text-xs animate-pulse">
                                <Loader2 className="animate-spin" size={16} />
                                <span>이미지 압축 변환 중...</span>
                              </div>
                            )}

                            {attachedImage && !isCompressing && (
                              <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group">
                                <img src={attachedImage} alt="Preview" className="w-full h-full object-contain" />
                                <button 
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 text-slate-800/60 hover:text-red-500 bg-white/80 hover:bg-white rounded-full p-1 shadow-md transition-all"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Hidden file input for Camera Trigger */}
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  onChange={handleImageSelection}
                                />
                                <button 
                                  type="button"
                                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                  title="사진 첨부"
                                  className="bg-white border border-slate-200 rounded-lg p-2 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                                >
                                  <Camera size={15} />
                                </button>

                                <select
                                  value={selectedCategory}
                                  onChange={(e) => setSelectedCategory(e.target.value)}
                                  className="bg-white border border-slate-200 text-[11px] font-bold rounded-lg py-1.5 px-2.5 outline-none focus:border-emerald-500 text-slate-600 cursor-pointer h-[33px]"
                                >
                                  <option value="일반">일반 소식</option>
                                  <option value="SDG 1">빈곤퇴치 (SDG1)</option>
                                  <option value="SDG 2">기아해방 (SDG2)</option>
                                  <option value="SDG 4">교육 (SDG4)</option>
                                  <option value="SDG 13">기후행동 (SDG13)</option>
                                  <option value="ODA/사업">ODA/프로젝트</option>
                                  <option value="정보공유">자료 정보공유</option>
                                </select>

                                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 text-slate-500 shrink-0 focus-within:border-emerald-500 h-[33px]">
                                  <MapPin size={12} />
                                  <input 
                                    type="text" 
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    placeholder="위치입력" 
                                    className="outline-none border-none text-[10px] font-bold w-20 pl-1 bg-transparent placeholder-slate-300" 
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-auto">
                                <button 
                                  type="button"
                                  onClick={() => { setIsWriting(false); setPostText(''); setAttachedImage(null); }}
                                  className="text-slate-400 hover:text-slate-600 font-bold text-[11px] px-3 py-1.5"
                                >
                                  취소
                                </button>
                                <button 
                                  type="submit"
                                  disabled={!postText.trim() || isCompressing}
                                  className="bg-emerald-600 disabled:bg-slate-300 text-white text-[11px] font-black px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 h-[30px]"
                                >
                                  <Send size={11} />
                                  발행하기
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Posts List */}
                <div className="space-y-5">
                  {displayedPosts.map((post) => {
                    // Authorization Check: Post Creator OR specified Admin OR (email matched mock-users which shouldn't happen)
                    // Mock items do NOT show the delete button
                    const canDelete = user && 
                                      !post.id.startsWith('mock') && 
                                      (user.uid === post.uid || user.email === ADMIN_EMAIL);
                    
                    return (
                      <article 
                        key={post.id}
                        className={`bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md animate-scaleUp ${post.id.startsWith('mock') ? 'opacity-90 select-none' : ''}`}
                      >
                        {/* Author Header */}
                        <div className="p-5 pb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img 
                              src={post.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.displayName || 'User')}`} 
                              alt={post.displayName} 
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 p-0.5 shadow-sm shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-[13px] text-slate-800 leading-none flex items-center gap-1 truncate">
                                  {post.displayName}
                                  {/* Explicit Visual Indicator for Designated Admin */}
                                  {post.email === ADMIN_EMAIL && (
                                    <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-black uppercase border border-red-100">관리자</span>
                                  )}
                                </h4>
                                {post.category && post.category !== '일반' && (
                                  <span className="bg-emerald-50 text-emerald-600 font-black text-[9px] px-2 py-0.5 rounded-full border border-emerald-100 leading-none">
                                    {post.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-1">
                                <span>{formatTime(post.timestamp)}</span>
                                <span>•</span>
                                <div className="flex items-center gap-0.5">
                                  <MapPin size={10} />
                                  <span className="truncate">{post.location || '공동체 지구'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Admin / Self Post Deletion Button */}
                          {canDelete && (
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-all shrink-0"
                              title="게시물 삭제"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        {/* Post Body */}
                        <div className="px-5 pb-3 text-[13.5px] leading-relaxed font-medium text-slate-700 whitespace-pre-wrap break-words">
                          {post.content}
                        </div>

                        {/* Attached Post Image (Displays base64 embedded or standard URL) */}
                        {post.image && (
                          <div className="px-5 pb-3">
                            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner flex justify-center max-h-[420px]">
                              <img src={post.image} alt="Post attachments" className="max-w-full h-auto object-contain" />
                            </div>
                          </div>
                        )}

                        {/* Post Footer Interaction */}
                        <div className="px-5 pb-4 pt-2 flex items-center justify-between border-t border-slate-50 mt-1">
                          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                            <button 
                              onClick={() => !post.id.startsWith('mock') && handleLikePost(post.id, post.likes)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${post.id.startsWith('mock') ? 'cursor-not-allowed' : 'hover:text-red-500 hover:bg-red-50'}`}
                            >
                              <Heart size={14} className={post.likes > 0 ? "fill-red-500 text-red-500" : "text-slate-400"} />
                              <span>{post.likes || 0}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-all cursor-not-allowed opacity-60">
                              <MessageSquare size={14} className="text-slate-400" />
                              <span>댓글</span>
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-all"
                          >
                            <Share2 size={14} />
                            <span>{copiedId === post.id ? '복사완료!' : '공유'}</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'sdgs' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <BarChart3 className="text-amber-500" size={24} />
                    SDGs 종합현황판
                  </h2>
                  <p className="text-slate-500 text-xs font-medium">지구촌 새마을 사업과 연계된 UN 지속가능발전목표(SDGs) 달성 현황입니다.</p>
                </div>
                
                <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm p-6 flex flex-col gap-6">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight pb-3 border-b border-slate-100 flex items-center gap-2">
                    <Globe size={16} className="text-slate-400" />
                    전 세계 권역별 주요 핵심 지표
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: '스마트 농업 보급률', val: '85%', color: 'bg-emerald-50 text-emerald-600', sub: '동남아 권역 시범마을' },
                      { label: 'ODA 누적 사업 국가', val: '42개국', color: 'bg-amber-50 text-amber-600', sub: '아프리카 / 중남미 포함' },
                      { label: '차세대 글로벌 리더', val: '1,280명', color: 'bg-blue-50 text-blue-600', sub: '박정희새마을대학원 졸업생' },
                      { label: '핵심 연동 SDGs', val: 'SDG 2, 13', color: 'bg-purple-50 text-purple-600', sub: '기아해방 & 기후위기 대응' }
                    ].map((stat, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{stat.sub}</span>
                        <h5 className="text-[13px] font-bold text-slate-700 mb-3">{stat.label}</h5>
                        <span className={`inline-flex items-center text-xl font-black tracking-tight px-3.5 py-1 rounded-xl ${stat.color}`}>
                          {stat.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500" />
                      전문 평가 코멘트
                    </h4>
                    <p className="text-[11.5px] font-medium leading-relaxed text-slate-500">
                      "단순 원조성 프로젝트를 넘어 지역주민들의 자발적 '역량강화(Capacity Building)'에 주력한 2025 글로벌 새마을 프로젝트 모델이 ODA 우수 성공사례로 높이 평가되고 있습니다. 탄소중립을 가미한 스마트 빌리지 모델이 그 성과를 주도하고 있습니다."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'travel' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <MapPin className="text-blue-600" size={24} />
                    새마을 성지순례
                  </h2>
                  <p className="text-slate-500 text-xs font-medium">역사적인 의의와 레트로한 낭만이 공존하는 전국의 새마을운동 성지를 소개합니다.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {travelDestinations.map(dest => (
                    <div key={dest.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all group">
                      <div className="h-48 overflow-hidden relative">
                        <img src={dest.image} alt={dest.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                        <div className="absolute top-4 left-4 flex items-center gap-1.5">
                          <span className="bg-slate-900/80 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-sm">
                            {dest.region}
                          </span>
                          <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
                            {dest.tag}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col gap-3">
                        <h3 className="text-base font-black text-slate-800 tracking-tight">{dest.title}</h3>
                        <p className="text-[12.5px] text-slate-500 leading-relaxed font-medium">{dest.desc}</p>
                        <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-50">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <Heart size={14} className="text-red-400 fill-red-400" />
                            <span>{dest.likes}명이 다녀옴</span>
                          </div>
                          <button className="flex items-center gap-1 text-xs font-black text-blue-600">
                            <span>상세 코스보기</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'talk' && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <MessageSquare className="text-purple-600" size={24} />
                    주민 토론방
                  </h2>
                  <p className="text-slate-500 text-xs font-medium">마을공동체의 발전을 위해 더 나은 정책을 토론하고 제안하는 소통의 장입니다.</p>
                </div>

                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm mb-1.5">아직 열려있는 활발한 토론이 없습니다</h4>
                    <p className="text-slate-400 text-xs font-medium max-w-md leading-relaxed">
                      여러분의 실생활 경험과 기발한 기후변화 대책 아이디어가 미래 정책이 됩니다. 게시판 피드 작성을 통해 활기차게 토론의 씨앗을 뿌려보세요!
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('feed')}
                    className="mt-2 border border-purple-200 hover:bg-purple-50 text-purple-600 text-[11px] font-black px-4 py-2 rounded-full transition-all"
                  >
                    의견 게시하러 가기
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Attendance Check (3 Columns) */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            {/* Attendance Check Card */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 flex flex-col gap-5 sticky top-24 z-10">
              
              {/* Title Header */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={18} className="text-emerald-600" />
                  <h3 className="font-black text-[14px] text-slate-800 uppercase tracking-tight">오늘의 마을 출석부</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">하루에 한번 출석하며 공동체에 기여하세요.</p>
              </div>

              {/* CTA Checkin Button */}
              <button
                disabled={hasCheckedIn}
                onClick={handleMarkAttendance}
                className={`w-full py-3.5 rounded-2xl text-[13px] font-black flex items-center justify-center gap-2 border transition-all ${
                  hasCheckedIn 
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default' 
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:opacity-95 hover:-translate-y-0.5 active:scale-95 cursor-pointer'
                }`}
              >
                {hasCheckedIn ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    오늘의 출석 완료!
                  </>
                ) : (
                  <>
                    <CalendarCheck size={16} />
                    오늘의 출석체크 하기
                  </>
                )}
              </button>

              {/* Realtime Attendance List */}
              <div className="flex flex-col gap-2.5 max-height-[240px] overflow-y-auto pr-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">최근 출석 내역</div>
                
                {attendances.length > 0 ? (
                  attendances.map((att) => (
                    <div 
                      key={att.id} 
                      className="flex items-center gap-2.5 bg-slate-50/75 border border-slate-50/50 rounded-xl p-2.5 hover:bg-white hover:shadow-sm transition-all duration-300 animate-fadeIn"
                    >
                      <img 
                        src={att.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(att.displayName || 'User')}&background=e2e8f0&color=475569`} 
                        alt={att.displayName} 
                        className="w-6 h-6 rounded-full shrink-0 object-cover shadow-sm" 
                      />
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 truncate pr-2">{att.displayName}님</span>
                        <span className="text-[9px] font-bold text-slate-400 shrink-0">{formatTime(att.timestamp)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-dashed rounded-xl p-3 text-center">
                      <span className="text-[11px] font-bold text-slate-400 w-full">첫 출석체크의 주인공이 되세요!</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Community;
