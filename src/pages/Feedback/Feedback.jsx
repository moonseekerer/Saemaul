import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  MessageSquare, 
  Lock, 
  Unlock, 
  Send, 
  User, 
  Clock, 
  ShieldAlert, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import './Feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  
  // Auth 및 User Profile 상태
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // 피드백 입력 상태
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [writerName, setWriterName] = useState(''); // 비로그인 유저가 쓸 이름
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // 피드백 리스트 상태
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Auth 상태 변경 감지 및 유저 역할(Admin 여부) 조회
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Firestore에서 사용자 정보(role) 획득
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
        setWriterName('');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. 피드백 리스트 실시간 조회 (Firestore feedbacks 컬렉션)
  useEffect(() => {
    const feedbacksQuery = query(
      collection(db, 'feedbacks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFeedbacks = onSnapshot(feedbacksQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setFeedbacks(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error subscribing to feedbacks:", error);
      setIsLoading(false);
    });

    return () => unsubscribeFeedbacks();
  }, []);

  // 3. 피드백 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // 비로그인 상태일 때 익명 이름 검증
    let finalWriterName = '익명 주민';
    if (currentUser) {
      finalWriterName = currentUser.displayName || currentUser.email || '새마을 주민';
    } else if (writerName.trim()) {
      finalWriterName = writerName.trim();
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'feedbacks'), {
        content: content.trim(),
        isPrivate: isPrivate,
        writerName: finalWriterName,
        writerUid: currentUser ? currentUser.uid : null,
        writerPhotoURL: currentUser ? currentUser.photoURL : null,
        createdAt: new Date(),
      });

      // 등록 성공 리셋
      setContent('');
      setIsPrivate(false);
      if (!currentUser) setWriterName('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("피드백 등록에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. 비공개 피드백 권한 체커
  // 작성자 본인이거나 관리자(role === 'admin')인 경우에만 true 반환
  const checkReadPermission = (feedback) => {
    if (!feedback.isPrivate) return true; // 공개글은 누구나 가능
    if (!currentUser) return false; // 비로그인 유저는 비공개글 열람 불가
    
    // 작성자 본인 확인
    if (feedback.writerUid === currentUser.uid) return true;
    
    // 관리자 확인
    if (userData && userData.role === 'admin') return true;

    return false;
  };

  return (
    <div className="feedback-page-container min-h-screen bg-slate-900 text-slate-100 pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* 뒤로가기 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-700/40 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-100">주민 의견 피드백 수렴</h1>
            <p className="text-slate-400 text-sm mt-1">새마을-SDGs 플랫폼 개선을 위한 의견을 자유롭게 나누어주세요.</p>
          </div>
        </div>

        {/* 2단 레이아웃 (왼쪽: 작성 폼, 오른쪽: 리스트) */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* 피드백 작성 구역 (2/5) */}
          <div className="lg:col-span-2">
            <div className="glass-form-card p-6 rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-md sticky top-32">
              <h2 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
                <MessageSquare size={18} className="text-saemaul-green" />
                의견 보내기
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* 비로그인 유저일 경우 닉네임 입력란 노출 */}
                {!currentUser && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">작성자 명칭</label>
                    <input 
                      type="text"
                      placeholder="닉네임 (미기입시 익명)"
                      value={writerName}
                      onChange={(e) => setWriterName(e.target.value)}
                      className="form-input bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-saemaul-green transition-all"
                      maxLength={15}
                    />
                  </div>
                )}

                {/* 피드백 본문 입력 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">건의 및 피드백 내용</label>
                  <textarea 
                    placeholder="오타 수정 제안, 추가 기능 건의, 사용 소감 등 다양한 피드백을 환영합니다. (최대 300자)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-textarea bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 h-36 focus:outline-none focus:border-saemaul-green transition-all resize-none"
                    maxLength={300}
                    required
                  />
                  <span className="text-[10px] text-slate-500 self-end font-semibold">{content.length} / 300</span>
                </div>

                {/* 비공개 설정 체크박스 */}
                <div className="flex items-center justify-between bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
                      {isPrivate ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} className="text-slate-400" />}
                      비공개 설정
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">작성자와 플랫폼 관리자만 본문을 볼 수 있습니다.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-saemaul-green peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                  </label>
                </div>

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    !content.trim() 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-saemaul-green hover:bg-[#007f41] text-white shadow-lg shadow-saemaul-green/20'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      의견 등록하기
                    </>
                  )}
                </button>
              </form>

              {/* 제출 성공 뱃지 */}
              {submitSuccess && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold animate-fadeIn justify-center">
                  <CheckCircle2 size={14} />
                  성공적으로 의견이 등록되었습니다. 감사합니다!
                </div>
              )}
            </div>
          </div>

          {/* 피드백 리스트 (3/5) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-350 border-b border-slate-800 pb-3 flex items-center gap-2">
              주민 의견 목록 ({feedbacks.length})
              {userData && userData.role === 'admin' && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-black">
                  ADMIN VIEWING
                </span>
              )}
            </h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-4 border-slate-800 border-t-saemaul-green rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-bold">의견 목록 로딩 중...</span>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-20 bg-slate-950/20 border border-slate-800/40 rounded-3xl">
                <MessageSquare className="mx-auto text-slate-600 mb-3" size={32} />
                <p className="text-sm text-slate-500 font-bold">아직 접수된 피드백 의견이 없습니다.</p>
                <p className="text-xs text-slate-650 mt-1">첫 번째 소중한 의견의 주인공이 되어주세요!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1 feedback-list-scroll">
                {feedbacks.map((item) => {
                  const hasPermission = checkReadPermission(item);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`feedback-card p-5 rounded-2xl border transition-all ${
                        item.isPrivate 
                          ? 'border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40' 
                          : 'border-slate-800/80 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      {/* 카드 상단 헤더 */}
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2.5">
                          {item.writerPhotoURL ? (
                            <img 
                              src={item.writerPhotoURL} 
                              alt="Avatar" 
                              className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                              <User size={14} />
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-black text-slate-200">{item.writerName}</span>
                            <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock size={9} />
                              {item.createdAt?.seconds 
                                ? new Date(item.createdAt.seconds * 1000).toLocaleString('ko-KR', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  })
                                : '방금 전'
                              }
                            </span>
                          </div>
                        </div>

                        {/* 비공개 뱃지 상태 */}
                        {item.isPrivate && (
                          <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Lock size={9} />
                            비공개
                          </span>
                        )}
                      </div>

                      {/* 의견 본문 렌더링 구역 (권한에 따라 마스킹 분기) */}
                      <div className="text-left text-sm leading-relaxed">
                        {hasPermission ? (
                          <p className="text-slate-300 font-medium whitespace-pre-wrap">{item.content}</p>
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800/80 text-slate-500 rounded-xl text-xs font-semibold">
                            <ShieldAlert size={14} className="text-amber-500/75" />
                            🔒 비공개 의견입니다. (작성자와 관리자만 볼 수 있습니다.)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Feedback;
