// ==================== 全局状态 ====================

const appState = {
    pageState: 'LOADING',
    product: null,
    dimensions: [],
    selectedVariants: {},
    currentSku: null,
    currentSkuId: '',        // 当前选中 SKU ID（用于图片切换）
    quantity: 1,
    cartCount: 0,
    errorMessage: '',
    addFeedback: '',
    currentProductId: 'P001',
    currentProductIndex: 0
};

// ==================== 工具函数 ====================

function extractDimensions(variants) {
    if (!variants || variants.length === 0) return [];
    const keys = Object.keys(variants[0]);
    return keys.filter(k => !['skuId', 'price', 'stock', 'displayStock', 'originalStock'].includes(k));
}

function matchSku() {
    if (!appState.product) return null;
    const { variants } = appState.product;
    const selections = appState.selectedVariants;
    
    return variants.find(v => {
        return appState.dimensions.every(dim => v[dim] === selections[dim]);
    }) || null;
}

// ==================== 状态操作 ====================

function setProductId(productId) {
    appState.currentProductId = productId;
    appState.currentProductIndex = window.API.PRODUCT_IDS.indexOf(productId);
    if (appState.currentProductIndex === -1) appState.currentProductIndex = 0;
}

function getProductId() {
    return appState.currentProductId;
}

function getCurrentIndex() {
    return appState.currentProductIndex;
}

function getTotalProducts() {
    return window.API.PRODUCT_IDS.length;
}

function goToPrevProduct() {
    const ids = window.API.PRODUCT_IDS;
    const current = appState.currentProductIndex;
    const prev = current === 0 ? ids.length - 1 : current - 1;
    return ids[prev];
}

function goToNextProduct() {
    const ids = window.API.PRODUCT_IDS;
    const current = appState.currentProductIndex;
    const next = current === ids.length - 1 ? 0 : current + 1;
    return ids[next];
}

function initProduct(productData) {
    appState.product = productData;
    appState.dimensions = extractDimensions(productData.variants);
    
    const firstVariant = productData.variants[0];
    appState.dimensions.forEach(dim => {
        appState.selectedVariants[dim] = firstVariant[dim];
    });
    
    appState.currentSku = matchSku();
    appState.currentSkuId = appState.currentSku ? appState.currentSku.skuId : '';
    
    if (appState.currentSku && appState.currentSku.displayStock === 0) {
        appState.pageState = 'OUT_OF_STOCK';
    } else {
        appState.pageState = 'SUCCESS';
    }
    
    appState.quantity = 1;
}

function setVariant(dimension, value) {
    appState.selectedVariants[dimension] = value;
    appState.currentSku = matchSku();
    appState.currentSkuId = appState.currentSku ? appState.currentSku.skuId : '';
    
    if (appState.currentSku) {
        if (appState.currentSku.displayStock === 0) {
            appState.pageState = 'OUT_OF_STOCK';
        } else if (appState.pageState === 'OUT_OF_STOCK') {
            appState.pageState = 'SUCCESS';
        }
        appState.quantity = 1;
    }
}

function setQuantity(q) {
    if (!appState.currentSku) return;
    const max = appState.currentSku.displayStock;  // 使用实时库存
    appState.quantity = Math.max(1, Math.min(q, max));
}

function incrementQuantity() {
    setQuantity(appState.quantity + 1);
}

function decrementQuantity() {
    setQuantity(appState.quantity - 1);
}

function setPageState(newState) {
    appState.pageState = newState;
}

function setErrorMessage(msg) {
    appState.errorMessage = msg;
}

function setCartCount(count) {
    appState.cartCount = count;
}

function setAddFeedback(msg, isSuccess) {
    appState.addFeedback = msg;
    appState.pageState = isSuccess ? 'ADD_SUCCESS' : 'ADD_FAILURE';
}


function refreshProduct(productData) {
    if (appState.product && productData.variants) {
        appState.product.variants = productData.variants;
        appState.currentSku = matchSku();
        if (appState.currentSku) {
            appState.currentSkuId = appState.currentSku.skuId;
        }
    }
}

function getState() {
    return appState;
}

// ==================== 导出 ====================

window.State = {
    setProductId,
    getProductId,
    getCurrentIndex,
    getTotalProducts,
    goToPrevProduct,
    goToNextProduct,
    initProduct,
    refreshProduct, 
    setVariant,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    setPageState,
    setErrorMessage,
    setCartCount,
    setAddFeedback,
    getState
};