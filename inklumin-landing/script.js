// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
  e.preventDefault();

  const targetId = this.getAttribute('href');
  const targetElement = document.querySelector(targetId);

  window.scrollTo({
    top: targetElement.offsetTop - 80,
    behavior: 'smooth'
  });
});
});

// Tab functionality for features
const tabs = document.querySelectorAll('.function-tab');
const panes = document.querySelectorAll('.function-pane');

tabs.forEach(tab => {
tab.addEventListener('click', () => {
  // Remove active class from all tabs and panes
  tabs.forEach(t => t.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));

  // Add active class to clicked tab
  tab.classList.add('active');

  // Show corresponding pane
  const paneId = tab.getAttribute('data-tab') + '-pane';
  document.getElementById(paneId).classList.add('active');
});
});

// Header scroll effect
window.addEventListener('scroll', () => {
const header = document.querySelector('header');
if (window.scrollY > 100) {
  header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
  header.style.background = 'rgba(255, 255, 255, 0.98)';
} else {
  header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  header.style.background = 'rgba(255, 255, 255, 0.95)';
}
});

// Открытие и закрытие модального окна с изображением
const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const modalClose = document.getElementById('modal-close');
const aboutImage = document.querySelector('.about-image img');

aboutImage.addEventListener('click', () => {
  imageModal.style.display = 'flex';
  modalImg.src = aboutImage.src;
});

modalClose.addEventListener('click', () => {
  imageModal.style.display = 'none';
});

imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = 'none';
  }
});
