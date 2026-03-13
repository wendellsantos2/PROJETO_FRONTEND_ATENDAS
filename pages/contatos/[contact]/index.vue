<template>
    <Container>
        <LayoutPortal to="HeaderAfter">
            <ButtonBack />

            <Button
                v-if="useCheckPermissions(['create_contact', 'update_contact'])"
                color="success"
                :action="upSert"
            >
                <Icon name="upload" />
                {{ contact ? "Salvar" : "Criar" }}
            </Button>

            <Button
                v-if="contact && useCheckPermissions('delete_contact')"
                type="button"
                color="danger"
                @click="confirmeDelete?.toggle(true, usePick(data!, ['id', 'name']))"
            >
                <Icon name="delete" />
                Deletar
            </Button>
        </LayoutPortal>

        <template v-if="data">
            <div class="flex flex-col gap-6 md:flex-row">
                <div class="m-auto flex-none xl:mx-16">
                    <img
                        :src="data.avatar_url"
                        :alt="data.name"
                        class="aspect-square w-32 rounded-full"
                    >
                    <div class="-mt-2 flex grow flex-row flex-wrap items-center justify-center gap-2">
                        <Badge
                            v-if="data.metadata?.kyc_status"
                            v-bind="useKycStatus(data.metadata.kyc_status)"
                            icon="kyc"
                            variant="subtle"
                            :resumeString="0"
                            size="sm"
                        />

                        <Badge
                            v-if="data.metadata?.hubspot_id"
                            name="Sincronizado com Hubspot"
                            :resumeString="0"
                            color="contrast"
                            icon="hubspot"
                            size="sm"
                            variant="solid"
                        />
                    </div>
                </div>

                <Grid
                    :items="[
                        {
                            name: 'nome',
                            slot: 'name'
                        },
                        {
                            name: 'Data de nascimento',
                            slot: 'birthdate'
                        },
                        {
                            name: 'CPF',
                            slot: 'cpf'
                        },
                        {
                            name: 'E-Mail',
                            description: data.email
                        },
                        {
                            name: 'celular',
                            slot: 'phone'
                        },
                        {
                            name: 'proprietário',
                            slot: 'user'
                        },
                        {
                            name: 'tags',
                            badge: data.tags.map(({ color, name }) => ({
                                color,
                                name,
                                resumeString: 20
                            }))
                        },
                        {
                            name: 'metadados',
                            class: 'order-last xs:col-span-2 xl:order-none xl:row-span-2',
                            slot: 'metadata'
                        },
                        {
                            name: 'serviços',
                            slot: 'services'
                        }

                    ]"
                    class="xs:grid-cols-2 xl:grid-cols-3"
                >
                    <template #name>
                        <template v-if="data.metadata?.cpf_nome_completo && useDeburr(data.metadata?.cpf_nome_completo?.toLocaleLowerCase()) !== useDeburr(data.name.toLocaleLowerCase())">
                            <p>
                                <span class="font-medium opacity-60">Social:</span> {{ data.name }}
                            </p>
                            <p class="text-secondary">
                                <span class="font-medium opacity-60">Civil:</span> {{ data.metadata.cpf_nome_completo }}
                            </p>
                        </template>
                        <p v-else>
                            {{ data.name }}
                        </p>
                    </template>

                    <template v-if="data.birthdate" #birthdate>
                        <LazyBirthdate :date="data.birthdate" />
                    </template>

                    <template v-if="data.document_formatted" #cpf>
                        <p class="inline-flex items-center gap-2">
                            {{ data.document_formatted }}

                            <LazyContactFlagCPF
                                :metadata="data.metadata"
                            />
                        </p>
                    </template>

                    <template v-if="data.phone" #phone>
                        <p class="inline-flex items-center gap-2">
                            <Icon :name="`flagpack:${data.country_code.toLowerCase()}`" />
                            {{ new Mask({ mask: useCountryDDIFind('code', data.country_code)?.mask }).masked(data.phone) }}
                        </p>
                    </template>

                    <template v-if="data.user" #user>
                        <div class="flex w-fit flex-row items-center gap-2">
                            <img
                                :src="data.user.avatar_url"
                                :alt="data.user.name"
                                class="size-5 rounded-full outline outline-1 outline-secondary"
                                :style="`outline-color: ${data.user.role.color}`"
                            >
                            <span>
                                {{ data.user.name }}
                            </span>
                        </div>
                    </template>

                    <template v-if="Object.keys(data.services).length" #services>
                        <ul class="flex flex-row flex-wrap gap-2 text-sm">
                            <li
                                v-for="(value, key) in data.services"
                                :key
                                class="flex items-center gap-1 rounded-full bg-background-300 px-2 py-0.5"
                            >
                                <Icon :name="useProviderIcon('message', key)" /> {{ value }}
                            </li>
                        </ul>
                    </template>

                    <template v-if="Object.keys(data.metadata).length" #metadata>
                        <ul
                            class="mask-transparent-border -mt-4 flex h-full flex-row flex-wrap gap-2 overflow-hidden py-4 text-sm transition-all duration-500 [size:1rem]"
                            :class="{ '!h-24': !metadataOpen && metadataMini }"
                        >
                            <li
                                v-for="(value, key) in data.metadata"
                                :key
                                class="h-fit rounded-xl bg-background-300 px-2 py-0.5"
                            >
                                <strong>{{ key }}:</strong>  {{ value }}
                            </li>
                            <li
                                v-if="metadataMini"
                                class="sticky bottom-1 ml-auto mr-1"
                            >
                                <Button
                                    color="secondary"
                                    size="sm"
                                    @click="metadataOpen = !metadataOpen"
                                >
                                    Ver {{ metadataOpen ? "menos" : "tudo" }}
                                </Button>
                            </li>
                        </ul>
                    </template>
                </Grid>
            </div>

            <Divider
                title="Editação"
            />
        </template>

        <Vueform
            v-model="form"
            sync
            :endpoint="false"
        >
            <VFileElement
                name="upload_id"
                accept=".png,.jpg"
                label="Foto de perfil"
                class="lg:col-span-6 lg:row-span-3 2xl:col-span-4"
            />

            <TextElement
                name="name"
                label="Nome"
                placeholder="Atendas user"
                rules="required|min:1"
                addClass="sm:col-span-6 2xl:col-span-4"
            />

            <InputDate
                addClass="sm:col-span-6 2xl:col-span-4"
            />

            <TextElement
                v-maska="'###.###.###-##'"
                name="document_number"
                label="CPF"
                placeholder="000.000.000-00"
                addClass="sm:col-span-6 2xl:col-span-4"
            />

            <InputPhone
                name="phone"
                label="Celular"
                class="sm:col-span-6 2xl:col-span-4"
            />

            <TextElement
                name="email"
                label="E-mail"
                placeholder="email@exemple.com"
                addClass="2xl:col-span-4 lg:col-span-6"
            />

            <SelectTags
                type="contact"
                addClass="2xl:col-span-4"
            />

            <EditorJsonElement
                label="Metadados"
                name="metadata"
            />
        </Vueform>

        <LazyModalConfirm
            ref="confirmeDelete"
            title="deletar"
            the="o contato"
            :action="async ({ id }) => await useFetchApi(`v1/contacts/${id}`, {
                method: 'DELETE'
            })"
            @then="back"
        />
    </Container>
</template>

<script setup lang="ts">
    import { Mask } from "maska";
    import { vMaska } from "maska/vue";

    definePageMeta({
        title: "contato"
    });

    const {
        contact
    } = useRouteParams({
        create: "create_contact",
        update: ["read_contact", "update_contact"]
    });

    const back = async () => await navigateTo("/contatos");
    const form = ref<Record<string, unknown>>({});

    const {
        data
    } = await useAsyncData("contact:id", async () => {
        try {
            const { data: _data } = await useFetchApi(`v1/contacts/${contact}`);

            form.value = {
                ..._data,
                birthdate: _data.birthdate ? _data.birthdate.split("T")[0] : null,
                tags: _data.tags.map(({ id }) => id),
                document_number: _data.document,
                metadata: JSON.stringify(_data.metadata, null, "\t")
            };

            return _data;
        }
        catch {
            await back();
        }
    }, {
        immediate: !!contact
    });

    const metadataMini = computed(() => Object.keys(data.value?.metadata ?? {}).length >= 10);
    const metadataOpen = ref(false);

    const upSert = async () => {
        await useFetchApi(`v1/contacts/${contact || ""}`, {
            method: contact ? "PUT" : "POST",
            body: {
                ...form.value,
                metadata: JSON.parse(form.value.metadata as string || "{}")
            }
        })
            .then(async () => {
                await back();
            });
    };

    const confirmeDelete = useModalConfirm();
</script>