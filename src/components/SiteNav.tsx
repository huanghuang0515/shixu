import { useEffect, useState } from 'react'
import { Seal } from './Seal'

const LINKS = [
  { href: '#shi-sishi', label: '識四時' },
  { href: '#zhuan-luopan', label: '轉羅盤' },
  { href: '#du-ganzhi', label: '讀干支' },
  { href: '#kan-duizhao', label: '看對照' },
]

export function SiteNav({ year, ganzhi }: { year: number; ganzhi: string }) {
  const [active, setActive] = useState('shi-sishi')

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1))
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null)
    if (nodes.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.6, 1] },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <nav className="nav" aria-label="章節導覽">
      <div className="wrap nav__inner">
        <a className="nav__mark" href="#top">
          <Seal size={17} />
          四時有序<span>SHI XU</span>
        </a>
        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                className="nav__link"
                href={l.href}
                aria-current={active === l.href.slice(1) ? 'true' : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="nav__year" aria-label={`目前年度 ${year} ${ganzhi}`}>
          <span aria-hidden="true">{year} {ganzhi}</span>
        </p>
      </div>
    </nav>
  )
}
