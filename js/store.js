const log = console.log;
window.addEventListener("load", () => {
    $.getJSON('/store/store.json', function (json) {
        let app = new App(json);
    });
});


class App {
    constructor(json) {
        this.json = json;
        this.basket_list = [];
        this.basket_item_list = [];
        this.init();
    }

    init() {

        //아이템 생성
        this.draw_item(this.json);

        //이벤트
        this.addEvent();


    }
    addEvent() {

        $(".drop_box").droppable({
            accept: ".item",
            drop: (e, ui) => {
                let idx = ui.draggable[0].firstElementChild.dataset.idx;
                let flag = true;
                this.basket_list.forEach(i => {
                    if (i == idx) flag = false;
                });
                if (!flag) {
                    alert("이미 장바구니에 담긴 상품 입니다.");
                    return;
                }
                this.basket_list.push(idx);
                this.draw_basket_item(idx);
                this.update_total_price();
            }
        });

        $(".search_input").on("input", (e) => {
            let value = e.target.value;
            let drawArr = [];
            let product_name_text = []
            let brand_text = []
            this.json.forEach(x => {
                if (value == "") {
                    drawArr.push(x);
                } else {
                    if (this.search(value, x.product_name).length != 0 || this.search(value, x.brand).length != 0) {
                        drawArr.push(x);
                        product_name_text.push(this.highlight(value, x.product_name, this.search(value, x.product_name)));
                        brand_text.push(this.highlight(value, x.brand, this.search(value, x.brand)));

                    }

                }
            });


            document.querySelector(".item_box").innerHTML = "";

            this.draw_item(drawArr);

            let items = document.querySelectorAll(".item");
            if (product_name_text.length != 0) {

                log(product_name_text);
                for (let i = 0; i < items.length; i++) {
                    items[i].querySelector(".product_name").innerHTML = product_name_text[i];
                    items[i].querySelector(".brand").innerHTML = "[" + brand_text[i] + "]";
                }
            }

        });

    }
    highlight(keyword, data, indexes) {
        let length = keyword.length;
        let result = [];
        result.push(data.substring(0, indexes[0])); // 안녕
        for (let i = 0; i < indexes.length; i++) {
            let index = indexes[i];
            result.push("<span class='highlight'>" + (data.substring(index, index + length)) + "</span>"); // 정재 , 정재
            result.push(data.substring(index + length, indexes[i + 1])); //성인척하는 , 성

        }
        return result.join('');
    }

    search(key, data) {
        let indexs = this.match(key, data);
        let datacho = this.cho(data);
        let result = [];

        for (let i = 0; i < indexs.length; i++) {
            let index = indexs[i];
            let flag = true;
            for (let j = 0; j < key.length; j++) {
                let keyChar = key[j];
                let dataChar = (keyChar.match(/[ㄱ-ㅎ]/) ? datacho : data)[j + index];
                if (keyChar != dataChar) flag = false;
            }
            if (flag) {
                result.push(index);
            }
        }
        return result;
    }

    match(key, data) {
        let keycho = this.cho(key);
        let datacho = this.cho(data);
        let index = -1;
        let result = [];

        do {
            index = datacho.indexOf(keycho, (index + 1));
            if (index > -1) result.push(index);
        } while (index > -1)

        return result;
    }

    cho(str) {
        let arr = [
            "ㄱ", "ㄲ", "ㄴ", "ㄷ", 'ㄸ', 'ㄹ', 'ㅁ',
            'ㅂ', "ㅃ", 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ',
            'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ]
        let result = [];

        for (let i = 0; i < str.length; i++) {
            let idx = Math.floor((str[i].charCodeAt() - 44032) / 588);
            result.push(arr[idx] || str[i]);
        }
        return result.join('');
    }

    update_total_price() {
        let items = document.querySelectorAll(".basket_item");
        let total = 0;
        items.forEach(item => {
            let cnt = item.querySelector(".cnt_label").innerHTML * 1;
            let price = this.remove_comma(item.querySelector(".item_default_price").innerHTML);
            total += cnt * price;
        });
        $(".total_price").text(total.toLocaleString());
    }

    remove_comma(str) {
        return parseInt(str.replace(/,/g, ""));
    }

    draw_basket_item(idx) {
        let tag = document.createElement('div');
        $(tag).addClass('basket_item');
        this.json.forEach(item => {
            if (item.id == idx) {
                tag.innerHTML = this.make_basket_item_tmp(item);
            }
        });
        $('.basket_item_box').append(tag);
        this.basket_item_event(tag);
    }

    basket_item_event(tag) {
        tag.querySelector(".minus_btn").addEventListener("click", () => {
            let cnt = tag.querySelector(".cnt_label").innerHTML * 1;
            if (cnt == 1) return;
            tag.querySelector(".cnt_label").innerHTML = cnt - 1;
            this.update_price(tag);
        });
        tag.querySelector(".plus_btn").addEventListener("click", () => {
            let cnt = tag.querySelector(".cnt_label").innerHTML * 1;
            tag.querySelector(".cnt_label").innerHTML = cnt + 1;
            this.update_price(tag)
        });
        tag.querySelector(".remove_btn").addEventListener("click", () => {
            $(tag).remove();
            this.update_total_price();
        });
    }

    update_price(tag) {
        let cnt = tag.querySelector(".cnt_label").innerHTML * 1;
        let price = this.remove_comma(tag.querySelector(".item_default_price").innerHTML);
        tag.querySelector(".item_price").innerHTML = (cnt * price).toLocaleString();
        this.update_total_price();
    }



    make_basket_item_tmp(item) {
        let tag = `<div class="item_img_box">
        <img src="store/상품사진/${item.photo}" alt="">
    </div>
    <div class="item_text_box">
        <div class="item_brand">${item.brand}</div>
        <div class="item_product_name">${item.product_name}</div>
        <div class="item_default_box"><span class="item_default_price">${item.price}</span>원</div>
    </div>
    <div class="item_info_box">
        <div class="item_price_box">
            <span class="item_price">${item.price}</span>원
        </div>
        <div class="item_count_btn">
            <div class="minus_btn">-</div>
            <div class="cnt_label">1</div>
            <div class="plus_btn">+</div>
        </div>
    </div>
    <div class="remove_btn">&times;</div>`;

        return tag;
    }

    item_event(tag) {
        $(tag).draggable({
            cursor: "pointer",
            appentTo: ".drop_box",
            containment: "body",
            helper: "clone",
            revert: true
        })
    }

    draw_item(json) {
        json.forEach(item => {
            let tag = document.createElement("div");
            $(tag).addClass('item');
            tag.innerHTML = this.make_item_tmp(item);

            $(".item_box").append(tag);
            this.item_event(tag);
        });
    }

    make_item_tmp(item) {
        let tag = `<img src="store/상품사진/${item.photo}" alt="" data-idx="${item.id}">
        <div class="item_info">
            <div class="price">${item.price}원</div>
            <span class="brand">[${item.brand}]</span><span class="product_name">${item.product_name}</span>
        </div>`

        return tag;
    }

}