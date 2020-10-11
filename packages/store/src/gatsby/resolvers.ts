import { Reporter } from 'gatsby';

import {
  GatsbyCtx,
  ProductFeatures,
  ProductImage,
  ProductImageSize,
  ShopifyProductNode,
  Variant,
} from '.';
import { priceFormatter } from '../utils';

const LOCALE = 'en-GB';

function productFeaturesResolver(
  source: ShopifyProductNode,
  _: object,
  ctx: GatsbyCtx<ProductFeatures>,
) {
  return (
    ctx.nodeModel
      .getAllNodes({ type: 'GraphCMS_Product' })
      .find(({ title }) => {
        const regex = new RegExp(`(^\s*${title})`, 'gi');
        return regex.test(source.title);
      }) ?? null
  );
}

export function shopifyProductResolver() {
  return {
    ShopifyProduct: {
      slug: {
        type: 'String!',
        resolve(source: ShopifyProductNode) {
          return `/products/${source.handle}`.replace(/\/\/+/g, '/');
        },
      },
      features: {
        resolve: productFeaturesResolver,
      },
    },
  };
}

export function shopifyProductImagesField() {
  return {
    ShopifyProductImages: {
      srcSet: {
        type: '[String!]!',
        resolve(source: ProductImage) {
          return Object.values(ProductImageSize).map(size =>
            source.originalSrc.replace(/(.jpg)+/gi, `_${size}.jpg`),
          );
        },
      },
    },
  };
}

export function productVariantPriceFields(reporter: Reporter) {
  return {
    ShopifyProductVariant: {
      compareAtLocalePrice: {
        type: 'ShopifyProductVariantPriceV2',
        resolve(source: Variant) {
          try {
            const { compareAtPriceV2 } = source;
            if (!!!compareAtPriceV2) {
              return null;
            }
            const { amount, currencyCode } = compareAtPriceV2;
            return {
              amount: priceFormatter(amount, LOCALE, currencyCode),
              currencyCode: currencyCode,
            };
          } catch (error) {
            reporter.panic(
              '🚨 Create Resolvers: Shopify product variant',
              error,
            );
          }
        },
      },
      priceLocale: {
        type: 'ShopifyProductVariantPriceV2!',
        resolve(source: Variant) {
          try {
            const {
              priceV2: { amount, currencyCode },
            } = source;

            return {
              amount: priceFormatter(amount, LOCALE, currencyCode),
              currencyCode: currencyCode,
            };
          } catch (error) {
            reporter.panic(
              '🚨 Create Resolvers: Shopify product variant',
              error,
            );
          }
        },
      },
    },
  };
}

export function createStoreResolvers(
  createResolvers: (schema: object) => void,
  reporter: Reporter,
): void {
  createResolvers({
    ...shopifyProductResolver(),
    ...shopifyProductImagesField(),
    ...productVariantPriceFields(reporter),
  });
}
