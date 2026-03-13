<template>
    <Vueform
        :endpoint="false"
        size="md"
        class="flex grow"
        :overrideClasses="{
            FormElements: {
                container: 'flex flex-col grow',
                container_md: ''
            }
        }"
        @submit="submit"
    >
        <div class="relative grow">
            <FormElements class="mask-transparent-border absolute inset-0 gap-4 overflow-auto p-4 [--size:1rem] first:*:mt-auto last:*:mb-auto">
                <TextElement
                    name="name"
                    label="Nome"
                    placeholder="Leonardo Silva"
                    rules="required"
                />
                <TextElement
                    name="email"
                    label="E-mail"
                    placeholder="email@exemple.com"
                    rules="required|email"
                />
                <InputPhone
                    name="phone"
                    label="Celular"
                    rules="required"
                />
                <TextareaElement
                    name="content"
                    label="Assunto"
                    placeholder="Gostaria de..."
                    rules="required"
                />
            </FormElements>
        </div>
        <div class="p-4 pt-0">
            <Button
                class="col-span-12 mx-auto w-full"
                :loading
            >
                <Icon name="login" />
                Iniciar
            </Button>
        </div>
    </Vueform>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    type Webchat = InternalApi["webchat/:to/init"]["post"]["data"];

    const props = defineProps<{
        to: string
    }>();

    const emits = defineEmits<{
        then: [data: Webchat]
        finally: []
    }>();

    const loading = ref(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submit = async ({ data }: { data: Record<string, any> }) => {
        loading.value = true;

        await useFetchApi(`webchat/${props.to}/init`, {
            method: "POST",
            body: data,
            onResponseError: undefined
        })
            .then(({ data }) => {
                emits("then", data);
            })
            .finally(() => {
                loading.value = false;
                emits("finally");
            });
    };
</script>