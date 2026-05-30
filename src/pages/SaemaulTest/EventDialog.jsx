import React, { useState, useEffect, useRef } from 'react';

const CARD_LABELS = ['A', 'B', 'C', 'D', 'E'];

const CATEGORY_KO = {
  DILIGENCE: '근면',
  SELF_HELP: '자조',
  COOPERATION: '협동',
  SHARING: '나눔',
  SERVICE: '봉사',
  CREATIVITY: '창조',
};

const CATEGORY_COLORS = {
  DILIGENCE: '#ff6b35',
  SELF_HELP: '#4fc3f7',
  COOPERATION: '#66bb6a',
  SHARING: '#f48fb1',
  SERVICE: '#ce93d8',
  CREATIVITY: '#ffd54f',
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
        position: 'absolute', inset: 0, zIndex: 2000,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        fontFamily: "'Presentation', 'Outfit', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* Semi-transparent backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', cursor: 'pointer' }}
        onClick={handleSkipOrAdvance}
      />

      {/* Main Dialog Box */}
      <div className="event-dialog-box">

        {/* Quest header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: catColor,
          borderBottom: `4px solid #000`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#000', letterSpacing: 0.5 }}>
              ★ QUEST {questNum}
            </span>
            <span style={{
              fontSize: 13, color: '#000',
              fontWeight: 'bold',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '3px 8px',
            }}>
              [{CATEGORY_KO[question.category] || question.category}]
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#000',
              fontSize: 18, cursor: 'pointer', fontFamily: 'inherit',
              padding: '0 6px',
            }}
          >✕</button>
        </div>

        {/* Story + Image section */}
        <div className="event-dialog-story-sec">
          {/* Quest Illustration */}
          <div className="event-dialog-illus">
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
            className="event-dialog-text"
            onClick={handleSkipOrAdvance}
          >
            <p style={{
              fontSize: 15, lineHeight: 1.8,
              color: '#d8d8ff', margin: 0,
              wordBreak: 'keep-all',
              fontWeight: 500,
            }}>
              {displayedText}
              {!textComplete && (
                <span style={{ animation: 'dialogBlink 0.6s steps(1) infinite', color: catColor }}>█</span>
              )}
            </p>
            {textComplete && phase === 'TYPING' && (
              <div style={{
                position: 'absolute', bottom: 8, right: 12,
                fontSize: 15, color: catColor,
                animation: 'dialogBlink 0.8s steps(1) infinite',
              }}>▼</div>
            )}
          </div>
        </div>

        {/* Choices section */}
        {phase === 'CHOICES' && (
          <div className="event-dialog-choices" style={{ padding: '14px 16px' }}>
            {/* Question text */}
            <div style={{
              fontSize: 15, color: catColor, marginBottom: 14,
              padding: '10px 16px',
              backgroundColor: '#0a0a20',
              border: `2px solid ${catColor}55`,
              lineHeight: 1.7,
              wordBreak: 'keep-all',
              fontWeight: 600,
            }}>
              ▶ {question.question}
            </div>

            {/* Option buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {shuffledOptions.map((opt, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={idx}
                    className="event-dialog-opt-btn"
                    onClick={() => handleSelect(opt, idx)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      backgroundColor: isSelected ? catColor : '#13132e',
                      color: isSelected ? '#000' : '#ccd0ff',
                      border: `2px solid ${isSelected ? catColor : '#2a2a5a'}`,
                      fontSize: 14,
                      lineHeight: 1.6,
                      cursor: selectedIdx !== null ? 'default' : 'pointer',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.1s, border-color 0.1s',
                      wordBreak: 'keep-all',
                      fontWeight: 600,
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
                      fontSize: 15, fontWeight: 'bold',
                      minWidth: 20,
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
            padding: '7px 16px',
            backgroundColor: '#0a0a18',
            borderTop: '2px solid #1a1a3a',
            fontSize: 12, color: '#6666aa', textAlign: 'right',
            fontWeight: 500,
            flexShrink: 0,
          }}>
            클릭 또는 스페이스바로 계속...
          </div>
        )}
      </div>

      <style>{`
        .event-dialog-box {
          position: relative;
          z-index: 10;
          margin: 10px auto;
          width: min(860px, calc(100% - 16px));
          max-height: calc(100% - 20px);
          background-color: #08081a;
          border: 4px solid ${catColor};
          box-shadow: 0 0 0 8px #000, 0 0 0 14px ${catColor}44, 0 -12px 50px rgba(0,0,0,0.9);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          image-rendering: pixelated;
        }
        .event-dialog-story-sec {
          display: flex;
          flex-direction: row;
          border-bottom: ${phase === 'CHOICES' ? '4px solid #111133' : 'none'};
          flex-shrink: 0;
        }
        .event-dialog-illus {
          width: 140px;
          height: auto;
          flex-shrink: 0;
          border-right: 4px solid ${catColor}44;
          background-color: #111122;
          position: relative;
          overflow: hidden;
        }
        .event-dialog-text {
          flex: 1;
          padding: 14px 18px;
          background-color: #0d0d22;
          min-height: 120px;
          max-height: 200px;
          overflow-y: auto;
          cursor: pointer;
          position: relative;
        }
        
        @media (max-width: 640px) {
          .event-dialog-box {
            margin: 5px auto;
            width: calc(100% - 10px);
            max-height: calc(100% - 10px);
            border-width: 3px;
          }
          .event-dialog-story-sec {
            flex-direction: column;
          }
          .event-dialog-illus {
            width: 100%;
            height: 90px;
            border-right: none;
            border-bottom: 3px solid ${catColor}44;
          }
          .event-dialog-text {
            padding: 10px 12px;
            min-height: 80px;
            max-height: 120px;
          }
          .event-dialog-choices {
            padding: 10px 10px !important;
          }
          .event-dialog-opt-btn {
            padding: 8px 10px !important;
            font-size: 13px !important;
          }
        }
        @keyframes dialogBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default EventDialog;
