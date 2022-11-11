const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MONGO CONNECTION OPEN!!!')
    })
    .catch(err => {
        console.log('MONGO CONNECTION ERROR!!!')
        console.log(err)
    })


const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});    //ALL PREVIOUS ENTRIES WILL BE DELETED
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            author: '6356ee23fdc2a326b36895ac',
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Harum doloremque omnis sint dignissimos. Voluptatum, natus fugit? Labore in enim laboriosam reprehenderit! Eius autem, adipisci vitae similique sint praesentium! In, molestias. Eos voluptatibus commodi ipsa dignissimos fuga architecto dolorum laudantium eum, accusamus saepe quis pariatur harum ut laborum corrupti blanditiis optio.',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            price: Math.floor(Math.random() * 200) + 50,
            geometry: {
                type: "Point",
                coordinates: [      //Order important for geojson
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dmlwg7ncb/image/upload/v1667413902/SelfYelp/tbuyxir1gvkx1yv4hoxy.jpg',
                    filename: 'SelfYelp/tbuyxir1gvkx1yv4hoxy'
                },
                {
                    url: 'https://res.cloudinary.com/dmlwg7ncb/image/upload/v1667413902/SelfYelp/nart1th1amewukbk09sk.png',
                    filename: 'SelfYelp/nart1th1amewukbk09sk'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});