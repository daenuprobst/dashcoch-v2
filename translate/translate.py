import time
import json
from pathlib import Path
import click
from googletrans import Translator
from google_trans_new import google_translator

T = Translator()
T_ALT = google_translator()

def alt_translate(str, source_language, target_language):
    # quick and hacky
    return T_ALT.translate(str, lang_src=source_language, lang_tgt=target_language).strip()

def google_translate(str, source_language, target_language, max_tries=1):
    try_n = 0

    while try_n < max_tries:
        try:
            try_n += 1
            return T.translate(str, src=source_language, dest=target_language).text
        except:
            time.sleep(2)
    
    return alt_translate(str, source_language, target_language)


def translate_json(j, source_language, target_language):
    for key, value in j.items():
        if isinstance(value, dict):
            translate_json(value, source_language, target_language)
        else:
            print(f"Translating {key}.")
            j[key] = google_translate(value, source_language, target_language)

def translate_existing_json(j, j_existing, source_language, target_language):
    for key, value in j.items():
        if isinstance(value, dict):
            value_existing = None
            if not j_existing:
                j_existing = {}
            if key in j_existing and isinstance(j_existing[key], dict):
                value_existing = j_existing[key]
            translate_existing_json(value, value_existing, source_language, target_language)
        else:
            if j_existing and key in j_existing:
                j[key] = j_existing[key]
            else:
                print(f"Translating {key}.")
                j[key] = google_translate(value, source_language, target_language)

@click.command()
@click.argument("input")
@click.argument("output")
@click.option("-s", "--source-language", "src", default="en", show_default=True)
@click.option("-t", "--target-language", "dest")
def main(input, output, src, dest):
    input_json = json.load(open(input, "r", encoding="utf-8"))
    out_path = Path(output)

    if not out_path.is_file():
        with open(output, "w+", encoding="utf-8") as f:
            translate_json(input_json, src, dest)
            json.dump(input_json, f, ensure_ascii=False)
    else:
        with open(output, "r+", encoding="utf-8") as f:
            output_json = json.load(f)            
            translate_existing_json(input_json, output_json, src, dest)
            f.truncate(0)
            f.seek(0)
            json.dump(input_json, f, ensure_ascii=False)


if __name__ == "__main__":
    main()