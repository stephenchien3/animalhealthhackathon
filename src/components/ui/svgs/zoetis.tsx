import type { SVGProps } from 'react'

const Zoetis = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Zoetis</text>
    </svg>
)

const ZoetisFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Zoetis</text>
    </svg>
)

export { Zoetis, ZoetisFull }
