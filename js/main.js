"use strict";
let Pname = document.getElementById("prouductName");
let Pprice = document.getElementById("prouductPrice");
let Pcat = document.getElementById("productCategory");
let Pcolor = document.getElementById("productColor");
let Pimg = document.getElementById("productImg");
let addProd = document.getElementById("addProduct");
let Pcontainer = document.getElementById("products");
let imgPrev = document.getElementById("imgPrev");
let imgContainer = document.querySelector(".img-prev");
let msgContainer = document.querySelector(".msg");
let search = document.getElementById("search");
let productList = [];



Pimg.addEventListener("change", function () {
    if (Pimg.files && Pimg.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            imgPrev.src = e.target.result;
            imgContainer.style.display = "block";
        }
        reader.readAsDataURL(Pimg.files[0]);
    }
});

if (localStorage.getItem("productList") != null) {
    productList = JSON.parse(localStorage.getItem("productList"));
    displayProducts(productList);
}

// Add product
function addProduct() {
    let errors = []; // Collect all errors
    msgContainer.innerHTML = ''; // Clear previous messages

    // Name validation
    if (Pname.value.trim() === "") {
        errors.push("Product name is required");
    }

    // Price validation
    if (Pprice.value.trim() === "") {
        errors.push("Price is required");
    } else {
        const price = Number(Pprice.value);
        if (isNaN(price) || price < 6000 || price > 60000) {
            errors.push("Price must be between 6000 and 60000");
        }
    }

    // Category validation
    if (Pcat.value.trim() === "") {
        errors.push("Category is required");
    }

    // Color validation
    const selectedColors = getSelectedColors();
    if (selectedColors.length === 0) {
        errors.push("Please select at least one color");
    }

    // Image validation
    if (!Pimg.files || Pimg.files.length === 0) {
        errors.push("Image is required");
    } else {
        const file = Pimg.files[0];
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            errors.push("Invalid image type. Must be jpg, png, gif, bmp, or webp");
        }
    }

    // Display errors or proceed
    if (errors.length > 0) {
        msgContainer.innerHTML = errors.map(error =>
            `<h5 class='text-danger'>${error}</h5>`
        ).join('');
        return false;
    }

    // If validation passes, continue with product addition
    msgContainer.innerHTML = `<h5 class='text-success'>Product is added</h5>`;
    let productList = JSON.parse(localStorage.getItem("productList")) || [];
    let productID = productList.length > 0 ? productList[productList.length - 1].id + 1 : 1;

    let product = {
        id: productID,
        name: Pname.value,
        price: Pprice.value,
        category: Pcat.value,
        color: getSelectedColors(),
        img: Pimg.files[0] ? imgPrev.src : ""
    }

    const existingProductIndex = productList.findIndex(p => p.id === Number(addProd.getAttribute('data-edit-id')));

    if (existingProductIndex !== -1) {
        // Update existing product
        productList[existingProductIndex] = product;
    } else {
        // Add new product
        productList.push(product);
    }

    localStorage.setItem("productList", JSON.stringify(productList));
    displayProducts(productList);
    resetForm();
    addProd.removeAttribute('data-edit-id');
}

addProd.addEventListener("click", addProduct);

function getSelectedColors() {
    const selectedColors = [...Pcolor.selectedOptions].map(option => option.value);
    return selectedColors;
}

function searchProduct() {
    const searchTrem = search.value.trim();
    if (searchTrem === '') {
        displayProducts(productList);
        return;
    }
    const filteredProducts = productList.filter(
        product => product.name.toLowerCase().includes(searchTrem.toLowerCase()));
    displayProducts(filteredProducts, searchTrem);
}
search.addEventListener("input", searchProduct);

// Display products
function displayProducts(productList, searchTerm = '') {

    if (productList.length === 0) {
        Pcontainer.innerHTML = "<h2 class='text-center'>No products found</h2>";
        return;
    }

    let product = '';
    for (let i = 0; i < productList.length; i++) {
        let colors;

        if (Array.isArray(productList[i].color)) {
            colors = productList[i].color;
        } else {
            colors = [productList[i].color];
        }
        let displayName = productList[i].name;
        if (searchTerm) {
            // Case-insensitive search highlighting
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            displayName = displayName.replace(regex, '<mark>$1</mark>');
        }
        product += `
        <div class="col-lg-4 col-md-6" data-id="${productList[i].id}">
            <div class="card d-flex flex-column align-items-center">
                <div class="product-name my-3"><h2 class="h5">${displayName}</h2></div>
                <div class="card-img"> 
                <img class="img-fluid ratio-16x9" src="${productList[i].img || '../img/1.jpg'}" alt=""> </div>
                <div class="card-body pt-5">
                    <div class="text-muted text-center mt-auto">Available Colors</div>
                    <div class="d-flex align-items-center justify-content-center colors my-2 flex-column">
                        <div class="colors d-flex align-items-center">
                            ${colors.map(color => `<div style="background-color:${color}" class="color-circle p-3 me-1 rounded-circle"></div>`).join('')} 
                            </div>
                        <div class="d-flex align-items-center price">
                            <div class="fw-bold">${productList[i].price} Egp</div>
                        </div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-edit" data-id="${productList[i].id}">
                                <i class="fa-solid fa-pen pe-2"></i>
                            </button>
                            <button class="btn btn-delete pe-2" data-id="${productList[i].id}">
                                <i class="fa-solid fa-trash-can"></i>
                                
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    Pcontainer.innerHTML = product;
    getAlledite();
}

function getAlledite() {
    let btnEditProd = document.querySelectorAll(".btn-edit");
    let btnDeleteProduct = document.querySelectorAll(".btn-delete");

    for (let i = 0; i < btnEditProd.length; i++) {
        btnEditProd[i].addEventListener("click", function () {
            let id = this.getAttribute('data-id');
            pushToform(id);


        });
    }
    btnDeleteProduct.forEach(btn => {
        btn.addEventListener("click", function () {
            let id = this.getAttribute('data-id');
            removeProduct(id);
        });
    });

}

// Edit product
function pushToform(id) {
    const numId = Number(id);
    const product = productList.find(p => p.id === numId);

    if (product) {
        Pname.value = product.name;
        Pprice.value = product.price;
        Pcat.value = product.category;

        for (let option of Pcolor.options) {
            option.selected = false;
        }

        product.color.forEach(color => {
            const option = Array.from(Pcolor.options).find(opt => opt.value === color);
            if (option) option.selected = true;
        });

        if (product.img) {
            imgPrev.src = product.img;
            imgContainer.style.display = "block";
        } else {
            imgPrev.src = "";
            imgContainer.style.display = "none";
        }
        addProd.textContent = "Update Product";
        addProd.setAttribute('data-edit-id', id);
    }
}

// Delete product
function removeProduct(id) {
    const numId = Number(id)
    const current = productList.findIndex(product => product.id === numId);
    if (current !== -1) {

        productList.splice(current, 1);
    }


    localStorage.setItem("productList", JSON.stringify(productList));
    displayProducts(productList);
}

function resetForm() {
    Pname.value = "";
    Pprice.value = "";
    Pcat.value = "";
    Pcolor.value = "";
    Pimg.value = "";
    imgPrev.src = "";
    imgContainer.style.display = "none";
    addProd.textContent = "Add Product"; // Reset button text
}