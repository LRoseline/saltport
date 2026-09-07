import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'wiki/posts/news/');

const OUTPUT_FILE = path.join(process.cwd(), 'public', 'posts.json'); // 결과 저장 위치

function generatePostList() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('Files Not Found.');
    return;
  }

  const files = fs.readdirSync(POSTS_DIR);
  const posts = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(POSTS_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      const { data } = matter(fileContent); 
      
      return {
        slug: file.replace('.md', ''),
        title: data.title || 'Title',
        date: data.date || '',
        excerpt: data.excerpt || '',
        thumbnail: data.thumbnail || ''
      };
    })

    .sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
  console.log(`Created : ${posts.length}!`);
}

generatePostList();