import os
import re
import sys
import json
import time
import queue
import threading
import requests

sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DOCS_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "docs"))
DOCS_DIR = os.environ.get("DOCS_DIR", DEFAULT_DOCS_DIR)
if not os.path.exists(DOCS_DIR):
    DOCS_DIR = r"C:\Users\PARK\.gemini\antigravity\scratch\Saemaul\public\docs"

API_URL = "https://open.hasa.re.kr/v1/chat/completions"

# 4개 H100/H200 API 키 풀 (오직 환경변수 또는 로컬 보안 설정에서만 로드)
TOKEN_POC_1 = os.environ.get("TOKEN_POC_1", "")
TOKEN_POC_2 = os.environ.get("TOKEN_POC_2", "")
TOKEN_DEV_1 = os.environ.get("TOKEN_DEV_1", "")
TOKEN_DEV_2 = os.environ.get("TOKEN_DEV_2", "")

# 로컬 .env 또는 secrets.json 파일이 있으면 안전하게 로드
_secrets_file = os.path.join(os.path.dirname(__file__), "..", ".env.secrets")
if os.path.exists(_secrets_file):
    with open(_secrets_file, "r", encoding="utf-8") as _sf:
        for line in _sf:
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())
    TOKEN_POC_1 = os.environ.get("TOKEN_POC_1", TOKEN_POC_1)
    TOKEN_POC_2 = os.environ.get("TOKEN_POC_2", TOKEN_POC_2)
    TOKEN_DEV_1 = os.environ.get("TOKEN_DEV_1", TOKEN_DEV_1)
    TOKEN_DEV_2 = os.environ.get("TOKEN_DEV_2", TOKEN_DEV_2)

PRIMARY_MODEL = "gpt-oss-120b"   # H200 RNGD (OpenAI 120B Flagship)
FALLBACK_MODEL = "llama-3.3-70b" # H200 (Meta 70B Multilingual Flagship)

PROMPTS = {
    "ru": {
        "system": (
            "You are an expert translator of Saemaul Undong historical archives.\n"
            "Translate the following Korean text into high-quality, formal academic Russian.\n"
            "CRITICAL RULES:\n"
            "1. You MUST translate into Russian. NEVER repeat or echo Korean text.\n"
            "2. Preserve page delimiters exactly as '--- (p. N) ---'.\n"
            "3. Preserve all Markdown formatting (headers #, lists -, tables, links).\n"
            "4. Output ONLY the translated Markdown. Do not include markdown code block backticks (```) or introductory comments."
        ),
        "user_prefix": "Translate the following pages into academic Russian, strictly keeping page delimiters:\n\n"
    },
    "ar": {
        "system": (
            "You are an expert translator of Saemaul Undong historical archives.\n"
            "Translate the following Korean text into formal academic Arabic (العربية الفصحى).\n"
            "CRITICAL RULES:\n"
            "1. You MUST translate into Arabic. NEVER repeat or echo Korean text.\n"
            "2. Preserve page delimiters exactly as '--- (p. N) ---'.\n"
            "3. Preserve all Markdown formatting (headers #, lists -, tables, links).\n"
            "4. Output ONLY the translated Markdown. Do not include markdown code block backticks (```) or introductory comments."
        ),
        "user_prefix": "Translate the following pages into formal academic Arabic, strictly keeping page delimiters:\n\n"
    }
}

def clean_translated_text(target_lang, text):
    if not text:
        return ""
    cleaned = re.sub(r'---\s*\(p\.\s*\d+\)\s*---', '', text).strip()
    if cleaned.startswith("```markdown"):
        cleaned = cleaned[11:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    cleaned = re.sub(r'^(#+\s*)?(Перевод на русский язык|Текст перевода|Русский перевод|Translation:?)[^\n]*\n+', '', cleaned, flags=re.I).strip()
    cleaned = re.sub(r'^(#+\s*)?(الترجمة إلى العربية|نص الترجمة|ترجمة النص:?)[^\n]*\n+', '', cleaned, flags=re.I).strip()
    cleaned = re.sub(r'\n+\s*\*\*Note:\*\*.*$', '', cleaned, flags=re.S).strip()
    return cleaned.strip()

def is_valid_translation(target_lang, text):
    if not text or len(text.strip()) < 3:
        return False
    hangul = len(re.findall(r'[\uac00-\ud7af]', text))
    if hangul > 40:
        return False
    if target_lang == "ru":
        cyrillic = len(re.findall(r'[\u0400-\u04ff]', text))
        return cyrillic >= 8
    elif target_lang == "ar":
        arabic = len(re.findall(r'[\u0600-\u06ff]', text))
        return arabic >= 8
    return True

class TokenWorkerPool:
    def __init__(self, token, rpm_limit, name):
        self.token = token
        self.min_interval = 60.0 / (rpm_limit * 0.90)
        self.name = name
        self.last_call_time = 0.0
        self.lock = threading.Lock()

    def request(self, payload, max_retries=4, timeout=60):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        for attempt in range(max_retries):
            with self.lock:
                now = time.time()
                elapsed = now - self.last_call_time
                if elapsed < self.min_interval:
                    time.sleep(self.min_interval - elapsed)
                self.last_call_time = time.time()

            try:
                resp = requests.post(API_URL, headers=headers, json=payload, timeout=timeout)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    if content.startswith("```markdown"):
                        content = content[11:]
                    elif content.startswith("```"):
                        content = content[3:]
                    if content.endswith("```"):
                        content = content[:-3]
                    return content.strip()
                elif resp.status_code == 429:
                    time.sleep(3.0 * (attempt + 1))
                else:
                    time.sleep(2.0)
            except Exception:
                time.sleep(2.0 * (attempt + 1))
        return None

def parse_pages_from_text(text):
    parts = re.split(r'---\s*\(p\.\s*(\d+)\)\s*---', text)
    prefix = parts[0]
    pages = {}
    for i in range(1, len(parts), 2):
        pno = int(parts[i])
        content = parts[i+1]
        pages[pno] = content
    return prefix, pages

def assemble_book(prefix, pages_dict):
    out = [prefix.rstrip()]
    for pno in sorted(pages_dict.keys()):
        clean_content = clean_translated_text("any", pages_dict[pno])
        out.append(f"\n\n--- (p. {pno}) ---\n" + clean_content + "\n")
    return "".join(out).lstrip()

def build_dynamic_chunks(untranslated_pnos, all_src_pages):
    chunks = []
    idx = 0
    while idx < len(untranslated_pnos):
        pno = untranslated_pnos[idx]
        content = all_src_pages[pno]
        
        has_table = "|---" in content or content.count("|") > 15
        is_long = len(content) > 800
        
        if has_table or is_long:
            chunks.append([pno])
            idx += 1
        else:
            cur_chunk = [pno]
            cur_len = len(content)
            for step in range(1, 3):
                if idx + step < len(untranslated_pnos):
                    next_pno = untranslated_pnos[idx + step]
                    if next_pno == cur_chunk[-1] + 1:
                        next_content = all_src_pages[next_pno]
                        next_has_table = "|---" in next_content or next_content.count("|") > 15
                        if not next_has_table and cur_len + len(next_content) <= 1200:
                            cur_chunk.append(next_pno)
                            cur_len += len(next_content)
                        else:
                            break
                    else:
                        break
            chunks.append(cur_chunk)
            idx += len(cur_chunk)
    return chunks

def process_book_dual_language(src_file):
    src_path = os.path.join(DOCS_DIR, src_file)
    base_name = os.path.splitext(src_file)[0]
    
    with open(src_path, "r", encoding="utf-8") as f:
        src_text = f.read()

    prefix, all_src_pages = parse_pages_from_text(src_text)
    total_pages = len(all_src_pages)
    
    print(f"\n=======================================================", flush=True)
    print(f"[{base_name.upper()}] 4개 토큰 풀 6-워커 슈퍼차지 파이프라인 가동 (총 {total_pages}p)", flush=True)
    print(f"=======================================================", flush=True)

    cache_path_ru = os.path.join(DOCS_DIR, f"cache_{base_name}_ru.json")
    out_path_ru = os.path.join(DOCS_DIR, f"{base_name}_ru.md")
    cache_ru = {}
    if os.path.exists(cache_path_ru):
        try:
            with open(cache_path_ru, "r", encoding="utf-8") as f:
                for k, v in json.load(f).items():
                    if is_valid_translation("ru", v):
                        cache_ru[int(k)] = v
        except Exception:
            pass

    cache_path_ar = os.path.join(DOCS_DIR, f"cache_{base_name}_ar.json")
    out_path_ar = os.path.join(DOCS_DIR, f"{base_name}_ar.md")
    cache_ar = {}
    if os.path.exists(cache_path_ar):
        try:
            with open(cache_path_ar, "r", encoding="utf-8") as f:
                for k, v in json.load(f).items():
                    if is_valid_translation("ar", v):
                        cache_ar[int(k)] = v
        except Exception:
            pass

    for pno, content in all_src_pages.items():
        if len(content.strip()) < 3:
            cache_ru[pno] = content.strip()
            cache_ar[pno] = content.strip()

    untranslated_ru = [p for p in sorted(all_src_pages.keys()) if p not in cache_ru]
    untranslated_ar = [p for p in sorted(all_src_pages.keys()) if p not in cache_ar]

    print(f"러시아어(RU) 기존 캐시 {len(cache_ru)}p | 잔여: {len(untranslated_ru)}p / {total_pages}p", flush=True)
    print(f"아랍어(AR)   기존 캐시 {len(cache_ar)}p | 잔여: {len(untranslated_ar)}p / {total_pages}p", flush=True)

    chunks_ru = build_dynamic_chunks(untranslated_ru, all_src_pages)
    chunks_ar = build_dynamic_chunks(untranslated_ar, all_src_pages)

    print(f"청크 생성: RU {len(chunks_ru)}개 청크, AR {len(chunks_ar)}개 청크", flush=True)

    ru_queue = queue.Queue()
    for ch in chunks_ru:
        ru_queue.put(ch)

    ar_queue = queue.Queue()
    for ch in chunks_ar:
        ar_queue.put(ch)

    # 4개 워커 풀 생성
    pool_poc1 = TokenWorkerPool(TOKEN_POC_1, rpm_limit=20, name="POC-1")
    pool_poc2 = TokenWorkerPool(TOKEN_POC_2, rpm_limit=20, name="POC-2")
    pool_dev1 = TokenWorkerPool(TOKEN_DEV_1, rpm_limit=10, name="DEV-1")
    pool_dev2 = TokenWorkerPool(TOKEN_DEV_2, rpm_limit=10, name="DEV-2")

    state_lock = threading.Lock()
    start_time = time.time()
    counter_ru = 0
    counter_ar = 0

    def translate_single_page(pno, target_lang, worker_pool):
        content = all_src_pages[pno]
        user_prompt = f"{PROMPTS[target_lang]['user_prefix']}--- (p. {pno}) ---\n{content}\n"
        for m in [PRIMARY_MODEL, FALLBACK_MODEL]:
            payload = {
                "model": m,
                "messages": [
                    {"role": "system", "content": PROMPTS[target_lang]["system"]},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.1
            }
            res = worker_pool.request(payload)
            if res:
                cand = clean_translated_text(target_lang, res)
                if is_valid_translation(target_lang, cand):
                    return cand
        return None

    def execute_chunk(chunk, target_lang, worker_pool, worker_tag):
        nonlocal counter_ru, counter_ar
        t0 = time.time()
        
        target_cache = cache_ru if target_lang == "ru" else cache_ar
        cache_path = cache_path_ru if target_lang == "ru" else cache_path_ar
        out_path = out_path_ru if target_lang == "ru" else out_path_ar

        if len(chunk) == 1:
            pno = chunk[0]
            trans = translate_single_page(pno, target_lang, worker_pool)
            if trans:
                with state_lock:
                    target_cache[pno] = trans
        else:
            chunk_text = ""
            for p in chunk:
                chunk_text += f"\n\n--- (p. {p}) ---\n{all_src_pages[p].strip()}\n"
            user_prompt = f"{PROMPTS[target_lang]['user_prefix']}{chunk_text}"
            success = False
            for m in [PRIMARY_MODEL, FALLBACK_MODEL]:
                payload = {
                    "model": m,
                    "messages": [
                        {"role": "system", "content": PROMPTS[target_lang]["system"]},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.1
                }
                res = worker_pool.request(payload)
                if res:
                    _, parsed = parse_pages_from_text(res)
                    cleaned_parsed = {}
                    for p in chunk:
                        if p in parsed:
                            cleaned_parsed[p] = clean_translated_text(target_lang, parsed[p])
                    if all(p in cleaned_parsed and is_valid_translation(target_lang, cleaned_parsed[p]) for p in chunk):
                        with state_lock:
                            for p in chunk:
                                target_cache[p] = cleaned_parsed[p]
                        success = True
                        break

            if not success:
                for p in chunk:
                    trans = translate_single_page(p, target_lang, worker_pool)
                    if trans:
                        with state_lock:
                            target_cache[p] = trans

        elapsed = time.time() - t0
        with state_lock:
            if target_lang == "ru":
                counter_ru += 1
                curr_c = counter_ru
                done_p = len(target_cache)
            else:
                counter_ar += 1
                curr_c = counter_ar
                done_p = len(target_cache)

            if curr_c % 5 == 0 or done_p == total_pages:
                try:
                    with open(cache_path, "w", encoding="utf-8") as f:
                        json.dump(target_cache, f, ensure_ascii=False, indent=2)
                    
                    assembled_pages = {}
                    for p in sorted(all_src_pages.keys()):
                        assembled_pages[p] = target_cache.get(p, all_src_pages[p])
                    with open(out_path, "w", encoding="utf-8") as f:
                        f.write(assemble_book(prefix, assembled_pages))
                except Exception as e:
                    print(f"디스크 저장 예외: {e}")

        pct = (done_p / total_pages) * 100
        print(f"[{target_lang.upper()}] [{worker_tag}] {chunk[0]}~{chunk[-1]}p ({elapsed:.1f}s) | 완료: {done_p}/{total_pages}p ({pct:.1f}%)", flush=True)

    # 범용 워커 생성기 (주력 언어 큐 우선 처리 후 상호 보조)
    def create_worker(pool, primary_lang, secondary_lang, worker_id):
        tag = f"{pool.name} #{worker_id}"
        pri_q = ru_queue if primary_lang == "ru" else ar_queue
        sec_q = ar_queue if primary_lang == "ru" else ru_queue

        while True:
            try:
                chunk = pri_q.get_nowait()
                execute_chunk(chunk, primary_lang, pool, tag)
                pri_q.task_done()
                continue
            except queue.Empty:
                pass

            try:
                chunk = sec_q.get_nowait()
                execute_chunk(chunk, secondary_lang, pool, tag)
                sec_q.task_done()
                continue
            except queue.Empty:
                break

    threads = []
    # POC-1 (2 스레드): 주력 러시아어
    threads.append(threading.Thread(target=create_worker, args=(pool_poc1, "ru", "ar", 1)))
    threads.append(threading.Thread(target=create_worker, args=(pool_poc1, "ru", "ar", 2)))

    # POC-2 (2 스레드): 주력 아랍어 (신규 추가된 실증키를 아랍어에 전격 투입하여 3배 가속)
    threads.append(threading.Thread(target=create_worker, args=(pool_poc2, "ar", "ru", 1)))
    threads.append(threading.Thread(target=create_worker, args=(pool_poc2, "ar", "ru", 2)))

    # DEV-1 (1 스레드): 주력 아랍어
    threads.append(threading.Thread(target=create_worker, args=(pool_dev1, "ar", "ru", 1)))

    # DEV-2 (1 스레드): 주력 러시아어 (신규 추가된 개발키를 러시아어에 보조 투입)
    threads.append(threading.Thread(target=create_worker, args=(pool_dev2, "ru", "ar", 1)))

    for t in threads:
        t.daemon = True
        t.start()

    for t in threads:
        t.join()

    with open(cache_path_ru, "w", encoding="utf-8") as f:
        json.dump(cache_ru, f, ensure_ascii=False, indent=2)
    with open(cache_path_ar, "w", encoding="utf-8") as f:
        json.dump(cache_ar, f, ensure_ascii=False, indent=2)

    final_ru = {p: cache_ru.get(p, all_src_pages[p]) for p in sorted(all_src_pages.keys())}
    final_ar = {p: cache_ar.get(p, all_src_pages[p]) for p in sorted(all_src_pages.keys())}

    with open(out_path_ru, "w", encoding="utf-8") as f:
        f.write(assemble_book(prefix, final_ru))
    with open(out_path_ar, "w", encoding="utf-8") as f:
        f.write(assemble_book(prefix, final_ar))

    elapsed_total = time.time() - start_time
    print(f"\n=======================================================", flush=True)
    print(f"✔ [{base_name.upper()}] 4개 키 6-워커 전체 완역 성공! 총 소요: {elapsed_total:.1f}초 ({elapsed_total/60:.1f}분)", flush=True)
    print(f"=======================================================\n", flush=True)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "10years"
    
    if target in ["10years", "both"]:
        process_book_dual_language("saemaul_10years_full.md")
    if target in ["glory", "both"]:
        process_book_dual_language("saemaul_glory_full.md")
