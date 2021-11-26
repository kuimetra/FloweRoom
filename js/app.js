const cartContainer = document.querySelector('.cart_container');
const cartBackground = document.querySelector('.background_fade');
const shopAllList = document.querySelector('.shop_grid');
const cartList = document.querySelector('.cart_list');
const subtotalPrice = document.getElementById('subtotal_price');
const numberOfItemsInCart = document.getElementById('amount');
let cartItemID = 1;
let itemAmount = 1;

eventListeners();

function eventListeners() {
    window.addEventListener('DOMContentLoaded', () => {
        loadJSON();
        loadCart();
    });

    // show cart container
    document.getElementById('cart_area').addEventListener('click', () => {
        cartContainer.classList.toggle('show_container');
        cartBackground.classList.toggle('show_container');
        $("body").addClass("prevent_scrolling");
    });

    // hide cart container by clicking the close button
    document.getElementById('cart_close_btn').addEventListener('click', () => {
        $(cartContainer).removeClass('show_container');
        $(cartBackground).removeClass('show_container');
        $("body").removeClass("prevent_scrolling");
    });

    // hide cart container by clicking outside the div, on the backdrop
    document.querySelector('.background_fade').addEventListener('click', function (e) {
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
}

function updateCartInfo() {
    let cartInfo = calculateAmountAndPrice();
    subtotalPrice.textContent = "$" + cartInfo.total;
    numberOfItemsInCart.textContent = cartInfo.bouquetsCount.toString();
}

function loadJSON() {
    fetch('bouquets.json')
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

    let totalPrice = bouquets.reduce((acc, bouquet) => {
        let price = parseFloat(bouquet.price.substr(1)) * bouquet.amount;
        return acc += price;
    }, 0);

    let totalAmount = bouquets.reduce((acc, bouquet) => {
        return acc += bouquet.amount;
    }, 0);

    return {
        total: totalPrice.toFixed(2),
        bouquetsCount: totalAmount
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