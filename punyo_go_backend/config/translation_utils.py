from deep_translator import MyMemoryTranslator

def translate_uz_to_ru(text):
    """
    Translates text from Uzbek to Russian using MyMemory Translator.
    """
    if not text:
        return ""
    try:
        # Uzbek to Russian
        translated = MyMemoryTranslator(source='uz-UZ', target='ru-RU').translate(text)
        return translated
    except Exception as e:
        print(f"Translation error: {e}")
        return text # Fallback to original text if translation fails
