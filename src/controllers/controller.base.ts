import { Application, Request, Response, NextFunction, RequestHandler } from 'express';
import { CategoryResponse, ProductResponse, PageResponse } from '../interfaces/reponses';
import * as needle from 'needle';
import * as cheerio from 'cheerio';

/**
 * Base Controller class to implement aeCommerce clients logic
 * @export
 * @abstract
 * @class ControllerBase
 */
export abstract class ControllerBase {
    protected baseUrl = '';

    constructor(protected app: Application, protected apiPrefix:string = '') {
        needle.defaults({
            open_timeout: 10000,
            user_agent: 'aeCommerce/1.1.3',
            parse_response: false
        });
        this.apiPrefix  = this.apiPrefix  === '' ? '/' + this.constructor.name.toString().toLowerCase() : this.apiPrefix 
        this.applyRoutes();
    }

    protected applyRoutes(): void {
        console.log( 'applyRoutes base to ', this.apiPrefix);
        this.app.get(
            this.apiPrefix + "/products/categories",
            this.respHandler( this._categories.bind(this) )
        );
        this.app.get(
            this.apiPrefix + "/products",
            this.respHandler( this._productsPoint.bind(this) )
        );
        this.app.get(
            this.apiPrefix + "/products/:id([\\s\\S]*)/variations$",
            this.respHandler( this._productsVariationsPoint.bind(this) )
        );

        this.app.get(
            this.apiPrefix + "/page/:pagelink",
            this.respHandler( this._pagesPoint.bind(this) )
        );

        this.app.post(
            this.apiPrefix + "/orders",
            this.respHandler( this._postOrderPoint.bind(this) )
        )
    }

    protected respHandler<T>( action: (req: Request) => Promise<T>): RequestHandler {
        return ( req: Request, res: Response, next: NextFunction ) : void => {
            action(req).then( (data: T) => {
                res.send(data);
            })
        }
    }

    protected httpGet(url: string, data: {} = {}, options: {} = {follow_max: 3}): Promise<string> {
        console.log('Getting link ', url);
        return needle('get', url, data, options)
          .then((resp) => {
                console.log('Got '+ + resp.statusCode + ' with ' + resp.bytes + ' bytes.' );
                return resp.body
            })
          .catch(function(err) {
            console.log('Call the locksmith: ', err)
        });
    }

    /**
     * returns body of requested url
     * @protected
     * @param {string} url
     * @returns {Promise<string>}
     * @memberof ControllerBase
     */
    protected httpBaseGetCh(url: string,  data: {} = {}, options: {} = {follow_max: 3, headers: {user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'}}): Promise<CheerioStatic> {
        return this.httpGet(this.baseUrl + url, data, options).then((body) => {
            return cheerio.load(body)
        });
    }

    private async _categories(req: Request): Promise<CategoryResponse[]> {
        return this.categories();
    }
    protected abstract async categories(): Promise<CategoryResponse[]>;

    private async _productsPoint(req: Request): Promise<ProductResponse[]> {
        if (req.query['category'])
            return this.productsByCategory(req.query['category'], {per_page: req.query['per_page'] || 20, page: req.query['page'] || 1});
        if (req.query['tag'])
            return this.productsByTag(req.query['tag'], {per_page: req.query['per_page'] || 20, page: req.query['page'] || 1});
        if (req.query['search'])
            return this.productsByName(req.query['search'], {per_page: req.query['per_page'] || 20, page: req.query['page'] || 1});
    }

    protected abstract async productsByCategory(categoryId: string | number, scroll: ScrollParams): Promise<ProductResponse[]>;

    protected abstract async productsByTag(tagId: string | number, scroll: ScrollParams): Promise<ProductResponse[]>;

    protected abstract async productsByName(name: string , scroll: ScrollParams): Promise<ProductResponse[]>;

    private async _productsVariationsPoint(req: Request): Promise<ProductResponse[]> {
        return this.productVariations(req.params['id'], {per_page: req.query['per_page'] || 20, page: req.query['page'] || 1})
    }

    protected abstract async productVariations(id: string | number, scroll: ScrollParams): Promise<ProductResponse[]>;

    private async _pagesPoint(req: Request): Promise<PageResponse> {
        if (req.params['pagelink'] == 'contacts')
            return this.pageContacts();
        if (req.params['pagelink'] == 'aboutus')
            return this.pageAboutUs();
        if (req.params['pagelink'] == 'faq')
            return this.pageFAQ();
    }
    protected abstract async pageContacts(): Promise<PageResponse>;
    protected abstract async pageAboutUs(): Promise<PageResponse>;
    protected async pageFAQ(): Promise<PageResponse> {
        return <PageResponse>{
            id: 'none',
            body: '',
        };
    }
    private async _postOrderPoint(req: Request): Promise<any[]> {
        return this.postOrder(req.body);
    }
    protected abstract async postOrder(body: any): Promise<any>;
}

export interface ScrollParams {
    per_page: number;
    page: number;
}