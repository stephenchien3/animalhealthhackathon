import type { SVGProps } from 'react'

const BASF = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 60 24" fill="none">
        <text x="0" y="19" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="20" fill="currentColor">BASF</text>
    </svg>
)

const BASFFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 60 24" fill="none">
        <text x="0" y="19" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="20" fill="currentColor">BASF</text>
    </svg>
)

export { BASF, BASFFull }
