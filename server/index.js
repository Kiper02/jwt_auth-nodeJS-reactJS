import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import sequelize from './db/db.js';
import router from './router/index.js';
import errorMiddleware from './middlewares/error-middleware.js';

const PORT = process.env.PORT || 5000;
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use('/api', router)
app.use(errorMiddleware);


const start = async() => {
    try {
        await sequelize.authenticate()
        await sequelize.sync();
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
    } catch (error) {
        console.log(error);
    }
}

start()