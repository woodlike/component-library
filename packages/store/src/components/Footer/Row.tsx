import { Link } from '@wdlk/components';
/**@jsx jsx */
import { jsx, SxStyleProp } from 'theme-ui';

export interface FooterRowItem {
  readonly url: string;
  readonly handle: string;
}

const stylesMenu: SxStyleProp = {
  listStyle: 'none',
  paddingTop: 0,
  paddingBottom: 8,
  paddingLeft: 0,
  margin: 0,
};

const stylesListItem: SxStyleProp = {
  paddingBottom: 3,
};

export const Row: React.FC = props => <ul sx={stylesMenu}>{props.children}</ul>;

Row.displayName = 'FooterMenuRow';

export const RowItem: React.FC<FooterRowItem> = props => (
  <li sx={stylesListItem}>
    <Link
      href={`${props.url}/${props.handle}`}
      size="m"
      color="primary"
      type="block">
      {props.children}
    </Link>
  </li>
);

RowItem.displayName = 'FooterRowItem';
