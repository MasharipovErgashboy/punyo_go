"""Orders handler"""

from aiogram import Router, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext

from keyboards.menus import get_main_menu_uz, get_main_menu_ru
from keyboards.texts import get_text
from services.api import APIService
from config import BACKEND_API_URL, WEB_APP_SHOP_URL, WEB_APP_CHAT_URL, WEB_APP_ORDERS_URL

router = Router()
api = APIService(BACKEND_API_URL)


@router.message(F.text.in_(["⏳ Faol buyurtmalar", "⏳ Активные заказы"]))
async def show_active_orders(message: Message, state: FSMContext):
    """Show active orders"""
    data = await state.get_data()
    language = data.get('language', 'uz')
    user_id = message.from_user.id
    
    # Get active orders from backend
    result = await api.get_active_orders(user_id)
    
    if "error" in result:
        await message.answer(get_text(language, 'error'))
        return
    
    orders = result.get('orders', [])
    
    if not orders:
        await message.answer(get_text(language, 'no_active_orders'))
    else:
        # Format orders list
        text = "⏳ Faol buyurtmalar:\n\n" if language == 'uz' else "⏳ Активные заказы:\n\n"
        
        for order in orders:
            order_id = order.get('id')
            status = order.get('status')
            total = order.get('total')
            text += f"📦 Buyurtma #{order_id}\n"
            text += f"Status: {status}\n"
            text += f"Summa: {total} so'm\n\n"
        
        await message.answer(text)


@router.message(F.text.in_(["📋 Barcha buyurtmalar", "📋 Все заказы"]))
async def show_all_orders(message: Message, state: FSMContext):
    """Show all orders"""
    data = await state.get_data()
    language = data.get('language', 'uz')
    user_id = message.from_user.id
    
    # Get all orders from backend
    result = await api.get_all_orders(user_id)
    
    if "error" in result:
        await message.answer(get_text(language, 'error'))
        return
    
    orders = result.get('orders', [])
    
    if not orders:
        await message.answer(get_text(language, 'no_orders'))
    else:
        # Format orders list
        text = "📋 Barcha buyurtmalar:\n\n" if language == 'uz' else "📋 Все заказы:\n\n"
        
        for order in orders:
            order_id = order.get('id')
            status = order.get('status')
            total = order.get('total')
            text += f"📦 Buyurtma #{order_id}\n"
            text += f"Status: {status}\n"
            text += f"Summa: {total} so'm\n\n"
        
        await message.answer(text)


@router.message(F.text.in_(["🔙 Orqaga", "🔙 Назад"]))
async def back_to_main_menu(message: Message, state: FSMContext):
    """Return to main menu"""
    data = await state.get_data()
    language = data.get('language', 'uz')
    
    user_id = message.from_user.id
    sep = '&' if '?' in WEB_APP_SHOP_URL else '?'
    
    shop_url = f"{WEB_APP_SHOP_URL}{sep}tid={user_id}"
    chat_url = f"{WEB_APP_CHAT_URL}{'&' if '?' in WEB_APP_CHAT_URL else '?'}tid={user_id}"
    orders_url = f"{WEB_APP_ORDERS_URL}{'&' if '?' in WEB_APP_ORDERS_URL else '?'}tid={user_id}"

    if language == 'uz':
        keyboard = get_main_menu_uz(shop_url, chat_url, orders_url)
    else:
        keyboard = get_main_menu_ru(shop_url, chat_url, orders_url)
    
    await message.answer(get_text(language, 'back_to_menu'), reply_markup=keyboard)


from aiogram.types import CallbackQuery

@router.callback_query(F.data.startswith('accept_order_'))
async def handle_accept_order(callback: CallbackQuery):
    """Handle order acceptance from Telegram"""
    order_id = callback.data.split('_')[2]
    
    # Update status in backend
    result = await api.update_order_status(order_id, 'active')
    if "error" in result:
        await callback.answer("Xatolik yuz berdi!", show_alert=True)
        return
        
    # Edit the message to show it was accepted and remove buttons
    new_text = callback.message.html_text + "\n\n✅ <b>Buyurtma tasdiqlandi!</b>"
    
    # Optional: Keep the mini app button but remove accept/reject
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    from config import WEB_APP_SHOP_URL
    import re
    
    # Keep only the Mini App button if possible
    # We can reconstruct a simple keyboard
    shop_url = WEB_APP_SHOP_URL if WEB_APP_SHOP_URL else "https://punyogo.uz"
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Mini App", url=shop_url)]
    ])
    
    try:
        await callback.message.edit_text(new_text, reply_markup=keyboard, parse_mode='HTML')
    except Exception as e:
        print(f"Error editing message: {e}")
        
    await callback.answer("Buyurtma tasdiqlandi!")


@router.callback_query(F.data.startswith('reject_order_'))
async def handle_reject_order(callback: CallbackQuery):
    """Handle order rejection from Telegram"""
    order_id = callback.data.split('_')[2]
    
    # Update status in backend
    result = await api.update_order_status(order_id, 'canceled')
    if "error" in result:
        await callback.answer("Xatolik yuz berdi!", show_alert=True)
        return
        
    # Delete the message entirely as requested by the user
    try:
        await callback.message.delete()
    except Exception as e:
        print(f"Error deleting message: {e}")
        
    await callback.answer("Buyurtma rad etildi va xabar o'chirildi!")
