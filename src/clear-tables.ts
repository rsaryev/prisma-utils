export type ProviderType = 'mysql' | 'postgres' | 'sqlite' | "cockroachdb";

export function getTables(prisma): string[] {
    return Object.keys(prisma).filter((key) => {
        const model = prisma[key];
        return model && model['deleteMany'];
    })
}

export async function clearMysql(prisma, excludeTable): Promise<void> {
    const tables = getTables(prisma);
    await prisma.$transaction([
        prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`,
        ...tables
            .filter((table) => !excludeTable.includes(table))
            .map((table) =>
                prisma.$executeRawUnsafe(`TRUNCATE ${table};`),
            ),
        prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`,
    ]);
}

export async function clearPostgres(prisma, excludeTable): Promise<void> {
    const tables = getTables(prisma);
    await prisma.$transaction([
        ...tables
            .filter((table) => !excludeTable.includes(table))
            .map((table) =>
                prisma.$executeRawUnsafe(`TRUNCATE "${table}" CASCADE;`)
            ),
    ]);
}

export async function clearSqlite(prisma, excludeTable): Promise<void> {
    const tables = getTables(prisma);
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`);
    await Promise.all(tables
        .filter((table) => !excludeTable.includes(table))
        .map((table) =>
        prisma.$executeRawUnsafe(`DELETE
                                  FROM ${table};`)));
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
}

const clearFunctions: { [key in ProviderType]?: (prisma, excludeTable) => Promise<void> } = {
    mysql: clearMysql,
    postgres: clearPostgres,
    sqlite: clearSqlite,
    cockroachdb: clearPostgres,
};

export async function clearAllTables(prisma, {
    provider,
    exclude = [],
}: {
    provider: ProviderType,
    exclude?: string[],
}): Promise<void> {
    const clearFn = clearFunctions[provider];
    await clearFn(prisma, exclude);
}
