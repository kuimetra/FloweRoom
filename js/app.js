$(function () {
    $('.reduce_amount').click(decrease);
    $('.product_quantity').change(valueChange);
    $('.expand_amount').click(increase);
});

function decrease() {
    let value = $(this).parent().find('.product_quantity').val();
    if (value > 1) {
        value--;
        $(this).parent().find('.product_quantity').val(value);
    }
}

function valueChange() {
    let value = $(this).val();
    if (value === undefined || isNaN(value) === true || value <= 0) {
        $(this).val(1);
    } else if (value >= 101) {
        $(this).val(100);
    }
}

function increase() {
    let value = $(this).parent().find('.product_quantity').val();
    if (value < 100) {
        value++;
        $(this).parent().find('.product_quantity').val(value);
    }
}

const cartContainer = document.querySelector('.cart_container');
const shopAllList = document.querySelector('.shop_grid');
const cartList = document.querySelector('.cart_list');

// const cartContainer = document.querySelector('.reduce_amount');
// const shopAllList = document.querySelector('.product_quantity');
// const cartList = document.querySelector('.expand_amount');

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
        cartContainer.classList.toggle('show_cart_container');
    });

    // hide cart container
    document.getElementById('cart_close_btn').addEventListener('click', () => {
        cartContainer.classList.toggle('show_cart_container');
    });

    // add to cart
    shopAllList.addEventListener('click', purchaseBouquet);

    // delete from cart
    cartList.addEventListener('click', deleteBouquet);
}

// update cart info
function updateCartInfo() {
    let cartInfo = findCartInfo();
    numberOfItemsInCart.textContent = cartInfo.bouquetsCount;
    subtotalPrice.textContent = cartInfo.total;
}

function loadJSON() {
    fetch('bouquets.json')
        .then(response => response.json())
        .then(data => {
            let html = '';
            data.forEach(bouquet => {
                html += `
            <div class="shop_grid_item">
                <div class="bouquet_image">
                    <img class="bouquet_img" src="${bouquet.imgSrc}" alt="${bouquet.imgAlt}"
                         width="261" height="327">
                    <button type="button" class="add_to_cart_btn">
                        <img src="img/cart.svg" alt="Cart Icon" height="18" width="18">
                        <span class="add_to_cart_text">Add to cart</span>
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
            });
            shopAllList.innerHTML = html;
        })
        .catch(() => {
            alert(`Failed to load product list`);
        })
}

function purchaseBouquet(e) {
    if (e.target.classList.contains('add_to_cart_btn')) {
        let bouquet = e.target.parentElement.parentElement;
        getBouquetInfo(bouquet);
    }
}

// get product info after add to cart button click
function getBouquetInfo(bouquet) {
    let bouquetInfo = {
        id: cartItemID,
        amount: itemAmount,
        imgSrc: bouquet.querySelector('.bouquet_image img').src,
        name: bouquet.querySelector('.bouquet_name').textContent,
        price: bouquet.querySelector('.price').textContent
    }
    cartItemID++;
    addToCartList(bouquetInfo);
    saveBouquetInStorage(bouquetInfo);
}

// add the selected product to the cart list
function addToCartList(bouquet) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart_item');
    cartItem.setAttribute('data_id', `${bouquet.id}`);
    cartItem.innerHTML = `
        <img src=${bouquet.imgSrc} alt="Bouquet image">
        <div class="cart_item_info">
            <h3 class="cart_item_name">${bouquet.name}</h3>
            <div class="cart_item_amount">
                <div class="increment_decrement_counter">
                    <button class="reduce_amount"></button>
                    <input class="product_quantity" type="text" value="1"
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

// save the product in the local storage
function saveBouquetInStorage(item) {
    let bouquets = getBouquetFromStorage();
    bouquets.push(item);
    localStorage.setItem('bouquets', JSON.stringify(bouquets));
    updateCartInfo();
}

// get all the products info if there is any in the local storage
function getBouquetFromStorage() {
    return localStorage.getItem('bouquets') ? JSON.parse(localStorage.getItem('bouquets')) : [];
    // returns empty array if there isn't any product info
}

function loadCart() {
    let bouquets = getBouquetFromStorage();
    if (bouquets.length < 1) {
        cartItemID = 1; // if there is no any product in the local storage
    } else {
        console.log(bouquets);
        cartItemID = bouquets[bouquets.length - 1].id;
        cartItemID++;
        // else get the id of the last product and increase it by 1
    }
    bouquets.forEach(bouquets => addToCartList(bouquets));

    // calculate and update UI of cart info
    updateCartInfo();
}

// calculate total price of the cart and other info
function findCartInfo() {
    let bouquets = getBouquetFromStorage();
    let total = bouquets.reduce((acc, bouquet) => {
        let price = parseFloat(bouquet.price.substr(1));
        return acc += price;
    }, 0); // adding all the prices

    return {
        total: total.toFixed(2),
        bouquetsCount: bouquets.length
    }
}

function deleteBouquet(e) {
    let cartItem;
    if (e.target.className === "cart_item_del_btn") {
        cartItem = e.target.parentElement.parentElement.parentElement;
        cartItem.remove();
    }
    let bouquets = getBouquetFromStorage();
    let updatedBouquets = bouquets.filter(bouquet => {
        return bouquet.id !== parseInt(cartItem.getAttribute("data_id"));
    });
    localStorage.setItem('bouquets', JSON.stringify(updatedBouquets));
    updateCartInfo();
}
