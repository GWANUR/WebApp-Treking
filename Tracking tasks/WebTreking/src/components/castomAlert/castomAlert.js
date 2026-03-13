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
            onCancel = null,
            onClose = null,
            data = null
        } = config;

        const overlay = document.createElement("div");
        overlay.id = "alert_overlay";

        let buttons = "";

        if(type === "choice"){
            buttons = `
                <button class="alert-yes"><i class="bi bi-check-circle"></i> Yes</button>
                <button class="alert-no"><i class="bi bi-x-circle"></i> No</button>
            `;
            ico = ``;
        }
        if(type === "error"){
            buttons = `<button class="alert-ok"><i class="bi bi-check-circle"></i> Ok</button>`;
            ico = `<i class="bi bi-bug"></i>`;
        }
        if(type === "warning"){
            buttons = `<button class="alert-ok"><i class="bi bi-check-circle"></i> Ok</button>`;
            ico = `<i class="bi bi-exclamation-triangle"></i>`;
        }
        if(type === "info"){
            buttons = `<button class="alert-ok"><i class="bi bi-check-circle"></i> Ok</button>`;
            ico = `<i class="bi bi-info-circle"></i>`;
        }
        if(type === "reminder"){
            buttons = `
                <button class="alert-ok" onclick="acceptReminder(${data})"><i class="bi bi-calendar-check"></i> Ok</button>
                <button class="alert-no"><i class="bi bi-clock-history"></i> Remind me later</button>
            `;
            ico = `<i class="bi bi-bell-fill"></i>`;
        }

        overlay.innerHTML = `
            <div class="alert-box">
                <span class="alert-title">${ico} ${message}</span>
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
            ok.onclick = () => {
                if(onClose) onClose();
                closeAlert();
            };
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
                if(onClose) onClose();
                closeAlert();
            }
        };

        document.addEventListener("keydown", escHandler);

        function escHandler(e){
            if(e.key === "Escape"){
                if(onClose) onClose();
                closeAlert();
                document.removeEventListener("keydown", escHandler);
            }
        }
    }

    return { show };

})();