function alternateOverspendingColor() {
    var elements = document.getElementsByClassName('cautious');
    n = elements.length;
    for (var i = 0; i < n; i++) {
        var e = elements[i];
        if(e.textContent.substr(0, 1) == '-') {
            e.className = e.className + " credit-overspending";
        }
    }
}

function checkState() {
    var classes = document.body.classList;
    n = classes.length;
    loading = false;
    for (var i = 0; i < n; i++) {
        if (classes[i] == 'is-init-loading') {
            loading = true;
            break;
        }
    }
    if (!loading) {
        alternateOverspendingColor();
    } else {
        setTimeout(checkState, 50);
    }
}

setTimeout(checkState, 50);
