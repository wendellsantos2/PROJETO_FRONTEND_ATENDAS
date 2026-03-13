<template>
    <TablePage
        ref="tablePage"
        request="v1/contacts"
        :thead="[
            { name: 'Nome', slot: 'name' },
            { name: 'Recipiente', propertyPath: `services.${data!.provider?.service.split('-').at(0)}` },
            ...tableParameters,
            { name: 'Enviado', slot: 'sent' },
            { name: 'Disparo', slot: 'status' }
        ]"
        :opts="{
            preFilters: false,
            fetch: {
                params: {
                    'filter[campaign_id]': data!.id
                }
            }
        }"
        :itemClick="
            useCheckPermissions(['read_contact', 'update_contact'])
                ? ({ id }) => navigateTo(`/contatos/${id}`)
                : false
        "
    >
        <template #name="{ avatar_url, name }">
            <div class="flex flex-row items-center gap-3">
                <img
                    :src="avatar_url"
                    class="block size-8 rounded-full bg-background object-cover object-center"
                >
                <p>
                    {{ name }}
                </p>
            </div>
        </template>

        <template #sent="{ sent_at }">
            <template v-if="sent_at">
                {{ usePastTime(sent_at) }}
            </template>
            <span v-else class="opacity-50">
                Não enviado :(
            </span>
        </template>

        <template #status="{ id: contactId, send }">
            <Vueform
                :removeClasses="{
                    FormElements: {
                        container: ['form-gap-x-gutter'],
                        container_sm: ['form-gap-x-gutter-sm'],
                        container_lg: ['form-gap-x-gutter-lg']
                    }
                }"
            >
                <ToggleElement
                    :key="send"
                    v-tooltip="`${send ? 'Desativar' : 'Ativar'} disparo`"
                    name="shoot"
                    :default="send"
                    @change="toggleSend(contactId, $event)"
                    @click.stop
                />
            </Vueform>
        </template>

        <template #actions="{ conversation_id }">
            <ConversationTableActionsMenu
                v-if="conversation_id"
                :conversation="conversation_id"
                :conversationTableModals
            />
        </template>

        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('create_contact')"
                    variant="gradient"
                    @click="modalFileUpload?.toggle()"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar aquivo de contatos
                    </span>
                </Button>
            </LayoutPortal>

            <TransitionOpacity>
                <div
                    v-if="useCheckPermissions('create_contact')"
                    v-show="dragEvent || uploading"
                    ref="inputFile"
                    class="absolute inset-0 z-999 flex flex-col items-center justify-center gap-4 transition-all duration-500"
                    :class="{
                        'bg-primary/20 text-primary': dragEvent,
                        'bg-success/20 text-success': uploading
                    }"
                >
                    <Icon
                        :name="dragEvent ? 'upload' : 'uploading'"
                        size="5rem"
                    />
                    Solte aqui para adicionar o aquivo de contatos
                </div>
            </TransitionOpacity>

            <LazyModal
                ref="modalFileUpload"
                title="Enviar arquivo"
                size="sm"
            >
                <div class="flex flex-col gap-6">
                    <p class="inline-flex items-center gap-1">
                        Inclua as colunas:
                        <span
                            v-for="(parameter) in ['nome', 'recipiente', ...tableParameters.map(({ name }) => name)]"
                            :key="parameter"
                            class="rounded-full bg-primary/20 px-2 py-px"
                        >
                            {{ parameter }}
                        </span>
                    </p>

                    <p class="inline-flex items-center gap-1">
                        Envie o arquivo nos seguintes formatos:
                        <span
                            v-for="(type) in accept.split(',')"
                            :key="type"
                            class="rounded-full bg-secondary/20 px-2 py-px"
                        >
                            {{ type }}
                        </span>
                    </p>

                    <p>
                        O arquivo deve se parecer com isso:
                    </p>

                    <div class="rounded-xl bg-background-100 p-4 pt-2">
                        <Table
                            :data="[
                                { id: 1, name: 'Mario', recipiente: '55919191919' },
                                { id: 2, name: 'Lucas', recipiente: '55919191919' },
                                { id: 3, name: 'Kelly', recipiente: '55919191919' },
                                { id: 4, name: 'Juana', recipiente: '55919191919' }
                            ]"
                            :thead="[
                                { name: 'Nome', propertyPath: 'name' },
                                { name: 'Recipiente', propertyPath: 'recipiente' },
                                ...tableParameters
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

            <ConversationTableModals ref="conversationTableModals" />
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    import type { ConversationTableModals } from "~/components/Conversation/Table/ActionsMenu.vue";
    import { symbolKey } from "../[campaign].vue";

    definePageMeta({
        navOrder: 10,
        permissions: "read_contact",
        layoutConfig: {
            search: true
        }
    });

    const {
        data
    } = inject(symbolKey)!;

    const tablePage = useTablePage();

    useBusLayout().on((event) => {
        if ("search" in event) {
            tablePage.value!.filters.search = event.search;
        }
    });

    const tableParameters = computed(() => {
        const map = data.value!
            .template
            ?.parameters
            ?.filter(parameter => parameter !== "nome")
            ?.map((parameter) => {
                return {
                    name: parameter,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    propertyPath: `metadata.${parameter}` as any
                };
            });

        return map ?? [];
    });

    const toggleSend = async (contactId: number, send: boolean) => {
        await useFetchApi(`v1/campaigns/${data.value!.id}/contacts/${contactId}`, {
            method: "PUT",
            body: {
                send
            }
        });
    };

    const accept = ".xlsx,.xls,.csv";
    const dragEvent = useDragEvent();
    const uploading = ref(false);

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
                        campaign_id: data.value!.id
                    })
                });

                modalFileUpload.value?.toggle(false);
            }
        }
        finally {
            uploading.value = false;
        }
    };

    const inputFile = ref<HTMLButtonElement>();
    const inputFile2 = ref<HTMLDivElement>();
    const fileDialog = useFileDialog({
        reset: true,
        accept
    });

    useDropZone(inputFile, uploadFile);
    useDropZone(inputFile2, uploadFile);
    fileDialog.onChange(uploadFile);

    const modalFileUpload = useModal();
    const conversationTableModals = ref<ConversationTableModals>();

    usePusher({
        name: "private-campaigns.{id}",
        id: data.value!.id
    }, {
        upsertContact (_data) {
            tablePage.value?.upSert(_data);
        },
        deleteContact ({ id }) {
            tablePage.value?.remove(id);
        }
    }, {
        delay: 1500
    });
</script>