const db = {
  // definiendo funciones dentro de metodos
  methods: {
    find: (id) => {
      //const valor = db.items.find((item) => item.id === id);
      //console.log("Tipo de dato retornado ", typeof(valor), 'Type id ', typeof(id));
      return db.items.find((item) => item.id === id);
      //return valor;
    },
    remove: (items) => {
      items.forEach((item) => {
        const product = db.methods.find(item.id);
        product.qty = product.qty - item.qty;
      });
      console.log("base db", db);
    },
  },
  // simulando base de datos
  items: [
    {
      id: 0,
      title: "Funko Pop",
      price: 250,
      qty: 5,
    },
    {
      id: 1,
      title: "Harry Potter",
      price: 345,
      qty: 50,
    },
    {
      id: 2,
      title: "Phillips Hue",
      price: 1300,
      qty: 80,
    },
    {
      id: 3,
      title: "iPod",
      price: 6000,
      qty: 8,
    },
  ],
};

// debe ser independiente de la base de datos
const shoppingCart = {
  items: [],
  methods: {
    // adicionar carrito de compras
    add: (id, qty) => {
      const cartItem = shoppingCart.methods.get(id);
      if (cartItem) {
        // id, qty+cartItem.qty , añadido qty + nuevo ped del mismo elemento
        if (shoppingCart.methods.hasInventory(id, qty + cartItem.qty)) {
          cartItem.qty += qty; // suma hay+nuevo
        } else {
          alert("No hay inventario suficiente ...!!! ");
        }
      } else {
        // cuando no hya elemento en el carrito de compras
        shoppingCart.items.push({ id, qty }); // coloca id producto + cant pedida
      }
    },

    remove: (id, qty) => {
      const cartItem = shoppingCart.methods.get(id);
      if (cartItem.qty - qty > 0) {
        // descontar item borrado del carrito de compras
        cartItem.qty -= qty;
      } else {
        // filtra solo elementos al carrito, elementos distintos al id
        // deja los que no elimino
        shoppingCart.items = shoppingCart.items.filter(
          (item) => item.id !== id
        );
      }
    },
    // contar cant elementos de una categoria
    count: () => {
      // conteo por grupo, se inicia en cero, por ser reduce
      return shoppingCart.items.reduce((acc, item) => acc + item.qty, 0);
    },
    // obtener un elemenyo por su id
    get: (id) => {
      const index = shoppingCart.items.findIndex((item) => item.id === id);
      return index >= 0 ? shoppingCart.items[index] : null;
    },
    // precio total de un item
    getTotal: () => {
      const total = shoppingCart.items.reduce((acc, item) => {
        const found = db.methods.find(item.id);
        return acc + found.price * item.qty;
      }, 0);
      return total;
      // --ojo -- con forEach seria:
      // let total = 0;
      // shoppingCart.items.forEach((item) => {
      //   const found = db.methods.find(item.id);
      //   total += found.price * item.qty;
      // });
      // return total;
    },

    // revisa si hay inventario
    hasInventory: (id, qty) => {
      return db.items.find((item) => item.id === id).qty - qty >= 0;
    },

    // metodo de finizar compra
    purchase: () => {
      db.methods.remove(shoppingCart.items);
      //console.log("Activar borrado de items, cuando se compro");
      shoppingCart.items = [];
    },
  },
};

// Renderizar
renderStore();

function renderStore() {
  const html = db.items.map((item) => {
    return `
      <div class="item">
        <div class="id">Id: ${item.id} </div>
        <div class="title">Prod: ${item.title} </div>
        <div class="price">Price: ${numberToCurrency(item.price)} </div>
        <div class="qty">Qty: ${item.qty} Units </div>
        
        <div class="actions"> 
          <button class="add" 
            data-id="${item.id}"> 
            Add to Shopping Cart 
          </button> 
        </div>
      </div>
     `;
  });
  document.querySelector("#store-container").innerHTML = html.join("");
  // listeners para los botones
  document.querySelectorAll(".item .actions .add").forEach((button) => {
    // funcion call back
    button.addEventListener("click", (e) => {
      const id = parseInt(button.getAttribute("data-id"));
      //const id = button.getAttribute("data-id");
      const item = db.methods.find(id);
      //console.log("Tipo de dato item ", typeof item);
      if (item && item.qty - 1 > 0) {
        // añadir al shopping cart
        shoppingCart.methods.add(id, 1);
        //console.log(shoppingCart);
        renderShoppingCart();
      } else {
        alert("Ya no hay inventario");
        console.log("Ya no hay inventario");
      }
    });
  });
}

function renderShoppingCart() {
  const html = shoppingCart.items.map((item) => {
    const dbItem = db.methods.find(item.id);
    // Aqui va el item de mi carrito de compras ${item.qty}
    return `
    <div class="item">
      <div class="title">${dbItem.title}</div>
      <div class="price"> ${numberToCurrency(dbItem.price)} </div>
      <div class="qty"> ${item.qty} Units </div>
      <div class="subtotal">
        SubTotal : ${numberToCurrency(item.qty * dbItem.price)}
      </div>
      <div class="actions">
        <button class="addOne" data-id="${dbItem.id}">+</button>
        <button class="removeOne" data-id="${dbItem.id}">-</button>
      </div>
    </div>
   `;
  });
  //  hacer boton de cierre
  const closeButton = `
    <div class="cart-header">
      <button class="bClose">Close</button>
    </div>
  `;
  // hacer boton de compra, valida si tiene items crea capa de lo contrario ""
  const purchaseButton =
    shoppingCart.items.length > 0
      ? `
  <div class="cart-actions"> 
    <button class="bPurchase">Purchase</button>
  </div>
  `
      : "";

  const total = shoppingCart.methods.getTotal();
  const totalContainer = `<div class="total">Total : ${numberToCurrency(
    total
  )}</div>`;

  //hacer referencia y une los botones y resultados para mostrar en pantalla
  const shoppingCartContainer = document.querySelector(
    "#shopping-cart-container"
  );
  
  shoppingCartContainer.classList.remove("hide");
  shoppingCartContainer.classList.add("show");

  shoppingCartContainer.innerHTML =
    closeButton + html.join("") + totalContainer + purchaseButton;

  // button addOne
  document.querySelectorAll(".addOne").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(button.getAttribute("data-id"));
      shoppingCart.methods.add(id, 1);
      renderShoppingCart();
    });
  });

  // button removeOne
  document.querySelectorAll(".removeOne").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(button.getAttribute("data-id"));
      shoppingCart.methods.remove(id, 1);
      renderShoppingCart();
    });
  });

  // button close
  document.querySelector(".bClose").addEventListener("click", (e) => {
    shoppingCartContainer.classList.remove("show");
    shoppingCartContainer.classList.add("hide");
  });

  //button purchase
  const bPurchase = document.querySelector(".bPurchase");
  if (bPurchase) {
    bPurchase.addEventListener("click", (e) => {
      shoppingCart.methods.purchase();
      renderStore(); // actualiza en pantalla cantidades
      renderShoppingCart(); // muestra compra
    });
  }
}

// utiliza API se llama INTernationaL, formateo de campos numericos y fechas?
function numberToCurrency(n) {
  // Intl = api maneja formatos
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD",
  }).format(n);
}
