import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  runTransaction,
  increment
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { updateProfile } from "firebase/auth";

// 각 활동별 획득 포인트 상수
export const POINT_VALUES = {
  attendance: 10,
  attendance_weekly: 50,
  attendance_monthly: 200,
  error_suggest: 5,
  error_approve: 50,
  quiz: 20,
  post: 15,
  comment: 5
};

// 칭호 목록 및 해금 조건 & 설명
export const TITLES_LIST = [
  { id: "새마을 새싹", description: "새마을운동 아카이브에 첫발을 디딘 주민", hint: "가입 시 자동 지급" },
  { id: "아침을 깨우는 자", description: "부지런히 아침을 열며 출석을 이어가는 분", hint: "누적 출석 7회 달성" },
  { id: "백만 송이 새벽별", description: "마을의 어둠을 밝히는 성실함의 상징", hint: "누적 출석 30회 달성" },
  { id: "마을 대변인", description: "이웃과의 소통에 첫걸음을 뗀 대변인", hint: "첫 글 또는 첫 댓글 작성" },
  { id: "따뜻한 이웃", description: "마을 주민들에게 따뜻한 호응을 받는 분", hint: "내가 쓴 글/댓글 총 좋아요 10개 획득" },
  { id: "마을의 자랑", description: "새마을 공동체의 중심이 된 최고 인기 지도자", hint: "내가 쓴 글/댓글 총 좋아요 30개 획득" },
  { id: "기록 복원가", description: "잃어버린 새마을 기록을 최초 복원한 주민", hint: "오독 정정 최종 승인 1회 달성" },
  { id: "역사 편찬위원", description: "지속적으로 자료를 올바르게 고치는 편집가", hint: "오독 정정 최종 승인 5회 달성" },
  { id: "새마을의 눈", description: "역사를 바로 세우는 데 크게 기여한 지식의 감시자", hint: "오독 정정 최종 승인 15회 달성" }
];

// 뱃지 상점 품목 리스트
export const BADGES_LIST = [
  { id: "기초 새마을 뱃지", name: "🌱 기초 새마을 뱃지", title: "[기초] 새마을지도자", price: 0, description: "기본으로 주어지는 기초 단계 지도자 뱃지" },
  { id: "자조 새마을 뱃지", name: "🛠️ 자조 새마을 뱃지", title: "[자조] 새마을지도자", price: 100, description: "자조 정신을 발휘하는 단계의 지도자 뱃지" },
  { id: "자립 새마을 뱃지", name: "🌾 자립 새마을 뱃지", title: "[자립] 새마을지도자", price: 300, description: "스스로 일어서는 자립 단계의 지도자 뱃지" },
  { id: "자영 새마을 뱃지", name: "🏘️ 자영 새마을 뱃지", title: "[자영] 새마을지도자", price: 600, description: "마을을 주도적으로 경영하는 자영 단계 지도자 뱃지" },
  { id: "복지 새마을 뱃지", name: "🏆 복지 새마을 뱃지", title: "[복지] 새마을지도자", price: 1000, description: "함께 잘사는 복지 사회를 구현한 영예로운 뱃지" }
];

// 뱃지 선행 구매 요건
export const BADGE_PREREQUISITES = {
  "자조 새마을 뱃지": "기초 새마을 뱃지",
  "자립 새마을 뱃지": "자조 새마을 뱃지",
  "자영 새마을 뱃지": "자립 새마을 뱃지",
  "복지 새마을 뱃지": "자영 새마을 뱃지"
};

// 날짜 유틸리티
function getKstDate(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  // KST로 변환 (UTC + 9시간)
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (3600000 * 9));
  return kst;
}

function getTodayString() {
  const kst = getKstDate();
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getYesterdayString() {
  const kst = getKstDate(-1);
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 로그인 시 사용자의 출석 체크를 검사하고 유저 프로필을 생성/동기화하는 함수
 * @param {string} uid 사용자 UID
 * @param {string} displayName 표시 이름
 * @param {string} email 이메일 주소
 * @returns {Promise<{attendanceAwarded: boolean, firstLogin: boolean, pointsEarned: number, unlockedTitles: string[], consecutiveDays: number}>}
 */
export async function checkAndProcessAttendance(uid, displayName, email) {
  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();
  const currentMonthStr = todayStr.substring(0, 7); // "YYYY-MM"

  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  // 1. 신규 회원가입 처리 (최초 로그인)
  if (!userDoc.exists()) {
    const defaultProfile = {
      uid,
      displayName: displayName || "익명의 주민",
      email: email || "",
      role: email === import.meta.env.VITE_ADMIN_EMAIL ? 'admin' : 'user', // 관리자 지정 이메일 예외 처리
      points: POINT_VALUES.attendance,
      totalPoints: POINT_VALUES.attendance,
      attendanceCount: 1,
      consecutiveAttendance: 1,
      monthlyAttendanceCount: 1,
      lastAttendanceDate: todayStr,
      unlockedTitles: ["새마을 새싹"],
      equippedTitle: "새마을 새싹",
      purchasedBadges: ["기초 새마을 뱃지"],
      isProfilePublic: true,
      postCount: 0,
      commentCount: 0,
      approvedFixCount: 0,
      receivedLikeCount: 0,
      followerCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp()
    };

    await setDoc(userRef, defaultProfile);

    // 포인트 기록 생성
    const historyId = `${uid}_attendance_${Date.now()}`;
    await setDoc(doc(db, "point_history", historyId), {
      uid,
      activityType: 'attendance',
      pointsEarned: POINT_VALUES.attendance,
      timestamp: serverTimestamp()
    });

    return {
      attendanceAwarded: true,
      firstLogin: true,
      pointsEarned: POINT_VALUES.attendance,
      unlockedTitles: [],
      consecutiveDays: 1
    };
  }

  // 2. 기존 사용자 출석 검사
  const userData = userDoc.data();
  const lastAttendanceDate = userData.lastAttendanceDate || "";

  // 오늘 이미 출석체크를 했다면 패스
  if (lastAttendanceDate === todayStr) {
    return {
      attendanceAwarded: false,
      firstLogin: false,
      pointsEarned: 0,
      unlockedTitles: [],
      consecutiveDays: userData.consecutiveAttendance || 1
    };
  }

  // 출석체크 포인트 연동 트랜잭션
  return await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const uData = userSnap.data();

    const currentPoints = uData.points || 0;
    const currentTotalPoints = uData.totalPoints || 0;
    const lastDate = uData.lastAttendanceDate || "";

    // 연속 출석 검사
    let consecutive = uData.consecutiveAttendance || 0;
    if (lastDate === yesterdayStr) {
      consecutive += 1;
    } else {
      consecutive = 1; // 연속 출석 깨짐
    }

    // 당월 출석 횟수 검사
    const lastMonthStr = lastDate.substring(0, 7);
    let monthlyCount = uData.monthlyAttendanceCount || 0;
    if (lastMonthStr === currentMonthStr) {
      monthlyCount += 1;
    } else {
      monthlyCount = 1; // 새로운 달 시작
    }

    // 기본 출석 포인트
    let pointsToEarn = POINT_VALUES.attendance;
    let awardedWeeklyBonus = false;
    let awardedMonthlyBonus = false;

    // 주간 연속 보너스 검사 (7일 연속 마다)
    if (consecutive % 7 === 0) {
      pointsToEarn += POINT_VALUES.attendance_weekly;
      awardedWeeklyBonus = true;
    }

    // 월간 출석 보너스 검사 (누적 25일 출석 시 1회만 지급)
    if (monthlyCount === 25) {
      pointsToEarn += POINT_VALUES.attendance_monthly;
      awardedMonthlyBonus = true;
    }

    // 유저 프로필 업데이트
    transaction.update(userRef, {
      points: currentPoints + pointsToEarn,
      totalPoints: currentTotalPoints + pointsToEarn,
      attendanceCount: increment(1),
      consecutiveAttendance: consecutive,
      monthlyAttendanceCount: monthlyCount,
      lastAttendanceDate: todayStr
    });

    // 포인트 기록 로깅
    const timestamp = serverTimestamp();
    
    // 1. 기본 출석 로그
    const baseHistoryId = `${uid}_attendance_${Date.now()}`;
    transaction.set(doc(db, "point_history", baseHistoryId), {
      uid,
      activityType: 'attendance',
      pointsEarned: POINT_VALUES.attendance,
      timestamp
    });

    // 2. 주간 보너스 로그
    if (awardedWeeklyBonus) {
      const weeklyHistoryId = `${uid}_attendance_weekly_${Date.now()}`;
      transaction.set(doc(db, "point_history", weeklyHistoryId), {
        uid,
        activityType: 'attendance_weekly',
        pointsEarned: POINT_VALUES.attendance_weekly,
        timestamp
      });
    }

    // 3. 월간 보너스 로그
    if (awardedMonthlyBonus) {
      const monthlyHistoryId = `${uid}_attendance_monthly_${Date.now()}`;
      transaction.set(doc(db, "point_history", monthlyHistoryId), {
        uid,
        activityType: 'attendance_monthly',
        pointsEarned: POINT_VALUES.attendance_monthly,
        timestamp
      });
    }

    return {
      attendanceAwarded: true,
      firstLogin: false,
      pointsEarned: pointsToEarn,
      consecutiveDays: consecutive
    };
  }).then(async (result) => {
    if (result.attendanceAwarded) {
      // 칭호 해금 체크
      const unlocked = await checkAndUnlockTitles(uid);
      return { ...result, unlockedTitles: unlocked };
    }
    return { ...result, unlockedTitles: [] };
  });
}

/**
 * 1일 글/댓글 작성 포인트 적립 한도를 체크하고 적립하는 함수
 * @param {string} uid 사용자 UID
 * @param {string} activityType 'post' | 'comment'
 * @returns {Promise<{success: boolean, pointsEarned: number, unlockedTitles: string[]}>}
 */
export async function addPointWithLimit(uid, activityType) {
  if (activityType !== 'post' && activityType !== 'comment') {
    throw new Error("Invalid activity type for limit check");
  }

  const todayStr = getTodayString();
  const limit = activityType === 'post' ? 3 : 10;
  const points = activityType === 'post' ? POINT_VALUES.post : POINT_VALUES.comment;

  return await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User document does not exist");
    }

    const userData = userSnap.data();
    const currentPoints = userData.points || 0;
    const currentTotalPoints = userData.totalPoints || 0;
    const postCount = userData.postCount || 0;
    const commentCount = userData.commentCount || 0;

    let dailyCount = 0;
    let lastDate = "";

    if (activityType === 'post') {
      dailyCount = userData.dailyPostCount || 0;
      lastDate = userData.lastPostDate || "";
    } else {
      dailyCount = userData.dailyCommentCount || 0;
      lastDate = userData.lastCommentDate || "";
    }

    // Reset daily count if date has changed
    if (lastDate !== todayStr) {
      dailyCount = 0;
    }

    if (dailyCount >= limit) {
      return { success: false, pointsEarned: 0 };
    }

    const newDailyCount = dailyCount + 1;
    const updateFields = {
      points: currentPoints + points,
      totalPoints: currentTotalPoints + points,
    };

    if (activityType === 'post') {
      updateFields.postCount = postCount + 1;
      updateFields.dailyPostCount = newDailyCount;
      updateFields.lastPostDate = todayStr;
    } else {
      updateFields.commentCount = commentCount + 1;
      updateFields.dailyCommentCount = newDailyCount;
      updateFields.lastCommentDate = todayStr;
    }

    transaction.update(userRef, updateFields);

    // Write point history log
    const historyId = `${uid}_${activityType}_${Date.now()}`;
    const newLogRef = doc(collection(db, "point_history"), historyId);
    transaction.set(newLogRef, {
      uid,
      activityType,
      pointsEarned: points,
      timestamp: serverTimestamp()
    });

    return { success: true, pointsEarned: points };
  }).then(async (result) => {
    if (result.success) {
      const unlocked = await checkAndUnlockTitles(uid);
      return { ...result, unlockedTitles: unlocked };
    }
    return { ...result, unlockedTitles: [] };
  });
}

/**
 * 제한 없는 활동(출석, 정정, 퀴즈)에 대한 포인트 지급 처리
 * @param {string} uid 사용자 UID
 * @param {string} activityType 활동 종류
 * @param {number|null} customPoints 임의 포인트 지정 시 사용
 */
export async function addPoint(uid, activityType, customPoints = null) {
  const points = customPoints !== null ? customPoints : (POINT_VALUES[activityType] || 0);
  if (points === 0) return { success: false, pointsEarned: 0, unlockedTitles: [] };

  return await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }

    const userData = userDoc.data();
    const currentPoints = userData.points || 0;
    const currentTotalPoints = userData.totalPoints || 0;

    const updateFields = {
      points: currentPoints + points,
      totalPoints: currentTotalPoints + points
    };

    if (activityType === 'attendance') {
      updateFields.attendanceCount = increment(1);
    } else if (activityType.startsWith('attendance_')) {
      // 보너스 출석은 attendanceCount를 올리지 않음 (포인트만 추가)
    } else if (activityType === 'error_approve') {
      updateFields.approvedFixCount = increment(1);
    }

    transaction.update(userRef, updateFields);

    const historyId = `${uid}_${activityType}_${Date.now()}`;
    const newLogRef = doc(collection(db, "point_history"), historyId);
    transaction.set(newLogRef, {
      uid,
      activityType,
      pointsEarned: points,
      timestamp: serverTimestamp()
    });

    return { success: true, pointsEarned: points };
  }).then(async (result) => {
    if (result.success) {
      const unlocked = await checkAndUnlockTitles(uid);
      return { ...result, unlockedTitles: unlocked };
    }
    return { ...result, unlockedTitles: [] };
  });
}

/**
 * 구판장에서 뱃지 구매
 */
export async function buyBadge(uid, badgeId, price) {
  return await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const userData = userDoc.data();
    const currentPoints = userData.points || 0;
    const purchasedBadges = userData.purchasedBadges || [];

    if (currentPoints < price) {
      throw new Error("포인트가 부족합니다.");
    }

    if (purchasedBadges.includes(badgeId)) {
      throw new Error("이미 보유하고 있는 뱃지입니다.");
    }

    // 선행 단계 뱃지 소유 검사
    const prerequisite = BADGE_PREREQUISITES[badgeId];
    if (prerequisite && !purchasedBadges.includes(prerequisite)) {
      throw new Error(`이전 단계인 [${prerequisite}]를 먼저 획득/구매하셔야 합니다.`);
    }

    // 포인트 차감 및 인벤토리 추가
    transaction.update(userRef, {
      points: currentPoints - price,
      purchasedBadges: [...purchasedBadges, badgeId]
    });

    // 포인트 차감 내역 로깅
    const historyId = `${uid}_buy_badge_${badgeId}_${Date.now()}`;
    const newLogRef = doc(collection(db, "point_history"), historyId);
    transaction.set(newLogRef, {
      uid,
      activityType: 'buy_badge',
      badgeId,
      pointsEarned: -price,
      timestamp: serverTimestamp()
    });

    return { success: true };
  });
}

/**
 * 대표 칭호 장착 처리
 */
export async function equipTitle(uid, titleId) {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }

  const userData = userDoc.data();
  const unlockedTitles = userData.unlockedTitles || [];
  const purchasedBadges = userData.purchasedBadges || [];

  // 장착하려는 칭호가 일반 칭호 목록에 있거나, 혹은 뱃지 칭호인지 확인
  const isBadgeTitle = BADGES_LIST.some(badge => badge.title === titleId && purchasedBadges.includes(badge.id));
  const isUnlockedNormal = unlockedTitles.includes(titleId);

  if (!isUnlockedNormal && !isBadgeTitle && titleId !== "새마을 새싹") {
    throw new Error("아직 획득하지 못한 칭호입니다.");
  }

  await updateDoc(userRef, {
    equippedTitle: titleId
  });

  return { success: true };
}

/**
 * 프로필 공개 여부 설정 토글
 */
export async function updateProfileVisibility(uid, isPublic) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    isProfilePublic: isPublic
  });
  return { success: true };
}

/**
 * 게시글 수 수동 1 증가
 */
export async function incrementUserPostCount(uid) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    postCount: increment(1)
  });
}

/**
 * 받은 좋아요 수 업데이트 및 칭호 해금 체크
 */
export async function updateUserReceivedLikes(uid, amount) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    receivedLikeCount: increment(amount)
  });
  // 칭호 해금 체크
  await checkAndUnlockTitles(uid);
}

/**
 * 팔로우 / 언팔로우 토글 (트랜잭션)
 */
export async function toggleFollowUser(followerUid, followingUid) {
  if (followerUid === followingUid) {
    throw new Error("자기 자신을 팔로우할 수 없습니다.");
  }

  const followDocId = `${followerUid}_${followingUid}`;
  const followRef = doc(db, "follows", followDocId);

  return await runTransaction(db, async (transaction) => {
    const followSnap = await transaction.get(followRef);
    const isFollowing = followSnap.exists();

    const followerUserRef = doc(db, "users", followerUid);
    const followingUserRef = doc(db, "users", followingUid);

    if (isFollowing) {
      // 언팔로우 처리
      transaction.delete(followRef);
      transaction.update(followerUserRef, { followingCount: increment(-1) });
      transaction.update(followingUserRef, { followerCount: increment(-1) });
      return { success: true, isFollowing: false };
    } else {
      // 팔로우 처리
      transaction.set(followRef, {
        followerUid,
        followingUid,
        timestamp: serverTimestamp()
      });
      transaction.update(followerUserRef, { followingCount: increment(1) });
      transaction.update(followingUserRef, { followerCount: increment(1) });
      return { success: true, isFollowing: true };
    }
  });
}

/**
 * 칭호 해금 상태 점검 및 자동 업데이트
 * @param {string} uid 사용자 UID
 * @returns {Promise<string[]>} 새로 해금된 칭호들의 ID 배열
 */
export async function checkAndUnlockTitles(uid) {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return [];

  const userData = userDoc.data();
  const unlockedTitles = userData.unlockedTitles || ["새마을 새싹"];

  const attendanceCount = userData.attendanceCount || 0;
  const postCount = userData.postCount || 0;
  const commentCount = userData.commentCount || 0;
  const approvedFixCount = userData.approvedFixCount || 0;
  const receivedLikeCount = userData.receivedLikeCount || 0;

  const newlyUnlocked = [];

  // 각 칭호 조건 검사
  // 1. 아침을 깨우는 자: 출석 7회
  if (attendanceCount >= 7 && !unlockedTitles.includes("아침을 깨우는 자")) {
    newlyUnlocked.push("아침을 깨우는 자");
  }
  // 2. 백만 송이 새벽별: 출석 30회
  if (attendanceCount >= 30 && !unlockedTitles.includes("백만 송이 새벽별")) {
    newlyUnlocked.push("백만 송이 새벽별");
  }
  // 3. 마을 대변인: 글 1개 또는 댓글 1개
  if ((postCount >= 1 || commentCount >= 1) && !unlockedTitles.includes("마을 대변인")) {
    newlyUnlocked.push("마을 대변인");
  }
  // 4. 따뜻한 이웃: 총 받은 좋아요 10개
  if (receivedLikeCount >= 10 && !unlockedTitles.includes("따뜻한 이웃")) {
    newlyUnlocked.push("따뜻한 이웃");
  }
  // 5. 마을의 자랑: 총 받은 좋아요 30개
  if (receivedLikeCount >= 30 && !unlockedTitles.includes("마을의 자랑")) {
    newlyUnlocked.push("마을의 자랑");
  }
  // 6. 기록 복원가: 오류 정정 승인 1회
  if (approvedFixCount >= 1 && !unlockedTitles.includes("기록 복원가")) {
    newlyUnlocked.push("기록 복원가");
  }
  // 7. 역사 편찬위원: 오류 정정 승인 5회
  if (approvedFixCount >= 5 && !unlockedTitles.includes("역사 편찬위원")) {
    newlyUnlocked.push("역사 편찬위원");
  }
  // 8. 새마을의 눈: 오류 정정 승인 15회
  if (approvedFixCount >= 15 && !unlockedTitles.includes("새마을의 눈")) {
    newlyUnlocked.push("새마을의 눈");
  }

  if (newlyUnlocked.length > 0) {
    const updatedTitles = [...unlockedTitles, ...newlyUnlocked];
    await updateDoc(userRef, {
      unlockedTitles: updatedTitles
    });
    console.log(`[Titles] Unlocked new titles for ${uid}:`, newlyUnlocked);
  }

  return newlyUnlocked;
}

/**
 * [관리자 전용] 특정 사용자에게 포인트를 지급하거나 회수합니다.
 * @param {string} adminUid 관리자 UID
 * @param {string} targetUid 대상 사용자 UID
 * @param {number} amount 조정 포인트 (양수: 지급, 음수: 회수)
 * @param {string} reason 사유
 * @returns {Promise<{success: boolean}>}
 */
export async function adjustUserPointsByAdmin(adminUid, targetUid, amount, reason = '관리자 조정') {
  if (!amount || amount === 0) throw new Error('조정 포인트는 0이 될 수 없습니다.');

  return await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', targetUid);
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error('해당 사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();
    const currentPoints = userData.points || 0;
    const currentTotalPoints = userData.totalPoints || 0;

    // 회수 시 보유 포인트 및 누적 포인트 아래로 내려가지 않도록 처리
    const newPoints = Math.max(0, currentPoints + amount);
    const newTotalPoints = Math.max(0, currentTotalPoints + amount);

    transaction.update(userRef, {
      points: newPoints,
      totalPoints: newTotalPoints
    });

    // 포인트 내역 기록
    const historyId = `${targetUid}_admin_adjust_${Date.now()}`;
    const historyRef = doc(db, 'point_history', historyId);
    transaction.set(historyRef, {
      uid: targetUid,
      adminUid,
      activityType: 'admin_adjust',
      pointsEarned: amount,
      reason,
      timestamp: serverTimestamp()
    });

    return { success: true, newPoints };
  });
}

/**
 * [관리자 전용] 특정 사용자의 오늘 출석 여부를 토글(추가/제거)합니다.
 * attendance 컬렉션의 해당 날짜 레코드를 추가 또는 삭제합니다.
 * @param {string} targetUid 대상 사용자 UID
 * @param {string} displayName 사용자 표시 이름
 * @param {string} dateString 날짜 문자열 (예: '2024-06-19')
 * @param {boolean} hasAttendance 현재 출석 여부
 * @param {string|null} attendanceDocId 출석 기록이 있을 경우 해당 문서 ID
 * @returns {Promise<{success: boolean, isPresent: boolean}>}
 */
export async function adminToggleAttendance(targetUid, displayName, dateString, hasAttendance, attendanceDocId = null) {
  const { deleteDoc, addDoc, collection: col } = await import('firebase/firestore');
  
  if (hasAttendance && attendanceDocId) {
    // 출석 기록 삭제 (결석 처리)
    await deleteDoc(doc(db, 'attendance', attendanceDocId));
    return { success: true, isPresent: false };
  } else {
    // 출석 기록 추가 (출석 처리)
    await addDoc(col(db, 'attendance'), {
      uid: targetUid,
      displayName,
      photoURL: '',
      timestamp: serverTimestamp(),
      dateString,
      addedByAdmin: true
    });
    return { success: true, isPresent: true };
  }
}

/**
 * 테스트 완료 포인트 지급 (최초 1회만 지급)
 * @param {string} uid 사용자 UID
 * @param {string} testId 'leadership' | 'spirit'
 * @returns {Promise<{success: boolean, pointsEarned: number, unlockedTitles: string[], alreadyRewarded: boolean}>}
 */
export async function addPointForTest(uid, testId) {
  const points = POINT_VALUES.quiz || 20;

  // 1. 이미 해당 테스트로 포인트를 받았는지 이력 검사
  const historyRef = collection(db, "point_history");
  const q = query(
    historyRef,
    where("uid", "==", uid),
    where("activityType", "==", "quiz"),
    where("testId", "==", testId)
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { success: true, pointsEarned: 0, unlockedTitles: [], alreadyRewarded: true };
  }

  // 2. 지급 이력이 없을 때 포인트 지급 트랜잭션 진행
  return await runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }

    const userData = userDoc.data();
    const currentPoints = userData.points || 0;
    const currentTotalPoints = userData.totalPoints || 0;

    // 포인트 가산
    transaction.update(userRef, {
      points: currentPoints + points,
      totalPoints: currentTotalPoints + points
    });

    // 포인트 역사 기록
    const historyId = `${uid}_quiz_${testId}_${Date.now()}`;
    const newLogRef = doc(collection(db, "point_history"), historyId);
    transaction.set(newLogRef, {
      uid,
      activityType: 'quiz',
      testId,
      pointsEarned: points,
      timestamp: serverTimestamp()
    });

    return { success: true, pointsEarned: points, alreadyRewarded: false };
  }).then(async (result) => {
    if (result && result.success) {
      const unlocked = await checkAndUnlockTitles(uid);
      return { ...result, unlockedTitles: unlocked };
    }
    return { ...result, unlockedTitles: [] };
  });
}

/**
 * 로그인 시 사용자의 프로필 문서를 Firestore에 생성/동기화하여 명부에서 누락되지 않도록 보존합니다.
 */
export async function ensureUserProfile(uid, displayName, email) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const defaultProfile = {
      uid,
      displayName: displayName || "익명의 주민",
      email: email || "",
      role: email === import.meta.env.VITE_ADMIN_EMAIL ? 'admin' : 'user',
      points: 0,
      totalPoints: 0,
      attendanceCount: 0,
      consecutiveAttendance: 0,
      monthlyAttendanceCount: 0,
      lastAttendanceDate: "",
      unlockedTitles: ["새마을 새싹"],
      equippedTitle: "새마을 새싹",
      purchasedBadges: ["기초 새마을 뱃지"],
      isProfilePublic: true,
      postCount: 0,
      commentCount: 0,
      approvedFixCount: 0,
      receivedLikeCount: 0,
      followerCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, defaultProfile);
  } else {
    // update profile if changed (to prevent sync mismatch)
    const existing = userDoc.data();
    if ((displayName && existing.displayName !== displayName) || (email && existing.email !== email)) {
      await updateDoc(userRef, {
        displayName: displayName || existing.displayName || "익명의 주민",
        email: email || existing.email || ""
      });
    }
  }
}

/**
 * 관리자 로그인 시, 명부에 항상 노출되어야 하는 가입자(MOCK_USERS)들을 Firestore에 세팅하여
 * 페이지를 새로고침하더라도 데이터가 유실되지 않고 실제 가입자처럼 유지되도록 합니다.
 */
export async function seedMockUsers() {
  const mockUsers = [
    {
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
      createdAtSeconds: 1779934800
    },
    {
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
      createdAtSeconds: 1780280400
    },
    {
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
      createdAtSeconds: 1778984400
    }
  ];

  for (const mu of mockUsers) {
    const userRef = doc(db, "users", mu.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: mu.uid,
        displayName: mu.displayName,
        email: mu.email,
        role: mu.role,
        points: mu.points,
        totalPoints: mu.totalPoints,
        attendanceCount: mu.attendanceCount,
        equippedTitle: mu.equippedTitle,
        purchasedBadges: mu.purchasedBadges,
        isProfilePublic: mu.isProfilePublic,
        followerCount: mu.followerCount,
        followingCount: mu.followingCount,
        createdAt: serverTimestamp()
      });
      console.log(`[Seed] Seeded mock user: ${mu.uid}`);
    }
  }
}

/**
 * 닉네임 변경권을 구매합니다. (50 P 차감, nicknameChangeTickets 1 증가)
 */
export async function buyNicknameChangeTicket(uid) {
  const price = 50;
  const userRef = doc(db, "users", uid);

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error("사용자 프로필이 존재하지 않습니다.");
    }

    const userData = userDoc.data();
    const currentPoints = userData.points || 0;

    if (currentPoints < price) {
      throw new Error("포인트가 부족합니다.");
    }

    const currentTickets = userData.nicknameChangeTickets || 0;

    transaction.update(userRef, {
      points: currentPoints - price,
      nicknameChangeTickets: currentTickets + 1
    });

    // 포인트 내역 기록
    const historyId = `${uid}_buy_ticket_${Date.now()}`;
    transaction.set(doc(db, "point_history", historyId), {
      uid,
      activityType: 'buy_ticket',
      pointsEarned: -price,
      timestamp: serverTimestamp()
    });

    return { success: true };
  });
}

/**
 * 닉네임 변경권을 소모하여 닉네임을 변경합니다. (nicknameChangeTickets 1 감소, displayName 변경)
 */
export async function updateUserNicknameWithTicket(uid, newNickname) {
  if (!uid || !newNickname) return;
  const userRef = doc(db, "users", uid);

  return await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      throw new Error("사용자 프로필을 찾을 수 없습니다.");
    }

    const userData = userDoc.data();
    const tickets = userData.nicknameChangeTickets || 0;

    if (tickets <= 0) {
      throw new Error("닉네임 변경권이 부족합니다. 구판장에서 먼저 구매해주세요.");
    }

    transaction.update(userRef, {
      displayName: newNickname,
      nicknameChangeTickets: tickets - 1
    });

    // Firebase Auth 프로필 갱신
    if (auth.currentUser && auth.currentUser.uid === uid) {
      await updateProfile(auth.currentUser, {
        displayName: newNickname
      });
    }

    return { success: true };
  });
}

/**
 * 특정 유저의 팔로워 프로필 목록을 조회합니다. (최대 30명)
 */
export async function fetchFollowersList(targetUid) {
  const q = query(collection(db, "follows"), where("followingUid", "==", targetUid));
  const snap = await getDocs(q);
  const uids = [];
  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.followerUid) uids.push(data.followerUid);
  });
  if (uids.length === 0) return [];
  
  const usersQ = query(collection(db, "users"), where("uid", "in", uids.slice(0, 30)));
  const usersSnap = await getDocs(usersQ);
  const list = [];
  usersSnap.forEach(docSnap => {
    list.push(docSnap.data());
  });
  return list;
}

/**
 * 특정 유저가 팔로잉하는 프로필 목록을 조회합니다. (최대 30명)
 */
export async function fetchFollowingList(targetUid) {
  const q = query(collection(db, "follows"), where("followerUid", "==", targetUid));
  const snap = await getDocs(q);
  const uids = [];
  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.followingUid) uids.push(data.followingUid);
  });
  if (uids.length === 0) return [];
  
  const usersQ = query(collection(db, "users"), where("uid", "in", uids.slice(0, 30)));
  const usersSnap = await getDocs(usersQ);
  const list = [];
  usersSnap.forEach(docSnap => {
    list.push(docSnap.data());
  });
  return list;
}


