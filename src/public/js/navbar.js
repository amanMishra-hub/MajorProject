// Navbar search bar functionality
document.addEventListener('DOMContentLoaded', function() {
    // Hide search bar on home page
    const searchBar = document.getElementById('navSearchBar');
    if (searchBar && window.location.pathname === '/') {
        searchBar.style.display = 'none';
    }
    
    const searchCompact = document.getElementById('searchCompact');
    const searchExpanded = document.getElementById('searchExpanded');
    
    if (searchCompact && searchExpanded) {
        searchCompact.addEventListener('click', function() {
            searchCompact.style.display = 'none';
            searchExpanded.style.display = 'flex';
            searchExpanded.querySelector('input').focus();
        });
        
        // Click outside to collapse
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-btn-wrapper')) {
                searchCompact.style.display = 'flex';
                searchExpanded.style.display = 'none';
            }
        });
    }
});
