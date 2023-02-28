import {PrismaClient} from "@prisma/client";
import {exec} from "child_process";
import * as util from 'util';
import * as fs from "fs";
import {ProviderType} from "../src/clear-tables";

const execPromisify = util.promisify(exec);

const URL_POSTGRES = process.env.URL_POSTGRES;
const URL_MYSQL = process.env.URL_MYSQL;
const URL_SQLITE = process.env.URL_SQLITE;
const URL_COCKROACHDB = process.env.URL_COCKROACHDB;
const URL_MONGODB = process.env.URL_MONGODB;

export const generatePrismaSchema = (provider: ProviderType) => {
    const sqlite = `
datasource sqlite {
    provider = "sqlite"
    url = "${URL_SQLITE}"
}
    `

    const postgres = `
datasource postgres {
    provider = "postgresql"
    url = "${URL_POSTGRES}"
}
    `

    const mysql = `
datasource mysql {
    provider = "mysql"
    url = "${URL_MYSQL}"
}
    `

    const cockroachdb = `
datasource cockroachdb {
    provider = "cockroachdb"
     url = "${URL_COCKROACHDB}"
}
    `

    const mongodb = `
datasource mongodb {
    provider = "mongodb"
    url = "${URL_MONGODB}"
}
    `

    const providersMapping = {
        mysql,
        postgres,
        sqlite,
        cockroachdb,
        mongodb,
    }

    return `${providersMapping[provider]}
generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @unique
  name      String?
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())

  @@map("user")
}

model Post {
  id        Int      @unique
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())

  @@map("post")
}

model Profile {
  id        Int      @unique
  bio       String?
  user      User     @relation(fields: [userId], references: [id])
  userId    Int      @unique
  createdAt DateTime @default(now())

  @@map("profile")
}
    `
}

export const initDatabase = async (provider: ProviderType): Promise<PrismaClient> => {
    const prismaFile = `./schema.${provider}.prisma`
    fs.writeFileSync(`./${prismaFile}`, generatePrismaSchema(provider))
    await execPromisify(`npx prisma migrate reset --force --skip-seed --schema ./${prismaFile} && prisma db push --schema ./${prismaFile}`);
    return new PrismaClient()
}

export const providers: ProviderType[] = ['mysql', 'postgres', 'sqlite', 'cockroachdb']