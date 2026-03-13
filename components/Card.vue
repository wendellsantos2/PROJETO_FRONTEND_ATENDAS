<template>
    <li
        class="flex flex-col justify-between gap-4 rounded-2xl bg-background p-4 shadow"
    >
        <slot
            :value="props.data"
        />

        <div class="flex flex-row items-start justify-between gap-3">
            <h5 class="items-center font-bold">
                <span class="text-secondary">
                    #{{ props.data.id }}
                </span>
                <slot
                    name="titleBefore"
                    :value="props.data"
                />
                {{ props.data.name }}
                <slot
                    name="titleAfter"
                    :value="props.data"
                />
            </h5>
            <Vueform
                v-if="props.toggle && props.data.is_active !== undefined"
                v-model="form"
                sync
                :removeClasses="{
                    FormElements: {
                        container: ['form-gap-x-gutter'],
                        container_sm: ['form-gap-x-gutter-sm'],
                        container_lg: ['form-gap-x-gutter-lg']
                    }
                }"
            >
                <ToggleElement
                    name="is_active"
                    @change="(v: boolean) => v !== props.data.is_active ? emit('toggle', { id: props.data.id, value: v }) : null"
                />
            </Vueform>
        </div>
        <p>
            {{ props.data.description }}
        </p>
        <div class="flex flex-row items-center justify-between gap-4">
            <Button
                v-if="props.edit"
                @click="emit('edit', props.data)"
            >
                {{ props.buttonText ?? "Clique para editar" }}
            </Button>

            <div class="flex flex-row items-center justify-between gap-4">
                <slot name="buttons" />
                <Button
                    v-if="props.delete"
                    v-tooltip="'Deletar'"
                    color="danger"
                    class="!px-2"
                    @click="emit('delete', props.data)"
                >
                    <Icon name="delete" />
                </Button>
            </div>
        </div>
    </li>
</template>

<script setup lang="ts" generic="T extends BaseData">
    export type BaseData = {
        [key: string | number]: any
        id: number
        name: string
        is_active?: boolean
        description: string
    };

    const props = defineProps<{
        data: T
        toggle?: boolean
        edit?: boolean
        delete?: boolean
        buttonText?: string
    }>();

    const emit = defineEmits<{
        toggle: [value: { id: number, value: boolean }]
        edit: [value: T]
        delete: [value: T]
    }>();

    const form = ref({
        is_active: props.data.is_active
    });

    watch(() => props.data.is_active, (v) => {
        form.value.is_active = v;
    });
</script>