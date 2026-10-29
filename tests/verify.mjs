// Structural checks only: no browser execution, network access or dependencies.
// Run from the repository root: node tests/verify.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const scripts = ['js/theme.js', 'js/i18n.js', 'js/navigation.js', 'js/menu.js'];
const read = path => readFileSync(join(root, path), 'utf8');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const normalize = value => value.replace(/\s+/g, ' ').trim();

function readJSON(path) {
  const source = read(path);
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${path}: invalid JSON (${error.message})`);
  }
}

function localFile(path, context) {
  const absolute = resolve(root, path);
  assert(absolute.startsWith(root), `${context}: path escapes the repository: ${path}`);
  assert(statSync(absolute, { throwIfNoEntry: false })?.isFile(), `${context}: missing file ${path}`);
  return relative(root, absolute).split(sep).join('/');
}

function walk(directory, extension) {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, extension) : path.endsWith(extension) ? [path] : [];
  });
}

function decode(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (match, entity) => {
    if (!entity.startsWith('#')) return named[entity.toLowerCase()];
    return String.fromCodePoint(entity[1].toLowerCase() === 'x'
      ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  });
}

// A small tokenizer for this site's static markup, not a general HTML validator.
// Keeping descendants lets category cards be checked without formatting assumptions.
function parseHTML(source) {
  const elements = [], stack = [];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const markup = source.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?(<\/(?:script|style)>)/gi, '$1$2');
  for (const token of markup.match(/<[^>]*>|[^<]+/g) || []) {
    const close = token.match(/^<\/([\w:-]+)/);
    if (close) {
      const index = stack.findLastIndex(node => node.tag === close[1].toLowerCase());
      if (index >= 0) stack.length = index;
    } else if (/^<[a-z]/i.test(token)) {
      const tag = token.match(/^<([\w:-]+)/)[1].toLowerCase();
      const attrs = {};
      const attributes = token.slice(tag.length + 1).replace(/\/?\s*>$/, '');
      for (const match of attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
      }
      const node = { tag, attrs, text: '', descendants: [] };
      for (const ancestor of stack) ancestor.descendants.push(node);
      elements.push(node);
      if (!voidTags.has(tag) && !token.endsWith('/>')) stack.push(node);
    } else if (!token.startsWith('<')) {
      for (const node of stack) node.text += decode(token);
    }
  }
  return elements;
}

function flatten(dictionary, label, prefix = '', result = {}) {
  assert(object(dictionary) && Object.keys(dictionary).length, `${label}: expected a nonempty object at ${prefix || 'root'}`);
  for (const [key, value] of Object.entries(dictionary)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (object(value)) flatten(value, label, path, result);
    else {
      assert(nonempty(value), `${label}: translation ${path} must be a nonempty string`);
      result[path] = value;
    }
  }
  return result;
}

function verify() {
  const menu = readJSON('data/menu.json');
  const dictionaries = Object.fromEntries(['de', 'en'].map(lang =>
    [lang, flatten(readJSON(`data/${lang}.json`), `data/${lang}.json`)]));
  const keys = Object.keys(dictionaries.de).sort();
  assert.deepEqual(Object.keys(dictionaries.en).sort(), keys, 'German and English translation keys differ');
  for (const key of keys) {
    const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(dictionaries.de[key]), placeholders(dictionaries.en[key]), `${key}: translation placeholders differ`);
  }

  assert.equal(menu.currency, 'EUR', 'data/menu.json: currency must be EUR');
  assert(Array.isArray(menu.categories) && menu.categories.length, 'data/menu.json: categories must be a nonempty array');
  const categories = new Map(), ids = new Set(), codes = new Set();
  function bilingual(value, context) {
    assert(object(value) && nonempty(value.de) && nonempty(value.en), `${context}: nonempty de/en strings required`);
  }
  for (const category of menu.categories) {
    assert(object(category) && nonempty(category.id) && /^[a-z][a-z0-9_-]*$/.test(category.id), 'Menu category requires a valid id');
    assert(!categories.has(category.id), `Duplicate category id: ${category.id}`);
    categories.set(category.id, category);
    bilingual(category.name, `${category.id}.name`);
    bilingual(category.introduction, `${category.id}.introduction`);
    assert(Array.isArray(category.items) && category.items.length, `${category.id}: items must be a nonempty array`);
    localFile(`images/menu-category-tiles/menu-${category.id}.jpg`, category.id);
    for (const item of category.items) {
      assert(object(item) && nonempty(item.id) && !/\s/.test(item.id), `${category.id}: dish requires a valid id`);
      assert(!ids.has(item.id), `Duplicate dish id: ${item.id}`);
      ids.add(item.id);
      assert(nonempty(item.code) && !codes.has(item.code), `${item.id}: missing or duplicate code ${item.code}`);
      codes.add(item.code);
      bilingual(item.name, `${item.id}.name`);
      bilingual(item.description, `${item.id}.description`);
      assert(Number.isFinite(item.price) && item.price > 0, `${item.id}: price must be a positive number`);
      assert(nonempty(item.image), `${item.id}: image required`);
      localFile(item.image, item.id);
    }
  }
  console.log(`PASS menu: ${categories.size} categories, ${ids.size} dishes, all photographs present`);

  const pages = new Map(['index.html', ...walk('pages', '.html')].map(path => [path, parseHTML(read(path))]));
  const pageIds = new Map();
  for (const [path, nodes] of pages) {
    const found = nodes.filter(node => 'id' in node.attrs).map(node => node.attrs.id);
    assert.equal(new Set(found).size, found.length, `${path}: duplicate HTML ids`);
    pageIds.set(path, new Set(found));
  }
  let referenceCount = 0;
  function reference(value, from) {
    // External URLs, data URIs and mail/tel links are outside this offline check.
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return;
    const url = new URL(value, new URL(from, 'https://verify.invalid/'));
    assert.equal(url.origin, 'https://verify.invalid', `${from}: unexpected reference ${value}`);
    const target = localFile(decodeURIComponent(url.pathname).slice(1), `${from} → ${value}`);
    if (url.hash && pageIds.has(target)) {
      assert(pageIds.get(target).has(decodeURIComponent(url.hash.slice(1))), `${from}: missing fragment ${value}`);
    }
    referenceCount++;
    return target;
  }
  const requireKey = (key, context) => assert(keys.includes(key), `${context}: missing translation key ${key}`);
  for (const [path, nodes] of pages) {
    const html = nodes.find(node => node.tag === 'html');
    assert.equal(html?.attrs.lang, 'de', `${path}: German HTML fallback language required`);
    const page = html.attrs['data-page'];
    assert(nonempty(page), `${path}: metadata page identifier required`);
    for (const field of ['title', 'description']) requireKey(`metadata.${page}.${field}`, path);
    assert(nodes.some(node => node.tag === 'title' && nonempty(node.text)), `${path}: fallback title required`);
    assert(nodes.some(node => node.tag === 'meta' && node.attrs.name === 'description' && nonempty(node.attrs.content)), `${path}: fallback description required`);
    for (const node of nodes) {
      for (const attr of ['href', 'src', 'poster']) {
        if (attr in node.attrs) reference(node.attrs[attr], path);
      }
      if (node.attrs.srcset) {
        for (const candidate of node.attrs.srcset.split(',')) reference(candidate.trim().split(/\s+/)[0], path);
      }
      for (const [attr, key] of Object.entries(node.attrs)) {
        if (attr === 'data-i18n' || attr.startsWith('data-i18n-')) {
          requireKey(key, path);
          const fallback = attr === 'data-i18n' ? node.text : node.attrs[attr.slice('data-i18n-'.length)];
          assert(nonempty(fallback), `${path}: missing HTML fallback for ${attr}="${key}"`);
        }
      }
      for (const attr of ['data-category', 'data-category-card']) {
        if (attr in node.attrs) assert(categories.has(node.attrs[attr]), `${path}: unknown category ${node.attrs[attr]}`);
      }
      if ('data-category-card' in node.attrs) {
        const category = categories.get(node.attrs['data-category-card']);
        const count = node.descendants.find(child => 'data-overview-count' in child.attrs);
        assert.equal(Number(count?.text.match(/\d+/)?.[0]), category.items.length, `${path}: incorrect ${category.id} card count`);
        assert(node.descendants.some(child => child.tag === 'a' && reference(child.attrs.href, path) === `pages/single-menus/${category.id}.html`), `${path}: ${category.id} card links to wrong category`);
        assert(node.descendants.some(child => child.tag === 'img' && reference(child.attrs.src, path) === `images/menu-category-tiles/menu-${category.id}.jpg`), `${path}: ${category.id} card uses wrong photograph`);
        for (const marker of ['data-overview-name', 'data-overview-introduction']) {
          assert(node.descendants.some(child => marker in child.attrs && nonempty(child.text)), `${path}: ${category.id} missing ${marker} fallback`);
        }
      }
    }
  }
  const overview = pages.get('pages/menu-categories.html');
  const cards = overview.filter(node => 'data-category-card' in node.attrs).map(node => node.attrs['data-category-card']);
  assert.deepEqual(cards.slice().sort(), [...categories.keys()].sort(), 'Overview must contain each menu category exactly once');
  for (const [id, category] of categories) {
    const path = `pages/single-menus/${id}.html`, nodes = pages.get(path);
    assert(nodes, `${id}: missing category page ${path}`);
    assert.equal(nodes.filter(node => 'data-category' in node.attrs).length, 1, `${path}: expected one menu container`);
    assert(nodes.some(node => node.attrs['data-category'] === id), `${path}: category identifier mismatch`);
    const count = nodes.find(node => 'data-category-count' in node.attrs);
    assert.equal(Number(count?.text.match(/\d+/)?.[0]), category.items.length, `${path}: fallback dish count mismatch`);
    assert(nodes.some(node => node.tag === 'h1' && normalize(node.text) === normalize(category.name.de)), `${path}: heading does not match German category name`);
    assert(nodes.some(node => 'data-category-introduction' in node.attrs && nonempty(node.text)), `${path}: missing introduction fallback`);
    assert(nodes.some(node => node.tag === 'noscript' && nonempty(node.text)), `${path}: missing JavaScript-required fallback`);
  }
  for (const [lang, dictionary] of Object.entries(dictionaries)) {
    assert.equal(Number(dictionary['menu.introduction']?.match(/\d+/)?.[0]), ids.size, `${lang}: menu introduction dish count mismatch`);
    assert.equal(Number(dictionary['home.allCategoriesLink']?.match(/\d+/)?.[0]), categories.size, `${lang}: category link count mismatch`);
  }
  // Literal JS keys plus metadata templates expanded above. Variable-built keys
  // require an explicit rule here if future application code introduces them.
  for (const path of scripts) {
    for (const match of read(path).matchAll(/["']((?:[a-zA-Z]+\.)+[a-zA-Z]+)["']/g)) {
      if (keys.some(key => key.split('.')[0] === match[1].split('.')[0])) requireKey(match[1], path);
    }
  }
  for (const path of walk('css', '.css')) {
    const css = read(path).replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi)) {
      reference(match[1] ?? match[2] ?? match[3], path);
    }
  }
  console.log(`PASS references and fallbacks: ${pages.size} HTML pages, ${referenceCount} local references`);
  console.log(`PASS localization: ${keys.length} matching keys, nonempty values and matching placeholders`);
  for (const path of scripts) {
    const result = spawnSync(process.execPath, ['--check', join(root, path)], { encoding: 'utf8' });
    assert(!result.error && result.status === 0, `${path}: syntax check failed\n${result.error?.message || result.stderr}`);
  }
  console.log('PASS syntax: all four application JavaScript files');
  console.log('Verification passed. Browser behavior, appearance and production services are not tested.');
}

try {
  verify();
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
