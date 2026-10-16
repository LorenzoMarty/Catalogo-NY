import { describe, expect, it } from 'vitest';
import schema from './contract/public-catalog-v1.schema.json';
import { parseRemoteCatalog, toCatalogData } from './catalogApi';

/**
 * Consumer side of the /public/v1/catalog contract (ADR 0001 in Estoque-NY).
 *
 * `contract/public-catalog-v1.schema.json` is a copy of the schema frozen in
 * Estoque-NY (`tests/contracts/public_catalog_v1.schema.json`); refresh it with
 * `npm run contract:sync`. When Estoque removes or retypes a field its own CI fails;
 * once the new snapshot is copied here this test fails if the site still reads it.
 */

type Prop = {
  $ref?: string;
  anyOf?: Prop[];
  type?: string;
  items?: Prop;
};
type ObjectDef = { properties: Record<string, Prop>; required?: string[] };
const defs = (schema as unknown as { $defs: Record<string, ObjectDef> }).$defs;
const root = schema as unknown as ObjectDef;

const productDef = defs.PublicProductOut;
const sectorDef = defs.PublicSectorOut;

// Every field of the feed that src/services/catalogApi.ts reads.
const READ_FROM_PRODUCT = [
  'id',
  'name',
  'brand',
  'description',
  'price_usd',
  'price_is_from',
  'featured',
  'image_url',
  'in_stock',
];
const READ_FROM_SECTOR = ['name', 'products'];
const READ_FROM_ROOT = ['sectors'];

/** A value that satisfies the schema, preferring a non-null string over a number. */
function sample(prop: Prop, name: string): unknown {
  if (prop.$ref) {
    const def = defs[prop.$ref.split('/').pop() as string];
    return Object.fromEntries(
      Object.keys(def.properties).map((k) => [k, sample(def.properties[k], k)]),
    );
  }
  if (prop.anyOf) {
    const concrete = prop.anyOf.filter((p) => p.type !== 'null');
    return sample(concrete.find((p) => p.type === 'string') ?? concrete[0], name);
  }
  switch (prop.type) {
    case 'array':
      return [sample(prop.items as Prop, name)];
    case 'integer':
      return 41;
    case 'boolean':
      return true;
    case 'string':
      return name === 'price_usd' ? '129.50' : `${name}-value`;
    default:
      throw new Error(`contract uses a type the test does not know: ${prop.type}`);
  }
}

describe('public catalog contract (v1)', () => {
  it.each(READ_FROM_ROOT)('still has the top-level field %s the site reads', (field) => {
    expect(root.properties).toHaveProperty(field);
  });

  it.each(READ_FROM_SECTOR)('still has the sector field %s the site reads', (field) => {
    expect(sectorDef.properties).toHaveProperty(field);
  });

  it.each(READ_FROM_PRODUCT)('still has the product field %s the site reads', (field) => {
    expect(productDef.properties).toHaveProperty(field);
  });

  it('parses a payload built from the schema and keeps every field the UI shows', () => {
    const payload = Object.fromEntries(
      Object.entries(root.properties).map(([key, prop]) => [key, sample(prop, key)]),
    ) as { sectors: { name: string; products: Record<string, unknown>[] }[] };

    const parsed = parseRemoteCatalog(payload);

    expect(parsed).not.toBeNull();
    const [expectedSector] = payload.sectors;
    const [expected] = expectedSector.products;
    const [sector] = parsed!.sectors;
    expect(sector.name).toBe(expectedSector.name);
    // each field survives the parser unchanged (a field the parser stops reading would
    // come back as its default and differ from the value the schema produced)
    for (const field of READ_FROM_PRODUCT) {
      expect((sector.products[0] as unknown as Record<string, unknown>)[field]).toEqual(
        field === 'brand' ? expected.brand : expected[field],
      );
    }
  });

  it('maps the schema-built payload into what the page renders', () => {
    const payload = Object.fromEntries(
      Object.entries(root.properties).map(([key, prop]) => [key, sample(prop, key)]),
    );
    const parsed = parseRemoteCatalog(payload)!;

    const data = toCatalogData(parsed);

    const [shown] = data.sectors[0].products;
    expect(shown.id).toBe('41');
    expect(shown.name).toBe('name-value');
    expect(shown.price).toBe('a partir de US$ 129.50'); // price_is_from is true in the sample
    expect(shown.inStock).toBe(true);
    expect(data.featuredMix).toEqual(['41']); // featured: true in the sample
    expect(data.images['41'].src).toBe('image_url-value');
  });

  it('flags a schema that dropped a field the site needs', () => {
    const without = { ...productDef.properties } as Record<string, Prop>;
    delete without.price_usd;

    // the assertion the first block makes, applied to a schema that lost price_usd
    expect(Object.keys(without)).not.toEqual(expect.arrayContaining(READ_FROM_PRODUCT));
  });
});
