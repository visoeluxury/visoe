import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
  const orderId = c.req.query('order_id') || 'Unknown';
  const db = c.env.DB;

  try {
    // 1. AMBIL HEADER & FOOTER MURNI DARI HOMEPAGE (KONSISTEN)
    let headerData: any = {};
    let footerData: any = {};
    const headerRow: any = await db.prepare(
      "SELECT content_json FROM frontpage_widgets WHERE widget_type = 'header_widget' AND page_id = 'home' AND is_active = 1"
    ).first();
    const footerRow: any = await db.prepare(
      "SELECT content_json FROM frontpage_widgets WHERE widget_type = 'footer_widget' AND page_id = 'home' AND is_active = 1"
    ).first();
    
    if(headerRow) try { headerData = JSON.parse(headerRow.content_json || '{}'); } catch(e) {}
    if(footerRow) try { footerData = JSON.parse(footerRow.content_json || '{}'); } catch(e) {}

    return c.html(
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Order Success | Visoe Luxury</title>
          
          <script src="https://cdn.tailwindcss.com"></script>
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
            body { font-family: 'Inter', sans-serif; background: white; color: #1a1a1a; margin: 0; overflow-x: hidden; }
            .font-serif { font-family: 'Bodoni Moda', serif; }
            .mega-menu-transition { transition: all 0.3s ease-in-out; }
            .nav-link { position: relative; padding-bottom: 4px; }
            .nav-link::after { content: ''; position: absolute; width: 0; height: 1.5px; bottom: 0; left: 0; background-color: black; transition: width 0.3s ease; }
            .nav-link:hover::after { width: 100%; }
            .drawer-transform { transform: translateX(100%); transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
            .drawer-open { transform: translateX(0) !important; }
            .overlay-fade { opacity: 0; visibility: hidden; transition: all 0.5s ease; }
            .overlay-visible { opacity: 1 !important; visibility: visible !important; }
          `}} />
        </head>
        <body>
          <div class="pb-24 flex flex-col min-h-screen">
            
            {/* FAVICON */}
            {headerData.favicon && <link rel="icon" href={headerData.favicon} />}

            {/* ================= HEADER KONSISTEN ================= */}
            <header class="w-full bg-white z-[100] relative border-b border-neutral-100">
              <div class="w-full border-b border-neutral-50 py-2 hidden md:block">
                <div class="max-w-[1400px] mx-auto px-6 flex justify-end">
                  <span class="text-[9px] tracking-[0.3em] text-neutral-400 uppercase">
                    {headerData.top_bar_text || "Authentic Luxury Goods Only"}
                  </span>
                </div>
              </div>

              <div class="max-w-[1400px] mx-auto px-6 py-6 hidden md:grid grid-cols-3 items-center">
                <div class="flex items-center gap-2 cursor-pointer group w-fit">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
                  <span class="text-[10px] font-bold uppercase tracking-[0.2em] group-hover:opacity-50 transition-opacity">Search</span>
                </div>

                <div class="flex justify-center">
                  <a href="/">
                    <img src={headerData.logo_desktop || headerData.logo} style={{ width: headerData.logo_width_desktop || '200px' }} class="object-contain" alt="Visoe Luxury" />
                  </a>
                </div>

                <div class="flex justify-end items-center gap-8">
                  <a href="/login" class="flex items-center gap-2 group">
                     <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                     <span class="text-[10px] font-bold uppercase tracking-[0.2em]">Sign In</span>
                  </a>
                  <button id="cart-trigger-desktop" class="flex items-center gap-2 relative group">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.2"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
                    <span class="absolute -top-1 -right-2 bg-black text-white text-[7px] w-4 h-4 flex items-center justify-center rounded-full font-bold">0</span>
                  </button>
                </div>
              </div>

              {/* NAV BAR (DESKTOP) - MEGA MENU AKTIF */}
              <div class="w-full border-t border-neutral-50 hidden md:block">
                <div class="max-w-[1400px] mx-auto px-6 flex justify-center items-center h-12 gap-12 relative">
                  {headerData.menu?.map((cat: any) => (
                    <div class="group h-full flex items-center">
                      <a href={cat.url} class="text-[10px] font-bold uppercase tracking-[0.2em] nav-link transition-colors hover:text-neutral-400 flex items-center gap-1 h-full">
                        {cat.title}
                        {cat.columns?.length > 0 && (
                          <svg class="w-3 h-3 opacity-40 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        )}
                      </a>
                      
                      {/* PANEL MEGA MENU DROP DOWN */}
                      {cat.columns?.length > 0 && (
                        <div class="absolute left-0 top-full w-full bg-white border-b border-neutral-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible mega-menu-transition translate-y-2 group-hover:translate-y-0 z-[200]">
                          <div class="max-w-[1400px] mx-auto grid grid-cols-4 gap-12 p-12 text-left">
                            {cat.columns.map((col: any) => (
                              <div class="space-y-6">
                                <h4 class="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 border-b border-neutral-50 pb-2">{col.heading}</h4>
                                <ul class="space-y-4">
                                  {col.links.map((lnk: any) => (
                                    <li><a href={lnk.url} class="text-[11px] uppercase tracking-widest hover:pl-2 transition-all block text-neutral-600 hover:text-black">{lnk.name}</a></li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            <div class="bg-neutral-50 p-8 flex flex-col justify-center text-center space-y-4 border border-neutral-100">
                              <span class="text-[8px] font-bold uppercase tracking-[0.3em] opacity-40">Featured</span>
                              <h5 class="font-serif italic text-xl uppercase tracking-widest text-black">New Arrivals</h5>
                              <a href="/products" class="text-[9px] font-bold border-b border-black inline-block mx-auto pb-1 tracking-[0.2em]">DISCOVER</a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div class="md:hidden bg-white sticky top-0 z-[110] px-4 py-4 flex justify-between items-center relative">
                <button id="mobile-menu-open" class="p-1">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
                </button>
                
                <div class="absolute left-1/2 -translate-x-1/2">
                  <a href="/">
                    <img src={headerData.logo_mobile || headerData.logo} style={{ width: headerData.logo_width_mobile || '45px' }} class="object-contain" alt="Visoe" />
                  </a>
                </div>

                <button id="cart-trigger-mobile" class="relative">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.2"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
                  <span class="absolute top-0 -right-2 bg-black text-white text-[7px] w-4 h-4 flex items-center justify-center rounded-full font-bold">0</span>
                </button>
              </div>

              <div id="cart-overlay" class="fixed inset-0 bg-black/40 z-[300] overlay-fade">
                <div id="cart-drawer" class="absolute right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl drawer-transform flex flex-col">
                  <div class="p-6 border-b flex justify-between items-center">
                    <span class="text-[10px] font-bold uppercase tracking-[0.3em]">Shopping Bag (0)</span>
                    <button id="cart-close" class="p-2 uppercase text-[9px] font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity">Close</button>
                  </div>
                  <div class="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center text-center">
                    <svg class="w-16 h-16 opacity-5 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-width="1"/></svg>
                    <p class="text-[11px] uppercase tracking-[0.2em] opacity-30">Your bag is currently empty.</p>
                    <button id="cart-close-empty" class="mt-8 border border-black px-10 py-4 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">Start Shopping</button>
                  </div>
                  <div class="p-8 border-t bg-neutral-50 space-y-6">
                    <div class="flex justify-between text-[11px] font-bold uppercase tracking-widest"><span>Subtotal</span><span>Rp 0</span></div>
                    <button class="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 cursor-not-allowed">Proceed to Checkout</button>
                  </div>
                </div>
              </div>

              <div id="mobile-menu-overlay" class="fixed inset-0 bg-black/40 z-[250] overlay-fade">
                <div id="mobile-menu-drawer" class="absolute left-0 top-0 h-full w-[85%] bg-white shadow-2xl translate-x-[-100%] transition-transform duration-500 flex flex-col">
                  <div class="p-6 border-b flex justify-between items-center"><span class="text-[10px] font-bold uppercase tracking-widest">Navigation</span><button id="mobile-menu-close" class="p-2 uppercase text-[9px] font-bold tracking-widest opacity-40">Close</button></div>
                  <div class="flex-1 overflow-y-auto px-8 py-12 space-y-10">
                    {headerData.menu?.map((cat: any) => (
                      <div class="space-y-4">
                        <a href={cat.url} class="text-xl font-serif italic uppercase tracking-widest block border-b border-neutral-50 pb-2">{cat.title}</a>
                        <div class="flex flex-col gap-4 pl-4">
                          {cat.columns?.map((col: any) => (
                            <div class="space-y-3">
                              <span class="text-[8px] font-bold uppercase tracking-widest opacity-30">{col.heading}</span>
                              {col.links?.map((lnk: any) => (<a href={lnk.url} class="text-[11px] uppercase tracking-widest block opacity-70">{lnk.name}</a>))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </header>

            {/* ================= MAIN CONTENT: SUCCESS PAGE ================= */}
            <main class="flex-1 max-w-[800px] w-full mx-auto px-6 py-24 text-center">
              
              <div class="inline-flex items-center justify-center w-24 h-24 border border-black rounded-full mb-10">
                <svg class="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 class="text-4xl font-serif italic uppercase tracking-widest mb-6">Order Confirmed</h1>
              <p class="text-[11px] text-neutral-400 uppercase tracking-widest mb-2 leading-relaxed">Thank you for your purchase.</p>
              
              <p class="text-[11px] text-neutral-500 uppercase tracking-widest mb-12">
                Order Number: <span class="font-bold text-black border-b border-black pb-1 ml-2">{orderId}</span>
              </p>
              
              <div class="bg-neutral-50 border border-neutral-100 p-10 text-left max-w-lg mx-auto mb-16 space-y-6">
                <h3 class="font-bold text-black text-[10px] uppercase tracking-[0.3em] border-b border-neutral-200 pb-4">Payment Instructions</h3>
                <div class="space-y-2">
                  <p class="text-[11px] text-neutral-500 uppercase tracking-widest leading-relaxed">Please transfer the total amount to:</p>
                  <p class="font-serif text-2xl text-black">BCA 123-456-7890</p>
                  <p class="text-[11px] text-neutral-500 uppercase tracking-widest">A/N VISOE LUXURY</p>
                </div>
                <p class="text-[9px] mt-6 text-neutral-400 italic uppercase tracking-widest leading-relaxed border-t border-neutral-200 pt-6">
                  *Our concierge will contact you via WhatsApp shortly to confirm shipping details.
                </p>
              </div>
              
              <a href="/products" class="inline-block bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors shadow-xl">
                Continue Shopping
              </a>

              {/* Eksekusi pembersihan keranjang tanpa merefresh paksa server */}
              <script dangerouslySetInnerHTML={{ __html: `
                localStorage.removeItem('premium_cart');
                // Mengupdate Cart UI di Drawer menjadi 0
                const qAll = (s) => document.querySelectorAll(s);
                qAll('.rounded-full.font-bold').forEach(el => el.textContent = '0');
              `}} />
            </main>

            {/* ================= FOOTER KONSISTEN ================= */}
            <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-24 px-6 mt-auto">
              <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-left">
                <div class="space-y-8">
                  <h4 class="text-2xl font-serif italic uppercase tracking-widest">Visoe Luxury</h4>
                  <p class="text-[11px] opacity-40 leading-relaxed uppercase tracking-[0.2em]">Exclusively Curated Authentic Luxury.</p>
                </div>
                {footerData.columns?.map((col: any) => (
                  <div class="space-y-8">
                    <h5 class="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">{col.title}</h5>
                    <ul class="space-y-5">
                      {col.links?.map((lnk: any) => (<li><a href={lnk.url} class="text-[11px] uppercase tracking-[0.1em] hover:pl-2 transition-all block opacity-70">{lnk.name}</a></li>))}
                    </ul>
                  </div>
                ))}
              </div>
              <div class="max-w-[1400px] mx-auto mt-24 pt-12 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-6">
                 <span class="text-[9px] font-bold uppercase tracking-widest opacity-30">&copy; {new Date().getFullYear()} VISOE LUXURY.</span>
                 <div class="flex gap-8 text-[9px] font-bold uppercase tracking-widest opacity-30">
                    <a href="/terms">Terms</a><a href="/privacy">Privacy</a>
                 </div>
              </div>
            </footer>

          </div>

          {/* SCRIPT DRAWER & OVERLAY */}
          <script dangerouslySetInnerHTML={{ __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const q = (s) => document.querySelector(s);
              
              const cartOverlay = q('#cart-overlay');
              const cartDrawer = q('#cart-drawer');
              const openCart = () => { cartOverlay.classList.add('overlay-visible'); cartDrawer.classList.add('drawer-open'); document.body.style.overflow = 'hidden'; };
              const closeCart = () => { cartOverlay.classList.remove('overlay-visible'); cartDrawer.classList.remove('drawer-open'); document.body.style.overflow = 'auto'; };
              
              if(q('#cart-trigger-desktop')) q('#cart-trigger-desktop').onclick = openCart;
              if(q('#cart-trigger-mobile')) q('#cart-trigger-mobile').onclick = openCart;
              if(q('#cart-close')) q('#cart-close').onclick = closeCart;
              if(q('#cart-close-empty')) q('#cart-close-empty').onclick = closeCart;
              if(cartOverlay) cartOverlay.onclick = (e) => { if(e.target === cartOverlay) closeCart(); };

              const menuOverlay = q('#mobile-menu-overlay');
              const menuDrawer = q('#mobile-menu-drawer');
              const openMenu = () => { menuOverlay.classList.add('overlay-visible'); menuDrawer.classList.add('drawer-open'); document.body.style.overflow = 'hidden'; };
              const closeMenu = () => { menuOverlay.classList.remove('overlay-visible'); menuDrawer.classList.remove('drawer-open'); document.body.style.overflow = 'auto'; };
              
              if(q('#mobile-menu-open')) q('#mobile-menu-open').onclick = openMenu;
              if(q('#mobile-menu-close')) q('#mobile-menu-close').onclick = closeMenu;
              if(menuOverlay) menuOverlay.onclick = (e) => { if(e.target === menuOverlay) closeMenu(); };
            });
          `}} />
        </body>
      </html>
    );
  } catch (err: any) { 
    return c.text("System Error: " + err.message, 500); 
  }
});