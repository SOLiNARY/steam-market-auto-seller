// ==UserScript==
// @name         Steam Market AutoSeller
// @description  Adds new "AutoSell" button near "Sell" to set selling price, tick SSA checkbox, confirm sale & close dialog automatically. Also trims too long card descriptions & hides "Gems" section.
// @version      1.0.8
// @author       Silmaril
// @namespace    https://github.com/SOLiNARY
// @downloadURL  https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.user.js
// @updateURL    https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.meta.js
// @license      MIT License
// @copyright    Copyright (C) 2020, by Silmaril
// @match        *://steamcommunity.com/id/*/inventory*
// @require      https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js
// @resource     SELLER_CSS https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.css
// @resource     TOASTR_CSS https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const seller_css = GM_getResourceText("SELLER_CSS");
    const toastr_css = GM_getResourceText("TOASTR_CSS");
    GM_addStyle(seller_css);
    GM_addStyle(toastr_css);

    toastr.options = { "positionClass": "toast-top-right" };
    let evt = document.createEvent("HTMLEvents");
    const autoSellButtonHTML = '<a class="auto_sell_button item_market_action_button item_market_action_button_green" href="#"><span class="item_market_action_button_edge item_market_action_button_left"></span><span class="item_market_action_button_contents">AutoSell</span><span class="item_market_action_button_edge item_market_action_button_right"></span><span class="item_market_action_button_preload"></span></a>';
    evt.initEvent("keyup", false, true);

    $(document).on("click", ".auto_sell_button", async function(e) {
        e.preventDefault();
        let cardName = e.path[4].querySelector(".item_desc_content > .item_desc_description > h1").textContent;
        let priceBlock = e.path[2].querySelector(".item_market_actions > div > div:nth-child(2)").innerHTML;
        SellCurrentSelection();
        let delimiter = priceBlock.search("<br>");
        let priceRaw = priceBlock.substring(0, delimiter).replace(/[^0-9.-]+/g, "")
        let priceParsed = Number(priceRaw);
        if (isNaN(priceParsed)) {
            toastr.error("No lots to compare!");
            return;
        }
        let minimalDecrement = IsFractional(priceRaw) ? 0.01 : 1;
        let price = priceParsed < 4 * minimalDecrement ? 3 * minimalDecrement : priceParsed - minimalDecrement;
        price = price.toFixed(2);
        document.getElementById('market_sell_buyercurrency_input').value = price;
        $("market_sell_buyercurrency_input").dispatchEvent(evt);
        document.getElementById('market_sell_dialog_accept_ssa').checked = true;
        $("market_sell_dialog_accept").click()
        $("market_sell_dialog_ok").click();
        while (document.querySelector(".newmodal .newmodal_buttons .btn_grey_steamui") == null) {
            await Sleep(100);
        }
        document.querySelector(".newmodal .newmodal_buttons .btn_grey_steamui").click();
        toastr.success(price + " " + cardName);
    });

    $(document).on("click", ".inventory_page div.item", AddAutoSellBtn);
    $(document).on("click", ".games_list_tabs a.games_list_tab", AddAutoSellBtn);

    function AddAutoSellBtn() {
        let sell0btn = document.querySelector("#iteminfo0_item_market_actions > a.item_market_action_button");
        let sell1btn = document.querySelector("#iteminfo1_item_market_actions > a.item_market_action_button");
        let description0div = document.querySelector("#iteminfo0_item_descriptors > div");
        let description1div = document.querySelector("#iteminfo1_item_descriptors > div");
        let scrap0div = document.querySelector("#iteminfo0_scrap_content");
        let scrap1div = document.querySelector("#iteminfo1_scrap_content");
        if (sell0btn != null) {
            let autoSell0btn = document.querySelector("#iteminfo0_item_market_actions > a.auto_sell_button");
            if (autoSell0btn == null) {
                sell0btn.outerHTML = sell0btn.outerHTML + autoSellButtonHTML;
            }
        }
        if (sell1btn != null) {
            let autoSell1btn = document.querySelector("#iteminfo1_item_market_actions > a.auto_sell_button");
            if (autoSell1btn == null) {
                sell1btn.outerHTML = sell1btn.outerHTML + autoSellButtonHTML;
            }
        }
        if (description0div != null) {
            let description0 = description0div.textContent;
            if (description0.length > 100)
                description0div.textContent = description0.substring(0, 100) + "... [shortened]";
        }
        if (description1div != null) {
            let description1 = description1div.textContent;
            if (description1.length > 100)
                description1div.textContent = description1.substring(0, 100) + "... [shortened]";
        }
        if (scrap0div != null) {
            scrap0div.remove();
        }
        if (scrap1div != null) {
            scrap1div.remove();
        }
    }

    function IsFractional(value) {
        return value.indexOf('.') > -1 || value.indexOf(',') > -1;
    }

    function Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();