const Pages={
loginPage(){return`
<div class="auth-page">
<div class="auth-container">
<div class="auth-header">
<img src="img/logo.png" alt="AC Logo" style="width:80px; height:80px; object-fit:contain; margin:0 auto var(--space-4); display:block;">
<h1 class="auth-title">Virtual Closet</h1>
<p class="auth-subtitle">Tu armario digital inteligente</p>
</div>
<div class="auth-card">
<form class="auth-form" id="login-form" onsubmit="event.preventDefault();App.login()">
<div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" id="login-email" placeholder="tu@email.com" value="demo@closet.ai"></div>
<div class="form-group">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <label class="form-label">Contraseña</label>
    <a href="#" onclick="App.forgotPassword(); return false;" style="font-size:var(--text-xs); color:var(--color-primary); font-weight:600;">¿Olvidaste tu contraseña?</a>
  </div>
  <input class="form-input" type="password" id="login-pass" placeholder="••••••••" value="demo123">
</div>
<button type="submit" class="btn btn-primary btn-lg" style="width:100%"><span class="material-symbols-outlined" style="margin-right:8px;vertical-align:middle;">login</span> Iniciar Sesión</button>
</form>

</div>
<p class="auth-footer">¿No tienes cuenta? <a href="#register" onclick="Router.navigate('register')">Regístrate gratis</a></p>
</div>
</div>`},

registerPage(){return`
<div class="auth-page">
<div class="auth-container">
<div class="auth-header">
<img src="img/logo.png" alt="AC Logo" style="width:80px; height:80px; object-fit:contain; margin:0 auto var(--space-4); display:block;">
<h1 class="auth-title">Crear Cuenta</h1>
<p class="auth-subtitle">Únete y organiza tu estilo personal</p>
</div>
<div class="auth-card">
<form class="auth-form" id="register-form" onsubmit="event.preventDefault();App.register()">
<div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="reg-name" placeholder="Tu nombre"></div>
<div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" id="reg-email" placeholder="tu@email.com"></div>
<div class="form-group"><label class="form-label">Contraseña</label><input class="form-input" type="password" id="reg-pass" placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 especial" oninput="Security.renderPasswordStrength(this.value,'pw-strength')"></div>
<div class="form-group"><label class="form-label">Género (Modelo Base)</label><select class="form-input" id="reg-gender"><option value="Mujer">Mujer</option><option value="Hombre">Hombre</option></select></div>
<div class="form-group"><label class="form-label">Foto de tu Rostro (Modelo Base)</label><input type="file" class="form-input" id="reg-face" accept="image/*" style="padding:var(--space-2)"></div>
<div id="pw-strength"></div>
<button type="submit" class="btn btn-primary btn-lg" style="width:100%"><span class="material-symbols-outlined" style="margin-right:8px;vertical-align:middle;">person_add</span> Crear Cuenta</button>
</form>
</div>
<p class="auth-footer">¿Ya tienes cuenta? <a href="#login" onclick="Router.navigate('login')">Inicia sesión</a></p>
</div>
</div>`},

dashboardPage(){
const s=Store.getState(),items=s.clothingItems,outfits=s.outfits;
const cats={};items.forEach(i=>{cats[i.category]=(cats[i.category]||0)+1});
return`
${Components.renderHeader()}
${Components.renderSidebar()}
${Components.renderMobileNav()}
<main class="app-main has-sidebar">
<div class="page-content">
<div class="page-header">
<h1 class="page-title">¡Hola, <span class="page-title-gradient">${s.user ? (s.user.name.includes('@') ? s.user.name.split('@')[0] : s.user.name) : 'Fashionista'}</span>! ✨</h1>
<p class="page-description">Tu armario digital tiene ${items.length} prendas y ${outfits.length} outfits guardados.</p>
</div>
<div class="dashboard-stats">
${Components.renderStatCard(items.length,'Prendas','checkroom','#7C3AED')}
${Components.renderStatCard(outfits.length,'Outfits','layers','#F43F5E')}
${Components.renderStatCard(items.filter(i=>i.favorite).length,'Favoritos','favorite','#F59E0B')}
${Components.renderStatCard(Object.keys(cats).length,'Categorías','label','#10B981')}
</div>
<div class="dashboard-section">
<div class="section-header"><div><h2 class="section-title">Prendas Recientes</h2><p class="section-subtitle">Últimas adiciones a tu armario</p></div>
<button class="btn btn-ghost btn-sm" onclick="Router.navigate('closet')">Ver todo <span class="material-symbols-outlined" style="vertical-align:middle;font-size:1.2rem;">arrow_forward</span></button></div>
<div class="recent-items-scroll">${items.slice(0,8).map(i=>`<div class="recent-item">${Components.renderClothingCard(i)}</div>`).join('')}</div>
</div>
<div class="dashboard-section">
<div class="section-header"><div><h2 class="section-title">Sugerencias del Día</h2><p class="section-subtitle">Combinaciones populares de tu armario</p></div>
<button class="btn btn-outline btn-sm" onclick="Router.navigate('saved')"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;font-size:1.2rem;">favorite</span> Ver guardados</button></div>
<div class="ai-suggestions">
${['Look Casual Primaveral','Elegancia Minimalista','Street Style Urbano'].map((t,i)=>`
<div class="ai-suggestion-card" onclick="Router.navigate('saved')" style="animation:fadeInUp 0.5s ${i*0.1}s var(--ease-out-expo) both">
<div class="ai-suggestion-preview">${items.slice(i*3,i*3+3).map(it=>`<div style="aspect-ratio:3/4;background:${it.color};display:flex;align-items:center;justify-content:center;font-size:1.5rem">${it.icon}</div>`).join('')}</div>
<div class="ai-suggestion-info">
<div class="ai-suggestion-title">${t}</div>
<div class="ai-suggestion-desc">Combinación perfecta para hoy</div>
<div class="ai-suggestion-tags"><span class="tag">☀️ 24°C</span><span class="tag">Casual</span></div>
</div></div>`).join('')}
</div></div>
</div></main>`},

closetPage(){
const s=Store.getState(),items=s.clothingItems;
const cats=['all','Tops','Bottoms','Dresses','Outerwear','Shoes','Accessories'];
const catLabels={all:'Todos',Tops:'Tops',Bottoms:'Pantalones',Dresses:'Vestidos',Outerwear:'Abrigos',Shoes:'Zapatos',Accessories:'Accesorios'};
const catIcons={all:'✨',Tops:'👕',Bottoms:'👖',Dresses:'👗',Outerwear:'🧥',Shoes:'👟',Accessories:'💍'};
const filter=s.filters.category||'all';
const filtered=filter==='all'?items:items.filter(i=>i.category===filter);
return`
${Components.renderHeader()}${Components.renderSidebar()}${Components.renderMobileNav()}
<main class="app-main has-sidebar"><div class="page-content">
<div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
<div><h1 class="page-title">Mi <span class="page-title-gradient">Armario</span></h1>
<p class="page-description">${items.length} prendas en tu colección</p></div>
<div style="display:flex;gap:var(--space-2)">
<button class="btn btn-secondary" onclick="App.deleteAllItems()"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">delete</span> Vaciar</button>
<button class="btn btn-primary" onclick="Router.navigate('upload')"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">add</span> Añadir Prenda</button>
</div></div>
<div class="category-nav" style="margin-bottom:var(--space-6)">
${cats.map(c=>`<button class="category-pill ${filter===c?'active':''}" onclick="Store.setState({filters:{...Store.getState().filters,category:'${c}'}});Router.navigate('closet')">${catIcons[c]} ${catLabels[c]}</button>`).join('')}
</div>
<div class="clothing-grid">${filtered.length?filtered.map(i=>Components.renderClothingCard(i)).join(''):'<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">👗</div><div class="empty-state-title">Tu armario está vacío</div><p class="empty-state-text">Sube tu primera prenda para empezar</p><button class="btn btn-primary" style="margin-top:var(--space-4)" onclick="Router.navigate(\'upload\')"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">add</span> Subir Prenda</button></div>'}</div>
</div></main>`},

builderPage(){
const s=Store.getState(),items=s.clothingItems;
const slots=[{id:'top',label:'Top / Camiseta',icon:'👕',cat:'Tops'},{id:'bottom',label:'Pantalón / Falda',icon:'👖',cat:'Bottoms'},{id:'shoes',label:'Zapatos',icon:'👟',cat:'Shoes'},{id:'acc',label:'Accesorios',icon:'💍',cat:'Accessories'}];
return`
${Components.renderHeader()}${Components.renderSidebar()}${Components.renderMobileNav()}
<main class="app-main has-sidebar"><div class="page-content">
<div class="page-header"><h1 class="page-title">Outfit <span class="page-title-gradient">Builder</span></h1>
<p class="page-description">Selecciona prendas para crear tu look perfecto</p></div>
<div class="builder-layout">
<div class="builder-sidebar">
<h3 style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-3);color:var(--color-text-secondary)">Selecciona Prendas</h3>
<div class="category-nav" style="margin-bottom:var(--space-3)">
${['Tops','Bottoms','Shoes','Accessories'].map((c,i)=>`<button class="category-pill ${i===0?'active':''}" onclick="App.filterBuilder('${c}',this)">${{Tops:'👕',Bottoms:'👖',Shoes:'👟',Accessories:'💍'}[c]} ${c}</button>`).join('')}
</div>
<div class="builder-item-list" id="builder-items">
${items.filter(i=>['Camisas/Blusas', 'Camisetas', 'Sudaderas', 'Chaquetas', 'Vestidos/Enterizos'].includes(i.category)).map(i=>`<div class="builder-item" draggable="true" data-id="${i.id}" onclick="App.selectBuilderItem('${i.id}')"><div style="width:100%;height:100%;background:${i.color};display:flex;align-items:center;justify-content:center;font-size:2rem">${i.imageUrl ? `<img src="${i.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">` : i.icon}</div></div>`).join('')}
</div></div>
<div class="builder-canvas">
<div style="position:relative; width:100%; max-width:380px; aspect-ratio:2/3; margin:0 auto; background:var(--color-surface-2); border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-xl);">
  <img src="${s.user && s.user.gender === 'Hombre' ? 'img/mannequin_hombre.png' : 'img/mannequin_mujer.png'}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1;">
  
  ${s.user && s.user.faceUrl ? 
    `<img src="${s.user.faceUrl}" style="position:absolute; z-index:2; border-radius:50%; object-fit:cover; box-shadow:0 4px 10px rgba(0,0,0,0.3); ${s.user.gender === 'Hombre' ? 'top:9%; left:42.5%; width:15%; height:10%;' : 'top:9%; left:43%; width:14%; height:9.3%;'}">` : ''}

  <div class="builder-drop-zone highlight" data-slot="top" id="slot-top" onclick="App.assignToSlot('top')" style="position:absolute; top:20%; left:15%; width:70%; height:34%; z-index:10; border:2px dashed rgba(124,58,237,0.5); border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; background:rgba(0,0,0,0.1); backdrop-filter:blur(2px);">
    <div style="font-size:1.5rem;margin-bottom:var(--space-1);text-shadow:0 2px 4px rgba(0,0,0,0.5)">👕</div>
    <div style="font-size:var(--text-xs);color:white;text-shadow:0 1px 2px rgba(0,0,0,0.8)">Top</div>
  </div>

  <div class="builder-drop-zone highlight" data-slot="bottom" id="slot-bottom" onclick="App.assignToSlot('bottom')" style="position:absolute; top:55%; left:20%; width:60%; height:32%; z-index:9; border:2px dashed rgba(124,58,237,0.5); border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; background:rgba(0,0,0,0.1); backdrop-filter:blur(2px);">
    <div style="font-size:1.5rem;margin-bottom:var(--space-1);text-shadow:0 2px 4px rgba(0,0,0,0.5)">👖</div>
    <div style="font-size:var(--text-xs);color:white;text-shadow:0 1px 2px rgba(0,0,0,0.8)">Pantalón</div>
  </div>

  <div class="builder-drop-zone highlight" data-slot="shoes" id="slot-shoes" onclick="App.assignToSlot('shoes')" style="position:absolute; top:88%; left:20%; width:60%; height:11%; z-index:8; border:2px dashed rgba(124,58,237,0.5); border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; background:rgba(0,0,0,0.1); backdrop-filter:blur(2px);">
    <div style="font-size:1.5rem;margin-bottom:var(--space-1);text-shadow:0 2px 4px rgba(0,0,0,0.5)">👟</div>
    <div style="font-size:var(--text-xs);color:white;text-shadow:0 1px 2px rgba(0,0,0,0.8)">Zapatos</div>
  </div>

  <div class="builder-drop-zone highlight" data-slot="acc" id="slot-acc" onclick="App.assignToSlot('acc')" style="position:absolute; top:20%; left:75%; width:20%; height:15%; z-index:11; border:2px dashed rgba(124,58,237,0.5); border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; background:rgba(0,0,0,0.1); backdrop-filter:blur(2px);">
    <div style="font-size:1.5rem;margin-bottom:var(--space-1);text-shadow:0 2px 4px rgba(0,0,0,0.5)">💍</div>
  </div>

</div></div>
<div class="builder-sidebar">
<h3 style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-3);color:var(--color-text-secondary)">Tu Outfit</h3>
<div id="builder-summary" style="display:flex;flex-direction:column;gap:var(--space-3)">
<div class="empty-state" style="padding:var(--space-8)"><div class="empty-state-icon">👆</div><p class="empty-state-text">Selecciona prendas para armar tu outfit</p></div>
</div>
<div style="margin-top:var(--space-4);display:flex;gap:var(--space-2)">
<button class="btn btn-primary" style="flex:1" onclick="App.saveCurrentOutfit()"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">save</span> Guardar</button>
<button class="btn btn-danger btn-icon" onclick="App.clearBuilder()" title="Limpiar"><span class="material-symbols-outlined">delete</span></button>
</div></div>
</div></div></main>`},

savedPage(){
const s=Store.getState(),cols=s.collections,items=s.clothingItems,outfits=s.outfits;
return`
${Components.renderHeader()}${Components.renderSidebar()}${Components.renderMobileNav()}
<main class="app-main has-sidebar"><div class="page-content">
<div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
<div><h1 class="page-title">Mis <span class="page-title-gradient">Guardados</span></h1>
<p class="page-description">${outfits.length} outfits en ${cols.length} colecciones</p></div>
<button class="btn btn-primary" onclick="App.createCollection()"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">add</span> Nueva Colección</button>
</div>
<div class="collections-grid">
${cols.map((c,i)=>`
<div class="collection-card" style="animation:fadeInUp 0.5s ${i*0.08}s var(--ease-out-expo) both">
<div class="collection-cover" style="background:${c.color}15">
${c.outfitIds.slice(0,3).map(oid=>{const o=outfits.find(x=>x.id===oid);const it=o?items.find(x=>x.id===o.items[0]):null;
return it?`<div style="display:flex;align-items:center;justify-content:center;background:${it.color};font-size:2rem">${it.icon}</div>`:`<div style="background:var(--color-surface-1)"></div>`}).join('')}
${c.outfitIds.length<3?`<div style="background:var(--color-surface-1);display:flex;align-items:center;justify-content:center;color:var(--color-text-tertiary)"><span class="material-symbols-outlined">add</span></div>`:''}</div>
<div class="collection-info" style="display:flex;align-items:center;justify-content:space-between">
<div><div class="collection-name">${c.icon} ${c.name}</div>
<div class="collection-count">${c.outfitIds.length} outfits</div></div>
<button class="btn btn-icon btn-ghost btn-sm" onclick="event.stopPropagation();App.deleteCollection('${c.id}')" title="Eliminar"><span class="material-symbols-outlined" style="color:var(--color-accent-rose);font-size:1.2rem;">delete</span></button>
</div></div>`).join('')}
<div class="collection-card" style="border-style:dashed;display:flex;align-items:center;justify-content:center;min-height:200px;cursor:pointer" onclick="App.createCollection()">
<div style="text-align:center;color:var(--color-text-tertiary)"><span class="material-symbols-outlined" style="font-size:2.5rem;margin-bottom:var(--space-2)">add</span><div style="font-size:var(--text-sm)">Nueva Colección</div></div></div>
</div>
<div style="margin-top:var(--space-10)">
<div class="section-header"><h2 class="section-title">Outfits Favoritos</h2></div>
<div class="clothing-grid">${outfits.filter(o=>o.favorite).map(o=>{
const oi=o.items.map(id=>items.find(x=>x.id===id)).filter(Boolean);
return`<div class="outfit-card" style="position:relative">
<div class="outfit-card-grid">${oi.slice(0,4).map(it=>`<div style="display:flex;align-items:center;justify-content:center;background:${it.color};font-size:1.8rem">${it.icon}</div>`).join('')}</div>
<div style="padding:var(--space-3) var(--space-4);display:flex;align-items:center;justify-content:space-between">
<div><div style="font-weight:600;font-size:var(--text-sm)">${o.name}</div><div style="font-size:var(--text-xs);color:var(--color-text-tertiary)">${o.occasion} · ${o.season}</div></div>
<button class="btn btn-icon btn-ghost btn-sm" onclick="App.deleteOutfit('${o.id}')" title="Eliminar outfit"><span class="material-symbols-outlined" style="color:var(--color-accent-rose);font-size:1.2rem">delete</span></button>
</div></div>`}).join('')}</div>
</div></div></main>`},

uploadPage(){return`
${Components.renderHeader()}${Components.renderSidebar()}${Components.renderMobileNav()}
<main class="app-main has-sidebar"><div class="page-content">
<div class="page-header"><h1 class="page-title">Subir <span class="page-title-gradient">Prendas</span></h1>
<p class="page-description">Agrega nuevas prendas a tu armario digital</p></div>
<div class="upload-steps">
<div class="upload-step active"><div class="upload-step-number">1</div><span class="upload-step-label">Subir Foto</span></div>
<div class="upload-step-connector"></div>
<div class="upload-step"><div class="upload-step-number">2</div><span class="upload-step-label">Vista Previa</span></div>
<div class="upload-step-connector"></div>
<div class="upload-step"><div class="upload-step-number">3</div><span class="upload-step-label">Categorizar</span></div>
<div class="upload-step-connector"></div>
<div class="upload-step"><div class="upload-step-number">4</div><span class="upload-step-label">¡Listo!</span></div>
</div>
<div class="upload-zone" id="upload-zone" onclick="document.getElementById('file-input').click()">
<input type="file" id="file-input" accept="image/*" multiple style="display:none" onchange="App.handleUpload(this)">
<div class="upload-zone-icon">📸</div>
<div class="upload-zone-text">Arrastra tus fotos aquí o haz clic para seleccionar</div>
<div class="upload-zone-hint">PNG, JPG hasta 10MB</div>
</div>
<div class="upload-preview-grid" id="upload-previews"></div>
<div style="margin-top:var(--space-8)">
<div class="section-header"><h2 class="section-title">Categorización</h2><p class="section-subtitle">Clasifica tu prenda para organizarla mejor</p></div>
<div class="tagging-form">
<div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="upload-name" placeholder="Ej: Camiseta Blanca"></div>
<div class="form-group"><label class="form-label">Categoría</label><select class="form-input" id="upload-category"><option value="">Seleccionar...</option><option value="Camisas/Blusas">Camisas / Blusas</option><option value="Camisetas">Camisetas / Playeras</option><option value="Sudaderas">Sudaderas / Suéteres</option><option value="Pantalones">Pantalones / Jeans</option><option value="Shorts/Faldas">Shorts / Faldas</option><option value="Vestidos/Enterizos">Vestidos / Enterizos</option><option value="Chaquetas">Chaquetas / Abrigos</option><option value="Zapatos">Zapatos / Tenis</option><option value="Accesorios">Accesorios</option></select></div>
<div class="form-group"><label class="form-label">Temporada</label><select class="form-input" id="upload-season"><option value="Todas">Todas</option><option value="Primavera">Primavera</option><option value="Verano">Verano</option><option value="Otoño">Otoño</option><option value="Invierno">Invierno</option></select></div>
<div class="form-group"><label class="form-label">Ocasión</label><select class="form-input" id="upload-occasion"><option value="Casual">Casual</option><option value="Formal">Formal</option><option value="Trabajo">Trabajo</option><option value="Fiesta">Fiesta</option><option value="Deporte">Deporte</option></select></div>
<div class="form-group"><label class="form-label">Marca (opcional)</label><input class="form-input" id="upload-brand" placeholder="Ej: Zara, H&M..."></div>
<div class="form-group"><label class="form-label">Color</label><input class="form-input" id="upload-color" placeholder="Ej: Negro, Azul..."></div>
</div>
<div style="margin-top:var(--space-6);display:flex;gap:var(--space-3);justify-content:flex-end">
<button class="btn btn-secondary" onclick="Router.navigate('closet')">Cancelar</button>
<button class="btn btn-primary upload-save-btn" onclick="App.saveUploadedItem()"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;">check</span> Guardar Prenda</button>
</div></div></div></main>`},

profilePage(){
const s=Store.getState(),items=s.clothingItems;
return`
${Components.renderHeader()}${Components.renderSidebar()}${Components.renderMobileNav()}
<main class="app-main has-sidebar"><div class="page-content">
<div class="profile-header">
<div class="profile-avatar-wrapper">
<div class="profile-avatar" style="background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:2.5rem;overflow:hidden;">
${s.user && s.user.faceUrl ? `<img src="${s.user.faceUrl}" style="width:100%;height:100%;object-fit:cover;">` : `👤`}
</div>
<div class="profile-avatar-edit"><span class="material-symbols-outlined">photo_camera</span></div></div>
<div class="profile-info">
<h2>${s.user?s.user.name:'Fashionista'}</h2>
<p>@${s.user?s.user.name.toLowerCase().replace(/\s/g,''):'fashionista'} · Estilo: Casual Chic</p>
<div class="profile-stats">
<div class="profile-stat"><div class="profile-stat-value">${items.length}</div><div class="profile-stat-label">Prendas</div></div>
<div class="profile-stat"><div class="profile-stat-value">${s.outfits.length}</div><div class="profile-stat-label">Outfits</div></div>
<div class="profile-stat"><div class="profile-stat-value">${s.collections.length}</div><div class="profile-stat-label">Colecciones</div></div>
</div></div>
<button class="btn btn-outline" onclick="Components.showToast('Perfil actualizado','success')"><span class="material-symbols-outlined" style="margin-right:6px;vertical-align:middle;font-size:1.2rem;">edit</span> Editar</button>
</div>
<div class="profile-tabs">
<button class="profile-tab active">Armario</button><button class="profile-tab">Outfits</button><button class="profile-tab">Estadísticas</button><button class="profile-tab">Ajustes</button>
</div>
<div class="clothing-grid">${items.slice(0,12).map(i=>Components.renderClothingCard(i)).join('')}</div>
</div></main>`}
};
