export default function usePastTime (
    startedAt?: string | null,
    opts: {
        short?: boolean
        finishAt?: string | null
        prefix?: string | boolean
    } = {}
) {
    if (!startedAt) {
        return startedAt;
    }

    const startedDate = new Date(startedAt);
    const finishedDate = opts.finishAt ? new Date(opts.finishAt) : new Date();

    const diffTime = Math.abs(finishedDate.getTime() - startedDate.getTime());
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);

    const timeUnits = [
        { unit: "ano", shortUnit: "a", value: diffYears },
        { unit: "mês", shortUnit: " mês", value: diffMonths % 12, plural: " meses" },
        { unit: "semana", shortUnit: "sem", value: diffWeeks % 7 },
        { unit: "dia", shortUnit: "d", value: diffDays % 7 },
        { unit: "hora", shortUnit: "h", value: diffHours % 24 },
        { unit: "minuto", shortUnit: "min", value: diffMinutes % 60 }
    ];

    const significantUnits = timeUnits.filter(unit => unit.value > 0);

    const prefix = typeof opts.prefix === "string" ? opts.prefix : ([undefined, true].includes(opts.prefix) ? "Há" : "");

    if (significantUnits.length === 0) {
        const text = finishedDate.getTime() === new Date().getTime() ? "Agora" : `< 1${opts.short ? "min" : " minuto"}`;
        return `${prefix} ${text}`;
    }

    const primaryUnit = significantUnits[0];

    if (primaryUnit.value !== 1) {
        if (primaryUnit?.plural) {
            primaryUnit.unit = primaryUnit.plural;
            primaryUnit.shortUnit = primaryUnit.plural;
        }
        else {
            primaryUnit.unit += "s";
            primaryUnit.shortUnit += "s";
        }
    }

    return `${prefix} ${primaryUnit.value}${opts.short ? primaryUnit.shortUnit : ` ${primaryUnit.unit}`}`;
}

export function usePastTimeRef (...args: Parameters<typeof usePastTime>) {
    const value = ref(usePastTime(...args));

    useIntervalFn(() => {
        value.value = usePastTime(...args);
    }, 60 * 1000);

    return value;
}