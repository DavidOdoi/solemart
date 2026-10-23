# Homepage hero performance

The hero keeps its existing design and muted video carousel. Poster images use
Next.js Image instead of CSS backgrounds so browsers can choose a responsive
source and prioritize the first image.

- The first poster is present in the server-rendered HTML, uses eager loading,
  and has `fetchPriority="high"`. It does not wait for hydration.
- Other posters mount when their slide is first selected. Visiting the homepage
  no longer downloads all three hero posters immediately.
- Video player code is a separate lazy-loaded module. The YouTube API loads only
  when a selected video can play, after the first poster has loaded (or failed).
- Rotation and playback pause when the hero is offscreen or the tab is hidden.
  Reduced-motion and data-saver preferences start the carousel paused; readers
  can still explicitly play it.

## Verification

Production-build Chromium checks at a 390px viewport and 2x pixel density found:

| Check | Before | After |
| --- | --- | --- |
| Initial hero image requests | Three direct 2200px Unsplash images | One responsive Next.js image, 828px selected |
| Initial request priority | Low | High |
| Initial hero element | CSS background | Server-rendered image with `srcset` |

Browser checks also covered desktop automatic rotation, mobile arrows/dots,
keyboard and swipe navigation, inactive-slide accessibility, video mute and pause,
offscreen pause/resume, reduced motion, data saver, blocked YouTube, and the first
slide with JavaScript disabled. External images and the YouTube player were
substituted with fixtures to test behavior because those hosts were unavailable
from the development environment. These checks do not measure live LCP or actual
image transfer savings.

The reported approximately 71 KiB JavaScript chunk is shared React runtime code.
Lazy-loading the player keeps its code out of the initial application bundle but
does not eliminate the framework runtime or its unused-code audit.

After deployment, rerun PageSpeed Insights on the public homepage for mobile and
desktop. Confirm the LCP image has high fetch priority and compare repeated runs;
the original mobile report showed 3.4s LCP, 4.7s Speed Index, 10ms blocking time,
and zero layout shift. Do not infer a new score from local fixture tests.
