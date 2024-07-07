document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 200) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
