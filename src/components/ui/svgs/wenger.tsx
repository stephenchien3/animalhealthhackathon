import type { SVGProps } from 'react'

const Wenger = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 120 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Wenger</text>
    </svg>
)

const WengerFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 120 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Wenger</text>
    </svg>
)

export { Wenger, WengerFull }
