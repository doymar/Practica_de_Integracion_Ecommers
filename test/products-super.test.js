import supertest from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import config from "../src/config/config.js";

const URI = config.mongo_uri
const requester = supertest('http://localhost:8080');

describe('Products enpoints', () => {
    const productMock = {
        title: 'Lapicera',
        description: 'Azul',
        price: 10,
        stock: 500,
        code: 'aa234123..',
        category: 'Bazar'
    }
    const productMock2 = {
        title: 'Lapicera',
        description: 'Blanca',
        price: 10,
        stock: 500,
        code: 'aasd123..',
        category: 'Bazar'
    }
    const adminUserMock = {
        first_name: 'Luis',
        last_name: 'Tovar',
        email: 'ltovar@mail.com', 
        password: '12345',
        role: 'admin'
    }
    const premiumUserMock = {
        first_name: 'Juan',
        last_name: 'Perez',
        email: 'jperez@mail.com', 
        password: '12345',
        role: 'premium'
    }
    const normalUserMock = {
        first_name: 'Carla',
        last_name: 'Yepez',
        email: 'cyepez@mail.com', 
        password: '12345',
        role: 'user'
    }
    const normalUserLogin = {
        email: 'cyepez@mail.com', 
        password: '12345'
    }
    const premiumUserLogin = {
        email: 'jperez@mail.com', 
        password: '12345'
    }
    const adminUseLogin = {
        email: 'ltovar@mail.com', 
        password: '12345',
    }
    const updateProduct = {
        title: 'Window',
        description: 'Black',
        stock: 222
    }

    let cookie;
    let deleteProduct;

    before(async function() {
        await mongoose.connect(URI)
        await mongoose.connection.collection('users').deleteOne({email: premiumUserMock.email})
        await mongoose.connection.collection('users').deleteOne({email: normalUserMock.email})
        await mongoose.connection.collection('products').deleteOne({code: productMock.code})
        await mongoose.connection.collection('products').deleteOne({code: productMock2.code})
    })

    describe('POST /api/products', () => {
        it('Should not created the products with User role', async () => {
            await requester.post('/api/sessions/signup2').send(normalUserMock)
            const login = await requester.post('/api/sessions/login')
            .send(normalUserLogin)
             cookie = {
                 name:login.headers['set-cookie'][0].split("=")[0],
                 value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            }
            const response = await requester.post('/api/products')
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            .send(productMock)
            expect(response.statusCode).to.be.equal(403)
        })

        it('Should created the product', async () => {
            await requester.post('/api/sessions/signup2').send(premiumUserMock)
            const login = await requester.post('/api/sessions/login')
            .send(premiumUserLogin)
            cookie = {
                name:login.headers['set-cookie'][0].split("=")[0],
               value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            } 
            const response = await requester.post('/api/products')
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            .send(productMock)
            deleteProduct = response._body.product
            expect(response.statusCode).to.be.equal(200)
        })
    })

    describe('PUT /api/products/:pis', () =>{
        it('Should not update the product with the user provided', async () => {
            const login = await requester.post('/api/sessions/login')
            .send(premiumUserLogin)
            cookie = {
                name:login.headers['set-cookie'][0].split("=")[0],
               value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            } 
            const response = await requester.put(`/api/products/${deleteProduct._id}`)
            .set('Cookie', [`${cookie.name} = ${cookie.value}`]).send(updateProduct)
            expect(response.statusCode).to.be.equal(403)
        })

        it('Should update the product with the Id provided', async () => {
            await requester.post('/api/sessions/signup2').send(adminUserMock)
            const login = await requester.post('/api/sessions/login')
            .send(adminUseLogin)
            cookie = {
                name:login.headers['set-cookie'][0].split("=")[0],
               value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            } 
            const response = await requester.put(`/api/products/${deleteProduct._id}`)
            .set('Cookie', [`${cookie.name} = ${cookie.value}`]).send(updateProduct)
            expect(response.statusCode).to.be.equal(200)
        })
    })

    describe('DELETE /api/products/:pid', () => {
        it('Should not delete the product with the user provided', async () => {
            const login = await requester.post('/api/sessions/login')
            .send(normalUserLogin)
            cookie = {
                name:login.headers['set-cookie'][0].split("=")[0],
               value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            } 
            const response = await requester.delete(`/api/products/${deleteProduct._id}`)
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            expect(response.statusCode).to.be.equal(403)
        })

        it('Should delete the product with the Id provided', async () => {
            const login = await requester.post('/api/sessions/login')
            .send(premiumUserLogin)
            cookie = {
                name:login.headers['set-cookie'][0].split("=")[0],
               value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            } 
            const response = await requester.delete(`/api/products/${deleteProduct._id}`)
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            expect(response.statusCode).to.be.equal(200)
        })
    })

    describe('POST /api/products/signup', () => {
        before(async function() {
            await mongoose.connect(URI)
            await mongoose.connection.collection('users').deleteOne({email: premiumUserMock.email})
            await mongoose.connection.collection('users').deleteOne({email: normalUserMock.email})
            await mongoose.connection.collection('products').deleteOne({code: productMock.code})
            await mongoose.connection.collection('products').deleteOne({code: productMock2.code})
        })

        it('Should not created the products with User role', async () => {
            await requester.post('/api/sessions/signup2').send(normalUserMock)
            const login = await requester.post('/api/sessions/login')
            .send(normalUserLogin)
             cookie = {
                 name:login.headers['set-cookie'][0].split("=")[0],
                 value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            }
            const response = await requester.post('/api/products/signup')
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            .send(productMock2)
            expect(response.statusCode).to.be.equal(403)
        })

        it('Should created the product', async () => {
            await requester.post('/api/sessions/signup2').send(premiumUserMock)
            const login = await requester.post('/api/sessions/login')
            .send(premiumUserLogin)
            cookie = {
                name:login.headers['set-cookie'][0].split("=")[0],
               value: login.headers['set-cookie'][0].split("=")[1].split(";")[0]
            } 
            const response = await requester.post('/api/products/signup')
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            .send(productMock2)
            expect(response.statusCode).to.be.equal(302)
        })
    })
    
    describe('GET /api/products', () => {
        it('Should return all products', async () => {
            const response = await requester.get('/api/products')
            expect(response._body.products.info.payload).to.be.an('array')
            expect(response._body.products.info.status).to.be.equal('success')
            expect(response.statusCode).to.be.equal(200)
        })
    })

    describe('GET /api/products/:pid', () => {
        it('Should return the product with the Id provided', async () => {
            const products = await requester.get('/api/products');
            const product = products._body.products.info.payload[0];
            const response = await requester.get(`/api/products/${product._id}`)
            expect(response.statusCode).to.be.equal(200)
            expect(response._body.product).to.be.an('object')
        })
    })
})
