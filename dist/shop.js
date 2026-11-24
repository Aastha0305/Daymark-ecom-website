'use strict';

const products = [
  { id: 'cup', name: 'First Light Cup', category: 'Drinkware', price: 890, tint: '#d8df9f', description: 'A ribbed ceramic cup with a butter-yellow saucer for the first sip of the day.' },
  { id: 'journal', name: 'Margin Journal', category: 'Desk', price: 650, tint: '#f8b697', description: 'A tangerine linen notebook with dotted pages for lists, loose ideas and small plans.' },
  { id: 'candle', name: 'Last Light Candle', category: 'Home', price: 990, tint: '#e0aaa7', description: 'An amber glass candle with a warm cedar and orange scent for slower evenings.' },
  { id: 'bottle', name: 'Loop Bottle', category: 'Drinkware', price: 1190, tint: '#a9c4e8', description: 'A cobalt insulated bottle with a loop lid for carrying from desk to doorway.' },
  { id: 'pillow', name: 'Still Eye Pillow', category: 'Home', price: 780, tint: '#b6c2ab', description: 'A soft moss-green linen eye pillow for taking a quiet five-minute break.' },
  { id: 'tray', name: 'Ember Tray', category: 'Home', price: 590, tint: '#f1d590', description: 'An ivory ceramic incense holder with a shallow channel to catch falling ash.' }
];

const rituals = {
  morning: { name: 'The Slow Start', items: ['cup', 'journal', 'candle'] },
  midday: { name: 'The Midday Reset', items: ['bottle', 'journal', 'pillow'] },
  evening: { name: 'The Wind Down', items: ['candle', 'pillow', 'tray'] }
};
const find = id => products.find(product => product.id === id);
const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const $ = selector => document.querySelector(selector);
const dialog = $('#overlay');
const dialogContent = $('#dialog-content');
const storageKey = 'daymark-bag-v1';
let bag = {};
let filter = 'All';
let moment = 'morning';
let toastTimer;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  for (const { id } of products) {
    if (Number.isSafeInteger(saved?.[id]) && saved[id] > 0) bag[id] = saved[id];
  }
} catch {
  // The storefront still works when browser storage is unavailable.
}

function image(product, className = '') {
  return `<img class="${className}" src="media/${product.id}.jpg" alt="${product.name}" style="--tint:${product.tint}" width="480" height="480">`;
}

function renderProducts() {
  const query = $('#search').value.trim().toLowerCase();
  const matches = products.filter(product =>
    (filter === 'All' || product.category === filter) &&
    [product.name, product.category, product.description].some(value => value.toLowerCase().includes(query))
  );
  $('#result-count').textContent = `${matches.length} products found`;
  $('#products').innerHTML = matches.map(product => `
    <article class="product">
      <button class="product-photo" data-action="detail" data-id="${product.id}" aria-label="View ${product.name}" style="--tint:${product.tint}">${image(product)}</button>
      <div class="product-info">
        <div><button class="product-name" data-action="detail" data-id="${product.id}">${product.name}</button><p>${product.category} · ${money(product.price)}</p></div>
        <button class="icon" data-action="add" data-id="${product.id}" aria-label="Add ${product.name} to bag">+</button>
      </div>
    </article>`).join('') || '<p>No matching products. Try a different search or category.</p>';
}

function renderRitual() {
  const ritual = rituals[moment];
  const items = ritual.items.map(find);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  $('#ritual').dataset.moment = moment;
  $('#ritual-result').innerHTML = `
    <div class="kit-images">${items.map(item => image(item)).join('')}</div>
    <div class="kit-bottom">
      <div><h3>${ritual.name}</h3><p>${items.map(item => item.name).join(' · ')}</p></div>
      <button class="button primary" data-action="kit">Add kit · ${money(total)}</button>
    </div>`;
}

function syncBag() {
  $('#bag-count').textContent = Object.values(bag).reduce((sum, qty) => sum + qty, 0);
  try {
    localStorage.setItem(storageKey, JSON.stringify(bag));
  } catch {
    // Keep the current bag available in memory.
  }
}

function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}

function changeQuantity(id, change) {
  const next = (bag[id] || 0) + change;
  if (next > 0) bag[id] = next;
  else delete bag[id];
}

function showDialog(title, contents, drawer = false) {
  dialog.classList.toggle('drawer', drawer);
  dialogContent.innerHTML = `<div class="dialog-body">
    <div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="icon" data-action="close" aria-label="Close" autofocus>×</button></div>
    ${contents}
  </div>`;
  if (!dialog.open) dialog.showModal();
}

function showBag(focus) {
  const items = products.filter(({ id }) => bag[id]);
  const total = items.reduce((sum, item) => sum + item.price * bag[item.id], 0);
  showDialog('Your bag', items.length ? `
    ${items.map(item => `<div class="item">${image(item)}
      <div><strong>${item.name}</strong><p>${money(item.price * bag[item.id])}</p></div>
      <div class="qty">
        <button data-action="minus" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button>
        <span>${bag[item.id]}</span>
        <button data-action="plus" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
      </div>
    </div>`).join('')}
    <div class="total"><strong>Subtotal</strong><strong>${money(total)}</strong></div>
    <button class="button primary" data-action="checkout">Try demo checkout</button>
    <p class="checkout-note">No payment or delivery details required.</p>`
    : '<p>Your bag is empty.</p><button class="button primary" data-action="close">Continue shopping</button>', true);
  if (focus) (dialog.querySelector(`[data-action="${focus.action}"][data-id="${focus.id}"]`) || dialog.querySelector('[data-action="close"]')).focus();
}

$('#search').addEventListener('input', renderProducts);
$('#filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  filter = button.dataset.filter;
  for (const option of $('#filters').querySelectorAll('button')) {
    option.setAttribute('aria-pressed', option === button);
  }
  renderProducts();
});
$('#moments').addEventListener('change', event => {
  moment = event.target.value;
  renderRitual();
});

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  const product = find(id);

  switch (action) {
    case 'detail':
      showDialog(product.name, `${image(product, 'dialog-photo')}<p>${product.description}</p>
        <button class="button primary" data-action="add" data-id="${id}">Add to bag · ${money(product.price)}</button>`);
      break;
    case 'add':
      changeQuantity(id, 1);
      syncBag();
      if (dialog.open) showBag({ action: 'plus', id });
      else notify(`${product.name} added to your bag`);
      break;
    case 'kit':
      for (const item of rituals[moment].items) changeQuantity(item, 1);
      syncBag();
      showBag();
      break;
    case 'plus':
    case 'minus':
      changeQuantity(id, action === 'plus' ? 1 : -1);
      syncBag();
      showBag({ action, id });
      break;
    case 'bag':
      showBag();
      break;
    case 'close':
      dialog.close();
      break;
    case 'checkout':
      bag = {};
      syncBag();
      showDialog('Demo order complete', '<p>You’ve finished the Daymark checkout demo.</p><button class="button primary" data-action="close">Back to the shop</button>', true);
      dialog.querySelector('[data-action="close"]').focus();
      break;
  }
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

renderProducts();
renderRitual();
syncBag();
