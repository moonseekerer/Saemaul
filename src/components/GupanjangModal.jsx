import React, { useState } from 'react';
import { X, Lock, Check, Sparkles, ShoppingCart, Award } from 'lucide-react';
import { BADGES_LIST, TITLES_LIST, BADGE_PREREQUISITES, buyBadge, equipTitle, buyNicknameChangeTicket } from '../utils/points';

export default function GupanjangModal({ isOpen, onClose, currentUser, currentUserData }) {
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'title'
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredTitleId, setHoveredTitleId] = useState(null);

  if (!isOpen) return null;

  const userPoints = currentUserData?.points ?? 0;
  const purchasedBadges = currentUserData?.purchasedBadges ?? [];
  const unlockedTitles = currentUserData?.unlockedTitles ?? ["새마을 새싹"];
  const equippedTitle = currentUserData?.equippedTitle ?? "새마을 새싹";
  const nicknameChangeTickets = currentUserData?.nicknameChangeTickets ?? 0;

  // 1. 뱃지 구매 핸들러
  const handleBuyBadge = async (badge) => {
    if (!currentUser) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    if (userPoints < badge.price) {
      alert("포인트가 부족합니다. 출석체크나 글 작성 등을 통해 포인트를 더 모아보세요!");
      return;
    }

    setIsLoading(true);
    try {
      await buyBadge(currentUser.uid, badge.id, badge.price);
      alert(`🎉 [${badge.name}] 구매가 완료되었습니다! 장착 탭에서 해당 지도자 칭호를 장착해보세요.`);
    } catch (err) {
      console.error(err);
      alert(err.message || "구매 처리 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 칭호 장착 핸들러
  const handleEquipTitle = async (titleId) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await equipTitle(currentUser.uid, titleId);
    } catch (err) {
      console.error(err);
      alert(err.message || "칭호 장착 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 닉네임 변경권 구매 핸들러
  const handleBuyNicknameTicket = async () => {
    if (!currentUser) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    if (userPoints < 50) {
      alert("포인트가 부족합니다. 출석체크나 글 작성 등을 통해 포인트를 더 모아보세요!");
      return;
    }

    setIsLoading(true);
    try {
      await buyNicknameChangeTicket(currentUser.uid);
      alert("🎫 닉네임 변경권 구매가 완료되었습니다!");
    } catch (err) {
      console.error(err);
      alert(err.message || "구매 처리 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자가 획득 가능한 모든 칭호 목록 취합
  const getAllPossibleTitles = () => {
    const normalTitles = TITLES_LIST.map(t => ({
      id: t.id,
      description: t.description,
      hint: t.hint,
      isUnlocked: unlockedTitles.includes(t.id),
      isBadge: false
    }));

    const badgeTitles = BADGES_LIST.map(b => {
      const isPurchased = purchasedBadges.includes(b.id) || b.price === 0;
      return {
        id: b.title,
        description: `${b.name} 보유자에게 부여되는 정식 지도자 직책`,
        hint: `구판장 상점에서 [${b.name}] 구매 시 해금`,
        isUnlocked: isPurchased,
        isBadge: true
      };
    });

    return [...normalTitles, ...badgeTitles];
  };

  const allTitles = getAllPossibleTitles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white/95 text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] animate-scaleUp">
        
        {/* 장식용 레트로 탑 라인 */}
        <div className="h-1.5 w-full bg-saemaul-green" />
        
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-saemaul-green flex items-center justify-center border border-emerald-100">
              <span className="text-2xl">🏪</span>
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                새마을 구판장
                <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 rounded bg-slate-200">Cooperative Store</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">땀 흘려 모은 기여 포인트로 칭호와 뱃지를 획득하세요.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/50 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 내 포인트 정보 바 */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">내 보유 기여 포인트:</span>
            <span className="text-base font-black text-amber-600">💰 {userPoints} P</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-saemaul-green border border-emerald-100 text-[10px] font-black tracking-wider">
            <Sparkles size={10} /> Active Member
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-100 bg-slate-50/20">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3.5 text-center font-black text-xs transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'shop'
                ? 'border-saemaul-green text-saemaul-green bg-saemaul-green/5'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingCart size={14} />
            <span>뱃지 구매</span>
          </button>
          <button
            onClick={() => setActiveTab('title')}
            className={`flex-1 py-3.5 text-center font-black text-xs transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'title'
                ? 'border-saemaul-green text-saemaul-green bg-saemaul-green/5'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Award size={14} />
            <span>칭호 장착</span>
          </button>
        </div>

        {/* 모달 바디 (스크롤 가능 영역) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: 뱃지 상점 */}
          {activeTab === 'shop' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {BADGES_LIST.map((badge) => {
                  const isOwned = purchasedBadges.includes(badge.id) || badge.price === 0;
                  const prerequisite = BADGE_PREREQUISITES[badge.id];
                  const isPrereqOwned = !prerequisite || purchasedBadges.includes(prerequisite);

                  return (
                    <div 
                      key={badge.id}
                      className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                        isOwned 
                          ? 'bg-emerald-50/20 border-emerald-100/50 opacity-80' 
                          : !isPrereqOwned
                          ? 'bg-slate-50/60 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-2xl">{badge.name.split(" ")[0]}</span>
                          {isOwned ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-50 text-saemaul-green border border-emerald-100">
                              보유 중
                            </span>
                          ) : !isPrereqOwned ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 flex items-center gap-1">
                              <Lock size={9} /> 잠김
                            </span>
                          ) : (
                            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100">
                              {badge.price === 0 ? "무료" : `💰 ${badge.price} P`}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-800 mb-1">{badge.name.substring(3)}</h4>
                        <p className={`text-xs text-slate-500 leading-relaxed ${!isOwned && !isPrereqOwned ? 'mb-2' : 'mb-4'}`}>{badge.description}</p>
                        {!isOwned && !isPrereqOwned && (
                          <div className="text-[9px] font-bold text-amber-600 mb-3 flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                            <Lock size={10} className="shrink-0" />
                            <span>선행 뱃지: {prerequisite.replace(" 새마을 뱃지", "")} 뱃지 필요</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleBuyBadge(badge)}
                        disabled={isOwned || !isPrereqOwned || isLoading}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                          isOwned
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : !isPrereqOwned
                            ? 'bg-slate-100/50 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-saemaul-green hover:bg-emerald-600 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {isOwned 
                          ? "보유 중" 
                          : !isPrereqOwned 
                          ? `${prerequisite.replace(" 새마을 뱃지", "")} 필요` 
                          : badge.price === 0 
                          ? "즉시 획득" 
                          : "구매하기"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 구판장 잡화점 (소모품 판매) */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <span>🛍️</span> 구판장 잡화점 (소모품)
                </h4>
                
                <div className="p-5 rounded-2xl border bg-white border-slate-250/80 shadow-sm flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 text-2xl shrink-0">
                      🎫
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-black text-slate-800">주민 닉네임 변경권</h5>
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-50 text-saemaul-green rounded border border-emerald-100">
                          보유: {nicknameChangeTickets}개
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">이웃 주민 명부나 커뮤니티에 표시될 닉네임을 1회 변경할 수 있는 주민권입니다.</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                    <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded">💰 50 P</span>
                    <button
                      onClick={handleBuyNicknameTicket}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-saemaul-green hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      구매하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 칭호 설정 */}
          {activeTab === 'title' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">현재 장착 중인 대표 칭호:</span>
                <span className="font-black text-saemaul-green text-xs px-2.5 py-1 rounded bg-saemaul-green/10 border border-saemaul-green/20">
                  👑 {equippedTitle}
                </span>
              </div>

              <div className="grid gap-3">
                {allTitles.map((title) => {
                  const isCurrent = equippedTitle === title.id;
                  
                  return (
                    <div 
                      key={title.id}
                      className={`relative p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                        title.isUnlocked 
                          ? isCurrent 
                            ? 'bg-saemaul-green/5 border-saemaul-green' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer shadow-sm'
                          : 'bg-slate-50 border-slate-100 opacity-60 select-none'
                      }`}
                      onClick={() => title.isUnlocked && !isCurrent && handleEquipTitle(title.id)}
                      onMouseEnter={() => setHoveredTitleId(title.id)}
                      onMouseLeave={() => setHoveredTitleId(null)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          title.isUnlocked 
                            ? 'bg-emerald-50 text-saemaul-green border border-emerald-100' 
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          {title.isUnlocked ? "👑" : <Lock size={12} />}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-black ${
                              title.isUnlocked ? 'text-slate-800' : 'text-slate-400 line-through'
                            }`}>
                              {title.id}
                            </span>
                            {title.isBadge && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                                지도자 칭호
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{title.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* 해금 힌트 표시 (미획득 시 호버 툴팁) */}
                        {!title.isUnlocked && hoveredTitleId === title.id && (
                          <span className="absolute right-12 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-slate-900 text-[10px] font-bold text-yellow-500 border border-slate-800 shadow-xl max-w-xs text-center z-20 animate-fadeIn">
                            💡 {title.hint}
                          </span>
                        )}
                        {!title.isUnlocked && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                            잠김
                          </span>
                        )}

                        {title.isUnlocked && isCurrent && (
                          <span className="flex items-center gap-1 text-xs font-black text-saemaul-green bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <Check size={12} /> 장착됨
                          </span>
                        )}
                        {title.isUnlocked && !isCurrent && (
                          <span className="text-[10px] font-bold text-slate-500 border border-slate-300 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 transition-colors">
                            장착하기
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
