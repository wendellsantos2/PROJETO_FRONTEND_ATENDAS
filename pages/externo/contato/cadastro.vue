<template>
    <TransitionTranslateX>
        <div
            v-if="stage"
            class="flex flex-col items-center gap-6 text-center"
        >
            <div class="relative aspect-square w-full max-w-xs overflow-hidden rounded-full bg-background-100 p-12">
                <TransitionOpacity mode="out-in">
                    <Icon
                        v-if="stage.icon"
                        :key="stage.icon"
                        :name="stage.icon"
                        class="!size-full opacity-50"
                        :class="{ [`text-${stage.color}`]: stage.color }"
                    />
                    <VSvg
                        v-else-if="stage.svg"
                        :key="stage.svg"
                        :name="stage.svg"
                    />
                </TransitionOpacity>
                <TransitionOpacity mode="out-in">
                    <Icon
                        v-show="stage.searching"
                        name="search"
                        size="5rem"
                        class="search absolute left-1/2 top-1/2 text-primary"
                    />
                </TransitionOpacity>
            </div>
            <TransitionTranslateY mode="out-in">
                <h3
                    :key="stage.title"
                    class="font-medium"
                >
                    {{ stage.title }}
                </h3>
            </TransitionTranslateY>
            <TransitionGroupScale>
                <Notice
                    v-for="(description, key) in stage.notice?.split('|')"
                    :key
                    :type="stage.color ?? 'warning'"
                    :title="false"
                    :description="description"
                    class="*:text-start"
                />
            </TransitionGroupScale>
            <TransitionOpacity mode="out-in">
                <Button
                    v-if="loading"
                    color="danger"
                    @click="() => controller.abort()"
                >
                    <Icon name="cancel" />
                    Cancelar
                </Button>
                <Button
                    v-else-if="error"
                    @click="error = ''"
                >
                    <Icon name="back" />
                    Atualizar dados
                </Button>
            </TransitionOpacity>
        </div>

        <Vueform
            v-else
            v-model="form"
            sync
            :endpoint="false"
            class="w-full"
            @submit="submit"
        >
            <ObjectElement name="contacts">
                <TransitionHeight
                    v-for="key in 2"
                    :key
                >
                    <FormElements
                        v-if="key === 1 || !form.contacts?.[1]?.is_financial_responsible"
                        class="col-span-full"
                    >
                        <ObjectElement
                            :name="`${key}`"
                            :class="{ 'rounded-2xl bg-soft px-3 py-4': key === 2 }"
                        >
                            <h4
                                v-if="key === 2"
                                class="col-span-12 text-lg font-bold tracking-wide"
                            >
                                Preencha os dados do responsável financeiro
                            </h4>

                            <TextElement
                                name="name"
                                label="Nome completo"
                                autocomplete="name"
                                placeholder="Digite seu nome completo"
                                rules="required"
                            />

                            <InputDocument />

                            <TextElement
                                name="email"
                                label="Email"
                                autocomplete="email"
                                placeholder="Digite seu email"
                                rules="required|email"
                            />

                            <InputDate />

                            <InputPhone
                                name="phone"
                                label="Digite seu celular"
                                rules="required"
                            />

                            <CheckboxElement
                                v-if="key === 1"
                                name="is_financial_responsible"
                                :default="true"
                                :addClasses="{
                                    CheckboxElement: {
                                        wrapper: ['items-center']
                                    }
                                }"
                            >
                                Confirmo que sou o <strong class="font-bold">responsável financeiro</strong> desta conta
                            </CheckboxElement>
                        </ObjectElement>
                    </FormElements>
                </TransitionHeight>
            </ObjectElement>

            <TextElement
                v-if="params?.payment_type === 'energy_concessionaire'"
                name="concessionaire_code"
                label="Unidade consumidora"
                placeholder="05569123746"
                rules="required"
            />
            <FormElements
                v-else-if="params?.payment_type === 'debt'"
                class="col-span-full"
            >
                <SelectElement
                    name="debt_bank"
                    label="Banco"
                    placeholder="Selecione um banco"
                    :items="['Bradesco', 'Caixa Econômica Federal', 'Itaú', 'Santader', 'Sicoob']"
                    :native="false"
                    :canClear="false"
                    rules="required"
                />
                <TextElement
                    v-maska="'####'"
                    name="debt_last_digits"
                    label="4 últimos dígitos da Conta Bancária"
                    placeholder="0000"
                    rules="required"
                    :addClass="{
                        input: '!tracking-[1rem] placeholder:tracking-[1rem]'
                    }"
                />
            </FormElements>

            <Button
                size="lg"
                :loading
                class="col-span-full"
                type="submit"
            >
                <Icon name="check" />
                Enviar
            </Button>
        </Vueform>
    </TransitionTranslateX>
</template>

<script setup lang="ts">
    import { vMaska } from "maska/vue";

    definePageMeta({
        layout: "auth",
        title: "Cadastro de Contato",
        scrollToTop: false
    });

    useSeoMeta({
        title: "Cadastro de Contato"
    });

    const params = useUrlSearchParams<{
        form_id: string
        seller_id: number
        payment_type: string
        method: string
    }>();

    if (!params.form_id) {
        throw createError({
            statusCode: 400,
            message: "Não conseguimos encontrar esse formulário!",
            fatal: true
        });
    }

    type Form = {
        contacts?: Record<string, Partial<{
            name: string
            document_number: string
            email: string
            birthdate: string
            country_code: string
            phone: string
            is_financial_responsible: boolean
            channel_name: string
            channel_value: string
        }>>
        concessionaire_code?: string
        debt_bank?: string
        debt_last_digits?: string
    };

    const form = ref<Form>({});
    const loading = ref(false);
    const error = ref("");
    const validatingCPF = ref(false);
    const submitted = autoResetRef(false, 5000);

    const stage = computed(() => {
        if (loading.value) {
            if (validatingCPF.value) {
                return {
                    icon: "receita",
                    searching: true,
                    title: "Um momento estamos consultando o CPF na Receita Federal...",
                    notice: "Isso pode demorar um pouco, em média 2 minutos"
                };
            }
            else {
                return {
                    icon: "user",
                    searching: true,
                    title: "Validando os dados do contato"
                };
            }
        }
        else if (submitted.value) {
            return {
                svg: "send-form" as const,
                title: "Formulário enviado com sucesso!"
            };
        }
        else if (error.value) {
            return {
                icon: "error",
                color: "danger" as const,
                title: "OH não! Não foi possível cadastrar",
                notice: error.value
            };
        }
        return null;
    });

    let controller: AbortController;

    const submit = async () => {
        loading.value = true;
        validatingCPF.value = false;
        setTimeout(() => validatingCPF.value = true, 10 * 1000);
        controller = new AbortController();

        const body = {
            ...useOmit(params, ["form_id"]),
            ...useOmit(form.value, ["contacts"]),
            contacts: Object.values(form.value.contacts!).map(contact => ({
                ...contact,
                is_financial_responsible: contact.is_financial_responsible ?? true
            }))
        };

        const prefix = (path: string) => {
            return body.contacts.length === 2
                ? `${path.includes("0") ? "Aderente" : "Responsável financeiro"}: `
                : "";
        };

        await useFetchApi(`webhooks/contact/${params.form_id}`, {
            signal: controller?.signal,
            method: "POST",
            body,
            onResponseError ({ response: { _data } }) {
                const data = _data.data as Record<string, string>;

                error.value = Object
                    .entries(data)
                    .map(([path, value]) => `${prefix(path)}${value}`)
                    .join("|");
            }
        })
            .then(() => {
                form.value = {};
                submitted.value = true;
            })
            .finally(() => {
                loading.value = false;
            });
    };
</script>

<style lang="css" scoped>
    .search {
        position: absolute;
        animation: searchAnimation 5s infinite cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    @keyframes searchAnimation {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        25% {
            transform: translate(-80%, -100%) rotate(15deg) scale(1.2);
        }
        50% {
            transform: translate(-70%, -20%) rotate(100deg);
        }
        75% {
            transform: translate(20%, -100%) rotate(-30deg) scale(1.5);
        }
        100% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
    }
</style>