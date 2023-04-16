const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");
const dotenv = require("dotenv").config();
const QRPortalWeb = require("@bot-whatsapp/portal");
const axios = require("axios");
const WebWhatsappProvider = require("@bot-whatsapp/provider/web-whatsapp");
const MockAdapter = require("@bot-whatsapp/database/mock");

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

const consultarPadron = async (cedula) => {
  const data = {
    cpt: "-",
    cedula: cedula,
  };

  const url = process.env.ARN_URL;
  const options = {
    method: "POST",
    data: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await axios(url, options);
  const resultado = response.data;
  return resultado;
};

const hola = async (cedula) => {
  try {
    const resultado = await consultarPadron(cedula);
    return resultado.data;
  } catch (error) {
    console.error("Error al ejecutar la función:", error);
  }
};

const flowSecundario = addKeyword([
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
]).addAnswer(["Envia *Si* para iniciar el chatbot"]);

let res;

const flowPrincipal = addKeyword(["si"])
  .addAnswer(
    "👋🏻¡Hola querido Cuidadano! *¡Bienvenido al bot de datos electorales!*"
  )
  .addAnswer(
    "👤 Introduce tu Número de Cédula:",
    { capture: true },
    async (ctx, { flowDynamic }) => {
      const res = await hola(ctx.body);

      if (res !== null) {
        flowDynamic([
          `🗳 𝗗𝗔𝗧𝗢𝗦 𝗗𝗘𝗟 𝗩𝗢𝗧𝗔𝗡𝗧𝗘：↓\n*Nombre*: ${res[0].apellido}\n*Apellido*: ${res[0].nombre}\n*Departamento*: ${res[0].departamento}\n*Distrito*: ${res[0].distrito}\n*Local*: ${res[0].local}\n*Mesa*: ${res[0].mesa}\n*Orden*: ${res[0].orden}`,
        ]);
      } else {
        flowDynamic(
          `❌ No encontramos coincidencia con el numero de documento: ${ctx.body}`
        );
      }
    }
  )
  .addAnswer("Escriba *Si* para una nueva busqueda 🔎");

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal, flowSecundario]);
  const adapterProvider = createProvider(WebWhatsappProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
