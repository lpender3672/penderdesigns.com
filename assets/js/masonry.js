(function() {
  'use strict';
  
  function initMasonry() {
    var grid = document.querySelector(".project-grid");
    if (!grid) return;
    
    if (grid.classList.contains('masonry-ready')) {
      return;
    }
    
    imagesLoaded(grid, function() {
      console.log('Images loaded, initializing Masonry...');
      new Masonry(grid, {
        itemSelector: ".project-tile",
        columnWidth: ".grid-sizer",
        gutter: ".gutter-sizer",
        percentPosition: true
      });
      
      grid.classList.add('masonry-ready');
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