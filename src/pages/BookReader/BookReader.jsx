import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  Menu,
  Loader2,
  FileText,
  User,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Globe,
  Settings,
  Search
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  setDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// 도서 설정 상수
const BOOKS_CONFIG = {
  "10years": {
    title: "새마을운동 10년사",
    pdfName: "새마을운동10년사.pdf",
    mdName: "saemaul_10years_full.md",
    maxPage: 708,
    frontPageCount: 14,
    hasMultilang: true
  },
  "glory": {
    title: "영광의 발자취 (마을단위 새마을운동 추진사)",
    pdfName: "saemaul_glory.pdf",
    mdName: "saemaul_glory_full.md",
    maxPage: 984,
    frontPageCount: 0,
    hasMultilang: true
  }
};

// UI 다국어 번역 사전
const TRANSLATIONS = {
  ko: {
    reader: "e-Book Reader",
    currentSection: "현재 섹션",
    searchText: "본문 검색",
    suggestCorrection: "오류 정정 제안",
    dashboardTitle: "오류 제안 피드백 대시보드",
    dashboardDesc: "독자들이 원클릭으로 제출한 오타 및 한문 오독 수정안 목록입니다. 관리자는 제안들을 검토하여 즉시 승인(본문 반영) 및 삭제 처리할 수 있습니다.",
    dashboard0p: "오류 대시보드 (0p)",
    readBook1p: "본문 열람하기 (1p)",
    filterAll: "전체 목록",
    filterPending: "승인 대기",
    filterResolved: "적용 완료",
    emptyReports: "조건에 부합하는 정정 제안 피드백이 존재하지 않습니다.",
    loadingReports: "오류 제안 목록을 수합 중...",
    loadingText: "번역 텍스트 수합 중...",
    loadingPdf: "PDF 원본 렌더링 중...",
    originalAuthor: "제안 작성자",
    submittedTime: "제출 시간",
    goToPage: "페이지로 가기",
    originalText: "원본 본문 (수정 전)",
    correctedText: "정정 제안 본문",
    details: "상세 설명 / 건의 이유 (선택사항)",
    detailsLabel: "상세 코멘트",
    cancel: "취소",
    approveApply: "승인 및 즉시 반영",
    editApply: "정정안 편집 반영",
    manualResolve: "수동 처리완료",
    delete: "삭제",
    editLangTitle: "수정 중인 언어",
    fetchDraft: "Google 자동 번역 초안 가져오기",
    fetchDraftProgress: "번역 초안 생성 중...",
    saveLive: "저장 및 실시간 반영",
    openMemos: "이 페이지에 접수된 정정 제안",
    openMemosDesc: "아직 승인 대기 중인 독자 의견입니다. 본문을 읽으실 때 참고하시기 바랍니다.",
    showMemos: "의견 보기",
    hideMemos: "접기",
    anonymousUser: "익명 기여자",
    noChangeAlert: "변경된 내용이 없습니다. 본문 텍스트를 수정한 후 제출해 주세요.",
    emptyContentAlert: "정정할 본문 텍스트 내용을 입력해 주세요.",
    submitSuccessAlert: "오류 정정안이 성공적으로 제출되었습니다. 관리자 검토 후 본문에 즉시 반영됩니다!",
    deleteConfirm: "이 오류 정정 제안을 완전히 삭제하시겠습니까?",
    applyConfirm: "페이지에 이 정정안을 즉시 반영하시겠습니까?\n\n(본문 전체가 제안된 정정본으로 교체됩니다.)",
    applySuccessAlert: "정정 사항이 본문에 성공적으로 반영되었습니다!",
    translationNotFound: "번역본이 준비되지 않은 페이지입니다.",
    translationNotFoundDesc: "선택하신 언어의 번역 텍스트가 아직 준비되지 않았습니다. Google 무료 번역 API를 사용해 실시간 번역으로 읽어보시겠습니까?",
    readRealtime: "Google 실시간 번역으로 읽기",
    readKoreanOrigin: "한국어 원문으로 읽기",
    machineTranslated: "Machine Translated (Google Translate)",
    machineTranslatedDesc: "이 본문은 구글 무료 번역 API를 통해 실시간 기계 번역된 내용입니다.",
    searchPlaceholder: "찾고 싶은 키워드 입력...",
    searchPanelTitle: "본문 키워드 검색",
    errorPageLabel: "오류 페이지",
    submitButton: "제안 제출하기",
    langFilterLabel: "대시보드 언어 필터",
    langAll: "모든 언어",
    langKo: "한국어",
    langEn: "영어",
    langEs: "스페인어",
    langFr: "프랑스어",
    langZh: "중국어",
    langVi: "베트남어",
    originalTextReadOnly: "읽기 전용",
    correctedTextHelp: "이 창에서 직접 오타를 수정해 주세요",
    detailReasonHelp: "예: ~은 오타이며, 원문 한문 상 ~의 뜻이 맞기에 이를 건의합니다.",
    dashboardTitleBtn: "대시보드",
    sectionToc: "목차 및 서문",
    sectionIntro: "서문 및 화보",
    sectionBody: "본문"
  },
  ko_hanja: {
    reader: "e-Book Reader",
    currentSection: "현재 섹션",
    searchText: "본문 검색",
    suggestCorrection: "오류 정정 제안",
    dashboardTitle: "오류 제안 피드백 대시보드",
    dashboardDesc: "독자들이 원클릭으로 제출한 오타 및 한문 오독 수정안 목록입니다. 관리자는 제안들을 검토하여 즉시 승인(본문 반영) 및 삭제 처리할 수 있습니다.",
    dashboard0p: "오류 대시보드 (0p)",
    readBook1p: "본문 열람하기 (1p)",
    filterAll: "전체 목록",
    filterPending: "승인 대기",
    filterResolved: "적용 완료",
    emptyReports: "조건에 부합하는 정정 제안 피드백이 존재하지 않습니다.",
    loadingReports: "오류 제안 목록을 수합 중...",
    loadingText: "번역 텍스트 수합 중...",
    loadingPdf: "PDF 원본 렌더링 중...",
    originalAuthor: "제안 작성자",
    submittedTime: "제출 시간",
    goToPage: "페이지로 가기",
    originalText: "원본 본문 (수정 전)",
    correctedText: "정정 제안 본문",
    details: "상세 설명 / 건의 이유 (선택사항)",
    detailsLabel: "상세 코멘트",
    cancel: "취소",
    approveApply: "승인 및 즉시 반영",
    editApply: "정정안 편집 반영",
    manualResolve: "수동 처리완료",
    delete: "삭제",
    editLangTitle: "수정 중인 언어",
    fetchDraft: "Google 자동 번역 초안 가져오기",
    fetchDraftProgress: "번역 초안 생성 중...",
    saveLive: "저장 및 실시간 반영",
    openMemos: "이 페이지에 접수된 정정 제안",
    openMemosDesc: "아직 승인 대기 중인 독자 의견입니다. 본문을 읽으실 때 참고하시기 바랍니다.",
    showMemos: "의견 보기",
    hideMemos: "접기",
    anonymousUser: "익명 기여자",
    noChangeAlert: "변경된 내용이 없습니다. 본문 텍스트를 수정한 후 제출해 주세요.",
    emptyContentAlert: "정정할 본문 텍스트 내용을 입력해 주세요.",
    submitSuccessAlert: "오류 정정안이 성공적으로 제출되었습니다. 관리자 검토 후 본문에 즉시 반영됩니다!",
    deleteConfirm: "이 오류 정정 제안을 완전히 삭제하시겠습니까?",
    applyConfirm: "페이지에 이 정정안을 즉시 반영하시겠습니까?\n\n(본문 전체가 제안된 정정본으로 교체됩니다.)",
    applySuccessAlert: "정정 사항이 본문에 성공적으로 반영되었습니다!",
    translationNotFound: "번역본이 준비되지 않은 페이지입니다.",
    translationNotFoundDesc: "선택하신 언어의 번역 텍스트가 아직 준비되지 않았습니다. Google 무료 번역 API를 사용해 실시간 번역으로 읽어보시겠습니까?",
    readRealtime: "Google 실시간 번역으로 읽기",
    readKoreanOrigin: "한국어 원문으로 읽기",
    machineTranslated: "Machine Translated (Google Translate)",
    machineTranslatedDesc: "이 본문은 구글 무료 번역 API를 통해 실시간 기계 번역된 내용입니다.",
    searchPlaceholder: "찾고 싶은 키워드 입력...",
    searchPanelTitle: "본문 키워드 검색",
    errorPageLabel: "오류 페이지",
    submitButton: "제안 제출하기",
    langFilterLabel: "대시보드 언어 필터",
    langAll: "모든 언어",
    langKo: "한국어",
    langEn: "영어",
    langEs: "스페인어",
    langFr: "프랑스어",
    langZh: "중국어",
    langVi: "베트남어",
    originalTextReadOnly: "읽기 전용",
    correctedTextHelp: "이 창에서 직접 오타를 수정해 주세요",
    detailReasonHelp: "예: ~은 오타이며, 원문 한문 상 ~의 뜻이 맞기에 이를 건의합니다.",
    dashboardTitleBtn: "대시보드",
    sectionToc: "목차 및 서문",
    sectionIntro: "서문 및 화보",
    sectionBody: "본문"
  },
  en: {
    reader: "e-Book Reader",
    currentSection: "Current Section",
    searchText: "Search",
    suggestCorrection: "Suggest Correction",
    dashboardTitle: "Correction Feedback Dashboard",
    dashboardDesc: "A collection of typos and mistranslations submitted by readers. Admins can review, approve, and delete reports.",
    dashboard0p: "Dashboard (0p)",
    readBook1p: "Read Content (1p)",
    filterAll: "All Reports",
    filterPending: "Pending Review",
    filterResolved: "Applied",
    emptyReports: "No correction suggestions match the criteria.",
    loadingReports: "Collecting error reports...",
    loadingText: "Retrieving translation text...",
    loadingPdf: "Rendering PDF source...",
    originalAuthor: "Suggested by",
    submittedTime: "Submitted at",
    goToPage: "Go to Page",
    originalText: "Original Text (Before)",
    correctedText: "Proposed Correction",
    details: "Details / Reasons (Optional)",
    detailsLabel: "Detail Comment",
    cancel: "Cancel",
    approveApply: "Approve & Apply",
    editApply: "Edit & Apply",
    manualResolve: "Mark Resolved",
    delete: "Delete",
    editLangTitle: "Editing Language",
    fetchDraft: "Fetch Google Translation Draft",
    fetchDraftProgress: "Generating translation draft...",
    saveLive: "Save & Apply Live",
    openMemos: "Suggestions on this page",
    openMemosDesc: "These are suggestions from readers waiting for approval. Please refer to them while reading.",
    showMemos: "Show Comments",
    hideMemos: "Collapse",
    anonymousUser: "Anonymous Contributor",
    noChangeAlert: "No changes detected. Please modify the text before submitting.",
    emptyContentAlert: "Please fill in the correction content.",
    submitSuccessAlert: "Correction proposal submitted! It will appear in the text after admin approval.",
    deleteConfirm: "Are you sure you want to delete this suggestion?",
    applyConfirm: "Apply this correction to the page immediately?\n\n(The entire page content will be replaced by the proposal.)",
    applySuccessAlert: "Correction applied successfully!",
    translationNotFound: "Translation not found for this page.",
    translationNotFoundDesc: "The translation is not yet ready. Would you like to read using Google Translate real-time translation?",
    readRealtime: "Read with Google Translate",
    readKoreanOrigin: "Read in Korean (Original)",
    machineTranslated: "Machine Translated (Google Translate)",
    machineTranslatedDesc: "This content was translated in real-time using Google Translate.",
    searchPlaceholder: "Search keywords...",
    searchPanelTitle: "Text Search",
    errorPageLabel: "Error Page",
    submitButton: "Submit Suggestion",
    langFilterLabel: "Dashboard Language Filter",
    langAll: "All Languages",
    langKo: "Korean",
    langEn: "English",
    langEs: "Spanish",
    langFr: "French",
    langZh: "Chinese",
    langVi: "Vietnamese",
    originalTextReadOnly: "Read Only",
    correctedTextHelp: "Correct typos directly in this window",
    detailReasonHelp: "e.g., Typo correction, semantic adjustment based on original meaning.",
    dashboardTitleBtn: "Dashboard",
    sectionToc: "TOC & Preface",
    sectionIntro: "Intro & Images",
    sectionBody: "Body"
  },
  es: {
    reader: "Lector de e-Book",
    currentSection: "Sección Actual",
    searchText: "Buscar",
    suggestCorrection: "Sugerir Corrección",
    dashboardTitle: "Tablero de Comentarios de Corrección",
    dashboardDesc: "Una colección de erratas y traducciones incorrectas enviadas por los lectores. Los administradores pueden revisar, aprobar y eliminar los informes.",
    dashboard0p: "Tablero (0p)",
    readBook1p: "Leer Contenido (1p)",
    filterAll: "Todos los Informes",
    filterPending: "Pendientes",
    filterResolved: "Aplicados",
    emptyReports: "No hay sugerencias de corrección que coincidan con los criterios.",
    loadingReports: "Recopilando informes de errores...",
    loadingText: "Recuperando texto de traducción...",
    loadingPdf: "Renderizando fuente PDF...",
    originalAuthor: "Sugerido por",
    submittedTime: "Enviado en",
    goToPage: "Ir a la Página",
    originalText: "Texto Original (Antes)",
    correctedText: "Corrección Propuesta",
    details: "Detalles / Razones (Opcional)",
    detailsLabel: "Comentario Detallado",
    cancel: "Cancelar",
    approveApply: "Aprobar y Aplicar",
    editApply: "Editar y Aplicar",
    manualResolve: "Marcar como Resuelto",
    delete: "Eliminar",
    editLangTitle: "Idioma de Edición",
    fetchDraft: "Obtener Borrador de Google Translate",
    fetchDraftProgress: "Generando borrador de traducción...",
    saveLive: "Guardar y Aplicar en Vivo",
    openMemos: "Sugerencias en esta página",
    openMemosDesc: "Estas son sugerencias de lectores en espera de aprobación. Consúltelas mientras lee.",
    showMemos: "Ver Comentarios",
    hideMemos: "Contraer",
    anonymousUser: "Colaborador Anónimo",
    noChangeAlert: "No se detectaron cambios. Modifique el texto antes de enviarlo.",
    emptyContentAlert: "Por favor, complete el contenido de la corrección.",
    submitSuccessAlert: "¡Propuesta de corrección enviada! Se reflejará en el texto después de la aprobación del administrador.",
    deleteConfirm: "¿Está seguro de que desea eliminar esta sugerencia?",
    applyConfirm: "¿Aplicar esta corrección a la página inmediatamente?\n\n(Todo el contenido de la página se reemplazará por la propuesta).",
    applySuccessAlert: "¡Corrección aplicada con éxito!",
    translationNotFound: "Traducción no encontrada para esta página.",
    translationNotFoundDesc: "La traducción aún no está lista. ¿Le gustaría leer usando la traducción en tiempo real de Google Translate?",
    readRealtime: "Leer con Google Translate",
    readKoreanOrigin: "Leer en Coreano (Original)",
    machineTranslated: "Traducido Automáticamente (Google Translate)",
    machineTranslatedDesc: "Este contenido fue traducido en tiempo real usando Google Translate.",
    searchPlaceholder: "Buscar palabras clave...",
    searchPanelTitle: "Buscar Texto",
    errorPageLabel: "Página de Error",
    submitButton: "Enviar Sugerencia",
    langFilterLabel: "Filtro de Idioma del Tablero",
    langAll: "Todos los Idiomas",
    langKo: "Coreano",
    langEn: "Inglés",
    langEs: "Español",
    langFr: "Francés",
    langZh: "Chino",
    langVi: "Vietnamita",
    originalTextReadOnly: "Solo lectura",
    correctedTextHelp: "Corrija los errores directamente en esta ventana",
    detailReasonHelp: "Ej. Corrección de error ortográfico, ajuste semántico.",
    dashboardTitleBtn: "Tablero",
    sectionToc: "TOC y Prefacio",
    sectionIntro: "Intro e Imágenes",
    sectionBody: "Cuerpo"
  },
  fr: {
    reader: "Lecteur d'e-Book",
    currentSection: "Section Actuelle",
    searchText: "Rechercher",
    suggestCorrection: "Suggérer une correction",
    dashboardTitle: "Tableau de bord des corrections",
    dashboardDesc: "Collection de fautes de frappe et d'erreurs de traduction soumises par les lecteurs. Les administrateurs peuvent approuver ou supprimer ces rapports.",
    dashboard0p: "Tableau de bord (0p)",
    readBook1p: "Lire le livre (1p)",
    filterAll: "Tous les rapports",
    filterPending: "En attente",
    filterResolved: "Appliqués",
    emptyReports: "Aucune suggestion de correction ne correspond aux critères.",
    loadingReports: "Collecte des rapports d'erreurs...",
    loadingText: "Récupération du texte de traduction...",
    loadingPdf: "Rendu du fichier PDF source...",
    originalAuthor: "Suggéré par",
    submittedTime: "Soumis le",
    goToPage: "Aller à la page",
    originalText: "Texte original (Avant)",
    correctedText: "Correction proposée",
    details: "Détails / Raisons (Optionnel)",
    detailsLabel: "Commentaire détaillé",
    cancel: "Annuler",
    approveApply: "Approuver et appliquer",
    editApply: "Modifier et appliquer",
    manualResolve: "Marquer comme résolu",
    delete: "Supprimer",
    editLangTitle: "Langue d'édition",
    fetchDraft: "Obtenir un brouillon Google",
    fetchDraftProgress: "Génération du brouillon de traduction...",
    saveLive: "Enregistrer et appliquer",
    openMemos: "Suggestions sur cette page",
    openMemosDesc: "Ce sont des suggestions de lecteurs en attente d'approbation. Veuillez vous y référer pendant la lecture.",
    showMemos: "Afficher les commentaires",
    hideMemos: "Réduire",
    anonymousUser: "Contributeur Anonyme",
    noChangeAlert: "Aucun changement détecté. Veuillez modifier le texte avant de soumettre.",
    emptyContentAlert: "Veuillez remplir le contenu de la correction.",
    submitSuccessAlert: "Proposition de correction soumise ! Elle sera appliquée après validation administrative.",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette suggestion ?",
    applyConfirm: "Appliquer immédiatement cette correction à la page ?\n\n(Tout le contenu de la page sera remplacé par la proposition.)",
    applySuccessAlert: "Correction appliquée avec succès !",
    translationNotFound: "Traduction introuvable pour cette page.",
    translationNotFoundDesc: "La traduction n'est pas encore prête. Souhaitez-vous lire en utilisant la traduction en temps réel de Google Traduction ?",
    readRealtime: "Lire avec Google Traduction",
    readKoreanOrigin: "Lire en Coréen (Original)",
    machineTranslated: "Traduit automatiquement (Google Traduction)",
    machineTranslatedDesc: "Ce contenu a été traduit en temps réel à l'aide de Google Traduction.",
    searchPlaceholder: "Rechercher des mots-clés...",
    searchPanelTitle: "Recherche de texte",
    errorPageLabel: "Page d'erreur",
    submitButton: "Soumettre la suggestion",
    langFilterLabel: "Filtre de langue du tableau de bord",
    langAll: "Toutes les langues",
    langKo: "Coréen",
    langEn: "Anglais",
    langEs: "Espagnol",
    langFr: "Français",
    langZh: "Chinois",
    langVi: "Vietnamien",
    originalTextReadOnly: "Lecture seule",
    correctedTextHelp: "Corrigez les fautes directement dans cette fenêtre",
    detailReasonHelp: "Ex: Correction de faute d'orthographe, ajustement sémantique.",
    dashboardTitleBtn: "Tableau de bord",
    sectionToc: "TOC & Préface",
    sectionIntro: "Intro & Images",
    sectionBody: "Corps"
  },
  zh: {
    reader: "电子书阅读器 (e-Book)",
    currentSection: "当前章节",
    searchText: "文本检索",
    suggestCorrection: "纠错与校对建议",
    dashboardTitle: "纠错与校对建议控制台",
    dashboardDesc: "读者提交的错别字和韩文/汉字误读修改建议列表。管理员可以审核并立即批准或删除建议。",
    dashboard0p: "控制台 (0p)",
    readBook1p: "阅读正文 (1p)",
    filterAll: "全部建议",
    filterPending: "等待审核",
    filterResolved: "已应用",
    emptyReports: "没有符合条件的校对建议。",
    loadingReports: "正在汇总建议列表...",
    loadingText: "正在加载翻译文本...",
    loadingPdf: "正在渲染PDF原件...",
    originalAuthor: "建议提交者",
    submittedTime: "提交时间",
    goToPage: "跳转到页码",
    originalText: "原始文本 (修改前)",
    correctedText: "校对建议文本",
    details: "详细说明 / 建议理由 (可选)",
    detailsLabel: "详细备注",
    cancel: "取消",
    approveApply: "批准并应用",
    editApply: "修改并应用",
    manualResolve: "标记为已解决",
    delete: "删除",
    editLangTitle: "编辑语言",
    fetchDraft: "获取谷歌自动翻译草稿",
    fetchDraftProgress: "正在生成翻译草稿...",
    saveLive: "保存并实时应用",
    openMemos: "本页收到的纠错建议",
    openMemosDesc: "这是读者提交的尚未审核通过的建议。阅读本页时请参考。",
    showMemos: "查看建议",
    hideMemos: "折叠",
    anonymousUser: "匿名贡献者",
    noChangeAlert: "文本未作任何修改。请修改文本后再提交。",
    emptyContentAlert: "请输入要修改的文本内容。",
    submitSuccessAlert: "纠错建议已成功提交！管理员审核通过后将立即应用到正文中。",
    deleteConfirm: "确定要彻底删除这条建议吗？",
    applyConfirm: "确定要立即将此建议应用到本页吗？\n\n(本页的正文将完全被建议文本替换。)",
    applySuccessAlert: "修改已成功应用到本页！",
    translationNotFound: "本页尚无翻译文本。",
    translationNotFoundDesc: "您所选择的语言尚未准备好此页的翻译。您是否要使用谷歌免费翻译API进行实时翻译阅读？",
    readRealtime: "使用谷歌实时翻译阅读",
    readKoreanOrigin: "阅读韩文原文",
    machineTranslated: "机器翻译 (谷歌翻译)",
    machineTranslatedDesc: "此内容是通过谷歌免费翻译API实时进行机器翻译的。",
    searchPlaceholder: "请输入搜索关键词...",
    searchPanelTitle: "正文检索",
    errorPageLabel: "错误页面",
    submitButton: "提交建议",
    langFilterLabel: "控制台语言过滤器",
    langAll: "所有语言",
    langKo: "韩语",
    langEn: "英语",
    langEs: "西班牙语",
    langFr: "法语",
    langZh: "中文",
    langVi: "越南语",
    originalTextReadOnly: "只读",
    correctedTextHelp: "请在此窗口内直接修改文本",
    detailReasonHelp: "例如：修正错别字，更正汉字翻译谬误。",
    dashboardTitleBtn: "控制台",
    sectionToc: "目录与前言",
    sectionIntro: "前言与画册",
    sectionBody: "正文"
  },
  vi: {
    reader: "Trình đọc e-Book",
    currentSection: "Phần hiện tại",
    searchText: "Tìm kiếm",
    suggestCorrection: "Đóng góp chỉnh sửa",
    dashboardTitle: "Bảng điều khiển góp ý chỉnh sửa",
    dashboardDesc: "Tổng hợp các lỗi chính tả và lỗi dịch thuật do độc giả gửi. Quản trị viên có thể xem xét, phê duyệt và xóa các báo cáo.",
    dashboard0p: "Bảng điều khiển (0p)",
    readBook1p: "Đọc nội dung (1p)",
    filterAll: "Tất cả báo cáo",
    filterPending: "Đang chờ duyệt",
    filterResolved: "Đã áp dụng",
    emptyReports: "Không có đề xuất chỉnh sửa nào khớp với tiêu chí.",
    loadingReports: "Đang thu thập báo cáo lỗi...",
    loadingText: "Đang tải văn bản dịch...",
    loadingPdf: "Đang dựng tệp PDF gốc...",
    originalAuthor: "Đề xuất bởi",
    submittedTime: "Gửi lúc",
    goToPage: "Đi đến trang",
    originalText: "Văn bản gốc (Trước)",
    correctedText: "Đề xuất chỉnh sửa",
    details: "Chi tiết / Lý do (Không bắt buộc)",
    detailsLabel: "Ý kiến chi tiết",
    cancel: "Hủy bỏ",
    approveApply: "Phê duyệt & Áp dụng",
    editApply: "Sửa & Áp dụng",
    manualResolve: "Đánh dấu đã xử lý",
    delete: "Xóa",
    editLangTitle: "Ngôn ngữ chỉnh sửa",
    fetchDraft: "Lấy bản nháp dịch tự động",
    fetchDraftProgress: "Đang tạo bản nháp dịch...",
    saveLive: "Lưu & Áp dụng trực tiếp",
    openMemos: "Đề xuất trên trang này",
    openMemosDesc: "Đây là các ý kiến đóng góp từ độc giả đang chờ duyệt. Vui lòng tham khảo trong lúc đọc.",
    showMemos: "Xem ý kiến",
    hideMemos: "Thu gọn",
    anonymousUser: "Người đóng góp ẩn danh",
    noChangeAlert: "Không phát hiện thay đổi nào. Vui lòng chỉnh sửa văn bản trước khi gửi.",
    emptyContentAlert: "Vui lòng nhập nội dung cần chỉnh sửa.",
    submitSuccessAlert: "Đóng góp chỉnh sửa đã được gửi! Nó sẽ xuất hiện trên văn bản sau khi được quản trị viên duyệt.",
    deleteConfirm: "Bạn có chắc chắn muốn xóa đề xuất này?",
    applyConfirm: "Áp dụng chỉnh sửa này vào trang ngay lập tức?\n\n(Toàn bộ nội dung của trang sẽ được thay thế bằng đề xuất.)",
    applySuccessAlert: "Đã áp dụng chỉnh sửa thành công!",
    translationNotFound: "Không tìm thấy bản dịch cho trang này.",
    translationNotFoundDesc: "Bản dịch chưa sẵn sàng. Bạn có muốn đọc bằng bản dịch thời gian thực của Google Dịch không?",
    readRealtime: "Đọc bằng Google Dịch",
    readKoreanOrigin: "Đọc bằng Tiếng Hàn gốc",
    machineTranslated: "Bản dịch máy (Google Dịch)",
    machineTranslatedDesc: "Nội dung này được dịch thời gian thực bằng Google Dịch.",
    searchPlaceholder: "Tìm từ khóa...",
    searchPanelTitle: "Tìm kiếm văn bản",
    errorPageLabel: "Trang lỗi",
    submitButton: "Gửi đề xuất",
    langFilterLabel: "Bộ lọc ngôn ngữ bảng điều khiển",
    langAll: "Tất cả ngôn ngữ",
    langKo: "Tiếng Hàn",
    langEn: "Tiếng Anh",
    langEs: "Tiếng Tây Ban Nha",
    langFr: "Tiếng Pháp",
    langZh: "Tiếng Trung",
    langVi: "Tiếng Việt",
    originalTextReadOnly: "Chỉ đọc",
    correctedTextHelp: "Chỉnh sửa lỗi chính tả trực tiếp trong khung này",
    detailReasonHelp: "Ví dụ: Sửa lỗi chính tả, điều chỉnh nghĩa cho phù hợp bản gốc.",
    dashboardTitleBtn: "Bảng điều khiển",
    sectionToc: "Mục lục & Lời mở đầu",
    sectionIntro: "Mở đầu & Hình ảnh",
    sectionBody: "Nội dung chính"
  }
};

// PDF page (0~maxPage) to display page string
const getDisplayPageStr = (p, config) => {
  if (p === 0) return '대시보드';
  if (config.frontPageCount > 0 && p <= config.frontPageCount) return `앞${p}`;
  if (config.frontPageCount > 0) return `${p - config.frontPageCount}`;
  return `${p}`; // frontPageCount=0: 원본 PDF 번호 그대로
};

// Parse display page string/number to PDF page (0~maxPage)
const parseDisplayPage = (str, config) => {
  const trimmed = str.trim();
  if (trimmed === '0' || trimmed.toLowerCase() === '대시보드') return 0;
  if (config.frontPageCount > 0 && trimmed.startsWith('앞')) {
    const val = parseInt(trimmed.substring(1), 10);
    if (!isNaN(val) && val >= 1 && val <= config.frontPageCount) return val;
  }
  const val = parseInt(trimmed, 10);
  if (!isNaN(val)) {
    if (config.frontPageCount === 0) {
      if (val >= 1 && val <= config.maxPage) return val;
    } else {
      const mainPages = config.maxPage - config.frontPageCount;
      if (val >= 1 && val <= mainPages) {
        return val + config.frontPageCount;
      }
      if (val >= (mainPages + 1) && val <= config.maxPage) {
        return val;
      }
    }
  }
  return null;
};

// 언어 정규화 (ko_hanja -> ko로 통일하여 동일한 한국어 데이터소스 사용)
const getLangPrefix = (lang) => {
  if (lang === 'ko_hanja') return 'ko';
  return lang || 'ko';
};

// Firestore custom_pages 문서 ID 구성 (언어 접두사 포함)
const getCustomPageDocId = (bookId, page, lang) => {
  const normLang = getLangPrefix(lang);
  if (bookId === '10years') {
    return `page_${normLang}_${page}`;
  }
  return `${bookId}_page_${normLang}_${page}`;
};

const BookReader = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookId } = useParams();
  const activeBookId = bookId || '10years';
  const config = BOOKS_CONFIG[activeBookId] || BOOKS_CONFIG['10years'];
  
  // URL에서 page 파라미터 파싱
  const initialPage = parseInt(searchParams.get('page'), 10);
  const startPage = isNaN(initialPage) ? 1 : Math.max(0, Math.min(config.maxPage, initialPage));
  
  const [pageNum, setPageNum] = useState(startPage);
  const [pageInputValue, setPageInputValue] = useState(getDisplayPageStr(startPage, config));
  
  // 모바일 전용 뷰 탭 상태 ('text' | 'pdf')
  const [activeMobileTab, setActiveMobileTab] = useState('text');
  
  // PDF.js 및 문서 상태
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [pdfScale, setPdfScale] = useState(window.innerWidth < 768 ? 0.8 : 1.2);
  const [pdfError, setPdfError] = useState(null);
  const canvasRef = useRef(null);
  const activeRenderTaskRef = useRef(null);
  const pdfContainerRef = useRef(null);
  
  // PDF 드래그 패닝(Drag to Scroll) 관련 참조 Refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const scrollTopRef = useRef(0);
  
  // 패닝 제어용 상태 (마우스 커서 등 UI 바인딩용)
  const [isPanning, setIsPanning] = useState(false);

  // 1. 드래그 시작 (마우스 다운 및 터치 시작)
  const handleDragStart = (e) => {
    if (!pdfContainerRef.current) return;
    
    isDraggingRef.current = true;
    setIsPanning(true);

    const clientX = e.touches ? e.touches[0].pageX : e.pageX;
    const clientY = e.touches ? e.touches[0].pageY : e.pageY;

    startXRef.current = clientX;
    startYRef.current = clientY;
    scrollLeftRef.current = pdfContainerRef.current.scrollLeft;
    scrollTopRef.current = pdfContainerRef.current.scrollTop;
  };

  // 2. 드래그 중 (마우스 무브 및 터치 무브)
  const handleDragMove = (e) => {
    if (!isDraggingRef.current || !pdfContainerRef.current) return;

    const clientX = e.touches ? e.touches[0].pageX : e.pageX;
    const clientY = e.touches ? e.touches[0].pageY : e.pageY;

    const walkX = clientX - startXRef.current;
    const walkY = clientY - startYRef.current;

    pdfContainerRef.current.scrollLeft = scrollLeftRef.current - walkX;
    pdfContainerRef.current.scrollTop = scrollTopRef.current - walkY;
  };

  // 3. 드래그 중지 (마우스 업, 리브 및 터치 엔드)
  const handleDragEnd = () => {
    isDraggingRef.current = false;
    setIsPanning(false);
  };
  
  // 텍스트 상태 (static 마크다운 기반)
  const [pageTextMap, setPageTextMap] = useState({});
  const [koTextMap, setKoTextMap] = useState({});  // 한국어 원문 (fallback용)
  const [loadingText, setLoadingText] = useState(true);
  const [bookLanguage, setBookLanguage] = useState('ko');
  
  // UI 다국어 사전 연결 단축 변수
  const ui = TRANSLATIONS[bookLanguage] || TRANSLATIONS['ko'];

  // 위키식 커스텀 페이지 오버라이드 상태 (Firestore 실시간 반영)
  const [pageOverrides, setPageOverrides] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  
  // 미승인 정정 메모 가시성 상태
  const [showMemos, setShowMemos] = useState(false);
  
  // 우측 햄버거 메뉴 열기 상태 및 목차 페이지 도출
  const [menuOpen, setMenuOpen] = useState(false);
  const getTocPageNum = () => {
    return activeBookId === 'glory' ? 25 : 9;
  };
  
  // 사용자 정보 및 권한
  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === import.meta.env.VITE_ADMIN_EMAIL);
  
  // 오류 보고 상태
  const [errorReports, setErrorReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'pending' | 'resolved'
  const [dashboardLangFilter, setDashboardLangFilter] = useState('all'); // 'all' | 'ko' | 'en' | 'es' | 'fr' | 'vi' | 'zh'
  
  // 신고 모달 상태
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    originalText: '',
    correctedText: '',
    details: '',
    reporter: ''
  });

  // 관리자의 정정 제안 추가 수정 상태
  const [editingReportId, setEditingReportId] = useState(null);
  const [editingReportText, setEditingReportText] = useState('');

  // 기계 자동 번역 상태
  const [autoTranslatedText, setAutoTranslatedText] = useState('');
  const [translatingText, setTranslatingText] = useState(false);

  // 페이지나 언어 변경 시 자동 번역 상태 초기화
  useEffect(() => {
    setAutoTranslatedText('');
  }, [pageNum, bookLanguage]);

  // 검색 관련 상태
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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
      const validPage = Math.max(0, Math.min(config.maxPage, pageParam));
      setPageNum(validPage);
      setPageInputValue(getDisplayPageStr(validPage, config));
      setEditMode(false); // 페이지가 바뀌면 편집모드 해제
      setShowMemos(false); // 메모창 닫기
    }
  }, [searchParams, activeBookId]);

  const handlePageChange = (newPage) => {
    const validPage = Math.max(0, Math.min(config.maxPage, newPage));
    setPageNum(validPage);
    setPageInputValue(getDisplayPageStr(validPage, config));
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
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('PDF.js 스크립트 로드 실패'));
            document.head.appendChild(script);
          });
        }
        
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const pdfUrl = `${import.meta.env.BASE_URL}${config.pdfName}`;
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
  }, [activeBookId]);

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
  const parseMarkdownToMap = (text) => {
    const sections = text.split(/--- \(p\. (\d+)\) ---/g);
    const map = {};
    for (let i = 1; i < sections.length; i += 2) {
      const page = parseInt(sections[i], 10);
      let content = sections[i + 1] || '';
      content = content.replace(/^(#{1,6}\s+.*)$/gm, '\n\n$1\n\n');
      content = content.replace(/\*\*([^\*]+?)\*\*(?=[가-힣a-zA-Z0-9])/g, '**$1**\u200B');
      content = content.replace(/\n{3,}/g, '\n\n');
      map[page] = content.trim();
    }
    console.log(`[ParseMarkdown] Parsed pages count: ${Object.keys(map).length}, Sample pages: ${Object.keys(map).slice(0, 10).join(', ')}`);
    return map;
  };

  // 5-a. 한국어 원문은 항상 로드 (번역 fallback용)
  useEffect(() => {
    setBookLanguage('ko'); // 도서 전환 시 언어 설정을 한국어(ko)로 리셋
    const koUrl = `${import.meta.env.BASE_URL}docs/${config.mdName}`;
    fetch(koUrl)
      .then(res => res.arrayBuffer())
      .then(buf => {
        const text = new TextDecoder('utf-8').decode(buf);
        setKoTextMap(parseMarkdownToMap(text));
      })
      .catch(err => console.error('한국어 원문 로드 실패:', err));
  }, [activeBookId]);

  // 5-b. 선택 언어 파일 로드
  useEffect(() => {
    setLoadingText(true);
    let fileName = config.mdName;
    if (activeBookId === '10years') {
      if (bookLanguage === 'en') {
        fileName = 'saemaul_10years_full_en.md';
      } else if (bookLanguage === 'es') {
        fileName = 'saemaul_10years_full_es.md';
      } else if (bookLanguage === 'zh') {
        fileName = 'saemaul_10years_full_zh.md';
      } else if (bookLanguage === 'fr') {
        fileName = 'saemaul_10years_full_fr.md';
      } else if (bookLanguage === 'vi') {
        fileName = 'saemaul_10years_full_vi.md';
      }
    } else if (activeBookId === 'glory') {
      if (bookLanguage === 'en') {
        fileName = 'saemaul_glory_full_en.md';
      } else if (bookLanguage === 'es') {
        fileName = 'saemaul_glory_full_es.md';
      } else if (bookLanguage === 'fr') {
        fileName = 'saemaul_glory_full_fr.md';
      } else if (bookLanguage === 'vi') {
        fileName = 'saemaul_glory_full_vi.md';
      } else if (bookLanguage === 'zh') {
        fileName = 'saemaul_glory_full_zh.md';
      }
    }
    const textUrl = `${import.meta.env.BASE_URL}docs/${fileName}?v=${Date.now()}`;
    
    fetch(textUrl)
      .then(res => {
        if (!res.ok) throw new Error('텍스트 파일 로드 실패');
        return res.arrayBuffer();
      })
      .then(buf => {
        const decodedText = new TextDecoder('utf-8').decode(buf);
        setPageTextMap(parseMarkdownToMap(decodedText));
        setLoadingText(false);
      })
      .catch(err => {
        console.error('텍스트 파싱 에러:', err);
        setLoadingText(false);
      });
  }, [bookLanguage, activeBookId]);

  // 6. Firestore 실시간 수정 페이지 오버라이드 로드
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'custom_pages'), (snapshot) => {
      const overrides = {};
      snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        if (!data) return;
        
        let pageLang = 'ko';
        let pageNumVal = data.pageNum;
        let targetBookId = '10years';

        if (id.startsWith('page_')) {
          targetBookId = '10years';
          const parts = id.split('_');
          if (parts.length === 3) {
            pageLang = parts[1];
          } else {
            pageLang = 'ko';
          }
        } else {
          const parts = id.split('_');
          if (parts.length >= 3) {
            targetBookId = parts[0];
            if (parts.length === 4) {
              pageLang = parts[2];
            } else {
              pageLang = 'ko';
            }
          }
        }

        if (targetBookId === activeBookId && pageNumVal !== undefined) {
          if (!overrides[pageLang]) {
            overrides[pageLang] = {};
          }
          overrides[pageLang][pageNumVal] = data.content;
        }
      });
      setPageOverrides(overrides);
    }, (err) => {
      console.error('실시간 수정 페이지 로드 에러:', err);
    });
    return () => unsubscribe();
  }, [activeBookId]);

  // 7. Firestore 실시간 리포트 로딩 (전체 페이지 공유)
  useEffect(() => {
    setLoadingReports(true);
    const q = query(collection(db, 'error_reports'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const repBookId = data.bookId || '10years';
        if (repBookId === activeBookId) {
          reports.push({ id: doc.id, ...data });
        }
      });
      setErrorReports(reports);
      setLoadingReports(false);
    }, (err) => {
      console.error('오류 보고 데이터 로딩 에러:', err);
      setLoadingReports(false);
    });
    
    return () => unsubscribe();
  }, [activeBookId]);

  // 7.5. 오류 제안 모달 오픈 및 본문 데이터 초기화
  const handleOpenReportModal = () => {
    const normLang = getLangPrefix(bookLanguage);
    const currentText = pageOverrides[normLang]?.[pageNum] !== undefined 
      ? pageOverrides[normLang][pageNum] 
      : (pageTextMap[pageNum] || '');
    setReportForm(prev => ({
      ...prev,
      originalText: currentText,
      correctedText: currentText
    }));
    setReportModalOpen(true);
  };

  // 8. 오류 신고 전송
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (reportForm.originalText === reportForm.correctedText) {
      alert(ui.noChangeAlert);
      return;
    }
    if (!reportForm.correctedText.trim()) {
      alert(ui.emptyContentAlert);
      return;
    }
    
    setSubmittingReport(true);
    try {
      await addDoc(collection(db, 'error_reports'), {
        bookId: activeBookId,
        page: pageNum,
        language: getLangPrefix(bookLanguage), // 제안된 언어 추가
        originalText: reportForm.originalText,
        correctedText: reportForm.correctedText,
        details: reportForm.details,
        reporter: reportForm.reporter || ui.anonymousUser,
        uid: currentUser ? currentUser.uid : 'anonymous',
        email: currentUser ? currentUser.email : 'anonymous',
        status: 'pending', // pending | reviewed | resolved
        createdAt: Timestamp.now()
      });
      
      // 오류 제안 포인트 적립 (+5 P)
      if (currentUser) {
        try {
          const res = await addPoint(currentUser.uid, 'error_suggest');
          if (res.unlockedTitles && res.unlockedTitles.length > 0) {
            alert(`🎉 ${res.unlockedTitles.join(', ')}`);
          }
        } catch (pointErr) {
          console.error("Failed to add suggest point:", pointErr);
        }
      }
      
      alert(ui.submitSuccessAlert);
      setReportModalOpen(false);
      setReportForm({ originalText: '', correctedText: '', details: '', reporter: '' });
    } catch (err) {
      console.error('오류 신고 등록 에러:', err);
      alert('Error: ' + err.message);
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
    if (!window.confirm(ui.deleteConfirm)) return;
    
    try {
      await deleteDoc(doc(db, 'error_reports', reportId));
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  // 11. 관리자: 위키 직접 편집 및 저장
  const handleStartEdit = () => {
    const normLang = getLangPrefix(bookLanguage);
    const currentText = pageOverrides[normLang]?.[pageNum] !== undefined 
      ? pageOverrides[normLang][pageNum] 
      : (pageTextMap[pageNum] || '');
    setEditText(currentText);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const docId = getCustomPageDocId(activeBookId, pageNum, bookLanguage);
      await setDoc(doc(db, 'custom_pages', docId), {
        pageNum: pageNum,
        language: getLangPrefix(bookLanguage),
        bookId: activeBookId,
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

  // Google Translate 무료/우회 REST API 호출
  const translateText = async (text, targetLang) => {
    try {
      let tl = targetLang;
      if (targetLang === 'zh') tl = 'zh-CN'; // 중국어 간체 매핑
      
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Request failed');
      const data = await response.json();
      
      if (data && data[0]) {
        return data[0].map(segment => segment[0]).join('');
      }
      throw new Error('Failed to parse translation segments');
    } catch (err) {
      console.error('Translation error:', err);
      throw err;
    }
  };

  // 현재 한국어 본문을 해당 타겟 언어로 실시간 기계 번역하여 화면 캐시에 보관
  const handleAutoTranslateCurrentPage = async () => {
    const originText = koTextMap[pageNum] || '';
    if (!originText.trim()) {
      alert('번역할 원문이 존재하지 않습니다.');
      return;
    }
    setTranslatingText(true);
    try {
      const translated = await translateText(originText, bookLanguage);
      setAutoTranslatedText(translated);
    } catch (err) {
      alert('자동 번역 호출에 실패했습니다. 요청량이 많거나 네트워크 에러입니다.');
    } finally {
      setTranslatingText(false);
    }
  };

  // 관리자 직접 편집창에서 번역 초안 가져오기
  const handleFetchTranslationDraft = async () => {
    const originText = koTextMap[pageNum] || '';
    if (!originText.trim()) {
      alert('번역할 원문이 존재하지 않습니다.');
      return;
    }
    setTranslatingText(true);
    try {
      const translated = await translateText(originText, bookLanguage);
      setEditText(translated);
    } catch (err) {
      alert('번역 초안을 가져오는 도중 에러가 발생했습니다.');
    } finally {
      setTranslatingText(false);
    }
  };

  // 12. 관리자: 원클릭 정정 승인 및 본문 치환 자동화
  const handleApproveAndApply = async (report, customText) => {
    if (!isAdmin) return;
    
    const finalContent = customText !== undefined ? customText : report.correctedText;
    if (!finalContent.trim()) {
      alert('반영할 본문 내용이 비어 있습니다.');
      return;
    }
    
    const confirmMessage = ui.applyConfirm.replace('${report.page}', report.page);
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const newContent = finalContent;
      const reportLang = report.language || 'ko';
      const docId = getCustomPageDocId(activeBookId, report.page, reportLang);
      
      await setDoc(doc(db, 'custom_pages', docId), {
        pageNum: report.page,
        language: reportLang,
        bookId: activeBookId,
        content: newContent,
        updatedAt: Timestamp.now(),
        updatedBy: `System (Admin Approved: ${currentUser?.email || 'admin'})`
      });
      
      await updateDoc(doc(db, 'error_reports', report.id), {
        status: 'resolved',
        correctedText: newContent
      });

      if (report.uid && report.uid !== 'anonymous') {
        try {
          await addPoint(report.uid, 'error_approve');
        } catch (pointErr) {
          console.error("Failed to reward approved user:", pointErr);
        }
      }
      
      alert(ui.applySuccessAlert);
      setEditingReportId(null);
    } catch (err) {
      console.error('승인 처리 중 에러:', err);
      alert('처리에 실패했습니다.');
    }
  };

  // 13. 포인트 추가 API 모방 함수
  const addPoint = async (uid, type) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      let currentPoint = 0;
      let currentTitles = [];
      if (userDoc.exists()) {
        const dData = userDoc.data();
        currentPoint = dData.points || 0;
        currentTitles = dData.titles || [];
      }

      let earn = 5;
      if (type === 'error_approve') earn = 50;

      const newPoint = currentPoint + earn;
      
      const titleMilestones = [
        { limit: 10, name: '새마을 꿈나무' },
        { limit: 50, name: '부락 협동기여자' },
        { limit: 100, name: '동네 정정반장' },
        { limit: 300, name: '오타 보안관' },
        { limit: 500, name: '디지털 새마을 훈장' }
      ];

      const unlockedTitles = [];
      titleMilestones.forEach(m => {
        if (newPoint >= m.limit && !currentTitles.includes(m.name)) {
          currentTitles.push(m.name);
          unlockedTitles.push(m.name);
        }
      });

      await setDoc(userRef, {
        points: newPoint,
        titles: currentTitles,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { newPoint, unlockedTitles };
    } catch (e) {
      console.error('Point add failed:', e);
      throw e;
    }
  };

  // 14. 텍스트 검색 처리
  const handleSearch = (queryStr) => {
    if (!queryStr.trim()) {
      setSearchResults([]);
      return;
    }
    const results = [];
    Object.keys(pageTextMap).forEach(page => {
      const text = pageTextMap[page] || '';
      if (text.toLowerCase().includes(queryStr.toLowerCase())) {
        const index = text.toLowerCase().indexOf(queryStr.toLowerCase());
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + queryStr.length + 40);
        let snippet = text.substring(start, end).replace(/\n/g, ' ');
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        results.push({
          page: parseInt(page, 10),
          snippet: snippet
        });
      }
    });
    setSearchResults(results.sort((a, b) => a.page - b.page));
  };

  // 15. 차이점(Diff) 시각화 렌더러
  const renderDiffView = (original, corrected) => {
    return (
      <div className="flex flex-col gap-2.5 text-xs">
        <div className="bg-red-950/30 border border-red-900/30 p-2.5 rounded-lg text-red-300 font-mono line-through whitespace-pre-wrap break-all text-left">
          {original}
        </div>
        <div className="bg-emerald-950/30 border border-emerald-900/30 p-2.5 rounded-lg text-emerald-300 font-mono whitespace-pre-wrap break-all text-left">
          {corrected}
        </div>
      </div>
    );
  };

  // 16. 오류 보고서 리포트 행 상태 렌더러
  const renderReportStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/50"><CheckCircle size={12} /> {ui.filterResolved}</span>;
      case 'reviewed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400 border border-indigo-800/50"><Clock size={12} /> 검토완료</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 animate-pulse"><AlertCircle size={12} /> {ui.filterPending}</span>;
    }
  };

  // 날짜 변환 보강 헬퍼 (Timestamp / Date 문자열 포괄)
  const getFormattedDate = (createdAt) => {
    if (!createdAt) return '';
    try {
      if (typeof createdAt.seconds === 'number') {
        return new Date(createdAt.seconds * 1000).toLocaleString(bookLanguage);
      }
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString(bookLanguage);
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  };

  // 현재 페이지의 미승인 오류 신고건 필터링
  const currentPageReports = errorReports.filter(r => r.page === pageNum && r.status !== 'resolved');

  // 80. 9. 14 같은 날짜 형식이 순서 리스트로 오인식(1. 1. 14로 출력)되는 것 방지 및 검색어 하이라이팅
  const getProcessedMarkdown = (rawMarkdown) => {
    if (!rawMarkdown) return '';

    // 1. 단일 물결표(~)가 마크다운 취소선 문법(~~)과 혼동되어 취소선 처리되는 것 방지
    let processed = rawMarkdown.replace(/(?<!~)~(?!~)/g, '～');

    // 2. 한글(한자) 형태의 한자 병기 표기 제거 (한자 병기 모드가 아닐 때만 제거)
    if (bookLanguage !== 'ko_hanja') {
      processed = processed.replace(/([가-힣a-zA-Z0-9]+)\([\u4e00-\u9fff\s,·/·]+\)/g, '$1');
    }

    processed = processed.replace(/(\d+)\.(?=\s)/g, '$1\\.');
    
    // 이미지 마크다운 구문 제거 (![alt](src) 형태)
    processed = processed.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
    processed = processed.replace(/<img[^>]*\/?>\s*/gi, '');

    // 단일 개행(\n)이 마크다운 표준에서 무시되는 것을 해결하기 위해 
    // 리스트, 테이블, 헤더가 아닌 일반 문장 행 끝에 강제로 공백 2개('  ')를 추가하여 줄바꿈 적용
    processed = processed.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed && 
          !line.endsWith('  ') && 
          !trimmed.startsWith('#') && 
          !trimmed.startsWith('|') && 
          !trimmed.startsWith('-') && 
          !trimmed.startsWith('*') && 
          !trimmed.startsWith('1.') && 
          !trimmed.startsWith('2.') && 
          !trimmed.startsWith('3.') && 
          !trimmed.startsWith('4.') && 
          !trimmed.startsWith('5.') && 
          !trimmed.startsWith('6.') && 
          !trimmed.startsWith('7.') && 
          !trimmed.startsWith('8.') && 
          !trimmed.startsWith('9.') && 
          !trimmed.startsWith('0.')) {
        return line + '  ';
      }
      return line;
    }).join('\n');
    
    // 목차 페이지(9~12)인 경우 점(.) 뒤의 페이지 숫자를 이동 링크로 치환 [10년사]
    if (activeBookId === '10years' && pageNum >= 9 && pageNum <= 12) {
      processed = processed.replace(/(\.{3,})\s*(\d+)/g, (match, dots, pageStr) => {
        const bp = parseInt(pageStr, 10);
        const pdfPage = bp + 14;
        return `${dots} [${pageStr}](/reader/10years?page=${pdfPage})`;
      });
    }

    // 목차 페이지(PDF 25~26) 점(.) 뒤의 숫자를 이동 링크로 치환 [영광의 발자취]
    if (activeBookId === 'glory' && (pageNum === 25 || pageNum === 26)) {
      processed = processed.replace(/([.·…]{2,})\s*(\d{1,4})/g, (match, dots, pageStr) => {
        const pdfPage = parseInt(pageStr, 10);
        if (pdfPage >= 1 && pdfPage <= 984) {
          return `${dots} [${pageStr}](/reader/glory?page=${pdfPage})`;
        }
        return match;
      });
      processed = processed.replace(/ {2,}(\d{1,4})\s*$/gm, (match, pageStr) => {
        const pdfPage = parseInt(pageStr, 10);
        if (pdfPage >= 27 && pdfPage <= 984) {
          return ` [${pageStr}](/reader/glory?page=${pdfPage})`;
        }
        return match;
      });
    }
    
    if (searchQuery.trim()) {
      const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?<!\\*\\*)(${escapedQuery})(?!\\*\\*)`, 'gi');
      processed = processed.replace(regex, '**$1**');
    }
    
    return processed;
  };

  const getPageSectionTitle = (page) => {
    if (page === 0) return ui.dashboardTitleBtn;
    if (activeBookId === 'glory') {
      if (page <= 26) return ui.sectionToc;
      if (page <= 70) return ui.sectionIntro;
      return ui.sectionBody;
    } else {
      if (page <= 14) return ui.sectionToc;
      if (page <= 126) return '제1편 새마을운동의 역사적 배경';
      if (page <= 352) return '제2편 새마을운동의 이념과 계획';
      if (page <= 580) return '제3편 새마을운동의 성과';
      return '제4편 새마을운동의 성공 요인';
    }
  };

  // 대시보드 리포트 목록 필터링 적용 (처리 상태 필터 + 언어 필터)
  const filteredReports = errorReports.filter(r => {
    const matchesStatus = reportFilter === 'all' || r.status === reportFilter;
    const matchesLang = dashboardLangFilter === 'all' || r.language === dashboardLangFilter;
    return matchesStatus && matchesLang;
  });

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col pt-20 overflow-hidden">
      
      {/* eBook Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 md:px-6 md:py-4 flex flex-row items-center justify-between gap-4 z-10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button 
            onClick={() => navigate('/hub')} 
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/40 flex-shrink-0"
          >
            <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] md:text-xs font-black px-1.5 py-0.5 md:px-2 bg-saemaul-green/20 text-saemaul-green rounded border border-saemaul-green/30 flex-shrink-0">{ui.reader}</span>
              <h1 className="text-xs md:text-base font-black text-slate-100 tracking-tight truncate max-w-[150px] xs:max-w-xs sm:max-w-none">{config.title}</h1>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 font-medium truncate">
              {ui.currentSection}: <span className="text-amber-500 font-bold">{getPageSectionTitle(pageNum)}</span>
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2 flex-shrink-0">
          {/* 햄버거 메뉴 토글 버튼 */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2.5 rounded-xl transition-all border flex items-center justify-center cursor-pointer ${
              menuOpen 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-800 border-slate-700/40 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
            aria-label="메뉴 열기"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* 드롭다운 메뉴 */}
          {menuOpen && (
            <>
              {/* Click Outside overlay */}
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)}></div>
              
              <div className="absolute right-0 top-full mt-2 w-60 bg-slate-950/95 backdrop-blur-lg border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3.5 animate-fadeIn max-w-[calc(100vw-2rem)]">
                
                {/* 1. 언어 설정 */}
                <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Globe size={11} className="text-slate-400" />
                    언어 설정
                  </span>
                  <select
                    value={bookLanguage}
                    onChange={(e) => {
                      setBookLanguage(e.target.value);
                      setMenuOpen(false);
                    }}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs font-black text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ko" className="bg-slate-900 text-slate-200">한국어 (정제본)</option>
                    <option value="ko_hanja" className="bg-slate-900 text-slate-200">한국어 (한자 병기)</option>
                    {config.hasMultilang && (
                      <>
                        <option value="en" className="bg-slate-900 text-slate-200">English (EN)</option>
                        {activeBookId === '10years' && (
                          <>
                            <option value="es" className="bg-slate-900 text-slate-200">Español (ES)</option>
                            <option value="zh" className="bg-slate-900 text-slate-200">中文 (ZH)</option>
                            <option value="fr" className="bg-slate-900 text-slate-200">Français (FR)</option>
                            <option value="vi" className="bg-slate-900 text-slate-200">Tiếng Việt (VI)</option>
                          </>
                        )}
                        {activeBookId === 'glory' && (
                          <>
                            <option value="es" className="bg-slate-900 text-slate-200">Español (ES)</option>
                            <option value="zh" className="bg-slate-900 text-slate-200">中文 (ZH)</option>
                            <option value="fr" className="bg-slate-900 text-slate-200">Français (FR)</option>
                            <option value="vi" className="bg-slate-900 text-slate-200">Tiếng Việt (VI)</option>
                          </>
                        )}
                      </>
                    )}
                  </select>
                </div>

                {/* 2. 본문 검색 */}
                {pageNum > 0 && (
                  <button
                    onClick={() => {
                      setSearchOpen(!searchOpen);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all cursor-pointer border ${
                      searchOpen 
                        ? 'bg-indigo-650/20 text-indigo-400 border-indigo-500/20' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border-transparent'
                    }`}
                  >
                    <Search size={14} className={searchOpen ? "text-indigo-400" : "text-slate-400"} />
                    {ui.searchText}
                  </button>
                )}

                {/* 3. 오류 정정 제안 */}
                {pageNum > 0 && (
                  <button
                    onClick={() => {
                      handleOpenReportModal();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-black text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer border border-transparent"
                  >
                    <AlertTriangle size={14} />
                    {ui.suggestCorrection}
                  </button>
                )}

                {/* 4. 대시보드로 가기 / 1페이지 읽기 */}
                {pageNum !== 0 ? (
                  <button
                    onClick={() => {
                      handlePageChange(0);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-black text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer border border-transparent"
                  >
                    <MessageSquare size={14} />
                    {ui.dashboard0p}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handlePageChange(1);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-black text-slate-350 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer border border-transparent"
                  >
                    <BookOpen size={14} className="text-slate-400" />
                    {ui.readBook1p}
                  </button>
                )}

                {/* 5. 목차로 돌아가기 */}
                <button
                  onClick={() => {
                    handlePageChange(getTocPageNum());
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-black text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border-t border-slate-900/60 pt-3.5 cursor-pointer"
                >
                  <BookOpen size={14} />
                  목차로 돌아가기
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 모바일 하단 탭 바 (모바일 크기 화면에서만 노출, 0페이지 대시보드 아닐 때만) */}
      {pageNum > 0 && (
        <div className="flex md:hidden bg-slate-950 border-b border-slate-800 text-xs font-bold divide-x divide-slate-800 z-10 flex-shrink-0">
          <button 
            onClick={() => setActiveMobileTab('text')}
            className={`flex-1 py-3 transition-colors ${activeMobileTab === 'text' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-400'}`}
          >
            본문 텍스트 보기
          </button>
          <button 
            onClick={() => setActiveMobileTab('pdf')}
            className={`flex-1 py-3 transition-colors ${activeMobileTab === 'pdf' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-400'}`}
          >
            PDF 원본 파일 보기
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-grow flex overflow-hidden relative">
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden w-full">
          
          {/* LEFT PANEL: PDF Viewer */}
          {pageNum > 0 && (
            <div 
              ref={pdfContainerRef}
              className={`flex-1 flex-col bg-slate-900 border-r border-slate-800 overflow-auto relative ${
                activeMobileTab === 'pdf' ? 'flex' : 'hidden md:flex'
              }`}
            >
              {/* PDF Toolbar */}
              <div className="sticky top-0 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10 flex-shrink-0">
                <span className="text-xs font-bold text-slate-400 select-none">PDF 원본 파일 (사본)</span>
                <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800/40">
                  <button 
                    onClick={() => setPdfScale(prev => Math.max(0.6, prev - 0.1))} 
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="축소"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 select-none">{Math.round(pdfScale * 100)}%</span>
                  <button 
                    onClick={() => setPdfScale(prev => Math.min(2.0, prev + 0.1))} 
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="확대"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <div className="w-px h-3.5 bg-slate-800 mx-0.5"></div>
                  <button 
                    onClick={() => setPdfScale(window.innerWidth < 768 ? 0.8 : 1.2)} 
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="기본 크기"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* PDF Canvas Rendering Wrapper */}
              <div 
                className={`flex-grow flex items-center justify-center p-6 bg-slate-900 select-none touch-none ${
                  isPanning ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                {loadingPdf && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-900/80 backdrop-blur z-10">
                    <Loader2 size={32} className="animate-spin text-saemaul-green" />
                    <p className="text-xs font-bold">{ui.loadingPdf}</p>
                  </div>
                )}
                {pdfError && (
                  <div className="max-w-xs text-center p-6 bg-slate-950 border border-slate-800 rounded-3xl animate-fadeIn">
                    <AlertTriangle size={24} className="text-amber-500 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">{pdfError}</p>
                  </div>
                )}
                <div className="shadow-2xl border border-slate-800/80 rounded-lg overflow-hidden bg-white">
                  <canvas ref={canvasRef}></canvas>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT PANEL: Markdown Text Viewer */}
          <div 
            className={`flex-1 flex flex-col bg-slate-900 overflow-y-auto ${
              activeMobileTab === 'text' || pageNum === 0 ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="p-6 sm:p-10 max-w-4xl mx-auto w-full flex-grow flex flex-col justify-between">
              
              {pageNum === 0 ? (
                // 0페이지: 오류 제안 대시보드
                <div className="flex flex-col gap-6 w-full animate-fadeIn text-left">
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2 tracking-tight">
                        <MessageSquare className="text-indigo-400" />
                        {ui.dashboardTitle}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium leading-relaxed max-w-xl">
                        {ui.dashboardDesc}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap w-full md:w-auto">
                      <button
                        onClick={() => handlePageChange(getTocPageNum())}
                        className="px-5 py-3 text-xs font-black bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <BookOpen size={12} />
                        목차로 돌아가기
                      </button>
                      {isAdmin && (
                        <button
                          onClick={handleStartEdit}
                          className="px-5 py-3 text-xs font-black bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                        >
                          이 페이지 직접 편집 (관리자)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2중 필터바 (처리 상태 필터 + 언어 필터) */}
                  <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
                    {/* 처리 상태 필터 */}
                    <div className="flex gap-1.5 flex-wrap">
                      {['all', 'pending', 'resolved'].map(f => (
                        <button
                          key={f}
                          onClick={() => setReportFilter(f)}
                          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                            reportFilter === f 
                              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-extrabold' 
                              : 'text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          {f === 'all' && ui.filterAll}
                          {f === 'pending' && `${ui.filterPending} (${errorReports.filter(r => r.status === 'pending').length})`}
                          {f === 'resolved' && `${ui.filterResolved} (${errorReports.filter(r => r.status === 'resolved').length})`}
                        </button>
                      ))}
                    </div>

                    {/* 언어별 정렬 필터 추가 */}
                    <div className="flex items-center gap-2.5 flex-wrap pt-1.5 border-t border-slate-800/40">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{ui.langFilterLabel}:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {['all', 'ko', 'en', 'es', 'fr', 'vi', 'zh'].map(lang => {
                          const count = errorReports.filter(r => r.language === lang).length;
                          // glory 도서에 zh가 없고 vi가 있는 등 책 설정에 맞춰 옵션 표기
                          if (activeBookId === 'glory' && lang === 'zh') return null;
                          if (activeBookId === '10years' && lang === 'vi') return null;

                          return (
                            <button
                              key={lang}
                              onClick={() => setDashboardLangFilter(lang)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                                dashboardLangFilter === lang
                                  ? 'bg-slate-800 text-indigo-400 border-indigo-500/30'
                                  : 'bg-transparent text-slate-500 border-slate-800 hover:text-slate-350 hover:border-slate-750'
                              }`}
                            >
                              {lang === 'all' && `${ui.langAll} (${errorReports.length})`}
                              {lang === 'ko' && `${ui.langKo} (${count})`}
                              {lang === 'en' && `${ui.langEn} (${count})`}
                              {lang === 'es' && `${ui.langEs} (${count})`}
                              {lang === 'fr' && `${ui.langFr} (${count})`}
                              {lang === 'zh' && `${ui.langZh} (${count})`}
                              {lang === 'vi' && `${ui.langVi} (${count})`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reports List */}
                  {loadingReports ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                      <Loader2 size={30} className="animate-spin text-indigo-500" />
                      <p className="text-xs font-bold">{ui.loadingReports}</p>
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500">
                      <AlertCircle size={28} className="mx-auto mb-3 opacity-60" />
                      <p className="text-xs font-bold">{ui.emptyReports}</p>
                    </div>
                  ) : (
                    <div className="grid gap-4.5">
                      {filteredReports.map((report) => (
                        <div 
                          key={report.id} 
                          className={`bg-slate-950 border rounded-2xl p-5 shadow-lg flex flex-col gap-4 transition-all ${
                            report.status === 'resolved' 
                              ? 'border-slate-800/40 opacity-75' 
                              : 'border-slate-800 hover:border-slate-700/60'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-400">{report.reporter || '익명'}</span>
                              <span className="text-[10px] text-indigo-400 font-extrabold px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/10">
                                {report.language ? report.language.toUpperCase() : 'KO'}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {getFormattedDate(report.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {renderReportStatusBadge(report.status)}
                              <button
                                onClick={() => handlePageChange(report.page)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white rounded-lg text-[10px] font-black transition-colors cursor-pointer border border-slate-750/30 flex items-center gap-1"
                              >
                                <FileText size={10} />
                                {getDisplayPageStr(report.page, config)}p {ui.goToPage}
                              </button>
                            </div>
                          </div>

                          {/* Diff view */}
                          <div>
                            {renderDiffView(report.originalText, report.correctedText)}
                          </div>

                          {/* Details text */}
                          {report.details && (
                            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-900 text-xs text-slate-400 font-medium text-left">
                              <p className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase select-none tracking-wider">{ui.detailsLabel}</p>
                              "{report.details}"
                            </div>
                          )}

                          {/* Admin Action Bar */}
                          {isAdmin && (
                            <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
                              {report.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveAndApply(report)}
                                    className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                                  >
                                    {ui.approveApply}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingReportId(report.id);
                                      setEditingReportText(report.correctedText);
                                    }}
                                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-750/30"
                                  >
                                    {ui.editApply}
                                  </button>
                                </>
                              )}
                              {report.status !== 'resolved' && (
                                <button 
                                  onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-750/30"
                                >
                                  {ui.manualResolve}
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteReport(report.id)}
                                className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-xl text-xs font-black transition-all cursor-pointer border border-red-900/10"
                              >
                                {ui.delete}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : editMode ? (
                // 위키식 직접 편집 모드
                <div className="flex flex-col h-full gap-4 animate-fadeIn text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400">
                      {ui.editLangTitle}: <span className="text-indigo-400 font-extrabold">{bookLanguage.toUpperCase()}</span>
                    </h4>
                    {bookLanguage !== 'ko' && bookLanguage !== 'ko_hanja' && (
                      <button
                        type="button"
                        disabled={translatingText}
                        onClick={handleFetchTranslationDraft}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-500/30"
                      >
                        {translatingText ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>{ui.fetchDraftProgress}</span>
                          </>
                        ) : (
                          <>
                            <Globe size={12} />
                            <span>{ui.fetchDraft}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
                      {ui.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
                      {ui.saveLive}
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 본문 페이지 마크다운 렌더링
                <div className="flex flex-col gap-4 text-left">
                  {/* 관리자 직접 편집 배너 */}
                  {isAdmin && (
                    <div className="mb-2 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4.5 flex items-center justify-between animate-fadeIn">
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-indigo-400">본문 직접 편집 (관리자 권한)</h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          현재 선택된 언어({bookLanguage.toUpperCase()}) 버전의 이 페이지 본문을 즉시 오버라이드하여 수정합니다.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
                      >
                        본문 편집 시작
                      </button>
                    </div>
                  )}

                  {/* 이 페이지에 제안된 오류 정정 메모 (미반영 건) */}
                  {pageNum > 0 && currentPageReports.length > 0 && (
                    <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                          <AlertTriangle size={16} />
                          <span>{ui.openMemos} ({currentPageReports.length}건)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMemos(!showMemos)}
                          className="text-xs font-bold text-amber-500 hover:text-amber-400 underline cursor-pointer"
                        >
                          {showMemos ? ui.hideMemos : ui.showMemos}
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                        {ui.openMemosDesc}
                      </p>
  
                      {showMemos && (
                        <div className="mt-3.5 space-y-2.5 border-t border-amber-500/10 pt-3 text-xs">
                          {currentPageReports.map((report) => (
                            <div key={report.id} className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex flex-col gap-3">
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="font-semibold text-slate-400">{report.reporter} 님의 의견</span>
                                <span>{getFormattedDate(report.createdAt)}</span>
                              </div>
                              <div>
                                {renderDiffView(report.originalText, report.correctedText)}
                              </div>
                              {report.details && (
                                <p className="text-slate-400 text-[11.5px] leading-relaxed pl-1 italic">
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
                        <p className="text-xs font-bold">{ui.loadingText}</p>
                      </div>
                    ) : (() => {
                      const normLang = getLangPrefix(bookLanguage);
                      const isKorean = bookLanguage === 'ko' || bookLanguage === 'ko_hanja';
                      
                      // 1. 직접 저장된 번역 오버라이드 또는 정적 텍스트
                      const dbContent = pageOverrides[normLang]?.[pageNum] !== undefined 
                        ? pageOverrides[normLang][pageNum] 
                        : pageTextMap[pageNum];
                      
                      // 2. 실시간 구글 자동 번역 결과가 있을 때 우선 적용
                      const displayContent = autoTranslatedText || dbContent;
                      const hasTranslation = !!displayContent;
                      const fallbackContent = !isKorean && !hasTranslation ? koTextMap[pageNum] : null;
                      const finalContent = displayContent || fallbackContent;
  
                      // 번역본도 없고, 원본 한국어도 아예 없는 완전 빈 페이지인 경우
                      if (!finalContent && !koTextMap[pageNum]) {
                        return (
                          <div className="max-w-md mx-auto my-12 bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl animate-fadeIn text-left">
                            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/20">
                              <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-200 mb-2">텍스트 복원 진행 중인 페이지</h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                              현재 <strong>{config.title}</strong> 현대어 번역 및 디지털 정제 작업이 진행 중입니다. (전체 {config.maxPage}페이지 수록 완료)
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
                                onClick={handleOpenReportModal}
                                className="w-full mt-1 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all cursor-pointer"
                              >
                                이 페이지 번역/정정 제안하기
                              </button>
                            </div>
                          </div>
                        );
                      }
  
                      // 외국어를 보는데 해당 페이지 번역본이 저장되어 있지 않고, 자동 번역도 수행하지 않은 경우
                      if (!isKorean && !dbContent && !autoTranslatedText) {
                        return (
                          <div className="max-w-md mx-auto my-12 bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl animate-fadeIn text-left">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/20">
                              <Globe size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-200 mb-2">{ui.translationNotFound}</h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                              {ui.translationNotFoundDesc}
                            </p>
                            <div className="flex flex-col gap-2.5">
                              <button
                                type="button"
                                disabled={translatingText}
                                onClick={handleAutoTranslateCurrentPage}
                                className="w-full py-3.5 text-xs font-black bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/30"
                              >
                                {translatingText ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Google 번역 처리 중...</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe size={14} />
                                    <span>{ui.readRealtime}</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setBookLanguage('ko')}
                                className="w-full py-3 text-xs font-black bg-slate-900 hover:bg-slate-800 text-slate-450 hover:text-slate-350 rounded-xl transition-all cursor-pointer border border-slate-800/40"
                              >
                                {ui.readKoreanOrigin}
                              </button>
                            </div>
                          </div>
                        );
                      }
  
                      return (
                        <div className="font-serif leading-relaxed text-slate-200 animate-fadeIn">
                          {!isKorean && !dbContent && autoTranslatedText && (
                            <div className="mb-6 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                              <span className="text-indigo-400 text-lg mt-0.5">🌐</span>
                              <div>
                                <p className="text-indigo-300 text-xs font-black mb-0.5">{ui.machineTranslated}</p>
                                <p className="text-slate-400 text-[11px] leading-relaxed">{ui.machineTranslatedDesc}</p>
                              </div>
                            </div>
                          )}
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({href, children}) => {
                                if (href && href.match(/^\/reader\/[^?]+\?page=/)) {
                                  const urlParams = new URLSearchParams(href.split('?')[1]);
                                  const targetPage = parseInt(urlParams.get('page'), 10);
                                  if (!isNaN(targetPage)) {
                                    return (
                                      <a
                                        href={href}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handlePageChange(targetPage);
                                        }}
                                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                                      >
                                        {children}
                                      </a>
                                    );
                                  }
                                }
                                return <a href={href} className="text-indigo-400 hover:underline">{children}</a>;
                              },
                              h1: ({children}) => <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-6 leading-tight pb-3 border-b border-slate-800">{children}</h1>,
                              h2: ({children}) => <h2 className="text-xl sm:text-2xl font-black text-indigo-400 mt-8 mb-4">{children}</h2>,
                              h3: ({children}) => <h3 className="text-lg sm:text-xl font-bold text-slate-200 mt-6 mb-3 border-l-4 border-saemaul-green pl-3">{children}</h3>,
                              p: ({children}) => <p className="text-slate-300 text-sm sm:text-base leading-8 mb-5 break-keep font-medium whitespace-pre-line">{children}</p>,
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
                              td: ({children}) => <td className="px-4 py-2.5 border-b border-slate-800/50 text-slate-300 font-medium bg-slate-950/20">{children}</td>,
                              img: () => null
                            }}
                          >
                            {getProcessedMarkdown(finalContent)}
                          </ReactMarkdown>
                        </div>
                      );
                    })()}
                  </article>
                </div>
              )}
            </div>
          </div>
  
          {/* ==================== SEARCH PANEL: SLIDE OVER ==================== */}
          {searchOpen && (
            <div className="w-full md:w-80 bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden h-full z-20 absolute md:relative right-0 top-0 shadow-2xl animate-slideLeft">
              
              {/* Search Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Search size={16} />
                  <h4 className="font-black text-sm text-slate-100">{ui.searchPanelTitle}</h4>
                </div>
                <button 
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              
              {/* Search Box */}
              <div className="p-4 border-b border-slate-800 flex flex-col gap-2 flex-shrink-0">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={ui.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="absolute left-3 top-2.5 text-slate-500">
                    <Search size={14} />
                  </div>
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results */}
              <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(res.page)}
                    className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl p-3.5 text-left transition-all hover:border-slate-700 flex flex-col gap-2 cursor-pointer w-full"
                  >
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                      <span>{getDisplayPageStr(res.page, config)}페이지</span>
                      <span className="text-indigo-400 uppercase">{bookLanguage.toUpperCase()}</span>
                    </div>
                    <p className="text-slate-350 text-[11px] leading-relaxed break-keep font-medium">
                      {res.snippet}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
  
        </div>
      </div>
      
      {/* ==================== ERROR REPORT MODAL ==================== */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle size={18} />
                <h3 className="text-base font-black text-slate-100">{ui.suggestCorrection}</h3>
              </div>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSubmitReport} className="p-6 flex flex-col gap-4 text-sm max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 text-xs">{ui.errorPageLabel}</label>
                  <input 
                    type="text" 
                    value={`${getDisplayPageStr(pageNum, config)} ${ui.langFilterLabel ? '페이지' : 'Page'}`} 
                    disabled 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-500 font-extrabold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 text-xs">{ui.originalAuthor}</label>
                  <input 
                    type="text" 
                    placeholder="User Name"
                    value={reportForm.reporter}
                    onChange={(e) => setReportForm(prev => ({ ...prev, reporter: e.target.value }))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs flex justify-between">
                  <span>{ui.originalText}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{ui.originalTextReadOnly}</span>
                </label>
                <textarea 
                  value={reportForm.originalText}
                  disabled
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-4.5 text-slate-500 font-mono text-xs leading-relaxed outline-none resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs text-amber-400">{ui.correctedText} ({ui.correctedTextHelp})</label>
                <textarea 
                  value={reportForm.correctedText}
                  onChange={(e) => setReportForm(prev => ({ ...prev, correctedText: e.target.value }))}
                  required
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-4.5 text-slate-100 font-mono text-xs leading-relaxed outline-none resize-y min-h-[120px]"
                  placeholder="Correct typos directly in this window."
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs">{ui.details}</label>
                <textarea 
                  value={reportForm.details}
                  onChange={(e) => setReportForm(prev => ({ ...prev, details: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-4.5 text-slate-100 placeholder-slate-600 outline-none"
                  placeholder={ui.detailReasonHelp}
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setReportModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-450 font-bold text-xs cursor-pointer"
                >
                  {ui.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingReport ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
                  {ui.submitButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADMIN EDIT REPORT MODAL ==================== */}
      {editingReportId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-base font-black text-slate-100">{ui.editApply}</h3>
              <button 
                onClick={() => setEditingReportId(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 text-xs">{ui.editLangTitle}</label>
                <textarea 
                  value={editingReportText}
                  onChange={(e) => setEditingReportText(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-slate-100 font-mono text-xs leading-relaxed outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setEditingReportId(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-350 text-xs font-bold cursor-pointer"
                >
                  {ui.cancel}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const report = errorReports.find(r => r.id === editingReportId);
                    if (report) handleApproveAndApply(report, editingReportText);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  {ui.editApply}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FLOATING PAGE NAVIGATION BAR ==================== */}
      {pageNum > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-2xl animate-fadeIn">
          <button
            type="button"
            onClick={() => handlePageChange(pageNum - 1)}
            disabled={pageNum <= 1}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-850 cursor-pointer"
            title="이전 페이지"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = parseDisplayPage(pageInputValue, config);
                  if (target !== null) {
                    handlePageChange(target);
                  } else {
                    alert('Page range: 1~' + config.maxPage);
                    setPageInputValue(getDisplayPageStr(pageNum, config));
                  }
                }
              }}
              onBlur={() => {
                const target = parseDisplayPage(pageInputValue, config);
                if (target !== null) {
                  handlePageChange(target);
                } else {
                  setPageInputValue(getDisplayPageStr(pageNum, config));
                }
              }}
              className="w-16 bg-slate-900 border border-slate-800 text-slate-100 text-center py-1 rounded-xl text-xs font-black focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-bold select-none">/ {getDisplayPageStr(config.maxPage, config)}</span>
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(pageNum + 1)}
            disabled={pageNum >= config.maxPage}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-850 cursor-pointer"
            title="다음 페이지"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

export default BookReader;
