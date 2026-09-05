"""Start command handler"""

from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from keyboards.menus import get_main_menu_uz, get_main_menu_ru, get_district_menu
from keyboards.inline import get_districts_keyboard, DISTRICTS
from keyboards.texts import get_text
from services.api import APIService
from config import BACKEND_API_URL, WEB_APP_SHOP_URL, WEB_APP_CHAT_URL, WEB_APP_ORDERS_URL

router = Router()
api = APIService(BACKEND_API_URL)


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    """Handle /start command"""
    user = message.from_user
    
    # Register/login user via telegram
    await api.telegram_login(
        telegram_user_id=user.id,
        username=user.username or "",
        first_name=user.first_name or "",
        last_name=user.last_name or ""
    )
    
    # Try to fetch user info from backend
    try:
        user_info = await api.get_user(user.id)
        language = user_info.get('language', 'uz') if isinstance(user_info, dict) else 'uz'
        district = user_info.get('district') if isinstance(user_info, dict) else None
    except Exception as e:
        print(f"Error fetching user info: {e}")
        language = 'uz'
        district = None

    # Save user data in state
    await state.update_data(language=language)
    
    # Send welcome message
    welcome_text = get_text(language, 'welcome', name=user.first_name or user.username)
    
    if not district:
        keyboard = get_district_menu()
        await message.answer(f"{welcome_text}\n\nIltimos, tumaningizni tanlang:", reply_markup=keyboard)
        return

    choose_action = get_text(language, 'choose_action')
    
    # Show main menu with appended user ID for robust identification
    sep = '&' if '?' in WEB_APP_SHOP_URL else '?'
    shop_url = f"{WEB_APP_SHOP_URL}{sep}tid={user.id}"
    chat_url = f"{WEB_APP_CHAT_URL}{sep}tid={user.id}"
    orders_url = f"{WEB_APP_ORDERS_URL}{sep}tid={user.id}"

    if language == 'ru':
        keyboard = get_main_menu_ru(shop_url, chat_url, orders_url)
    else:
        keyboard = get_main_menu_uz(shop_url, chat_url, orders_url)
    
    await message.answer(f"{welcome_text}\n\n{choose_action}", reply_markup=keyboard)

@router.message(F.text == "📍 Tumaningizni tanlang")
async def process_district_menu_btn(message: Message):
    """Show inline keyboard of districts"""
    keyboard = get_districts_keyboard()
    await message.answer("Jizzax viloyatidagi barcha tumanlar ro'yxati:", reply_markup=keyboard)


@router.callback_query(F.data.startswith("district_"))
async def process_district_selection(callback: CallbackQuery, state: FSMContext):
    """Handle district selection"""
    district_id = callback.data.split("_")[1]
    
    # Save district to backend
    await api.update_district(callback.from_user.id, district_id)
    
    # Get district name
    district_name = next((name for d_id, name in DISTRICTS if d_id == district_id), district_id)
    
    await callback.answer(f"{district_name} tanlandi!", show_alert=False)
    await callback.message.delete()
    
    # Try to fetch language from state
    data = await state.get_data()
    language = data.get('language', 'uz')
    
    choose_action = get_text(language, 'choose_action')
    
    # Show main menu
    user = callback.from_user
    sep = '&' if '?' in WEB_APP_SHOP_URL else '?'
    shop_url = f"{WEB_APP_SHOP_URL}{sep}tid={user.id}"
    chat_url = f"{WEB_APP_CHAT_URL}{sep}tid={user.id}"
    orders_url = f"{WEB_APP_ORDERS_URL}{sep}tid={user.id}"

    if language == 'ru':
        keyboard = get_main_menu_ru(shop_url, chat_url, orders_url)
    else:
        keyboard = get_main_menu_uz(shop_url, chat_url, orders_url)
    
    await callback.message.answer(f"Ajoyib! {choose_action}", reply_markup=keyboard)
