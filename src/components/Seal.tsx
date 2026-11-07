/** 朱印。全站唯一的紅，只出現在標誌與收尾兩處。 */
export function Seal({ size = 20 }: { size?: number }) {
  return (
    <svg className="seal" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="37" height="37" rx="2.5" fill="none" stroke="currentColor" strokeWidth="3" />
      <path
        d="M11 12h18M20 12v16M11 20h18M14 28h12"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square"
      />
    </svg>
  )
}
