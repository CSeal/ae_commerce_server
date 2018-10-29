import { Attribute } from './../interfaces/reponses/product';
import { ReplacementJson } from './../../yarn-cache/v1/npm-tslint-5.8.0-1f49ad5b2e77c76c3af4ddcae552ae4e3612eb13/lib/language/rule/rule.d';
import { ControllerBase, ScrollParams } from './controller.base';
import { CategoryResponse, ProductResponse, PageResponse } from '../interfaces/reponses';

export default class Prodbaza extends ControllerBase {
    // return new Promise<CategoryResponse[]>( (resolve, reject) => {
    //     resolve([]);
    // })
    protected baseUrl = 'http://prodbaza.com.ua';

    protected async categories(): Promise<CategoryResponse[]> {
        let $ = await this.httpBaseGetCh('/');
        let response:CategoryResponse[] = [];

        let links = $('body > div.main > div > div.main-content > nav > ul > li').each( function() {
            let obj = $(this).find('>a');
            response.push(
                Object.assign( new CategoryResponse, {
                    id: obj.attr('href'),
                    name: obj.text().trim(),
                    parent: 0,
                    image: {src : obj.find('img').attr('src') },
                    count: 0,
                })
            );

            $(this).find('.drop .gorup-mnu').each( function() {
                if ($(this).find('li').length == 0) {
                    let sObj = $(this).find('.group-mnu-head a')
                    response.push(
                        Object.assign( new CategoryResponse, {
                            id: sObj.attr('href'),
                            name: sObj.text().trim(),
                            parent: obj.attr('href'),
                            image: [],
                            count: 0,
                        })
                    );
                }
                let sublinks = $(this).find('li a').map(  function() {
                    let sObj = $(this);
                    response.push(
                        Object.assign( new CategoryResponse, {
                            id: sObj.attr('href'),
                            name: sObj.text().trim(),
                            parent: obj.attr('href'),
                            image: [],
                            count: 0,
                        })
                    );
                })
            });
          });
        return response;
    }

    protected async productsByCategory(categoryId: string, scroll: {per_page, page}): Promise<ProductResponse[]> {
        let catPageContent = await this.httpGet(this.baseUrl + categoryId);
        let catId = catPageContent.match(/var categoryId \= (\d+)\;/)[1];
        let respObj =  await this.httpGet(this.baseUrl + `/search?offset=${(scroll.page-1)*scroll.per_page}&count=${scroll.per_page}&cat=${catId}&sort=price_asc&view=grid`, {}, {json: true} );
        let response:ProductResponse[] =
            respObj['products'].map( (productObj) => {
                return  this.objToProduct(productObj);
            }) || [];

        return response;
    };
    protected async productsByTag(tagId: string | number, scroll: ScrollParams): Promise<ProductResponse[]> {
        let respObj =  await this.httpGet(this.baseUrl +  `/api/product-groups?home=${tagId}`, {}, {json: true} );
        let response:ProductResponse[] =
            respObj['data'][0]['products'].map( (productObj) => {
                return  this.objToProduct(productObj);
            }) || [];

        return response;
    };

    protected async productsByName(name: string, scroll: ScrollParams): Promise<ProductResponse[]> {
        let respObj =  await this.httpGet(this.baseUrl +  `/live-search?term=${encodeURIComponent(name)}&offset=${(scroll.page-1)*scroll.per_page}&count=${scroll.per_page}`, {}, {json: true} );
        let response:ProductResponse[] =
            respObj['products'].map( (productObj) => {
                return  this.objToProduct(productObj);
            }) || [];

        return response;
    };

    protected async productVariations(id: string, scroll: ScrollParams): Promise<ProductResponse[]> {
        let $ = await this.httpBaseGetCh(id);
        let response:ProductResponse[] = [];

        let attributes = $('body > div.main > div > div.main-content > div.wrapper-item > table > tbody > tr')
            .map( function (idx, el) {
                return <Attribute>{
                    id: idx,
                    name: $(this).find('td').first().text().replace(/\:$/,''),
                    options: [$(this).find('td').last().text()],
                };
            }).get().slice(0,-1);

        let bounuce = Number.parseFloat( $('#product-page > div.attribute > div.bonuses-row > span').text().replace(',','.'));
        response.push(
            Object.assign( new ProductResponse, <ProductResponse>{
                id: id,
                name: $('body > div.main > div > div.main-content > div.wrapper-item > h1').text(),
                images: [{src: $('#product-page > div.wrap-gallery-item > div > a > img').attr('src') }],
                on_sale: false,
                price: Number.parseFloat( $('#product-page > div.attribute > div.retail > div.wrapper-prices-item > span').text().replace(',','.')),
                regular_price: Number.parseFloat( $('#product-page > div.attribute > div.retail > div.wrapper-prices-item > span').text().replace(',','.')),
                average_rating: 0,
                rating_count: 0,
                attributes,
                description: $('body > div.main > div > div.main-content > div.wrapper-item > table > tbody > tr:last-child > td:last-child').text()
            })
        )

        return response;
    };

    protected async pageContacts(): Promise<PageResponse> {
        let $ = await this.httpBaseGetCh('/delivery');

        return <PageResponse>{
            id: 'contacts',
            body: $('body > div.main > div > div.main-content > div.article-wrapper').html()
        };
    }

    protected async pageAboutUs(): Promise<PageResponse> {
        let $ = await this.httpBaseGetCh('/about-us');

        return <PageResponse>{
            id: 'aboutus',
            body: $('body > div.main > div > div.main-content > div.article-wrapper').html()
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