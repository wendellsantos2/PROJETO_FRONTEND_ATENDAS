<template>
    <Modal
        ref="modal"
        :title="`${modal?.context.id ? 'editar' : 'criar'} ticket`"
        :contextInitial
        size="xs"
    >
        <Vueform
            v-model="modal!.context.form"
            sync
            :endpoint="false"
            @submit="upSert"
        >
            <FormElements
                v-if="$user.value?.id === modal?.context.user_id || !modal?.context.id"
                class="col-span-full"
            >
                <TextElement
                    name="subject"
                    label="Assunto"
                    placeholder="Ferias"
                    rules="required|min:1"
                />

                <TextareaElement
                    name="content"
                    label="Descrição"
                    placeholder="Estou precisando de ferias..."
                    rules="required|min:1"
                />

                <LazySelectTags
                    v-if="isCreator"
                    type="ticket"
                />

                <LazySelectCategories
                    v-if="!modal?.context.id"
                    rules="required|min:1"
                />
            </FormElements>

            <VFileElement
                v-if="!modal?.context.id"
                name="upload_id"
                label="Anexar mídia"
            />

            <FormElements
                v-if="modal?.context.id && useCheckPermissions('assign_ticket')"
                class="col-span-full"
            >
                <SelectElement
                    ref="selectStatus"
                    name="status_id"
                    label="Situação"
                    placeholder="Selecione uma situação"
                    :default="modal?.context.status_id"
                    :native="false"
                    :search="true"
                    :items="statuses!"
                    valueProp="id"
                    labelProp="name"
                    closeOnSelect
                >
                    <template #option="{ option: { name, color } }">
                        <div class="flex grow flex-row items-center gap-4 capitalize">
                            <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                            <span>
                                {{ name }}
                            </span>
                        </div>
                    </template>
                    <template #single-label="{ value: { name, color } }">
                        <div class="flex grow flex-row items-center gap-4 pl-4 capitalize">
                            <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                            <span>
                                {{ name }}
                            </span>
                        </div>
                    </template>
                </SelectElement>

                <SelectElement
                    ref="selectPriority"
                    name="priority_id"
                    label="Prioridade"
                    placeholder="Selecione uma prioridade"
                    :default="modal?.context.priority_id"
                    :native="false"
                    :search="true"
                    :items="priorities!"
                    valueProp="id"
                    labelProp="name"
                    closeOnSelect
                >
                    <template #option="{ option: { name, color } }">
                        <div class="flex grow flex-row items-center gap-4 capitalize">
                            <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                            <span>
                                {{ name }}
                            </span>
                        </div>
                    </template>
                    <template #single-label="{ value: { name, color } }">
                        <div class="flex grow flex-row items-center gap-4 pl-4 capitalize">
                            <span class="rounded-full p-3" :style="`background-color: ${color}`" />
                            <span>
                                {{ name }}
                            </span>
                        </div>
                    </template>
                </SelectElement>

                <DateElement
                    label="SLA"
                    name="deadline"
                    placeholder="Defina uma data"
                    :min="new Date().toJSON().slice(0, 10)"
                />
            </FormElements>

            <Button class="col-span-full" :loading>
                <Icon name="upload" />
                Salvar
            </Button>
        </Vueform>
    </Modal>
</template>

<script setup lang="ts">
    const emits = defineEmits<{
        then: []
        finally: []
    }>();

    const contextInitial = {
        id: 0,
        user_id: 0 as undefined | number,
        status_id: undefined as undefined | number,
        priority_id: undefined as undefined | number,
        form: {} as Record<string, any>
    };

    const modal = useModal<typeof contextInitial>();
    const { $user } = useNuxtApp();
    const isCreator = computed(() => {
        return $user.value?.id === modal.value?.context.user_id || !modal.value?.context.id;
    });

    const selectStatus = ref();

    const { data: statuses, execute } = useLazyAsyncData("statuses:search", async () => {
        const { data: _data } = await useFetchApi("v1/statuses", {
            params: {
                per_page: 999
            }
        });

        return _data;
    }, {
        immediate: false
    });

    watch(selectStatus, execute, { once: true });

    const selectPriority = ref();

    const { data: priorities, execute: execute2 } = useLazyAsyncData("priorities:search", async () => {
        const { data: _data } = await useFetchApi("v1/priorities", {
            params: {
                per_page: 999
            }
        });

        return _data;
    }, {
        immediate: false
    });

    watch(selectPriority, execute2, { once: true });

    const loading = ref(false);

    const upSert = async () => {
        loading.value = true;

        const id = modal.value?.context.id;
        const body = modal.value?.context.form;

        await useFetchApi(`v1/tickets/${id || ""}`, {
            method: id ? "PUT" : "POST",
            body: useOmitBy(body, v => [null, undefined].includes(v))
        })
            .then(() => {
                modal.value?.toggle(false);
                emits("then");
            })
            .finally(() => {
                loading.value = false;
                emits("finally");
            });
    };

    defineExpose({
        toggle: (...ags: Parameters<NonNullable<typeof modal.value>["toggle"]>) => modal.value?.toggle(...ags)
    });
</script>