// ==================== 固定商品数据库（每个 SKU 独立图片）====================

const PRODUCT_DB = {
    "P001": {
        productId: "P001",
        name: "无线降噪耳机 Pro",
        description: "主动降噪，40小时续航，蓝牙5.3，支持多设备连接。航空级铝合金外壳，记忆海绵耳罩，佩戴舒适。",
        images: {
            "Q89734": "images/headphones-black.jpg",   // 曜石黑
            "Q89750": "images/headphones-white.jpg"    // 冰川白
        },
        variants: [
            { skuId: "Q89734", color: "曜石黑", price: 358, stock: 12 },
            { skuId: "Q89750", color: "冰川白", price: 358, stock: 15 }
        ]
    },
    "P002": {
        productId: "P002",
        name: "医用专业听诊器",
        description: "不锈钢胸件，PVC软管，高灵敏度膜片。符合医疗器械标准，适用于心肺音听诊。",
        images: {
            "D09323": "images/stethoscope-single.jpg", // 单用
            "D08524": "images/stethoscope-dual.jpg"    // 双用
        },
        variants: [
            { skuId: "D09323", color: "单用听诊器", price: 6, stock: 89 },
            { skuId: "D08524", color: "双用听诊器", price: 8, stock: 76 }
        ]
    },
    "P003": {
        productId: "P003",
        name: "羊毛保暖围巾",
        description: "100%澳洲美利奴羊毛，手工编织，柔软亲肤不扎颈。冬季必备单品，送礼自用两相宜。",
        images: {
            "W21984": "images/scarf-red.jpg",     // 大红色
            "W21980": "images/scarf-khaki.jpg",   // 卡其色
            "W21991": "images/scarf-black.jpg",   // 纯黑色
            "W21979": "images/scarf-white.jpg"   // 纯白色
        },
        variants: [
            { skuId: "W21984", color: "大红色", price: 48, stock: 23 },
            { skuId: "W21980", color: "卡其色", price: 42, stock: 25 },
            { skuId: "W21991", color: "纯黑色", price: 42, stock: 19 },
            { skuId: "W21979", color: "纯白色", price: 42, stock: 11 }
        ]
    },
    "P004": {
        productId: "P004",
        name: "简约单肩手提包",
        description: "头层牛皮，YKK拉链，多隔层设计。可容纳13寸笔记本，通勤出差百搭款。",
        images: {
            "B11256": "images/bag-black.jpg",   // 黑色
            "B11247": "images/bag-silver.jpg"  // 银色
        },
        variants: [
            { skuId: "B11256", color: "黑色", price: 1326, stock: 2 },
            { skuId: "B11247", color: "银色", price: 1326, stock: 5 }
        ]
    }
};

// 商品 ID 顺序（用于左右切换）
const PRODUCT_IDS = ["P001", "P002", "P003", "P004"];

// ==================== 购物车数据库 ====================

const CART_DB = {
    items: {},       // key: skuId, value: 已加购数量
    totalCount: 0
};

// ==================== 工具函数 ====================

function mockDelay(min, max) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ==================== 库存查询（前端实时计算用）====================

/**
 * 获取 SKU 的实时可用库存 = 总库存 - 购物车已占用
 */
function getAvailableStock(skuId) {
    // 找到该 SKU 所属商品
    for (const pid of PRODUCT_IDS) {
        const product = PRODUCT_DB[pid];
        const sku = product.variants.find(v => v.skuId === skuId);
        if (sku) {
            const inCart = CART_DB.items[skuId] || 0;
            return {
                skuId: skuId,
                totalStock: sku.stock,
                inCart: inCart,
                available: sku.stock - inCart
            };
        }
    }
    return null;
}

/**
 * 获取当前 SKU 对应的图片路径
 */
function getSkuImage(productId, skuId) {
    const product = PRODUCT_DB[productId];
    if (!product || !product.images) return "";
    return product.images[skuId] || "";
}

// ==================== API 函数 ====================

function getProductDetail(productId) {
    return new Promise(async (resolve) => {
        await mockDelay(150, 400);
        
        if (!productId || typeof productId !== 'string') {
            resolve({ success: false, message: 'Invalid productId' });
            return;
        }
        
        const product = PRODUCT_DB[productId.trim()];
        if (!product) {
            resolve({ success: false, message: 'Product not found' });
            return;
        }
        
        // 深拷贝，但图片保持引用（字符串无所谓）
        const cloned = deepClone(product);
        
        // 附加实时库存信息到每个 variant
        cloned.variants = cloned.variants.map(v => {
            const stockInfo = getAvailableStock(v.skuId);
            return {
                ...v,
                // 前端展示用实时库存
                displayStock: stockInfo.available,
                originalStock: v.stock
            };
        });
        
        resolve({ success: true, data: cloned });
    });
}

function addToCart({ productId, skuId, quantity }) {
    return new Promise(async (resolve) => {
        await mockDelay(200, 600);
        
        if (!productId || !skuId || !Number.isInteger(quantity) || quantity < 1) {
            resolve({ success: false, message: 'Invalid parameters' });
            return;
        }
        
        const product = PRODUCT_DB[productId];
        if (!product) {
            resolve({ success: false, message: 'Product not found' });
            return;
        }
        
        const sku = product.variants.find(v => v.skuId === skuId);
        if (!sku) {
            resolve({ success: false, message: 'Invalid SKU' });
            return;
        }
        
        // 实时库存校验（关键：用原始库存减去购物车已占用）
        const alreadyInCart = CART_DB.items[skuId] || 0;
        const available = sku.stock - alreadyInCart;
        
        if (quantity > available) {
            resolve({ success: false, message: 'Insufficient stock' });
            return;
        }
        
        // 更新购物车
        CART_DB.items[skuId] = (CART_DB.items[skuId] || 0) + quantity;
        CART_DB.totalCount += quantity;
        
        resolve({
            success: true,
            cartCount: CART_DB.totalCount
        });
    });
}

function getProductList() {
    return new Promise(async (resolve) => {
        await mockDelay(50, 150);
        const list = PRODUCT_IDS.map(id => ({
            productId: id,
            name: PRODUCT_DB[id].name
        }));
        resolve({ success: true, data: list });
    });
}

// ==================== 导出 ====================

window.API = {
    getProductDetail,
    addToCart,
    getProductList,
    getAvailableStock,
    getSkuImage,
    PRODUCT_IDS,
    CART_DB  // 暴露供调试，生产环境应隐藏
};
