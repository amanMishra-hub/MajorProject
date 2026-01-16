// Category filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryItems = document.querySelectorAll('.category-item');
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    
    categoryItems.forEach(item => {
        const itemCategory = item.href.split('category=')[1];
        
        if (!currentCategory && item.href.endsWith('/listings')) {
            item.classList.add('active');
        } else if (itemCategory === currentCategory) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});
