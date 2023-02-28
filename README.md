# Utils for [Prisma](https://www.prisma.io/)

### Install
```bash
npm install prisma-utils
```

### To Use
The `clearAllTables` clears all tables in a database using a single command, which can be very useful for testing and debugging".
```ts
import {PrismaClient} from "@prisma/client";
import {clearAllTables} from "prisma-utils";

describe('simple example', () => {
    const prisma = new PrismaClient()
    const provider = 'postgres'
    beforeAll(async () => {
        // clear all tables
        await clearAllTables(prisma, {
            provider,
            //If you want to exclude some tables
            exclude: ['user']
        })
    })

    it('should clear tables', async () => {
        const users = await prisma.user.findMany();
        const posts = await prisma.post.findMany();
        expect(users).toHaveLength(1);
        expect(posts).toHaveLength(0);
    })
})
```

###  Run tests
```bash
# Clone the repo
git clone https://github.com/rsaryev/prisma-utils.git
cd prisma-utils
# Install dependencies
npm install or yarn
# Run docker-compose
docker-compose up
# Run tests
npm run test
```
