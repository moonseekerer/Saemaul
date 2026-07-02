import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Shield, Lock, Eye, EyeOff, FileText, Users, Award, PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  toggleFollowUser, 
  updateProfileVisibility, 
  adjustUserPointsByAdmin, 
  updateUserNicknameWithTicket, 
  fetchFollowersList, 
  fetchFollowingList 
} from '../utils/points';

const MOCK_USERS = [
  {
    id: 'mock_laos_leader',
    uid: 'mock_laos_leader',
    displayName: '해외지역 청년지도자',
    email: 'laos_saemaul@community.org',
    role: 'user',
    points: 450,
    totalPoints: 450,
    attendanceCount: 25,
    equippedTitle: '백만 송이 새벽별',
    purchasedBadges: ['기초 새마을 뱃지', '자조 새마을 뱃지', '자립 새마을 뱃지'],
    isProfilePublic: true,
    followerCount: 14,
    followingCount: 8,
    createdAt: { seconds: 1779934800 }
  },
  {
    id: 'mock_gumi_leader',
    uid: 'mock_gumi_leader',
    displayName: '구미지역 청년지도자',
    email: 'gumi_saemaul@community.org',
    role: 'user',
    points: 380,
    totalPoints: 380,
    attendanceCount: 18,
    equippedTitle: '아침을 깨우는 자',
    purchasedBadges: ['기초 새마을 뱃지', '자조 새마을 뱃지'],
    isProfilePublic: true,
    followerCount: 9,
    followingCount: 12,
    createdAt: { seconds: 1780280400 }
  },
  {
    id: 'mock_hope_member',
    uid: 'mock_hope_member',
    displayName: '희망지역 부녀회원',
    email: 'hope_saemaul@community.org',
    role: 'user',
    points: 620,
    totalPoints: 620,
    attendanceCount: 35,
    equippedTitle: '마을의 자랑',
    purchasedBadges: ['기초 새마을 뱃지', '자조 새마을 뱃지', '자립 새마을 뱃지', '자영 새마을 뱃지'],
    isProfilePublic: true,
    followerCount: 28,
    followingCount: 15,
    createdAt: { seconds: 1778984400 }
  }
];

export default function UserProfileModal({ isOpen, onClose, targetUid, currentUser, currentUserData, onChangeUser }) {
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBy, setIsFollowedBy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isMe = currentUser?.uid === targetUid;
  const isAdmin = currentUserData?.role === 'admin';

  // 닉네임 수정 상태
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [newNickInput, setNewNickInput] = useState('');

  // 팔로워/팔로잉 명단 오버레이 상태
  const [activeFollowListTab, setActiveFollowListTab] = useState(null); // null | 'followers' | 'following'
  const [followListUsers, setFollowListUsers] = useState([]);
  const [isFollowListLoading, setIsFollowListLoading] = useState(false);

  // 관리자 포인트 조정 상태
  const [adminPointInput, setAdminPointInput] = useState('');
  const [adminPointReason, setAdminPointReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustMode, setAdjustMode] = useState('give'); // 'give' | 'take'

  // 1. 프로필 실시간 정보 로딩 및 구독
  useEffect(() => {
    if (!targetUid || !isOpen) return;

    setIsLoading(true);
    
    const userDocRef = doc(db, "users", targetUid);
    
    // 실시간 구독
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      } else {
        // Fallback to local mock user if not in Firestore
        const mockUser = MOCK_USERS.find(mu => mu.uid === targetUid);
        setProfileData(mockUser || null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching profile:", err);
      // Fallback to local mock user on error (e.g. permission-denied for visitor)
      const mockUser = MOCK_USERS.find(mu => mu.uid === targetUid);
      setProfileData(mockUser || null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [targetUid, isOpen]);

  // 2. 로그인 유저가 상대방을 팔로우 중인지 및 상대방이 나를 팔로우 중인지 여부 검사
  useEffect(() => {
    if (!currentUser || isMe || !targetUid || !isOpen) {
      setIsFollowing(false);
      setIsFollowedBy(false);
      return;
    }

    const followDocId1 = `${currentUser.uid}_${targetUid}`;
    const followRef1 = doc(db, "follows", followDocId1);
    const unsub1 = onSnapshot(followRef1, (docSnap) => {
      setIsFollowing(docSnap.exists());
    }, (err) => {
      console.error("Error checking follow status:", err);
    });

    const followDocId2 = `${targetUid}_${currentUser.uid}`;
    const followRef2 = doc(db, "follows", followDocId2);
    const unsub2 = onSnapshot(followRef2, (docSnap) => {
      setIsFollowedBy(docSnap.exists());
    }, (err) => {
      console.error("Error checking followedBy status:", err);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [currentUser, targetUid, isMe, isOpen]);

  const handleStartEditNick = () => {
    const tickets = profileData?.nicknameChangeTickets || 0;
    if (tickets <= 0) {
      alert("닉네임을 변경하려면 구판장 잡화점에서 닉네임 변경권(50 P)을 먼저 구매하셔야 합니다. 🏪");
      return;
    }
    setNewNickInput(profileData.displayName || '');
    setIsEditingNick(true);
  };

  const handleSaveNickname = async () => {
    if (!newNickInput.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }
    if (newNickInput.trim().length < 2 || newNickInput.trim().length > 10) {
      alert("닉네임은 2자 이상 10자 이하로 입력해야 합니다.");
      return;
    }
    try {
      setIsLoading(true);
      await updateUserNicknameWithTicket(currentUser.uid, newNickInput.trim());
      alert("닉네임이 성공적으로 변경되었습니다! 🎫");
      setIsEditingNick(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "닉네임 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const canViewFollowLists = isMe || isFollowing || isFollowedBy;

  const handleOpenFollowList = async (type) => {
    if (!canViewFollowLists) {
      alert("이웃 주민을 팔로우하거나 팔로잉을 맺어야 팔로우/팔로워 목록을 볼 수 있습니다. 🤝");
      return;
    }
    setActiveFollowListTab(type);
    setIsFollowListLoading(true);
    try {
      let list = [];
      if (type === 'followers') {
        list = await fetchFollowersList(targetUid);
      } else {
        list = await fetchFollowingList(targetUid);
      }
      setFollowListUsers(list);
    } catch (err) {
      console.error(err);
      alert("목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsFollowListLoading(false);
    }
  };

  if (!isOpen) return null;

  // 3. 팔로우/언팔로우 토글 처리
  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (isMe) return;

    setFollowLoading(true);
    try {
      await toggleFollowUser(currentUser.uid, targetUid);
    } catch (err) {
      console.error(err);
      alert(err.message || "팔로우 처리 중 에러가 발생했습니다.");
    } finally {
      setFollowLoading(false);
    }
  };

  // 4. 내 프로필 공개/비공개 토글 처리
  const handleVisibilityToggle = async () => {
    if (!isMe || !profileData) return;
    const nextState = !profileData.isProfilePublic;
    try {
      await updateProfileVisibility(currentUser.uid, nextState);
    } catch (err) {
      console.error(err);
      alert("프로필 공개 상태 변경에 실패했습니다.");
    }
  };

  const hasAccess = isMe || isAdmin || profileData?.isProfilePublic === true;

  // 5. 관리자 포인트 조정 처리
  const handleAdminPointAdjust = async (e) => {
    e.preventDefault();
    const amount = parseInt(adminPointInput, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('유효한 포인트를 입력해주세요. (양수)');
      return;
    }
    const finalAmount = adjustMode === 'give' ? amount : -amount;
    setIsAdjusting(true);
    try {
      await adjustUserPointsByAdmin(
        currentUser.uid,
        targetUid,
        finalAmount,
        adminPointReason || (adjustMode === 'give' ? '관리자 포인트 지급' : '관리자 포인트 회수')
      );
      alert(`✅ ${profileData?.displayName}님에게 ${finalAmount > 0 ? '+' : ''}${finalAmount} P 처리 완료!`);
      setAdminPointInput('');
      setAdminPointReason('');
    } catch (err) {
      alert(`오류: ${err.message}`);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        
        {/* 모달 헤더 바 */}
        <div className="h-1.5 w-full bg-saemaul-green" />
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">주민 인적사항</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-saemaul-green animate-spin" />
            <span>주민 대장 열람 중...</span>
          </div>
        ) : !profileData ? (
          <div className="p-12 text-center text-slate-400 font-semibold">
            가입되지 않았거나 프로필이 존재하지 않는 주민입니다.
          </div>
        ) : (
          <div className="p-6">
            
            {/* 상단 기본 프로필 영역 */}
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={profileData.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileData.uid}`} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-2 border-saemaul-green shadow-sm"
              />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditingNick ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text"
                        value={newNickInput}
                        onChange={(e) => setNewNickInput(e.target.value)}
                        className="border border-slate-200 rounded px-2 py-0.5 text-xs font-bold w-24 sm:w-28 focus:outline-none focus:border-saemaul-green bg-white text-slate-800"
                        required
                      />
                      <button onClick={handleSaveNickname} className="text-[10px] font-black text-saemaul-green hover:underline cursor-pointer">저장</button>
                      <button onClick={() => setIsEditingNick(false)} className="text-[10px] font-black text-slate-400 hover:underline cursor-pointer">취소</button>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-lg font-black text-slate-800 truncate">{profileData.displayName}</h4>
                      {isMe && (
                        <button 
                          onClick={handleStartEditNick}
                          className="text-xs text-slate-400 hover:text-saemaul-green cursor-pointer"
                          title="닉네임 변경 (변경권 필요)"
                        >
                          ✏️
                        </button>
                      )}
                    </>
                  )}
                  {profileData.role === 'admin' && (
                    <span className="flex items-center gap-0.5 text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
                      <Shield size={10} /> 관리자
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{profileData.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-saemaul-green border border-emerald-100 text-[10px] font-black">
                  👑 {profileData.equippedTitle || "새마을 새싹"}
                </div>
              </div>
              
              {/* 관리자 열람 권한 표시 */}
              {isAdmin && !isMe && !profileData.isProfilePublic && (
                <div className="text-[9px] font-black bg-red-50 text-red-500 border border-red-200 px-2 py-1 rounded absolute top-16 right-6 flex items-center gap-1">
                  <Lock size={10} /> 관리자 열람 모드
                </div>
              )}
            </div>

            {/* 비공개 상태일 때 가드 렌더링 */}
            {!hasAccess ? (
              <div className="py-8 px-6 bg-slate-50 rounded-2xl border border-slate-200/60 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-4">
                  <Lock size={20} />
                </div>
                <h5 className="font-black text-slate-800 text-sm">비공개 프로필</h5>
                <p className="text-slate-400 text-xs mt-1.5 max-w-xs leading-relaxed font-semibold">
                  해당 회원이 프로필을 비공개로 설정하였습니다. 정보 보호를 위해 열람이 제한됩니다.
                </p>
                {!isMe && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`mt-6 px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      isFollowing 
                        ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' 
                        : 'bg-saemaul-green text-white hover:bg-emerald-600 shadow-saemaul-green/20'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={14} />
                        <span>팔로잉 중</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>팔로우</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              // 공개 상태 또는 열람 권한 보유 시 세부 렌더링
              activeFollowListTab ? (
                <div className="space-y-4">
                  {/* 헤더 및 뒤로가기 */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setActiveFollowListTab(null)}
                        className="text-xs font-black text-slate-500 hover:text-saemaul-green flex items-center gap-1 cursor-pointer"
                      >
                        ← 뒤로
                      </button>
                      <span className="text-xs font-black text-slate-800">
                        {activeFollowListTab === 'followers' ? '팔로워 주민 명단' : '팔로잉 주민 명단'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-black">총 {followListUsers.length}명</span>
                  </div>

                  {/* 목록 */}
                  <div className="overflow-y-auto max-h-[300px] space-y-2 animate-fadeIn">
                    {isFollowListLoading ? (
                      <div className="py-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-saemaul-green animate-spin" />
                        <span className="text-xs">명단 불러오는 중...</span>
                      </div>
                    ) : followListUsers.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs font-black">
                        등록된 이웃 주민이 없습니다.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {followListUsers.map((item) => (
                          <div 
                            key={item.uid}
                            onClick={() => {
                              setActiveFollowListTab(null);
                              if (onChangeUser) onChangeUser(item.uid);
                            }}
                            className="flex items-center justify-between py-2.5 px-1 hover:bg-slate-50 rounded-xl cursor-pointer group transition-all"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <img 
                                src={item.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.uid}`} 
                                alt="Profile" 
                                className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
                              />
                              <div className="overflow-hidden">
                                <span className="text-xs font-black text-slate-700 group-hover:text-saemaul-green truncate block">
                                  {item.displayName || "익명의 주민"}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold block">
                                  👑 {item.equippedTitle || "새마을 새싹"}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded shrink-0">
                              💰 {item.points || 0} P
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* 1. 수치 지표 (게시물, 팔로워, 팔로잉) */}
                  <div className="grid grid-cols-3 border-y border-slate-100 py-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-slate-800">{profileData.postCount || 0}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                        <FileText size={10} /> 게시글
                      </span>
                    </div>
                    <div 
                      onClick={() => handleOpenFollowList('followers')}
                      className="flex flex-col items-center justify-center border-x border-slate-100 cursor-pointer group/item"
                      title="팔로워 명단 조회"
                    >
                      <span className="text-lg font-black text-slate-800 group-hover/item:text-saemaul-green group-hover/item:underline">{profileData.followerCount || 0}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1 group-hover/item:text-saemaul-green">
                        <Users size={10} /> 팔로워
                      </span>
                    </div>
                    <div 
                      onClick={() => handleOpenFollowList('following')}
                      className="flex flex-col items-center justify-center cursor-pointer group/item"
                      title="팔로잉 명단 조회"
                    >
                      <span className="text-lg font-black text-slate-800 group-hover/item:text-saemaul-green group-hover/item:underline">{profileData.followingCount || 0}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1 group-hover/item:text-saemaul-green">
                        <Users size={10} /> 팔로잉
                      </span>
                    </div>
                  </div>

                {/* 2. 기여 세부 정보 */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">보유 기여 포인트</span>
                    <span className="font-black text-slate-700">💰 {profileData.points || 0} P</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">누적 획득 포인트</span>
                    <span className="font-black text-slate-700">🏆 {profileData.totalPoints || 0} P</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">누적 출석 횟수</span>
                    <span className="font-black text-slate-700">📅 {profileData.attendanceCount || 0}회</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">오독 정정 승인 건수</span>
                    <span className="font-black text-slate-700">🔍 {profileData.approvedFixCount || 0}건</span>
                  </div>
                </div>

                {/* 3. 보유한 칭호 리스트 */}
                <div>
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <Award size={12} className="text-saemaul-green" /> 획득한 칭호
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(profileData.unlockedTitles || ["새마을 새싹"]).map((title, idx) => (
                      <span 
                        key={idx} 
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                          profileData.equippedTitle === title 
                            ? 'bg-saemaul-green/10 border-saemaul-green/30 text-saemaul-green font-black' 
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. 액션 버튼 (팔로우 토글 or 공개 여부 제어) */}
                <div className="pt-2">
                  {isMe ? (
                    // 내 프로필일 때 공개/비공개 설정
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <div className="flex items-center gap-2">
                        {profileData.isProfilePublic ? (
                          <Eye size={16} className="text-saemaul-green" />
                        ) : (
                          <EyeOff size={16} className="text-slate-400" />
                        )}
                        <span className="text-xs font-black text-slate-700">프로필 타인 공개 설정</span>
                      </div>
                      <button
                        onClick={handleVisibilityToggle}
                        className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none cursor-pointer ${
                          profileData.isProfilePublic ? 'bg-saemaul-green' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-all duration-300 ${
                          profileData.isProfilePublic ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ) : (
                    // 타인 프로필일 때 팔로우 신청/취소
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98] ${
                        isFollowing 
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200' 
                          : 'bg-saemaul-green text-white hover:bg-emerald-600 shadow-saemaul-green/20'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={16} />
                          <span>팔로잉 중</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>팔로우 하기</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* 5. 관리자 전용 포인트 조정 패널 */}
                {isAdmin && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h5 className="text-xs font-black text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Shield size={12} /> 관리자 포인트 조정
                    </h5>
                    <form onSubmit={handleAdminPointAdjust} className="flex flex-col gap-2.5">
                      {/* 지급 / 회수 모드 선택 */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAdjustMode('give')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                            adjustMode === 'give'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <PlusCircle size={13} /> 포인트 지급
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustMode('take')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                            adjustMode === 'take'
                              ? 'bg-red-50 border-red-300 text-red-600'
                              : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <MinusCircle size={13} /> 포인트 회수
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="포인트 (P)"
                          value={adminPointInput}
                          onChange={(e) => setAdminPointInput(e.target.value)}
                          className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-saemaul-green"
                          required
                        />
                        <input
                          type="text"
                          placeholder="사유 (선택)"
                          value={adminPointReason}
                          onChange={(e) => setAdminPointReason(e.target.value)}
                          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-saemaul-green"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAdjusting || !adminPointInput}
                        className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                          adjustMode === 'give'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                        }`}
                      >
                        {isAdjusting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          adjustMode === 'give' ? `+${adminPointInput || 0} P 지급하기` : `-${adminPointInput || 0} P 회수하기`
                        )}
                      </button>
                    </form>
                  </div>
                )}

                  </div>
                )
              )}
 
            </div>
        )}

      </div>
    </div>
  );
}
