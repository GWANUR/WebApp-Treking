const AlertComponent = (() => {

    let queue = [];
    let active = false;

    function loadCSS(){
        if(!document.querySelector("#alert_component_css")){
            const link = document.createElement("link");
            link.id = "alert_component_css";
            link.rel = "stylesheet";
            link.href = "/src/components/castomAlert/castomAlert.css";
            document.head.appendChild(link);
        }
    }

    function closeAlert(){
        const overlay = document.querySelector("#alert_overlay");
        if(overlay) overlay.remove();

        active = false;

        if(queue.length){
            show(queue.shift());
        }
    }

    function show(config){

        loadCSS();

        if(active){
            queue.push(config);
            return;
        }

        active = true;

        const {
            message = "Alert",
            type = "info",
            onAccept = null,
            onCancel = null
        } = config;

        const overlay = document.createElement("div");
        overlay.id = "alert_overlay";

        let buttons = "";

        if(type === "choice"){
            buttons = `
                <button class="alert-yes"><i class="bi bi-check-circle"></i> Yes</button>
                <button class="alert-no"><i class="bi bi-x-circle"></i> No</button>
            `;
        }else{
            buttons = `<button class="alert-ok"><i class="bi bi-exclamation-triangle"></i> Ok</button>`;
        }

        overlay.innerHTML = `
            <div class="alert-box">
                <span class="alert-title">${message}</span>
                <div class="alert-actions">
                    ${buttons}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const ok = overlay.querySelector(".alert-ok");
        const yes = overlay.querySelector(".alert-yes");
        const no = overlay.querySelector(".alert-no");

        if(ok){
            ok.onclick = closeAlert;
        }

        if(yes){
            yes.onclick = () => {
                if(onAccept) onAccept();
                closeAlert();
            };
        }

        if(no){
            no.onclick = () => {
                if(onCancel) onCancel();
                closeAlert();
            };
        }

        overlay.onclick = (e)=>{
            if(e.target === overlay){
                closeAlert();
            }
        };

        document.addEventListener("keydown", escHandler);

        function escHandler(e){
            if(e.key === "Escape"){
                closeAlert();
                document.removeEventListener("keydown", escHandler);
            }
        }
    }

    return { show };

})();