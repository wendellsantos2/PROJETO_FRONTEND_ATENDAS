<template>
    <TablePage
        :request="`v1/contacts/${contact}/notes`"
        :thead="[
            { name: 'Id', propertyPath: 'id' },
            { name: 'Descrição', propertyPath: 'content', class: '!w-full' }
        ]"
        noAbbreviate
    >
        <template #after>
            <LayoutPortal to="HeaderBefore">
                <Button
                    v-if="useCheckPermissions('update_contact')"
                    :href="`/contatos/${contact}/observacoes/${enums.paramCreate}`"
                    variant="gradient"
                >
                    <Icon name="plus" class="sm:hidden lg:block xl:hidden" />
                    <span class="hidden sm:block lg:hidden xl:block">
                        Adicionar observação
                    </span>
                </Button>
            </LayoutPortal>
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    definePageMeta({
        title: "observações",
        navOrder: 70
    });

    const {
        contact
    } = useRouteParams();
</script>