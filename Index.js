"use strict";

/**
 * ============================================================
 * DSA PRACTICE LIB (JavaScript)
 * ------------------------------------------------------------
 * Purpose:
 *  - Implement core data structures (array wrapper, linked lists)
 *  - Practice common interview patterns (hash map, two pointers)
 *  - Practice recursion + graph traversal with cycle handling
 *
 * Style goals:
 *  - Clear contracts (what each function returns)
 *  - Explicit edge cases
 *  - Complexity notes (Big-O)
 * ============================================================
 */

/* ============================================================
 * 1) Small Utilities
 * ============================================================ */

/**
 * Finds a student name in a list of students.
 *
 * @param {string[]} students
 * @param {string} student
 * @returns {string|undefined} matched string or undefined
 *
 * Time: O(n)
 * Space: O(1)
 */
function findStudent(students, student) {
  if (!Array.isArray(students)) return undefined;
  if (typeof student !== "string") return undefined;
  return students.find((s) => s === student);
}

/**
 * Checks if a word is a palindrome.
 *
 * @param {string} word
 * @returns {boolean}
 *
 * Time: O(n)
 * Space: O(n)
 */
function isPalindrome(word) {
  if (typeof word !== "string") return false;
  return [...word].reverse().join("") === word;
}

/**
 * Title-cases a phrase: "hello world" -> "Hello World"
 *
 * @param {string} phrase
 * @returns {string}
 *
 * Time: O(n) over characters
 * Space: O(n)
 */
function toTitleCase(phrase) {
  if (typeof phrase !== "string") return "";
  return phrase
    .split(" ")
    .map((word) => {
      if (!word) return "";
      const [first, ...rest] = word;
      return first.toUpperCase() + rest.join("");
    })
    .join(" ");
}

/**
 * Chunk an array into sub-arrays of a given size.
 *
 * @param {any[]} array
 * @param {number} size
 * @returns {any[][]}
 *
 * Time: O(n)
 * Space: O(n)
 */
function chunk(array, size) {
  if (!Array.isArray(array) || typeof size !== "number" || size <= 0) return [];
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

/**
 * Two Sum using a hash map (value -> index).
 *
 * @param {number[]} nums
 * @param {number} target
 * @returns {[number, number] | undefined}
 *
 * Time: O(n)
 * Space: O(n)
 */
function twoSum(nums, target) {
  if (!Array.isArray(nums) || typeof target !== "number") return undefined;

  const seen = Object.create(null);
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen[need] !== undefined) return [seen[need], i];
    seen[nums[i]] = i;
  }
  return undefined;
}

/**
 * Best Time to Buy and Sell Stock (max profit).
 *
 * @param {number[]} prices
 * @returns {number}
 *
 * Time: O(n)
 * Space: O(1)
 */
function maxProfit(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return 0;

  let minPrice = prices[0];
  let best = 0;

  for (let i = 1; i < prices.length; i++) {
    minPrice = Math.min(minPrice, prices[i]);
    best = Math.max(best, prices[i] - minPrice);
  }

  return best;
}

/* ============================================================
 * 2) Array Wrapper (Object-backed “Array-like”)
 * ============================================================ */

/**
 * Array-like structure backed by an object.
 * Useful to show how index storage + shifting works under the hood.
 */
class MyArray {
  constructor() {
    /** @type {number} */
    this.length = 0;

    /** @type {Record<number, any>} */
    this.data = {};
  }

  /**
   * @param {any} value
   * @returns {number} new length
   */
  push(value) {
    this.data[this.length] = value;
    this.length++;
    return this.length;
  }

  /**
   * @param {number} index
   * @returns {any}
   */
  get(index) {
    return this.data[index];
  }

  /**
   * @returns {any|undefined} removed item
   */
  pop() {
    if (this.length === 0) return undefined;

    const lastIndex = this.length - 1;
    const lastItem = this.data[lastIndex];
    delete this.data[lastIndex];
    this.length--;
    return lastItem;
  }

  /**
   * Removes the first element and shifts everything left by 1.
   *
   * Time: O(n)
   * Space: O(1) extra
   *
   * @returns {any|undefined}
   */
  shift() {
    if (this.length === 0) return undefined;

    const first = this.data[0];

    for (let i = 1; i < this.length; i++) {
      this.data[i - 1] = this.data[i];
    }

    delete this.data[this.length - 1];
    this.length--;
    return first;
  }

  /**
   * Deletes an item at a given index and shifts remaining items.
   *
   * NOTE: index 0 is valid, so we must NOT do `if (!index)`.
   *
   * Time: O(n)
   * Space: O(1)
   *
   * @param {number} index
   * @returns {any|undefined}
   */
  deleteByIndex(index) {
    if (typeof index !== "number") return undefined;
    if (index < 0 || index >= this.length) return undefined;

    const deleted = this.data[index];

    for (let i = index + 1; i < this.length; i++) {
      this.data[i - 1] = this.data[i];
    }

    delete this.data[this.length - 1];
    this.length--;
    return deleted;
  }

  /**
   * Debug helper.
   */
  print() {
    console.log({
      length: this.length,
      data: { ...this.data },
    });
  }
}

/* ============================================================
 * 3) Singly Linked List
 * ============================================================ */

/**
 * @template T
 */
class SLLNode {
  /**
   * @param {T} value
   */
  constructor(value) {
    this.value = value;
    /** @type {SLLNode<T> | null} */
    this.next = null;
  }
}

/**
 * Singly Linked List
 * Invariant:
 *  - length === number of nodes reachable from head
 *  - tail is either null (empty) or last node whose next is null
 *
 * @template T
 */
class SinglyLinkedList {
  /**
   * @param {T=} value
   */
  constructor(value) {
    /** @type {SLLNode<T> | null} */
    this.head = null;

    /** @type {SLLNode<T> | null} */
    this.tail = null;

    /** @type {number} */
    this.length = 0;

    if (value !== undefined) this.push(value);
  }

  getLength() {
    return this.length;
  }

  /**
   * Append value to tail.
   * Time: O(1)
   *
   * @param {T} value
   * @returns {SinglyLinkedList<T>}
   */
  push(value) {
    const node = new SLLNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return this;
    }

    this.tail.next = node;
    this.tail = node;
    this.length++;
    return this;
  }

  /**
   * Remove last element.
   * Time: O(n) (must traverse to find previous tail)
   *
   * @returns {SLLNode<T> | undefined}
   */
  pop() {
    if (!this.head) return undefined;

    if (this.length === 1) {
      const popped = this.head;
      this.head = null;
      this.tail = null;
      this.length = 0;
      return popped;
    }

    let prev = this.head;
    let cur = this.head;

    while (cur.next) {
      prev = cur;
      cur = cur.next;
    }

    prev.next = null;
    this.tail = prev;
    this.length--;
    cur.next = null; // detach
    return cur;
  }

  /**
   * Add to front.
   * Time: O(1)
   *
   * @param {T} value
   * @returns {SinglyLinkedList<T>}
   */
  unshift(value) {
    const node = new SLLNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return this;
    }

    node.next = this.head;
    this.head = node;
    this.length++;
    return this;
  }

  /**
   * Remove from front.
   * Time: O(1)
   *
   * @returns {SLLNode<T> | undefined}
   */
  shift() {
    if (!this.head) return undefined;

    const shifted = this.head;
    this.head = this.head.next;
    this.length--;

    if (this.length === 0) this.tail = null;

    shifted.next = null; // detach
    return shifted;
  }

  /**
   * Get node at index.
   * Time: O(n)
   *
   * @param {number} index
   * @returns {SLLNode<T> | null}
   */
  get(index) {
    if (typeof index !== "number") return null;
    if (index < 0 || index >= this.length) return null;

    let cur = this.head;
    for (let i = 0; i < index; i++) cur = cur.next;
    return cur;
  }

  /**
   * Insert at index.
   * Time: O(n)
   *
   * @param {number} index
   * @param {T} value
   * @returns {boolean}
   */
  insert(index, value) {
    if (index < 0 || index > this.length) return false;
    if (index === 0) return !!this.unshift(value);
    if (index === this.length) return !!this.push(value);

    const prev = this.get(index - 1);
    if (!prev) return false;

    const node = new SLLNode(value);
    node.next = prev.next;
    prev.next = node;
    this.length++;
    return true;
  }

  /**
   * Remove at index.
   * Time: O(n)
   *
   * @param {number} index
   * @returns {SLLNode<T> | undefined}
   */
  remove(index) {
    if (index < 0 || index >= this.length) return undefined;
    if (index === 0) return this.shift();
    if (index === this.length - 1) return this.pop();

    const prev = this.get(index - 1);
    const removed = prev?.next;
    if (!prev || !removed) return undefined;

    prev.next = removed.next;
    removed.next = null;
    this.length--;
    return removed;
  }

  toArray() {
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }

  reversed() {
  if (!this.head || this.length <= 1) return this;

  let current = this.head;
  const oldHead = this.head; // will become new tail
  let previous = null;

  while (current) {
    const nextNode = current.next;
    current.next = previous;
    previous = current;
    current = nextNode;
  }

  this.head = previous;   // new head
  this.tail = oldHead;    // new tail
  return this;
}

}


const singlyList = new SinglyLinkedList(0);
singlyList.push(1);
singlyList.push(2);
singlyList.push(3);
//console.log(singlyList.reversed())

/* ============================================================
 * 4) Doubly Linked List (O(1) pop/shift)
 * ============================================================ */

/**
 * @template T
 */
class DLLNode {
  /**
   * @param {T} value
   */
  constructor(value) {
    this.value = value;
    /** @type {DLLNode<T> | null} */
    this.next = null;
    /** @type {DLLNode<T> | null} */
    this.prev = null; // standard naming: prev
  }
}



/**
 * Doubly Linked List
 * Invariant:
 *  - head.prev === null
 *  - tail.next === null
 *  - length matches node count
 *
 * @template T
 */
class DoublyLinkedList {
  /**
   * @param {T=} value
   */
  constructor(value) {
    /** @type {DLLNode<T> | null} */
    this.head = null;

    /** @type {DLLNode<T> | null} */
    this.tail = null;

    /** @type {number} */
    this.length = 0;

    if (value !== undefined) this.push(value);
  }

  /**
   * Append to tail.
   * Time: O(1)
   *
   * @param {T} value
   * @returns {DoublyLinkedList<T>}
   */
  push(value) {
    const node = new DLLNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return this;
    }

    node.prev = this.tail;
    this.tail.next = node;
    this.tail = node;

    this.length++;
    return this;
  }

  /**
   * Remove from tail.
   * Time: O(1)
   *
   * IMPORTANT: Always return the popped node (consistent contract).
   *
   * @returns {DLLNode<T> | undefined}
   */
  pop() {
    if (!this.tail) return undefined;

    const popped = this.tail;

    if (this.length === 1) {
      this.head = null;
      this.tail = null;
      this.length = 0;
      popped.next = null;
      popped.prev = null;
      return popped;
    }

    this.tail = popped.prev;
    this.tail.next = null;

    popped.prev = null;
    popped.next = null;

    this.length--;
    return popped;
  }

  /**
   * Add to head.
   * Time: O(1)
   *
   * @param {T} value
   * @returns {DoublyLinkedList<T>}
   */
  unshift(value) {
    const node = new DLLNode(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return this;
    }

    node.next = this.head;
    this.head.prev = node;
    this.head = node;

    this.length++;
    return this;
  }

  /**
   * Remove from head.
   * Time: O(1)
   *
   * @returns {DLLNode<T> | undefined}
   */

  toArray() {
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }

 shift() {
  if (!this.head) return undefined;

  const shifted = this.head;

  if (this.length === 1) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    return shifted;
  }

  this.head = shifted.next;
  this.head.prev = null;

  shifted.next = null; 


  this.length--;
  return shifted;
}


/**
 * Reverse the list in-place.
 *
 * Recruiter-facing contract (applies to BOTH methods below):
 * - Mutates the existing list (nodes are re-linked; no new nodes created).
 * - Returns `this` to allow chaining.
 * - Handles edge cases safely: empty list and 0/1 node list are no-ops.
 * - Time: O(n)  (touch each node once)
 * - Space: O(1) (constant extra pointers)
 */
reversed() { // Strategy 1: "singly-style" walk forward using original next
  if (!this.head || this.length <= 1) return this;

  let current = this.head;
  const oldHead = this.head;   // becomes new tail
  let previous = null;

  while (current) {
    const nextNode = current.next;   // save original next

    // reverse pointers
    current.next = previous;         // next points backward
    current.prev = nextNode;         // prev points forward (old next)

    // advance
    previous = current;
    current = nextNode;
  }

  this.head = previous;              // new head
  this.tail = oldHead;               // old head is new tail
  return this;
}

/**
 * Reverse the list in-place.
 *
 * Recruiter-facing contract:
 * - Mutates list links by swapping `prev`/`next` on every node.
 * - Returns `this` (chainable).
 * - Safe on empty / single-node lists (no-op).
 * - Time: O(n), Space: O(1)
 *
 * Key insight:
 * - After swapping pointers, `current.prev` becomes the OLD `next`,
 *   so `current = current.prev` walks forward through the ORIGINAL list.
 */
reversed2() { // Strategy 2: "true DLL swap" (swap prev/next per node)
  if (!this.head || this.length <= 1) return this;

  let current = this.head;
  const oldHead = this.head; // becomes new tail
  let temp = null;

  while (current) {
    temp = current.prev;       // save old prev

    // swap pointers
    current.prev = current.next;
    current.next = temp;

    // move forward in original list (prev is now old next)
    current = current.prev;
  }

  this.tail = oldHead;
  this.head = temp ? temp.prev : oldHead;
  return this;
}



}




const myDoubly = new DoublyLinkedList(0);
myDoubly.push(1);
myDoubly.push(2);
myDoubly.push(3);
//myDoubly.push(4);
//console.log(myDoubly, "not reversed")
//console.log(myDoubly.reversed2());
//console.log(myDoubly.shift())
//console.log(myDoubly)
//console.log(myDoubly, "last")


/* ============================================================
 * 5) Graph-ish Object: Cost Sum + Cycle-safe Traversal
 * ============================================================ */

/**
 * Sums costs across all nodes in n.nodes without traversing children.
 * (Ignores graph shape; just sums the dictionary.)
 *
 * @param {{nodes: Record<string, any>}} n
 * @returns {number}
 *
 * Time: O(V)
 * Space: O(1)
 */
function sumAllCostsFlat(n) {
  if (!n || !n.nodes) return 0;
  let total = 0;
  for (const key of Object.keys(n.nodes)) {
    const node = n.nodes[key];
    if (typeof node?.cost === "number") total += node.cost;
  }
  return total;
}

/**
 * Cycle-safe DFS traversal sum starting from root.
 *
 * - Follows children references
 * - Uses visited Set to prevent infinite loops on cycles
 *
 * @param {{root: string, nodes: Record<string, any>}} graph
 * @returns {number}
 *
 * Time: O(V + E)
 * Space: O(V)
 */
function sumTotalCost(graph) {
  let total = 0;
  let nodes = graph.nodes;
  let map = new Set();

  function getMyCost(id) {
    console.log("Visiting node:", id);
    if (map.has(id)) return 0;
    map.add(id);
    
    if (nodes[id].cost != null) {
      console.log("Adding cost:", nodes[id].cost);
      total += Number(nodes[id].cost);
    }

    if (nodes[id].children) {
      for (let child of nodes[id].children) {
        getMyCost(child);
      }
    }

    return 0;
  }
  
  console.log("Starting from root:", graph.root);
  getMyCost(graph.root);
  console.log("Final total:", total);

  return total;
}

/* ============================================================
 * 6) Example Usage (safe “demo” section)
 * ============================================================ */

const hard = {
  root: "n0",
  nodes: {
    n0: { type: "org", name: "Acme", children: ["n1", "n2"] },
    n1: { type: "team", name: "Platform", children: ["n3", "n4"], meta: { budget: 120000 } },
    n2: { type: "team", name: "Data", children: ["n4", "n5"], meta: { budget: 90000 } },
    n3: { type: "person", id: 101, name: "Riya", skills: ["js", "system-design"], cost: 1200 },
    n4: { type: "project", code: "P-17", cost: 5000, children: ["n6"] },
    n5: { type: "person", id: 102, name: "Mateo", skills: ["sql", "python", "stats"], cost: 1500 },
    // cycle: n6 -> n1
    n6: { type: "doc", cost: 200, children: ["n1"] },
  },
};

//console.log(sumTotalCost(hard));
// Quick sanity checks (comment out in “portfolio mode”)
const arr = new MyArray();
arr.push("apple"); arr.push("orange"); arr.push("mango");
// arr.print();

const sll = new SinglyLinkedList(1);
sll.push(2).push(3).unshift(0);
// console.log(sll.toArray());

const dll = new DoublyLinkedList(0);
dll.push(1).push(2).push(3);
// console.log(dll.pop()?.value, dll.toArray());

/* ============================================================
 * Optional exports if you ever want to turn this into a module:
 * module.exports = { ... }
 * ============================================================ */


/* ============================================================
 * Stack
 * 
 * ============================================================ */



class NodeStack {
  constructor(value) {
    this.value = value;
    this.next = null;
  }


}

class Stack {
  constructor(value) {
    const newNode = new NodeStack(value);
    this.first = newNode;
    this.length = 1;
  }

  PUSH (value) {
    let newNode = new NodeStack(value);

    newNode.next = this.first;
    this.first = newNode;
    this.length++;
    return this;
  }

  POP () {
   if (!this.first) throw new Error("No more items to Pop");
    let first = this.first;
    if (this.length <= 1 ) {
      first.next = null;
      this.first = null;
      this.length = 0;
      return this;

    }
    this.first = first.next;
    first.next = null;
    this.length--;
    return this;
  }
}

let theStack = new Stack(0);
theStack.PUSH(1);

theStack.PUSH(2);
//console.log(theStack);
//console.log(theStack.POP());
//console.log(theStack.POP());
//console.log(theStack.POP());
//console.log(theStack.PUSH(0));
//console.log(theStack.PUSH(1));

//console.log(theStack.POP());
//console.log(theStack.POP());
//console.log(theStack.POP());





/* ============================================================
 * Optional exports if you ever want to turn this into a module:
 * module.exports = { ... }
 * ============================================================ */


/* ============================================================
 * Enqueue
 * 
 * ============================================================ */


class NodeQueue {
  constructor(value) {
    this.value = value;
    this.next = null;
  }


}

class Queue {
  constructor(value) {
    this.first = new NodeQueue(value);
    this.last = this.first;
    this.min = this.first;
    this.max =this.first;
    this.length = 1;
  }

  enqueue (value) {
    if (!this.first) return undefined;
    let newNode = new NodeQueue(value);
    this.last.next = newNode;
    this.last = newNode;
    this.min = (newNode?.value < this.max.value) ? newNode: this.min;
    this.max = (newNode?.value > this.max.value) ? newNode: this.max;
    this.length++;
    //console.log("in");
    return this;
  }

  dequeue () {
   if (!this.first || !this.first.next) {
        return null; 
    }
   let current = this.first;
   this.first = this.first.next;
   current.next = null;
   this.length--;
   return this;
  }

  mine () {
    let current = this.first;
    let minvalue = current;
    while (current.next) {
   minvalue = (current.value < minvalue) ? current : minvalue;
    current = current.next;
    }
    return minvalue;
  }


}

const myQueue = new Queue(0);
myQueue.enqueue(1);
myQueue.enqueue(2);
myQueue.enqueue(3);
const {last, first} =  myQueue;
//console.log(first, last)

//console.log(myQueue.mine())



//console.log(myQueue.dequeue());

const nodes = {
  A: { cost: 1, children: ["B", "C"] },
  B: { cost: 2, children: ["D"] },
  C: { cost: 10, children: [] },
  D: { cost: 7, children: [] }
};

function getmystuff(id, myset = new Set()) {
  if(myset.has(id)) return myset;
  myset.add(id);
 let children = nodes[id]?.children ?? [];
 
  for (let child of children) {
    getmystuff(child,myset)
  }

  return myset;
}

//console.log(getmystuff("A")); // 20

const sortarray = [1,2,3,4,5]
//reversed a sort list using recursion favorite
function reversed (array) {
  if (array.length === 1) {
     return [array[0]];
  }
let first  = array[0];
let rest = array.slice(1);

return reversed(rest).concat(first);

}
//console.log(reversed(sortarray))



const nodes2 = {
  A: { value: 5, children: ["B", "C"] },
  B: { value: 3, children: ["D", "E"] },
  C: { value: 8, children: ["F"] },
  D: { value: 2, children: [] },
  E: { value: 4, children: [] },
  F: { value: 1, children: [] }
};

// function that finds the MAXIMUM VALUE node
// in a tree starting from a given node

function getMaxNode(n, myset = new Set(), val = 0) {
  if (myset.has(n)) return 0;
  myset.add(n);
  let node = nodes2[n];
  console.log(node,"beginning")
  val = node.value;
  let children = node?.children ?? null;
  for (let child of children) {
    let insde = getMaxNode(child,myset,val);
    val = val > {[n]:insde} ? n: child;
  }

return val;
}

//console.log(getMaxNode("F")); // Should return "C" (value 8)
 // Should return "F" (value 1)


 const nodes3 = {

  A: { children: ["B", "C"] },
  B: { children: ["D", "E"] },
  C: { children: ["F"] },
  D: { children: [] },
  E: { children: [] },
  F: { children: [] }
};

// tree/leaf traversal
function getPaths (id) {
//if (visited.has(id)) return [];
if (nodes3[id].children.length === 0) return [[id]];
//visited.add(id);

let children = nodes3[id]?.children;
let allPaths = [];
console.log(id, "top")
for (let child of children) {
 let childpaths = getPaths(child);
 childpaths.forEach(element => {
  let newpath = [id].concat(element)
  allPaths.push(newpath)
 });
}

return allPaths;
}

//console.log(getPaths("A"));

/**
 * Reverse a string using a stack (array).
 *
 * Idea:
 * - Walk the string from end → start
 * - Push each character onto a stack
 * - Join the stack back into a string
 *
 * Time:  O(n)
 * Space: O(n)
 *
 * @param {string} str
 * @returns {string|undefined} Reversed string, or undefined for falsy input.
 */
function reverse(str) {
  if (!str) return undefined;

  const stack = [];
  for (let i = str.length - 1; i >= 0; i--) {
    stack.push(str[i]);
  }
  return stack.join("");
}

/* ============================================================
 * Hash Table (Separate Chaining)
 * ============================================================
 * - keyMap is an array of "buckets"
 * - each bucket is an array of [key, value] pairs
 * - collisions are handled by storing multiple pairs in the same bucket
 *
 * NOTE:
 * - This is a learning implementation: minimal features (no resizing)
 * - _hashFunction assumes lowercase a-z keys; other chars may hash oddly
 */

class HashTable {
  /**
   * @param {number} size - Number of buckets. More buckets = fewer collisions.
   */
  constructor(size = 5) {
    this.keyMap = new Array(size);
  }

  /**
   * Hash a string key into a bucket index.
   * Uses a prime multiplier to spread keys out.
   *
   * Time: O(min(key.length, 100))
   *
   * @param {string} key
   * @returns {number} index in [0, keyMap.length)
   */
  _hashFunction(key) {
    let sum = 0;
    const PRIME_NUMBER = 31;

    for (let i = 0; i < Math.min(key.length, 100); i++) {
      // Convert 'a' -> 1, 'b' -> 2, etc.
      // (Assumes lowercase letters; 'A' or symbols will produce unexpected values)
      const charCode = key.charCodeAt(i) - 96;
      sum = (sum * PRIME_NUMBER + charCode) % this.keyMap.length;
    }

    return sum;
  }

  /**
   * Insert a key/value pair into the table.
   * Collision strategy: separate chaining (bucket holds multiple pairs).
   *
   * Time: O(1) average, O(n) worst (if many keys collide into one bucket)
   *
   * @param {string} key
   * @param {*} value
   * @returns {HashTable} this (for chaining)
   */
  set(key, value) {
    const index = this._hashFunction(key);

    if (!this.keyMap[index]) this.keyMap[index] = [];
    this.keyMap[index].push([key, value]);

    return this;
  }

  /**
   * Get the bucket for a key's index.
   *
   * NOTE:
   * - This currently returns the entire bucket array, not the single value.
   * - For a full get(key) you’d scan the bucket and match the key.
   *
   * @param {string} key
   * @returns {Array<[string, *]>|undefined}
   */
  get(key) {
    const index = this._hashFunction(key);
    if (!this.keyMap[index]) return undefined;
    return this.keyMap[index];
  }
}

const phoneBook = new HashTable();
phoneBook.set("john", "555-333-444");

/**
 * Count word frequency in a string (case-insensitive).
 *
 * Example:
 * "Hi hi there" -> { hi: 2, there: 1 }
 *
 * Time:  O(n) over number of words/characters
 * Space: O(k) where k = unique words
 *
 * @param {string} str
 * @returns {Record<string, number>}
 */
function objectCounting(str) {
  if (!str) return {};

  const counts = {};
  for (const word of str.trim().split(/\s+/)) {
    const key = word.toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/* ============================================================
 * Binary Search Tree (BST)
 * ============================================================
 * TreeNode:
 * - value: the data held at this node
 * - left:  values < node.value
 * - right: values > node.value
 *
 * BST:
 * - root points to the top node
 * - insert walks down left/right until it finds an empty spot
 */

class TreeNode {
  /**
   * Simple BST node.
   * value: number stored at this node
   * left:  subtree of smaller values
   * right: subtree of larger values
   */
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    /** @type {TreeNode|null} */
    this.root = null;

    /** @type {number} number of nodes in the tree */
    this.size = 0;
  }

  /**
   * Insert a new value into the BST.
   *
   * BST invariant:
   * - left subtree contains values < node.value
   * - right subtree contains values > node.value
   *
   * Duplicate policy:
   * - rejects duplicates (throws)
   *
   * Time:  O(h)  (h = tree height)
   *   - average: O(log n) on balanced-ish trees
   *   - worst:   O(n) if tree is skewed (linked-list shape)
   *
   * Space: O(1) extra (iterative insert)
   *
   * @param {number} value
   * @returns {BST} this (for chaining)
   */
  insert(value) {
    const newNode = new TreeNode(value);

    // Case 1: empty tree => new node becomes root
    if (!this.root) {
      this.root = newNode;
      this.size++;
      return this;
    }

    // Walk the tree until we find an empty left/right spot.
    let current = this.root;

    while (current) {
      // Duplicate guard: stop early if value already exists.
      if (value === current.value) throw new Error("Duplicate value");

      if (value < current.value) {
        // Go left: smaller values live on the left side.
        if (!current.left) {
          // Found insertion spot.
          current.left = newNode;
          this.size++;
          return this;
        }
        current = current.left;
      } else {
        // Go right: larger values live on the right side.
        if (!current.right) {
          // Found insertion spot.
          current.right = newNode;
          this.size++;
          return this;
        }
        current = current.right;
      }
    }

    // Unreachable (we always return when we insert).
    return this;
  }

  /**
   * Search for a value in the BST.
   *
   * Time:  O(h) average O(log n), worst O(n)
   * Space: O(1)
   *
   * @param {number} value
   * @returns {boolean}
   */
  includes(value) {
    if (!this.root) return false;          // empty tree => not found
    if (value === undefined) return false; // could also throw, interviewer preference

    let current = this.root;

    // At each step, we eliminate half the tree (in a balanced tree).
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }

    return false;
  }

  /**
   * Breadth-first traversal (level order).
   *
   * Returns values from top to bottom, left to right.
   *
   * NOTE (interview detail):
   * - Using Array.shift() is O(n) per removal (re-indexing).
   * - For interview “cleanliness,” use a pointer index instead.
   *
   * Time:  O(n) nodes visited
   * Space: O(w) where w is max width of tree (queue size)
   *
   * @returns {number[]|undefined}
   */
  breadthfirst() {
    if (!this.root) return undefined;

    // Queue holds nodes to process in FIFO order.
    const queue = [this.root];
    const data = [];

    // While there are nodes waiting to be processed:
    while (queue.length) {
      // "Peek" the front of queue (next node to process).
      const first = queue[0];

      // Enqueue children BEFORE removing current node (common BFS pattern).
      if (first.left) queue.push(first.left);
      if (first.right) queue.push(first.right);

      // Dequeue and record value.
      data.push(queue.shift().value);
    }

    return data;
  }

  /**
   * Depth-first traversal (preorder): Node -> Left -> Right
   *
   * Time:  O(n)
   * Space: O(h) recursion stack (worst O(n) if skewed)
   *
   * @param {TreeNode|null} node
   * @param {number[]} data
   * @returns {number[]}
   */
  depthfirst(node = this.root, data = []) {
    if (node === null) return data;

    data.push(node.value);              // visit node
    if (node.left) this.depthfirst(node.left, data);
    if (node.right) this.depthfirst(node.right, data);

    return data;
  }

  /**
   * DFS postorder: Left -> Right -> Node
   *
   * Common use: deleting/freeing nodes, evaluating expression trees, etc.
   *
   * FIX: you were accidentally calling this.depthfirst(...) instead of this.dfsPostOrder(...)
   *
   * Time:  O(n)
   * Space: O(h)
   */
  dfsPostOrder(node = this.root, data = []) {
    if (node === null) return data;

    if (node.left) this.dfsPostOrder(node.left, data);
    if (node.right) this.dfsPostOrder(node.right, data);
    data.push(node.value);              // visit AFTER children

    return data;
  }

  /**
   * DFS inorder: Left -> Node -> Right
   *
   * Key BST fact:
   * - Inorder traversal returns values in sorted ascending order.
   *
   * Time:  O(n)
   * Space: O(h)
   */
  dfsinorderOrder(node = this.root, data = []) {
    if (node === null) return data;

    if (node.left) this.dfsinorderOrder(node.left, data);
    data.push(node.value);
    if (node.right) this.dfsinorderOrder(node.right, data);

    return data;
  }
}

// ------------------ Usage / sanity checks ------------------
const newTree = new BST();
newTree.insert(5);
newTree.insert(3);
newTree.insert(8);
newTree.insert(1);
newTree.insert(7);
newTree.insert(9);

// console.log(newTree.dfsinorderOrder());  // [1,3,5,7,8,9]
// console.log(newTree.breadthfirst());     // [5,3,8,1,7,9]

// ------------------ Recursion examples ------------------

/**
 * Countdown recursion demo.
 * Time: O(n)
 * Space: O(n) recursion depth
 */
function countDown(number) {
  if (number === 0) return;
  console.log(number);
  countDown(number - 1);
}

/**
 * Factorial recursion.
 * Time: O(n)
 * Space: O(n)
 *
 * NOTE: factorial(0) is typically 1; you only handle n===1.
 */
function factorail(n) {
  if (n === 1) return 1;
  return n * factorail(n - 1);
}

/**
 * Preorder traversal returning array.
 *
 * FIX: your version referenced "data" but used "rarry" + passed "data" that didn't exist.
 */
function treetravesal(tree) {
  const result = [];

  function recur(node) {
    if (node === null) return;
    result.push(node.value);
    recur(node.left);
    recur(node.right);
  }

  recur(tree.root);
  return result;
}

// console.log(treetravesal(newTree)); // [5,3,1,8,7,9]

// ------------------ Graph ------------------

class Graph {
  constructor() {
    // adjacencyList[v] = array of neighboring vertices
    this.adjacencyList = {};
  }

  /**
   * Add a vertex if it doesn't exist.
   * Time: O(1)
   */
  Addvertex(vtx) {
    if (!this.adjacencyList[vtx]) {
      this.adjacencyList[vtx] = [];
      return true;
    }
    return false;
  }

  /**
   * Add an undirected edge between vtx1 and vtx2.
   * Time: O(1) (push)
   */
  AddEdges(vtx1, vtx2) {
    if (this.adjacencyList[vtx1] && this.adjacencyList[vtx2]) {
      this.adjacencyList[vtx1].push(vtx2);
      this.adjacencyList[vtx2].push(vtx1);
      return true;
    }
    return false;
  }

  /**
   * Remove an undirected edge.
   *
   * FIX: you had a typo: vtx1 list was reassigned using vtx2 list.
   *
   * Time: O(deg(v1) + deg(v2)) because filter scans neighbor arrays
   */
  RemoveEdge(vtx1, vtx2) {
    if (this.adjacencyList[vtx1] && this.adjacencyList[vtx2]) {
      this.adjacencyList[vtx1] = this.adjacencyList[vtx1].filter(v => v !== vtx2);
      this.adjacencyList[vtx2] = this.adjacencyList[vtx2].filter(v => v !== vtx1);
      return true;
    }
    return false;
  }

  /**
   * Remove a vertex and all edges pointing to it.
   *
   * Time: O(sum of degrees of neighbors) due to filtering
   */
  removeVertex(vtx) {
    if (!this.adjacencyList[vtx]) return undefined;

    // Remove vtx from each neighbor’s adjacency list
    for (const neighbor of this.adjacencyList[vtx]) {
      this.adjacencyList[neighbor] = this.adjacencyList[neighbor].filter(v => v !== vtx);
    }

    delete this.adjacencyList[vtx];
    return this;
  }
}

// ------------------ Sorting ------------------

/**
 * Bubble Sort
 * - Repeatedly swaps adjacent out-of-order pairs.
 *
 * Optimization:
 * - If we pass through without any swaps, array is already sorted => break early.
 *
 * Time:  O(n^2) worst/avg
 * Best:  O(n) if already sorted (with early break)
 * Space: O(1)
 */
function bubblesort(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let swapped = false;

    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return arr;
}

/**
 * Selection Sort
 * - Select smallest element from unsorted region and swap into place.
 *
 * Time:  O(n^2)
 * Space: O(1)
 */
function selectionsort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIndex = i;

    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j;
    }

    if (i !== minIndex) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }

  return arr;
}

/**
 * Insertion Sort
 * - Builds a sorted left side by inserting current element into correct spot.
 *
 * Time:  O(n^2) worst/avg
 * Best:  O(n) when nearly sorted
 * Space: O(1)
 */
function insertionsort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    // Shift larger values right until insertion point opens
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }

    // Insert key at correct position
    arr[j + 1] = key;
  }

  return arr;
}

/**
 * Merge Sort
 * - Divide array into halves, sort each, then merge.
 *
 * Time:  O(n log n)
 * Space: O(n) (merge output arrays)
 */
function mergesort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergesort(arr.slice(0, mid));
  const right = mergesort(arr.slice(mid));

  return merge(left, right);
}

/**
 * Merge step for merge sort (two sorted arrays -> one sorted array).
 * Time:  O(n)
 * Space: O(n)
 */
function merge(left, right) {
  let i = 0;
  let j = 0;
  const out = [];

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }

  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);

  return out;
}
