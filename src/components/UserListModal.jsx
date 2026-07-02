import React, { useState, useEffect } from 'react';
import { X, Search, Award, TrendingUp, Users, Calendar, Shield } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

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

export default function UserListModal({ isOpen, onClose, currentUser, onSelectUser }) {
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ranking'); // 'ranking' | 'followers' | 'newest'
  const [isLoading, setIsLoading] = useState(true);

  // 1. 전체 가입 사용자 로드
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        let q;
        if (currentUser && currentUser.email === 'anstlr6665@gmail.com') {
          q = collection(db, "users");
        } else {
          q = query(collection(db, "users"), where("isProfilePublic", "==", true));
        }
        const querySnapshot = await getDocs(q);
        const list = [];
        const seenUids = new Set();
        
        querySnapshot.forEach((doc) => {
          const uData = doc.data();
          list.push({ id: doc.id, ...uData });
          if (uData.uid) {
            seenUids.add(uData.uid);
          }
        });

        // Append mock users if they are not already in the Firestore database
        MOCK_USERS.forEach((mu) => {
          if (!seenUids.has(mu.uid)) {
            list.push(mu);
          }
        });

        setUsersList(list);
      } catch (err) {
        console.error("Error fetching users list:", err);
        // Fallback to mock users on error so that the modal shows at least the mocks instead of empty screen
        setUsersList(MOCK_USERS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // 2. 검색어 필터링
  const filteredUsers = usersList.filter(u => {
    const name = u.displayName || '';
    const email = u.email || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  // 3. 정렬 로직 적용
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'ranking') {
      // 랭킹 순: totalPoints 내림차순, 같으면 points 내림차순
      const pointsA = a.totalPoints ?? a.points ?? 0;
      const pointsB = b.totalPoints ?? b.points ?? 0;
      return pointsB - pointsA;
    } else if (sortBy === 'followers') {
      // 팔로워 많은 순
      const followersA = a.followerCount ?? 0;
      const followersB = b.followerCount ?? 0;
      return followersB - followersA;
    } else if (sortBy === 'newest') {
      // 최신 가입 순: createdAt 내림차순
      const dateA = a.createdAt?.seconds ?? 0;
      const dateB = b.createdAt?.seconds ?? 0;
      return dateB - dateA;
    }
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
        
        {/* 장식용 레트로 띠 */}
        <div className="h-1.5 w-full bg-saemaul-green" />

        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">새마을 주민 명부</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">자랑스러운 기여 랭킹과 이웃 주민들을 찾아보세요.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 검색창 및 정렬 제어 */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
          {/* 검색창 */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="이웃 주민 이름 또는 이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-saemaul-green bg-white shadow-sm"
            />
          </div>

          {/* 정렬 탭 버튼들 */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('ranking')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sortBy === 'ranking'
                  ? 'border-saemaul-green bg-saemaul-green/10 text-saemaul-green'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-500'
              }`}
            >
              <TrendingUp size={14} />
              <span>기여도 랭킹</span>
            </button>
            <button
              onClick={() => setSortBy('followers')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sortBy === 'followers'
                  ? 'border-saemaul-green bg-saemaul-green/10 text-saemaul-green'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-500'
              }`}
            >
              <Users size={14} />
              <span>인기 주민</span>
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sortBy === 'newest'
                  ? 'border-saemaul-green bg-saemaul-green/10 text-saemaul-green'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-500'
              }`}
            >
              <Calendar size={14} />
              <span>신규 가입</span>
            </button>
          </div>
        </div>

        {/* 주민 리스트 바디 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-saemaul-green animate-spin" />
              <span className="text-sm">주민들 명단을 읽어오는 중...</span>
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold text-sm">
              조건에 부합하는 주민이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedUsers.map((userItem, idx) => {
                // 등수 계산
                const rankNum = idx + 1;
                const points = userItem.totalPoints ?? userItem.points ?? 0;
                
                return (
                  <div 
                    key={userItem.id}
                    onClick={() => onSelectUser(userItem.uid)}
                    className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 transition-all rounded-2xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* 등수 뱃지 (기여도 랭킹 탭이고 검색하지 않았을 때만 강조) */}
                      {sortBy === 'ranking' && searchQuery === '' ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          rankNum === 1 ? 'bg-yellow-400 text-yellow-950' :
                          rankNum === 2 ? 'bg-slate-300 text-slate-800' :
                          rankNum === 3 ? 'bg-amber-600 text-amber-50' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {rankNum}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                          🏡
                        </div>
                      )}

                      {/* 주민 요약 정보 */}
                      <img 
                        src={userItem.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userItem.uid}`} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full border border-slate-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-800 group-hover:text-saemaul-green transition-colors truncate text-sm">
                            {userItem.displayName || "익명의 주민"}
                          </span>
                          {userItem.role === 'admin' && (
                            <Shield size={12} className="text-blue-500 shrink-0" />
                          )}
                          {!userItem.isProfilePublic && (
                            <span className="text-[8px] font-bold px-1 py-0.2 bg-slate-100 text-slate-400 rounded shrink-0">
                              비공개
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <Award size={10} className="text-saemaul-green" />
                          <span>{userItem.equippedTitle || "새마을 새싹"}</span>
                        </p>
                      </div>
                    </div>

                    {/* 수치 표시 영역 */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-700">💰 {points} P</div>
                      <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                        👥 {userItem.followerCount ?? 0} 팔로워
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
