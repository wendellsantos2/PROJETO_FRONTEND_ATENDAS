<template>
    <FormElements class="col-span-full">
        <Divider
            title="Ramal web"
            class="col-span-full"
        />

        <SelectElement
            name="voip_token"
            label="Ramal"
            placeholder="Selecione um ramal"
            :native="false"
            :search="true"
            :items="ramais!"
            closeOnSelect
            addClass="sm:col-span-6 xl:col-span-4"
        />

        <TextElement
            ref="voipUsername"
            name="voip_username"
            label="Nome"
            placeholder="ramal - 0*0*0"
            disabled
            addClass="hidden"
        />

        <div class="col-span-full flex flex-row items-center justify-between gap-4 sm:col-span-6 xl:col-span-4">
            <span>
                Serviço disponível para esse usuário?
            </span>
            <ToggleElement
                name="voip_active"
                :default="false"
                :labels="{ on: 'Sim', off: 'Não' }"
                addClass="col-span-4"
            />
        </div>
    </FormElements>
</template>

<script setup lang="ts">
    const props = defineProps<{
        contextForm: Record<string, any>
    }>();

    const { data: ramais } = useLazyAsyncData("dazsoft:search", async () => {
        const { data: _data } = await useFetchApi("third-party/dazsoft/ramais", {
            params: {
                per_page: 99
            }
        });

        return _data.map((v) => {
            return {
                value: v.data.token,
                label: v.data.user
            };
        });
    });

    const voipUsername = ref();

    watch(() => props.contextForm?.settings?.voip_token, (token) => {
        if (voipUsername.value) {
            voipUsername.value?.update(ramais.value?.find(({ value }) => value === token)?.label);
        }
    });
</script>