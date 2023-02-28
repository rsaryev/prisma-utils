import {clearAllTables, ProviderType} from "../src/clear-tables";
import {initDatabase, providers} from "./helpers";

describe("ClearTables", () => {
    it.each(providers)("should clear tables in %s database", async (provider: ProviderType) => {
        const prisma = await initDatabase(provider)
        const user = await prisma.user.create({data: {name: "John", id: 1}});
        await prisma.post.create({data: {title: "Hello", content: "World", authorId: user.id, id: 1}});

        await clearAllTables(prisma, {provider});

        const users = await prisma.user.findMany();
        const posts = await prisma.post.findMany();
        expect(users).toHaveLength(0);
        expect(posts).toHaveLength(0);
        await prisma.$disconnect()
    })

    it("should clear tables excluding some tables", async () => {
        const provider: ProviderType = 'sqlite'
        const prisma = await initDatabase(provider)
        const user = await prisma.user.create({data: {name: "David", id: 1}});
        await prisma.post.create({data: {title: "Hello!", content: "World", authorId: user.id, id: 1}});

        await clearAllTables(prisma, {provider, exclude: ['user']});

        const users = await prisma.user.findMany();
        const posts = await prisma.post.findMany();
        expect(users).toHaveLength(1);
        expect(posts).toHaveLength(0);
        await prisma.$disconnect()
    })
});


