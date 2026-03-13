<template>
    <TablePage
        :request="`v1/contacts/${contact}/calls`"
        :thead="[
            { name: 'Id', propertyPath: 'id' },
            { name: 'Telefone', propertyPath: 'phone_number' },
            { name: 'Ramal', propertyPath: 'phone_extension' },
            { name: 'Situação', slot: 'status' },
            { name: 'Começou', propertyPath: 'started_at', transform: useDate },
            { name: 'Terminou', propertyPath: 'finished_at', transform: useDate },
            { name: 'Duração', slot: 'duration' }
        ]"
        :itemClick="false"
    >
        <template #status="{ status }">
            <Badge
                v-bind="statusTag(status)"
                :resumeString="20"
                size="sm"
            />
        </template>

        <template #duration="{ started_at, finished_at }">
            {{ usePastTime(started_at, { finishAt: finished_at, prefix: false }) }}
        </template>
    </TablePage>
</template>

<script setup lang="ts">
    import type { InternalApi } from "nitropack/types";

    definePageMeta({
        title: "ligações",
        navOrder: 20,
        permissions: "read_contact"
    });

    const {
        contact
    } = useRouteParams();

    type Status = InternalApi["v1/contacts/:id/calls"]["get"]["data"][number]["status"];

    const statusTag = (status: Status) => {
        const [name, color, icon] = ({
            pending: ["Pendente", "warn", "phonePending"],
            fail: ["Falhou", "pink", "phoneFail"],
            completed: ["Concluída", "success", "phoneCheck"],
            cancelled: ["Cancelada", "danger", "phoneCancel"],
            in_service: ["Em atendimento", "indigo", "phoneMsg"]
        } as const)?.[status] ?? [status, undefined, false];

        return {
            name,
            color,
            icon
        };
    };
</script>