import React, { useState, useEffect, useRef } from 'react';

const CARD_LABELS = ['A', 'B', 'C', 'D', 'E'];

const CATEGORY_KO = {
  DILIGENCE: '근면',
  SELF_HELP: '자조',
  COOPERATION: '협동',
  SHARING: '나눔',
  SERVICE: '봉사',
  CREATION: '창조',
};

const CATEGORY_COLORS = {
  DILIGENCE: '#ff6b35',
  SELF_HELP: '#4fc3f7',
  COOPERATION: '#66bb6a',
  SHARING: '#f48fb1',
  SERVICE: '#ce93d8',
  CREATION: '#ffd54f',
};

const EventDialog = ({ question, questionIndex, onAnswer, onClose }) => {
  const [phase, setPhase] = useState('TYPING'); // 'TYPING' | 'CHOICES'
  const [displayedText, setDisplayedText] = useState('');
  const [textComplete, setTextComplete] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const charIndexRef = useRef(0);
  const timerRef = useRef(null);
  const fullText = question.background;
  const catColor = CATEGORY_COLORS[question.category] || '#f5c518';

  // Shuffle options on mount
  useEffect(() => {
    setShuffledOptions([...question.options].sort(() => Math.random() - 0.5));
    charIndexRef.current = 0;
    setDisplayedText('');
    setTextComplete(false);
    setPhase('TYPING');
    setSelectedIdx(null);
  }, [question]);

  // Typewriter effect
  useEffect(() => {
    if (!fullText) return;
    charIndexRef.current = 0;
    setDisplayedText('');
    setTextComplete(false);

    const type = () => {
      charIndexRef.current++;
      setDisplayedText(fullText.slice(0, charIndexRef.current));
      if (charIndexRef.current < fullText.length) {
        timerRef.current = setTimeout(type, 22);
      } else {
        setTextComplete(true);
      }
    };
    timerRef.current = setTimeout(type, 80);
    return () => clearTimeout(timerRef.current);
  }, [fullText]);

  const handleSkipOrAdvance = () => {
    if (!textComplete) {
      clearTimeout(timerRef.current);
      setDisplayedText(fullText);
      setTextComplete(true);
      charIndexRef.current = fullText.length;
    } else if (phase === 'TYPING') {
      setPhase('CHOICES');
    }
  };

  const handleSelect = (option, idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    setTimeout(() => onAnswer(option.value), 500);
  };

  const questNum = (questionIndex + 1).toString().padStart(2, '0');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      {/* Semi-transparent backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
        onClick={handleSkipOrAdvance}
      />

      {/* Main Dialog Box */}
      <div style={{
        position: 'relative', zIndex: 10,
        margin: '8px auto',
        width: 'min(680px, calc(100vw - 8px))',
        backgroundColor: '#08081a',
        border: `4px solid ${catColor}`,
        boxShadow: `0 0 0 8px #000, 0 0 0 12px ${catColor}44, 0 -8px 40px rgba(0,0,0,0.9)`,
        imageRendering: 'pixelated',
      }}>

        {/* Quest header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 12px',
          backgroundColor: catColor,
          borderBottom: `4px solid #000`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: '#000', letterSpacing: 1 }}>
              ★ QUEST {questNum}
            </span>
            <span style={{
              fontSize: 7, color: '#000',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '2px 6px',
            }}>
              [{CATEGORY_KO[question.category] || question.category}]
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#000',
              fontSize: 10, cursor: 'pointer', fontFamily: "'Press Start 2P', monospace",
              padding: '0 4px',
            }}
          >✕</button>
        </div>

        {/* Story + Image section */}
        <div style={{ display: 'flex', gap: 0, borderBottom: phase === 'CHOICES' ? '4px solid #111133' : 'none' }}>
          {/* Quest Illustration */}
          <div style={{
            width: 96, flexShrink: 0,
            borderRight: `4px solid ${catColor}44`,
            backgroundColor: '#111122',
            position: 'relative', overflow: 'hidden',
          }}>
            <img
              src={question.image}
              alt=""
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                display: 'block',
                filter: 'saturate(1.2)',
              }}
            />
            {/* Pixel scanline overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 2px)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Text area */}
          <div
            style={{
              flex: 1, padding: '10px 12px',
              backgroundColor: '#0d0d22',
              minHeight: 88, maxHeight: 160,
              overflowY: 'auto',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={handleSkipOrAdvance}
          >
            <p style={{
              fontSize: 7, lineHeight: 2.0,
              color: '#d8d8ff', margin: 0,
              wordBreak: 'keep-all',
            }}>
              {displayedText}
              {!textComplete && (
                <span style={{ animation: 'dialogBlink 0.6s steps(1) infinite', color: catColor }}>█</span>
              )}
            </p>
            {textComplete && phase === 'TYPING' && (
              <div style={{
                position: 'absolute', bottom: 6, right: 8,
                fontSize: 8, color: catColor,
                animation: 'dialogBlink 0.8s steps(1) infinite',
              }}>▼</div>
            )}
          </div>
        </div>

        {/* Choices section */}
        {phase === 'CHOICES' && (
          <div style={{ padding: '10px 12px' }}>
            {/* Question text */}
            <div style={{
              fontSize: 7, color: catColor, marginBottom: 8,
              padding: '5px 8px',
              backgroundColor: '#0a0a20',
              border: `2px solid ${catColor}55`,
              lineHeight: 1.8,
              wordBreak: 'keep-all',
            }}>
              ▶ {question.question}
            </div>

            {/* Option buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {shuffledOptions.map((opt, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt, idx)}
                    style={{
                      textAlign: 'left',
                      padding: '7px 10px',
                      backgroundColor: isSelected ? catColor : '#13132e',
                      color: isSelected ? '#000' : '#ccd0ff',
                      border: `2px solid ${isSelected ? catColor : '#2a2a5a'}`,
                      fontSize: 6.5,
                      lineHeight: 1.7,
                      cursor: selectedIdx !== null ? 'default' : 'pointer',
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                      fontFamily: "'Press Start 2P', monospace",
                      transition: 'background-color 0.1s, border-color 0.1s',
                      wordBreak: 'keep-all',
                    }}
                    onMouseEnter={e => {
                      if (selectedIdx === null) {
                        e.currentTarget.style.backgroundColor = `${catColor}33`;
                        e.currentTarget.style.borderColor = catColor;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#13132e';
                        e.currentTarget.style.borderColor = '#2a2a5a';
                      }
                    }}
                  >
                    <span style={{
                      color: catColor, flexShrink: 0,
                      fontSize: 8, fontWeight: 'bold',
                      minWidth: 16,
                    }}>
                      {CARD_LABELS[idx]}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom hint */}
        {phase === 'TYPING' && textComplete && (
          <div style={{
            padding: '5px 12px',
            backgroundColor: '#0a0a18',
            borderTop: '2px solid #1a1a3a',
            fontSize: 6.5, color: '#444488', textAlign: 'right',
          }}>
            클릭 또는 스페이스바로 계속...
          </div>
        )}
      </div>

      <style>{`
        @keyframes dialogBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default EventDialog;
