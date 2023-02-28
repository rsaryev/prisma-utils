import {generatePrismaSchema, providers} from "./helpers";
import {ProviderType} from "../src/clear-tables";

describe("generatePrismaSchema", () => {
    it.each(providers)("should generate schema for %s", (provider) => {
        const schema = generatePrismaSchema(provider as ProviderType)
        expect(schema).toMatchSnapshot()
    })
})