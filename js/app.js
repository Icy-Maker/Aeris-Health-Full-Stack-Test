// ==================== DOM 引用 ====================

const loadingEl = document.getElementById('loading-state');
const errorEl = document.getElementById('error-state');
const errorTextEl = document.getElementById('error-text');
const productContentEl = document.getElementById('product-content');

const productImageEl = document.getElementById('product-image');
const productNameEl = document.getElementById('product-name');
const productDescEl = document.getElementById('product-description');
const productPriceEl = document.getElementById('product-price');
const stockStatusEl = document.getElementById('stock-status');
const productIndicatorEl = document.getElementById('product-indicator');

// 图片 SKU 指示器容器（动态创建）
let skuIndicatorEl = null;

const variantSectionEl = document.getElementById('variant-section');
const qtyMinusBtn = document.getElementById('qty-minus');
const qtyPlusBtn = document.getElementById('qty-plus');
const qtyValueEl = document.getElementById('qty-value');

const addToCartBtn = document.getElementById('add-to-cart-btn');
const feedbackEl = document.getElementById('add-feedback');
const retryBtn = document.getElementById('retry-btn');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const cartCountEl = document.getElementById('cart-count');

// ==================== 渲染函数 ====================

function render() {
    const state = window.State.getState();
    toggleStatePanels(state.pageState);
    renderCartCount(state);
    
    switch (state.pageState) {
        case 'LOADING':
            break;
        case 'SUCCESS':
        case 'OUT_OF_STOCK':
            renderProductContent(state);
            renderVariants(state);
            renderQuantity(state);
            renderAddButton(state);
            renderIndicator(state);
            renderSkuIndicator(state);
            break;
        case 'API_ERROR':
            errorTextEl.textContent = state.errorMessage || '加载失败，请稍后重试';
            break;
        case 'ADDING':
            renderAddingState();
            break;
        case 'ADD_SUCCESS':
            renderAddFeedback(state, true);
            renderCartCount(state);
            break;
        case 'ADD_FAILURE':
            renderAddFeedback(state, false);
            break;
    }
}

function toggleStatePanels(pageState) {
    loadingEl.classList.toggle('hidden', pageState !== 'LOADING');
    errorEl.classList.toggle('hidden', pageState !== 'API_ERROR');
    productContentEl.classList.toggle('hidden', 
        !['SUCCESS', 'OUT_OF_STOCK', 'ADDING', 'ADD_SUCCESS', 'ADD_FAILURE'].includes(pageState)
    );
}

// ==================== 核心：图片与 SKU 渲染 ====================

function renderProductContent(state) {
    const { product, currentSku, currentSkuId } = state;
    
    // 关键：根据当前 SKU ID 切换图片
    const imagePath = window.API.getSkuImage(product.productId, currentSkuId);
    productImageEl.src = imagePath || '';
    productImageEl.alt = product.name + ' - ' + (currentSku ? currentSku.color : '');
    
    productNameEl.textContent = product.name;
    productDescEl.textContent = product.description;
    
    if (currentSku) {
        productPriceEl.textContent = currentSku.price.toLocaleString();
        
        const inStock = currentSku.displayStock > 0;
        stockStatusEl.innerHTML = `
            <span class="sku-info">SKU: ${currentSku.skuId}</span>
            <span class="stock-info">库存: ${currentSku.displayStock} / ${currentSku.originalStock} 件</span>
            <span class="stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}">
                ${inStock ? '有货' : '缺货'}
            </span>
        `;
    }
}

/**
 * 渲染 SKU 图片切换指示器（圆点）
 */
function renderSkuIndicator(state) {
    const { product, currentSkuId } = state;
    
    // 创建或获取容器
    if (!skuIndicatorEl) {
        skuIndicatorEl = document.createElement('div');
        skuIndicatorEl.className = 'sku-indicator';
        document.querySelector('.product-gallery').appendChild(skuIndicatorEl);
    }
    
    skuIndicatorEl.innerHTML = '';
    
    product.variants.forEach(v => {
        const dot = document.createElement('span');
        dot.className = 'sku-dot' + (v.skuId === currentSkuId ? ' active' : '');
        dot.title = v.color;
        dot.addEventListener('click', () => {
            // 点击圆点直接切换 SKU
            const dim = window.State.getState().dimensions[0]; // 通常是 color
            window.State.setVariant(dim, v.color);
            render();
        });
        skuIndicatorEl.appendChild(dot);
    });
}

function renderVariants(state) {
    const { product, selectedVariants, dimensions } = state;
    variantSectionEl.innerHTML = '';
    
    dimensions.forEach(dim => {
        const group = document.createElement('div');
        group.className = 'variant-group';
        
        const label = document.createElement('label');
        label.className = 'variant-label';
        label.textContent = dim === 'color' ? '规格' : dim;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'variant-options';
        
        const uniqueValues = [...new Set(product.variants.map(v => v[dim]))];
        
        uniqueValues.forEach(value => {
            const btn = document.createElement('button');
            btn.className = 'variant-btn';
            btn.textContent = value;
            
            if (selectedVariants[dim] === value) {
                btn.classList.add('selected');
            }
            
            btn.addEventListener('click', () => {
                window.State.setVariant(dim, value);
                render();
            });
            
            optionsContainer.appendChild(btn);
        });
        
        group.appendChild(label);
        group.appendChild(optionsContainer);
        variantSectionEl.appendChild(group);
    });
}

function renderQuantity(state) {
    const { quantity, currentSku } = state;
    qtyValueEl.textContent = quantity;
    qtyMinusBtn.disabled = quantity <= 1;
    qtyPlusBtn.disabled = !currentSku || quantity >= currentSku.displayStock;
}

function renderAddButton(state) {
    const { pageState, currentSku } = state;
    const isOutOfStock = !currentSku || currentSku.displayStock === 0;
    
    addToCartBtn.disabled = isOutOfStock || pageState === 'ADDING';
    addToCartBtn.textContent = isOutOfStock ? '暂时缺货' : 
                               pageState === 'ADDING' ? '添加中...' : '加入购物车';
}

function renderAddingState() {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = '添加中...';
    feedbackEl.classList.add('hidden');
}

function renderAddFeedback(state, isSuccess) {
    feedbackEl.textContent = state.addFeedback;
    feedbackEl.className = 'feedback ' + (isSuccess ? 'success' : 'error');
    feedbackEl.classList.remove('hidden');
    
    setTimeout(() => {
        feedbackEl.classList.add('hidden');
        window.State.setPageState('SUCCESS');
        render();
    }, 2500);
}

/**
 * 修复：购物车角标始终显示（包括0），数字0时也展示
 */
function renderCartCount(state) {
    const count = state.cartCount;
    
    // 强制更新文本内容
    cartCountEl.textContent = count;
    
    // 始终显示角标，不再隐藏
    cartCountEl.classList.remove('hidden');
    cartCountEl.classList.add('visible');
    
    // 强制内联样式确保显示
    cartCountEl.style.display = 'flex';
    cartCountEl.style.opacity = '1';
    cartCountEl.style.visibility = 'visible';
    
    // 数字为0时灰色显示，有商品时绿色高亮
    if (count > 0) {
        cartCountEl.style.background = 'var(--accent)';
        cartCountEl.style.color = 'white';
    } else {
        cartCountEl.style.background = '#cccccc';  // 灰色表示空
        cartCountEl.style.color = 'white';
    }
    
    // 调试日志
    console.log('Cart count updated:', count);
}

function renderIndicator(state) {
    const current = window.State.getCurrentIndex() + 1;
    const total = window.State.getTotalProducts();
    productIndicatorEl.textContent = `${current} / ${total}`;
}

// ==================== 事件处理 ====================

async function handleAddToCart() {
    const state = window.State.getState();
    if (state.pageState === 'ADDING') return;
    
    window.State.setPageState('ADDING');
    render();
    
    try {
        const result = await window.API.addToCart({
            productId: state.product.productId,
            skuId: state.currentSku.skuId,
            quantity: state.quantity
        });
        
        if (result.success) {
            window.State.setCartCount(result.cartCount);
            window.State.setAddFeedback(`已添加 ${state.quantity} 件到购物车`, true);
            
            // 关键：加购成功后重新加载商品，刷新库存显示
            await reloadProductStock();
        } else {
            window.State.setAddFeedback(result.message, false);
        }
    } catch (err) {
        window.State.setAddFeedback('添加失败，请重试', false);
    }
    
    render();
}

/**
 * 轻量刷新库存：不重置页面状态，只更新库存数字
 */
async function reloadProductStock() {
    try {
        const result = await window.API.getProductDetail(window.State.getProductId());
        if (result.success) {
            // 使用新的 refreshProduct，保持当前 pageState
            window.State.refreshProduct(result.data);
        }
    } catch (e) {
        console.error('刷新库存失败', e);
    }
}

async function loadProduct(productId) {
    window.State.setProductId(productId);
    window.State.setPageState('LOADING');
    render();
    
    try {
        const result = await window.API.getProductDetail(window.State.getProductId());
        
        if (result.success) {
            window.State.initProduct(result.data);
        } else {
            window.State.setPageState('API_ERROR');
            window.State.setErrorMessage(result.message);
        }
    } catch (err) {
        window.State.setPageState('API_ERROR');
        window.State.setErrorMessage('网络请求失败');
    }
    
    render();
}

function goPrev() {
    const prevId = window.State.goToPrevProduct();
    loadProduct(prevId);
}

function goNext() {
    const nextId = window.State.goToNextProduct();
    loadProduct(nextId);
}

// ==================== 初始化 ====================

function init() {
    // 数量按钮
    qtyMinusBtn.addEventListener('click', () => {
        window.State.decrementQuantity();
        render();
    });
    
    qtyPlusBtn.addEventListener('click', () => {
        window.State.incrementQuantity();
        render();
    });
    
    // 加购按钮
    addToCartBtn.addEventListener('click', handleAddToCart);
    
    // 重试按钮
    retryBtn.addEventListener('click', () => {
        loadProduct(window.State.getProductId());
    });
    
    // 左右切换按钮
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);
    
    // 键盘支持
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
    });
    
    loadProduct('P001');

    renderCartCount(window.State.getState());
}

document.addEventListener('DOMContentLoaded', init);
