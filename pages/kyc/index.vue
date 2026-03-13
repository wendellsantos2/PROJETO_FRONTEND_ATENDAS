<!-- eslint-disable vue/no-v-html -->
<template>
    <div class="flex grow flex-col">
        <KycPage
            ref="listing"
        />

        <LayoutPortal to="HeaderBefore">
            <Button
                v-slot="scope"
                v-tooltip="'Sincronizar'"
                color="success"
                noChangeLoading
                :action="async() => await listing?.refresh()"
            >
                <Icon
                    name="sync"
                    size="1.2rem"
                    :class="{ 'animate-spin': scope.loading }"
                />
            </Button>
            <Button
                variant="gradient"
                @click="modalProcess?.toggle()"
            >
                <span class="hidden sm:block">
                    Adicionar
                </span>
                <Icon name="plus" class="sm:hidden" />
            </Button>
            <Button
                v-if="useCheckPermissions('create_contact')"
                v-tooltip="'Importar lista'"
                color="contrast"
                @click="modalImport?.toggle()"
            >
                <Icon name="upload" />
            </Button>
        </LayoutPortal>

        <LazyModal
            ref="modalProcess"
            v-slot="{ context }"
            title="Criar formulário"
            size="xs"
            :contextInitial="{ id: 0, form: { origin: 'unit' } }"
        >
            <Vueform
                v-model="context.form"
                sync
                :endpoint="false"
                @submit="newProcess($event.data)"
            >
                <SelectElement
                    name="origin"
                    label="Origem"
                    default="unit"
                    :items="{
                        unit: 'Unidade',
                        telesales: 'Televendas',
                        website: 'Website',
                        innovare: 'Innovare',
                        freelancer: 'Freelancer',
                        clinic: 'Clínica'
                    }"
                    :native="false"
                    :canClear="false"
                    rules="required"
                />

                <TransitionHeight>
                    <LazySelectUser
                        v-if="context.form?.origin === 'unit'"
                        name="seller_id"
                        label="Colaborador"
                        placeholder="Selecione um colaborador"
                        rules="required"
                    />
                </TransitionHeight>

                <SelectElement
                    name="method"
                    label="Método"
                    default="affiliation"
                    :items="{
                        affiliation: 'Filiação',
                        refill: 'Refiliação',
                        change_payment: 'Alteração da forma de pagamento',
                        migrate: 'Migração'
                    }"
                    :native="false"
                    :canClear="false"
                    rules="required"
                />

                <SelectElement
                    name="payment_type"
                    label="Forma de pagamento"
                    default="credit_card"
                    :items="{
                        credit_card: 'Cartão de Crédito',
                        debt_card: 'Cartão de Débito',
                        debt: 'Débito em Conta',
                        energy_concessionaire: 'Concessionária de Energia'
                    }"
                    :native="false"
                    :canClear="false"
                    rules="required"
                />

                <SelectElement
                    v-if="useCheckPermissions('provider:sign')"
                    name="contract_template_id"
                    label="Template do contrato"
                    placeholder="Selecione um template"
                    :items="contractTemplate.data.value!"
                    valueProp="id"
                    labelProp="name"
                    :native="false"
                    :canClear="false"
                    :loading="contractTemplate.status.value === 'pending'"
                    search
                    closeOnSelect
                    @searchChange="contractTemplateSearch = $event"
                />

                <Button class="col-span-full">
                    Criar
                </Button>
            </Vueform>
        </LazyModal>

        <LazyModal
            ref="modalImport"
            title="Enviar arquivo"
            size="lg"
        >
            <div class="flex flex-col gap-6">
                <LazyNotice type="warning" description="Algumas colunas da planilha precisam ser modificadas para que a importação funcione corretamente." />
                <p class="flex flex-wrap gap-1">
                    Inclua as colunas:
                    <span
                        v-for="(parameter) in ['Franquia', 'Matricula', 'Nome <small class=text-danger>(anteriormente: Filiado)</small>', 'Telefone', 'Cartao <small class=text-danger>(anteriormente: Nome)</small>', 'Data', 'Vendedor', 'Login Vendedor', 'Prospeccao']"
                        :key="parameter"
                        class="rounded-full bg-primary/15 px-2 py-px"
                        v-html="parameter"
                    />
                </p>

                <p class="inline-flex gap-1">
                    Envie o arquivo nos seguintes formatos:
                    <span
                        v-for="(type) in accept.split(',')"
                        :key="type"
                        class="rounded-full bg-secondary/20 px-2 py-px"
                    >
                        {{ type }}
                    </span>
                </p>

                <div class="overflow-auto rounded-xl bg-background-100 p-4 pt-2">
                    <Table
                        :data="[
                            { id: 1, franquia: 'ATENDAS', matricula: '123456', name: 'Mario', telefone: '55919191919', pagamento: 'VISA', data: '2022-01-01', vendedor: 'Vendedor 1', login: 'login@teste.com', prospeccao: 'FILIAÇÃO' }
                        ]"
                        :thead="[
                            { name: 'Franquia', propertyPath: 'franquia' },
                            { name: 'Matricula', propertyPath: 'matricula' },
                            { name: 'Nome', propertyPath: 'name' },
                            { name: 'Telefone', propertyPath: 'telefone' },
                            { name: 'Cartao', propertyPath: 'pagamento' },
                            { name: 'Data', propertyPath: 'data' },
                            { name: 'Vendedor', propertyPath: 'vendedor' },
                            { name: 'Login', propertyPath: 'login' },
                            { name: 'Prospeccao', propertyPath: 'prospeccao' }
                        ]"
                    />
                </div>

                <Button
                    ref="inputFile2"
                    class="w-full"
                    :class="{ 'animate-pulse !border-primary': dragEvent }"
                    :loading="uploading"
                    @click="fileDialog.open"
                >
                    <Icon name="upload" />
                    Adicionar aquivo de contatos
                </Button>
            </div>
        </LazyModal>
    </div>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "KYC ConectaHub",
        logo: "kyc",
        navOrder: 45,
        icon: "kyc",
        permissions: {
            list: ["read_contact", "provider:kyc"],
            satisfyAll: true
        },
        layoutConfig: {
            search: true,
            filters: {
                period: {
                    type: "dates",
                    label: "Período",
                    placeholder: "Selecione o período",
                    valueFormat: "YYYY-MM-DD",
                    mode: "range"
                },
                status: {
                    type: "select",
                    label: "Situação",
                    placeholder: "Selecione a situação",
                    items: Object.entries(useKycStatusObj).filter(([key]) => !["pending_ocr", "waiting_documents"].includes(key)).map(([value, { name }]) => ({ value: useLowerCase(value), label: name }))
                }
            }
        }
    });

    const listing = useTemplateRef("listing");

    useBusLayout().on((event) => {
        if ("search" in event) {
            listing.value!.filters.search = event.search;
        }

        if (event?.filters && listing.value!.filters) {
            listing.value!.filters = Object.assign(listing.value!.filters, event.filters);
        }
    });

    // TODO Criar componente de select fetch para evitar isso
    const contractTemplateSearch = ref("");
    const contractTemplate = useLazyAsyncData("contract-templates:search", async () => {
        const _data = await useFetchApi("connectasign/contract-templates", {
            params: {
                "filter[name]": contractTemplateSearch.value
            }
        });

        return _data.data;
    });

    watchDebounced(contractTemplateSearch, () => contractTemplate.refresh(), {
        debounce: 200,
        maxWait: 1000,
        deep: true
    });

    const accept = ".xlsx,.xls,.csv";
    const dragEvent = useDragEvent();
    const uploading = ref(false);
    const inputFile = ref<HTMLButtonElement>();
    const inputFile2 = ref<HTMLButtonElement>();
    const fileDialog = useFileDialog({
        reset: true,
        accept
    });

    const modalProcess = useModal();

    const {
        $user
    } = useNuxtApp();

    const newProcess = (data: Record<string, unknown>) => {
        const params = Object.entries(data).map(([k, v]) => `${k}=${v}`).join("&");

        return navigateTo(`/externo/contato/cadastro?form_id=${$user.value?.company.kyc_form_hash}&${params}`, {
            open: {
                target: "_blank"
            }
        });
    };

    const modalImport = useModal();

    const uploadFile = async (baseFiles: FileList | File[] | null | undefined) => {
        uploading.value = true;
        const _file = baseFiles?.[0];
        const extension = _file?.name?.split(".")?.at(-1);

        try {
            if (_file && accept.split(",").includes(`.${extension}`)) {
                await useFetchApi("v1/contacts/import", {
                    method: "POST",
                    body: useFormData({
                        list_contacts: _file,
                        has_compliance: 1
                    })
                });

                modalImport.value?.toggle(false);
                await listing.value?.refresh();
            }
        }
        finally {
            uploading.value = false;
        }
    };

    useDropZone(inputFile, uploadFile);
    fileDialog.onChange(uploadFile);
</script>