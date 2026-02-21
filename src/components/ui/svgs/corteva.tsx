import type { SVGProps } from 'react'

const Corteva = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C7 2 3 6.5 3 12c0 3 1.5 5.5 3.5 7.5C8 21 10 22 12 22c5 0 9-4.5 9-10S17 2 12 2zm0 3c1.5 0 3 .5 4 1.5-2 1-4 3-5 5.5-1-2.5-1.5-5-.5-7h1.5z" fill="currentColor" />
    </svg>
)

const CortevaFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 120 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Corteva</text>
    </svg>
)

export { Corteva, CortevaFull }
