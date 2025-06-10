const httpServer = require("./app");
const dotenv = require("dotenv")
dotenv.config();
httpServer.listen(process.env.PORT || 3002, () => {
  console.log("Servidor escuchando en el puerto 3002");
});
