var Sequelize= require('sequelize');
const db = new Sequelize('test' , 'postgres' , "1234" , {
    dialect:'postgres',
    port:5432,
    logging:console.log
});

db.authenticate()
.then((data)=>{
    console.log('DB connected Successfully');

}).catch((err)=>{
    console.log('DB connection failed' , err);
});
module.exports = db;
