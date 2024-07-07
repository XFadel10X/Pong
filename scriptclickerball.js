document.addEventListener('DOMContentLoaded', () => {
    const counter = document.getElementById('counter');
    const image = document.getElementById('clickable-image');
    
    image.addEventListener('click', () => {
        let count = parseInt(counter.textContent);
        count += 1;
        counter.textContent = count;
    });
});
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 200) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
