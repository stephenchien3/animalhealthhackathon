import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HeroHeader } from './HeroHeader'
import { ChevronRight } from 'lucide-react'
import { Cargill } from '@/components/ui/svgs/cargill'
import { Purina } from '@/components/ui/svgs/purina'
import { BASF } from '@/components/ui/svgs/basf'
import { Bunge } from '@/components/ui/svgs/bunge'
import { Nutreco } from '@/components/ui/svgs/nutreco'
import { Tyson } from '@/components/ui/svgs/tyson'
import { ADM } from '@/components/ui/svgs/adm'
import { Alltech } from '@/components/ui/svgs/alltech'
import { Corteva } from '@/components/ui/svgs/corteva'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="bg-background">
                    <div className="relative py-32 md:pt-44">
                        <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] mask-t-from-50% lg:aspect-9/4 absolute inset-0 aspect-square lg:top-24 dark:opacity-5">
                            <img
                                src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="hero background"
                                width={2268}
                                height={1740}
                                className="size-full object-cover object-top"
                            />
                        </div>
                        <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
                            <div className="mx-auto max-w-md text-center">
                                <h1 className="text-balance font-serif text-4xl font-medium sm:text-5xl">Cleaner Feed. Healthier Animals.</h1>
                                <p className="text-white mt-4 text-balance ">CleanFeed is your all-in-one platform to build and track drying sheds for soybean-based animal feed.

                                </p>

                                <Button
                                    asChild
                                    className="mt-6 pr-1.5">
                                    <Link to="/login">
                                        <span className="text-nowrap">Get Started</span>
                                        <ChevronRight className="opacity-50" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="mx-auto mt-24 max-w-xl">
                                <div className="**:fill-foreground grid scale-95 grid-cols-3 gap-12">
                                    <div className="ml-auto blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Cargill className="h-3.5 w-16" />
                                        </Card>
                                    </div>
                                    <div className="ml-auto">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Purina className="size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Purina</span>
                                        </Card>
                                    </div>
                                    <div className="ml-auto blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Nutreco className="h-3.5 w-16" />
                                        </Card>
                                    </div>
                                    <div className="mr-auto">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Tyson className="h-3.5 w-14" />
                                        </Card>
                                    </div>
                                    <div className="blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <ADM className="h-3.5 w-12" />
                                        </Card>
                                    </div>
                                    <div>
                                        <Card className="shadow-foreground/10 mx-a flex h-10 h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Bunge className="h-3.5 w-14" />
                                        </Card>
                                    </div>
                                    <div className="ml-auto blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <BASF className="h-3.5 w-12" />
                                        </Card>
                                    </div>
                                    <div>
                                        <Card className="shadow-foreground/10 mx-a flex h-10 h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Corteva className="size-3 sm:size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Corteva</span>
                                        </Card>
                                    </div>
                                    <div className="blur-[2px]">
                                        <Card className="shadow-foreground/10 flex h-8 w-fit items-center gap-2 rounded-xl px-3 sm:h-10 sm:px-4">
                                            <Alltech className="size-3 sm:size-4" />
                                            <span className="text-nowrap font-medium max-sm:text-xs">Alltech</span>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
