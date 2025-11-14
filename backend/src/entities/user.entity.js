import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        username: {
            type: "varchar",
            nullable: false
        },
        email: {
            type: "varchar",
            length: 255,
            unique: true,
            nullable: false,
        },
        rut: {
            type: "varchar",
            length: 12,
            unique: true,
            nullable: false,
        },
        password: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        role: {
            type: "enum",
            enum: ["administrador", "jefe_carrera", "docente", "alumno"],
            default: "alumno",
            nullable: false
        },
        created_at: {
            type: "timestamp",
            createDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
    },
});
