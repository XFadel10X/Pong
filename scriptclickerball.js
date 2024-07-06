document.addEventListener('DOMContentLoaded', () => {
    const counter = document.getElementById('counter');
    const image = document.getElementById('clickable-image');
    
    image.addEventListener('click', () => {
        let count = parseInt(counter.textContent);
        count += 1;
        counter.textContent = count;
    });
});
