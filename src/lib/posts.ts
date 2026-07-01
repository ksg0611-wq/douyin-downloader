import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface BlogPostMeta {
  id: string;
  title: string;
  summary: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
}

export interface BlogPostDetail extends BlogPostMeta {
  content: string;
}

// 마크다운 서식을 제거하고 순수 텍스트 본문에서 메타설명(description)을 추출하는 헬퍼 함수
function extractDescription(content: string, maxLength = 160): string {
  if (!content) return "";
  
  const cleanText = content
    .replace(/<[^>]*>/g, "") // HTML 제거
    .replace(/!\[.*?\]\(.*?\)/g, "") // 이미지 제거
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // 링크 텍스트만 추출
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 볼드 제거
    .replace(/(\*|_)(.*?)\1/g, "$2") // 이탤릭 제거
    .replace(/~~(.*?)~~/g, "$1") // 취소선 제거
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, "$1") // 코드 블록 기호 제거
    .replace(/^#+\s+/gm, "") // 제목 샵(#) 기호 제거
    .replace(/\s+/g, " ") // 다중 공백 단일화
    .trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  return cleanText.slice(0, maxLength) + "...";
}

// 모든 블로그 글의 메타데이터를 날짜순으로 정렬하여 가져오는 함수
export function getSortedPostsData(): BlogPostMeta[] {
  // 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith(".md"))
    .map((fileName) => {
      // 파일 이름에서 '.md'를 제거하여 id(slug)로 사용
      const id = fileName.replace(/\.md$/, "");

      // 마크다운 파일을 문자열로 읽기
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // gray-matter를 사용하여 포스트의 메타데이터 파싱
      const matterResult = matter(fileContents);
      const data = matterResult.data || {};
      
      // frontmatter에 요약문이 없으면 본문에서 추출
      const resolvedSummary = data.summary || data.description || extractDescription(matterResult.content);

      // 데이터와 id 결합 (필수 값이 없을 경우를 대비한 fallback)
      return {
        id,
        title: data.title || "제목 없음",
        summary: resolvedSummary,
        description: resolvedSummary,
        date: data.date || "2024. 01. 01",
        category: data.category || "Uncategorized",
        readTime: data.readTime || "1 min read",
        draft: data.draft === true || data.draft === "true",
      };
    })
    .filter(post => !post.draft); // draft 포스트 필터링

  // 날짜 기준으로 내림차순 정렬 (최신 글이 먼저 오도록)
  return allPostsData
    .map(({ draft, ...rest }) => rest)
    .sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA < dateB) {
        return 1;
      } else {
        return -1;
      }
    });
}

export async function getSortedPostsDataAsync(): Promise<BlogPostMeta[]> {
  return Promise.resolve(getSortedPostsData());
}

// 특정 id(slug)를 가진 글의 상세 내용(본문 포함)을 가져오는 함수
export function getPostData(id: string): BlogPostDetail | null {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const data = matterResult.data || {};

  // draft 포스트인 경우 상세페이지 노출 방지
  if (data.draft === true || data.draft === "true") {
    return null;
  }

  const resolvedSummary = data.summary || data.description || extractDescription(matterResult.content);

  return {
    id,
    content: matterResult.content,
    title: data.title || "제목 없음",
    summary: resolvedSummary,
    description: resolvedSummary,
    date: data.date || "2024. 01. 01",
    category: data.category || "Uncategorized",
    readTime: data.readTime || "1 min read",
  };
}
