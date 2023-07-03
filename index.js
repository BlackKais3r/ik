let anim = document.getElementById('loader');
let anim_par = document.getElementById('loader-par');
anim.addEventListener('animationend', () => {
    anim_par.classList.add('pouf');
    
});