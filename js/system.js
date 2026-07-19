(function(){
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function(){
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive:true });
  }

  var hamburger = document.getElementById('navHamburger');
  var mobileMenu = document.getElementById('navMobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function(){
      var open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if (entry.isIntersecting){
          setTimeout(function(){ entry.target.classList.add('in'); }, i * 40);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  // graceful fallback for the self-hosted media clips: if the source 404s/401s,
  // swap the frame for a static CTA instead of showing a broken black box.
  document.querySelectorAll('video[data-fallback]').forEach(function(video){
    video.addEventListener('error', function(){
      var frame = video.closest('.media-frame');
      if (!frame) return;
      var fallback = document.createElement('div');
      fallback.className = 'media-fallback';
      fallback.innerHTML = video.getAttribute('data-fallback');
      frame.innerHTML = '';
      frame.appendChild(fallback);
    }, true);
  });
})();
