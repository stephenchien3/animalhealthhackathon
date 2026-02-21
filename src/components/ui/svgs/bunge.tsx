import type { SVGProps } from 'react'

const Bunge = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Bunge</text>
    </svg>
)

const BungeFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Bunge</text>
    </svg>
)

export { Bunge, BungeFull }
