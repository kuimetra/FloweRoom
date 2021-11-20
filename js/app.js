function incrementCartAmount() {
    let i = parseInt(document.getElementById('amount').innerHTML, 10);
    i = isNaN(i) ? 0 : i;
    if (i < 999) {
        i++;
    }
    document.getElementById('amount').innerHTML = i;
}