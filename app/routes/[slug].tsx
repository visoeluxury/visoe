import { createRoute } from 'honox/factory';

export default createRoute(async (c, next) => {
  const slug = c.req.param('slug');
  const db = c.env.DB;

  // 1. FILTER STATIC ASSETS & RESERVED ROUTES
  const reserved = ['products', 'checkout', 'admin', 'api', 'categories', 'cart', 'login', 'media', 'search', 'account'];
  if (reserved.includes(slug) || slug.includes('.')) return await next();

  try {
    // 2. CARI DATA HALAMAN BERDASARKAN SLUG
    const page: any = await db.prepare("SELECT * FROM pages WHERE slug = ?").bind(slug).first();
    if (!page) return await next();

    // 3. AMBIL WIDGET MILIK HALAMAN INI
    const { results: widgets } = await db.prepare(
      "SELECT * FROM frontpage_widgets WHERE page_id = ? AND is_active = 1 ORDER BY display_order ASC"
    ).bind(page.id).all();

    const formatIDR = (p: number) => new Intl.NumberFormat('id-ID', { 
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
    }).format(p || 0);

    return c.html(
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{page.title} | Visoe Luxury</title>
          
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
            body { font-family: 'Inter', sans-serif; background: white; color: #1a1a1a; margin: 0; overflow-x: hidden; }
            .font-serif { font-family: 'Bodoni Moda', serif; }
            .mega-menu-transition { transition: all 0.3s ease-in-out; }
            .nav-link { position: relative; padding-bottom: 4px; }
            .nav-link::after { content: ''; position: absolute; width: 0; height: 1.5px; bottom: 0; left: 0; background-color: black; transition: width 0.3s ease; }
            .nav-link:hover::after { width: 100%; }
            
            /* Animasi Drawer & Overlay */
            .drawer-transform { transform: translateX(100%); transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
            .drawer-open { transform: translateX(0) !important; }
            .overlay-fade { opacity: 0; visibility: hidden; transition: all 0.5s ease; }
            .overlay-visible { opacity: 1 !important; visibility: visible !important; }
          `}} />
        </head>
        <body>
          <div class="pb-24">
            
            {await Promise.all(widgets.map(async (widget) => {
              let data: any = {};
              
              // --- LOGIKA KONSISTEN: HEADER & FOOTER WAJIB DARI HOME ---
              if (widget.widget_type === 'header_widget' || widget.widget_type === 'footer_widget') {
                const homeRow: any = await db.prepare(
                  "SELECT content_json FROM frontpage_widgets WHERE widget_type = ? AND page_id = 'home' AND is_active = 1"
                ).bind(widget.widget_type).first();
                try { data = JSON.parse(homeRow?.content_json || '{}'); } catch(e) { data = {}; }
              } else {
                try { data = JSON.parse(widget.content_json || '{}'); } catch (e) { data = {}; }
              }

              // --- 1. RENDERER: HEADER (LOGO CENTERED, MEGA MENU, CART DRAWER) ---
              if (widget.widget_type === 'header_widget') {
                return (
                  <>
                    {/* FAVICON DARI DATABASE */}
                    {data.favicon && <link rel="icon" href={data.favicon} />}

                    <header class="w-full bg-white z-[100] relative border-b border-neutral-100">
                      {/* TOP BAR INFO */}
                      <div class="w-full border-b border-neutral-50 py-2 hidden md:block">
                        <div class="max-w-[1400px] mx-auto px-6 flex justify-end">
                          <span class="text-[9px] tracking-[0.3em] text-neutral-400 uppercase">
                            {data.top_bar_text || "Authentic Luxury Goods Only"}
                          </span>
                        </div>
                      </div>

                      {/* MAIN HEADER (DESKTOP) */}
                      <div class="max-w-[1400px] mx-auto px-6 py-6 hidden md:grid grid-cols-3 items-center">
                        {/* LEFT: SEARCH */}
                        <div class="flex items-center gap-2 cursor-pointer group w-fit">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
                          <span class="text-[10px] font-bold uppercase tracking-[0.2em] group-hover:opacity-50 transition-opacity">Search</span>
                        </div>

                        {/* CENTER: LOGO DESKTOP */}
                        <div class="flex justify-center">
                          <a href="/">
                            <img 
                              src={data.logo_desktop || data.logo} 
                              style={{ width: data.logo_width_desktop || '200px' }} 
                              class="object-contain" 
                              alt="Visoe Luxury" 
                            />
                          </a>
                        </div>

                        {/* RIGHT: ACCOUNT & CART TRIGGER */}
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
                          {data.menu?.map((cat: any) => (
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

                      {/* MOBILE HEADER (LOGO CENTERED) */}
                      <div class="md:hidden bg-white sticky top-0 z-[110] px-4 py-4 flex justify-between items-center relative">
                        <button id="mobile-menu-open" class="p-1">
                          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
                        </button>
                        
                        <div class="absolute left-1/2 -translate-x-1/2">
                          <a href="/">
                            <img 
                              src={data.logo_mobile || data.logo} 
                              style={{ width: data.logo_width_mobile || '45px' }} 
                              class="object-contain" 
                              alt="Visoe" 
                            />
                          </a>
                        </div>

                        <button id="cart-trigger-mobile" class="relative">
                          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.2"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
                          <span class="absolute top-0 -right-2 bg-black text-white text-[7px] w-4 h-4 flex items-center justify-center rounded-full font-bold">0</span>
                        </button>
                      </div>

                      {/* CART SLIDER DRAWER (FROM RIGHT) */}
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

                      {/* MOBILE MENU DRAWER */}
                      <div id="mobile-menu-overlay" class="fixed inset-0 bg-black/40 z-[250] overlay-fade">
                        <div id="mobile-menu-drawer" class="absolute left-0 top-0 h-full w-[85%] bg-white shadow-2xl translate-x-[-100%] transition-transform duration-500 flex flex-col">
                          <div class="p-6 border-b flex justify-between items-center"><span class="text-[10px] font-bold uppercase tracking-widest">Navigation</span><button id="mobile-menu-close" class="p-2 uppercase text-[9px] font-bold tracking-widest opacity-40">Close</button></div>
                          <div class="flex-1 overflow-y-auto px-8 py-12 space-y-10">
                            {data.menu?.map((cat: any) => (
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
                  </>
                );
              }

              // --- 2. HERO SLIDER ---
              if (widget.widget_type === 'hero_slider') {
                return (
                  <div class="w-full">
                    <div class="swiper hero-slider h-[450px] md:h-[750px] overflow-hidden relative">
                      <div class="swiper-wrapper">
                        {data.slides?.map((s: any) => (
                          <div class="swiper-slide relative">
                            <img src={s.image} class="w-full h-full object-cover" loading="lazy" />
                            <div class="absolute inset-0 bg-black/5"></div>
                            <a href={s.link || '#'} class="absolute inset-0"></a>
                          </div>
                        ))}
                      </div>
                      <div class="swiper-pagination"></div>
                    </div>
                  </div>
                );
              }

              // --- 3. ICON NAVIGATION ---
              if (widget.widget_type === 'icon_nav') {
                return (
                  <div class="max-w-[1200px] mx-auto px-4 md:px-6 text-center mt-12 md:mt-20">
                    <div class="flex flex-wrap justify-center gap-6 md:gap-12">
                      {data.items?.map((item: any) => (
                        <a href={item.link || '#'} class="flex flex-col items-center group w-20 md:w-28">
                          <div class="w-16 h-16 md:w-24 md:h-24 rounded-full border border-neutral-100 p-1 group-hover:border-black transition-all bg-white overflow-hidden shadow-sm">
                            <img src={item.image} class="w-full h-full object-cover rounded-full" />
                          </div>
                          <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-4 leading-tight">{item.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }

              // --- 4. PRODUCT GRID (SINGLE VENDOR - KONSISTEN) ---
              if (widget.widget_type === 'new_arrivals' || widget.widget_type === 'featured_products') {
                const productIds = data.product_ids || [];
                let products: any[] = [];
                if (productIds.length > 0) {
                  const formattedIds = productIds.map((id: string) => `'${id}'`).join(',');
                  const { results } = await db.prepare(`SELECT * FROM products WHERE id IN (${formattedIds}) AND is_active = 1`).all();
                  products = results;
                }
                return (
                  <div class="max-w-[1400px] mx-auto px-6 mt-24">
                    <div class="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 border-b border-neutral-100 pb-8 gap-4 text-center md:text-left">
                       <h2 class="text-3xl font-serif italic uppercase tracking-widest leading-none">{widget.title}</h2>
                       <a href="/products" class="text-[10px] font-bold uppercase border-b border-black pb-1 tracking-[0.3em] hover:opacity-50 transition-opacity">Discover All</a>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                      {products.map((p: any) => {
                        let imgs = JSON.parse(p.images_json || '[]');
                        return (
                          <a href={`/products/${p.slug}`} class="group">
                            <div class="aspect-[3/4] overflow-hidden bg-neutral-50 mb-6 relative">
                               <img src={imgs[0]} class="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                            </div>
                            <div class="space-y-2 text-center">
                              <h4 class="text-[11px] uppercase font-bold tracking-[0.2em] truncate">{p.name}</h4>
                              <p class="text-[12px] italic opacity-40">{p.brand || "Visoe Collection"}</p>
                              <p class="text-[13px] font-bold tracking-widest pt-2">{formatIDR(p.price)}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // --- 5. PRICING BLOCK ---
              if (widget.widget_type === 'pricing_block') {
                const gridMap: any = { '1': 'grid-cols-1', '2': 'md:grid-cols-2', '3': 'md:grid-cols-3', '4': 'md:grid-cols-4' };
                return (
                  <div class="max-w-[1200px] mx-auto px-4 md:px-6 mt-20">
                    <div class={`grid grid-cols-1 ${gridMap[data.layout] || 'md:grid-cols-3'} gap-6 md:gap-8`}>
                      {data.plans?.map((p: any) => (
                        <div class={`p-10 border ${p.highlight ? 'bg-black text-white shadow-xl' : 'bg-neutral-50 border-neutral-100'} flex flex-col text-left transition-all hover:scale-[1.01]`}>
                          <h3 class="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">{p.name}</h3>
                          <div class="text-3xl font-serif italic mb-8">{p.price}</div>
                          <ul class="space-y-4 mb-12 flex-1 text-[11px] opacity-70 leading-relaxed">{p.features?.map((f: string) => <li class="flex gap-3"><span>—</span> {f}</li>)}</ul>
                          <a href={p.button_url} class={`py-4 text-center text-[9px] font-bold uppercase tracking-[0.3em] transition ${p.highlight ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}>{p.button_text}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // --- 6. PROMO BANNER ---
              if (widget.widget_type === 'promo_banner') {
                return (
                  <div class="max-w-[1200px] mx-auto px-4 md:px-6 mt-20">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                      {data.promos?.map((promo: any) => (
                        <div class="group space-y-6 text-center">
                          <a href={promo.link || '#'} class="block aspect-square md:aspect-[4/5] overflow-hidden border border-neutral-100 shadow-sm relative"><img src={promo.image} class="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" /></a>
                          <div class="space-y-3"><h3 class="text-xl md:text-2xl font-serif italic uppercase tracking-widest">{promo.title}</h3><p class="text-[10px] md:text-[11px] text-neutral-400 uppercase tracking-widest">{promo.subtitle}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // --- 7. COUNTDOWN TIMER ---
              if (widget.widget_type === 'countdown_widget') {
                const uid = `cd-${widget.id}`;
                return (
                  <div class="max-w-[1400px] mx-auto px-4 md:px-6 mt-20">
                    <div class="py-16 md:py-24 bg-black text-white text-center relative overflow-hidden shadow-2xl">
                      <h2 class="text-xl md:text-2xl font-serif italic tracking-[0.3em] uppercase mb-12 relative z-10">{widget.title}</h2>
                      <div id={uid} class="flex justify-center gap-6 md:gap-16 relative z-10">
                        <div class="flex flex-col"><span class="days text-4xl md:text-7xl font-light tracking-tighter">00</span><span class="text-[8px] uppercase tracking-widest opacity-40 mt-3">Days</span></div>
                        <div class="flex flex-col"><span class="hours text-4xl md:text-7xl font-light tracking-tighter">00</span><span class="text-[8px] uppercase tracking-widest opacity-40 mt-3">Hours</span></div>
                        <div class="flex flex-col"><span class="mins text-4xl md:text-7xl font-light tracking-tighter">00</span><span class="text-[8px] uppercase tracking-widest opacity-40 mt-3">Mins</span></div>
                        <div class="flex flex-col"><span class="secs text-4xl md:text-7xl font-light tracking-tighter">00</span><span class="text-[8px] uppercase tracking-widest opacity-40 mt-3">Secs</span></div>
                      </div>
                      <div id={`${uid}-exp`} class="hidden text-red-500 font-bold tracking-widest uppercase text-xs mt-6 z-10 relative">{data.expired_text || 'EXPIRED'}</div>
                      <script dangerouslySetInnerHTML={{ __html: `
                        (function(){
                          const target = new Date('${data.end_time}').getTime();
                          if(isNaN(target)) return;
                          const timer = setInterval(() => {
                            const now = new Date().getTime();
                            const dist = target - now;
                            const el = document.getElementById('${uid}');
                            if(!el) { clearInterval(timer); return; }
                            const expEl = document.getElementById('${uid}-exp');
                            if(dist < 0) { clearInterval(timer); el.style.display='none'; if(expEl) expEl.style.display='block'; return; }
                            const d = el.querySelector('.days');
                            const h = el.querySelector('.hours');
                            const m = el.querySelector('.mins');
                            const s = el.querySelector('.secs');
                            if(d) d.innerText = Math.floor(dist/(1000*60*60*24)).toString().padStart(2,'0');
                            if(h) h.innerText = Math.floor((dist%(1000*60*60*24))/(1000*60*60)).toString().padStart(2,'0');
                            if(m) m.innerText = Math.floor((dist%(1000*60*60))/(1000*60)).toString().padStart(2,'0');
                            if(s) s.innerText = Math.floor((dist%(1000*60))/1000).toString().padStart(2,'0');
                          }, 1000);
                        })()
                      `}} />
                    </div>
                  </div>
                );
              }

              // --- 8. CUSTOM TEXT ---
              if (widget.widget_type === 'custom_title' || widget.widget_type === 'custom_paragraph') {
                const Tag = widget.widget_type === 'custom_title' ? 'h2' : 'p';
                const styleClass = widget.widget_type === 'custom_title' ? `${data.font_size || 'text-3xl md:text-4xl'} font-serif italic uppercase tracking-[0.2em] mt-20` : `${data.font_size || 'text-sm md:text-base'} leading-relaxed font-light mt-10`;
                return (<div class="max-w-[1200px] mx-auto px-4 md:px-6" style={{ textAlign: data.align || 'center' }}><Tag class={styleClass} style={{ color: data.text_color }}>{data.text}</Tag></div>);
              }

              // --- 9. TRUST BADGES ---
              if (widget.widget_type === 'trust_badges') {
                return (
                  <div class="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-neutral-100 pt-20 mt-20">
                    {data.badges?.map((badge: any) => (
                      <div class="space-y-4">
                        {badge.image && <img src={badge.image} class="w-12 h-12 mx-auto object-contain mb-4" />}
                        <h4 class="text-[10px] font-bold tracking-[0.3em] uppercase">{badge.title}</h4>
                        <p class="text-[11px] text-neutral-400 leading-relaxed max-w-[250px] mx-auto">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                );
              }

              // --- 10. FOOTER (KONSISTEN) ---
              if (widget.widget_type === 'footer_widget') {
                return (
                  <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-24 px-6 mt-32">
                    <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-left">
                      <div class="space-y-8">
                        <h4 class="text-2xl font-serif italic uppercase tracking-widest">Visoe Luxury</h4>
                        <p class="text-[11px] opacity-40 leading-relaxed uppercase tracking-[0.2em]">Exclusively Curated Authentic Luxury.</p>
                      </div>
                      {data.columns?.map((col: any) => (
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
                );
              }
              return null;
            }))}

          </div>

          {/* SCRIPT JS UNTUK DRAWER, SLIDER, MEGA MENU DLL */}
          <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
          <script dangerouslySetInnerHTML={{ __html: `
            document.addEventListener('DOMContentLoaded', () => {
              new Swiper('.hero-slider', { loop: true, autoplay: { delay: 6000 }, pagination: { el: '.swiper-pagination', clickable: true }, effect: 'fade' });
              
              const q = (s) => document.querySelector(s);
              
              // CART DRAWER
              const cartOverlay = q('#cart-overlay');
              const cartDrawer = q('#cart-drawer');
              const openCart = () => { cartOverlay.classList.add('overlay-visible'); cartDrawer.classList.add('drawer-open'); document.body.style.overflow = 'hidden'; };
              const closeCart = () => { cartOverlay.classList.remove('overlay-visible'); cartDrawer.classList.remove('drawer-open'); document.body.style.overflow = 'auto'; };
              
              if(q('#cart-trigger-desktop')) q('#cart-trigger-desktop').onclick = openCart;
              if(q('#cart-trigger-mobile')) q('#cart-trigger-mobile').onclick = openCart;
              if(q('#cart-close')) q('#cart-close').onclick = closeCart;
              if(q('#cart-close-empty')) q('#cart-close-empty').onclick = closeCart;
              if(cartOverlay) cartOverlay.onclick = (e) => { if(e.target === cartOverlay) closeCart(); };

              // MOBILE MENU DRAWER
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