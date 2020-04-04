import span from './span';

document.addEventListener('DOMContentLoaded', () => {
  document.body.insertBefore(span(), document.body.lastChild);
});
