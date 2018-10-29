export default class ProductResponse {
        id: string | number;
        name: string;

        on_sale: boolean = false;
        price: number;
        regular_price: number;

        average_rating: number;
        rating_count: number;

        images: { src: string }[] = [];

        slug?: string = '';
        permalink?: string = '';
        description?: string = '';
        attributes?: Attribute[] | string[] = [];
/*
        type: string;
        status: string;
        featured: boolean;
        catalog_visibility: string;
        short_description: string;
        sku: string;

        sale_price: string;
        date_on_sale_from?: any;
        date_on_sale_from_gmt?: any;
        date_on_sale_to?: any;
        date_on_sale_to_gmt?: any;
        price_html: string;
        purchasable: boolean;
        total_sales: number;
        virtual: boolean;
        downloadable: boolean;
        downloads: any[];
        download_limit: number;
        download_expiry: number;
        external_url: string;
        button_text: string;
        tax_status: string;
        tax_class: string;
        manage_stock: boolean;
        stock_quantity?: any;
        in_stock: boolean;
        backorders: string;
        backorders_allowed: boolean;
        backordered: boolean;
        sold_individually: boolean;
        weight: string;
        dimensions: Dimensions;
        shipping_required: boolean;
        shipping_taxable: boolean;
        shipping_class: string;
        shipping_class_id: number;
        reviews_allowed: boolean;
        related_ids: number[];
        upsell_ids: any[];
        cross_sell_ids: any[];
        parent_id: number;
        purchase_note: string;
        categories: Category[];
        tags: any[];
        images: Image[];
        default_attributes: Defaultattribute[];
        variations: any[];
        grouped_products: any[];
        menu_order: number;
        meta_data: any[];
        _links: Links;
        */
      }

export interface Attribute {
    id: number;
    name: string;
    options: string[];
}
/*
      interface Links {
        self: Self[];
        collection: Self[];
      }
      
      interface Self {
        href: string;
      }
      
      interface Defaultattribute {
        id: number;
        name: string;
        option: string;
      }
      
      interface Attribute {
        id: number;
        name: string;
        position: number;
        visible: boolean;
        variation: boolean;
        options: string[];
      }
      
      interface Image {
        id: number;
        date_created: string;
        date_created_gmt: string;
        date_modified: string;
        date_modified_gmt: string;
        src: string;
        name: string;
        alt: string;
        position: number;
      }
      
      interface Category {
        id: number;
        name: string;
        slug: string;
      }
      
      interface Dimensions {
        length: string;
        width: string;
        height: string;
      }
*/
