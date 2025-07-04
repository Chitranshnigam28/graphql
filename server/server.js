import express from "express"
import http from "http"
import cors from "cors"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express5"
import {typeDefs,resolvers} from "./src/schema.js"


const startApolloServer = async (typeDefs,resolvers)=>{
    const app=express()
    const httpServer= http.createServer(app)

    const server=new ApolloServer({typeDefs,resolvers,
        plugins:[ApolloServerPluginDrainHttpServer({httpServer})]
    })
    await server.start()
    app.use('/graphql',cors(),express.json(),expressMiddleware(server,{
        context:async ({req})=>({token:req.headers.token})
    }))
    

    await new Promise(resolve=>httpServer.listen({port:4000},resolve))

    console.log('Server is running at port 4000')
}

startApolloServer(typeDefs,resolvers)