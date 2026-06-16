import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send, 
  X, 
  Loader2,
  FileText,
  User,
  ExternalLink,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const BookReader = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL에서 page 파라미터 파싱 (기본값 1, 범위 0~708)
  const initialPage = parseInt(searchParams.get('page'), 10);
  const startPage = isNaN(initialPage) ? 1 : Math.max(0, Math.min(708, initialPage));
  
  const [pageNum, setPageNum] = useState(startPage);
  const [pageInputValue, setPageInputValue] = useState(startPage.toString());
  
  // PDF.js 및 문서 상태
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [pdfScale, setPdfScale] = useState(1.2);
  const [pdfError, setPdfError] = useState(null);
  const canvasRef = useRef(null);
  const activeRenderTaskRef = useRef(null);
  const pdfContainerRef = useRef(null);
  
  // 텍스트 상태 (static 마크다운 기반)
  const [pageTextMap, setPageTextMap] = useState({});
  const [loadingText, setLoadingText] = useState(true);
  
  // 위키식 커스텀 페이지 오버라이드 상태 (Firestore 실시간 반영)
  const [pageOverrides, setPageOverrides] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  
  // 미승인 정정 메모 가시성 상태
  const [showMemos, setShowMemos] = useState(false);
  
  // 사용자 정보 및 권한
  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = currentUser && currentUser.email === 'anstlr6665@gmail.com';
  
  // 오류 보고 상태
  const [errorReports, setErrorReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'pending' | 'reviewed' | 'resolved'
  
  // 신고 모달 상태
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    originalText: '',
    correctedText: '',
    details: '',
    reporter: ''
  });

  // 1. 사용자 인증 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && !reportForm.reporter) {
        setReportForm(prev => ({ ...prev, reporter: user.displayName || user.email }));
      }
    });
    return () => unsubscribe();
  }, [reportForm.reporter]);

  // 2. URL page 파라미터 동기화
  useEffect(() => {
    const pageParam = parseInt(searchParams.get('page'), 10);
    if (!isNaN(pageParam) && pageParam !== pageNum) {
      const validPage = Math.max(0, Math.min(708, pageParam));
      setPageNum(validPage);
      setPageInputValue(validPage.toString());
      setEditMode(false); // 페이지가 바뀌면 편집모드 해제
      setShowMemos(false); // 메모창 닫기
    }
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    const validPage = Math.max(0, Math.min(708, newPage));
    setPageNum(validPage);
    setPageInputValue(validPage.toString());
    setSearchParams({ page: validPage });
    setEditMode(false);
    setShowMemos(false); // 메모창 닫기
  };

  // 3. PDF.js 라이브러리 및 문서 로딩
  useEffect(() => {
    let active = true;
    
    const initPdf = async () => {
      setLoadingPdf(true);
      setPdfError(null);
      
      try {
        // CDN 스크립트 존재 여부 검사 및 주입
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('PDF.js 스크립트 로드 실패'));
            document.head.appendChild(script);
          });
        }
        
        // worker 경로 설정
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const pdfUrl = `${import.meta.env.BASE_URL}새마을운동10년사.pdf`;
        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        
        if (active) {
          setPdfDoc(doc);
          setLoadingPdf(false);
        }
      } catch (err) {
        console.error('PDF 로드 오류:', err);
        if (active) {
          setPdfError('PDF 원본 파일을 읽어오지 못했습니다. 파일 위치나 브라우저 환경을 확인해주세요.');
          setLoadingPdf(false);
        }
      }
    };
    
    initPdf();
    
    return () => {
      active = false;
    };
  }, []);

  // 4. PDF 페이지 렌더링 (Canvas)
  useEffect(() => {
    if (!pdfDoc || pageNum < 1 || loadingPdf) return;
    
    let isCancelled = false;
    
    const renderPdfPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: pdfScale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // 이전 렌더링 작업이 활성화되어 있다면 취소
        if (activeRenderTaskRef.current) {
          activeRenderTaskRef.current.cancel();
        }
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        activeRenderTaskRef.current = renderTask;
        
        await renderTask.promise;
        activeRenderTaskRef.current = null;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('PDF 페이지 렌더링 실패:', err);
        }
      }
    };
    
    renderPdfPage();
    
    return () => {
      isCancelled = true;
      if (activeRenderTaskRef.current) {
        activeRenderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNum, pdfScale, loadingPdf]);

  // 5. static 번역 마크다운 파일 로드 및 페이지 파싱
  useEffect(() => {
    setLoadingText(true);
    const textUrl = `${import.meta.env.BASE_URL}docs/새마을운동10년사_전체.md`;
    
    fetch(textUrl)
      .then(res => {
        if (!res.ok) throw new Error('텍스트 파일 로드 실패');
        return res.arrayBuffer();
      })
      .then(buf => {
        const decodedText = new TextDecoder('utf-8').decode(buf);
        
        // --- (p. X) --- 패턴으로 페이지 분할 파싱
        const sections = decodedText.split(/--- \(p\. (\d+)\) ---/g);
        const map = {};
        
        for (let i = 1; i < sections.length; i += 2) {
          const page = parseInt(sections[i], 10);
          let content = sections[i + 1] || '';
          
          // 가시성 및 개행 보완
          content = content.replace(/^(#{1,6}\s+.*)$/gm, '\n\n$1\n\n');
          content = content.replace(/\*\*([^\*]+?)\*\*(?=[가-힣a-zA-Z0-9])/g, '**$1**\u200B');
          content = content.replace(/\n{3,}/g, '\n\n');
          
          map[page] = content.trim();
        }
        
        setPageTextMap(map);
        setLoadingText(false);
      })
      .catch(err => {
        console.error('텍스트 파싱 에러:', err);
        setLoadingText(false);
      });
  }, []);

  // 6. Firestore 실시간 수정 페이지 오버라이드 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'custom_pages'), (snapshot) => {
      const overrides = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        overrides[data.pageNum] = data.content;
      });
      setPageOverrides(overrides);
    }, (err) => {
      console.error('실시간 수정 페이지 로드 에러:', err);
    });
    return () => unsubscribe();
  }, []);

  // 7. Firestore 실시간 리포트 로딩 (전체 페이지 공유)
  useEffect(() => {
    setLoadingReports(true);
    const q = query(collection(db, 'error_reports'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = [];
      snapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      setErrorReports(reports);
      setLoadingReports(false);
    }, (err) => {
      console.error('오류 보고 데이터 로딩 에러:', err);
      setLoadingReports(false);
    });
    
    return () => unsubscribe();
  }, []);

  // 8. 오류 신고 전송
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.originalText.trim() && !reportForm.correctedText.trim() && !reportForm.details.trim()) {
      alert('신고 내용을 채워주세요.');
      return;
    }
    
    setSubmittingReport(true);
    try {
      await addDoc(collection(db, 'error_reports'), {
        page: pageNum,
        originalText: reportForm.originalText,
        correctedText: reportForm.correctedText,
        details: reportForm.details,
        reporter: reportForm.reporter || '익명 기여자',
        uid: currentUser ? currentUser.uid : 'anonymous',
        email: currentUser ? currentUser.email : 'anonymous',
        status: 'pending', // pending | reviewed | resolved
        createdAt: Timestamp.now()
      });
      
      alert(`성공적으로 접수되었습니다. 소중한 참여 감사합니다! (페이지 ${pageNum})`);
      setReportModalOpen(false);
      
      // 폼 초기화
      setReportForm({
        originalText: '',
        correctedText: '',
        details: '',
        reporter: currentUser ? (currentUser.displayName || currentUser.email) : ''
      });
    } catch (err) {
      console.error('오류 신고 등록 에러:', err);
      alert('등록 중 에러가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // 9. 관리자: 상태 업데이트
  const handleUpdateReportStatus = async (reportId, newStatus) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'error_reports', reportId), {
        status: newStatus
      });
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // 10. 관리자: 신고 삭제
  const handleDeleteReport = async (reportId) => {
    if (!isAdmin) return;
    if (!window.confirm('이 오류 정정 제안을 완전히 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, 'error_reports', reportId));
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  // 11. 관리자: 위키 직접 편집 및 저장
  const handleStartEdit = () => {
    const currentText = pageOverrides[pageNum] !== undefined 
      ? pageOverrides[pageNum] 
      : (pageTextMap[pageNum] || '');
    setEditText(currentText);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await setDoc(doc(db, 'custom_pages', `page_${pageNum}`), {
        pageNum: pageNum,
        content: editText,
        updatedAt: Timestamp.now(),
        updatedBy: currentUser ? (currentUser.displayName || currentUser.email) : 'admin'
      });
      setEditMode(false);
    } catch (err) {
      console.error('본문 저장 실패:', err);
      alert('저장에 실패했습니다. 권한이 없거나 네트워크 에러입니다.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  // 12. 관리자: 원클릭 정정 승인 및 본문 치환 자동화
  const handleApproveAndApply = async (report) => {
    if (!isAdmin) return;
    if (!window.confirm(`제 ${report.page}페이지에 이 정정안을 즉시 치환 반영하시겠습니까?\n\n[기존]: ${report.originalText}\n[정정]: ${report.correctedText}`)) return;
    
    try {
      // 1. 해당 페이지의 텍스트 확보
      let baseText = pageOverrides[report.page] !== undefined 
        ? pageOverrides[report.page] 
        : (pageTextMap[report.page] || '');
        
      if (!baseText) {
        alert('해당 페이지의 텍스트가 아직 번역/등록되지 않았습니다. 직접 편집으로 텍스트를 먼저 입력해주세요.');
        return;
      }
      
      // 2. 오타 치환 검사
      if (report.originalText && !baseText.includes(report.originalText)) {
        if (!window.confirm('기존 오류 문구가 페이지 텍스트에 포함되어 있지 않습니다. 제안된 텍스트와 대소문자/띄어쓰기가 일치하는지 확인해 주세요. 계속 치환을 시도하시겠습니까?')) {
          return;
        }
      }
      
      const newContent = baseText.replaceAll(report.originalText, report.correctedText);
      
      // 3. custom_pages에 저장
      await setDoc(doc(db, 'custom_pages', `page_${report.page}`), {
        pageNum: report.page,
        content: newContent,
        updatedAt: Timestamp.now(),
        updatedBy: `System (Admin Approved: ${currentUser?.email || 'admin'})`
      });
      
      // 4. 오류 보고 상태를 resolved 로 업데이트
      await updateDoc(doc(db, 'error_reports', report.id), {
        status: 'resolved'
      });
      
      alert('정정 사항이 본문에 성공적으로 반영되었습니다!');
    } catch (err) {
      console.error('승인 처리 중 에러:', err);
      alert('처리에 실패했습니다.');
    }
  };

  // 13. 단축어/챕터 레이아웃 텍스트 매핑
  const getPageSectionTitle = (p) => {
    if (p === 0) return '오류 정정 대시보드';
    if (p >= 1 && p <= 4) return '도비라 및 화보';
    if (p >= 5 && p <= 6) return '발간사';
    if (p >= 7 && p <= 8) return '서문';
    if (p >= 9 && p <= 12) return '목차';
    if (p >= 13 && p <= 72) return '제1장 사적 배경';
    if (p >= 73 && p <= 160) return '제2장 기본 정신';
    if (p >= 161 && p <= 216) return '제3장 추진 체제';
    if (p >= 217 && p <= 350) return '제4장 발전 과정';
    if (p >= 351 && p <= 584) return '제5장 실적과 성과';
    if (p >= 585 && p <= 616) return '제6장 평가';
    if (p >= 617 && p <= 652) return '제7장 미래의 과제';
    return '부록';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle size={12} /> 수정반영됨</span>;
      case 'reviewed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200"><Clock size={12} /> 검토완료</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 animate-pulse"><AlertCircle size={12} /> 검토대기</span>;
    }
  };

  // 현재 페이지의 미승인 오류 신고건 필터링
  const currentPageReports = errorReports.filter(r => r.page === pageNum && r.status !== 'resolved');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pt-20">
      
      {/* eBook Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/hub')} 
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/40"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 bg-saemaul-green/20 text-saemaul-green rounded border border-saemaul-green/30">e-Book Reader</span>
              <h1 className="text-base font-black text-slate-100 tracking-tight hidden sm:inline">새마을운동 10년사 (1981년 발간)</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              현재 섹션: <span className="text-amber-500 font-bold">{getPageSectionTitle(pageNum)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 오류 제안 버튼 (0페이지가 아닐 때 노출) */}
          {pageNum > 0 && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <AlertTriangle size={14} />
              오류 정정 제안
            </button>
          )}

          {/* 대시보드로 가기 버튼 */}
          {pageNum !== 0 ? (
            <button
              onClick={() => handlePageChange(0)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer"
            >
              <MessageSquare size={14} />
              오류 대시보드 (0p)
            </button>
          ) : (
            <button
              onClick={() => handlePageChange(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer"
            >
              <BookOpen size={14} />
              본문 열람하기 (1p)
            </button>
          )}
        </div>
      </header>

      {/* Main View Split Screen */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative" style={{ height: 'calc(100vh - 144px)' }}>
        
        {/* ==================== LEFT SIDE: PDF ORIGINAL ==================== */}
        <div className="w-full md:w-1/2 bg-slate-950 flex flex-col border-r border-slate-800 overflow-hidden h-1/2 md:h-full">
          
          {/* PDF Tools */}
          {pageNum > 0 && (
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-slate-400 text-xs flex-shrink-0">
              <span className="font-semibold flex items-center gap-1.5"><FileText size={14} /> 원문 PDF 페이지</span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPdfScale(prev => Math.max(0.6, prev - 0.1))} 
                  title="축소"
                  className="p-1 rounded hover:bg-slate-800/50 hover:text-white"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="font-mono text-slate-300 select-none">{Math.round(pdfScale * 100)}%</span>
                <button 
                  onClick={() => setPdfScale(prev => Math.min(2.0, prev + 0.1))} 
                  title="확대"
                  className="p-1 rounded hover:bg-slate-800/50 hover:text-white"
                >
                  <ZoomIn size={16} />
                </button>
                <button 
                  onClick={() => setPdfScale(1.2)} 
                  title="초기화"
                  className="p-1 rounded hover:bg-slate-800/50 hover:text-white"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          )}

          {/* PDF Canvas Frame */}
          <div 
            ref={pdfContainerRef}
            className="flex-grow overflow-auto p-4 flex justify-center items-start bg-slate-900/60"
          >
            {pageNum === 0 ? (
              // 0페이지 대시보드의 왼쪽 패널: 가이드 및 통계
              <div className="max-w-md my-auto px-6 py-10 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl animate-fadeIn text-center">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-inner">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-100 tracking-tight mb-3">10년사 디지털 복원 사업</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                  본 디지털 아카이브는 대한민국 국가기록원이 보존하는 <strong>새마을운동 10년사</strong> 원본 도서를 고해상도 스캔하여, AI OCR 번역과 문맥 대조 필터링을 통해 현대적 마크다운(Hanja-to-Hangul)으로 복구하고 있습니다.
                </p>
                
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">총 페이지</span>
                    <span className="text-lg font-black text-indigo-400 font-mono">708p</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">복원 진행</span>
                    <span className="text-lg font-black text-saemaul-green font-mono">59p</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">접수건수</span>
                    <span className="text-lg font-black text-amber-500 font-mono">
                      {loadingReports ? '...' : errorReports.length}건
                    </span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-left">
                  <div className="flex gap-2.5 items-start">
                    <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-amber-400 text-xs font-extrabold mb-1">집단지성 정정 제안</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        한문 표기, 고어 단어, 오독(예: 國難克服 → 麗羅克服)을 발견하여 각 페이지에서 정정안을 제출해 주시면 대시보드에 실시간 반영 및 데이터 정제에 활용됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : loadingPdf ? (
              <div className="flex flex-col items-center justify-center my-auto gap-3 text-slate-400">
                <Loader2 size={36} className="animate-spin text-saemaul-green" />
                <p className="text-xs font-bold tracking-wider">PDF 문서 로딩 중...</p>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center my-auto gap-4 p-6 max-w-sm text-center">
                <AlertCircle size={40} className="text-red-500" />
                <p className="text-sm font-bold text-slate-300 leading-relaxed">{pdfError}</p>
                <a 
                  href={`${import.meta.env.BASE_URL}새마을운동10년사.pdf`}
                  download
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-700/60 inline-flex items-center gap-1.5"
                >
                  PDF 파일 직접 다운로드 <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <div className="shadow-2xl border border-slate-800/80 bg-white inline-block">
                <canvas ref={canvasRef} />
              </div>
            )}
          </div>
        </div>

        {/* ==================== RIGHT SIDE: MD TRANSLATED TEXT ==================== */}
        <div className="w-full md:w-1/2 bg-slate-900 flex flex-col overflow-hidden h-1/2 md:h-full">
          
          <div className="bg-slate-900 border-b border-slate-800/80 px-5 py-2.5 flex items-center justify-between text-slate-400 text-xs flex-shrink-0">
            <span className="font-semibold flex items-center gap-1.5">
              <FileText size={14} /> 
              {pageNum === 0 ? '제안된 오류 정정 레포트 목록' : `텍스트 아카이브 (현대어 및 한글 병기)`}
            </span>
            
            <div className="flex items-center gap-2">
              {isAdmin && pageNum > 0 && (
                editMode ? (
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="px-2.5 py-1 text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {savingEdit ? <Loader2 size={12} className="animate-spin" /> : '저장'}
                    </button>
                    <button 
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={savingEdit}
                      className="px-2.5 py-1 text-[11px] font-black bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={handleStartEdit}
                    className="px-2.5 py-1 text-[11px] font-black bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    본문 직접 편집 ✏️
                  </button>
                )
              )}
              {pageNum > 0 && (
                <span className="font-bold text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">
                  {pageOverrides[pageNum] !== undefined ? '위키수정본' : (pageTextMap[pageNum] ? '번역 완료' : '초안 검수대기')}
                </span>
              )}
            </div>
          </div>

          <div className="flex-grow overflow-auto p-6 md:p-10 bg-slate-900 text-slate-300">
            
            {/* 0페이지 대시보드 리포트 목록 */}
            {pageNum === 0 ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-black text-white">오류 정정 피드백</h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">참여자들이 제안해주신 정정 목록입니다.</p>
                  </div>
                  
                  {/* 필터 탭 */}
                  <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: 'all', label: '전체' },
                      { id: 'pending', label: '대기' },
                      { id: 'reviewed', label: '완료' },
                      { id: 'resolved', label: '반영' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setReportFilter(tab.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          reportFilter === tab.id 
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingReports ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                    <Loader2 size={30} className="animate-spin text-indigo-500" />
                    <p className="text-xs">오류 보고 데이터를 로드하는 중...</p>
                  </div>
                ) : errorReports.filter(r => reportFilter === 'all' || r.status === reportFilter).length === 0 ? (
                  <div className="py-20 text-center bg-slate-950/40 rounded-3xl border border-dashed border-slate-800 animate-fadeIn">
                    <MessageSquare size={32} className="mx-auto text-slate-700 mb-3" />
                    <h4 className="text-sm font-bold text-slate-400">접수된 오류 정정 제안이 없습니다.</h4>
                    <p className="text-xs text-slate-600 mt-1">1~708페이지 본문에서 제안을 제출할 수 있습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {errorReports
                      .filter(r => reportFilter === 'all' || r.status === reportFilter)
                      .map((report) => (
                        <div 
                          key={report.id}
                          className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button 
                                type="button"
                                onClick={() => handlePageChange(report.page)}
                                className="px-2.5 py-1 text-xs font-black bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg border border-indigo-500/20 flex items-center gap-1 transition-all cursor-pointer"
                              >
                                {report.page} 페이지 원문이동 <ExternalLink size={10} />
                              </button>
                              {getStatusBadge(report.status)}
                            </div>
                            
                            <span className="text-[11px] text-slate-500 font-mono">
                              {report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : ''}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60 text-xs">
                            <div>
                              <span className="block text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">오류 내용</span>
                              <p className="text-slate-300 font-semibold bg-red-950/20 px-2 py-1 rounded border border-red-500/10 line-clamp-3 break-all font-mono">
                                {report.originalText || '(내용 없음)'}
                              </p>
                            </div>
                            <div>
                              <span className="block text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">정정 제안</span>
                              <p className="text-slate-100 font-semibold bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/10 line-clamp-3 break-all font-mono">
                                {report.correctedText || '(내용 없음)'}
                              </p>
                            </div>
                          </div>

                          {report.details && (
                            <div>
                              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">이유/의견</span>
                              <p className="text-slate-400 text-xs leading-relaxed font-medium bg-slate-900/40 p-3 rounded-lg border border-slate-900">
                                {report.details}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-slate-900/80 pt-3 text-[11px] text-slate-500">
                            <div className="flex items-center gap-1 font-semibold text-slate-400">
                              <User size={12} className="text-indigo-400" />
                              <span>{report.reporter}</span>
                              {report.email && report.email !== 'anonymous' && (
                                <span className="text-slate-600">({report.email})</span>
                              )}
                            </div>

                            {/* 관리자 도구 */}
                            {isAdmin && (
                              <div className="flex items-center gap-2">
                                {report.status !== 'resolved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveAndApply(report)}
                                    className="px-2.5 py-1 text-[11px] font-black bg-emerald-600/20 hover:bg-emerald-700 text-emerald-400 rounded-lg border border-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer mr-2"
                                  >
                                    정정 승인 및 즉시 반영 ✅
                                  </button>
                                )}
                                <select 
                                  value={report.status} 
                                  onChange={(e) => handleUpdateReportStatus(report.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded px-2 py-1 outline-none font-bold cursor-pointer"
                                >
                                  <option value="pending">대기 중</option>
                                  <option value="reviewed">검토 완료</option>
                                  <option value="resolved">반영 완료</option>
                                </select>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="text-red-400 hover:text-red-500 font-bold ml-1 bg-red-950/30 hover:bg-red-950/75 px-2 py-1 rounded transition-all cursor-pointer"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : editMode ? (
              // 위키식 직접 편집 모드
              <div className="flex flex-col h-full gap-4 animate-fadeIn">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-grow w-full h-[450px] min-h-[400px] bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-6 text-slate-200 placeholder-slate-600 outline-none font-mono text-sm leading-relaxed"
                  placeholder="여기에 이 페이지의 마크다운 번역본 텍스트를 입력해 주세요."
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={savingEdit}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
                    저장 및 실시간 반영
                  </button>
                </div>
              </div>
            ) : (
              // 일반 본문 페이지 마크다운 렌더링
              <div className="flex flex-col gap-4 text-left">
                {/* 이 페이지에 제안된 오류 정정 메모 (미반영 건) */}
                {pageNum > 0 && currentPageReports.length > 0 && (
                  <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                        <AlertTriangle size={16} />
                        <span>이 페이지에 접수된 정정 제안 ({currentPageReports.length}건)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMemos(!showMemos)}
                        className="text-xs font-bold text-amber-500 hover:text-amber-400 underline cursor-pointer"
                      >
                        {showMemos ? '접기' : '의견 보기'}
                      </button>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                      아직 승인 대기 중인 독자 의견입니다. 본문을 읽으실 때 참고하시기 바랍니다.
                    </p>

                    {showMemos && (
                      <div className="mt-3.5 space-y-2.5 border-t border-amber-500/10 pt-3 text-xs">
                        {currentPageReports.map((report) => (
                          <div key={report.id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-semibold text-slate-400">{report.reporter} 님의 의견</span>
                              <span>{report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap font-mono text-slate-300">
                              <span className="line-through text-red-400 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-500/5">{report.originalText}</span>
                              <span className="text-slate-500">→</span>
                              <span className="text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/5 font-bold">{report.correctedText}</span>
                            </div>
                            {report.details && (
                              <p className="text-slate-400 text-[11px] leading-relaxed pl-1 italic">
                                💬 "{report.details}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <article className="prose prose-invert max-w-none">
                  {loadingText ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                      <Loader2 size={30} className="animate-spin text-saemaul-green" />
                      <p className="text-xs font-bold">번역 텍스트 수합 중...</p>
                    </div>
                  ) : (pageOverrides[pageNum] !== undefined || pageTextMap[pageNum]) ? (
                    <div className="font-serif leading-relaxed text-slate-200">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({children}) => <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-6 leading-tight pb-3 border-b border-slate-800">{children}</h1>,
                          h2: ({children}) => <h2 className="text-xl sm:text-2xl font-black text-indigo-400 mt-8 mb-4">{children}</h2>,
                          h3: ({children}) => <h3 className="text-lg sm:text-xl font-bold text-slate-200 mt-6 mb-3 border-l-4 border-saemaul-green pl-3">{children}</h3>,
                          p: ({children}) => <p className="text-slate-300 text-sm sm:text-base leading-8 mb-5 break-keep font-medium">{children}</p>,
                          strong: ({children}) => <strong className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded border border-amber-500/10">{children}</strong>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-indigo-500 bg-slate-950/60 px-5 py-3 rounded-r-xl my-6 text-slate-400 text-xs sm:text-sm font-medium">{children}</blockquote>,
                          ul: ({children}) => <ul className="list-disc pl-5 space-y-2 mb-6 text-slate-300 text-sm">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-5 space-y-2 mb-6 text-slate-300 text-sm">{children}</ol>,
                          li: ({children}) => <li className="pl-1">{children}</li>,
                          table: ({children}) => (
                            <div className="overflow-x-auto my-6 w-full border border-slate-800 rounded-xl bg-slate-950/40">
                              <table className="min-w-full border-collapse divide-y divide-slate-800 text-xs sm:text-sm">{children}</table>
                            </div>
                          ),
                          thead: ({children}) => <thead className="bg-slate-900 font-bold text-slate-200">{children}</thead>,
                          th: ({children}) => <th className="px-4 py-2.5 border-b border-slate-800 text-left font-bold">{children}</th>,
                          td: ({children}) => <td className="px-4 py-2.5 border-b border-slate-800/50 text-slate-300 font-medium bg-slate-950/20">{children}</td>
                        }}
                      >
                        {pageOverrides[pageNum] !== undefined ? pageOverrides[pageNum] : pageTextMap[pageNum]}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    // 번역이 아직 진행되지 않은 페이지(60~708p)를 위한 가이드 카드
                    <div className="max-w-md mx-auto my-12 bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl animate-fadeIn text-left">
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/20">
                        <AlertTriangle size={24} />
                      </div>
                      <h3 className="text-lg font-black text-slate-200 mb-2">텍스트 복원 진행 중인 페이지</h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                        현재 <strong>새마을운동 10년사</strong> 현대어 번역 및 디지털 정제 작업이 진행 중입니다. (1~59페이지 수록 완료)
                        <br /><br />
                        좌측의 <strong>PDF 원본 파일</strong>을 참조해 읽으실 수 있습니다.
                      </p>
                      
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
                        <h4 className="text-slate-300 text-xs font-bold">오타 교정 및 한문 해석 제안 참여</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          해당 페이지의 번역 초안을 등록하거나 한자 오타 교정을 제안하고 싶으시다면, 우측 상단의 <strong>[오류 정정 제안]</strong> 버튼을 통해 제출해주시면 최종 버전에 반영됩니다.
                        </p>
                        <button
                          type="button"
                          onClick={() => setReportModalOpen(true)}
                          className="w-full mt-1 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all cursor-pointer"
                        >
                          이 페이지 번역/정정 제안하기
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM PAGE NAVIGATION BAR ==================== */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-center flex-shrink-0 z-10">
        <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 shadow-md">
          {/* 이전 버튼 */}
          <button 
            type="button"
            disabled={pageNum === 0}
            onClick={() => handlePageChange(pageNum - 1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="이전 페이지"
          >
            <ChevronLeft size={20} />
          </button>

          {/* 페이지 입력 필드 */}
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(pageInputValue, 10);
                  if (!isNaN(val)) {
                    handlePageChange(val);
                  }
                }
              }}
              onBlur={() => {
                const val = parseInt(pageInputValue, 10);
                if (!isNaN(val)) {
                  handlePageChange(val);
                } else {
                  setPageInputValue(pageNum.toString());
                }
              }}
              className="w-12 bg-slate-950 border border-slate-700 text-center py-1 rounded-lg text-sm font-bold font-mono text-white focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-slate-500 text-xs font-bold select-none">/ 708</span>
          </div>

          {/* 다음 버튼 */}
          <button 
            type="button"
            disabled={pageNum === 708}
            onClick={() => handlePageChange(pageNum + 1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="다음 페이지"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </footer>

      {/* ==================== MODAL: ERROR REPORTING ==================== */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">오류 신고 및 정정 제안</h4>
                  <p className="text-xs text-slate-400 font-medium">제 {pageNum}페이지에 대한 교정안을 보냅니다.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReport} className="p-6 flex flex-col gap-4 text-sm">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs">페이지 번호</label>
                <input 
                  type="text" 
                  value={`${pageNum} 페이지`} 
                  disabled 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 font-extrabold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs">오류 문구 (기존)</label>
                <textarea 
                  placeholder="오인식되었거나 오타가 난 부분을 복사해 적어주세요. (예: 麗羅克服)"
                  value={reportForm.originalText}
                  onChange={(e) => setReportForm(prev => ({ ...prev, originalText: e.target.value }))}
                  className="w-full h-18 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs">정정 제안 문구 (수정안)</label>
                <textarea 
                  placeholder="올바르게 수정할 한글 및 한자 병기안을 적어주세요. (예: 국난극복(國難克服))"
                  value={reportForm.correctedText}
                  onChange={(e) => setReportForm(prev => ({ ...prev, correctedText: e.target.value }))}
                  className="w-full h-18 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs">이유/의견 (선택사항)</label>
                <textarea 
                  placeholder="오류 판단 근거나 추가 설명을 적어주세요."
                  value={reportForm.details}
                  onChange={(e) => setReportForm(prev => ({ ...prev, details: e.target.value }))}
                  className="w-full h-18 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 text-xs">작성자</label>
                  <input 
                    type="text" 
                    placeholder="작성자 닉네임"
                    value={reportForm.reporter}
                    onChange={(e) => setReportForm(prev => ({ ...prev, reporter: e.target.value }))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    disabled={submittingReport}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {submittingReport ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        보내기
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookReader;
