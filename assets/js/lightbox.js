(function() {
  'use strict';
  
  function initLightbox() {
    if (typeof GLightbox === 'undefined') return;
    
    var contentImages = document.querySelectorAll('.markdown-body img, .content img, article img');
    contentImages.forEach(function(img) {
      if (img.parentElement.tagName === 'A') return;
      
      var link = document.createElement('a');
      link.href = img.src;
      link.className = 'glightbox';
      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
    });
    
    var lightboxLinks = document.querySelectorAll('.glightbox');
    lightboxLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    
    var lightbox = GLightbox({ selector: '.glightbox' });
    
    document.addEventListener('click', function(e) {
      var nextBtn = e.target.closest('.gnext');
      var prevBtn = e.target.closest('.gprev');
      
      if (nextBtn || prevBtn) {
        setTimeout(function() {
          var activeSlide = document.querySelector('.gslide.current');
          if (activeSlide) {
            var activeImg = activeSlide.querySelector('img');
            if (activeImg) {
              var activeLink = Array.from(lightboxLinks).find(function(link) {
                return link.href === activeImg.src;
              });
              if (activeLink) {
                activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        }, 100);
      }
    });
  }
  
  var hyPushState = document.querySelector('hy-push-state');
  if (hyPushState) {
    hyPushState.addEventListener('after', initLightbox);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();