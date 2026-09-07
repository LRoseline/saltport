import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'wiki/posts/news');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'posts.json');

function getMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function generatePostList() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('Files Not Found.');
    return;
  }

  const files = getMarkdownFiles(POSTS_DIR);

  const posts = files
    .map(filePath => {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);

      const relativePath = path
        .relative(process.cwd(), filePath)
        .replace(/\\/g, '/');

      return {
        slug: path.basename(filePath, '.md'),
        path: relativePath,
        title: data.title || 'Title',
        date: data.date || '',
        excerpt: data.excerpt || '',
        thumbnail: data.thumbnail || ''
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(posts, null, 2)
  );

  console.log(`Created : ${posts.length}!`);
}

generatePostList();