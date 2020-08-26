const env = process.env.NODE_ENV || "development";

if(env === "development") {
    const config = require('./config.json'); 
    process.env.MONGO_PASS = config.MONGO_PASS;
    process.env.MONGO_USER = config.MONGO_USER;
    process.env.MONGO_DB = config.MONGO_DB;
    process.env.JWT_SECRET = config.JWT_SECRET;
    process.env.ADMIN_PASS = config.ADMIN_PASS;
    process.env.APP_ADMIN = config.APP_ADMIN;
}
