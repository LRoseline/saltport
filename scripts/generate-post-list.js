import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'wiki/posts/news');
const OUTPUT_DIR = path.join(process.cwd(), 'public/posts');
const LATEST_FILE = path.join(OUTPUT_DIR, 'latest.json');

function getMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

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

function createPost(filePath) {
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
}

function getPostsFromDirectory(dir) {
  return getMarkdownFiles(dir)
    .map(createPost)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2)
  );
}

function generateYear(year) {
  const yearDir = path.join(POSTS_DIR, year);
  const outputFile = path.join(OUTPUT_DIR, `${year}.json`);

  const posts = getPostsFromDirectory(yearDir);

  if (posts.length === 0) {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
      console.log(`Deleted ${year}.json`);
    }

    return;
  }

  writeJson(outputFile, posts);

  console.log(`Created ${year}.json : ${posts.length}`);
}

function generateLatest() {
  const files = getMarkdownFiles(POSTS_DIR);

  const posts = files
    .map(createPost)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  writeJson(LATEST_FILE, posts);

  console.log(`Created latest.json : ${posts.length}`);
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('Files Not Found.');
    return;
  }

  const years = process.argv.slice(2);

  if (years.length > 0) {
    for (const year of years) {
      generateYear(year);
    }
  } else {
    const entries = fs.readdirSync(POSTS_DIR, {
      withFileTypes: true
    });

    for (const entry of entries) {
      if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
        generateYear(entry.name);
      }
    }
  }

  generateLatest();
}

main();