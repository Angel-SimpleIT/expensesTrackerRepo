import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardOverlayPattern } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Search, Bell, Plus, Filter } from 'lucide-react'; // Assuming lucide-react is available (it is in package.json)

export const DesignSystemTest = () => {
    return (
        <div className="p-8 space-y-8 bg-[var(--bg-default)] min-h-screen">
            <div className="space-y-4">
                <h1 className="text-[var(--font-h1-size)] font-[var(--font-h1-weight)] text-[var(--neutral-900)]">
                    Design System Verification
                </h1>
                <p className="text-[var(--neutral-500)]">
                    Verifying strict adherence to desing.json tokens.
                </p>
            </div>

            {/* Buttons Section */}
            <section className="space-y-6">
                <h2 className="text-[var(--font-h2-size)] font-[var(--font-h2-weight)]">Buttons</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Primary */}
                    <div className="space-y-4 p-6 bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)]">
                        <h3 className="text-[var(--font-h3-size)] font-[var(--font-h3-weight)]">Primary</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button variant="primary">Primary Button</Button>
                            <Button variant="primary" isLoading>Loading</Button>
                            <Button variant="primary" leftIcon={<Plus size={16} />}>Add New</Button>
                        </div>
                    </div>

                    {/* Ghost */}
                    <div className="space-y-4 p-6 bg-[var(--neutral-900)] rounded-[var(--radius-xl)]">
                        <h3 className="text-[var(--font-h3-size)] font-[var(--font-h3-weight)] text-white">Ghost (Dark Bg)</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button variant="ghost">Ghost Button</Button>
                            <Button variant="ghost" rightIcon={<Search size={16} />}>Search</Button>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="space-y-4 p-6 bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)]">
                        <h3 className="text-[var(--font-h3-size)] font-[var(--font-h3-weight)]">Filter</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button variant="filter" leftIcon={<Filter size={14} />}>Filter</Button>
                            <Button variant="filter">Date Range</Button>
                        </div>
                    </div>

                    {/* Icon Button */}
                    <div className="space-y-4 p-6 bg-[var(--primary-main)] rounded-[var(--radius-xl)]">
                        <h3 className="text-[var(--font-h3-size)] font-[var(--font-h3-weight)] text-white">Icon Button</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button variant="iconButton" size="icon">
                                <Bell size={16} />
                            </Button>
                            <Button variant="iconButton" size="icon">
                                <Search size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Typography Verification */}
            <section className="space-y-6">
                <h2 className="text-[var(--font-h2-size)] font-[var(--font-h2-weight)]">Typography Scale</h2>
                <div className="p-6 bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] space-y-4">
                    <h1 className="text-[32px] font-medium tracking-[-0.02em] leading-[1.2]">Display 1 (32px)</h1>
                    <h1 className="text-[24px] font-bold tracking-[-0.01em] leading-[1.3]">Heading 1 (24px)</h1>
                    <h2 className="text-[20px] font-semibold tracking-[-0.01em] leading-[1.4]">Heading 2 (20px)</h2>
                    <h3 className="text-[16px] font-semibold tracking-[0em] leading-[1.5]">Heading 3 (16px)</h3>
                    <p className="text-[16px] font-normal tracking-[0em] leading-[1.5]">Body Large (16px)</p>
                    <p className="text-[14px] font-normal tracking-[0em] leading-[1.5]">Body (14px)</p>
                    <p className="text-[12px] font-medium tracking-[0.02em] leading-[1.4]">Caption (12px)</p>
                </div>
            </section>

            {/* Inputs Section */}
            <section className="space-y-6">
                <h2 className="text-[var(--font-h2-size)] font-[var(--font-h2-weight)]">Inputs</h2>
                <div className="p-6 bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--neutral-700)]">Email Address</label>
                        <Input placeholder="Enter your email" type="email" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--neutral-700)]">Disabled Input</label>
                        <Input placeholder="Cannot type here" disabled />
                    </div>
                </div>
            </section>

            {/* Badges Section */}
            <section className="space-y-6">
                <h2 className="text-[var(--font-h2-size)] font-[var(--font-h2-weight)]">Badges</h2>
                <div className="p-6 bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] flex flex-wrap gap-4">
                    <Badge variant="success">Completed</Badge>
                    <Badge variant="pending">Pending</Badge>
                    <Badge variant="warning">In Review</Badge>
                    <Badge variant="error">Failed</Badge>
                </div>
            </section>

            {/* Cards Section */}
            <section className="space-y-6">
                <h2 className="text-[var(--font-h2-size)] font-[var(--font-h2-weight)]">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Default Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Balance</CardTitle>
                            <CardDescription>Your current financial status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-[var(--font-money-large-size)] leading-none text-[var(--neutral-900)]">
                                $12,450.00
                            </span>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm" variant="ghost" className="text-[var(--neutral-500)] p-0 h-auto hover:bg-transparent hover:text-[var(--neutral-900)]">
                                View Details &rarr;
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Dark Credit Card */}
                    <Card variant="darkCreditCard">
                        <CardOverlayPattern />
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-white">Sequence Card</CardTitle>
                            <CardDescription className="text-white/70">Premium Business</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 mt-4">
                            <span className="text-[var(--font-h3-size)] font-mono tracking-widest">
                                **** **** **** 4242
                            </span>
                        </CardContent>
                        <CardFooter className="relative z-10 justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-70">Card Holder</span>
                                <span className="text-sm font-medium">Alex Morgan</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase opacity-70">Expires</span>
                                <span className="text-sm font-medium">12/28</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </section>
        </div>
    );
};
