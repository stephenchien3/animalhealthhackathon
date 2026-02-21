import { ChevronRight, Warehouse } from 'lucide-react'
import { Tyson } from '@/components/ui/svgs/tyson'
import { Cargill } from '@/components/ui/svgs/cargill'
import { Bunge } from '@/components/ui/svgs/bunge'
import { Purina } from '@/components/ui/svgs/purina'
import { ADM } from '@/components/ui/svgs/adm'
import { Alltech } from '@/components/ui/svgs/alltech'

import { Button } from '@/components/ui/button'
import { Link } from 'react-router'

export default function Integrations() {
    return (
        <section className="bg-background @container py-24">
            <div className="mx-auto max-w-2xl px-6">
                <IntegrationsIllustration />
                <div className="mx-auto mt-12 max-w-md text-balance text-center">
                    <h2 className="font-serif text-4xl font-medium">Trusted by Industry Leaders</h2>
                    <p className="text-muted-foreground mb-6 mt-4">Seamlessly integrate with the feed supply chain partners you already work with.</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="gap-1 pr-1.5">
                        <Link to="/features">
                            Learn more
                            <ChevronRight />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

const IntegrationsIllustration = () => {
    return (
        <div
            aria-hidden
            className="**:fill-foreground mx-auto flex h-44 max-w-lg flex-col justify-between">
            <div className="@lg:px-6 relative flex h-10 items-center justify-between gap-12">
                <div className="bg-border absolute inset-0 my-auto h-px"></div>

                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
                    <Tyson className="h-3 w-12" />
                </div>
                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
                    <Purina className="size-3.5" />
                </div>
            </div>
            <div className="@lg:px-24 relative flex h-10 items-center justify-between px-12">
                <div className="bg-border absolute inset-0 my-auto h-px"></div>
                <div className="bg-linear-to-r mask-l-from-15% mask-l-to-40% mask-r-from-75% mask-r-to-75% from-primary absolute inset-0 my-auto h-px w-1/2 via-amber-500 to-pink-400"></div>
                <div className="bg-linear-to-r mask-r-from-15% mask-r-to-40% mask-l-from-75% mask-l-to-75% absolute inset-0 my-auto ml-auto h-px w-1/2 from-indigo-500 via-emerald-500 to-blue-400"></div>

                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
                    <Alltech className="size-3.5" />
                </div>
                <div className="border-foreground/15 rounded-full border border-dashed p-2">
                    <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center gap-1.5 rounded-full px-3 shadow-sm ring">
                        <Warehouse className="size-3.5" />
                        <span className="text-xs font-medium">CF</span>
                    </div>
                </div>
                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
                    <Bunge className="h-3 w-12" />
                </div>
            </div>
            <div className="@lg:px-6 relative flex h-10 items-center justify-between gap-12">
                <div className="bg-border absolute inset-0 my-auto h-px"></div>

                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
                    <Cargill className="h-3 w-14" />
                </div>
                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
                    <ADM className="h-3 w-10" />
                </div>
            </div>
        </div>
    )
}
