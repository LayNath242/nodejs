const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event')
const app = express();



app.use(bodyParser.json());
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            price: Float!
        }

        input EventInput{
            title: String!
            price: Float!
        }

        type RootQuery {
            events:  [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return { ...event._doc };
                    });
                })
                .catch(err => {
                    throw err;
                });
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                price: +args.eventInput.price,
                // date: new Date(args.eventInput.Date)
            }); 
            return event
                .save()
                .then(result => {
                    console.log(result)
                    return {...result._doc}
                })
                .catch(err =>{
                    console.log(err)
                    throw err
                });
            return event;
            }
        },
      graphiql: true
    })
);



 mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${
            process.env.MONGO_PASSWORD}@mycluster-9nwmu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
             { useNewUrlParser: true })
        .then(() => {
            const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => console.log(`Your server run on port ${PORT}`)) ;
        })
        .catch(err => {
            console.log(err)
        });
        
  