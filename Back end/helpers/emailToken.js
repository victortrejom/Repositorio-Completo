import jwt from "jsonwebtoken";

export function generarEmailToken(data) {
    return jwt.sign(data, process.env.EMAIL_TOKEN_SECRET, { expiresIn: "24h" });
}
