const cartBackground = document.querySelector('.cart_background_fade');
const cartContainer = document.querySelector('.cart_container');
const cartList = document.querySelector('.cart_list');
const shopAllList = document.querySelector('.shop_grid');
const numberOfItemsInCart = document.getElementById('amount');
const subtotalPrice = document.getElementById('subtotal_price');
const discountAmount = document.getElementById('discount_price');
const shippingPrice = document.getElementById('shipping_price');
const orderTotalPrice = document.getElementById('order_total_price');
const promoCodeFormInput = document.getElementById('promo_code_value');
const zipCodeFormInput = document.getElementById('zip_code_value');

let cartItemID = 1;
let itemAmount = 1;
let orderId = 1;
let promoCodes, zipCodes;
let orderZip, orderPromo, bouquetDiscount, shippingDiscount, deliveryPrice;

function validatePromo() {
    promoCodeFormInput.style.borderColor = "var(--blue)";
    let promoCodeInput = document.getElementById('promo_code_value').value.trim().toLowerCase();
    bouquetDiscount = promoCodes.filter(item => item.promo_code.toLowerCase() === promoCodeInput).map(item => item.bouquets_discount)[0];
    shippingDiscount = promoCodes.filter(item => item.promo_code.toLowerCase() === promoCodeInput).map(item => item.shipping_discount)[0];
    if (!Boolean(bouquetDiscount) && !Boolean(shippingDiscount)) {
        promoCodeFormInput.style.borderColor = "var(--brightPink)";
        orderPromo = undefined;
    } else {
        orderPromo = promoCodeInput;
    }
    updateCartInfo();
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

function validateZip() {
    zipCodeFormInput.style.borderColor = "var(--blue)";
    let zipCodeInput = document.getElementById('zip_code_value').value.trim();
    if (isNumeric(zipCodeInput)) {
        deliveryPrice = zipCodes.filter(item => item.zip_code === zipCodeInput).map(item => item.delivery_price)[0];
    }
    if (!Boolean(deliveryPrice) || !isNumeric(zipCodeInput)) {
        zipCodeFormInput.style.borderColor = "var(--brightPink)";
        deliveryPrice = undefined;
        orderZip = undefined;
    } else {
        orderZip = zipCodeInput;
    }
    updateCartInfo();
}

eventListeners();

function eventListeners() {
    window.addEventListener('DOMContentLoaded', () => {
        loadJSON();
        loadCart();
        loadPromoCodes();
        loadZipCodes();
    });

    // show cart container
    document.getElementById('cart_area').addEventListener('click', () => {
        cartContainer.classList.toggle('show_container');
        cartBackground.classList.toggle('show_container');
        $("body").addClass("prevent_scrolling");
    });

    // hide cart container by clicking close button
    document.getElementById('cart_close_btn').addEventListener('click', () => {
        $(cartContainer).removeClass('show_container');
        $(cartBackground).removeClass('show_container');
        $("body").removeClass("prevent_scrolling");
    });

    // hide cart container by clicking continue button
    document.getElementById('continue_btn').addEventListener('click', () => {
        $(cartContainer).removeClass('show_container');
        $(cartBackground).removeClass('show_container');
        $("body").removeClass("prevent_scrolling");
    });

    // hide cart container by clicking outside the div, on the backdrop
    document.querySelector('.cart_background_fade').addEventListener('click', function (e) {
        if (e.target === e.currentTarget) {
            document.getElementById('cart_close_btn').click();
        }
    });

    // add to cart
    shopAllList.addEventListener('click', purchaseBouquet);

    // delete/decrement/increment item
    cartList.addEventListener('click', deleteBouquet);
    cartList.addEventListener('click', decrementBouquet);
    cartList.addEventListener('click', incrementBouquet);

    // save order info to local storage by clicking proceed to checkout button
    document.getElementById('proceed_to_checkout_btn').addEventListener('click', saveOrderInStorage);
}

function updateCartInfo() {
    let cartInfo = calculateAmountAndPrice();
    numberOfItemsInCart.textContent = cartInfo.bouquetsCount.toString();
    subtotalPrice.textContent = "$" + cartInfo.total;
    discountAmount.textContent = "$" + cartInfo.discount;
    shippingPrice.textContent = "$" + cartInfo.shipping;
    orderTotalPrice.textContent = "$" + cartInfo.orderTotal;
}

function loadJSON() {
    fetch('data/bouquets.json')
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(bouquet => {
                html += `
            <div class="shop_item" data-id="${cartItemID}">
                <div class="bouquet_image">
                    <img class="bouquet_img" src="${bouquet.imgSrc}" alt="${bouquet.imgAlt}"
                         width="261" height="327">
                    <button type="button" class="add_to_cart_btn">
                        <i class="add_to_cart_img"></i>Add to cart
                    </button>
                </div>
                <div class="bouquet_info">
                    <p class="bouquet_name">${bouquet.name}</p>
                    <div class="bouquet_price">
                        <p class="price">$${bouquet.price}</p>
                    </div>
                </div>
            </div>
        `;
                cartItemID++;
            });
            shopAllList.innerHTML = html;
        })
        .catch(() => {
            alert(`Failed to load product list`);
        })
}

function loadPromoCodes() {
    $.getJSON('data/promo_codes.json', function (responseObject) {
        promoCodes = responseObject;
    })
}

function loadZipCodes() {
    $.getJSON('data/zip_codes.json', function (responseObject) {
        zipCodes = responseObject;
    })
}

function loadCart() {
    let bouquets = getBouquetFromStorage();
    bouquets.forEach(bouquets => addToCartList(bouquets));
    updateCartInfo();
}

function calculateAmountAndPrice() {
    let bouquets = getBouquetFromStorage();
    if (!bouquets.length) {
        if ($('.show_container').is(':visible')) {
            document.getElementById('cart_close_btn').click();
        }
    }
    let totalAmount = bouquets.reduce((acc, bouquet) => {
        return acc += bouquet.amount;
    }, 0);

    let totalPrice = bouquets.reduce((acc, bouquet) => {
        let price = parseFloat(bouquet.price.substr(1)) * bouquet.amount;
        return acc += price;
    }, 0);

    let discount = 0;
    if (typeof bouquetDiscount !== "undefined") {
        discount = totalPrice * (bouquetDiscount / 100);
    }

    let shipping = 0;
    if (typeof deliveryPrice !== "undefined") {
        if (typeof shippingDiscount !== "undefined" && shippingDiscount !== 0) {
            shipping = deliveryPrice - (deliveryPrice * shippingDiscount) / 100;
        } else {
            shipping = deliveryPrice;
        }
    }
    let orderTotal = totalPrice - discount + shipping;
    return {
        bouquetsCount: totalAmount,
        total: totalPrice.toFixed(2),
        discount: discount.toFixed(2),
        shipping: shipping.toFixed(2),
        orderTotal: orderTotal.toFixed(2),
    }
}

function purchaseBouquet(e) {
    if (e.target.classList.contains('add_to_cart_btn')) {
        let bouquet = e.target.parentElement.parentElement;
        getBouquetInfo(bouquet);
        if (!$('.show_container').is(':visible')) {
            document.getElementById('cart_area').click();
        }
    }
}

function getBouquetInfo(bouquet) {
    let bouquets = getBouquetFromStorage();
    let bouquetAlreadyExists = bouquets.some(e => e.id === bouquet.getAttribute("data-id"));
    if (bouquetAlreadyExists) {
        let obj = bouquets.find(e => e.id === bouquet.getAttribute("data-id"))
        if (obj.amount < 50) {
            obj.amount++;
            document.querySelector(`[data-id="${obj.id}"] input.product_quantity`).value = obj.amount;
            updateBouquetInStorage(bouquets);
        }
    } else {
        let bouquetInfo = {
            id: bouquet.getAttribute("data-id"),
            amount: itemAmount,
            imgSrc: bouquet.querySelector('.bouquet_image img').src,
            name: bouquet.querySelector('.bouquet_name').textContent,
            price: bouquet.querySelector('.price').textContent
        }
        addToCartList(bouquetInfo);
        saveBouquetInStorage(bouquetInfo);
    }
}

function addToCartList(bouquet) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart_item');
    cartItem.setAttribute('data-id', `${bouquet.id}`);
    cartItem.innerHTML = `
        <img src=${bouquet.imgSrc} alt="Bouquet image">
        <div class="cart_item_info">
            <h3 class="cart_item_name">${bouquet.name}</h3>
            <div class="cart_item_amount">
                <div class="increment_decrement_counter">
                    <button class="reduce_amount"></button>
                    <input class="product_quantity" type="text" value="${bouquet.amount}"
                           readonly="readonly">
                    <button class="expand_amount"></button>
                </div>
                <button class="cart_item_del_btn"></button>
            </div>
            <span class="cart_item_price">${bouquet.price}</span>
        </div>
    `;
    cartList.appendChild(cartItem);
}

function saveBouquetInStorage(bouquet) {
    let bouquets = getBouquetFromStorage();
    bouquets.push(bouquet);
    localStorage.setItem('bouquets', JSON.stringify(bouquets));
    updateCartInfo();
}

function saveOrderInStorage() {
    let orderInfo = calculateAmountAndPrice();
    let orders = getOrdersFromStorage();
    if (orderInfo.bouquetsCount > 0 && Boolean(orderZip)) {
        console.log(Object.keys(orders).length);
        if (Object.keys(orders).length > 0) {
            orderId = orders[orders.length - 1].id;
            orderId++;
        }
        let order = {
            id: orderId,
            amount: orderInfo.bouquetsCount,
            zip: orderZip,
            promoCode: orderPromo,
            subtotalPrice: parseFloat(orderInfo.total),
            discount: parseFloat(orderInfo.discount),
            shipping: parseFloat(orderInfo.shipping),
            orderTotalPrice: parseFloat(orderInfo.orderTotal)
        }
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        document.getElementById('promo_code_form').reset();
        promoCodeFormInput.style.borderColor = "var(--blue)";
        orderPromo = undefined;
        document.getElementById('zip_code_form').reset();
        zipCodeFormInput.style.borderColor = "var(--blue)";
        orderZip = undefined;
        bouquetDiscount = undefined;
        shippingDiscount = undefined;
        deliveryPrice = undefined;
        updateCartInfo();
    }
}

function getOrdersFromStorage() {
    return localStorage.getItem('orders') ? JSON.parse(localStorage.getItem('orders')) : [];
}

function updateBouquetInStorage(bouquets) {
    localStorage.setItem('bouquets', JSON.stringify(bouquets));
    updateCartInfo();
}

function getBouquetFromStorage() {
    return localStorage.getItem('bouquets') ? JSON.parse(localStorage.getItem('bouquets')) : [];
}

function deleteBouquet(e) {
    let cartItem = e.target.parentElement.parentElement.parentElement;
    if (e.target.className === "cart_item_del_btn") {
        cartItem.remove();
        cartItem.amount = 0;
        let bouquets = getBouquetFromStorage();
        let updatedBouquets = bouquets.filter(bouquet => {
            return bouquet.id !== cartItem.getAttribute("data-id");
        });
        localStorage.setItem('bouquets', JSON.stringify(updatedBouquets));
    }
    updateCartInfo();
}

function decrementBouquet(e) {
    let cartItem = e.target.parentElement.parentElement.parentElement;
    if (e.target.className === "reduce_amount") {
        let productQuantity = e.target.parentElement.querySelector(`input.product_quantity`).value;
        if (parseInt(productQuantity) <= 1) {
            cartItem.parentElement.remove();
            cartItem.parentElement.amount = 0;
            let bouquets = getBouquetFromStorage();
            let updatedBouquets = bouquets.filter(bouquet => {
                return bouquet.id !== cartItem.parentElement.getAttribute("data-id");
            });
            localStorage.setItem('bouquets', JSON.stringify(updatedBouquets));
        } else {
            e.target.parentElement.querySelector(`input.product_quantity`).value--;
            let bouquets = getBouquetFromStorage();
            bouquets.forEach(bouquet => {
                if (bouquet.id === cartItem.parentElement.getAttribute("data-id")) {
                    bouquet.amount--;
                }
            });
            localStorage.setItem('bouquets', JSON.stringify(bouquets));
        }
        updateCartInfo();
    }
}

function incrementBouquet(e) {
    let cartItem = e.target.parentElement.parentElement.parentElement;
    if (e.target.className === "expand_amount") {
        if (e.target.parentElement.querySelector(`input.product_quantity`).value < 50) {
            e.target.parentElement.querySelector(`input.product_quantity`).value++;
            let bouquets = getBouquetFromStorage();
            bouquets.forEach(bouquet => {
                if (bouquet.id === cartItem.parentElement.getAttribute("data-id")) {
                    bouquet.amount++;
                }
            });
            localStorage.setItem('bouquets', JSON.stringify(bouquets));
            updateCartInfo();
        }
    }
}