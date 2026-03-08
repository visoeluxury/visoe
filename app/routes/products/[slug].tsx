import { createRoute } from 'honox/factory';
import { getProductBySlug } from '../../utils/catalog';

export default createRoute(async (c) => {
  const db = c.env.DB;
  const product = await getProductBySlug(c, c.req.param('slug'));
  
  if (!product) {
    return c.html(
      <html lang="id">
        <head>
          <title>Product Not Found | Visoe Luxury</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="flex items-center justify-center h-screen">
          <div class="text-center uppercase text-xs font-bold tracking-widest">Product Not Found</div>
        </body>
      </html>
    );
  }

  // 1. AMBIL HEADER & FOOTER MURNI DARI HOMEPAGE (KONSISTEN 100%)
  let headerData: any = {};
  let footerData: any = {};
  try {
    const headerRow: any = await db.prepare(
      "SELECT content_json FROM frontpage_widgets WHERE widget_type = 'header_widget' AND page_id = 'home' AND is_active = 1"
    ).first();
    const footerRow: any = await db.prepare(
      "SELECT content_json FROM frontpage_widgets WHERE widget_type = 'footer_widget' AND page_id = 'home' AND is_active = 1"
    ).first();
    
    if(headerRow) headerData = JSON.parse(headerRow.content_json || '{}');
    if(footerRow) footerData = JSON.parse(footerRow.content_json || '{}');
  } catch(e) {}

  const images = JSON.parse(product.images_json || '[]');
  
  const formatIDR = (p: number) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
  }).format(p || 0);

  return c.html(
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{product.name} | Visoe Luxury</title>
        
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

          {/* NAV BAR (DESKTOP) - MEGA MENU DIKEMBALIKAN */}
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

        {/* ================= MAIN CONTENT: DETAIL PRODUK ================= */}
        <div class="max-w-[1200px] mx-auto px-4 md:px-6 relative pb-32 pt-6">
          <nav class="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-neutral-400 py-6 mb-4 border-b border-neutral-100">
            <a href="/" class="hover:text-black transition-colors">Home</a><span>/</span>
            <a href="/products" class="hover:text-black transition-colors">Shop</a><span>/</span>
            <span class="text-black font-bold truncate max-w-[200px] uppercase">{product.name}</span>
          </nav>

          <div class="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            <div class="lg:w-7/12 flex flex-col md:flex-row gap-4 w-full sticky top-32">
              <div class="order-2 md:order-1 flex md:flex-col items-center w-full md:w-20 gap-2">
                <button id="t-prev" class="hidden md:block text-neutral-300 hover:text-black transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 15l7-7 7 7" stroke-width="2"/></svg>
                </button>
                <div class="swiper product-thumb-swiper h-20 md:h-[450px] w-full">
                  <div class="swiper-wrapper">
                    {images.map((img: string, i: number) => (
                      <div key={i} class="swiper-slide !h-20 !w-20 cursor-pointer border border-neutral-100 hover:border-black transition-all bg-white overflow-hidden">
                        <img src={img} class="w-full h-full object-cover aspect-square" alt="thumb" />
                      </div>
                    ))}
                  </div>
                </div>
                <button id="t-next" class="hidden md:block text-neutral-300 hover:text-black transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" stroke-width="2"/></svg>
                </button>
              </div>

              <div class="order-1 md:order-2 flex-1 bg-white relative group cursor-zoom-in aspect-square border border-neutral-50 overflow-hidden max-h-[600px]">
                <div class="swiper product-main-swiper h-full w-full">
                  <div class="swiper-wrapper">
                    {images.map((img: string, idx: number) => (
                      <div key={idx} class="swiper-slide flex items-center justify-center h-full w-full bg-white" onclick={`window.openZoom(${idx})`}>
                        <img src={img} class="w-full h-full object-contain aspect-square" alt="main" />
                      </div>
                    ))}
                  </div>
                  <div class="swiper-button-next !text-black !w-8 !h-8 after:!text-xs !top-1/2 !-translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div class="swiper-button-prev !text-black !w-8 !h-8 after:!text-xs !top-1/2 !-translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            <div class="lg:w-5/12 w-full space-y-10">
              <div class="border-b border-neutral-100 pb-8">
                <a href={`/products?brand=${encodeURIComponent(product.brand)}`} class="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase mb-3 hover:text-black transition inline-block">
                  {product.brand}
                </a>
                <h1 class="text-3xl font-serif italic tracking-tight text-neutral-900 leading-tight mb-6 uppercase">{product.name}</h1>
                <div class="flex items-center gap-6">
                  <span class="text-2xl font-bold tracking-widest">{formatIDR(product.price)}</span>
                  <span class="text-[9px] px-3 py-1 bg-neutral-100 text-neutral-500 font-bold uppercase tracking-widest border border-neutral-200">{product.condition}</span>
                </div>
              </div>

              <button id="add-to-bag-btn" class="w-full bg-black text-white py-5 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-neutral-800 transition-all active:scale-95 flex justify-center items-center gap-3">
                <span>Add to Bag</span>
              </button>

              <div class="space-y-6 pt-4">
                <h3 class="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100 pb-2">Product Details</h3>
                <table class="w-full text-[12px] border-separate border-spacing-y-3">
                  <tbody>
                    {[
                      { l: 'Color', v: product.color }, { l: 'Material', v: product.exterior_material },
                      { l: 'Hardware', v: product.hardware_color }, { l: 'Dimensions', v: product.dimensions },
                      { l: 'Year', v: product.production_year }, { l: 'Includes', v: product.inclusions }
                    ].map(row => row.v && (
                      <tr key={row.l}><td class="text-neutral-400 uppercase tracking-widest text-[9px] font-bold w-1/3 py-1">{row.l}</td><td class="text-neutral-900 font-medium py-1">{row.v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div class="pt-6 border-t border-neutral-100">
                <h3 class="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-6">Description</h3>
                <div class="prose prose-sm max-w-none text-neutral-500 leading-relaxed font-light text-[13px]" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              <div class="border-t border-neutral-100 pt-8 space-y-6">
                <details class="group border-b border-neutral-100 pb-4 cursor-pointer">
                  <summary class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest list-none">Payment Methods <span class="group-open:rotate-180 transition-transform">↓</span></summary>
                  <div class="pt-4 text-[11px] text-neutral-500 space-y-2"><p>• Bank Transfer (BCA, Mandiri, BNI)</p><p>• Credit Card Visa/Mastercard</p></div>
                </details>
                <details class="group border-b border-neutral-100 pb-4 cursor-pointer">
                  <summary class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest list-none">Authenticity <span class="group-open:rotate-180 transition-transform">↓</span></summary>
                  <p class="pt-4 text-[11px] text-neutral-500 leading-relaxed">All items sold on Visoe Luxury are subject to a stringent verification process by our in-house experts.</p>
                </details>
                <details class="group border-b border-neutral-100 pb-4 cursor-pointer">
                  <summary class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest list-none">Return Policy <span class="group-open:rotate-180 transition-transform">↓</span></summary>
                  <p class="pt-4 text-[11px] text-neutral-500 leading-relaxed">Visoe Luxury does not accept returns for non-fitted items. All sales are final.</p>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ZOOM MODAL ================= */}
        <div id="zoom-overlay" class="fixed inset-0 bg-white z-[500] hidden flex flex-col overflow-hidden">
          <div class="p-4 flex justify-end absolute top-0 right-0 z-[520]">
            <button onclick="window.closeZoom()" class="p-4 hover:rotate-90 transition-transform text-neutral-400 hover:text-black">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" stroke-width="1.5"/></svg>
            </button>
          </div>
          <div class="flex-1 flex flex-row items-center justify-center h-full w-full px-6 md:px-20 gap-16">
            <div class="hidden md:flex flex-col items-center w-20 gap-4">
              <div class="swiper zoom-thumb-swiper h-[600px] w-full">
                <div class="swiper-wrapper">
                  {images.map((img: string, i: number) => (
                    <div key={i} class="swiper-slide !h-20 !w-20 cursor-pointer border border-neutral-100 hover:border-black transition-all bg-white overflow-hidden">
                      <img src={img} class="w-full h-full object-cover aspect-square" alt="zoom thumb" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div class="flex-1 flex items-center justify-center relative h-full w-full max-w-[800px]">
              <div class="swiper zoom-main-swiper h-full w-full">
                <div class="swiper-wrapper">
                  {images.map((img: string, idx: number) => (
                    <div key={idx} class="swiper-slide flex items-center justify-center h-full w-full">
                      <img src={img} class="w-full h-full object-contain aspect-square shadow-2xl" alt="zoom main" />
                    </div>
                  ))}
                </div>
                <div class="swiper-button-next !text-black !right-[-60px] !top-1/2 !-translate-y-1/2"></div>
                <div class="swiper-button-prev !text-black !left-[-60px] !top-1/2 !-translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FOOTER KONSISTEN ================= */}
        <footer class="w-full bg-neutral-50 border-t border-neutral-100 py-24 px-6">
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

        {/* ================= SCRIPT LOGIC ================= */}
        <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          let mSw, tSw, zmSw, ztSw;
          
          const pObj = { 
            id: "${product.id}", name: "${product.name}", brand: "${product.brand}", 
            price: ${product.price}, image: "${images[0]}" 
          };

          function initProductGallery() {
            const isMob = window.innerWidth < 768;
            tSw = new Swiper(".product-thumb-swiper", { direction: isMob ? 'horizontal' : 'spaceBetween: 10, slidesPerView: 'auto', mousewheel: true, navigation: { nextEl: "#t-next", prevEl: "#t-prev" }, watchSlidesProgress: true, freeMode: true });
            mSw = new Swiper(".product-main-swiper", { spaceBetween: 0, navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }, thumbs: { swiper: tSw } });
            ztSw = new Swiper(".zoom-thumb-swiper", { direction: 'vertical', spaceBetween: 15, slidesPerView: 'auto', mousewheel: true, watchSlidesProgress: true, freeMode: true });
            zmSw = new Swiper(".zoom-main-swiper", { centeredSlides: true, slidesPerView: 1, navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }, thumbs: { swiper: ztSw }, keyboard: { enabled: true } });
          }
          
          document.addEventListener('DOMContentLoaded', () => {
            initProductGallery();
            
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

            const btn = document.getElementById('add-to-bag-btn');
            if (btn) {
              btn.onclick = () => {
                if (window.addToCart) { window.addToCart(pObj); } 
                else { console.error('addToCart function not found on window'); }
                openCart();
              };
            }
          });

          window.addEventListener('resize', () => { if(tSw) tSw.destroy(); initProductGallery(); });
          window.openZoom = (i) => { document.getElementById('zoom-overlay').classList.remove('hidden'); document.body.style.overflow = 'hidden'; zmSw.update(); ztSw.update(); zmSw.slideTo(i, 0); };
          window.closeZoom = () => { document.getElementById('zoom-overlay').classList.add('hidden'); document.body.style.overflow = ''; };
        `}} />
      </body>
    </html>
  );
});