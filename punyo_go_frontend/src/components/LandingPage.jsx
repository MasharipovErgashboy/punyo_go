import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  const botLink = "https://t.me/punyogo_bot";

  const handleOpenApp = () => {
    window.location.href = botLink;
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-bg-glow"></div>
          <div className="hero-content">
            <h1 className="slide-up">Dostlikdagi hamma narsa —<br />bir joyda.</h1>
            <p className="subtitle slide-up delay-1">
              Punyo GO — Dostlik tumanidagi restoranlar, fast foodlar, do‘konlar va xizmatlarni birlashtiradigan zamonaviy raqamli platforma.
            </p>
            
            <div className="hero-features fade-in delay-2">
              <div className="feature-pill">🍔 Ovqat buyurtma qiling</div>
              <div className="feature-pill">🛵 Tez yetkazib bering</div>
              <div className="feature-pill">🏪 Mahalliy biznesni kashf qiling</div>
              <div className="feature-pill">📱 Telegram orqali boshqaring</div>
            </div>

            <div className="hero-actions slide-up delay-3">
              <button onClick={handleOpenApp} className="btn-primary">🟡 Punyo GO'ni ochish</button>
              <button onClick={handleOpenApp} className="btn-secondary">⚪ Biznesni qo‘shish</button>
            </div>
            
            <p style={{marginTop: '3rem', color: 'var(--text-muted)'}}>
              Dostlikdan boshlanadi. Katta maqsadlar sari.
            </p>
          </div>
        </section>

        {/* WHAT IS PUNYO GO */}
        <section>
          <div className="grid-2">
            <div>
              <h2><span className="highlight-text">Punyo GO</span> nima?</h2>
              <p className="subtitle">Sizga kerak bo‘lgan narsalar — bir joyda.</p>
              <p style={{marginBottom: '1.5rem', fontSize: '1.1rem'}}>
                Endi har bir restoran uchun alohida Telegram kanal, telefon raqami yoki Instagram sahifasini qidirish shart emas.
              </p>
              <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '1.1rem'}}>
                <li>🍔 Restoran va fast foodlarni topasiz</li>
                <li>🔎 Taomlarni qidirasiz</li>
                <li>🛒 Savatga qo‘shasiz</li>
                <li>📍 Manzilingizni tanlaysiz</li>
                <li>💳 To‘lov qilasiz</li>
                <li>🛵 Zakazingizni kuzatasiz</li>
              </ul>
              <div className="feature-pill" style={{display: 'inline-flex', marginTop: '2rem'}}>
                Bitta platforma. Bitta akkaunt. Bitta qulay tajriba.
              </div>
            </div>
            <div className="telegram-mockup">
               <div className="tg-message">
                 <b>Punyo GO Bot</b><br/>
                 Salom! Punyo GO orqali Dostlikdagi eng zo'r joylardan buyurtma bering.
                 <div className="tg-button" style={{background: 'var(--primary-color)', color: '#000'}}>🟡 Ilovani ochish</div>
               </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section>
          <h2 style={{textAlign: 'center'}}>Qanday ishlaydi?</h2>
          <p className="subtitle" style={{textAlign: 'center'}}>3 ta oddiy qadam.</p>
          
          <div className="grid-3" style={{marginTop: '3rem'}}>
            <div className="card step-card">
              <span className="step-number">01</span>
              <div className="card-icon">🔎</div>
              <h3>Tanlang</h3>
              <p>O‘zingizga yoqqan restoran yoki taomni toping. Burger, pizza, lavash va boshqalar.</p>
            </div>
            <div className="card step-card">
              <span className="step-number">02</span>
              <div className="card-icon">🛒</div>
              <h3>Buyurtma bering</h3>
              <p>Mahsulotlarni savatga qo‘shing, manzilingizni tanlang va zakazni tasdiqlang.</p>
            </div>
            <div className="card step-card">
              <span className="step-number">03</span>
              <div className="card-icon">🛵</div>
              <h3>Kutib oling</h3>
              <p>Restoran zakazni tayyorlaydi, kuryer olib ketadi va siz uni real vaqtda kuzatasiz.</p>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section>
          <h2 style={{textAlign: 'center'}}>Nimani xohlaysiz?</h2>
          <p className="subtitle" style={{textAlign: 'center'}}>Punyo GO'da turli xil mahsulot va xizmatlarni bitta joydan toping.</p>
          
          <div className="grid-4" style={{marginTop: '3rem'}}>
            <div className="category-pill">🍔 Burgerlar</div>
            <div className="category-pill">🍕 Pizza</div>
            <div className="category-pill">🌯 Lavash</div>
            <div className="category-pill">🍗 Chicken</div>
            <div className="category-pill">🍣 Sushi</div>
            <div className="category-pill">🥤 Ichimliklar</div>
            <div className="category-pill">🍰 Shirinliklar</div>
            <div className="category-pill">🌸 Gullar</div>
            <div className="category-pill">🍎 Mevalar</div>
            <div className="category-pill">🛒 Mahsulotlar</div>
          </div>
          <p style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)'}}>Va bu hali boshlanishi.</p>
        </section>

        {/* FOR BUSINESSES */}
        <section>
          <div className="grid-2">
            <div style={{order: 2}}>
              <h2>Biznesingizni <span className="highlight-text">Punyo GO</span>'ga olib chiqing</h2>
              <p className="subtitle">Restoraningiz, fast foodingiz yoki do‘koningizni minglab mijozlarga taqdim eting.</p>
              
              <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '1.1rem', marginBottom: '2rem'}}>
                <li>📋 Menyuni o‘zingiz boshqaring</li>
                <li>📦 Zakazlarni Telegram orqali qabul qiling</li>
                <li>💰 Narxlarni istalgan vaqtda o‘zgartiring</li>
                <li>🎁 Aksiyalar yarating</li>
                <li>📊 Savdolaringizni kuzating</li>
              </ul>
              
              <button onClick={handleOpenApp} className="btn-primary">Biznesni qo‘shish →</button>
            </div>
            <div className="card" style={{order: 1, background: 'linear-gradient(145deg, #1e293b, #0f172a)'}}>
               <h3 style={{color: 'var(--primary-color)'}}>Biznes Admin Panel</h3>
               <p style={{marginBottom: '1rem'}}>Har bir hamkor uchun alohida boshqaruv paneli.</p>
               <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                 <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px'}}>📦 Buyurtmalar</div>
                 <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px'}}>🍔 Menyu</div>
                 <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px'}}>📊 Analitika</div>
               </div>
            </div>
          </div>
        </section>

        {/* TELEGRAM INTEGRATION */}
        <section>
          <div className="grid-2">
            <div>
              <h2>Telegram integratsiyasi</h2>
              <p className="subtitle">Punyo GO — Telegram ichida.</p>
              <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>
                Alohida ilova yuklash, yangi akkaunt yaratish yoki murakkab ro‘yxatdan o‘tish shart emas. Telegramni oching va buyurtma bering.
              </p>
              <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>
                Bizneslar uchun esa har bir yangi zakaz avtomatik ravishda o‘zining yopiq Telegram guruhiga tushadi.
              </p>
            </div>
            <div className="telegram-mockup">
               <div className="tg-message">
                 <b>🔔 YANGI ZAKAZ #1042</b><br/><br/>
                 🍔 Classic Burger ×2<br/>
                 🍟 Fri ×1<br/>
                 🥤 Cola ×2<br/><br/>
                 💰 Jami: 105 000 so‘m<br/>
                 📍 Dostlik, 5-mavze
                 
                 <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                   <div className="tg-button" style={{flex: 1, background: '#22c55e'}}>🟢 Qabul qilish</div>
                   <div className="tg-button" style={{flex: 1, background: '#ef4444'}}>🔴 Rad etish</div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* SMART FEATURES */}
        <section>
          <div className="grid-3">
            <div className="card">
              <div className="card-icon">🤖</div>
              <h3>Aqlli tavsiyalar</h3>
              <p>Punyo GO sizni taniydi. Ko'p buyurtma qilgan taomlaringiz asosida sizga mos takliflar beradi.</p>
            </div>
            <div className="card">
              <div className="card-icon">🔔</div>
              <h3>Aqlli xabarlar</h3>
              <p>Zakaz qabul qilinganda, kuryer yo'lga chiqqanda yoki aksiya bo'lganda Telegram orqali xabar olasiz.</p>
            </div>
            <div className="card">
              <div className="card-icon">🔐</div>
              <h3>Xavfsizlik</h3>
              <p>Sizning ma'lumotlaringiz, to'lovlar va buyurtmalar tarixi to'liq himoyalangan.</p>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section>
          <div className="cta-banner">
            <h2>Dostlikni Punyo GO bilan kashf qiling</h2>
            <p className="subtitle" style={{color: '#333'}}>Sevimli taomingizni toping. Mahalliy bizneslarni kashf qiling. Hammasini bitta joydan boshqaring.</p>
            <button onClick={handleOpenApp} className="btn-primary" style={{marginTop: '1rem', fontSize: '1.2rem', padding: '1.2rem 3rem'}}>
              🟡 Punyo GO'ni ochish
            </button>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">PUNYO GO</div>
              <p style={{color: 'var(--text-muted)'}}>Dostlik. Hamma narsa — bir joyda.</p>
            </div>
            <div className="footer-links">
              <h4>Foydalanuvchilar</h4>
              <ul>
                <li><a href="#">Bosh sahifa</a></li>
                <li><a href="#">Restoranlar</a></li>
                <li><a href="#">Aksiyalar</a></li>
                <li><a href="#">Yordam</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Bizneslar</h4>
              <ul>
                <li><a href="#">Biznesni qo‘shish</a></li>
                <li><a href="#">Business Panel</a></li>
                <li><a href="#">Hamkorlik</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Ma'lumot</h4>
              <ul>
                <li><a href="#">Biz haqimizda</a></li>
                <li><a href="#">Foydalanish shartlari</a></li>
                <li><a href="#">Maxfiylik siyosati</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Punyo GO. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
