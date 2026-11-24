'use strict';

const kitOptions = $('#kit-options');
const kitBudget = $('#kit-budget');
const addCustom = $('#add-custom');
const compareButton = $('#compare-products');
const clearShortlist = $('#clear-shortlist');

const specifications = {
  cup: ['Glazed ceramic', 'Coffee or tea', 'Includes a saucer'],
  journal: ['Linen cover and paper', 'Planning and note-taking', 'A5 dotted pages'],
  candle: ['Amber glass and scented wax', 'Evening ambience', 'Cedar and orange'],
  bottle: ['Insulated stainless steel', 'Hydration on the move', 'Loop carry lid'],
  pillow: ['Moss-green linen', 'Quiet breaks', 'Soft eye cushion'],
  tray: ['Glazed ceramic', 'Burning stick incense', 'Channel catches ash']
};

function addKit(ids) {
  for (const id of ids) changeQuantity(id, 1);
  syncBag();
  showBag();
}

kitOptions.innerHTML = products.map(product => `
  <label class="kit-choice">
    <input type="checkbox" value="${product.id}">
    ${image(product, '', '')}
    <span>${product.name}<small>${money(product.price)}</small></span>
  </label>`).join('');

function selectedKit() {
  return [...kitOptions.querySelectorAll('input:checked')].map(input => input.value);
}

function updateKit() {
  const ids = selectedKit();
  const total = ids.reduce((sum, id) => sum + find(id).price, 0);
  const budget = Number(kitBudget.value);
  const remainder = budget - total;
  const meter = $('#budget-meter');

  meter.max = budget;
  meter.value = total;
  meter.classList.toggle('over-budget', remainder < 0);
  $('#budget-summary').textContent = `${ids.length}/3 selected · ${money(total)} total · ${remainder < 0 ? money(-remainder) + ' over budget' : money(remainder) + ' left'}`;
  addCustom.disabled = ids.length !== 3;
  for (const input of kitOptions.querySelectorAll('input')) {
    input.disabled = ids.length >= 3 && !input.checked;
  }
}

kitOptions.addEventListener('change', updateKit);
kitBudget.addEventListener('change', updateKit);
addCustom.addEventListener('click', () => {
  const ids = selectedKit();
  if (ids.length === 3) addKit(ids);
});

$('#finder-form').addEventListener('submit', event => {
  event.preventDefault();
  const goal = $('#goal').value;
  const anchor = $('#anchor').value;
  const ritual = rituals[goal];
  const ids = [...new Set([anchor, ...ritual.items])].slice(0, 3);

  for (const input of kitOptions.querySelectorAll('input')) {
    input.checked = ids.includes(input.value);
  }
  updateKit();

  const result = $('#finder-result');
  result.hidden = false;
  result.textContent = `${ritual.name}, with ${find(anchor).name} as your starting point. Your picks are ready in the kit builder.`;
  const link = document.createElement('a');
  link.href = '#custom-kit';
  link.textContent = 'Review my picks';
  result.append(' ', link);
});

function updateShortlist() {
  const names = [...shortlist].map(id => find(id).name);
  $('#compare-summary').textContent = names.length
    ? `${names.length}/3 saved · ${names.join(' · ')}`
    : 'Shortlist up to three products to compare them.';
  compareButton.disabled = names.length < 2;
  clearShortlist.hidden = !names.length;
  try {
    localStorage.setItem(shortlistKey, JSON.stringify([...shortlist]));
  } catch {
    // Keep the shortlist in memory.
  }
}

function toggleShortlist(product, button) {
  const wasSaved = shortlist.has(product.id);
  if (!wasSaved && shortlist.size >= 3) {
    notify('Your shortlist is full. Remove a product to make room.');
    return;
  }
  if (wasSaved) shortlist.delete(product.id);
  else shortlist.add(product.id);

  button.setAttribute('aria-pressed', String(!wasSaved));
  button.textContent = wasSaved ? '♡ Shortlist' : '♥ Shortlisted';
  updateShortlist();
  if (!wasSaved && shortlist.size === 2) notify('Two products saved. Your comparison is ready.');
}

clearShortlist.addEventListener('click', () => {
  shortlist.clear();
  renderProducts();
  updateShortlist();
  $('#search').focus();
});
compareButton.addEventListener('click', () => {
  const items = [...shortlist].map(find);
  if (items.length < 2) return;
  showDialog('Compare products', `
    <div class="comparison-scroll" tabindex="0" role="region" aria-label="Product comparison table">
    <table class="comparison">
      <thead><tr><td></td>${items.map(item => `<th scope="col">${image(item, '', '')}${item.name}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><th scope="row">Price</th>${items.map(item => `<td>${money(item.price)}</td>`).join('')}</tr>
        ${['Material', 'Use', 'Detail'].map((label, index) => `<tr><th scope="row">${label}</th>${items.map(item => `<td>${specifications[item.id][index]}</td>`).join('')}</tr>`).join('')}
        <tr><th scope="row">Shop</th>${items.map(item => `<td><button class="button outline" data-action="add" data-id="${item.id}" aria-label="Add ${item.name} to bag">Add to bag</button></td>`).join('')}</tr>
      </tbody>
    </table></div>`);
  dialog.classList.add('wide');
});
dialog.addEventListener('close', () => dialog.classList.remove('wide'));
updateKit();
updateShortlist();
