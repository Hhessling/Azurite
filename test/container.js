const chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    BbPromise = require('bluebird'),
    fs = BbPromise.promisifyAll(require("fs-extra")),
    Azurite = require('./../lib/Azurite'),
    rp = require('request-promise'),
    path = require('path');

chai.use(chaiHttp);

const containerName = 'containertestcontainer';
const propContainer = 'propTestcontainer';
const url = 'http://localhost:10000';
const urlPath = '/devstoreaccount1';

describe('Container HTTP API', () => {
    const azurite = new Azurite();

    before(() => {
        const location = path.join('.', process.env.AZURITE_LOCATION, 'CONTAINER');
        return azurite.init({ l: location, silent: 'true', overwrite: 'true' })
            .then(() => {
                // Make sure there is an existing container 'metadatatestcontainer'
                const optionsContainer = {
                    method: 'PUT',
                    uri: `http://localhost:10000/devstoreaccount1/${propContainer}?restype=container`,
                    body: ''
                };
                return rp(optionsContainer);
            });
    });

    after(() => {
        return azurite.close();
    });



    describe('PUT Simple Container', () => {
        it('should create a container', () => {
            return chai.request(url)
                .put(`${urlPath}/${containerName}`)
                .query({ restype: 'container' })
                .then((res) => {
                    res.should.have.status(200);
                });
        });
        it('and a second with the same name that fails', () => {
            return chai.request(url)
                .put(`${urlPath}/${containerName}`)
                .query({ restype: 'container' })
                .catch((e) => {
                    e.should.have.status(409);
                })
        });
    });
    describe('DELETE Simple Container', () => {
        it('successfully deletes the container', () => {
            return chai.request(url)
                .delete(`${urlPath}/${containerName}`)
                .query({ restype: 'container' })
                .then((res) => {
                    res.should.have.status(200);
                });
        });
        it('deleting a non-existant container fails', () => {
            return chai.request(url)
                .delete(`${urlPath}/DOESNOTEXIST`)
                .query({ restype: 'container' })
                .catch((e) => {
                    e.should.have.status(404);
                });
        });
    });
    describe('Container Metadata', () => {
        it('should update an existing container with metadata.', () => {
            return chai.request(url)
                .put(`${urlPath}/${propContainer}`)
                .query({ restype: 'container', comp: 'metadata' })
                .set('x-ms-meta-test1', 'value1')
                .set('x-ms-meta-test2', 'value2')
                .set('x-ms-meta-meta1', 'meta1Value')
                .then((res) => {
                    res.should.have.status(200);
                });
        });
    });
});