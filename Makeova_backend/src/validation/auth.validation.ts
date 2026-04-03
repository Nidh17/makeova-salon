import z from "zod";

export const authValidation=z.object({
    email:z.email(),
    password:z.string().min(6,"password must be 6 char").max(20,"password can not exceed 20 char"),
})