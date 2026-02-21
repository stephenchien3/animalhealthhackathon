import type { SVGProps } from 'react'

const Purina = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" />
        <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="14" y="14" width="8" height="8" rx="1" fill="currentColor" />
    </svg>
)

const PurinaFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 120 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Purina</text>
    </svg>
)

export { Purina, PurinaFull }
