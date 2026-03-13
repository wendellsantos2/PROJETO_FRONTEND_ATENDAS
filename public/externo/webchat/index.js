(() => {
    const currentScript = document.currentScript;

    if (!currentScript) {
        throw Error("O script do webchat não foi carregado corretamente.");
    }

    ["to"].forEach(attr => {
        if (!currentScript.dataset[attr]) {
            throw Error(`O atributo obrigatório 'data-${attr}' não foi encontrado no script do webchat atentas.`);
        }
    });

    const host = currentScript.dataset.host ?? "https://minhaatendas.atendas.com.br";

    delete currentScript.dataset.host;

    const url = new URL(`${host}/externo/webchat`);
    const stylesheet = document.createElement("link");

    stylesheet.rel = "stylesheet";
    stylesheet.href = `${url}/index.css`;

    document.head.appendChild(stylesheet);

    Object.entries(currentScript.dataset).forEach((item) => {
        url.searchParams.append(...item);
    });

    const iframe = document.createElement("iframe");

    iframe.id = "webchat-atendas";
    iframe.src = url.toString();
    iframe.className = "loading";
    iframe.setAttribute("allow", "camera; microphone");

    document.body.appendChild(iframe);

    window.addEventListener("message", (event) => {
        if (event.origin !== host || event.data.sender !== "atendas:webchat") {
            return;
        };

        iframe.className = event.data.type;
    });
})();