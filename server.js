const app = require("./app");
require("dotenv").config()
const mongoose = require("mongoose");

let { DB_HOST, PORT=3313 } = process.env;

if(process.env.NODE_ENV === 'local'){
  // DB_HOST = 'mongodb+srv://test:egor2006@atlascluster.i6jqxpj.mongodb.net/?retryWrites=true&w=majority'
}

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
    console.log("Database connection successful");
    console.log(process.env.NODE_ENV === 'local' ? "LOCAL MODE LOCAL MODE LOCAL MODE" : "PRODUCTION PRODUCTION PRODUCTION PRODUCTION");
  })
  .catch((error) => {
    console.log("Database connection error" + error);
    process.exit(1);
  });
