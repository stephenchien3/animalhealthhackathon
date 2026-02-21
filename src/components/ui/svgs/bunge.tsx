import type { SVGProps } from 'react'

const Bunge = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="4" x2="17" y2="4" />
            <line x1="1" y1="8" x2="19" y2="8" />
            <line x1="0" y1="12" x2="20" y2="12" />
            <line x1="1" y1="16" x2="19" y2="16" />
            <line x1="3" y1="20" x2="17" y2="20" />
        </g>
        <text x="28" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Bunge</text>
    </svg>
)

const BungeFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Bunge</text>
    </svg>
)

export { Bunge, BungeFull }


