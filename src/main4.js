



const _h = (i) => Math.floor(Math.random() * 50) + 25;
const createItem = (i) => ({ height: _h(i), text: `item ${i}` });

class BigList {
  constructor(el, size) {
    this.el = el;
    this.container = document.createElement('div');
    this.container.style.height = '400px';
    this.container.style.border = 'solid 1px blue';
    this.container.style.overflow = 'auto';
    this.el.appendChild(this.container);
    this.items = new Array(size).fill(true).map((e, i) => createItem(i)).reverse();

    this.renderFirst = 0;
    this.renderCount = 0;
    this.visibleFirst = 0;
    this.visibleCount = 0;
  }

  computeVisibleElements() {
    const lastVisible = this.items.length - 1;

  }

  render() {
    const curScroll = this.el.scrollTop;
    const curHeight = this.el.scrollHeight;



    const list = this.items.map((el, i) => {
      return `<div class="item" style="height: ${el.height}px;">${el.text}</div>`;
    });

    this.container.innerHTML = list.join('');


    const delta = this.container.scrollHeight - curHeight;
    this.container.scrollTop += delta;
  }

  scrollToBottom() {
    this.container.scrollTop += this.container.scrollHeight;
  }


  prependElemenet() {
    this.items.unshift(createItem(this.items.length));
  }

}


const list = new BigList(document.getElementById('container'), 10);
list.render();
list.scrollToBottom();

const btn = document.getElementById('add');
btn.addEventListener('click', (e) => {
  list.prependElemenet();
  list.render();
});