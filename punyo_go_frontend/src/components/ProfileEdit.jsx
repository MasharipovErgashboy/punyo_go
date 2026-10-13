import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './ProfileEdit.css';

// Jizzax viloyati tumanlari (backend DISTRICT_CHOICES bilan mos)
const DISTRICTS = [
    'Arnasoy', 'Baxmal', "Do'stlik", 'Forish', "G'allaorol",
    'Jizzax shahri', "Mirzacho'l", 'Paxtakor', 'Sharof Rashidov',
    'Yangiobod', 'Zafarobod', 'Zarbdor', 'Zomin',
];

export default function ProfileEdit({ user, onBack, onSave, language }) {
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [userName, setUserName] = useState(user?.first_name || '');
    const [district, setDistrict] = useState(user?.district || '');
    const [lang, setLang] = useState(user?.language || language || 'uz');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setPhoneNumber(user.phone_number || '');
            setUserName(user.first_name || '');
            setDistrict(user.district || '');
            setLang(user.language || language || 'uz');
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userId = user.telegram_user_id || user.id;
            const result = await api.updateUser(userId, {
                phone_number: phoneNumber,
                first_name: userName,
                district: district,
                language: lang
            });
            if (result) {
                // Til o'zgargan bo'lsa butun saytni yangilaymiz
                if (lang !== (user?.language || language)) {
                    window.dispatchEvent(new CustomEvent('langChange', { detail: lang }));
                }
                onSave(result);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-edit-view animate-fade-in">
            <div className="profile-header">
                <button className="profile-back-btn" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <h2>{language === 'ru' ? 'Мой профиль' : 'Mening profilim'}</h2>
            </div>

            <div className="profile-avatar-section">
                <div className="profile-avatar">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-avatar-info">
                    <h3>{userName || (language === 'ru' ? 'Пользователь' : 'Foydalanuvchi')}</h3>
                    <p>{phoneNumber || '+998 -- --- -- --'}</p>
                </div>
            </div>

            <div className="profile-form-container">
                <div className="profile-card">
                    <div className="profile-input-wrapper">
                        <label>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            {language === 'ru' ? 'Имя' : 'Ismingiz'}
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder={language === 'ru' ? 'Введите ваше имя' : 'Ismingizni kiriting'}
                        />
                    </div>
                    <div className="profile-divider"></div>
                    <div className="profile-input-wrapper">
                        <label>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            {language === 'ru' ? 'Номер телефона' : 'Telefon raqami'}
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+998 -- --- -- --"
                        />
                    </div>
                    <div className="profile-divider"></div>
                    <div className="profile-input-wrapper">
                        <label>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {language === 'ru' ? 'Район (Джизак)' : 'Tuman (Jizzax)'}
                        </label>
                        <select
                            className="profile-select"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        >
                            <option value="">{language === 'ru' ? 'Выберите район' : 'Tumanni tanlang'}</option>
                            {DISTRICTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-input-wrapper">
                        <label>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            {language === 'ru' ? 'Язык' : 'Til'}
                        </label>
                        <div className="profile-lang-toggle">
                            <button
                                type="button"
                                className={`profile-lang-btn ${lang === 'uz' ? 'active' : ''}`}
                                onClick={() => setLang('uz')}
                            >🇺🇿 O'zbek</button>
                            <button
                                type="button"
                                className={`profile-lang-btn ${lang === 'ru' ? 'active' : ''}`}
                                onClick={() => setLang('ru')}
                            >🇷🇺 Русский</button>
                        </div>
                    </div>
                </div>

                <button
                    className={`profile-save-btn ${loading ? 'loading' : ''}`}
                    onClick={handleSave}
                    disabled={loading || !userName.trim() || !phoneNumber}
                >
                    {loading ? (
                        <div className="spinner"></div>
                    ) : (
                        language === 'ru' ? 'Сохранить изменения' : 'O\'zgarishlarni saqlash'
                    )}
                </button>
            </div>

            <div className="profile-danger-zone">
                <button
                    className="profile-logout-btn"
                    onClick={async () => {
                        if (window.confirm(language === 'ru' ? 'Вы уверены, что хотите выйти?' : 'Tizimdan chiqmoqchimisiz?')) {
                            setLoading(true);
                            try {
                                const userId = user.telegram_user_id || user.id;
                                await api.deleteAccount(userId);
                                localStorage.removeItem('punyo_user');
                                onSave(null);
                            } catch (e) {
                                console.error('Logout error:', e);
                            } finally {
                                setLoading(false);
                            }
                        }
                    }}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    {language === 'ru' ? 'Выйти из аккаунта' : 'Akkauntdan chiqish'}
                </button>
            </div>
        </div>
    );
}
