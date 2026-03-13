<template>
    <div
        class="col-span-full flex flex-row form-gap-gutter"
        :class="props.class"
    >
        <SelectElement
            :id="$attrs.id ? `${$attrs.id}-country-code` : undefined"
            ref="selectCode"
            name="country_code"
            label="País"
            :items="useCountryDDIList"
            :native="false"
            :search="true"
            :canClear="false"
            :disabled="props.disabled"
            default="BR"
            labelProp="name"
            valueProp="code"
            addClass="min-w-32"
        >
            <template #option="{ option: { name, code, ddi } }">
                <div class="flex grow flex-row items-center gap-4 capitalize">
                    <Icon :name="icon(code)" size="1.2rem" />
                    <div class="flex flex-col gap-0.5 *:text-xs *:leading-none">
                        <span>
                            {{ ddi }}
                        </span>
                        <span class="grow opacity-60">
                            {{ name }}
                        </span>
                    </div>
                </div>
            </template>
            <template #single-label="{ value: { code } }">
                <div class="flex grow flex-row items-center gap-4 pl-6 capitalize">
                    <Icon :name="icon(code)" size="1.2rem" />
                    <span>
                        {{ code }}
                    </span>
                </div>
            </template>
        </SelectElement>
        <TextElement
            ref="inputTel"
            v-maska="{ mask: countryDDI?.mask }"
            name="phone"
            label="Telefone"
            :placeholder="countryDDI?.mask?.at(0)?.replaceAll('#', '0')"
            addClass="grow"
            :disabled="props.disabled"
            v-bind="$attrs"
        />
    </div>
</template>

<script setup lang="ts">
    import { vMaska } from "maska/vue";

    defineOptions({
        inheritAttrs: false
    });

    const props = defineProps<{
        disabled?: boolean
        class?: string
    }>();

    const selectCode = ref();
    const inputTel = ref();

    const countryDDI = computed(() => {
        return useCountryDDIFind("code", selectCode.value?.value);
    });

    watch(() => selectCode.value?.value, (_, oldCode) => {
        if (oldCode) {
            const find = useCountryDDIFind("code", oldCode);

            if (find && inputTel.value.value) {
                inputTel.value?.update(String(inputTel.value.value).replace(find.ddi, ""));
            }
        }
    }, {
        immediate: true
    });

    const icon = (code: unknown) => `flagpack:${String(code).toLowerCase()}`;
</script>