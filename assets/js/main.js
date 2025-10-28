
(function(){
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const open = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true':'false');
    });
  }

  // Timeline population if present
  const timeline = document.getElementById('timeline');
  if(timeline && window.BSWL_MILESTONES){
    window.BSWL_MILESTONES.forEach(item => {
      const div = document.createElement('div');
      div.className = 'mile';
      div.innerHTML = `<strong>${item.year}</strong><span>${item.text}</span>`;
      timeline.appendChild(div);
    });
  }
})();
