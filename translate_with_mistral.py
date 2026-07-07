import os
import re
import sys
import json
import urllib.request

# Force UTF-8 stdout encoding to avoid Windows console errors
sys.stdout.reconfigure(encoding='utf-8')

def translate_text_via_mistral(text, target_lang, api_key):
    """
    Translates Korean text into the target language using Mistral AI API.
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
    
    # Prompt instructing Mistral to translate accurately and preserve markdown elements
    prompt = (
        f"You are an expert translator. Translate the given Korean text into {target_lang_name} "
        f"naturally. Keep all markdown structure intact (e.g., #, -, **, ---). "
        f"Provide ONLY the final translated translation. Do not include any introductory remarks, "
        f"explanations, thoughts, or markdown code block quotes (like ```)."
    )
    
    data = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text}
        ],
        "temperature": 0.1
    }
    
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
            translated = res_json['choices'][0]['message']['content'].strip()
            return translated
    except Exception as e:
        print(f"  [API ERROR] Failed to translate via Mistral: {e}")
        return None

def process_file_translation(filename, target_lang, api_key, docs_dir):
    filepath = os.path.join(docs_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        return
        
    print(f"\n>>> Processing {filename} ({target_lang}) with Mistral AI...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        updated_lines = []
        translated_count = 0
        
        for i, line in enumerate(lines, 1):
            line_str = line.strip()
            if not line_str:
                updated_lines.append(line)
                continue
                
            # Exclude footnotes/brackets and check if there's substantial Korean text
            cleaned_line = re.sub(r'\([^\)]*\)', '', line_str)
            cleaned_line = re.sub(r'--- \(p\.\s*\d+\)\s*---', '', cleaned_line).strip()
            korean_chars = re.findall(r'[가-힣]', cleaned_line)
            
            # Translate if line contains more than 10 Korean chars and they form >40% of the line
            if len(korean_chars) > 10 and (len(korean_chars) / len(line_str)) > 0.4:
                print(f"  Line {i}: Translating Korean -> '{line_str[:50]}...'")
                
                translated = translate_text_via_mistral(line_str, target_lang, api_key)
                if translated:
                    has_newline = line.endswith('\n')
                    new_line = translated + ('\n' if has_newline else '')
                    updated_lines.append(new_line)
                    translated_count += 1
                    print(f"    -> Result: '{translated[:50]}...'")
                else:
                    updated_lines.append(line)
            else:
                updated_lines.append(line)
                
        if translated_count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(updated_lines)
            print(f"  [SUCCESS] {translated_count} lines translated & updated in {filename}!")
        else:
            print(f"  [CLEAN] No lines needed translation in {filename}.")
            
    except Exception as e:
        print(f"  [ERROR] Processing {filename} failed: {e}")

def main():
    api_key = os.environ.get("MISTRAL_API_KEY", "")
    
    if not api_key:
        print("MISTRAL_API_KEY environment variable not detected.")
        api_key = input("Please enter your Mistral API Key: ").strip()
        
    if not api_key:
        print("Error: A valid Mistral API Key is required.")
        sys.exit(1)
        
    docs_dir = "H:/개인/공모전 프로젝트/0.새마을/public/docs"
    
    # Files with detected untranslated Korean text blocks
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
        process_file_translation(target["file"], target["lang"], api_key, docs_dir)

if __name__ == "__main__":
    main()
