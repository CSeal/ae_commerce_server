export default class CategoryResponse {
    id: number|string;
    name: string;
    parent: number|string;
    image: { src: string } | void[] = [];
    count: number;

    slug?: string = '';
    description?: string = '';
    display?: string = 'default';
    menu_order?: number = 0;
}