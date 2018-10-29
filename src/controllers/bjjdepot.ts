import { Attribute } from './../interfaces/reponses/product';
import { ReplacementJson } from './../../yarn-cache/v1/npm-tslint-5.8.0-1f49ad5b2e77c76c3af4ddcae552ae4e3612eb13/lib/language/rule/rule.d';
import { ControllerBase, ScrollParams } from './controller.base';
import { CategoryResponse, ProductResponse, PageResponse } from '../interfaces/reponses';
import * as cheerio from 'cheerio';

export default class ApiBjjdepot extends ControllerBase {
    // return new Promise<CategoryResponse[]>( (resolve, reject) => {
    //     resolve([]);
    // })
    protected baseUrl = 'https://bjjdepot.ca';

    protected async categories(): Promise<CategoryResponse[]> {
        let self = this;
        let response:CategoryResponse[] = [];
        // hardcode first brand category
        let $brands = await this.httpBaseGetCh('/brand');
        response.push(Object.assign( new CategoryResponse, <CategoryResponse>{
            id: '/brands',
            name: 'Brands',
            parent: 0,
            image: {src : 'https://i0.wp.com/www.bjjscandinavia.com/wp-content/uploads/2014/08/banner-copy2.jpg' },
            count: 0,
        }));
        let brandsLinks = $brands('body div.category-products ul li.item').each( function() {
            let obj = $brands(this);
            response.push(Object.assign( new CategoryResponse, <CategoryResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrl , ''),
                name: obj.find('h4').text().trim(),
                parent: '/brands',
                image: {src : obj.find('a > img').attr('src') },
                count: 0,
            }));
        });

        let catPage = await this.httpGet(this.baseUrl);
        let mainCatJSText = catPage.replace(/\\|\\\r|\\\n/g, "").match(/\$\(\'custommenu\'\)\.update\(\"(.+)\"\);/)[1];
        let mainSubCatJSText = catPage.replace(/\\|\\\r|\\\n/g, "").match(/wpPopupMenuContent \= \"(.+)\";/)[1];

        let manCatsRegExp = /(\d+).+?rel=\"https\:\/\/bjjdepot.ca([^\"]+)\">n<span>([^\<]+)\<\/span>/g;
        let catMatch;
        while ((catMatch = manCatsRegExp.exec(mainCatJSText)) !== null) {
            if (catMatch[1] == '0' ||  catMatch[2].replace(self.baseUrl , '')=='/brand')
            continue;

            response.push(
                Object.assign( new CategoryResponse, {
                    id: catMatch[2].replace(self.baseUrl , ''),
                    name: catMatch[3],
                    parent: 0,
                    image: '', //{src : obj.find('img').attr('src') },
                    count: 0,
                })
            );

            let manSubCatsRegExp = new RegExp(catMatch[1] + "'\\).+?<\\/div>n<\\/div>", 'ig');

            let manSubCatsText = manSubCatsRegExp.exec(mainSubCatJSText)[0];
            let manSubCatRegExp =/href=\"https\:\/\/bjjdepot.ca([^\"]+)\"><span>([^\<]+)\<\/span>/ig;
            let subCatMatch;
            while ((subCatMatch = manSubCatRegExp.exec(manSubCatsText)) !== null) {
                response.push(
                    Object.assign( new CategoryResponse, {
                        id: subCatMatch[1].replace(self.baseUrl , ''),
                        name: subCatMatch[2],
                        parent: catMatch[2],
                        image: '', //{src : obj.find('img').attr('src') },
                        count: 0,
                    })
                );
            }
        }
        return response;
    }

    protected async productsByCategory(categoryId: string, scroll: {per_page, page}): Promise<ProductResponse[]> {
        let self = this;
        let $ = await this.httpBaseGetCh(categoryId+`?limit=${scroll.per_page}&p=${scroll.page}`);
        let response: ProductResponse[] = []
        let brandsLinks = $('body div.col-main > div.category-products > ul > li').each( function() {
            let obj = $(this);
            response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrl , ''),
                name: obj.find('h2').text(),
                images: [{src: obj.find('a>img').attr('src') }],
                permalink: obj.find('a').attr('href'),
                on_sale: false,
                price: parseFloat(obj.find('div.price-box').text().replace('USD$','')),
                regular_price: parseFloat(obj.find('div.price-box').text().replace('USD$','')),
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
        let $ = await this.httpBaseGetCh('/');
        let response: ProductResponse[] = []
        let brandsLinks = $('div.widget-new-products ul.products-grid > li').each( function() {
            let obj = $(this);
            let price = parseFloat(obj.find('div.price-box .special-price .price').text().replace('USD$',''))
                        || parseFloat(obj.find('div.price-box').text().replace('USD$',''));
            let regularPrice = parseFloat(obj.find('div.price-box .old-price .price').text().replace('USD$',''))
                        || parseFloat(obj.find('div.price-box').text().replace('USD$',''));

                        response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrl , ''),
                name: obj.find('h3').text(),
                images: [{src: obj.find('a>img').attr('src') }],
                permalink: obj.find('h2 a').attr('href'),
                on_sale: regularPrice > price,
                price: price,
                regular_price: regularPrice,
                average_rating: 0,
                rating_count: 0,
            }))
        });

        return response;
    };

    protected async productsByTagBestDeal(tagId: string | number, scroll: ScrollParams): Promise<ProductResponse[]> {
        let self = this;
        let $ = await this.httpBaseGetCh('/');
        let response: ProductResponse[] = []
        let brandsLinks = $('div.category-products-featured .products-list > li').each( function() {
            let obj = $(this);
            response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrl , ''),
                name: obj.find('h2').text(),
                images: [{src: obj.find('a>img').attr('src') }],
                permalink: obj.find('h2 a').attr('href'),
                on_sale: true,
                price: parseFloat(obj.find('div.price-box .special-price .price').text().replace('USD$','')),
                regular_price: parseFloat(obj.find('div.price-box .old-price .price').text().replace('USD$','')),
                average_rating: 0,
                rating_count: 0,
            }))
        });

        return response;
    };




    protected async productsByName(name: string, scroll: ScrollParams): Promise<ProductResponse[]> {
        let self = this;
        //let $ = await this.httpBaseGetCh( `/catalogsearch/result/index/?q=&limit=${scroll.per_page}&p=${scroll.page}` );
        let $ = await this.httpBaseGetCh('/catalogsearch/result/',{q: name, limit: scroll.per_page, p: scroll.page  });
        let response: ProductResponse[] = []
        let brandsLinks = $('ul.products-grid > li').each( function() {
            let obj = $(this);
            let price = parseFloat(obj.find('div.price-box .special-price .price').text().replace('USD$',''))
                        || parseFloat(obj.find('div.price-box').text().replace('USD$',''));
            let regularPrice = parseFloat(obj.find('div.price-box .old-price .price').text().replace('USD$',''))
                        || parseFloat(obj.find('div.price-box').text().replace('USD$',''));

            response.push(Object.assign(new ProductResponse(), <ProductResponse>{
                id: obj.find('a').attr('href').replace(self.baseUrl , ''),
                name: obj.find('h2').text(),
                images: [{src: obj.find('a>img').attr('src') }],
                permalink: obj.find('h2 a').attr('href'),
                on_sale: regularPrice > price,
                price: price,
                regular_price: regularPrice,
                average_rating: 0,
                rating_count: 0,
            }))
        });

        return response;
    };

    protected async productVariations(id: string, scroll: ScrollParams): Promise<ProductResponse[]> {
        let $ = await this.httpBaseGetCh(id);
        let response:ProductResponse[] = [];

        // https://github.com/dchester/jsonpath
        // $.attributes[?(@.code=='color')]..options 
        let attributes = $('#product-attribute-specs-table tr')
            .map( function (idx, el) {
                return <Attribute>{
                    id: idx,
                    name: $(this).find('th').text(),
                    options: [$(this).find('td').text()],
                };
            }).get();
        let images:any = $('#product_addtocart_form > div.product-img-box > div.product-image.product-image-zoom > div img').map( function (idx, el) {
            return {
                src: $(this).attr('src'),
            };
        }).get();

        let price = parseFloat($('div.product-shop div.price-box .special-price .price').text().replace('USD$',''))
        || parseFloat($('div.product-shop div.price-box .regular-price').first().text().replace('USD$',''));
        let regularPrice = parseFloat($('div.product-shop div.price-box .old-price .price').text().replace('USD$',''))
        || parseFloat($('div.product-shop div.price-box .regular-price').first().text().replace('USD$',''));
        response.push(
            Object.assign( new ProductResponse, <ProductResponse>{
                id: id,
                name: $('div.product-shop > div.product-name > span.h1').text(),
                images,
                on_sale: regularPrice > price,
                price: price,
                regular_price: regularPrice,
                average_rating: 0,
                rating_count: 0,
                attributes,
                description: $('.product-collateral div.std').text().trim(),
            })
        )

        return response;
    };

    protected async pageContacts(): Promise<PageResponse> {
        let $ = await this.httpBaseGetCh('/contact/');

        return <PageResponse>{
            id: 'contacts',
            body: $('body > div > div.main-container.col1-layout > div > div.col-main p').eq(3).html() +
                $('body > div > div.main-container.col1-layout > div > div.col-main p').last().html()
        };
    }

    protected async pageAboutUs(): Promise<PageResponse> {
        let $ = await this.httpBaseGetCh('/about-us');

        return <PageResponse>{
            id: 'aboutus',
            body: $('body > div > div.main-container.col1-layout > div > div.col-main > div > div').html()
        };
    }

    protected async pageFAQ(): Promise<PageResponse> {
        let $ = await this.httpBaseGetCh('/faq');

        return <PageResponse>{
            id: 'faq',
            body: $('body > div > div.main-container.col1-layout > div > div.col-main > div').html()
        };
    }

    protected async postOrder(body: any): Promise<any> {
        console.log('Incoming Order' , body);
        return {code: 'ok'};
    }

    private objToProduct(productObj: any): ProductResponse {
        return Object.assign( new ProductResponse, {
            id: productObj.url.replace(this.baseUrl , ''),
            name: productObj.title,
            images: [{src: productObj.image }],
            permalink: productObj.url,

            on_sale: productObj.bonus > 0,
            price: productObj.price,
            regular_price: productObj.origPrice + productObj.bonus,
            average_rating: 0,
            rating_count: 0,
        })
    }
}