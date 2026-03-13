<template>
    <main class="relative flex h-dvh flex-col items-center justify-center bg-black lg:flex-row-reverse">
        <section class="relative z-0 flex w-full grow max-xs:pb-6 xs:static lg:relative lg:h-full">
            <video
                src="https://storage.googleapis.com/sistema-atendas/conectahub-kyc.webm"
                class="absolute inset-0 size-full object-cover opacity-60"
                :controls="false"
                autoplay
                loop
            />
        </section>
        <section class="relative z-10 -mt-6 flex w-full flex-col overflow-hidden bg-background text-center shadow-md transition-all duration-500 max-lg:rounded-t-3xl xs:m-auto xs:mb-0 xs:max-w-screen-xs lg:-mr-6 lg:mt-0 lg:h-full lg:rounded-e-3xl">
            <div class="mask-transparent-border flex size-full flex-col gap-6 overflow-auto p-4 [--size:1rem] xs:p-6 xs:[--size:1.5rem]">
                <div class="my-auto flex w-full flex-col gap-6">
                    <TransitionOpacity mode="out-in">
                        <h1
                            :key="$route.meta.title"
                            class="font-bold"
                        >
                            {{ $route.meta.title }}
                        </h1>
                    </TransitionOpacity>
                    <div class="w-full">
                        <slot />
                    </div>
                </div>
                <div class="flex w-full flex-row items-center justify-between gap-4">
                    <ButtonTheme />
                    <span class="font-medium tracking-widest opacity-60">
                        v{{ $version }}
                    </span>
                </div>
            </div>
        </section>
    </main>
</template>