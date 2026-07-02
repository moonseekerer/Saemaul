import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ensureUserProfile } from '../utils/points';

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'nickname'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  
  // Google 신규 가입자 닉네임 설정을 위한 임시 저장용
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // 1. 이메일 로그인 처리
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 이메일 인증 여부 검사 (강제하진 않고 경고만 출력)
      if (!user.emailVerified) {
        setSuccessMsg('로그인되었습니다! (주의: 이메일 인증이 완료되지 않았습니다. 인증번호가 아닌 발송된 [인증 메일의 링크]를 클릭해야 완료됩니다. 메일이 오지 않았다면 스팸 메일함을 꼭 확인해 주세요.)');
      } else {
        setSuccessMsg('로그인에 성공했습니다!');
      }
      
      // 약간의 딜레이 후 닫기
      setTimeout(() => {
        onClose();
        window.location.reload(); // 세션 동기화 및 페이지 리프레시
      }, 1500);

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('이메일 혹은 비밀번호가 일치하지 않습니다.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('유효하지 않은 이메일 형식입니다.');
      } else {
        setErrorMsg(err.message || '로그인에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 이메일 회원가입 처리
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    if (nickname.trim().length < 2 || nickname.trim().length > 10) {
      setErrorMsg('닉네임은 2자 이상 10자 이하로 입력해 주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Auth Profile 디스플레이 네임 업데이트
      await updateProfile(user, {
        displayName: nickname.trim()
      });

      // 2. Firestore 유저 레코드 생성
      await ensureUserProfile(user.uid, nickname.trim(), user.email);

      // 3. 인증 이메일 발송
      await sendEmailVerification(user);

      setSuccessMsg('회원가입에 성공했습니다! 입력하신 이메일로 인증 메일이 발송되었습니다. [메일함에 도착한 링크]를 클릭하면 인증이 완료됩니다. 메일이 보이지 않을 경우 반드시 스팸 메일함을 확인해 주세요.');

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 3000);

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('이미 사용 중인 이메일 주소입니다.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      } else {
        setErrorMsg(err.message || '회원가입에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 구글 로그인 및 신규가입 감지 처리
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore에 해당 유저 프로필이 존재하는지 체크
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // 신규 구글 가입자 -> 닉네임 설정 탭으로 전환
        setPendingGoogleUser(user);
        setActiveTab('nickname');
      } else {
        setSuccessMsg('성공적으로 로그인되었습니다!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error("Google Login failed:", err);
      setErrorMsg('구글 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 구글 신규가입자 커스텀 닉네임 최종 등록
  const handleGoogleNicknameSubmit = async (e) => {
    e.preventDefault();
    if (!pendingGoogleUser) return;
    
    setIsLoading(true);
    setErrorMsg('');
    
    if (nickname.trim().length < 2 || nickname.trim().length > 10) {
      setErrorMsg('닉네임은 2자 이상 10자 이하로 입력해 주세요.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Auth Profile 업데이트
      await updateProfile(pendingGoogleUser, {
        displayName: nickname.trim()
      });

      // 2. Firestore 프로필 최종 삽입
      await ensureUserProfile(pendingGoogleUser.uid, nickname.trim(), pendingGoogleUser.email);
      
      setSuccessMsg('닉네임 설정이 완료되어 가입이 성공적으로 완료되었습니다! 🌱');
      
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMsg('닉네임 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white/95 text-slate-800 rounded-[28px] shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh]">
        
        {/* 상단 디자인 라인 */}
        <div className="h-1.5 w-full bg-saemaul-green" />

        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔑</span>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {activeTab === 'login' && '로그인'}
                {activeTab === 'signup' && '주민 등록 (회원가입)'}
                {activeTab === 'nickname' && '익명 닉네임 설정'}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {activeTab === 'login' && '새마을 주민 계정으로 접속해 보세요.'}
                {activeTab === 'signup' && '주민이 되어 마을 기여도를 쌓아보세요.'}
                {activeTab === 'nickname' && '주민 명부에 노출될 닉네임을 설정해 주세요.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 바디 에러/성공 메시지 */}
        <div className="px-6 pt-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold animate-shake">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-semibold">
              <ShieldCheck size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* 탭 네비게이션 (로그인 / 회원가입) */}
        {activeTab !== 'nickname' && (
          <div className="flex border-b border-slate-100 mt-2 bg-slate-50/50">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center text-xs font-black transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'text-saemaul-green border-b-2 border-saemaul-green bg-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center text-xs font-black transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'text-saemaul-green border-b-2 border-saemaul-green bg-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              주민 등록
            </button>
          </div>
        )}

        {/* 본문 콘텐츠 */}
        <div className="p-6 overflow-y-auto">

          {/* 1. 로그인 폼 */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">이메일 주소</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email"
                    required
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-saemaul-green"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">비밀번호</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-saemaul-green"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-saemaul-green hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                로그인 완료
              </button>
            </form>
          )}

          {/* 2. 회원가입 폼 */}
          {activeTab === 'signup' && (
            <form onSubmit={handleEmailSignup} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">이메일 주소</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email"
                    required
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-saemaul-green"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">주민 대표 닉네임</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="주민명부 노출용 (2~10자)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-saemaul-green"
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1">⚠️ 소셜명(실명) 노출이 우려되면 꼭 고유 닉네임으로 설정하세요.</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">비밀번호 (6자 이상)</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-saemaul-green"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">비밀번호 재확인</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-saemaul-green"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-saemaul-green hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                주민 가입 승인 신청
              </button>
            </form>
          )}

          {/* 3. 최초 구글 가입자 닉네임 설정 폼 */}
          {activeTab === 'nickname' && (
            <form onSubmit={handleGoogleNicknameSubmit} className="space-y-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <Sparkles size={24} className="text-saemaul-green shrink-0" />
                <p className="text-[11px] text-[#00843D] font-bold leading-relaxed">
                  구글 계정 연동을 완료했습니다! 실명 노출을 원치 않으시면, 아래 주민 명부에 등록할 **대표 닉네임**을 지정해 주세요.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">주민 대표 닉네임</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="닉네임 입력 (2~10자)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-saemaul-green"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-saemaul-green hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                설정 완료 및 주민 등록
              </button>
            </form>
          )}

          {/* 소셜 로그인 통합 버튼 (최초 가입자 설정 폼이 아닐 때만 노출) */}
          {activeTab !== 'nickname' && (
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase mb-3.5 block">간편 연동 로그인</span>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google 계정으로 시작하기</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
