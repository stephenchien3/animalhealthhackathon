import type { SVGProps } from 'react'

const Tyson = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <text x="50" y="18" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Tyson</text>
    </svg>
)

const TysonFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Tyson</text>
    </svg>
)

export { Tyson, TysonFull }
