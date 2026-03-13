<template>
    <Container>
        <LazyNoData v-if="!data" />

        <LazyNotice
            v-else-if="!['APPROVED', 'REPROVED'].includes(useToUpper(data.status))"
            type="warning"
            description="O processo de compliance ainda não foi concluído."
        />

        <section v-else class="flex flex-col gap-10">
            <div class="flex flex-col gap-10 rounded-lg border border-contrast-100/10 p-6">
                <div class="flex flex-row gap-4">
                    <div class="flex aspect-square size-[60px] items-center justify-center rounded-full bg-primary/10 p-4">
                        <Icon name="identification" size="1.8rem" class="text-primary" />
                    </div>
                    <div class="mt-2">
                        <h2 class="text-xl font-bold">
                            Verificação do documento
                        </h2>
                        <p class="text-lg">
                            Identificação e informações do documento
                        </p>
                    </div>
                </div>
                <div class="flex grow flex-col gap-10 lg:ml-20">
                    <div class="flex flex-col gap-6 xl:flex-row">
                        <Grid
                            class="h-fit xs:grid-cols-2 md:grid-cols-3 xl:sticky xl:top-0 xl:grid-cols-2"
                            :items="[
                                {
                                    name: 'status',
                                    badge: {
                                        ...useKycStatus(data.status),
                                        resumeString: 99
                                    },
                                    description: data.reason,
                                    classDescription: 'text-sm font-bold tracking-wide text-danger'
                                },
                                {
                                    name: 'tipo de documento',
                                    description: useToUpper(data?.type)
                                },
                                {
                                    name: 'Data de criação do link',
                                    description: useDate(data.last_attempt)
                                },
                                {
                                    name: 'Data de realização',
                                    slot: 'realization'
                                },
                                {
                                    name: 'Origem',
                                    description: data.origin
                                },
                                {
                                    name: 'Aderente',
                                    slot: 'adherent'
                                },
                                {
                                    name: 'CPF',
                                    description: data.cpf
                                },
                                {
                                    name: 'Data de nascimento',
                                    slot: 'birthdate'
                                },
                                {
                                    name: 'é golpe?',
                                    badge: {
                                        name: data?.fraud ? 'Sim' : 'Não',
                                        color: data?.fraud ? 'danger' : 'success',
                                        variant: 'outline',
                                        icon: false,
                                        class: 'ml-0.5'
                                    }
                                },
                                {
                                    name: 'Contrato',
                                    show: useCheckPermissions('provider:sign'),
                                    slot: 'contract'
                                }
                            ]"
                        >
                            <template #realization>
                                <p v-if="data.started_at">
                                    {{ useDate(data.started_at) }}
                                    <span class="opacity-60">
                                        {{ usePastTime(data.last_attempt, { prefix: 'Fez em', finishAt: data.started_at }) }}
                                    </span>
                                </p>
                            </template>

                            <template v-if="data.birthdate" #birthdate>
                                <LazyBirthdate :date="data.birthdate" />
                            </template>

                            <template #adherent>
                                <div
                                    v-if="data.parent"
                                    class="flex flex-col gap-3 2xl:flex-row"
                                >
                                    <p>
                                        <template v-if="data.is_financial_responsible">
                                            Responsável <br class="hidden 2xl:block"> financeiro
                                        </template>
                                        <template v-else>
                                            Titular
                                        </template>
                                        de:
                                    </p>
                                    <NuxtLink
                                        :to="`./${data.parent.id}`"
                                        class="relative flex flex-row items-center justify-between gap-4 rounded-lg p-2 outline outline-1 outline-transparent transition-all duration-500 hover:text-[--color] hover:outline-[--color]"
                                        :class="{ 'pointer-events-none opacity-50': !['approved', 'reproved'].includes(data.parent.status) }"
                                        :style="`
                                            --color: ${useKycStatus(data.parent.status).color};
                                            background-color: color-mix(in oklab, var(--color) 20%, transparent);
                                        `"
                                    >
                                        <div class="flex flex-col gap-1">
                                            <strong class="line-clamp-1">{{ data.parent.name }}</strong>
                                            <div class="flex flex-row gap-0 divide-x divide-current *:px-1 *:text-sm *:uppercase *:leading-none first:*:pl-0 last:*:pr-0">
                                                <span v-if="data.parent.type">{{ data.parent.type }}</span>
                                                <span class="break-all">{{ data.parent.cpf }}</span>
                                            </div>
                                        </div>
                                        <Icon
                                            :name="useKycStatus(data.parent.status).icon"
                                            :style="`color: ${useKycStatus(data.parent.status).color}`"
                                            class="flex-none"
                                            size="1.5rem"
                                        />
                                        <Icon
                                            name="linkOut"
                                            class="absolute right-1 top-1 opacity-50"
                                            size="0.7rem"
                                        />
                                    </NuxtLink>
                                </div>
                                <p v-else>
                                    Titular e Responsável financeiro
                                </p>
                            </template>

                            <template v-if="data.original_contract_link || data.signed_contract_link" #contract>
                                <div class="flex flex-row divide-x divide-contrast/20 *:flex *:items-center *:gap-1 *:px-4 first:*:pl-0 last:*:pr-0">
                                    <a
                                        v-if="data.original_contract_link"
                                        :href="data.original_contract_link"
                                        target="_blank"
                                        class="link"
                                    >
                                        <Icon name="contract" />
                                        Original
                                    </a>
                                    <a
                                        v-if="data.signed_contract_link"
                                        :href="data.signed_contract_link"
                                        target="_blank"
                                        class="link"
                                    >
                                        <Icon name="sign" />
                                        Assinado
                                    </a>
                                </div>
                            </template>
                        </Grid>

                        <ul class="mx-auto grid size-fit justify-items-center gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:sticky lg:top-0">
                            <li
                                v-for="(attrs, key) in data.images"
                                :key
                                class="h-80 w-full xs:max-w-44"
                            >
                                <ViewMedia
                                    v-bind="attrs"
                                    class="size-full rounded-lg bg-background-300 object-cover shadow"
                                />
                            </li>
                        </ul>
                    </div>

                    <Grid
                        :items="data?.metadata"
                        class="xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    />
                </div>
            </div>

            <div class="flex flex-col gap-10 rounded-lg border border-contrast-100/10 p-6">
                <div class="flex flex-row gap-4">
                    <div class="flex aspect-square size-[60px] items-center justify-center rounded-full bg-primary/10 p-4">
                        <Icon name="shield" size="1.8rem" class="text-primary" />
                    </div>
                    <div class="mt-2">
                        <h2 class="text-xl font-bold">
                            Regras
                        </h2>
                        <p class="text-lg">
                            Validações realizadas que definem o status da consulta
                        </p>
                    </div>
                </div>

                <Grid
                    :items="data.rules"
                    class="xs:grid-cols-2 md:grid-cols-3 lg:ml-[3.75rem] lg:grid-cols-4 xl:lg:grid-cols-5"
                />
            </div>

            <LayoutPortal to="HeaderAfter">
                <ButtonBack />

                <Button
                    v-if="data?.contact_id"
                    color="secondary"
                    :href="`/contatos/${data.contact_id}`"
                >
                    <Icon name="linkOut" />
                    Ver contato
                </Button>

                <LazyKycButtonSend
                    :transaction="data.id"
                    :lastAttempt="data.last_attempt"
                    @then="data.last_attempt = $event"
                />
            </LayoutPortal>
        </section>
    </Container>
</template>

<script setup lang="ts">
    // TODO ADICIONAR ALIAS PARA PARA contatos/:contact/kyc/:kyc
    definePageMeta({
        title: "KYC",
        permissions: {
            list: ["read_contact", "provider:kyc"],
            satisfyAll: true
        }
    });

    const id = String(useRoute().params.id);

    const translated: Record<string, Record<string, string>> = {
        images: {
            front: "Parte da frente do Documento",
            back: "Parte de trás do documento",
            selfie: "Selfie do contato"
        },
        metadata: {
            name: "Nome",
            rgNumberAuthorityState: "RG",
            cpf: "CPF",
            birthDateCityState: "Local e data de nascimento",
            registrationNumber: "Número de registro",
            renachNumber: "Número do renach",
            placeOfIssue: "Estado de emissão",
            issueDate: "Data de emissão",
            expirationDate: "Data de expiração",
            motherName: "Nome da mãe",
            fatherName: "Nome do pai",
            birthDate: "Data de nascimento",
            fullName: "Nome completo",
            placeOfBirth: "Local de nascimento",
            nationality: "Nacionalidade",
            idNumber: "Número da identidade",
            issuingAuthority: "ÓRG emissora / UF da identidade",
            customField2: "1º Habilitação",
            customField3: "CAT HAB",
            sex: "Sexo",
            get idNumber2 () {
                return this.registrationNumber;
            },
            get dateOfBirth () {
                return this.birthDate;
            },
            get fatherFirstName () {
                return this.fatherName;
            },
            get motherFirstName () {
                return this.motherName;
            },
            get dateOfIssue () {
                return this.issueDate;
            },
            get dateOfExpiration () {
                return this.expirationDate;
            },
            get customField1 () {
                return this.cpf;
            }
        },
        rules: {
            has_document: "Documento identificado",
            cpf_query: "CPF consultado",
            over_18: "Maior de 18 anos",
            valid_cpf_number: "Número de CPF válido",
            valid_rg_number: "Número de RG válido",
            parameters_and_document_are_equals: "Os parâmetros são iguais ao documento",
            facematch_is_equal: "Facematch",
            is_not_cancelled: "CPF ativo",
            accepted_terms: "Aceitou os termos"
        }
    };

    const {
        data
    } = await useAsyncData("kyc:id", async () => {
        const {
            data: {
                images,
                metadata,
                rules,
                ...params
            }
        } = await useFetchApi(`v2/kyc/transactions/${id!}`);

        return {
            images: Object.entries(usePick(images, Object.keys(translated.images))).map(([key, value]) => ({
                src: value,
                alt: translated.images?.[key] ?? key
            })),
            metadata: Object.entries(metadata).map(([key, value]) => {
                if (params.type?.toLowerCase() === "rg") {
                    const replacements: Record<string, string> = {
                        idNumber: "rgNumberAuthorityState",
                        idNumber2: "cpf"
                    };

                    key = replacements[key] || key;
                }

                if (key === "sex") {
                    if (value === "M") {
                        value = "Masculino";
                    }
                    else if (value === "F") {
                        value = "Feminino";
                    }
                }

                return {
                    name: translated.metadata?.[key] ?? key,
                    description: value
                };
            }),
            rules: Object.entries(rules).map(([key, value]) => ({
                name: translated.rules?.[key] ?? key,
                badge: {
                    name: value ? "Sim" : "Não",
                    color: (value ? "success" : "danger") as "success" | "danger",
                    variant: "outline" as const,
                    icon: value ? "check" : "close",
                    class: "ml-0.5"
                }
            })),
            ...params
        };
    }, {
        immediate: !!id
    });
</script>