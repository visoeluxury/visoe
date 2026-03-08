import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
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
          <title>Secure Checkout | Visoe Luxury</title>
          
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
            
            /* Form Styling Khusus Checkout Baru */
            .checkout-input { width: 100%; border-bottom: 1px solid #e5e5e5; outline: none; background: transparent; padding: 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; transition: border-color 0.3s; }
            .checkout-input:focus { border-color: black; }
          `}} />
        </head>
        <body>
          <div class="pb-24">
            
            {/* FAVICON DARI DATABASE HOME */}
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

            {/* ================= MAIN CONTENT: CHECKOUT (DESAIN BARU & LOGIKA ASLI) ================= */}
            <main class="max-w-[1200px] mx-auto px-6 mt-16 pb-32">
              <h1 class="text-3xl font-serif italic uppercase tracking-widest mb-12 border-b border-neutral-100 pb-6 text-center md:text-left">Secure Checkout</h1>
              
              <div class="flex flex-col lg:flex-row gap-16">
                
                {/* Form Informasi Pengiriman (Kiri) */}
                <div class="lg:w-3/5 space-y-12">
                  <form id="checkout-form" method="POST" action="/checkout/process" class="space-y-12">
                    {/* Payload Keranjang Disimpan Disini */}
                    <input type="hidden" name="cart_data" id="cart_data_input" />
                    
                    {/* Contact Info */}
                    <div class="space-y-6">
                      <h2 class="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">1. Contact Information</h2>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" name="name" required placeholder="NAMA LENGKAP *" class="checkout-input" />
                        <input type="email" name="email" required placeholder="EMAIL ADDRESS *" class="checkout-input" />
                      </div>
                      <input type="text" name="phone" required placeholder="NOMOR WHATSAPP *" class="checkout-input" />
                    </div>

                    {/* Shipping Address */}
                    <div class="space-y-6">
                      <h2 class="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">2. Shipping Address</h2>
                      <textarea name="address" rows={3} required placeholder="ALAMAT LENGKAP (KECAMATAN, KOTA, KODE POS) *" class="checkout-input resize-none"></textarea>
                    </div>

                    {/* Payment Methods */}
                    <div class="space-y-6">
                      <h2 class="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">3. Payment Method</h2>
                      <div class="space-y-4 border border-neutral-100 p-6">
                        <label class="flex items-center gap-4 cursor-pointer group">
                          <div class="w-4 h-4 rounded-full border border-black flex items-center justify-center">
                            <div class="w-2 h-2 rounded-full bg-black"></div>
                          </div>
                          <span class="text-[11px] font-bold uppercase tracking-widest group-hover:opacity-70 transition-opacity">Manual Bank Transfer</span>
                        </label>
                        <div class="pl-8 text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                          Instructions will be provided after placing the order.
                        </div>
                      </div>
                    </div>

                    <button id="submit-btn" type="submit" class="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors">
                      Place Order
                    </button>
                  </form>
                </div>

                {/* Ringkasan Pesanan (Kanan) - Dirender oleh JS Klien */}
                <div class="lg:w-2/5">
                  <div class="bg-neutral-50 p-8 md:p-10 sticky top-32">
                    <h2 class="text-xl font-serif italic uppercase tracking-widest mb-8 border-b border-neutral-200 pb-4">Order Summary</h2>
                    
                    <ul id="checkout-items" class="space-y-6 mb-8 border-b border-neutral-200 pb-8 min-h-[100px] flex flex-col justify-center">
                      <div class="flex flex-col items-center justify-center text-center w-full">
                        <svg class="w-8 h-8 opacity-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-width="1"/></svg>
                        <p class="text-[9px] uppercase tracking-[0.2em] opacity-40">Fetching your items...</p>
                      </div>
                    </ul>

                    <div class="space-y-4 text-[11px] font-bold uppercase tracking-widest opacity-70 border-b border-neutral-200 pb-6 mb-6">
                      <div class="flex justify-between">
                        <span>Subtotal</span>
                        <span id="checkout-subtotal">Rp 0</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Shipping</span>
                        <span>Gratis</span>
                      </div>
                    </div>

                    <div class="flex justify-between text-[13px] font-bold uppercase tracking-widest mb-4">
                      <span>Total</span>
                      <span id="checkout-total">Rp 0</span>
                    </div>
                    
                    <p class="text-[8px] text-center text-neutral-400 mt-6 uppercase tracking-widest leading-relaxed">
                      By placing your order, you agree to Visoe Luxury's Terms of Service and Privacy Policy. All items are authenticated prior to shipment.
                    </p>
                  </div>
                </div>

              </div>
            </main>

            {/* ================= FOOTER KONSISTEN ================= */}
            <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-24 px-6 mt-32">
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

          {/* SCRIPT LOGIKA CHECKOUT & UI */}
          <script dangerouslySetInnerHTML={{ __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const q = (s) => document.querySelector(s);
              
              // DRAWER CONTROLS
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

              // LOGIKA CHECKOUT ASLI DARI FILE SEBELUMNYA
              const cart = JSON.parse(localStorage.getItem('premium_cart')) || [];
              if (cart.length === 0) {
                alert('Shopping bag is empty!');
                window.location.href = '/products';
                return;
              }

              document.getElementById('cart_data_input').value = JSON.stringify(cart);

              const checkoutItemsContainer = document.getElementById('checkout-items');
              const checkoutSubtotal = document.getElementById('checkout-subtotal');
              const checkoutTotal = document.getElementById('checkout-total');

              const formatIDR = (price) => {
                return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
              };

              let total = 0;
              checkoutItemsContainer.innerHTML = cart.map(item => {
                total += (item.price * item.quantity);
                return \`
                  <li class="flex items-center gap-6 py-2">
                    <div class="aspect-[3/4] w-16 bg-white border border-neutral-100 flex-none overflow-hidden">
                      <img src="\${item.image}" alt="\${item.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-auto flex flex-col justify-center">
                      <h3 class="text-neutral-900 font-bold text-[10px] uppercase tracking-widest line-clamp-1">\${item.name}</h3>
                      <p class="text-neutral-400 text-[9px] mt-1 uppercase tracking-widest">\${item.brand}</p>
                      <p class="text-neutral-400 text-[9px] mt-1 uppercase tracking-widest">Qty: \${item.quantity}</p>
                    </div>
                    <p class="flex-none text-neutral-900 font-bold text-[10px] tracking-widest ml-4">\${formatIDR(item.price * item.quantity)}</p>
                  </li>
                \`;
              }).join('');

              checkoutSubtotal.textContent = formatIDR(total);
              checkoutTotal.textContent = formatIDR(total);
            });

            document.getElementById('checkout-form').addEventListener('submit', function() {
              const btn = document.getElementById('submit-btn');
              btn.textContent = 'PROCESSING...';
              btn.classList.add('opacity-50', 'cursor-not-allowed');
            });
          `}} />
        </body>
      </html>
    );
  } catch (err: any) { 
    return c.text("System Error: " + err.message, 500); 
  }
});