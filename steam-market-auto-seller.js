// ==UserScript==
// @name         Steam Market AutoSeller
// @description  Adds new "AutoSell" button near "Sell" to set selling price, tick SSA checkbox, confirm sale & close dialog automatically. Also trims too long card descriptions & hides "Scrap" section.
// @version      1.0.1
// @author       Silmaril
// @namespace    https://github.com/SOLiNARY
// @downloadURL  https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.js
// @updateURL    https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.js
// @license      MIT License
// @copyright    Copyright (C) 2020, by Silmaril
// @match        *://steamcommunity.com/id/*/inventory
// @require      https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    toastr.options = {"positionClass": "toast-bottom-right"};
    let head = document.getElementsByTagName('head')[0];
    let toastrStyleHTML = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">';
    let buttonStyleHTML = '<style>.item_market_actions .item_market_action_button_edge.item_market_action_button_right{margin-right:10px;}</style>';
    const autoSellButtonHTML = '<a class="auto_sell_button item_market_action_button item_market_action_button_green" href="#"><span class="item_market_action_button_edge item_market_action_button_left"></span><span class="item_market_action_button_contents">AutoSell</span><span class="item_market_action_button_edge item_market_action_button_right"></span><span class="item_market_action_button_preload"></span></a>';
    head.innerHTML = toastrStyleHTML + buttonStyleHTML + head.innerHTML;

    $(document).on("click", ".auto_sell_button", async function(e){
        e.preventDefault();
        let cardName = e.path[4].querySelector(".item_desc_content > .item_desc_description > h1").textContent;
        let priceBlock = e.path[2].querySelector(".item_market_actions > div > div:nth-child(2)").innerHTML;
        SellCurrentSelection();
        if (priceBlock.search("There are no listings currently available for this item.") == 0){
            toastr.error("No lots to compare!");
            return;
        }
        let delimiter = priceBlock.search(" USD<br>");
        let minPrice = Number(priceBlock.substring(0, delimiter).replace(/[^0-9.-]+/g,"")).toFixed(2);
        let price = minPrice < 0.04 ? 0.03 : minPrice - 0.01;
        document.getElementById('market_sell_buyercurrency_input').value = '$' + price;
        let evt = document.createEvent("HTMLEvents"); // move global
        evt.initEvent("keyup", false, true);
        $("market_sell_buyercurrency_input").dispatchEvent(evt);
        document.getElementById('market_sell_dialog_accept_ssa').checked = true;
        $("market_sell_dialog_accept").click()
        $("market_sell_dialog_ok").click();
        while (document.querySelector(".newmodal .newmodal_buttons .btn_grey_steamui") == null){
            await sleep(100);
        }
        document.querySelector(".newmodal .newmodal_buttons .btn_grey_steamui").click();
        toastr.success("$" + price + " " + cardName);
    });

    $(document).on("click", ".item", function(e){
        let sell0btn = document.querySelector("#iteminfo0_item_market_actions > a.item_market_action_button");
        let sell1btn = document.querySelector("#iteminfo1_item_market_actions > a.item_market_action_button");
        let description0div = document.querySelector("#iteminfo0_item_descriptors > div");
        let description1div = document.querySelector("#iteminfo1_item_descriptors > div");
        let scrap0div = document.querySelector("#iteminfo0_scrap_content");
        let scrap1div = document.querySelector("#iteminfo1_scrap_content");
        if (sell0btn != null){
            let autoSell0btn = document.querySelector("#iteminfo0_item_market_actions > a.auto_sell_button");
            if (autoSell0btn == null){
                sell0btn.outerHTML = sell0btn.outerHTML + autoSellButtonHTML;
            }
        }
        if (sell1btn != null){
            let autoSell1btn = document.querySelector("#iteminfo1_item_market_actions > a.auto_sell_button");
            if (autoSell1btn == null){
                sell1btn.outerHTML = sell1btn.outerHTML + autoSellButtonHTML;
            }
        }
        if (description0div != null){
            let description0 = description0div.textContent;
            if (description0.length > 100)
                description0div.textContent = description0.substring(0, 100) + "... [shortened]";
        }
        if (description1div != null){
            let description1 = description1div.textContent;
            if (description1.length > 100)
                description1div.textContent = description1.substring(0, 100) + "... [shortened]";
        }
        if (scrap0div != null){
            scrap0div.remove();
        }
        if (scrap1div != null){
            scrap1div.remove();
        }
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();