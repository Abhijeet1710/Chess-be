import { Router } from "express";

const authRouter = Router()

authRouter.post("/login", (req, res) => {
    console.log(req.body);
    res.status(200).json({userName: req.body.userName, token: "123456789abcdefghi" })
})

export default authRouter