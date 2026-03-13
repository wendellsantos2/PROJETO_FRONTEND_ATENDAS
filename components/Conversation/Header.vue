<template>
    <TransitionHeight>
        <div v-show="talkingId">
            <div class="flex h-fit w-full flex-row flex-wrap items-center justify-between gap-4 p-4 lg:flex-nowrap lg:p-6 lg:pt-0">
                <div class="flex items-center gap-2 xl:min-w-80">
                    <Button
                        class="!p-2 lg:hidden"
                        variant="transparent"
                        @click="reset"
                    >
                        <Icon name="back" />
                    </Button>

                    <TransitionOpacity mode="out-in">
                        <h4
                            v-show="conversation?.id"
                            class="font-bold leading-none text-secondary"
                        >
                            #{{ conversation?.id }}
                        </h4>
                    </TransitionOpacity>

                    <TransitionOpacity mode="out-in">
                        <Button
                            v-if="useCheckPermissions('update_conversation') && conversation?.id"
                            v-tooltip="'Ações do bot'"
                            color="customFul"
                            class="hidden bg-indigo-600 !p-2 text-white hovact:border-indigo-600 hovact:bg-white hovact:text-indigo-600 xs:flex"
                            @click="botAction?.toggle(true, { id: conversation.id, form: {} })"
                        >
                            <Icon name="bot" />
                        </Button>
                    </TransitionOpacity>
                </div>

                <TransitionOpacity mode="out-in">
                    <Button
                        :key="conversation?.id"
                        v-tooltip="`${infoOpen ? 'fechar' : 'ver'} detalhes do contato`"
                        color="contrast"
                        :variant="infoOpen ? 'solid' : 'transparent'"
                        @click="infoToggle()"
                    >
                        <span class="max-w-48 flex-none truncate">
                            {{ conversation?.contact.name }}
                        </span>
                        <Icon
                            name="arrowRight"
                            class="transition-transform duration-500"
                            :class="{ 'rotate-180': infoOpen }"
                        />
                    </Button>
                </TransitionOpacity>

                <div
                    class="transition-all duration-500 xl:w-80 xl:pl-12"
                    :class="{
                        'hidden w-0 opacity-0 xl:block': !enabled,
                        'w-full sm:w-40': enabled,
                        'lg:w-80 lg:pl-12': infoOpen && enabled
                    }"
                >
                    <div
                        v-if="enabled"
                        class="flex w-full flex-row items-center justify-between gap-4 rounded-full bg-background-200 p-2 px-4 text-center text-lg font-semibold transition-all duration-500 *:flex-none after:block"
                    >
                        <Icon name="clock" size="1.5rem" />
                        <LazyCountdown
                            :start="lastUpdate"
                            :end="{ hours: 24 }"
                            noDays
                            noMilliseconds
                            :computedClass
                        />
                    </div>
                </div>

                <LazyConversationBotAction
                    ref="botAction"
                />
            </div>
        </div>
    </TransitionHeight>
</template>

<script setup lang="ts">
    import type { ConversationBotAction } from "#components";
    import type { ComponentExposed } from "~/types";
    import type { ComputedClass } from "~/components/Countdown.vue";

    const {
        talkingId,
        conversation,
        infoOpen
    } = storeToRefs(useConversationStore());

    const {
        reset,
        infoToggle
    } = useConversationStore();

    const enabled = computed(() => {
        if (conversation.value?.lastMessage?.service === "whatsapp-vonage") {
            return true;
        }

        return false;
    });

    const lastUpdate = computed(() => conversation.value?.lastMessage?.created_at ?? conversation.value?.updated_at ?? "");
    const computedClass: ComputedClass = ({ hours, minutes }) => {
        if (Number(hours)) {
            return "";
        }

        const min = Number(minutes);

        if (min < 5) {
            return "text-danger";
        }
        else if (min < 15) {
            return "text-warn";
        }
        else {
            return "";
        }
    };

    const botAction = ref<ComponentExposed<typeof ConversationBotAction>>();
</script>