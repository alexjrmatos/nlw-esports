import express from "express";
import { PrismaClient } from "@prisma/client"
import cors from 'cors'

import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesStringToHourString } from "./utils/convert-minutes-to-hour-string";


const app = express();

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
    log: ['query']
})

const port = 3333

app.get('/games', async (req, res) => {
    const data = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })
    return res.json(data)
})

app.get('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            yearsPlaying: true,
            useVoiceChannel: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return res.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesStringToHourString(ad.hourStart),
            hourEnd: convertMinutesStringToHourString(ad.hourEnd)
        }
    }))
})

app.get('/ads/:id/discord', async (req, res) => {
    const id = req.params.id
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id
        }
    })

    return res.json({
        discord: ad.discord
    }).status(200)
})

app.post('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id
    const body: any = req.body 

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(","),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    })

    return res.json(ad)
})

app.listen(port);