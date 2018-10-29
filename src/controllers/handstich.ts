import { Attribute } from './../interfaces/reponses/product';
import { ReplacementJson } from './../../yarn-cache/v1/npm-tslint-5.8.0-1f49ad5b2e77c76c3af4ddcae552ae4e3612eb13/lib/language/rule/rule.d';
import { ControllerBase, ScrollParams } from './controller.base';
import { CategoryResponse, ProductResponse, PageResponse } from '../interfaces/reponses';
import * as cheerio from 'cheerio';

export default class ApiHandstich extends ControllerBase {

    protected imageMap = {
        'herren': 'https://www.heine.de/filecontent/images/stxt/mode-herren/herrenmode-business-freizeit-sommer-winter.jpg', 
        'damen':'http://anisima.ru/wp-content/uploads/%D0%BC%D0%B2.jpg',
    }
    protected baseUrl = 'http://handstich.de';

    protected baseUrlAlt = 'https://handstich.de';

    protected async categories(): Promise<CategoryResponse[]> {
        let self = this;
        let response:CategoryResponse[] = [];
        // hardcode first brand category
        let $ = await this.httpBaseGetCh('/shop');

        let brandsLinks = $('#woocommerce_product_categories-2 > ul > li').each( function() {
            let obj = $(this);
            let catergoryName = obj.find('>a').text().trim().toLowerCase();
            response.push(Object.assign( new CategoryResponse, <CategoryResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrlAlt , ''),
                name: catergoryName,
                parent: 0,
                image: {src : self.imageMap[catergoryName] },
                count: 0,
            }));
            $(this).find('ul > li').each(function() {
                let subObj = $(this);
                response.push(Object.assign( new CategoryResponse, <CategoryResponse>{
                    id: subObj.find('a').attr('href').replace(self.baseUrlAlt , ''),
                    name: subObj.find('a').text().trim(),
                    parent: obj.find('a').attr('href').replace(self.baseUrlAlt , ''),
                    image: {}, //{src : obj.find('a > img').attr('src') },
                    count: 0,
                }));
            });
        });

        return response;
    }

    protected async productsByCategory(categoryId: string, scroll: {per_page, page}): Promise<ProductResponse[]> {
        let self = this;
        let $ = await this.httpBaseGetCh(categoryId);
        let response: ProductResponse[] = []
        let brandsLinks = $('div.shop-products > div.item-col').each( function() {
            let obj = $(this);
            let images: any[] = obj.find('.product-image img').map( function (idx, el) {
                return <{src:string}>{
                    src: $(this).attr('src').includes('http') ? $(this).attr('src') : 'https:' + $(this).attr('src') ,
                };
            }).get();
            response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrlAlt , ''),
                name: obj.find('.gridview h2.product-name').text().trim() + ' ' + obj.find('.gridview h3').text().trim(),
                images,
                permalink: obj.find('a').attr('href'),
                on_sale: false,
                price: parseFloat(obj.find('div.price-box').text()),
                regular_price: parseFloat(obj.find('div.price-box').text()),
                average_rating: 0,
                rating_count: 0,
            }))
        });

        return response;
    };
    protected async productsByTag(tagId: string | number, scroll: ScrollParams): Promise<ProductResponse[]> {
        switch (tagId) {
            case 'best-deal':
                return this.productsByTagBestDeal(tagId, scroll);
            case 'featured':
                return this.productsByTagFeatured(tagId, scroll);
            default:
                return [];
        }
    };

    protected async productsByTagFeatured(tagId: string | number, scroll: ScrollParams): Promise<ProductResponse[]> {
        let self = this;
        let $ = await this.httpBaseGetCh('/shop/');
        let response: ProductResponse[] = []
        let brandsLinks = $('div.shop-products > div.item-col').each( function() {
            let obj = $(this);
            let images: any[] = obj.find('.product-image img').map( function (idx, el) {
                return <{src:string}>{
                    src: $(this).attr('src').includes('http') ? $(this).attr('src') : 'https:' + $(this).attr('src') ,
                };
            }).get();
            response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrlAlt , ''),
                name: obj.find('.gridview h2.product-name').text().trim() + ' ' + obj.find('.gridview h3').text().trim(),
                images,
                permalink: obj.find('a').attr('href'),
                on_sale: false,
                price: parseFloat(obj.find('div.price-box').text()),
                regular_price: parseFloat(obj.find('div.price-box').text()),
                average_rating: 0,
                rating_count: 0,
            }))
        });

        return response;
    };

    protected async productsByTagBestDeal(tagId: string | number, scroll: ScrollParams): Promise<ProductResponse[]> {
        let self = this;
        let $ = await this.httpBaseGetCh('/shop/page/2/');
        let response: ProductResponse[] = []
        let brandsLinks = $('div.shop-products > div.item-col').each( function() {
            let obj = $(this);
            let images: any[] = obj.find('.product-image img').map( function (idx, el) {
                return <{src:string}>{
                    src: $(this).attr('src').includes('http') ? $(this).attr('src') : 'https:' + $(this).attr('src') ,
                };
            }).get();
            response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrlAlt , ''),
                name: obj.find('.gridview h2.product-name').text().trim() + ' ' + obj.find('.gridview h3').text().trim(),
                images,
                permalink: obj.find('a').attr('href'),
                on_sale: false,
                price: parseFloat(obj.find('div.price-box').text()),
                regular_price: parseFloat(obj.find('div.price-box').text()),
                average_rating: 0,
                rating_count: 0,
            }))
        });

        return response;
    };


    protected async productsByName(name: string, scroll: ScrollParams): Promise<ProductResponse[]> {
        let self = this;
        let $ = await this.httpBaseGetCh('/',{s: name, post_type: 'product' });
        let response: ProductResponse[] = []
        let brandsLinks = $('div.shop-products > div.item-col').each( function() {
            let obj = $(this);
            let images: any[] = obj.find('.product-image img').map( function (idx, el) {
                return <{src:string}>{
                    src: $(this).attr('src').includes('http') ? $(this).attr('src') : 'https:' + $(this).attr('src') ,
                };
            }).get();
            response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrlAlt , ''),
                name: obj.find('.gridview h2.product-name').text().trim() + ' ' + obj.find('.gridview h3').text().trim(),
                images,
                permalink: obj.find('a').attr('href'),
                on_sale: false,
                price: parseFloat(obj.find('div.price-box').text()),
                regular_price: parseFloat(obj.find('div.price-box').text()),
                average_rating: 0,
                rating_count: 0,
            }))
        });

        return response;
    };

    protected async productVariations(id: string, scroll: ScrollParams): Promise<ProductResponse[]> {
        let $ = await this.httpBaseGetCh(id);
        let response:ProductResponse[] = [];

        let obj = $('div.main-container div.product-view');

        // https://github.com/dchester/jsonpath
        // $.attributes[?(@.code=='color')]..options 
        let attributes = [];
        attributes.push(
            <Attribute>{
                id: 1,
                name: 'color',
                options:
                    obj.find('table.variations tr').eq(0).find(' select > option').map(function(i, el) {
                        return $(this).text();
                    }).get().slice(1)
                ,
            }
        );
        attributes.push(
            <Attribute>{
                id: 1,
                name: 'size',
                options:
                    obj.find('table.variations tr').eq(1).find(' select > option').map(function(i, el) {
                        return $(this).text();
                    }).get().slice(1)
                ,
            }
        );

        let images:any = obj.find('div.thumbnails ul > li').map( function (idx, el) {
            return {
                src: $(this).find('a').attr('href'),
            };
        }).get();

        response.push(
            Object.assign( new ProductResponse, <ProductResponse>{
                id: id,
                name: $('h1').text() + ' ' + $('h3').first().text(),
                images,
                on_sale: false,
                price: parseFloat(obj.find('p.price').text()),
                regular_price: parseFloat(obj.find('p.price').text()),
                average_rating: 0,
                rating_count: 0,
                attributes,
                description: $('div.short-description').html() + ' ' +
                    $('div.woocommerce-tabs div.woocommerce-Tabs-panel').first().html(),
            })
        )

        return response;
    };

    protected async pageContacts(): Promise<PageResponse> {
        let $ = await this.httpBaseGetCh('/contact/');

        return <PageResponse>{
            id: 'contacts',
            body: $('#post-267 > div.entry-content > div.vc_row').html()
        };
    }

    protected async pageAboutUs(): Promise<PageResponse> {

        return <PageResponse>{
            id: 'aboutus',
            body: ''
        };
    }

    protected async pageFAQ(): Promise<PageResponse> {
        return <PageResponse>{
            id: 'faq',
            body: ''
        };
    }

    protected async postOrder(body: any): Promise<any> {
        console.log('Incoming Order' , body);
        return {code: 'ok'};
    }


}