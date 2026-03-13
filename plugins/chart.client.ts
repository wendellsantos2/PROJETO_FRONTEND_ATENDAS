import type { DeepPartial } from "chart.js/types/utils";
import type { NuxtApp } from "#app";
import * as ChartJs from "chart.js";
import { _primary, _secondary } from "#tailwind-config/theme/colors";

const { Chart, registerables } = ChartJs;

export default defineNuxtPlugin((nuxtApp) => {
    Chart.register(...registerables);

    useMerge(Chart.defaults, {
        backgroundColor: _primary,
        font: {
            family: "Montserrat"
        },
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                displayColors: false
            }
        }
    } satisfies DeepPartial<ChartJs.Defaults>);

    watch(() => (nuxtApp as NuxtApp)?.$colorMode.value, (theme) => {
        if (theme === "dark") {
            useMerge(Chart.defaults, {
                color: "#ffffff80",
                borderColor: "#ffffff1a"
            } satisfies DeepPartial<ChartJs.Defaults>);
        }
        else {
            useMerge(Chart.defaults, {
                color: "#00000080",
                borderColor: "#0000001a"
            } satisfies DeepPartial<ChartJs.Defaults>);
        }

        Object
            .values(Chart.instances)
            .forEach((instance) => {
                useMerge(instance.options, {
                    color: Chart.defaults.color,
                    borderColor: Chart.defaults.borderColor,
                    scales: {
                        x: {
                            ticks: {
                                color: Chart.defaults.color as string
                            },
                            grid: {
                                color: Chart.defaults.borderColor as string
                            }
                        },
                        y: {
                            ticks: {
                                color: Chart.defaults.color as string
                            },
                            grid: {
                                color: Chart.defaults.borderColor as string
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: Chart.defaults.color as string
                            }
                        }
                    }
                } satisfies DeepPartial<ChartJs.ChartOptions>);

                instance.update();
            });
    }, {
        immediate: true
    });
});