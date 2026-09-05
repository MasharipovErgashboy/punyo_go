"""Keyboard layouts for Uzbek and Russian languages"""

from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo

# Uzbek keyboards
def get_main_menu_uz(shop_url: str, chat_url: str, orders_url: str):
    """Main menu keyboard in Uzbek with 1 button"""
    keyboard = [
        [
            KeyboardButton(text="🌐 Ilovani oching", web_app=WebAppInfo(url=shop_url))
        ]
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)

def get_district_menu():
    """Initial menu before district is selected"""
    keyboard = [
        [KeyboardButton(text="📍 Tumaningizni tanlang")]
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_language_selection_uz():
    """Language selection keyboard"""
    keyboard = [
        [KeyboardButton(text="🇺🇿 O'zbekcha")],
        [KeyboardButton(text="🇷🇺 Русский")],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_orders_menu_uz():
    """Orders menu in Uzbek"""
    keyboard = [
        [KeyboardButton(text="⏳ Faol buyurtmalar")],
        [KeyboardButton(text="📋 Barcha buyurtmalar")],
        [KeyboardButton(text="🔙 Orqaga")],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_phone_request_uz():
    """Phone number request keyboard in Uzbek"""
    keyboard = [
        [KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)],
        [KeyboardButton(text="🔙 Orqaga")],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


# Russian keyboards
def get_main_menu_ru(shop_url: str, chat_url: str, orders_url: str):
    """Main menu keyboard in Russian with 1 button"""
    keyboard = [
        [
            KeyboardButton(text="🌐 Открыть приложение", web_app=WebAppInfo(url=shop_url))
        ]
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_language_selection_ru():
    """Language selection keyboard"""
    keyboard = [
        [KeyboardButton(text="🇺🇿 O'zbekcha")],
        [KeyboardButton(text="🇷🇺 Русский")],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_orders_menu_ru():
    """Orders menu in Russian"""
    keyboard = [
        [KeyboardButton(text="⏳ Активные заказы")],
        [KeyboardButton(text="📋 Все заказы")],
        [KeyboardButton(text="🔙 Назад")],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_phone_request_ru():
    """Phone number request keyboard in Russian"""
    keyboard = [
        [KeyboardButton(text="📱 Отправить номер телефона", request_contact=True)],
        [KeyboardButton(text="🔙 Назад")],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)
