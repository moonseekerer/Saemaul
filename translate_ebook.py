import re
import os
import json
import urllib.request
import time
import argparse

API_KEY = "".strip()
MODEL_NAME = "gemini-3.5-flash"
BASE_DIR = "h:/개인/공모전 프로젝트/0.새마을"
SOURCE_FILE = os.path.join(BASE_DIR, "public/docs/saemaul_10years_full.md")
PROGRESS_FILE = os.path.join(BASE_DIR, "public/docs/translate_progress_en.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "public/docs/saemaul_10years_full_en.md")

def parse_source_file():
    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        text = f.read()
    sections = re.split(r'--- \(p\. (\d+)\) ---', text)
    pages = {}
    intro = sections[0].strip()
    
    for i in range(1, len(sections), 2):
        page_num = int(sections[i])
        content = sections[i+1].strip()
        pages[page_num] = content
        
    return intro, pages

def save_source_file(intro, pages_map):
    # Sort pages by page number
    sorted_pages = sorted(pages_map.keys())
    lines = []
    if intro:
        lines.append(intro)
        lines.append("")
        
    for p in sorted_pages:
        lines.append(f"--- (p. {p}) ---")
        lines.append(pages_map[p])
        lines.append("")
        
    with open(SOURCE_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def save_progress(progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                return {int(k): v for k, v in data.items()}
            except:
                return {}
    return {}

def compile_markdown_file(intro, progress_map):
    sorted_pages = sorted(progress_map.keys())
    lines = []
    if intro:
        lines.append(intro)
        lines.append("")
        
    for p in sorted_pages:
        lines.append(f"--- (p. {p}) ---")
        lines.append(progress_map[p])
        lines.append("")
        
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def call_gemini(prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }

    retries = 5
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                url, 
                data=json.dumps(data).encode("utf-8"), 
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Clean up markdown wrapping block if any
                if text.startswith("```markdown"):
                    text = text[11:]
                elif text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                return text.strip()
        except Exception as e:
            if hasattr(e, 'code') and e.code == 429:
                print(f"Rate limit hit (429) on attempt {attempt+1}/{retries}. Sleeping 60 seconds...")
                time.sleep(60)
            else:
                print(f"Gemini API call failed (attempt {attempt+1}/{retries}): {e}")
                if attempt < retries - 1:
                    sleep_time = (attempt + 1) * 10
                    time.sleep(sleep_time)
                else:
                    raise e
    raise Exception(f"Failed to generate content after {retries} attempts.")

def translate_korean_page(page_num, page_content, prev_content, next_content):
    prompt = f"""You are an expert translator translating a historical book about the Saemaul Undong in Korea into English.
Please translate the following Korean markdown content for Page {page_num} into English.

[CRITICAL TRANSLATION RULES]
1. NEVER translate "새마을운동" as "New Village Movement" or "New village movement". You MUST always translate/transliterate it exactly as "Saemaul Undong".
2. Hanja (Chinese characters) in the source is often written alongside the Korean equivalent (e.g. 독립(獨立) or 獨立(독립)). You MUST analyze the meaning of the word and translate it ONLY ONCE into English. Do not write duplicate translations or keep the Hanja characters in the output.
3. The text is split page-by-page, which sometimes cuts off sentences or words mid-sentence at the page boundary.
   - We provide the end of the previous page (Page {page_num-1}) as "[PREVIOUS PAGE CONTEXT]" below. Use this to ensure continuity and start cleanly.
   - We provide the beginning of the next page (Page {page_num+1}) as "[NEXT PAGE CONTEXT]" below.
   - If the last sentence or word of the current page is cut off and continues on the next page, please merge the cut-off part and translate it fully and naturally at the end of the current page (Page {page_num}) so that Page {page_num} ends with a complete, grammatically correct sentence.
4. Keep all Markdown formatting (headings like #, ##, bolding **, lists, and tables) exactly as they are.
5. Output ONLY the translated markdown text for Page {page_num}. Do not include any prefix, suffix, thoughts, or explanations.

--- [PREVIOUS PAGE CONTEXT] (Only use for continuity context, do not translate this part) ---
{prev_content}

--- Page {page_num} Content to Translate ---
{page_content}

--- [NEXT PAGE CONTEXT] (Only use for sentence boundary continuation context, do not translate this part) ---
{next_content}"""

    return call_gemini(prompt)

def polish_english_page(page_num, page_content, prev_content, next_content):
    prompt = f"""You are an expert editor polishing a historical book about the Saemaul Undong. 
The following markdown text for Page {page_num} is already in English, but it contains typos, spelling errors, grammatical mistakes, and incorrect terminology from the original scan.

[CRITICAL EDITING RULES]
1. Correct all obvious typos, spelling errors, and grammar issues.
2. Terminology Correction: If you find "New Village Movement" or "New village movement", change it to "Saemaul Undong".
3. Checkpoint page boundary:
   - We provide the end of the previous page (Page {page_num-1}) as "[PREVIOUS PAGE CONTEXT]" below. Use this to ensure continuity and start cleanly.
   - We provide the beginning of the next page (Page {page_num+1}) as "[NEXT PAGE CONTEXT]" below.
   - If the last sentence or word of the current page is cut off and continues on the next page, please merge the cut-off part and complete it naturally at the end of the current page (Page {page_num}).
4. Preserve all original Markdown formatting (headings, tables, bold text, etc.) exactly as they are.
5. Output ONLY the polished, corrected English markdown text. Do not include any notes, explanations, or meta-comments.

--- [PREVIOUS PAGE CONTEXT] (Only use for continuity context, do not edit this part) ---
{prev_content}

--- Page {page_num} English Text to Polish ---
{page_content}

--- [NEXT PAGE CONTEXT] (Only use for sentence boundary continuation context, do not edit this part) ---
{next_content}"""

    return call_gemini(prompt)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true", help="Run translation test for first 3 pages only")
    args = parser.parse_args()
    
    print("Parsing source file...")
    intro, source_pages = parse_source_file()
    print(f"Parsed {len(source_pages)} pages.")
    
    progress = load_progress()
    print(f"Loaded existing progress: {len(progress)}/{len(source_pages)} pages processed.")
    
    pages_to_translate = sorted(list(source_pages.keys()))
    if args.test:
        # Test pages: page 1 (Korean) and page 653 (English section start)
        test_pages = []
        if 1 in source_pages: test_pages.append(1)
        # Find the first page >= 653 in source_pages
        english_test_page = next((p for p in pages_to_translate if p >= 653), None)
        if english_test_page:
            test_pages.append(english_test_page)
        pages_to_translate = test_pages
        print(f"Running test mode: processing pages {pages_to_translate}")
        
    for p in pages_to_translate:
        if p in progress and not args.test:
            continue
            
        page_content = source_pages[p]
        
        # Determine if page is Korean (translation) or English (polishing)
        is_english_section = (p >= 653)
        
        print(f"Processing page {p} (Section: {'English/Polish' if is_english_section else 'Korean/Translate'})...")
        
        # Prepare context
        prev_content = ""
        if p - 1 in source_pages:
            prev_content = source_pages[p - 1][-500:]
            
        next_content = ""
        if p + 1 in source_pages:
            next_content = source_pages[p + 1][:500]
            
        start_time = time.time()
        try:
            if is_english_section:
                processed_text = polish_english_page(p, page_content, prev_content, next_content)
                # Overwrite original source page in the source dictionary with the corrected text
                if processed_text and processed_text != page_content:
                    print(f"Typos/grammar fixed in source file for page {p}.")
                    source_pages[p] = processed_text
                    # Save back the source file changes immediately
                    save_source_file(intro, source_pages)
            else:
                processed_text = translate_korean_page(p, page_content, prev_content, next_content)
                
            progress[p] = processed_text
            save_progress(progress)
            compile_markdown_file(intro, progress)
            print(f"Page {p} completed successfully in {time.time() - start_time:.2f} seconds.")
        except Exception as e:
            print(f"Failed to process page {p}. Stopping. Error: {e}")
            break
            
        elapsed = time.time() - start_time
        if elapsed < 4.0:
            time.sleep(4.0 - elapsed)

    print("Translation/Polishing run finished.")

if __name__ == "__main__":
    main()
