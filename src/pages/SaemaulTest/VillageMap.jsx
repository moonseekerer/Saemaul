import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EventDialog from './EventDialog';
import { questions } from './SpiritTest';

// ──────────────────────────────────────────────
// 타일 타입 상수
// ──────────────────────────────────────────────
const G = 0;  // Grass (잔디, 통행 가능)
const P = 1;  // Path (흙길, 통행 가능)
const T = 2;  // Tree (나무, 통행 불가)
const W = 3;  // Water (강, 통행 불가)
const H = 4;  // House (집, 통행 불가)
const B = 6;  // Bridge (다리, 통행 가능)

// 이벤트 타일: 타일값 - 10 = 질문 인덱스(0~11)
const E1=10,E2=11,E3=12,E4=13,E5=14,E6=15,E7=16,E8=17,E9=18,E10=19,E11=20,E12=21;

const TILE_SIZE = 40;
const MAP_COLS = 26;
const MAP_ROWS = 20;

// 통행 불가 타일 집합
const BLOCKED = new Set([T, W, H]);
const isWalkable = (t) => !BLOCKED.has(t);
const isEvent   = (t) => t >= 10 && t <= 21;

// ──────────────────────────────────────────────
// 마을 타일 맵 (26열 × 20행)
// ──────────────────────────────────────────────
const MAP = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T], // 0
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T], // 1
  [T,G,H,H,G,E1,G,G,G,G,H,H,G,G,G,G,H,H,G,G,G,G,G,G,G,T], // 2  E1=[2,5]
  [T,G,H,H,G,G,G,G,G,G,H,H,G,G,G,G,H,H,G,G,G,E4,G,G,G,T], // 3  E4=[3,21]
  [T,G,G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,T], // 4
  [T,P,P,P,P,P,P,G,G,E2,G,G,E3,G,G,G,G,G,G,G,G,P,G,G,G,T], // 5  E2=[5,9] E3=[5,12]
  [T,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T], // 6
  [T,G,H,H,G,G,P,G,H,H,G,G,H,H,G,G,H,H,G,G,G,P,G,G,G,T], // 7
  [T,G,H,H,G,G,P,G,H,H,G,G,H,H,G,G,H,H,G,G,G,P,G,E5,G,T], // 8  E5=[8,23]
  [T,G,G,G,G,G,P,P,P,P,P,P,P,P,G,G,G,G,G,G,G,P,G,G,G,T], // 9
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T], // 10
  [T,G,G,E6,G,G,G,G,G,G,G,G,G,G,G,G,E7,G,G,G,G,P,G,G,G,T], // 11 E6=[11,3] E7=[11,16]
  [W,W,B,B,W,W,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T], // 12 강+다리
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T], // 13
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T], // 14
  [T,G,G,G,G,G,G,G,G,E8,G,G,E9,G,G,G,G,G,G,G,G,P,G,G,G,T], // 15 E8=[15,9] E9=[15,12]
  [T,G,G,G,G,G,G,G,G,G,G,E10,G,G,G,G,G,G,G,G,G,P,E11,G,G,T], // 16 E10=[16,11] E11=[16,22]
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,E12,G,T], // 17 E12=[17,23]
  [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T], // 18
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T], // 19
];

// 이벤트 위치 → 사용자에게 보여줄 위치 이름
const EVENT_LABELS = {
  10: '마을 입구',
  11: '창업 공방',
  12: '공동 우물',
  13: '마을 게시판',
  14: '수로 공사장',
  15: '커뮤니티 센터',
  16: '축제 광장',
  17: '농업 연구소',
  18: '아랫동네',
  19: '복지 센터',
  20: '디지털 허브',
  21: '서버실',
};

// ──────────────────────────────────────────────
// 타일 시각 스타일
// ──────────────────────────────────────────────
const TILE_COLORS = {
  [G]: { bg: '#4a8f3a', border: '#3a7a2c' },
  [P]: { bg: '#c4a26a', border: '#b08e58' },
  [T]: { bg: '#1e4a0e', border: '#153509' },
  [W]: { bg: '#2a6bc7', border: '#1e5ab0' },
  [H]: { bg: '#7a5510', border: '#5e4008' },
  [B]: { bg: '#c8a060', border: '#a88040' },
};

const getTileStyle = (tileVal) => {
  const style = TILE_COLORS[tileVal];
  if (style) return style;
  // 이벤트 타일은 잔디 기반
  return { bg: '#4a8f3a', border: '#3a7a2c' };
};

// 타일 내 이모지/심볼
const TILE_SYMBOLS = {
  [T]: { symbol: '🌲', size: 20 },
  [W]: { symbol: '〰', size: 10, color: '#60a5fa' },
  [H]: { symbol: null }, // CSS로 처리
  [B]: { symbol: '═', size: 14, color: '#d4a860' },
};

// ──────────────────────────────────────────────
// Ninja Adventure 스프라이트 시트 설정
// 시트 구조: 4열(방향: 하/상/좌/우) x 7행(액션), 단위 16x16px
// ──────────────────────────────────────────────
const CLASS_SPRITES = {
  Pioneer:   '/assets/na_ninja_blue.png',
  Healer:    '/assets/na_samurai_green.png',
  Architect: '/assets/na_samurai_blue.png',
};

// 방향 열 인덱스 (0=하/앞, 1=상/뒤, 2=좌, 3=우)
const FACING_COL = { down: 0, up: 1, left: 2, right: 3 };

// 걸음 애니메이션 행 인덱스 사이클: idle(0) -> walk1(1) -> idle(0) -> walk2(2)
const WALK_ROWS = [0, 1, 0, 2];

const SPRITE_SRC_SIZE = 16;  // 원본 px (16x16)
const SPRITE_SCALE    = 2.5; // 화면 표시 배율
const SPRITE_DISP     = Math.round(SPRITE_SRC_SIZE * SPRITE_SCALE); // 40px

const CharacterSprite = ({ facing, walkFrame, playerClass }) => {
  const spriteUrl = CLASS_SPRITES[playerClass] || CLASS_SPRITES.Pioneer;
  const col = FACING_COL[facing] ?? 0;
  const row = WALK_ROWS[walkFrame % WALK_ROWS.length];

  return (
    <div style={{
      width:  SPRITE_DISP,
      height: SPRITE_DISP,
      imageRendering: 'pixelated',
      backgroundImage: `url(${spriteUrl})`,
      backgroundSize:  `${4 * SPRITE_DISP}px ${7 * SPRITE_DISP}px`,
      backgroundPosition: `-${col * SPRITE_DISP}px -${row * SPRITE_DISP}px`,
      backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.9))',
    }} />
  );
};

// HUD 아바타용 스프라이트 (정면, 유휴 프레임)
const AvatarSprite = ({ playerClass }) => {
  const spriteUrl = CLASS_SPRITES[playerClass] || CLASS_SPRITES.Pioneer;
  const scale = 3;
  const disp  = SPRITE_SRC_SIZE * scale; // 48px
  return (
    <div style={{
      width: disp, height: disp,
      imageRendering: 'pixelated',
      backgroundImage: `url(${spriteUrl})`,
      backgroundSize:  `${4 * disp}px ${7 * disp}px`,
      backgroundPosition: `0px 0px`,
      backgroundRepeat: 'no-repeat',
    }} />
  );
};


// ──────────────────────────────────────────────
// 이벤트 마커 (타일 위에 떠 있는 표시)
// ──────────────────────────────────────────────
const EventMarker = ({ completed, label }) => (
  <div style={{
    position: 'absolute', top: 0, left: 0,
    width: TILE_SIZE, height: TILE_SIZE,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
  }}>
    {completed ? (
      <div style={{
        width: TILE_SIZE - 4, height: TILE_SIZE - 4,
        backgroundColor: 'rgba(30,80,20,0.7)',
        border: '2px solid #4a9a4a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>✓</div>
    ) : (
      <div style={{
        position: 'absolute',
        top: -18,
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'markerBob 0.8s ease-in-out infinite alternate',
      }}>
        <div style={{
          backgroundColor: '#f5c518',
          color: '#000',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 13, fontWeight: 900,
          padding: '3px 7px',
          border: '2px solid #000',
          boxShadow: '2px 2px 0 #000',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>!</div>
        <div style={{
          width: 0, height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '5px solid #f5c518',
          margin: '0 auto',
        }} />
      </div>
    )}
  </div>
);

// ──────────────────────────────────────────────
// 모바일 D-Pad
// ──────────────────────────────────────────────
const DPad = ({ onMoveStart, onMoveEnd }) => {
  const dirs = [
    { dir: 'up',    label: '▲', col: 2, row: 1 },
    { dir: 'left',  label: '◀', col: 1, row: 2 },
    { dir: 'down',  label: '▼', col: 2, row: 3 },
    { dir: 'right', label: '▶', col: 3, row: 2 },
  ];

  const btnStyle = {
    width: 64, height: 64,
    backgroundColor: 'rgba(255,255,255,0.12)',
    border: '3px solid rgba(255,255,255,0.35)',
    color: '#fff',
    fontSize: 24,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    userSelect: 'none', WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    borderRadius: 4,
    fontFamily: 'monospace',
  };

  return (
    <div style={{
      position: 'absolute', bottom: 20, right: 20,
      display: 'grid',
      gridTemplateColumns: '64px 64px 64px',
      gridTemplateRows: '64px 64px 64px',
      gap: 5,
      zIndex: 500,
    }}>
      {dirs.map(({ dir, label, col, row }) => (
        <button
          key={dir}
          style={{ ...btnStyle, gridColumn: col, gridRow: row }}
          onMouseDown={() => onMoveStart(dir)}
          onTouchStart={(e) => { e.preventDefault(); onMoveStart(dir); }}
          onMouseUp={() => onMoveEnd()}
          onMouseLeave={() => onMoveEnd()}
          onTouchEnd={() => onMoveEnd()}
        >
          {label}
        </button>
      ))}
      <div style={{ gridColumn: 2, gridRow: 2, width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'default' }} />
    </div>
  );
};

// ──────────────────────────────────────────────
// 메인 VillageMap 컴포넌트
// ──────────────────────────────────────────────
const VillageMap = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const playerName  = searchParams.get('name')  || '용사';
  const playerClass = searchParams.get('class') || 'Pioneer';

  // 플레이어 위치 (ref: 이동 로직용, state: 렌더링용)
  const playerPosRef = useRef({ row: 5, col: 3 });
  const [playerPos, setPlayerPos] = useState({ row: 5, col: 3 });

  // 방향 및 걷기 애니메이션
  const [facing, setFacing]       = useState('down');
  const [walkFrame, setWalkFrame] = useState(0);

  // 이벤트 / 진행 상태
  const completedRef = useRef(new Set());
  const [completed, setCompleted] = useState(new Set());
  const responsesRef = useRef(Array(12).fill(0));
  const [responses, setResponses] = useState(Array(12).fill(0));

  const [activeEvent, setActiveEvent] = useState(null); // {questionIndex, tile}
  const [gamePhase, setGamePhase]     = useState('EXPLORE'); // 'EXPLORE'|'EVENT'|'COMPLETE'

  // 뷰포트 크기 (컨테이너 크기 모니터링)
  const containerRef = useRef(null);
  const [viewSize, setViewSize] = useState({ w: 800, h: 600 });
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setViewSize({ w: width, h: height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const viewCols = Math.ceil(viewSize.w / TILE_SIZE) + 2;
  const viewRows = Math.ceil(viewSize.h / TILE_SIZE) + 2;

  // 카메라 (플레이어 중앙 추적)
  const camCol = Math.max(0, Math.min(MAP_COLS - viewCols, playerPos.col - Math.floor(viewCols / 2)));
  const camRow = Math.max(0, Math.min(MAP_ROWS - viewRows, playerPos.row - Math.floor(viewRows / 2)));

  // 걷기 애니메이션 (200ms 간격 - 4프레임 사이클)
  useEffect(() => {
    const t = setInterval(() => setWalkFrame(f => (f + 1) % 4), 200);
    return () => clearInterval(t);
  }, []);

  // ── 이동 함수 ──
  const movePlayer = useCallback((dir) => {
    if (activeEvent) return;

    const pos = playerPosRef.current;
    const deltas = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [dRow, dCol] = deltas[dir];
    const newRow = pos.row + dRow;
    const newCol = pos.col + dCol;

    if (newRow < 0 || newRow >= MAP_ROWS || newCol < 0 || newCol >= MAP_COLS) return;

    const targetTile = MAP[newRow][newCol];
    if (!isWalkable(targetTile)) return;

    playerPosRef.current = { row: newRow, col: newCol };
    setPlayerPos({ row: newRow, col: newCol });
    setFacing(dir);

    // 이벤트 타일 진입 감지 (미완료만)
    if (isEvent(targetTile) && !completedRef.current.has(targetTile)) {
      const questionIndex = targetTile - 10;
      setActiveEvent({ questionIndex, tile: targetTile });
      setGamePhase('EVENT');
    }
  }, [activeEvent]);

  // ── 키보드 이동 ──
  const moveIntervalRef = useRef(null);

  const startMoving = useCallback((dir) => {
    movePlayer(dir);
    moveIntervalRef.current = setInterval(() => movePlayer(dir), 150);
  }, [movePlayer]);

  const stopMoving = useCallback(() => {
    clearInterval(moveIntervalRef.current);
    moveIntervalRef.current = null;
  }, []);

  useEffect(() => {
    const dirMap = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
      W: 'up', S: 'down', A: 'left', D: 'right',
    };
    let currentDir = null;

    const onKeyDown = (e) => {
      const dir = dirMap[e.key];
      if (!dir) return;
      e.preventDefault();
      if (dir === currentDir) return; // 이미 같은 방향 누르고 있음
      stopMoving();
      currentDir = dir;
      startMoving(dir);
    };

    const onKeyUp = (e) => {
      const dir = dirMap[e.key];
      if (dir && dir === currentDir) {
        currentDir = null;
        stopMoving();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      stopMoving();
    };
  }, [startMoving, stopMoving]);

  // ── 이벤트 응답 처리 ──
  const handleAnswer = useCallback((value) => {
    if (!activeEvent) return;

    const newResponses = [...responsesRef.current];
    newResponses[activeEvent.questionIndex] = value;
    responsesRef.current = newResponses;
    setResponses([...newResponses]);

    const newCompleted = new Set(completedRef.current);
    newCompleted.add(activeEvent.tile);
    completedRef.current = newCompleted;
    setCompleted(new Set(newCompleted));

    setActiveEvent(null);
    setGamePhase('EXPLORE');

    if (newCompleted.size === 12) {
      setTimeout(() => setGamePhase('COMPLETE'), 800);
    }
  }, [activeEvent]);

  const handleCloseDialog = useCallback(() => {
    setActiveEvent(null);
    setGamePhase('EXPLORE');
  }, []);

  // ── 결과 보기 ──
  const handleViewResult = () => {
    sessionStorage.setItem('spirit_map_results', JSON.stringify({
      responses: responsesRef.current,
      playerName,
      playerClass,
    }));
    navigate('/spirit-test');
  };

  // ── 타일 렌더링 ──
  const renderTiles = () => {
    const tiles = [];
    const rowStart = Math.max(0, camRow - 1);
    const rowEnd   = Math.min(MAP_ROWS - 1, camRow + viewRows + 1);
    const colStart = Math.max(0, camCol - 1);
    const colEnd   = Math.min(MAP_COLS - 1, camCol + viewCols + 1);

    const getHouseTileImage = (r, c) => {
      const isRightH = c + 1 < MAP_COLS && MAP[r][c + 1] === H;
      const isLeftH  = c - 1 >= 0 && MAP[r][c - 1] === H;
      const isDownH  = r + 1 < MAP_ROWS && MAP[r + 1][c] === H;
      const isUpH    = r - 1 >= 0 && MAP[r - 1][c] === H;

      if (isRightH && isDownH) return '/assets/house_tl.png';
      if (isLeftH && isDownH)  return '/assets/house_tr.png';
      if (isRightH && isUpH)   return '/assets/house_bl.png';
      if (isLeftH && isUpH)    return '/assets/house_br.png';
      return '/assets/house_tl.png';
    };

    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        const tileVal = MAP[r][c];
        const isEv    = isEvent(tileVal);
        const isDone  = completed.has(tileVal);

        const x = (c - camCol) * TILE_SIZE;
        const y = (r - camRow) * TILE_SIZE;

        // 타일별 백그라운드 이미지 매핑
        let bgImg = '';
        if (tileVal === G || isEv) {
          bgImg = "url('/assets/grass.png')";
        } else if (tileVal === P) {
          bgImg = "url('/assets/path.png')";
        } else if (tileVal === W) {
          bgImg = "url('/assets/water.png')";
        } else if (tileVal === B) {
          bgImg = "url('/assets/bridge.png')";
        } else if (tileVal === T) {
          bgImg = "url('/assets/tree.png')";
        } else if (tileVal === H) {
          bgImg = `url('${getHouseTileImage(r, c)}')`;
        }

        tiles.push(
          <div
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              left: x, top: y,
              width: TILE_SIZE, height: TILE_SIZE,
              backgroundImage: bgImg,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
              overflow: 'visible',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              userSelect: 'none',
              // 완료된 이벤트는 약간 어둡게
              filter: isEv && isDone ? 'brightness(0.7) saturate(0.4)' : undefined,
            }}
          >
            {/* water ripple animation overlay */}
            {tileVal === W && (
              <div style={{
                width: '100%', height: '100%', position: 'absolute',
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, transparent 4px, rgba(255,255,255,0.15) 8px)',
                animation: 'waveAnim 2s linear infinite',
              }} />
            )}
            {/* 이벤트 타일 글로우 */}
            {isEv && !isDone && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundColor: 'rgba(245,197,24,0.18)',
                border: '2px solid rgba(245,197,24,0.5)',
                animation: 'eventGlow 1.5s ease-in-out infinite alternate',
              }} />
            )}
            {/* 이벤트 마커 */}
            {isEv && (
              <EventMarker completed={isDone} label={EVENT_LABELS[tileVal]} />
            )}
          </div>
        );
      }
    }
    return tiles;
  };

  // ── 플레이어 화면 좌표 ──
  const playerScreenX = (playerPos.col - camCol) * TILE_SIZE;
  const playerScreenY = (playerPos.row - camRow) * TILE_SIZE;

  const progressCount = completed.size;
  const classBadge = { Pioneer: '마을 개척자', Healer: '상생 힐러', Architect: '스마트 아키텍트' }[playerClass] || '';

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        overflow: 'hidden', position: 'relative',
        backgroundColor: '#0a0a1a',
        cursor: 'default',
      }}
    >
      {/* ── 맵 레이어 ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {renderTiles()}

        {/* 플레이어 */}
        <div style={{
          position: 'absolute',
          left: playerScreenX, top: playerScreenY,
          width: SPRITE_DISP, height: SPRITE_DISP,
          zIndex: 50,
        }}>
          <CharacterSprite
            facing={facing}
            walkFrame={walkFrame}
            playerClass={playerClass}
          />
        </div>
      </div>

      {/* ── HUD 오버레이 ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 300,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: "'Press Start 2P', monospace",
      }}>
        {/* 플레이어 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52,
            backgroundColor: '#111122',
            border: '3px solid #f5c518',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            imageRendering: 'pixelated',
          }}>
            <AvatarSprite playerClass={playerClass} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#f5c518', marginBottom: 4 }}>{playerName}</div>
            <div style={{ fontSize: 9, color: '#8888cc' }}>{classBadge}</div>
          </div>
        </div>

        {/* 진행 상황 */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#f5c518', marginBottom: 6 }}>
            {progressCount}/12 퀘스트 완료
          </div>
          <div style={{
            display: 'flex', gap: 3, justifyContent: 'flex-end',
          }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{
                width: 14, height: 14,
                backgroundColor: [...completed].some((t) => t - 10 === i) ? '#f5c518' : '#333355',
                border: '1px solid #555577',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 조작법 안내 (하단) ── */}
      <div style={{
        position: 'absolute', bottom: 12, left: 18, zIndex: 300,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 10, color: 'rgba(180,180,220,0.7)',
        lineHeight: 2.0,
        pointerEvents: 'none',
      }}>
        <div>← → ↑ ↓ / WASD : 이동</div>
        <div>❗ 표시에 접촉 시 이벤트 발생</div>
      </div>

      {/* ── D-Pad (모바일) ── */}
      <DPad
        onMoveStart={startMoving}
        onMoveEnd={stopMoving}
      />

      {/* ── 이벤트 대화창 ── */}
      {gamePhase === 'EVENT' && activeEvent && (
        <EventDialog
          question={questions[activeEvent.questionIndex]}
          questionIndex={activeEvent.questionIndex}
          onAnswer={handleAnswer}
          onClose={handleCloseDialog}
        />
      )}

      {/* ── 전체 완료 오버레이 ── */}
      {gamePhase === 'COMPLETE' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3000,
          backgroundColor: 'rgba(0,0,12,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace",
        }}>
          {/* 별 파티클 배경 효과 */}
          <div style={{ fontSize: 52, marginBottom: 20, animation: 'celebratePop 0.5s ease-out' }}>
            🏆
          </div>
          <div style={{
            fontSize: 18, color: '#f5c518', marginBottom: 10,
            textShadow: '0 0 20px #f5c518, 0 0 40px #f5c51888',
            animation: 'celebratePop 0.4s ease-out',
          }}>
            QUEST CLEAR!
          </div>
          <div style={{ fontSize: 11, color: '#aaaadd', marginBottom: 28, lineHeight: 2.2 }}>
            마을 12개 퀘스트를 모두 완수했습니다!
          </div>

          {/* 점수 미리보기 */}
          <div style={{
            backgroundColor: '#0d0d22',
            border: '4px solid #f5c518',
            boxShadow: '0 0 0 8px #000, 0 0 0 12px #f5c51844',
            padding: '20px 28px', marginBottom: 28,
            minWidth: 340,
          }}>
            <div style={{ fontSize: 9, color: '#8888cc', marginBottom: 14 }}>— 퀘스트 응답 요약 —</div>
            {[
              { label: '근면', keys: [0,1], color: '#ff6b35' },
              { label: '자조', keys: [2,3], color: '#4fc3f7' },
              { label: '협동', keys: [4,5], color: '#66bb6a' },
              { label: '나눔', keys: [6,7], color: '#f48fb1' },
              { label: '봉사', keys: [8,9], color: '#ce93d8' },
              { label: '창조', keys: [10,11], color: '#ffd54f' },
            ].map(({ label, keys, color }) => {
              const score = keys.reduce((s, k) => s + (responsesRef.current[k] || 0), 0);
              const pct   = Math.round((score / 10) * 100);
              return (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color, marginBottom: 4 }}>
                    <span>{label}</span><span>{score}/10</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: '#1a1a3a', border: '1px solid #333355' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleViewResult}
            style={{
              padding: '16px 32px',
              backgroundColor: '#f5c518',
              color: '#000',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000',
              fontSize: 13, fontWeight: 900,
              fontFamily: "'Press Start 2P', monospace",
              cursor: 'pointer',
              letterSpacing: 1,
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 #000'; }}
            onMouseUp={e   => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 #000'; }}
          >
            ▶ 정신 유형 결과 확인하기
          </button>

          <button
            onClick={() => navigate('/spirit-test')}
            style={{
              marginTop: 14, background: 'none', border: 'none',
              color: '#555577', fontSize: 10, cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            일반 진단 센터로 돌아가기
          </button>
        </div>
      )}

      {/* ── CSS 애니메이션 ── */}
      <style>{`
        @keyframes markerBob   { from { transform: translateX(-50%) translateY(0); } to { transform: translateX(-50%) translateY(-4px); } }
        @keyframes eventGlow   { from { opacity: 0.5; } to { opacity: 1; } }
        @keyframes waveAnim    { from { background-position: 0 0; } to { background-position: 40px 0; } }
        @keyframes celebratePop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default VillageMap;
