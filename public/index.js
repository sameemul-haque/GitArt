const squares = document.querySelector('.squares');
for (var i = 1; i < 365; i++) {
  const level = 0;  
  squares.insertAdjacentHTML('beforeend', `<li data-level="${level}"></li>`);
}