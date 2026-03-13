<template>
    <Container
        :pending
        :pagination="paginationInfo"
        @pagination="(v) => pagination.page = v"
    >
        <template v-if="data?.length || pending">
            <div
                v-for="item in data"
                :key="item.id"
                class="relative flex h-fit w-full flex-col rounded-2xl border border-background-300 bg-background transition-all duration-300 hover:shadow"
                :class="item.page ? 'cursor-pointer hover:bg-soft hover:border-primary' : 'cursor-not-allowed'"
                @click="click($event, item)"
            >
                <div class="flex min-h-32 grow flex-col justify-between gap-4 px-4 py-6 md:flex-row">
                    <div class="flex flex-col justify-center gap-2">
                        <p class="text-2xl font-bold capitalize">
                            {{ item.name }}
                            <NuxtLink
                                v-if="!contact && item.contact_id"
                                v-tooltip="'Ver na pagina de contato'"
                                :href="`/contatos/${item.contact_id}`"
                                class="opacity-50 hover:text-primary hover:opacity-100"
                            >
                                <Icon name="linkOut" />
                            </NuxtLink>
                        </p>
                        <ul class="grid gap-2 *:flex *:flex-row *:items-center *:gap-1 *:text-sm *:font-light sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                            <li>
                                <Icon name="identification" size=".75rem" class="text-blue-600" />
                                CPF: <strong>{{ item.cpf ?? "- - -" }}</strong>
                            </li>
                            <li>
                                <Icon name="phone" size=".75rem" class="text-blue-600" />
                                Telefone: <strong>{{ item.recipient ? new Mask({ mask: useCountryDDIFind('code', item.country_code!)?.mask }).masked(item.recipient) : "- - -" }}</strong>
                            </li>
                            <li v-if="item.origin?.toLowerCase() === 'unidade'">
                                <Icon name="user" size=".75rem" class="text-blue-600" />
                                vendedor: <strong>{{ item.user?.name ?? "- - -" }}</strong>
                            </li>
                            <li v-else>
                                <Icon name="user" size=".75rem" class="text-blue-600" />
                                Origem: <strong>{{ item.origin ?? "- - -" }}</strong>
                            </li>
                            <li>
                                <Icon name="pay" size=".75rem" class="text-blue-600" />
                                Forma de pagamento: <strong>{{ item.extra_attributes?.forma_de_pagamento ?? "- - -" }}</strong>
                            </li>
                        </ul>
                    </div>
                    <section class="flex flex-initial items-center justify-center divide-x-2 divide-contrast/10 text-center">
                        <div class="flex w-full flex-col gap-4 pr-4 md:w-auto lg:items-end">
                            <p class="text-sm lg:text-end">
                                <strong>
                                    Data de criação:
                                </strong>
                                <br>
                                <span class="font-light">
                                    {{ useDateFormat(new Date(item.created_at), "DD/MM/YYYY").value }}
                                </span>
                            </p>
                            <LazyKycButtonSend
                                :transaction="item.id"
                                :lastAttempt="item.last_attempt"
                                @then="item.last_attempt = $event"
                            />
                        </div>
                        <div class="flex w-full flex-col items-center justify-center gap-3 pl-4 md:w-40">
                            <span
                                class="flex aspect-square size-10 items-center justify-center rounded-full ring-8 ring-contrast-300/10"
                                :style="`background-color: ${item.kycStatus.color};`"
                            >
                                <Icon :name="item.kycStatus.icon!" size="1.25rem" class="text-background" />
                            </span>
                            <p class="m-0 font-bold" :style="`color: ${item.kycStatus.color};`">
                                {{ item.kycStatus.name }}
                            </p>
                        </div>
                    </section>
                </div>
                <p
                    v-if="item.status === 'reproved'"
                    class="flex flex-wrap items-center gap-2 border-t border-background-300 p-4 before:size-2 before:rounded-full before:bg-danger"
                >
                    Clique para saber mais sobre o erro.
                </p>
            </div>
        </template>
        <LazyNoData v-else />
    </Container>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";
    import { Mask } from "maska";

    const {
        contact = null
    } = defineProps<{
        contact?: InternalApi["v1/contacts/:id"]["get"]["data"]["id"]
    }>();

    const {
        data,
        pending,
        pagination,
        paginationInfo,
        filters,
        refresh
    } = useFetchData("v2/kyc/transactions", {
        fetch: {
            params: {
                "filter[contact_id]": contact
            }
        },
        asyncData: {
            transform: (data) => {
                return data.map(item => ({
                    ...item,
                    page: ["approved", "reproved"].includes(item.status),
                    kycStatus: useKycStatus(item.status)
                }));
            }
        },
        preFilters: false
    });

    const click = async (event: MouseEvent, item: NonNullable<typeof data.value>[number]) => {
        const target = event.target as HTMLElement;

        if (item.page && !["BUTTON", "A"].includes(target.tagName)) {
            await navigateTo(`/kyc/${item.id}`);
        }
    };

    defineExpose({
        pending,
        pagination,
        paginationInfo,
        filters,
        refresh
    });
</script>