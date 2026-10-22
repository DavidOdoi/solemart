import Link from 'next/link'
import { ArrowUpRight, BookOpen, Mail } from 'lucide-react'
import type { BlogPost } from '@/data/blog'
import { ArticleAvatar } from '@/components/article-avatar'

export function ArticleAuthor({ post, url }: { post: BlogPost; url: string }) {
  if (!post.author) return null
  return (
    <aside aria-labelledby="about-author-heading" className="min-w-0 lg:self-stretch">
      <div id="about-author" className="scroll-mt-48 rounded-2xl border border-[#e5e4df] bg-[#faf9f6] p-6 lg:sticky lg:top-44">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c65325]">Behind the article</p>
        <div className="mt-5 flex items-center gap-4">
          <ArticleAvatar name={post.author} src={post.authorProfile?.avatarUrl} />
          <div className="min-w-0">
            <p className="text-sm text-[#68675f]">Written by</p>
            <h2 id="about-author-heading" className="mt-1 break-words text-xl font-bold leading-tight text-[#161616]">{post.author}</h2>
          </div>
        </div>
        {post.authorProfile?.bio && <p className="mt-5 whitespace-pre-line text-base leading-7 text-[#4f4e49]">{post.authorProfile.bio}</p>}
        <div className="mt-6 border-t border-[#deddd6] pt-5">
          <Link href="/editorial-policy" className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-[#bdb9af] underline-offset-4 hover:text-[#c65325]"><BookOpen aria-hidden="true" className="size-4 shrink-0" />Our editorial policy</Link>
          <Link href="/how-we-review" className="mt-3 flex items-center gap-2 text-sm font-semibold underline decoration-[#bdb9af] underline-offset-4 hover:text-[#c65325]">How we review shoes <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
        </div>
        <nav aria-label="Share this article" className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#deddd6] pt-5">
          <span className="mr-1 text-sm text-[#68675f]">Share</span>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share article on LinkedIn" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#deddd6] bg-white px-3 font-bold hover:border-[#c65325]">in</a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share article on X" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#deddd6] bg-white px-3 font-bold hover:border-[#c65325]">X</a>
          <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}`} aria-label="Share article by email" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#deddd6] bg-white px-3 hover:border-[#c65325]"><Mail aria-hidden="true" className="size-5" /></a>
        </nav>
      </div>
    </aside>
  )
}
