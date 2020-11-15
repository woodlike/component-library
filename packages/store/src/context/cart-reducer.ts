import { Dispatch } from 'react';

export interface CartState {
  readonly client: ShopifyBuy.Client;
  readonly cart: ShopifyBuy.Cart;
}

export interface ActionType<T extends string, P = undefined> {
  readonly type: T;
  readonly payload: P;
}

export interface LineItemProps extends ShopifyBuy.LineItem {
  readonly customAttributes: ShopifyBuy.CustomAttribute[];
  readonly variant: {
    readonly image: {
      readonly altText?: string | null;
      readonly src: string;
    };
    readonly priceV2: {
      readonly amount: string;
      readonly currencyCode: string;
    };
    readonly title: string;
  };
}

export interface InitCheckoutPayload {
  readonly cartId: string | null;
  readonly client: ShopifyBuy.Client;
  readonly dispatch: Dispatch<Action>;
}

export interface AddCartItemsPayload {
  readonly cartId: string | number;
  readonly client: ShopifyBuy.Client;
  readonly lineItemsToAdd: ShopifyBuy.LineItemToAdd[];
  readonly dispatch: Dispatch<Action>;
}

export interface RemoveCartItemPayload {
  readonly cartId: string | number;
  readonly client: ShopifyBuy.Client;
  readonly dispatch: Dispatch<Action>;
  readonly lineItemId: string;
}

export type Action =
  | ActionType<'initialize_checkout', InitCheckoutPayload>
  | ActionType<'update_cart', ShopifyBuy.Cart>
  | ActionType<'add_cart_items', AddCartItemsPayload>
  | ActionType<'remove_cart_item', RemoveCartItemPayload>;

export function initializeCheckout(payload: InitCheckoutPayload) {
  const { cartId, client, dispatch } = payload;
  try {
    if (!!cartId) {
      client.checkout.fetch(cartId).then(async cart => {
        if (cart && cart.id) {
          dispatch({ type: 'update_cart', payload: cart });
          return;
        }
        const newCart = await client.checkout.create();
        localStorage.setItem('shopify_checkout_id', `${newCart.id}`);
        dispatch({ type: 'update_cart', payload: newCart });
      });
    } else {
      client.checkout.create().then(cart => {
        localStorage.setItem('shopify_checkout_id', `${cart.id}`);
        dispatch({ type: 'update_cart', payload: cart });
      });
    }
  } catch (error) {
    console.warn(`CartProvider Shopify reducer (initializeCheckout): ${error}`);
    localStorage.setItem('shopify_checkout_id', '');
  }
}

export function handleAddLineItems(payload: AddCartItemsPayload) {
  const { cartId, client, lineItemsToAdd, dispatch } = payload;
  client.checkout
    .addLineItems(cartId, lineItemsToAdd)
    .then(cart => {
      dispatch({ type: 'update_cart', payload: cart });
    })
    .catch(error =>
      console.warn(
        `CartProvider Shopify reducer (handleAddLineItems): ${error}`,
      ),
    );
}

export function removeLineItem(payload: RemoveCartItemPayload) {
  const { cartId, client, dispatch, lineItemId } = payload;

  client.checkout
    .removeLineItems(cartId, [lineItemId])
    .then(cart => dispatch({ type: 'update_cart', payload: cart }))
    .catch(error =>
      console.warn(`CartProvider Shopify reducer (removeLineItems): ${error}`),
    );
}

export function cartReducer(state: CartState, action: Action) {
  switch (action.type) {
    case 'initialize_checkout': {
      initializeCheckout(action.payload);
      return {
        ...state,
      };
    }

    case 'update_cart': {
      return {
        ...state,
        cart: action.payload,
      };
    }

    case 'add_cart_items': {
      handleAddLineItems(action.payload);
      return {
        ...state,
      };
    }

    case 'remove_cart_item': {
      removeLineItem(action.payload);
      return {
        ...state,
      };
    }

    default: {
      return state;
    }
  }
}
