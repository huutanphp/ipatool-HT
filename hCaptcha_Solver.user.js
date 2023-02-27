// ==UserScript==
// @name         hCaptcha Solver by noCaptchaAi BETA
// @name:ar      noCaptchaAI hCaptcha Solver حلال
// @name:ru      noCaptchaAI Решатель капчи hCaptcha
// @name:sh-CN   noCaptchaAI 验证码求解器
// @namespace    https://nocaptchaai.com
// @version      3.6.1
// @description  hCaptcha Solver automated Captcha Solver bypass Ai service. Free 6000 🔥solves/month! 50x⚡ faster than 2Captcha & others
// @description:ar تجاوز برنامج Captcha Solver الآلي لخدمة hCaptcha Solver خدمة Ai. 6000 🔥 حل / شهر مجاني! 50x⚡ أسرع من 2Captcha وغيرها
// @description:ru hCaptcha Solver автоматизирует решение Captcha Solver в обход сервиса Ai. Бесплатно 6000 🔥решений/месяц! В 50 раз⚡ быстрее, чем 2Captcha и другие
// @description:zh-CN hCaptcha Solver 自动绕过 Ai 服务的 Captcha Solver。 免费 6000 🔥解决/月！ 比 2Captcha 和其他人快 50x⚡
// @author       noCaptcha AI and Diego
// @match        https://newassets.hcaptcha.com/*
// @match        https://dash.nocaptchaai.com/*
// @match        https://diegosawyer.github.io/hCaptchaSolver.user.js/*
// @icon         https://docs.nocaptchaai.com/img/nocaptchaai.com.png
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
// @updateURL    https://github.com/noCaptchaAi/hCaptchaSolver.user.js/raw/main/hCaptchaSolverBeta.user.js
// @downloadURL  https://github.com/noCaptchaAi/hCaptchaSolver.user.js/raw/main/hCaptchaSolverBeta.user.js
// @connect      nocaptchaai.com
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_listValues
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==
(async function() {
    const cfg = new config({
        APIKEY: {
            label: "apikey",
            default: "apikey-595d508b-bb76-85c7-503f-232e9aa5de2a",
        },
        PLAN: {
            label: "plan",
            default: "free",
        },
        DELAY: {
            label: "Delay Timer",
            default: 3,
        },
        AUTO_SOLVE: {
            label: "Auto Solve",
            default: true,
        },
        CHECKBOX_AUTO_OPEN: {
            label: "Auto Open",
            default: true,
        },
        DEBUG_LOGS: {
            label: "Debug Logs",
            default: true,
        }
    });
    const Toast = Swal.mixin({
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000
    })
    const proBalApi = "https://manage.nocaptchaai.com/api/user/get_balance";
    const isApikeyEmpty = !cfg.get("APIKEY");
    const headers = {
        "Content-Type": "application/json",
        apikey: cfg.get("APIKEY"),
    };

    addMenu("⚙️ Settings", cfg.open, !isApikeyEmpty);
    addMenu(isApikeyEmpty ? "Login" : "📈 Dashboard/ 💰 Buy Plan / 👛 Balance info", "https://dash.nocaptchaai.com" + (isApikeyEmpty ? "?login" : ""))
    addMenu("🏠 HomePage", "https://nocaptchaai.com");
    addMenu("📄 Api Docs", "https://docs.nocaptchaai.com/category/api-methods");
    addMenu("❓ Discord", "https://discord.gg/E7FfzhZqzA");
    addMenu("❓ Telegram", "https://t.me/noCaptchaAi");

    log("loop running in bg");

    GM_addValueChangeListener("APIKEY", function(key, oldValue, newValue, remote) {
        log("The value of the '" + key + "' key has changed from '" + oldValue + "' to '" + newValue + "'");
        location = location.href;
    });

    if (location.hostname === "dash.nocaptchaai.com" && location.search.includes("login")) {
        while(!localStorage.getItem("user-info")) {
            await sleep(200);
        }

        const p = JSON.parse(localStorage.getItem("user-info"));
        cfg.set("APIKEY", p.apikey);
        cfg.set("PLAN", p.plan === "prepaid" ? "pro" : "free");
        Toast.fire({ title: "noCaptchaAi.com \n Config Saved Successfully." });
    }

    if (location.hostname === "diegosawyer.github.io") {
        const template = document.getElementById("tampermonkey");
        const clone = template.content.cloneNode(true);
        const inputs = clone.querySelectorAll("input");
        const wallet = clone.getElementById("WALLET");

        GM_xmlhttpRequest({
            method: "GET",
            headers,
            url: cfg.get("PLAN") == "pro" ? proBalApi : getApi("balance"),
            responseType: "json",
            onload: function({response}) {
                wallet.innerText = `Wallet: ${response.user_id}, 💲${response.Balance}`
                if (Object.keys(response.Subscription).length !== 0) {
                    wallet.innerText += `NextReset:  ${response.Subscription.nextReset}`
                }
            }
        });

        for (const input of inputs) {
            const type = input.type === "checkbox" ? "checked" : "value";
            input[type] = cfg.get(input.id);
            input.addEventListener("change", function(e) {
                Toast.fire({ title: 'Your change has been saved' });
                cfg.set(input.id, e.target[type])
            })
        }

        document.querySelector("h1").after(clone);
    }

    while (!(!navigator.onLine || isApikeyEmpty)) {

        await sleep(1000)

        if (cfg.get("CHECKBOX_AUTO_OPEN") && isWidget()) {
            const isSolved = document.querySelector("div.check")?.style.display === "block";
            if (isSolved) {
                log("found solved");
                break;
            }
            document.querySelector("#checkbox")?.click();
        } else if (cfg.get("AUTO_SOLVE") && document.querySelector("h2.prompt-text") !== null) {
            log("opening box");
            await solve();
        }
    }

    async function solve() {

        const {target, cells, images} = await on_task_ready();
        const start_time = Date.now();
        const searchParams = new URLSearchParams(location.hash);

        try {
            const response = await fetch(getApi("solve"), {
                method: "POST",
                headers,
                body: JSON.stringify({
                    images,
                    target,
                    method: "hcaptcha_base64",
                    sitekey: searchParams.get("sitekey"),
                    site: searchParams.get("host"),
                    ln: document.documentElement.lang || navigator.language,
                    softid: "UserScript" + GM_info.script.version,
                }),
            });
            log("sent for solving", "🕘 waiting for response");

            const data = await response.json();
            if (data.status === "new") {
                log('⏳ waiting a second');
                await sleep(1000);
                const status = await (await fetch(data.url)).json();
                log(data, "🖱️ -> 🖼️");
                for (const index of status.solution) {
                    cells[index].click();
                }
            } else if (data.status === "solved") {
                log(data, "🖱️ -> 🖼️");
                for (const index of data.solution) {
                    cells[index].click();
                    await sleep(200);
                }
            } else if (response.status === 429) {
                log("sleeping for "+ data.reTryAfter + "sec");
                await sleep(data.reTryAfter * 1000);
            } else if (data.status === "skip") {
                log('😨 Seems this a new challenge, please contact noCaptchaAi!');
                location = location.href;
            }
            else {
                return log(response.status);
            }

            const delay = parseInt(cfg.get("DELAY")) * 1000;
            const wait = delay - (Date.now() - start_time)
            log(wait, delay);
            if (wait > 0) {
                await sleep(wait)
            }
            log("☑️ sent!");
            document.querySelector(".button-submit").click();
        } catch (error) {
            log(error);
        }
    }
    async function getBase64FromUrl(url) {
        const blob = await (await fetch(url)).blob();
        return new Promise(function(resolve) {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.addEventListener("loadend", function() {
                resolve(reader.result.replace(/^data:image\/(png|jpeg);base64,/, ""));
            });
            reader.addEventListener("error", function() {
                log("❌ Failed to convert url to base64");
            });
        });
    }

    function config(data) {
        let openWin;

        function get(name) {
            return GM_getValue(name)
        }

        function set(name, value) {
            GM_setValue(name, value);
        }

        function open() {
            const windowFeatures = {
                location: 'no',
                status: 'no',
                left: window.screenX,
                top: window.screenY,
                width: 500,
                height: 500
            };

            const featuresArray = [];
            for (const name in windowFeatures) {
                featuresArray.push(name + '=' + windowFeatures[name]);
            }

            openWin = window.open("https://diegosawyer.github.io/hCaptchaSolver.user.js/config.html", "_blank", featuresArray.join(','));
            openWin.moveBy(Math.round((window.outerWidth - openWin.outerWidth) / 2), Math.round((window.outerHeight - openWin.outerHeight) / 2));
            window.addEventListener("beforeunload", openWin?.close);
            // openLayer = document.createElement("iframe");
            // openLayer.src = "https://diegosawyer.github.io/hCaptchaSolver.user.js/config.html"
            // openLayer.width = "500px";
            // openLayer.height = "500px";

            // TODO:
            // center the element
            // dark background

            // document.body.append(openLayer);
        }

        function close() {
            openWin?.close();
            openWin = undefined;
        }

        const storedKeys = GM_listValues();

        for (const name in data) {
            if (storedKeys.includes(name)) {
                set(name, get(name));
            } else if (data[name].default !== undefined) {
                set(name, data[name].default);
            } else {
                set(name, '');
            }
        }

        return { get, set, open, close };
    }
    function getApi(v) {
        return "https://" + cfg.get("PLAN") + ".nocaptchaai.com/" + v;
    }
    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    function isWidget() {
        const rect = document.body.getBoundingClientRect();
        if (rect?.width === 0 || rect?.height === 0) {
            return false;
        }
        return document.querySelector("div.check") !== null;
    }
    function log() {
        if (!cfg.get("DEBUG_LOGS")) return;
        for (const arg of arguments) {
            console.debug(arg);
        }
    }

    function addMenu(name, url, check = true) {
        if (!check) return;

        GM_registerMenuCommand(name, function() {
            if (typeof url === "function") {
                url();
            } else {
                GM_openInTab(url, { active: true, setParent: true });
            }
        });
    }
    function on_task_ready(i = 500) {
        return new Promise(async (resolve) => {
            const check_interval = setInterval(async function() {
                let target = document.querySelector(".prompt-text")?.textContent;
                if (!target) return;

                const cells = document.querySelectorAll(".task-image .image");
                if (cells.length !== 9) return;

                const images = {};
                for (let i = 0; i < cells.length; i++) {
                    const url = cells[i]?.style.backgroundImage.replace(/url\("|"\)/g, "");
                    if (!url || url === "") return;
                    images[i] = await getBase64FromUrl(url);
                }

                clearInterval(check_interval);
                return resolve({target, cells, images});
            }, i);
        });
    }
})();
