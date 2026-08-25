import translators as ts

def translate_uz_to_ru(text):
    """
    Translates text from Uzbek to Russian using Bing Translator.
    """
    if not text:
        return ""
    try:
        # Uzbek to Russian
        translated = ts.translate_text(text, translator='bing', from_language='uz', to_language='ru')
        return translated
    except Exception as e:
        print(f"Translation error: {e}")
        return text # Fallback to original text if translation fails
