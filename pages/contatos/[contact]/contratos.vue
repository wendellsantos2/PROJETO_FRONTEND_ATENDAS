<template>
    <TablePage
        request="connectasign/contracts"
        :thead="[
            { name: 'Id', propertyPath: 'id' },
            { name: 'Criador', propertyPath: 'creator.name' },
            { name: 'Situação', slot: 'status' },
            { name: 'Asisinates', slot: 'signers' },
            { name: 'Original', propertyPath: 'original_url' },
            { name: 'Assinado', propertyPath: 'signed_url' }
        ]"
        :opts="{
            fetch: {
                query: {
                    'filter[contact_id]': contact
                }
            }
        }"
        :itemClick="false"
    >
        <template #status="{ status }">
            <Badge
                v-bind="statusTag(status)"
                :resumeString="20"
                size="sm"
            />
        </template>

        <template #signers="{ signers }">
            <p v-if="signers.at(0)">
                {{ signers.at(0)?.name }}
                <span
                    v-show="signers.length > 1"
                    class="text-secondary"
                >
                    + {{ signers.length-1 }}
                </span>
            </p>
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    definePageMeta({
        navOrder: 40,
        permissions: {
            satisfyAll: true,
            list: ["read_contact", "provider:sign"]
        }
    });

    const {
        contact
    } = useRouteParams();

    type Status = InternalApi["connectasign/contracts"]["get"]["data"][number]["status"];

    const statusTag = (status: Status) => {
        const [name, color, icon] = ({
            active: ["Pendente", "primary", "pending"],
            completed: ["Concluído", "success", "check"],
            draft: ["Cancelado", "danger", "cancel"]
        } as const)?.[status] ?? [status, undefined, false];

        return {
            name,
            color,
            icon
        };
    };
</script>