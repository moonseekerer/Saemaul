import os
import re
import sys
import json
import time
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

def translate_batch_via_mistral(batch_items, target_lang, api_key):
    """
    여러 개의 한국어 문장을 JSON 구조를 유지하여 하나의 Mistral AI 호출로 번역합니다.
    """
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    lang_map = {
        "en": "English",
        "es": "Spanish (Español)",
        "fr": "French (Français)",
        "vi": "Vietnamese (Tiếng Việt)",
        "zh": "Chinese (Simplified, 中文)"
    }
    target_lang_name = lang_map.get(target_lang, "English")
    
    # JSON 입력 및 출력 형식을 엄격히 지정하여 일치화시킵니다.
    prompt = (
        f"You are an expert translator. Translate the following list of Korean texts into {target_lang_name}. "
        f"You must preserve all markdown syntax (like headers #, lists -, bold **, ---) inside the texts. "
        f"Provide the output in JSON format matching the input structure, as a JSON array of translated strings. "
        f"Return ONLY the valid JSON array without any explanations, markdown code blocks (like ```json), or extra text."
    )
    
    # 텍스트만 추출
    texts_to_translate = [item["text"] for item in batch_items]
    
    data = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": json.dumps(texts_to_translate, ensure_ascii=False)}
        ],
        "temperature": 0.1
    }
    
    retries = 3
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                url, 
                data=json.dumps(data).encode('utf-8'), 
                headers=headers,
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=40) as response:
                res_body = response.read().decode('utf-8')
                res_json = json.loads(res_body)
                content = res_json['choices'][0]['message']['content'].strip()
                
                # 가끔 모델이 ```json 또는 ``` 로 감싸서 리턴하는 경우가 있어 정제 처리
                if content.startswith("```json"):
                    content = content[7:]
                elif content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                translated_list = json.loads(content)
                if isinstance(translated_list, list) and len(translated_list) == len(texts_to_translate):
                    return translated_list
                else:
                    print(f"  [WARN] Translated list length mismatch ({len(translated_list)} vs {len(texts_to_translate)}). Retrying...")
        except Exception as e:
            print(f"  [WARN] Attempt {attempt+1} failed to translate batch: {e}")
            if "429" in str(e):
                # Rate limit 걸릴 경우 20초 슬립 후 재시도
                time.sleep(20)
            else:
                time.sleep(5)
                
    return None

def process_file_translation_batched(filename, target_lang, api_key, docs_dir, batch_size=20):
    filepath = os.path.join(docs_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        return
        
    print(f"\n>>> Processing {filename} ({target_lang}) with Batched Mistral AI...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        untranslated_items = []
        
        # 1. 번역이 필요한 라인 인덱스 수집
        for i, line in enumerate(lines):
            line_str = line.strip()
            if not line_str:
                continue
                
            cleaned_line = re.sub(r'\([^\)]*\)', '', line_str)
            cleaned_line = re.sub(r'--- \(p\.\s*\d+\)\s*---', '', cleaned_line).strip()
            korean_chars = re.findall(r'[가-힣]', cleaned_line)
            
            if len(korean_chars) > 10 and (len(korean_chars) / len(line_str)) > 0.4:
                untranslated_items.append({"index": i, "text": line_str})
                
        print(f"  Found {len(untranslated_items)} lines needing translation.")
        
        if not untranslated_items:
            print(f"  [CLEAN] No lines need translation in {filename}.")
            return
            
        # 2. 배치 단위로 묶어서 순차 번역 요청
        translated_count = 0
        for start_idx in range(0, len(untranslated_items), batch_size):
            batch = untranslated_items[start_idx : start_idx + batch_size]
            print(f"  Translating batch {start_idx // batch_size + 1}/{-(-len(untranslated_items) // batch_size)} ({len(batch)} lines)...")
            
            translated_results = translate_batch_via_mistral(batch, target_lang, api_key)
            
            if translated_results:
                for item, translated_text in zip(batch, translated_results):
                    idx = item["index"]
                    orig_line = lines[idx]
                    has_newline = orig_line.endswith('\n')
                    lines[idx] = translated_text + ('\n' if has_newline else '')
                    translated_count += 1
                print(f"    -> Successfully translated {len(batch)} lines.")
            else:
                print(f"    -> [ERROR] Failed to translate this batch. Keeping original Korean.")
            
            # API 보호를 위한 슬립 타임 추가
            time.sleep(3)
            
        # 3. 파일 다시 쓰기
        if translated_count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print(f"  [SUCCESS] Total {translated_count} lines translated & updated in {filename}!")
        else:
            print(f"  [NO CHANGE] No updates applied to {filename}.")
            
    except Exception as e:
        print(f"  [ERROR] Processing {filename} failed: {e}")

def main():
    api_key = os.environ.get("MISTRAL_API_KEY", "")
    
    if not api_key:
        api_key = input("Please enter your Mistral API Key: ").strip()
        
    if not api_key:
        print("Error: A valid Mistral API Key is required.")
        sys.exit(1)
        
    docs_dir = "H:/개인/공모전 프로젝트/0.새마을/public/docs"
    
    # 번역 대상 파일
    translation_targets = [
        {"file": "saemaul_10years_full_vi.md", "lang": "vi"},
        {"file": "saemaul_glory_full_vi.md", "lang": "vi"},
        {"file": "saemaul_glory_full_es.md", "lang": "es"},
        {"file": "saemaul_glory_full_fr.md", "lang": "fr"},
        {"file": "saemaul_10years_full_fr.md", "lang": "fr"},
        {"file": "saemaul_10years_full_zh.md", "lang": "zh"},
        {"file": "saemaul_10years_full_es.md", "lang": "es"},
        {"file": "saemaul_glory_full_zh.md", "lang": "zh"}
    ]
    
    for target in translation_targets:
        # 배치 사이즈는 15개로 설정하여 안전하게 번역을 진행합니다.
        process_file_translation_batched(target["file"], target["lang"], api_key, docs_dir, batch_size=15)

if __name__ == "__main__":
    main()
