import { useEffect } from 'react'

/**
 * 區塊進場：元素進入視窗後加上 is-in，只觸發一次。
 * 失敗時內容仍然看得到——`.reveal` 的初始隱藏只在 <html class="js"> 之下生效。
 */
export function useReveal(): void {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (nodes.length === 0) return

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}
