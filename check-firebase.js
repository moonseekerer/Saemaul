import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkyhnqk4VTX20xEHvmzFe5r9sNYgUXYbk",
  authDomain: "saemaul-sdgs.firebaseapp.com",
  projectId: "saemaul-sdgs",
  storageBucket: "saemaul-sdgs.firebasestorage.app",
  messagingSenderId: "550605640090",
  appId: "1:550605640090:web:4e30a84be713ec065c6a23",
  measurementId: "G-Y500T29XVM"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

async function checkStorage() {
  console.log("=== Firebase Storage 탐색 ===");
  try {
    const listRef = ref(storage, '/');
    const res = await listAll(listRef);
    console.log("Root 폴더 파일 수:", res.items.length);
    res.items.forEach((itemRef) => {
      console.log("- 파일:", itemRef.name, "(경로:", itemRef.fullPath, ")");
    });
    console.log("Root 폴더 하위 디렉토리 수:", res.prefixes.length);
    for (const prefixRef of res.prefixes) {
      console.log("- 디렉토리:", prefixRef.name);
      try {
        const subRes = await listAll(prefixRef);
        subRes.items.forEach((itemRef) => {
          console.log("  └ 파일:", itemRef.name);
        });
      } catch (err) {
        console.error("  └ 하위 디렉토리 읽기 실패:", err.message);
      }
    }
  } catch (error) {
    console.error("Storage 탐색 실패:", error.message);
  }
}

async function checkFirestore() {
  console.log("\n=== Firestore 컬렉션 탐색 ===");
  const possibleCollections = [
    "translations", "translated", "documents", "docs", "chapters", 
    "saemaul_10years", "translated_docs", "en_docs", "english_docs",
    "english", "saemaul_translations", "posts", "attendance"
  ];

  for (const colName of possibleCollections) {
    try {
      const q = query(collection(db, colName), limit(3));
      const snap = await getDocs(q);
      if (!snap.empty) {
        console.log(`- 컬렉션 '${colName}' 발견! (문서 수: ${snap.size}개 이상)`);
        snap.forEach(doc => {
          console.log(`  └ ID: ${doc.id}, 데이터 요약:`, Object.keys(doc.data()));
        });
      }
    } catch (err) {
      // 권한 에러 등으로 조회가 안 될 수 있음
    }
  }
}

async function run() {
  await checkStorage();
  await checkFirestore();
  process.exit(0);
}

run();
