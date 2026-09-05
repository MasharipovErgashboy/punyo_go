from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder

DISTRICTS = [
    ("Arnasoy", "Arnasoy tumani"),
    ("Baxmal", "Baxmal tumani"),
    ("Do'stlik", "Do'stlik tumani"),
    ("Forish", "Forish tumani"),
    ("G'allaorol", "G'allaorol tumani"),
    ("Jizzax shahri", "Jizzax shahri"),
    ("Mirzacho'l", "Mirzacho'l tumani"),
    ("Paxtakor", "Paxtakor tumani"),
    ("Sharof Rashidov", "Sharof Rashidov tumani"),
    ("Yangiobod", "Yangiobod tumani"),
    ("Zafarobod", "Zafarobod tumani"),
    ("Zarbdor", "Zarbdor tumani"),
    ("Zomin", "Zomin tumani"),
]

def get_districts_keyboard() -> InlineKeyboardMarkup:
    """Inline keyboard for Jizzakh districts"""
    builder = InlineKeyboardBuilder()
    for district_id, district_name in DISTRICTS:
        builder.button(
            text=district_name,
            callback_data=f"district_{district_id}"
        )
    # Arrange buttons 2 per row
    builder.adjust(2)
    return builder.as_markup()
