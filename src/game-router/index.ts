import { Router } from 'express';

const gameRouter = Router()

gameRouter.post("/init-game", async (req, res) => {
    console.log("init Game " + JSON.stringify(req.body));

    res.status(500).json({msg: "Internal Server Error"})
})

export default gameRouter