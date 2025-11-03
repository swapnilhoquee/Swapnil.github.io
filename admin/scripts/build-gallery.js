// Run during Netlify build. It reads content/gallery/*.md (frontmatter) and outputs data/gallery.json
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(process.cwd(), 'content', 'gallery');
const outDir = path.join(process.cwd(), 'data');
const outFile = path.join(outDir, 'gallery.json');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const items = [];

if (fs.existsSync(contentDir)) {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md') || f.endsWith('.markdown') || f.endsWith('.mdx'));
  files.forEach(filename => {
    const full = path.join(contentDir, filename);
    const raw = fs.readFileSync(full, 'utf8');
    const parsed = matter(raw);
    const data = parsed.data || {};
    items.push({
      file: data.image ? data.image.replace(/^\//, '').split('/').pop() : (data.file || ''),
      title: data.title || '',
      caption: data.caption || '',
      date: data.date || '',
      tags: data.tags || []
    });
  });
}

items.sort((a,b) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return new Date(b.date) - new Date(a.date);
});

if (!fs.existsSync(path.dirname(outFile))) fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(items, null, 2));
console.log(`Wrote ${items.length} gallery items to ${outFile}`);
