const makeNode = (value, prev, next) => {
  return {
    value,
    prev,
    next
  };
};

class LinkedList {
  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  add(val) {
    return this.addLast(val);
  }

  addFirst(val) {
    const node = makeNode(val, null, this._head);
    this._head = node;
    this._size++;

    if (!this._tail) this._tail = this._head;

    return val;
  }

  addLast(val) {
    const node = makeNode(val, null, null);

    if (!this._tail) {
      this._tail = this._head = node;
    } else {
      this._tail.next = node;
      node.prev = this._tail;
      this._tail = node;
    }

    this._size++;

    return val;
  }

  get first() {
    return this._head ? this._head.value : null;
  }

  get firstNode() {
    return this._head;
  }

  get last() {
    return this._tail ? this._tail.value : null;
  }

  get lastNode() {
    return this._tail;
  }

  get size() {
    return this._size;
  }

  _find(val) {
    const comp = typeof val === 'function' ? val : (a) => a === val;
    let cur = this._head;

    while (cur !== null) {
      if (comp(cur.value)) {
        return cur;
      }

      cur = cur.next;
    }

    return null;
  }

  find(val) {
    const el = this._find(val);

    return el ? el.value : null;
  }

  includes(node) {
    let cur = this._head;

    while (cur !== null) {
      if (cur === node) return true;
      cur = cur.next;
    }

    return false;
  }

  removeFirst() {
    if (!this._head) {
      return null;
    }

    const el = this._head;
    this._head = this._head.next;
    this._size--;

    if (!this._head) {
      this._tail = null;
    }

    return el.value;
  }

  removeLast() {
    if (!this._head) {
      return null;
    }

    const el = this._tail;
    this._tail = this._tail.prev;
    this._size--;

    if (!this._tail) {
      this._head = null;
    }

    return el.value;
  }

  removeNode(node) {
    if (!node || !this.includes(node)) {
      return null;
    }

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this._head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this._tail = node.prev;
    }

    this._size--;

    return node;
  }

  remove(val) {
    const el = this._find(val);

    if (!el) {
      return null;
    }

    if (el.prev) {
      el.prev.next = el.next;
    } else {
      this._head = el.next;
    }

    if (el.next) {
      el.next.prev = el.prev;
    } else {
      this._tail = el.prev;
    }

    this._size--;

    return el.value;
  }

  toString() {
    let cur = this._head;
    const res = [];

    while (cur !== null) {
      res.push(cur.value);
      cur = cur.next;
    }

    return res.join(' <--> ');
  }
}



let list = new LinkedList();

list.addLast(1);
list.addLast(2);
list.addLast(3);
list.addLast(4);

debugger;

console.log(list);