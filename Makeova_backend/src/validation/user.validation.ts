import z from "zod";

const workingDayEnum = z.enum(["sun", "mon", "tue", "wed", "thu", "fri", "sat"], {
    message: "Invalid working day"
});

export const userValidation = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password cannot exceed 20 characters"),
    phonenumber: z.string()
        .min(10, "Enter valid mobile number")
        .max(10, "Enter valid mobile number"),
    gender: z.enum(["male", "female", "other"], {
        message: "Gender must be male, female or other"
    }),
    profileImg: z.string().url("Invalid image URL").optional(),
    address: z.string().min(1, "Address is required"),
    dob: z.string().optional(),
    role: z.array(
        z.string().refine(val => /^[a-fA-F0-9]{24}$/.test(val), {
            message: "Invalid role ID"
        })
    ).min(1, "At least one role is required"),
    specialization: z.string()
        .refine(val => /^[a-fA-F0-9]{24}$/.test(val), {
            message: "Invalid specialization ID"
        })
        .optional(),
    experienceYears: z.number()
        .min(0, "Experience years cannot be negative")
        .max(50, "Experience years cannot exceed 50")
        .optional(),
    isAvailable: z.boolean().default(true),
    Bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
    WorkingDay: z.union([
        workingDayEnum,
        z.array(workingDayEnum).min(1, "At least one working day is required"),
    ]).transform((value) => Array.isArray(value) ? value : [value]).optional(),
});

export const registerValidation = userValidation.pick({
    name: true,
    email: true,
    password: true,
    phonenumber: true,
    gender: true,
    address: true,
    role: true,
});

export const updateUserValidation = userValidation.partial();

export type UserInput = z.infer<typeof userValidation>;
export type RegisterInput = z.infer<typeof registerValidation>;
export type UpdateUserInput = z.infer<typeof updateUserValidation>;


