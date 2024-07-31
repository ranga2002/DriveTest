const mongoose = require('mongoose')
const User = require('./models/User.js');

mongoose.connect('mongodb+srv://chakilamsriranga:QZptvEyeERLvTm0q@cluster0.tjbvb2q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {useNewUrlParser: true});

async function createUser(firstname, lastname, license, age, dob, make, model , year, platno ) {
    try {
        const userinfo = await User.create({
            firstname: firstname,
            lastname: lastname,
            LicenseNo: license,
            Age: age,
            dob: dob,
            car_details: {
            make: make,
            model: model,
            year: year,
            platno: platno
            }
        });
        console.log(userinfo);
        }
        catch (error) {
        console.log(error);
        }
}

createUser("Sri", "Chakilam", "ABC12", 32, "Honda", "MiniVan", 2008, "ABC123")