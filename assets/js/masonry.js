(function() {
  'use strict';
  
  function initMasonry() {
    var grids = document.querySelectorAll(".post-grid, .image-grid");
    
    grids.forEach(function(grid) {
      if (grid.classList.contains('masonry-ready')) return;
      
      var itemSelector = grid.classList.contains('post-grid') ? '.post-tile' : '.image-tile';
      
      imagesLoaded(grid, function() {
        new Masonry(grid, {
          itemSelector: itemSelector,
          columnWidth: ".grid-sizer",
          gutter: ".gutter-sizer",
          percentPosition: true
        });
        
        grid.classList.add('masonry-ready');
      });
    });
  }
  
  var hyPushState = document.querySelector('hy-push-state');
  if (hyPushState) {
    hyPushState.addEventListener('after', initMasonry);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMasonry);
  } else {
    initMasonry();
  }
})();