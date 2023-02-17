// ==UserScript==
// @name         Steam Market AutoSeller
// @description  Adds new "AutoSell" button near "Sell" to set selling price, tick SSA checkbox, confirm sale & close dialog automatically. Also trims too long card descriptions & hides "Gems" section.
// @version      1.1.1
// @author       Silmaril
// @namespace    https://github.com/SOLiNARY
// @downloadURL  https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.user.js
// @updateURL    https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.meta.js
// @license      MIT License
// @copyright    Copyright (C) 2020, by Silmaril
// @match        *://steamcommunity.com/id/*/inventory*
// @resource     SELLER_CSS https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/steam-market-auto-seller.css
// @resource     SELLER_HTML https://raw.githubusercontent.com/SOLiNARY/steam-market-auto-seller/master/auto-sell-block.html
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const seller_html = GM_getResourceText("SELLER_HTML");
    const seller_css = GM_getResourceText("SELLER_CSS");
    GM_addStyle(seller_css);

    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("keyup", false, true);

    if (localStorage.getItem('steam-market-auto-seller_sell-delta') == null) {
        localStorage.setItem('steam-market-auto-seller_sell-delta', -0.01);
    }

    $(document).on("click", ".auto_sell_button", async function(e) {
        e.preventDefault();
        let targetParent = e.target.getOffsetParent();
        let cardName = targetParent.querySelector(".item_desc_content > .item_desc_description > h1").textContent;
        let priceBlock = targetParent.querySelector(".item_market_actions > div > div:nth-child(2)").innerHTML;
        SellCurrentSelection();
        let delimiter = priceBlock.search("<br>");
        let priceRaw = priceBlock.substring(0, delimiter).replace(/[^0-9.-]+/g, "")
        let priceParsed = Number(priceRaw);
        if (isNaN(priceParsed)) {
            console.warn("No lots to compare!");
            return;
        }
        let priceSellDelta = Number(localStorage.getItem('steam-market-auto-seller_sell-delta'));
        let price = priceParsed < 0.04 ? 0.03 : priceParsed + priceSellDelta;
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
        console.info(price + " " + cardName);
    });

    $(document).on("change", ".steam-market-auto-seller_sell-delta", function(e) {
        e.preventDefault();
        localStorage.setItem('steam-market-auto-seller_sell-delta', e.target.value);
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
                sell0btn.insertAdjacentHTML('afterend', seller_html);
            }
        }
        if (sell1btn != null) {
            let autoSell1btn = document.querySelector("#iteminfo1_item_market_actions > a.auto_sell_button");
            if (autoSell1btn == null) {
                sell1btn.insertAdjacentHTML('afterend', seller_html);
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
        let autoSellDelta = document.getElementsByClassName('steam-market-auto-seller_sell-delta');
        let sellDelta = localStorage.getItem('steam-market-auto-seller_sell-delta');
        if (autoSellDelta[0] != null) {
            autoSellDelta[0].value = sellDelta;
        }
        if (autoSellDelta[1] != null) {
            autoSellDelta[1].value = sellDelta;
        }
    }

    function Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();
